import type {MetadataRoute} from 'next'
import {sanityFetch} from '@/sanity/client'
import {ARTICLE_SLUGS_QUERY, SERVICE_SLUGS_QUERY} from '@/sanity/queries'
import {SITE_URL} from '@/lib/seo'

// Same URLs, priorities and change frequencies as the previous sitemap.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, articles] = await Promise.all([
    sanityFetch({query: SERVICE_SLUGS_QUERY, tags: ['service']}),
    sanityFetch({query: ARTICLE_SLUGS_QUERY, tags: ['article']}),
  ])
  const now = new Date()
  return [
    {url: SITE_URL, lastModified: now, changeFrequency: 'monthly', priority: 1},
    {url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.8},
    {url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.8},
    {url: `${SITE_URL}/brands`, lastModified: now, changeFrequency: 'monthly', priority: 0.7},
    {url: `${SITE_URL}/locations`, lastModified: now, changeFrequency: 'yearly', priority: 0.7},
    {url: `${SITE_URL}/book-inspection`, lastModified: now, changeFrequency: 'yearly', priority: 0.8},
    {url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: 'monthly', priority: 0.9},
    ...services.map((slug) => ({
      url: `${SITE_URL}/services/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    ...articles
      .slice()
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || (a.slug ?? '').localeCompare(b.slug ?? ''))
      .map((a) => ({
        url: `${SITE_URL}/articles/${a.slug}`,
        lastModified: new Date(a.date ?? now),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
  ]
}
