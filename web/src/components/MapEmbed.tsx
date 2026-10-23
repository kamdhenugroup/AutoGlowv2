'use client'

import {useState} from 'react'

/** Google Maps loads only on request, which keeps the page fast and avoids third-party cookies up front. */
export function MapEmbed({src, title}: {src: string; title: string}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-mist">
      {show ? (
        <iframe
          src={src}
          title={`Map: ${title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setShow(true)}
          className="absolute inset-0 grid place-items-center text-[15px] font-medium text-ink hover:bg-[#eceef1]"
        >
          <span className="flex flex-col items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="link-underline">Load Map</span>
            <span className="sr-only">{title}</span>
          </span>
        </button>
      )}
    </div>
  )
}
