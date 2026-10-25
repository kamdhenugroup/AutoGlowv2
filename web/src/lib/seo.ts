import type {Metadata} from 'next'
import {getSettings} from '@/lib/data'

export const SITE_URL = 'https://autoglowcare.in'

type Seo =
  | {title?: string | null; description?: string | null; canonical?: boolean | null; twitter?: boolean | null; noindex?: boolean | null}
  | null
  | undefined

/** The share image drawn for a page by app/og (1200 x 630 JPEG). */
export const ogImagePath = (path: string) => (path === '/' ? '/og' : `/og${path}`)

/**
 * Complete Open Graph and X card tags for a page. Next replaces (not merges) the layout's
 * openGraph/twitter objects when a page sets its own, so every page gets the full set here:
 * site name, locale, its own URL and its own share image.
 */
export async function social({
  path,
  title,
  description,
  type = 'website',
  publishedTime,
  authors,
}: {
  path: string
  title?: string | null
  description?: string | null
  type?: 'website' | 'article'
  publishedTime?: string | null
  authors?: string[]
}): Promise<Pick<Metadata, 'openGraph' | 'twitter'>> {
  const s = await getSettings()
  const t = title || s.defaultTitle || undefined
  const d = description || s.defaultDescription || undefined
  const image = {url: ogImagePath(path), width: 1200, height: 630, alt: t, type: 'image/jpeg'}
  return {
    openGraph: {
      type,
      title: t,
      description: d,
      url: `${SITE_URL}${path === '/' ? '' : path}`,
      siteName: s.siteName ?? 'AutoGlow',
      locale: s.locale ?? 'en_IN',
      images: [image],
      ...(type === 'article' ? {publishedTime: publishedTime ?? undefined, authors} : {}),
    },
    twitter: {card: 'summary_large_image', title: t, description: d, images: [image.url]},
  }
}

/**
 * Title, description, canonical and robots in the same shape the previous site emitted, so
 * what search engines index does not change; plus complete share tags for every page.
 * Empty SEO keeps the layout's default title and description.
 */
export async function pageMetadata(seo: Seo, path: string): Promise<Metadata> {
  const title = seo?.title ?? undefined
  const description = seo?.description ?? undefined
  const meta: Metadata = {...(title ? {title} : {}), ...(description ? {description} : {}), ...(await social({path, title, description}))}
  if (seo?.canonical) meta.alternates = {canonical: path}
  if (seo?.noindex) meta.robots = {index: false, follow: true}
  return meta
}

export function jsonLd(data: unknown) {
  // Escape "<" so content can never close the script tag.
  return {__html: JSON.stringify(data).replace(/</g, '\\u003c')}
}
