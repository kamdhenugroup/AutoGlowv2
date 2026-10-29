import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {ARTICLE_QUERY, ARTICLE_SLUGS_QUERY, ARTICLES_PAGE_QUERY} from '@/sanity/queries'
import {imageSrc} from '@/sanity/image'
import {longDate} from '@/lib/format'
import {SITE_URL, social} from '@/lib/seo'
import {RichText, headingIds} from '@/components/RichText'
import {ShareArticle, TableOfContents} from '@/components/ArticleAside'

type Props = {params: Promise<{slug: string}>}

const getArticle = (slug: string) => sanityFetch({query: ARTICLE_QUERY, params: {slug}, tags: ['article', `article:${slug}`]})

export async function generateStaticParams() {
  const items = await sanityFetch({query: ARTICLE_SLUGS_QUERY, tags: ['article']})
  return items.map((a) => ({slug: a.slug}))
}
// New articles published in Sanity after a deploy are built on first visit (unknown slugs still 404).
export const dynamicParams = true

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const a = await getArticle(slug)
  if (!a) return {}
  return {
    title: `${a.title} | AutoGlow Articles`,
    description: a.description ?? undefined,
    ...(await social({
      path: `/articles/${slug}`,
      title: a.title,
      description: a.description,
      type: 'article',
      publishedTime: a.date,
      authors: a.author ? [a.author] : [],
    })),
  }
}

export default async function ArticlePage({params}: Props) {
  const {slug} = await params
  const [a, page] = await Promise.all([getArticle(slug), sanityFetch({query: ARTICLES_PAGE_QUERY, tags: ['articlesPage']})])
  if (!a) notFound()
  const body = (a.body ?? []) as Parameters<typeof RichText>[0]['value']
  const {toc} = headingIds(body)
  const cover = imageSrc(a.coverImage, a.legacyCoverImageUrl, 2400)

  return (
    <article>
      <header className="wrap pt-[clamp(48px,6vw,88px)]">
        <Link href="/articles" className="text-[15px] text-muted hover:text-ink">
          {page?.backLabel}
        </Link>
        <h1 className="display mt-10 max-w-[1180px] text-[clamp(36px,4.8vw,68px)] leading-[1.04]">{a.title}</h1>
        <p className="mt-6 max-w-[720px] text-[18px] leading-relaxed text-body md:text-[22px]">{a.description}</p>
        <p className="mt-8 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-muted">
          {a.category && <span className="font-medium text-ink">{a.category}</span>}
          <time dateTime={a.date ?? undefined}>{longDate(a.date)}</time>
          <span>{a.readingTime}</span>
        </p>
        {a.author && (
          <div className="mt-8 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-mist text-[15px] font-medium" aria-hidden="true">
              {a.author.charAt(0)}
            </span>
            <span className="text-[15px] leading-tight">
              <span className="block font-medium">{a.author}</span>
              <span className="text-muted">{page?.authorLabel}</span>
            </span>
          </div>
        )}
      </header>

      {cover && (
        <div className="wrap mt-[clamp(40px,5vw,72px)]">
          <div className="relative h-[clamp(260px,42vw,620px)] overflow-hidden rounded-sm bg-mist">
            <div data-parallax="0.1" className="absolute inset-0 will-change-transform">
              <Image src={cover} alt={a.coverImage?.alt || a.title || ''} fill priority sizes="100vw" className="object-cover" />
            </div>
          </div>
        </div>
      )}

      <div className="wrap grid gap-12 pt-[clamp(48px,6vw,88px)] pb-[clamp(80px,10vw,140px)] lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-10">
            <TableOfContents items={toc} label={page?.tocLabel ?? ''} />
          </div>
        </aside>
        <div className="min-w-0 lg:col-span-6">
          <RichText value={body} />
        </div>
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-10 lg:flex lg:justify-end">
            <ShareArticle title={a.title ?? ''} url={`${SITE_URL}/articles/${a.slug}`} label={page?.shareLabel ?? ''} />
          </div>
        </aside>
      </div>
    </article>
  )
}
