'use client'

import {useEffect} from 'react'
import {play, unlockSound} from '@/lib/sound'

const INTERACTIVE = 'a[href], button, summary, [role="button"], [role="switch"], select, input[type="checkbox"]'
const GLYPHS = '#%&@*+=-:;/\\|<>[]{}0123456789ABCDEFGHJKLMNPRSTUVWXYZ'

/** Letters resolve from random glyphs, left to right. The real text is restored at the end. */
function scramble(el: HTMLElement) {
  if (el.dataset.scrambling) return
  const node = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())
  if (!node) return
  const text = node.textContent ?? ''
  el.dataset.scrambling = '1'
  const start = performance.now()
  const dur = Math.min(520, 180 + text.length * 22)
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / dur)
    const done = Math.floor(p * text.length)
    let out = ''
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      out += i < done || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
    }
    node.textContent = out
    if (p < 1) requestAnimationFrame(step)
    else {
      node.textContent = text
      delete el.dataset.scrambling
    }
  }
  requestAnimationFrame(step)
}

/**
 * Site-wide interface feedback, attached once by delegation:
 * a tick on hover, a click on press, and a glyph scramble on links marked data-scramble.
 */
export function UiFx() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const unlock = () => unlockSound()
    const over = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const t = (e.target as Element).closest?.(INTERACTIVE)
      if (!t || t.contains(e.relatedTarget as Node)) return
      play('tick')
      const s = (e.target as Element).closest<HTMLElement>('[data-scramble]')
      if (s && !reduce) scramble(s)
    }
    const down = (e: PointerEvent) => {
      unlockSound()
      if ((e.target as Element).closest?.(INTERACTIVE)) play('click')
    }
    const key = (e: KeyboardEvent) => {
      unlock()
      if ((e.key === 'Enter' || e.key === ' ') && (e.target as Element).closest?.(INTERACTIVE)) play('click')
    }
    document.addEventListener('pointerover', over, {passive: true})
    document.addEventListener('pointerdown', down, {passive: true})
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }
  }, [])
  return null
}
