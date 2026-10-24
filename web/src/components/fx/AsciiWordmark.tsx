'use client'

import {useEffect, useRef} from 'react'
import {motionAllowed} from '@/lib/motion'

const RAMP = ' .:-=+*#%@'

/**
 * The name, full width, set in characters. A slow light passes through the letters and the
 * pointer stirs them; without motion it is a still character rendering of the word.
 */
export function AsciiWordmark({word}: {word: string}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const mask = document.createElement('canvas')
    const mctx = mask.getContext('2d', {willReadFrequently: true})!
    let cols = 0
    let rows = 0
    let cell = 0
    let data: Uint8ClampedArray = new Uint8ClampedArray()
    let cells: number[] = []
    let px = 0
    const atlas = document.createElement('canvas')
    let raf = 0
    let visible = false
    const mouse = {x: -1, y: -1}
    const t0 = performance.now()
    const animate = motionAllowed()

    let lastW = -1
    const build = () => {
      if (canvas.clientWidth === lastW) return
      lastW = canvas.clientWidth
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      cell = Math.max(7, Math.round(w / 150))
      cols = Math.floor(w / cell)
      // Measure the word so it spans the full width.
      mctx.font = `600 100px ${getComputedStyle(document.body).fontFamily}`
      const tw = mctx.measureText(word).width
      const fontPx = (cols / tw) * 100 * 0.98
      rows = Math.ceil(fontPx * 0.78)
      mask.width = cols
      mask.height = rows
      mctx.fillStyle = '#000'
      mctx.fillRect(0, 0, cols, rows)
      mctx.fillStyle = '#fff'
      mctx.font = `600 ${fontPx}px ${getComputedStyle(document.body).fontFamily}`
      mctx.textBaseline = 'alphabetic'
      mctx.fillText(word, (cols - mctx.measureText(word).width) / 2, rows * 0.9)
      data = mctx.getImageData(0, 0, cols, rows).data
      canvas.width = Math.round(cols * cell * dpr)
      canvas.height = Math.round(rows * cell * dpr)
      canvas.style.height = `${rows * cell}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      // Cells inside the letters, found once; the loop only visits these.
      cells = []
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const m = data[(y * cols + x) * 4] / 255
          if (m >= 0.08) cells.push(x, y, m)
        }
      // Every glyph pre-drawn once into a strip; frames copy from it instead of setting text.
      px = Math.round(cell * dpr)
      atlas.width = px * RAMP.length
      atlas.height = px
      const a = atlas.getContext('2d')!
      a.clearRect(0, 0, atlas.width, atlas.height)
      a.fillStyle = '#031533'
      a.font = `${Math.round(px * 1.15)}px ui-monospace, SFMono-Regular, Menlo, monospace`
      a.textAlign = 'center'
      a.textBaseline = 'middle'
      for (let i = 0; i < RAMP.length; i++) a.fillText(RAMP[i], i * px + px / 2, px / 2)
      draw()
    }

    const draw = () => {
      const t = (performance.now() - t0) / 1000
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < cells.length; i += 3) {
        const x = cells[i]
        const y = cells[i + 1]
        let v = cells[i + 2]
        if (animate) {
          // A diagonal light sweeping through, plus a stir around the pointer.
          v *= 0.55 + 0.45 * (Math.sin(x * 0.06 - y * 0.08 - t * 1.2) * 0.5 + 0.5)
          if (mouse.x >= 0) {
            const dx = x - mouse.x
            const dy = (y - mouse.y) * 1.2
            v *= 1 - Math.exp(-(dx * dx + dy * dy) / 60) * 0.85
          }
        }
        const g = Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))
        if (g > 0) ctx.drawImage(atlas, g * px, 0, px, px, x * px, y * px, px, px)
      }
    }

    let frame = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      // 30 frames a second is plenty for a slow light, and halves the work.
      if (visible && frame++ % 2 === 0) draw()
    }

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = (e.clientX - r.left) / cell
      mouse.y = (e.clientY - r.top) / cell
    }
    const leave = () => {
      mouse.x = -1
    }

    // Nothing is measured or drawn until the footer first comes near the screen.
    const ro = new ResizeObserver(() => {
      if (lastW !== -1) build()
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (visible && lastW === -1) build()
      },
      {rootMargin: '200px'},
    )
    io.observe(canvas)
    if (animate) {
      raf = requestAnimationFrame(loop)
      canvas.addEventListener('pointermove', move)
      canvas.addEventListener('pointerleave', leave)
    }
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerleave', leave)
    }
  }, [word])

  return <canvas ref={ref} aria-hidden="true" className="block w-full" />
}
