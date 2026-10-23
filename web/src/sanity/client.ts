import {createClient, type QueryParams} from 'next-sanity'
import type {SanityQueries} from '@sanity/client'
import {apiVersion, dataset, projectId} from './env'

export const client = createClient({projectId, dataset, apiVersion, useCdn: true, perspective: 'published'})

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
