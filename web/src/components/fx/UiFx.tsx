'use client'

import {useEffect} from 'react'
import {motionAllowed} from '@/lib/motion'

const GLYPHS = '#%&@*+=-:;/\\|<>[]{}0123456789ABCDEFGHJKLMNPRSTUVWXYZ'

/** Letters resolve from random glyphs, left to right. The real text is restored at the end. */
function scramble(el: HTMLElement) {
  if (el.dataset.scrambling) return
  const node = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())
  if (!node) return
  const text = node.textContent ?? ''
  el.dataset.scrambling = '1'
  const start = performance.now()
  const dur = Math.min(480, 160 + text.length * 20)
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

/** A glyph scramble on hover for links marked data-scramble. */
export function UiFx() {
  useEffect(() => {
    if (!motionAllowed()) return
    const over = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const s = (e.target as Element).closest?.<HTMLElement>('[data-scramble]')
      if (s && !s.contains(e.relatedTarget as Node)) scramble(s)
    }
    document.addEventListener('pointerover', over, {passive: true})
    return () => document.removeEventListener('pointerover', over)
  }, [])
  return null
}
