'use client'

import {usePathname, useRouter} from 'next/navigation'
import {useEffect, useRef} from 'react'
import {play} from '@/lib/sound'

const RAMP = ' .:-=+*#%@'
const CELL = 16
const COVER_MS = 520
const REVEAL_MS = 640
const INK = '#031533'

type Phase = 'idle' | 'cover' | 'hold' | 'reveal'

/**
 * Route change as an ink wash made of characters: a front of glyphs rises from the bottom and
 * fills the screen in ink, the next page loads underneath, then the front lifts off the top.
 * The destination's name resolves out of the glyphs in the middle.
 */
export function PageTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const canvas = useRef<HTMLCanvasElement>(null)
  const label = useRef<HTMLDivElement>(null)
  const state = useRef<{phase: Phase; t0: number; target: string; seed: number[]; cols: number; rows: number}>({
    phase: 'idle',
    t0: 0,
    target: '',
    seed: [],
    cols: 0,
    rows: 0,
  })
  const raf = useRef(0)
  const routerRef = useRef(router)
  useEffect(() => {
    routerRef.current = router
  }, [router])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const draw = () => {
      const c = canvas.current
      const s = state.current
      if (!c) return
      const ctx = c.getContext('2d')!
      const W = c.width
      const H = c.height
      const now = performance.now()
      ctx.clearRect(0, 0, W, H)
      if (s.phase === 'idle') {
        c.style.visibility = 'hidden'
        return
      }
      c.style.visibility = 'visible'
      const dpr = W / window.innerWidth
      const cell = CELL * dpr
      const ease = (x: number) => 1 - Math.pow(1 - x, 3)
      let front: number // 0 = bottom edge, 1 = top edge; cells below the front are ink
      let invert = false
      if (s.phase === 'cover') front = ease(Math.min(1, (now - s.t0) / COVER_MS))
      else if (s.phase === 'hold') front = 1
      else {
        // Reveal: the ink lifts off upward, so cells ABOVE the front stay ink.
        front = ease(Math.min(1, (now - s.t0) / REVEAL_MS))
        invert = true
      }
      const seedAt = (r: number, col: number) => s.seed[(r * 31 + col * 17) % s.seed.length]
      const band = 0.22 // depth of the glyph edge, as a share of the screen height
      ctx.font = `${Math.round(13 * dpr)}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let r = 0; r < s.rows; r++) {
        const y = 1 - (r + 0.5) / s.rows // 0 at bottom
        for (let col = 0; col < s.cols; col++) {
          const jitter = s.seed[(r * s.cols + col) % s.seed.length] * 0.12
          const edge = (invert ? y - front * (1.12 + band) + band + 0.12 : front * (1.12 + band) - y) + jitter - 0.06
          // edge > band: solid ink; 0..band: glyphs thinning out; < 0: empty
          if (edge <= 0) continue
          const x0 = col * cell
          const y0 = r * cell
          if (edge >= band) {
            ctx.fillStyle = INK
            ctx.fillRect(x0, y0, cell + 1, cell + 1)
            continue
          }
          const k = edge / band
          if (seedAt(r, col) > k * 1.3) continue
          const g = RAMP[Math.min(RAMP.length - 1, Math.floor(k * RAMP.length))]
          ctx.fillStyle = INK
          ctx.fillText(g, x0 + cell / 2, y0 + cell / 2)
        }
      }
      // Label in the middle while the screen is covered.
      if (label.current) {
        const visible = s.phase === 'hold' || (s.phase === 'cover' && front > 0.75)
        label.current.style.transition = visible ? 'opacity 150ms' : 'none'
        label.current.style.opacity = visible ? '1' : '0'
      }
      if (s.phase === 'cover' && now - s.t0 >= COVER_MS) {
        s.phase = 'hold'
        routerRef.current.push(s.target)
      }
      if (s.phase === 'reveal' && now - s.t0 >= REVEAL_MS) {
        s.phase = 'idle'
      }
      raf.current = requestAnimationFrame(draw)
    }

    const size = () => {
      const c = canvas.current
      if (!c) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      c.width = Math.ceil(window.innerWidth * dpr)
      c.height = Math.ceil(window.innerHeight * dpr)
      const s = state.current
      s.cols = Math.ceil(window.innerWidth / CELL)
      s.rows = Math.ceil(window.innerHeight / CELL)
    }

    const s = state.current
    s.seed = Array.from({length: 997}, () => Math.random())
    size()
    window.addEventListener('resize', size)

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element).closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (/\.(xml|txt|svg|png|jpg|pdf)$/i.test(url.pathname) || url.pathname.startsWith('/api/')) return
      if (url.pathname === window.location.pathname) return // same page or #anchor: let it scroll
      if (s.phase !== 'idle') {
        e.preventDefault()
        return
      }
      e.preventDefault()
      s.target = url.pathname + url.search + url.hash
      if (label.current) label.current.textContent = (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 40)
      s.phase = 'cover'
      s.t0 = performance.now()
      play('whoosh')
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(draw)
    }
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('resize', size)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  // The new route has rendered: lift the ink.
  useEffect(() => {
    const s = state.current
    if (s.phase !== 'hold' && s.phase !== 'cover') return
    const go = () => {
      s.phase = 'reveal'
      s.t0 = performance.now()
    }
    // Let the new page paint one frame first.
    const id = requestAnimationFrame(() => requestAnimationFrame(go))
    return () => cancelAnimationFrame(id)
  }, [pathname])

  // Never strand the visitor under the ink if a navigation fails.
  useEffect(() => {
    const id = setInterval(() => {
      const s = state.current
      if (s.phase === 'hold' && performance.now() - s.t0 > COVER_MS + 5000) {
        s.phase = 'reveal'
        s.t0 = performance.now()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80]">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" style={{visibility: 'hidden'}} />
      <div
        ref={label}
        className="display absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(36px,4.8vw,68px)] text-paper opacity-0"
      />
    </div>
  )
}
