import {ImageResponse} from 'next/og'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import sharp from 'sharp'
import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'
import {sanityFetch} from '@/sanity/client'
import {dataset, projectId} from '@/sanity/env'
import {OG_PAGES_QUERY} from '@/sanity/queries'

/**
 * Share images (Open Graph / X cards), one per page: the page's own photo under a navy
 * gradient, the logo and the page title. 1200 x 630 JPEG, so WhatsApp, LinkedIn, Facebook
 * and X all show them. Built at deploy time and rebuilt when the Sanity webhook fires.
 * Served from /og (not /api, which robots.txt closes to crawlers such as Twitterbot).
 */

export const dynamicParams = false

// The Sanity webhook revalidates by document type, so the images refresh with any of these.
const OG_TAGS = ['homePage', 'service', 'article', 'aboutPage', 'servicesPage', 'brandsPage', 'articlesPage', 'bookInspectionPage', 'whatsappPage', 'privacyPage', 'termsPage']

const W = 1200
const H = 630
const assets = join(process.cwd(), 'src/app/og/assets')
const fonts = Promise.all([readFile(join(assets, 'mona-sans-latin-400-normal.woff')), readFile(join(assets, 'mona-sans-latin-500-normal.woff'))])
const logo = readFile(join(assets, 'logo.png')).then((b) => `data:image/png;base64,${b.toString('base64')}`)

const builder = createImageUrlBuilder({projectId, dataset})
type Img = {asset?: {_ref?: string} | null} | null | undefined
/** A JPEG crop at share size: the image renderer reads JPEG and PNG, not WebP. */
function photo(image: Img, legacy?: string | null) {
  if (image?.asset?._ref)
    return builder
      .image(image as SanityImageSource)
      .width(W)
      .height(H)
      .fit('crop')
      .format('jpg')
      .quality(82)
      .url()
  if (legacy?.includes('/image/upload/')) return legacy.replace('/image/upload/', `/image/upload/c_fill,w_${W},h_${H},f_jpg,q_82/`)
  return legacy || null
}

type Card = {eyebrow: string; title: string; image: string | null}

async function card(slug: string[]): Promise<Card | null> {
  const d = await sanityFetch({query: OG_PAGES_QUERY, tags: OG_TAGS})
  const home = photo(d.home?.hero?.image)
  const [section, item] = slug
  if (!section) return {eyebrow: 'Luxury car protection · Ahmedabad · Kochi · UAE', title: (d.home?.hero?.headingLines ?? []).join(' '), image: home}
  if (section === 'services' && item) {
    const s = d.services.find((x) => x.slug === item)
    return s ? {eyebrow: s.isGlanzPro ? 'GlanzPro · Service' : 'Service', title: s.title ?? '', image: photo(s.image, s.legacyImageUrl) ?? home} : null
  }
  if (section === 'articles' && item) {
    const a = d.articles.find((x) => x.slug === item)
    return a ? {eyebrow: a.category ? `Article · ${a.category}` : 'Article', title: a.title ?? '', image: photo(a.coverImage, a.legacyCoverImageUrl) ?? home} : null
  }
  const pages: Record<string, Card> = {
    services: {eyebrow: 'Services', title: d.servicesPage?.heading ?? 'Services', image: photo(d.home?.glanzPro?.image) ?? home},
    about: {eyebrow: 'About', title: d.aboutPage?.heading ?? 'About AutoGlow', image: photo(d.aboutPage?.image) ?? home},
    brands: {eyebrow: 'Brands', title: d.brandsPage?.heading ?? 'Brands', image: home},
    locations: {eyebrow: 'Studios', title: 'Ahmedabad · Kochi · Dubai · Abu Dhabi', image: photo(d.aboutPage?.image) ?? home},
    articles: {eyebrow: 'Articles', title: d.articlesPage?.heading ?? 'Articles', image: home},
    'book-inspection': {eyebrow: 'Book an inspection', title: d.bookPage?.heading ?? 'Book Inspection', image: home},
    whatsapp: {eyebrow: 'WhatsApp', title: d.whatsappPage?.heading ?? 'Chat with AutoGlow', image: home},
    landing: {eyebrow: 'AutoGlow', title: (d.home?.hero?.headingLines ?? []).join(' '), image: home},
    privacy: {eyebrow: 'Legal', title: d.privacyPage?.heading ?? 'Privacy Policy', image: home},
    terms: {eyebrow: 'Legal', title: d.termsPage?.heading ?? 'Terms & Conditions', image: home},
    brandkit: {eyebrow: 'Brand Kit', title: 'How AutoGlow looks, sounds and signs its work.', image: home},
  }
  return item ? null : (pages[section] ?? null)
}

export async function generateStaticParams() {
  const d = await sanityFetch({query: OG_PAGES_QUERY, tags: OG_TAGS})
  return [
    {slug: []},
    ...['services', 'about', 'brands', 'locations', 'articles', 'book-inspection', 'whatsapp', 'landing', 'privacy', 'terms', 'brandkit'].map((s) => ({
      slug: [s],
    })),
    ...d.services.map((s) => ({slug: ['services', s.slug ?? '']})),
    ...d.articles.map((a) => ({slug: ['articles', a.slug ?? '']})),
  ]
}

export async function GET(_req: Request, {params}: {params: Promise<{slug?: string[]}>}) {
  const {slug = []} = await params
  const c = await card(slug)
  if (!c) return new Response('Not found', {status: 404})
  const [[regular, medium], logoSrc] = await Promise.all([fonts, logo])
  const size = c.title.length > 70 ? 50 : c.title.length > 44 ? 58 : 68

  const png = new ImageResponse(
    <div style={{width: W, height: H, display: 'flex', position: 'relative', background: '#031533', fontFamily: 'Mona Sans'}}>
      {c.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.image} width={W} height={H} alt="" style={{position: 'absolute', top: 0, left: 0, width: W, height: H, objectFit: 'cover'}} />
      )}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: W,
          height: H,
          display: 'flex',
          background: 'linear-gradient(90deg, rgba(3,21,51,0.96) 0%, rgba(3,21,51,0.86) 42%, rgba(3,21,51,0.35) 78%, rgba(3,21,51,0.2) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: W,
          height: H,
          display: 'flex',
          background: 'linear-gradient(0deg, rgba(3,21,51,0.8) 0%, rgba(3,21,51,0) 28%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: W,
          height: H,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          color: '#ffffff',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={240} height={69} alt="" />
        <div style={{display: 'flex', flexDirection: 'column', maxWidth: 820}}>
          <div style={{fontSize: 24, fontWeight: 500, color: '#c5cad2', letterSpacing: '0.01em'}}>{c.eyebrow}</div>
          <div style={{fontSize: size, fontWeight: 500, lineHeight: 1.06, letterSpacing: '-0.025em', marginTop: 18}}>{c.title}</div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 22, color: '#dce0e6'}}>
          <span>autoglowcare.in</span>
          <span style={{display: 'flex', alignItems: 'center'}}>
            <span style={{width: 10, height: 10, borderRadius: 10, background: '#cd2b34', marginRight: 12}} />A Kamdhenu Group company
          </span>
        </div>
      </div>
    </div>,
    {
      width: W,
      height: H,
      fonts: [
        {name: 'Mona Sans', data: regular, weight: 400, style: 'normal'},
        {name: 'Mona Sans', data: medium, weight: 500, style: 'normal'},
      ],
    },
  )
  const jpg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({quality: 84, mozjpeg: true})
    .toBuffer()
  return new Response(new Uint8Array(jpg), {
    headers: {'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'},
  })
}
