import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {ARTICLE_QUERY, ARTICLE_SLUGS_QUERY, ARTICLES_PAGE_QUERY} from '@/sanity/queries'
import {imageSrc} from '@/sanity/image'
import {longDate} from '@/lib/format'
import {SITE_URL} from '@/lib/seo'
import {RichText, headingIds} from '@/components/RichText'
import {ShareArticle, TableOfContents} from '@/components/ArticleAside'

type Props = {params: Promise<{slug: string}>}

const getArticle = (slug: string) => sanityFetch({query: ARTICLE_QUERY, params: {slug}, tags: ['article', `article:${slug}`]})

export async function generateStaticParams() {
  const items = await sanityFetch({query: ARTICLE_SLUGS_QUERY, tags: ['article']})
  return items.map((a) => ({slug: a.slug}))
}
export const dynamicParams = false

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const a = await getArticle(slug)
  if (!a) return {}
  const cover = imageSrc(a.coverImage, a.legacyCoverImageUrl, 1200)
  const title = a.title ?? undefined
  const description = a.description ?? undefined
  return {
    title: `${a.title} | AutoGlow Articles`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: a.date ?? undefined,
      authors: a.author ? [a.author] : [],
      images: cover ? [cover] : [],
    },
    twitter: {card: 'summary_large_image', title, description, images: cover ? [cover] : []},
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
      <header className="mx-auto max-w-[920px] px-5 pt-[clamp(48px,6vw,88px)]">
        <Link href="/articles" className="text-[14px] text-muted hover:text-ink">
          {page?.backLabel}
        </Link>
        <p className="mt-10 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-muted">
          {a.category && <span className="font-medium text-ink">{a.category}</span>}
          <time dateTime={a.date ?? undefined}>{longDate(a.date)}</time>
          <span>{a.readingTime}</span>
        </p>
        <h1 className="display mt-5 text-[clamp(38px,4.6vw,64px)] leading-[1.04]">{a.title}</h1>
        <p className="mt-6 max-w-[720px] text-[19px] leading-relaxed text-body">{a.description}</p>
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
            <Image src={cover} alt={a.coverImage?.alt || a.title || ''} fill priority sizes="100vw" className="object-cover" />
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
          <div className="lg:sticky lg:top-10">
            <ShareArticle title={a.title ?? ''} url={`${SITE_URL}/articles/${a.slug}`} label={page?.shareLabel ?? ''} />
          </div>
        </aside>
      </div>
    </article>
  )
}
