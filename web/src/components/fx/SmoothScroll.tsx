'use client'

import Lenis from 'lenis'
import {usePathname} from 'next/navigation'
import {useEffect} from 'react'

let lenis: Lenis | null = null
export const getLenis = () => lenis

/** Weighted smooth scrolling on desktop. Native scrolling on touch and for reduced motion. */
export function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lenis = new Lenis({lerp: 0.11, anchors: {offset: -24}, syncTouch: false})
    let raf = 0
    const loop = (t: number) => {
      lenis?.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis?.destroy()
      lenis = null
    }
  }, [])

  // A new page starts at the top.
  useEffect(() => {
    if (!window.location.hash) lenis?.scrollTo(0, {immediate: true, force: true})
  }, [pathname])

  return null
}
