'use client'

import {useRef} from 'react'
import type {ReactNode} from 'react'

/** Horizontal, snap-scrolling row. Moves only when dragged, swiped or the arrows are pressed. */
export function Carousel({children, label, heading, link}: {children: ReactNode; label: string; heading: ReactNode; link?: ReactNode}) {
  const ref = useRef<HTMLUListElement>(null)
  const go = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    const item = el.querySelector('li')
    const step = item ? item.getBoundingClientRect().width + 20 : el.clientWidth * 0.8
    el.scrollBy({left: dir * step, behavior: 'smooth'})
  }
  return (
    <div>
      <div className="wrap flex items-end justify-between gap-6">
        {heading}
        <div className="flex items-center gap-6 pb-1">
          {link}
          <div className="hidden gap-3 md:flex">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => go(-1)}
              className="grid h-12 w-12 place-items-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => go(1)}
              className="grid h-12 w-12 place-items-center rounded-full bg-ink text-paper transition-colors hover:bg-[#0b2550]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <ul
        ref={ref}
        aria-label={label}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scroll-padding-inline:clamp(20px,5.5vw,80px)] [padding-inline:clamp(20px,5.5vw,80px)] md:mt-14 md:gap-5"
      >
        {children}
      </ul>
    </div>
  )
}
