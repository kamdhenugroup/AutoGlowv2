'use client'

import {ArrowLeft, ArrowRight} from 'lucide-react'

/** Arrows for the services row when it is not pinned (phones, short laptop screens). */
export function RailArrows({target, className}: {target: string; className?: string}) {
  const go = (dir: 1 | -1) => {
    const el = document.getElementById(target)
    const item = el?.querySelector('li')
    if (!el) return
    el.scrollBy({left: dir * ((item?.getBoundingClientRect().width ?? 300) + 20), behavior: 'smooth'})
  }
  const btn = 'grid h-11 w-11 place-items-center rounded-full transition-[background-color,transform] active:scale-95'
  return (
    <div className={className}>
      <button
        type="button"
        aria-controls={target}
        aria-label="Previous services"
        onClick={() => go(-1)}
        className={`${btn} bg-paper text-ink hover:bg-[#e4e7eb]`}
      >
        <ArrowLeft size={17} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-controls={target}
        aria-label="Next services"
        onClick={() => go(1)}
        className={`${btn} bg-ink text-paper hover:bg-[#0b2550]`}
      >
        <ArrowRight size={17} aria-hidden="true" />
      </button>
    </div>
  )
}
