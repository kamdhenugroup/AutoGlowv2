'use client'

import {useEffect, useState} from 'react'
import {cn} from './ui'

export function TableOfContents({items, label}: {items: {id: string; text: string; level: number}[]; label: string}) {
  const [active, setActive] = useState('')
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), {
      rootMargin: '0px 0px -80% 0px',
    })
    items.forEach((i) => {
      const el = document.getElementById(i.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [items])
  if (!items.length) return null
  return (
    <nav aria-label={label}>
      <h2 className="text-[15px] font-medium text-muted">{label}</h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              className={cn(
                'block py-0.5 text-[15px] leading-snug transition-colors',
                i.level === 3 && 'pl-4',
                active === i.id ? 'font-medium text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function ShareArticle({title, url, label}: {title: string; url: string; label: string}) {
  const [copied, setCopied] = useState(false)
  const btn = 'grid h-11 w-11 place-items-center rounded-full bg-mist text-ink transition-[background-color,transform] hover:bg-[#e4e7eb] active:scale-95'
  return (
    <div>
      <h2 className="text-[15px] font-medium text-muted">{label}</h2>
      <div className="mt-4 flex gap-2">
        <a
          className={btn}
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.9 2H22l-7.2 8.2L23.3 22h-6.6l-5.2-6.8L5.5 22H2.4l7.7-8.8L1.9 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20Z" />
          </svg>
        </a>
        <a
          className={btn}
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4V9Z" />
          </svg>
        </a>
        <button
          type="button"
          className={btn}
          aria-label="Copy link"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            } catch {}
          }}
        >
          {copied ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m5 12 5 5 9-10" stroke="currentColor" strokeWidth="2" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
