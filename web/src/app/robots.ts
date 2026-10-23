import type {MetadataRoute} from 'next'
import {SITE_URL} from '@/lib/seo'

/**
 * Production keeps the previous rules. Every other deployment (Vercel previews, staging)
 * is blocked from indexing, so the preview never competes with the live site.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return {rules: {userAgent: '*', disallow: '/'}}
  }
  return {
    rules: {userAgent: '*', allow: '/', disallow: ['/api/']},
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
