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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <ul className="flex flex-wrap gap-2" aria-label="Categories">
          {[null, ...categories].map((c) => (
            <li key={c ?? 'all'}>
              <button
                type="button"
                aria-pressed={cat === c}
                onClick={() => setCat(c)}
                className={cn(
                  'h-10 rounded-full px-4 text-[15px] font-medium transition-[background-color,transform] active:scale-95',
                  cat === c ? 'bg-ink text-paper' : 'bg-mist hover:bg-[#e4e7eb]',
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
          {shown.map((a, i) => {
            // The newest story leads, full width, until the reader filters or searches.
            const lead = i === 0 && !cat && !q
            return (
              <li key={a._id} className={cn(lead && 'md:col-span-2 lg:col-span-3')}>
                <article className={cn('group relative flex h-full flex-col', lead && 'lg:grid lg:grid-cols-12 lg:items-end lg:gap-12')}>
                  <div className={cn('relative aspect-[16/10] overflow-hidden rounded-sm bg-mist', lead && 'lg:col-span-7')}>
                    {a.cover && (
                      <Image
                        src={a.cover}
                        alt=""
                        fill
                        priority={lead}
                        sizes={lead ? '(min-width: 1024px) 58vw, 100vw' : '(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw'}
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className={cn('flex flex-1 flex-col', lead && 'lg:col-span-5 lg:pb-2')}>
                    <h2
                      className={cn(
                        'mt-5',
                        lead ? 'display text-[clamp(24px,2.6vw,34px)] leading-[1.12] tracking-[-0.025em]' : 'text-[22px] leading-snug font-medium',
                      )}
                    >
                      <Link href={`/articles/${a.slug}`} className="after:absolute after:inset-0" aria-label={`Read article ${a.title}`}>
                        {a.title}
                      </Link>
                    </h2>
                    <p className={cn('mt-3 text-[18px] leading-relaxed text-body', !lead && 'line-clamp-3')}>{a.description}</p>
                    <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-6 text-[15px] text-muted">
                      {a.category && <span className="font-medium text-ink">{a.category}</span>}
                      <time dateTime={a.date}>{a.dateLabel}</time>
                      <span>{a.readingTime}</span>
                      <span className="link-underline ml-auto font-medium text-ink">{readMore}</span>
                    </p>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
