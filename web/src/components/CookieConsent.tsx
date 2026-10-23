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
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage on mount
      setPrefs(stored)
      applyConsent(stored)
    } else {
      timer = setTimeout(() => setVisible(true), 1500)
    }
    const open = () => {
      setVisible(true)
      setManage(true)
    }
    window.addEventListener('open-cookie-preferences', open)
    return () => {
      if (timer) clearTimeout(timer)
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
    <div
      role="dialog"
      aria-live="polite"
      aria-label={c.heading ?? 'Cookies'}
      className="fixed inset-x-4 bottom-4 z-[60] md:inset-x-auto md:right-6 md:bottom-6 md:w-[420px]"
    >
      <div className="rounded-sm border border-line bg-paper p-6 shadow-[0_20px_60px_-20px_rgba(3,21,51,0.35)]">
        {!manage ? (
          <>
            <h2 className="text-[18px] font-medium">{c.heading}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-body">
              {c.body}{' '}
              <Link href="/privacy" className="text-ink underline underline-offset-4">
                {c.learnMore}
              </Link>
            </p>
            <button
              type="button"
              onClick={() => save({necessary: true, analytics: true, marketing: true})}
              className="mt-5 h-11 rounded-sm bg-ink px-6 text-[15px] font-medium text-paper hover:bg-[#0b2550]"
            >
              {c.accept}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-[18px] font-medium">{c.prefsHeading}</h2>
            <p className="mt-2 text-[14px] text-body">{c.prefsBody}</p>
            <ul className="mt-5 divide-y divide-line border-y border-line">
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
                  <li key={item._key} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <h3 className="text-[15px] font-medium">{item.title}</h3>
                      <p className="text-[13px] text-muted">{item.body}</p>
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
                        prefs[field] ? 'bg-ink' : 'bg-line-strong',
                        locked && 'opacity-50',
                      )}
                    >
                      <span
                        className={cn('absolute top-1 h-4 w-4 rounded-full bg-paper transition-all', prefs[field] ? 'left-6' : 'left-1')}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => save(prefs)}
                className="h-11 flex-1 rounded-sm bg-ink px-5 text-[15px] font-medium text-paper hover:bg-[#0b2550]"
              >
                {c.save}
              </button>
              <button
                type="button"
                onClick={() => setManage(false)}
                className="h-11 rounded-sm border border-line-strong px-5 text-[15px] font-medium hover:border-ink"
              >
                {c.back}
              </button>
            </div>
          </>
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
