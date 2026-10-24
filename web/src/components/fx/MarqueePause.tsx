'use client'

import {Pause, Play} from 'lucide-react'
import {useEffect, useState} from 'react'

/** Moving content needs a way to stop it (WCAG 2.2.2). Also pauses while hovered or focused. */
export function MarqueePause({target}: {target: string}) {
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    const el = document.getElementById(target)
    if (!el) return
    let hover = false
    const sync = () => {
      if (paused || hover) el.dataset.paused = '1'
      else delete el.dataset.paused
    }
    const on = () => ((hover = true), sync())
    const off = () => ((hover = false), sync())
    sync()
    el.addEventListener('pointerenter', on)
    el.addEventListener('pointerleave', off)
    return () => {
      el.removeEventListener('pointerenter', on)
      el.removeEventListener('pointerleave', off)
    }
  }, [paused, target])
  return (
    <button
      type="button"
      aria-controls={target}
      aria-pressed={paused}
      onClick={() => setPaused((p) => !p)}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-mist px-4 text-[15px] font-medium text-ink hover:bg-[#e4e7eb] motion-reduce:hidden"
    >
      {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      {paused ? 'Play' : 'Pause'}
    </button>
  )
}
