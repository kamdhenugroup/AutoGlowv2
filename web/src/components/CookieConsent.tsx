'use client'

import Link from 'next/link'
import {useEffect, useState} from 'react'
import type {Settings} from '@/lib/data'
import {cn} from './ui'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

type Prefs = {necessary: boolean; analytics: boolean; marketing: boolean}
const KEY = 'cookie-consent' // same key as the previous site, so existing choices carry over

function applyConsent(p: Prefs) {
  window.gtag?.('consent', 'update', {
    analytics_storage: p.analytics ? 'granted' : 'denied',
    ad_storage: p.marketing ? 'granted' : 'denied',
    ad_user_data: p.marketing ? 'granted' : 'denied',
    ad_personalization: p.marketing ? 'granted' : 'denied',
  })
}

function readStored(): Prefs | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Prefs) : null
  } catch {
    return null
  }
}

export function CookieConsent({c}: {c: Settings['cookieConsent']}) {
  const [visible, setVisible] = useState(false)
  const [manage, setManage] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>({necessary: true, analytics: false, marketing: false})

  useEffect(() => {
    const stored = readStored()
    let timer: ReturnType<typeof setTimeout> | undefined
    let cleanupScroll: (() => void) | undefined
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage on mount
      setPrefs(stored)
      applyConsent(stored)
    } else {
      // Ask once the visitor starts reading (first scroll) or after a few seconds, so the
      // banner never sits over the first screen's buttons. Consent defaults to denied until then.
      const show = () => setVisible(true)
      timer = setTimeout(show, 6000)
      window.addEventListener('scroll', show, {once: true, passive: true})
      cleanupScroll = () => window.removeEventListener('scroll', show)
    }
    const open = () => {
      setVisible(true)
      setManage(true)
    }
    window.addEventListener('open-cookie-preferences', open)
    return () => {
      if (timer) clearTimeout(timer)
      cleanupScroll?.()
      window.removeEventListener('open-cookie-preferences', open)
    }
  }, [])

  const save = (p: Prefs) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(p))
    } catch {}
    setPrefs(p)
    applyConsent(p)
    setVisible(false)
  }

  if (!visible || !c) return null
  const [necessary, analytics, marketing] = c.categories ?? []

  return (
    <div role="dialog" aria-live="polite" aria-label={c.heading ?? 'Cookies'} className="fixed inset-x-0 bottom-0 z-[60] bg-ink text-paper">
      <div className="wrap py-4 md:py-5">
        {!manage ? (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-10">
            <p className="max-w-[880px] text-[15px] leading-snug text-[#c9d0db]">
              <span className="font-medium text-paper">{c.heading}</span> {c.body}{' '}
              <Link href="/privacy" className="text-paper underline underline-offset-4">
                {c.learnMore}
                <span className="sr-only"> about cookies and privacy</span>
              </Link>
            </p>
            <button
              type="button"
              onClick={() => save({necessary: true, analytics: true, marketing: true})}
              className="h-11 shrink-0 self-start rounded-sm bg-paper px-6 text-[15px] font-medium text-ink transition-[background-color,transform] hover:bg-mist active:scale-[0.97] md:self-auto"
            >
              {c.accept}
            </button>
          </div>
        ) : (
          <div className="py-2">
            <h2 className="text-[18px] font-medium">{c.prefsHeading}</h2>
            <p className="mt-1 text-[15px] text-[#c9d0db]">{c.prefsBody}</p>
            <ul className="mt-4 grid gap-2 md:grid-cols-3">
              {[
                [necessary, 'necessary'],
                [analytics, 'analytics'],
                [marketing, 'marketing'],
              ].map(([cat, k]) => {
                const item = cat as {_key: string; title: string | null; body: string | null} | undefined
                const field = k as keyof Prefs
                if (!item) return null
                const locked = field === 'necessary'
                return (
                  <li key={item._key} className="flex items-center justify-between gap-4 rounded-sm bg-white/8 p-4">
                    <div>
                      <h3 className="text-[15px] font-medium">{item.title}</h3>
                      <p className="text-[15px] text-[#aab3c2]">{item.body}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs[field]}
                      aria-label={item.title ?? field}
                      disabled={locked}
                      onClick={() => setPrefs((p) => ({...p, [field]: !p[field]}))}
                      className={cn(
                        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                        prefs[field] ? 'bg-paper' : 'bg-white/25',
                        locked && 'opacity-50',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-1 h-4 w-4 rounded-full transition-[left]',
                          prefs[field] ? 'left-6 bg-ink' : 'left-1 bg-paper',
                        )}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => save(prefs)}
                className="h-11 rounded-sm bg-paper px-6 text-[15px] font-medium text-ink hover:bg-mist"
              >
                {c.save}
              </button>
              <button
                type="button"
                onClick={() => setManage(false)}
                className="h-11 rounded-sm bg-white/14 px-6 text-[15px] font-medium text-paper hover:bg-white/24"
              >
                {c.back}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function ManageCookiesButton({label}: {label: string}) {
  return (
    <button type="button" className="hover:text-ink" onClick={() => window.dispatchEvent(new Event('open-cookie-preferences'))}>
      {label}
    </button>
  )
}
