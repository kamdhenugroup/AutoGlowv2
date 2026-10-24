import type {MetadataRoute} from 'next'
import {headers} from 'next/headers'
import {SITE_URL} from '@/lib/seo'

/**
 * autoglowcare.in keeps the previous rules. Any other host (vercel.app, previews, staging)
 * is blocked from indexing, so it never competes with the live site.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = ((await headers()).get('host') ?? '').replace(/^www\./, '')
  if (host !== 'autoglowcare.in' && !host.startsWith('localhost')) {
    return {rules: {userAgent: '*', disallow: '/'}}
  }
  return {
    rules: {userAgent: '*', allow: '/', disallow: ['/api/']},
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
