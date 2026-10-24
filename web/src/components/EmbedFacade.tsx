'use client'

import {Play} from 'lucide-react'
import {useState} from 'react'
import {InstagramIcon} from './icons'
import {YouTubeShort, youtubeId} from './YouTubeShort'

/**
 * A video embed that costs nothing until it is wanted: a poster tile first, the real player
 * (and its third-party cookies and scripts) only after a tap.
 */
export function EmbedFacade({src, title}: {src: string; title: string}) {
  const [on, setOn] = useState(false)
  if (youtubeId(src)) return <YouTubeShort url={src} title={title} />
  const instagram = /instagram\.com/.test(src)
  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-sm bg-ink">
      {on ? (
        <iframe
          src={src}
          title={title}
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0 bg-paper"
        />
      ) : (
        <button
          type="button"
          onClick={() => setOn(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 grid place-items-center text-paper"
        >
          {instagram && <InstagramIcon size={28} className="absolute top-5 left-5 opacity-80" />}
          <span className="grid h-16 w-16 place-items-center rounded-full bg-paper text-ink transition-transform group-hover:scale-105">
            <Play size={20} aria-hidden="true" className="ml-0.5" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  )
}
