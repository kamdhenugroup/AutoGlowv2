'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'
import {Logo} from './Logo'
import {buttonClass, cn} from './ui'
import {SoundToggle} from './fx/SoundToggle'

type NavLink = {_key: string; label: string | null; href: string | null}

export function Header({nav, cta}: {nav: NavLink[]; cta: {label: string | null; href: string | null} | null}) {
  const pathname = usePathname()
  // Only the home page puts the header over its full-bleed photo.
  const overlay = pathname === '/'
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
  }, [open])

  // Close the menu after navigating.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  const onImage = overlay && !open
  const links = nav.filter((l) => l.href && l.href !== '/')

  return (
    <header className={cn(overlay ? 'absolute inset-x-0 top-0 z-40' : 'relative z-40 bg-paper')}>
      <div className="wrap flex h-[88px] items-center justify-between gap-6">
        <Logo className="h-9 w-auto lg:h-10" priority />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`)
              return (
                <li key={l._key}>
                  <Link
                    href={l.href!}
                    aria-current={active ? 'page' : undefined}
                    data-scramble
                    className={cn(
                      'text-[15px] decoration-1 underline-offset-8 hover:underline',
                      onImage ? 'text-paper' : 'text-ink',
                      active && 'underline',
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-1 sm:gap-3">
          <SoundToggle tone={onImage ? 'paper' : 'ink'} />
          {cta?.href && (
            <Link href={cta.href} className={buttonClass(onImage ? 'onImage' : 'primary', 'h-11 px-5 max-sm:hidden')}>
              {cta.label}
            </Link>
          )}
          <button
            type="button"
            className={cn('-mr-2 grid h-11 w-11 place-items-center lg:hidden', onImage ? 'text-paper' : 'text-ink')}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" />
              ) : (
                <path d="M3 8h18M9 16h12" stroke="currentColor" strokeWidth="1.6" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-[88px] bottom-0 z-40 overflow-y-auto bg-paper lg:hidden">
          <nav aria-label="Mobile" className="wrap flex flex-col pt-6 pb-10">
            {nav.map((l) => (
              <Link
                key={l._key}
                href={l.href ?? '/'}
                className="display py-4 text-[clamp(24px,2.6vw,34px)] text-ink"
                aria-current={pathname === l.href ? 'page' : undefined}
              >
                {l.label}
              </Link>
            ))}
            {cta?.href && (
              <Link href={cta.href} className={buttonClass('primary', 'mt-8 w-full')}>
                {cta.label}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
