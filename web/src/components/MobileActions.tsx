'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useState} from 'react'
import {Phone, WhatsAppIcon} from './icons'

/** Bottom action bar on phones: call a studio or open WhatsApp. Hidden on the ad landing page. */
export function MobileActions({
  phones,
  callLabel,
  whatsappLabel,
}: {
  phones: {city: string; phone: string}[]
  callLabel: string
  whatsappLabel: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  if (pathname === '/landing') return null
  return (
    <>
      <div className="h-[76px] md:hidden" aria-hidden="true" />
      <nav
        aria-label="Quick contact"
        className="fixed inset-x-0 bottom-0 z-30 bg-paper px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-18px_rgba(3,21,51,0.35)] md:hidden"
      >
        {open && (
          <ul className="mb-3 grid grid-cols-2 gap-2">
            {phones.map((p) => (
              <li key={p.phone}>
                <a href={`tel:+91${p.phone}`} className="flex h-11 items-center justify-center rounded-sm bg-mist text-[15px] font-medium">
                  {p.city}
                </a>
              </li>
            ))}
          </ul>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-label={callLabel}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex h-12 items-center justify-center gap-2 rounded-sm bg-mist text-[15px] font-medium text-ink active:scale-[0.98]"
          >
            <Phone size={16} aria-hidden="true" />
            {callLabel}
          </button>
          <Link
            href="/whatsapp"
            aria-label={whatsappLabel}
            className="flex h-12 items-center justify-center gap-2 rounded-sm bg-ink text-[15px] font-medium text-paper"
          >
            <WhatsAppIcon size={16} />
            {whatsappLabel}
          </Link>
        </div>
      </nav>
    </>
  )
}
