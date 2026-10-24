'use client'

import Lenis from 'lenis'
import {usePathname} from 'next/navigation'
import {useEffect} from 'react'
import {motionAllowed} from '@/lib/motion'

let lenis: Lenis | null = null
export const getLenis = () => lenis

type Rail = {section: HTMLElement; track: HTMLElement; top: number; distance: number}
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
 * - [data-marquee]: a row that runs on its own and speeds up / reverses with the scroll
 * - the home hero photo pushes back and its copy lifts away
 * Every effect is a transform computed from cached geometry: nothing reads layout while scrolling.
 */
export function ScrollFx() {
  const pathname = usePathname()

  // Lenis lives for the whole session.
  useEffect(() => {
    if (!motionAllowed()) return
    lenis = new Lenis({lerp: 0.075, wheelMultiplier: 1.05, anchors: {offset: -24}, autoRaf: true})
    document.documentElement.classList.add('has-lenis')
    return () => {
      lenis?.destroy()
      lenis = null
    }
  }, [])

  // Effects are rebuilt for each page.
  useEffect(() => {
    if (!window.location.hash) lenis?.scrollTo(0, {immediate: true, force: true})
    if (!motionAllowed()) return
    const desktop = window.matchMedia('(min-width: 1024px)')
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
        return [{section, track, top, distance}]
      })
      paras = [...document.querySelectorAll<HTMLElement>('[data-parallax]')].map((el) => {
        const frame = el.parentElement!.getBoundingClientRect()
        return {el, top: frame.top + y, height: frame.height, speed: Number(el.dataset.parallax) || 0.12}
      })
      skews = [...document.querySelectorAll<HTMLElement>('[data-skew]')].map((el) => ({
        el,
        axis: el.dataset.skew === 'x' ? 'x' : 'y',
      }))
      marquees = [...document.querySelectorAll<HTMLElement>('[data-marquee]')].map((track) => ({
        track,
        x: 0,
        width: track.scrollWidth / 2,
        visible: true,
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
        r.track.style.transform = `translate3d(${-p * r.distance}px,0,0)`
      }
      for (const p of paras) {
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
      const lean = Math.round(clamp(vel * 0.18, -4, 4) * 100) / 100
      if (lean !== lastLean) for (const s of skews) s.el.style.transform = s.axis === 'x' ? `skewX(${-lean}deg)` : `skewY(${lean * 0.4}deg)`
      lastLean = lean
      for (const m of marquees) {
        if (!m.visible || !m.width) continue
        const dir = vel < -0.2 ? -1 : 1
        m.x -= (50 + Math.abs(vel) * 90) * dir * dt
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
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const m = marquees.find((x) => x.track === e.target)
        if (m) m.visible = e.isIntersecting
      }
    })
    marquees.forEach((m) => io.observe(m.track))

    let pending = 0
    const remeasure = () => {
      cancelAnimationFrame(pending)
      pending = requestAnimationFrame(measure)
    }
    const ro = new ResizeObserver(remeasure)
    ro.observe(document.body)
    window.addEventListener('resize', remeasure)
    if (lenis) lenis.on('scroll', onScroll)
    else window.addEventListener('scroll', onScroll, {passive: true})

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(pending)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('scroll', onScroll)
      lenis?.off('scroll', onScroll)
      rails.forEach((r) => (r.section.style.height = ''))
    }
  }, [pathname])

  return null
}
