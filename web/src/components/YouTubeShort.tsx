'use client'

import {useState} from 'react'

export function youtubeId(url: string) {
  const m = url.match(/(?:shorts\/|youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/)
  return m?.[1] ?? null
}

/** Poster first; the YouTube player loads only when someone presses play. */
export function YouTubeShort({url, title}: {url: string; title: string}) {
  const id = youtubeId(url)
  const [play, setPlay] = useState(false)
  const [gone, setGone] = useState(false)
  // A removed or private video has no thumbnail at all: leave it out rather than show a black tile.
  if (!id || gone) return null
  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-sm bg-ink">
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0" aria-label={`Play video: ${title}`}>
          {/* Vertical thumbnail when YouTube has one; its 120px grey placeholder means it does not, so fall back. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/oardefault.jpg`}
            alt=""
            loading="lazy"
            onLoad={(e) => {
              const img = e.currentTarget
              if (img.naturalWidth > 120) return
              // YouTube answers a missing thumbnail with a small grey placeholder; try the other size, then give up.
              if (!img.src.includes('hqdefault')) img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
              else setGone(true)
            }}
            onError={(e) => {
              const img = e.currentTarget
              if (!img.src.includes('hqdefault')) img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
              else setGone(true)
            }}
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute top-1/2 left-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper text-ink transition-transform group-hover:scale-105">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5 3v10l8-5z" fill="currentColor" />
            </svg>
          </span>
        </button>
      )}
    </div>
  )
}
