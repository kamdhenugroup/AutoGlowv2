import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'
import {dataset, projectId} from './env'

const builder = createImageUrlBuilder({projectId, dataset})

export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max')
}

type MaybeImage = {asset?: {_ref?: string} | null} | null | undefined

/** Uploaded Sanity image if there is one, otherwise the legacy URL carried over from the old site. */
export function imageSrc(image: MaybeImage, legacyUrl?: string | null, width = 1600): string | null {
  if (image?.asset?._ref)
    return urlFor(image as SanityImageSource)
      .width(width)
      .url()
  return legacyUrl || null
}
