import {defineQuery} from 'next-sanity'

const LINK = `{label, href}`
const SEO = `seo{title, description, canonical, twitter, noindex}`

export const SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings" && _id == "siteSettings"][0]{
  siteName, siteUrl, logoUrl, logo, email, primaryPhone, parentOrganization, sameAs,
  businessHoursOpens, businessHoursCloses, businessHoursDays,
  mainNav[]{_key, label, href}, headerCta{label, href},
  finalCta{heading, body, primary{label, href}, secondary{label, href}},
  stickyBar, askAi{heading, body, prompt, providers[]{_key, name, urlPrefix}},
  contactPrompt{heading, body, links[]{_key, label, href}},
  newsletter, footerColumns[]{_key, heading, links[]{_key, label, href}},
  legalLinks[]{_key, label, href}, manageCookiesLabel, copyright, companyLine,
  creditText, creditLink{label, href},
  cookieConsent{heading, body, learnMore, accept, prefsHeading, prefsBody, categories[]{_key, title, body}, save, back},
  notFound{heading, body, link{label, href}}, formMessages,
  defaultTitle, defaultDescription, defaultOgImageUrl, defaultOgImageAlt, locale
}`)

const SERVICE_CARD = `_id, title, "slug": slug.current, oneLiner, isGlanzPro, warranty, image, legacyImageUrl`

export const SERVICES_QUERY = defineQuery(`*[_type == "service" && defined(slug.current)] | order(orderRank asc){${SERVICE_CARD}}`)

export const SERVICE_SLUGS_QUERY = defineQuery(`*[_type == "service" && defined(slug.current)].slug.current`)

export const SERVICE_QUERY = defineQuery(`*[_type == "service" && slug.current == $slug][0]{
  ${SERVICE_CARD}, description, seoTitle, ogImageUrl, body, faqs[]{_key, question, answer}, shortsUrls, videoUrl
}`)

export const LOCATIONS_QUERY = defineQuery(`*[_type == "location"] | order(orderRank asc){
  _id, title, city, country, address, shortAddress, hours, phone, whatsapp, website, mapUrl, embedUrl
}`)

export const BRANDS_QUERY = defineQuery(`*[_type == "brand"] | order(orderRank asc){_id, name, "slug": slug.current, logo}`)

const ARTICLE_CARD = `_id, title, "slug": slug.current, description, date, category, author, readingTime, coverImage, legacyCoverImageUrl`

export const ARTICLES_QUERY = defineQuery(
  `*[_type == "article" && defined(slug.current)] | order(date desc, slug.current asc){${ARTICLE_CARD}}`,
)

export const ARTICLE_SLUGS_QUERY = defineQuery(`*[_type == "article" && defined(slug.current)]{"slug": slug.current, date}`)

export const ARTICLE_QUERY = defineQuery(`*[_type == "article" && slug.current == $slug][0]{${ARTICLE_CARD}, tags, body}`)

export const HOME_QUERY = defineQuery(`*[_type == "homePage" && _id == "homePage"][0]{
  hero{headingLines, subheading, primary${LINK}, secondary${LINK}, image, mobileImage},
  standard{eyebrow, statement, tagline, link${LINK}},
  brandsHeading, servicesHeading, servicesLink${LINK},
  glanzPro{label, heading, statement, body, features[]{_key, title, body}, image},
  stats[]{_key, value, suffix, label}, studiosHeading, studiosLink${LINK}, ${SEO}
}`)

export const SERVICES_PAGE_QUERY = defineQuery(
  `*[_type == "servicesPage" && _id == "servicesPage"][0]{heading, intro, warrantyLabel, exploreLabel, glanzProBadge, detail, ${SEO}}`,
)
export const ABOUT_QUERY = defineQuery(
  `*[_type == "aboutPage" && _id == "aboutPage"][0]{heading, intro, legacyEyebrow, legacyHeading, legacyBody, quote, pillars[]{_key, title, body}, image, ${SEO}}`,
)
export const BRANDS_PAGE_QUERY = defineQuery(`*[_type == "brandsPage" && _id == "brandsPage"][0]{heading, intro, body, ${SEO}}`)
export const LOCATIONS_PAGE_QUERY = defineQuery(
  `*[_type == "locationsPage" && _id == "locationsPage"][0]{heading, intro, addressLabel, hoursLabel, contactLabel, whatsappLabel, directionsLabel, ${SEO}}`,
)
export const ARTICLES_PAGE_QUERY = defineQuery(
  `*[_type == "articlesPage" && _id == "articlesPage"][0]{heading, intro, allLabel, readMoreLabel, backLabel, shareLabel, authorLabel, tocLabel, searchPlaceholder, noResultsHeading, noResultsBody, ${SEO}}`,
)
export const BOOK_QUERY = defineQuery(
  `*[_type == "bookInspectionPage" && _id == "bookInspectionPage"][0]{heading, intro, callLabel, callLines[]{_key, label, href}, whatsappLabel, whatsappLink${LINK}, formHeading, formIntro, fields, studiosHeading, hoursHeading, hoursDays, ${SEO}}`,
)
export const WHATSAPP_QUERY = defineQuery(
  `*[_type == "whatsappPage" && _id == "whatsappPage"][0]{eyebrow, heading, intro, studioLabel, chatLabel, backLink${LINK}, ${SEO}}`,
)
export const LANDING_QUERY = defineQuery(`*[_type == "landingPage" && _id == "landingPage"][0]{
  heading, headingHighlight, intro, stats[]{_key, value, suffix, label}, features[]{_key, title, body},
  formEyebrow, formHeading, formIntro, formLabels, locationOptionSuffix, carPlaceholder, namePlaceholder,
  phonePrefix, phonePlaceholder, submitLabel, errorRequired, errorPhone, successHeading, successBody, successButton,
  leadSource, whatsappMessage, galleryEyebrow, galleryHeading, galleryIntro, galleryEmbeds, copyright,
  footerLinks[]{_key, label, href}, ${SEO}
}`)
export const PRIVACY_QUERY = defineQuery(`*[_type == "privacyPage" && _id == "privacyPage"][0]{heading, body, backLink${LINK}, ${SEO}}`)
export const TERMS_QUERY = defineQuery(`*[_type == "termsPage" && _id == "termsPage"][0]{heading, updated, body, backLink${LINK}, ${SEO}}`)
export const BRANDKIT_QUERY = defineQuery(`*[_type == "brandkitPage" && _id == "brandkitPage"][0]{
  eyebrow, heading, intro, principles[]{_key, title, body}, logoEyebrow, logoHeading, logoBody, logoMinWidth,
  logos[]{_key, name, usage, tone, image{alt, asset->{_id, url, metadata{dimensions}}}},
  paletteHeading, palette[]{_key, name, hex, usage}, typography[]{_key, eyebrow, name, usage, sample, style},
  photoHeading, photoIntro, photography[]{_key, title, body},
  voiceHeading, voice[]{_key, title, body, doExample, dontExample}, ${SEO}
}`)

/** Everything the share-image route (app/og) needs, in one request. */
export const OG_PAGES_QUERY = defineQuery(`{
  "home": *[_type == "homePage" && _id == "homePage"][0]{hero{headingLines, image}, glanzPro{image}},
  "services": *[_type == "service" && defined(slug.current)]{title, "slug": slug.current, isGlanzPro, image, legacyImageUrl},
  "articles": *[_type == "article" && defined(slug.current)]{title, "slug": slug.current, category, coverImage, legacyCoverImageUrl},
  "servicesPage": *[_type == "servicesPage" && _id == "servicesPage"][0]{heading},
  "aboutPage": *[_type == "aboutPage" && _id == "aboutPage"][0]{heading, image},
  "brandsPage": *[_type == "brandsPage" && _id == "brandsPage"][0]{heading},
  "articlesPage": *[_type == "articlesPage" && _id == "articlesPage"][0]{heading},
  "bookPage": *[_type == "bookInspectionPage" && _id == "bookInspectionPage"][0]{heading},
  "whatsappPage": *[_type == "whatsappPage" && _id == "whatsappPage"][0]{heading},
  "privacyPage": *[_type == "privacyPage" && _id == "privacyPage"][0]{heading},
  "termsPage": *[_type == "termsPage" && _id == "termsPage"][0]{heading}
}`)
