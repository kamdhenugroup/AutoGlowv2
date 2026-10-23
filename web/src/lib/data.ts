import {cache} from 'react'
import {sanityFetch} from '@/sanity/client'
import {ARTICLES_QUERY, BRANDS_QUERY, LOCATIONS_QUERY, SERVICES_QUERY, SERVICES_PAGE_QUERY, SETTINGS_QUERY} from '@/sanity/queries'

// Shared lookups used by the layout and several pages; React's cache dedupes them per request.
export const getSettings = cache(async () => {
  const s = await sanityFetch({query: SETTINGS_QUERY, tags: ['siteSettings']})
  if (!s) throw new Error('Site settings are missing in Sanity.')
  return s
})
export const getServices = cache(() => sanityFetch({query: SERVICES_QUERY, tags: ['service']}))
export const getServicesPage = cache(() => sanityFetch({query: SERVICES_PAGE_QUERY, tags: ['servicesPage']}))
export const getLocations = cache(() => sanityFetch({query: LOCATIONS_QUERY, tags: ['location']}))
export const getBrands = cache(() => sanityFetch({query: BRANDS_QUERY, tags: ['brand']}))
export const getArticles = cache(() => sanityFetch({query: ARTICLES_QUERY, tags: ['article']}))

export type Settings = Awaited<ReturnType<typeof getSettings>>
export type ServiceCard = Awaited<ReturnType<typeof getServices>>[number]
export type Location = Awaited<ReturnType<typeof getLocations>>[number]
export type ArticleCard = Awaited<ReturnType<typeof getArticles>>[number]
