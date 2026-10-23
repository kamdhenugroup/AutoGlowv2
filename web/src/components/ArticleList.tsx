'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useMemo, useState} from 'react'
import {cn} from './ui'

export type ArticleListItem = {
  _id: string
  title: string
  slug: string
  description: string
  date: string
  dateLabel: string
  category: string | null
  readingTime: string
  cover: string | null
}

export function ArticleList({
  articles,
  allLabel,
  readMore,
  searchPlaceholder,
  noResultsHeading,
  noResultsBody,
}: {
  articles: ArticleListItem[]
  allLabel: string
  readMore: string
  searchPlaceholder: string
  noResultsHeading: string
  noResultsBody: string
}) {
  const categories = useMemo(() => Array.from(new Set(articles.map((a) => a.category).filter(Boolean))) as string[], [articles])
  const [cat, setCat] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const shown = articles.filter(
    (a) => (!cat || a.category === cat) && (!q || `${a.title} ${a.description}`.toLowerCase().includes(q.trim().toLowerCase())),
  )

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
        <ul className="flex flex-wrap gap-2" aria-label="Categories">
          {[null, ...categories].map((c) => (
            <li key={c ?? 'all'}>
              <button
                type="button"
                aria-pressed={cat === c}
                onClick={() => setCat(c)}
                className={cn(
                  'h-10 rounded-full border px-4 text-[14px] font-medium transition-colors',
                  cat === c ? 'border-ink bg-ink text-paper' : 'border-line-strong hover:border-ink',
                )}
              >
                {c ?? allLabel}
              </button>
            </li>
          ))}
        </ul>
        <label className="relative block md:w-[300px]">
          <span className="sr-only">{searchPlaceholder}</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-sm border border-line-strong bg-paper px-4 text-[15px] placeholder:text-muted focus:border-ink focus:outline-none"
          />
        </label>
      </div>

      {shown.length === 0 ? (
        <div className="py-24 text-center">
          <h2 className="text-[22px] font-medium">{noResultsHeading}</h2>
          <p className="mt-2 text-body">{noResultsBody}</p>
        </div>
      ) : (
        <ul className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => (
            <li key={a._id}>
              <article className="group relative flex h-full flex-col">
                <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-mist">
                  {a.cover && (
                    <Image
                      src={a.cover}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <p className="mt-5 flex gap-4 text-[14px] text-muted">
                  <time dateTime={a.date}>{a.dateLabel}</time>
                  {a.category && <span className="text-ink">{a.category}</span>}
                </p>
                <h2 className="mt-3 text-[21px] leading-snug font-medium">
                  <Link href={`/articles/${a.slug}`} className="after:absolute after:inset-0" aria-label={`Read article ${a.title}`}>
                    {a.title}
                  </Link>
                </h2>
                <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-body">{a.description}</p>
                <p className="mt-auto flex items-center justify-between pt-6 text-[14px]">
                  <span className="text-muted">{a.readingTime}</span>
                  <span className="link-underline font-medium">{readMore}</span>
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
