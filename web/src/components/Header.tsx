'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useRef, useState} from 'react'
import {Logo} from './Logo'
import {ActionIcon, buttonClass, cn} from './ui'
import {getLenis} from './fx/ScrollFx'

type NavLink = {_key: string; label: string | null; href: string | null}

export function Header({nav, cta}: {nav: NavLink[]; cta: {label: string | null; href: string | null} | null}) {
  const pathname = usePathname()
  // Only the home page puts the header over its full-bleed photo.
  const overlay = pathname === '/'
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  // Close the menu after navigating.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  // While open: page scroll paused, Escape closes, focus moves into the menu and back out after.
  useEffect(() => {
    const lenis = getLenis()
    if (!open) {
      document.documentElement.style.overflow = ''
      lenis?.start()
      return
    }
    document.documentElement.style.overflow = 'hidden'
    lenis?.stop()
    const first = panel.current?.querySelector<HTMLElement>('a')
    const t = setTimeout(() => first?.focus({preventScroll: true}), 80)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const onImage = overlay && !open
  const links = nav.filter((l) => l.href && l.href !== '/')

  return (
    <header className={cn(overlay ? 'absolute inset-x-0 top-0 z-40' : 'relative z-40 bg-paper')}>
      <div className="wrap relative z-50 flex h-[88px] items-center justify-between gap-6">
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
        <div className="flex items-center gap-3">
          {cta?.href && (
            <Link href={cta.href} className={buttonClass(onImage ? 'onImage' : 'primary', 'h-11 px-5 max-sm:hidden')}>
              <ActionIcon href={cta.href} size={16} />
              {cta.label}
            </Link>
          )}
          <button
            ref={button}
            type="button"
            className={cn('-mr-2 grid h-11 w-11 place-items-center transition-colors lg:hidden', onImage ? 'text-paper' : 'text-ink')}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {/* Two lines that turn into a cross. */}
            <span className="relative block h-4 w-6" aria-hidden="true">
              <span
                className={cn(
                  'absolute left-0 h-[1.6px] w-6 bg-current transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)]',
                  open ? 'top-[7px] rotate-45' : 'top-[2px]',
                )}
              />
              <span
                className={cn(
                  'absolute right-0 h-[1.6px] bg-current transition-[transform,width] duration-500 ease-[cubic-bezier(.76,0,.24,1)]',
                  open ? 'top-[7px] w-6 -rotate-45' : 'top-[12px] w-4',
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Phone menu: the panel wipes down, then the links rise in one after another. */}
      <div
        id="mobile-menu"
        ref={panel}
        data-open={open || undefined}
        inert={!open}
        className="mobile-menu fixed inset-0 z-40 overflow-y-auto bg-paper pt-[88px] lg:hidden"
      >
        <nav aria-label="Mobile" className="wrap flex min-h-full flex-col pt-6 pb-10">
          <ul>
            {nav.map((l, i) => (
              <li key={l._key} className="overflow-hidden">
                <Link
                  href={l.href ?? '/'}
                  className="menu-item display block py-3 text-[clamp(36px,10vw,56px)] text-ink"
                  style={{transitionDelay: open ? `${180 + i * 55}ms` : '0ms'}}
                  aria-current={pathname === l.href ? 'page' : undefined}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {cta?.href && (
            <div className="menu-item mt-auto pt-10" style={{transitionDelay: open ? `${200 + nav.length * 55}ms` : '0ms'}}>
              <Link href={cta.href} className={buttonClass('primary', 'w-full')}>
                <ActionIcon href={cta.href} />
                {cta.label}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
