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

/**
 * The uploaded file exactly as stored, with no transformation. Used for SVG logos: any image
 * parameter makes the CDN rasterise them to a large PNG, which is slow to decode.
 */
export function originalUrl(image: MaybeImage): string | null {
  const ref = image?.asset?._ref
  const m = ref?.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/)
  return m ? `https://cdn.sanity.io/images/${projectId}/${dataset}/${m[1]}-${m[2]}.${m[3]}` : null
}
