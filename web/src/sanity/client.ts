import {createClient, type QueryParams} from 'next-sanity'
import type {SanityQueries} from '@sanity/client'
import {apiVersion, dataset, projectId} from './env'

// No API CDN: Next caches every response and only asks Sanity again when the webhook fires, so
// requests are few; the CDN's purge delay could make a refresh fetch the version just replaced.
export const client = createClient({projectId, dataset, apiVersion, useCdn: false, perspective: 'published'})

type Result<Q extends string> = Q extends keyof SanityQueries ? SanityQueries[Q] : unknown

/**
 * Cached fetch. Pages are static and refreshed by the Sanity webhook (/api/revalidate),
 * which revalidates by tag. The hourly fallback covers a missed webhook.
 */
export async function sanityFetch<const Q extends string>({
  query,
  params = {},
  tags,
}: {
  query: Q
  params?: QueryParams
  tags: string[]
}): Promise<Result<Q>> {
  return client.fetch(query, params, {next: {revalidate: 3600, tags: ['sanity', ...tags]}}) as Promise<Result<Q>>
}
