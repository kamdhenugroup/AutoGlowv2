'use client'

import type Lenis from 'lenis'
import {usePathname} from 'next/navigation'
import {useEffect} from 'react'
import {motionAllowed} from '@/lib/motion'

let lenis: Lenis | null = null
export const getLenis = () => lenis

type Rail = {section: HTMLElement; track: HTMLElement; top: number; distance: number; imgs: {el: HTMLElement; center: number}[]}
type Para = {el: HTMLElement; top: number; height: number; speed: number}
type Skew = {el: HTMLElement; axis: 'x' | 'y'}
type Marquee = {track: HTMLElement; x: number; width: number; visible: boolean}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/**
 * One scroll engine for the whole site, driven by Lenis:
 * - weighted smooth scrolling on desktop (touch keeps native scrolling)
 * - [data-rail]: a pinned section whose row of cards travels sideways as you scroll down
 * - [data-parallax]: pictures drift inside their frames
 * - [data-skew]: elements lean with scroll speed and settle when it stops
 * - [data-marquee]: a row that runs on its own at a constant speed
 * - the home hero photo pushes back and its copy lifts away
 * Every effect is a transform computed from cached geometry: nothing reads layout while scrolling.
 */
export function ScrollFx() {
  const pathname = usePathname()

  // Lenis lives for the whole session.
  useEffect(() => {
    if (!motionAllowed()) return
    // Start smooth scrolling once the page has settled, so it adds nothing to the first load.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200))
    let cancelled = false
    const id = idle(async () => {
      // Loaded on demand: smooth scrolling is not needed for the first paint.
      const {default: LenisClass} = await import('lenis')
      if (cancelled) return
      lenis = new LenisClass({lerp: 0.075, wheelMultiplier: 1.05, anchors: {offset: -24}, autoRaf: true})
      lenis.on('scroll', () => window.dispatchEvent(new Event('lenis-scroll')))
      document.documentElement.classList.add('has-lenis')
    })
    return () => {
      cancelled = true
      ;(window.cancelIdleCallback ?? clearTimeout)(id as number)
      lenis?.destroy()
      lenis = null
    }
  }, [])

  // Effects are rebuilt for each page.
  useEffect(() => {
    if (!window.location.hash) lenis?.scrollTo(0, {immediate: true, force: true})
    if (!motionAllowed()) return
    const desktop = window.matchMedia('(min-width: 1024px) and (min-height: 700px)')
    let rails: Rail[] = []
    let paras: Para[] = []
    let skews: Skew[] = []
    let marquees: Marquee[] = []
    let heroMedia: HTMLElement | null = null
    let heroCopy: HTMLElement | null = null
    let heroH = 0
    let vh = window.innerHeight
    let vel = 0 // smoothed velocity
    let raf = 0
    let scrollY = window.scrollY

    const measure = () => {
      vh = window.innerHeight
      const y = window.scrollY
      rails = [...document.querySelectorAll<HTMLElement>('[data-rail]')].flatMap((section) => {
        const track = section.querySelector<HTMLElement>('[data-rail-track]')
        if (!track) return []
        if (!desktop.matches) {
          section.style.height = ''
          track.style.transform = ''
          return []
        }
        track.style.transform = 'none'
        const distance = Math.max(0, track.scrollWidth - track.clientWidth)
        section.style.height = `${distance + vh}px`
        const top = section.getBoundingClientRect().top + y
        const left = track.getBoundingClientRect().left
        const imgs = [...track.querySelectorAll<HTMLElement>('[data-rail-img]')].map((el) => {
          const r = el.parentElement!.getBoundingClientRect()
          return {el, center: r.left - left + r.width / 2}
        })
        return [{section, track, top, distance, imgs}]
      })
      // Parallax pictures and marquees are measured when they near the screen (see `near`), so
      // offscreen sections are not laid out while the page starts.
      paras = [...document.querySelectorAll<HTMLElement>('[data-parallax]')].map((el) => ({
        el,
        top: 0,
        height: 0,
        speed: Number(el.dataset.parallax) || 0.12,
      }))
      skews = [...document.querySelectorAll<HTMLElement>('[data-skew]')].map((el) => ({
        el,
        axis: el.dataset.skew === 'x' ? 'x' : 'y',
      }))
      marquees = [...document.querySelectorAll<HTMLElement>('[data-marquee]')].map((track) => ({
        track,
        x: 0,
        width: 0,
        visible: false,
      }))
      const hero = document.querySelector<HTMLElement>('[data-hero]')
      heroMedia = hero?.querySelector('[data-hero-media]') ?? null
      heroCopy = hero?.querySelector('[data-hero-copy]') ?? null
      heroH = hero?.offsetHeight ?? 0
      apply()
    }

    const apply = () => {
      const y = scrollY
      for (const r of rails) {
        const p = clamp((y - r.top) / Math.max(1, r.distance), 0, 1)
        const tx = -p * r.distance
        r.track.style.transform = `translate3d(${tx}px,0,0)`
        const vw = window.innerWidth
        for (const im of r.imgs) {
          // -1 at the left edge of the screen, +1 at the right: the photo trails the frame.
          const k = clamp((im.center + tx - vw / 2) / (vw / 2), -1.5, 1.5)
          im.el.style.transform = `translate3d(${k * -3}%,0,0) scale(1.08)`
        }
      }
      for (const p of paras) {
        if (!p.height) continue
        if (y + vh < p.top || y > p.top + p.height) continue
        const progress = (y + vh - p.top) / (vh + p.height) - 0.5
        p.el.style.transform = `translate3d(0,${progress * p.speed * p.height * -1}px,0) scale(${1 + p.speed * 1.2})`
      }
      if (heroMedia && y < heroH) {
        const k = y / heroH
        heroMedia.style.transform = `translate3d(0,${y * 0.35}px,0) scale(${1 + k * 0.12})`
        if (heroCopy) {
          heroCopy.style.transform = `translate3d(0,${y * -0.08}px,0)`
          heroCopy.style.opacity = String(1 - clamp(k * 1.4, 0, 1))
        }
      }
    }

    // Velocity effects ease back to rest after the scroll stops, so they run on their own loop.
    let last = performance.now()
    let lastLean = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(64, now - last) / 1000
      last = now
      const target = lenis?.velocity ?? 0
      vel += (target - vel) * 0.12
      if (Math.abs(vel) < 0.01) vel = 0
      const lean = Math.round(clamp(vel * 0.12, -3, 3) * 100) / 100
      if (lean !== lastLean) for (const s of skews) s.el.style.transform = s.axis === 'x' ? `skewX(${-lean}deg)` : `skewY(${lean * 0.4}deg)`
      lastLean = lean
      for (const m of marquees) {
        if (!m.visible || !m.width || m.track.dataset.paused) continue
        // Constant speed, whatever the scroll does.
        m.x -= 50 * dt
        if (m.x <= -m.width) m.x += m.width
        if (m.x > 0) m.x -= m.width
        m.track.style.transform = `translate3d(${m.x}px,0,0)`
      }
    }

    const onScroll = () => {
      scrollY = lenis?.scroll ?? window.scrollY
      apply()
    }

    measure()
    raf = requestAnimationFrame(tick)
    // Measure a marquee or parallax frame as it nears the screen, from the observer's own geometry.
    const near = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const m = marquees.find((x) => x.track === e.target)
          if (m) {
            m.visible = e.isIntersecting
            if (e.isIntersecting && !m.width) m.width = m.track.scrollWidth / 2
            continue
          }
          const p = paras.find((x) => x.el.parentElement === e.target)
          if (p && e.isIntersecting) {
            p.top = e.boundingClientRect.top + window.scrollY
            p.height = e.boundingClientRect.height
            apply()
          }
        }
      },
      {rootMargin: '25% 0px'},
    )
    const observeNear = () => {
      near.disconnect()
      marquees.forEach((m) => near.observe(m.track))
      paras.forEach((p) => p.el.parentElement && near.observe(p.el.parentElement))
    }
    observeNear()

    let pending = 0
    const remeasure = () => {
      cancelAnimationFrame(pending)
      pending = requestAnimationFrame(() => {
        measure()
        observeNear()
      })
    }
    const ro = new ResizeObserver(remeasure)
    ro.observe(document.body)
    window.addEventListener('resize', remeasure)
    // Native scroll until Lenis starts, then Lenis's own (smoothed) position.
    window.addEventListener('scroll', onScroll, {passive: true})
    window.addEventListener('lenis-scroll', onScroll)

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(pending)
      near.disconnect()
      ro.disconnect()
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('lenis-scroll', onScroll)
      rails.forEach((r) => (r.section.style.height = ''))
    }
  }, [pathname])

  return null
}
