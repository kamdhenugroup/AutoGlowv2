import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {ARTICLES_PAGE_QUERY} from '@/sanity/queries'
import {imageSrc} from '@/sanity/image'
import {getArticles} from '@/lib/data'
import {shortDate} from '@/lib/format'
import {pageMetadata} from '@/lib/seo'
import {articleArtwork} from '@/lib/articleArtwork'
import {ArticleList} from '@/components/ArticleList'

const getPage = () => sanityFetch({query: ARTICLES_PAGE_QUERY, tags: ['articlesPage']})

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await getPage())?.seo, '/articles')
}

export default async function ArticlesPage() {
  const [page, articles] = await Promise.all([getPage(), getArticles()])
  return (
    <>
      <section className="wrap pt-[clamp(56px,8vw,112px)] pb-12">
        <h1 className="display max-w-[900px] text-[clamp(46px,7.6vw,112px)]">{page?.heading}</h1>
        <p className="mt-6 max-w-[600px] text-[18px] leading-relaxed text-body">{page?.intro}</p>
      </section>
      <section className="wrap pb-[clamp(72px,10vw,144px)]">
        <ArticleList
          articles={articles.map((a) => ({
            _id: a._id,
            title: a.title ?? '',
            slug: a.slug ?? '',
            description: a.description ?? '',
            date: a.date ?? '',
            dateLabel: shortDate(a.date),
            category: a.category,
            readingTime: a.readingTime ?? '',
            cover: imageSrc(a.coverImage, a.legacyCoverImageUrl, 1000) ?? articleArtwork(a.slug)?.src ?? null,
          }))}
          allLabel={page?.allLabel ?? ''}
          readMore={page?.readMoreLabel ?? ''}
          searchPlaceholder={page?.searchPlaceholder ?? ''}
          noResultsHeading={page?.noResultsHeading ?? ''}
          noResultsBody={page?.noResultsBody ?? ''}
        />
      </section>
    </>
  )
}
