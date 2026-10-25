'use client'

import {usePathname} from 'next/navigation'
import {useEffect} from 'react'

const TARGETS = [
  'h1',
  'h2',
  'p',
  'blockquote',
  'dl',
  'ul',
  'ol',
  'form',
  'figure',
  'details',
  '[class*="aspect-"]',
  '.relative.overflow-hidden',
]
  .map((t) => `:is(main, footer) section ${t}`)
  .join(',')

const SCROLL_FX = '[data-rail-track], [data-marquee], [data-skew], [data-parallax], [data-hero-copy]'

/**
 * Each section's parts rise in as the section enters: heading, then text, then picture.
 * Content is visible without script, and visitors who prefer reduced motion get no travel.
 */
export function Reveal() {
  const pathname = usePathname()
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const root = document.documentElement
    root.classList.add('rv-on')

    const picked: HTMLElement[] = []
    document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
      // Animate the outermost match only, so a list and its items do not both move.
      if (picked.some((p) => p.contains(el))) return
      if (el.closest('[role="dialog"]')) return
      // Scroll-driven elements own their transform; a reveal transition on them would make them lag.
      if (el.matches(SCROLL_FX) || el.querySelector(SCROLL_FX) || el.closest(SCROLL_FX)) return
      picked.push(el)
    })

    // What is already on screen stays as it is: hiding it and fading it back would only delay the
    // first meaningful paint. The entrance is for what the visitor scrolls to. Positions come from
    // IntersectionObserver, never from reading layout, so offscreen sections (content-visibility)
    // are not laid out early.
    const perSection = new Map<Element, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('rv-in')
          io.unobserve(e.target)
        }
      },
      {rootMargin: '0px 0px -8% 0px'},
    )
    const sort = new IntersectionObserver((entries) => {
      for (const e of entries) {
        sort.unobserve(e.target)
        if (e.boundingClientRect.top < window.innerHeight) continue
        const el = e.target as HTMLElement
        const section = el.closest('section') ?? document.body
        const i = perSection.get(section) ?? 0
        perSection.set(section, i + 1)
        el.style.setProperty('--rv-d', `${Math.min(i, 5) * 80}ms`)
        el.classList.add('rv')
        io.observe(el)
      }
    })
    picked.forEach((el) => sort.observe(el))
    return () => {
      sort.disconnect()
      io.disconnect()
    }
  }, [pathname])
  return null
}
