import type {Metadata} from 'next'

export const SITE_URL = 'https://autoglowcare.in'

type Seo =
  | {title?: string | null; description?: string | null; canonical?: boolean | null; twitter?: boolean | null; noindex?: boolean | null}
  | null
  | undefined

/**
 * Page metadata in the same shape the previous site emitted, so the tags search engines
 * see do not change at cutover. Empty SEO falls back to the layout defaults entirely.
 */
export function pageMetadata(seo: Seo, path: string): Metadata {
  if (!seo?.title && !seo?.description) return seo?.noindex ? {robots: {index: false, follow: true}} : {}
  const title = seo.title ?? undefined
  const description = seo.description ?? undefined
  const meta: Metadata = {
    title,
    description,
    openGraph: {title, description, ...(seo.canonical ? {url: `${SITE_URL}${path === '/' ? '/' : path}`} : {})},
  }
  if (seo.canonical) meta.alternates = {canonical: path}
  if (seo.twitter) meta.twitter = {title, description}
  if (seo.noindex) meta.robots = {index: false, follow: true}
  return meta
}

export function jsonLd(data: unknown) {
  // Escape "<" so content can never close the script tag.
  return {__html: JSON.stringify(data).replace(/</g, '\\u003c')}
}
