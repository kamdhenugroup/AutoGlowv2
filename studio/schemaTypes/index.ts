import {seo} from './objects/seo'
import {faq, feature, imageWithAlt, link, richText, stat} from './objects/shared'
import {article} from './documents/article'
import {brand} from './documents/brand'
import {location} from './documents/location'
import {service} from './documents/service'
import {siteSettings} from './singletons/siteSettings'
import {singletonTypes} from './singletons/pages'

export const schemaTypes = [
  seo,
  link,
  faq,
  feature,
  stat,
  imageWithAlt,
  richText,
  service,
  article,
  location,
  brand,
  siteSettings,
  ...singletonTypes,
]

/** Document types that exist exactly once, with the document ID equal to the type name. */
export const SINGLETONS = ['siteSettings', ...singletonTypes.map((t) => t.name)]
