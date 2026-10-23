'use client'

import {useEffect, useRef} from 'react'
import {motionAllowed} from '@/lib/gl'

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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `${Math.round(cell * 1.15)}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      draw()
    }

    const draw = () => {
      const t = (performance.now() - t0) / 1000
      ctx.clearRect(0, 0, cols * cell, rows * cell)
      ctx.fillStyle = '#031533'
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const m = data[(y * cols + x) * 4] / 255
          if (m < 0.08) continue
          let v = m
          if (animate) {
            // A diagonal light sweeping through, plus a stir around the pointer.
            const sweep = Math.sin(x * 0.06 - y * 0.08 - t * 1.2) * 0.5 + 0.5
            v = m * (0.55 + 0.45 * sweep)
            if (mouse.x >= 0) {
              const d = Math.hypot(x - mouse.x, (y - mouse.y) * 1.2)
              v *= 1 - Math.exp(-(d * d) / 60) * 0.85
            }
          }
          const g = RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))]
          if (g !== ' ') ctx.fillText(g, x * cell + cell / 2, y * cell + cell / 2)
        }
      }
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (visible) draw()
    }

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = (e.clientX - r.left) / cell
      mouse.y = (e.clientY - r.top) / cell
    }
    const leave = () => {
      mouse.x = -1
    }

    build()
    const ro = new ResizeObserver(build)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
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
