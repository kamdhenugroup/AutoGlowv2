import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {SERVICE_QUERY, SERVICE_SLUGS_QUERY} from '@/sanity/queries'
import {imageSrc} from '@/sanity/image'
import {getServicesPage, getSettings} from '@/lib/data'
import {SITE_URL, jsonLd, social} from '@/lib/seo'
import {Button} from '@/components/ui'
import {YouTubeShort} from '@/components/YouTubeShort'

type Props = {params: Promise<{slug: string}>}

const getService = (slug: string) => sanityFetch({query: SERVICE_QUERY, params: {slug}, tags: ['service', `service:${slug}`]})

export async function generateStaticParams() {
  const slugs = await sanityFetch({query: SERVICE_SLUGS_QUERY, tags: ['service']})
  return slugs.map((slug) => ({slug}))
}
// New services published in Sanity after a deploy are built on first visit (unknown slugs still 404).
export const dynamicParams = true

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const s = await getService(slug)
  if (!s) return {title: 'Service Not Found | AutoGlow'}
  const title = s.seoTitle || `${s.title} in Ahmedabad & Kochi | AutoGlow`
  const description = s.description ?? undefined
  return {
    title,
    description,
    alternates: {canonical: `/services/${s.slug}`},
    ...(await social({path: `/services/${s.slug}`, title, description})),
  }
}

export default async function ServicePage({params}: Props) {
  const {slug} = await params
  const [s, page, settings] = await Promise.all([getService(slug), getServicesPage(), getSettings()])
  if (!s) notFound()
  const d = page?.detail
  const src = imageSrc(s.image, s.legacyImageUrl, 2400)
  const cities = ['Ahmedabad', 'Kochi', 'Dubai', 'Abu Dhabi']

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL},
      {'@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services`},
      {'@type': 'ListItem', position: 3, name: s.title, item: `${SITE_URL}/services/${s.slug}`},
    ],
  }
  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title,
    provider: {'@type': 'AutoBodyShop', name: settings.siteName},
    areaServed: cities.map((name) => ({'@type': 'City', name})),
    description: s.description,
  }
  const faqLd =
    s.faqs && s.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: s.faqs.map((f) => ({'@type': 'Question', name: f.question, acceptedAnswer: {'@type': 'Answer', text: f.answer}})),
        }
      : null

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbs)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(serviceLd)} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqLd)} />}

      <header className="wrap pt-10 pb-[clamp(48px,6vw,88px)]">
        <nav aria-label="Breadcrumb" className="text-[15px] text-muted">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href="/" className="hover:text-ink">
                {d?.breadcrumbHome}
              </Link>
              <span aria-hidden="true"> / </span>
            </li>
            <li>
              <Link href="/services" className="hover:text-ink">
                {d?.breadcrumbServices}
              </Link>
              <span aria-hidden="true"> / </span>
            </li>
            <li aria-current="page" className="text-ink">
              {s.title}
            </li>
          </ol>
        </nav>
        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:items-end">
          <h1 className="display text-[clamp(46px,7.6vw,112px)] lg:col-span-7">{s.title}</h1>
          <div className="lg:col-span-5 lg:pb-2">
            <p className="text-[18px] leading-relaxed text-body md:text-[22px]">{s.oneLiner}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              {s.isGlanzPro && <span className="rounded-full bg-mist px-4 py-2 text-[15px] font-medium">{d?.poweredByLabel}</span>}
              {s.warranty && (
                <p className="text-[15px] text-muted">
                  {page?.warrantyLabel?.replace(/:$/, '')}
                  <span className="block text-[18px] font-medium text-ink">{s.warranty}</span>
                </p>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/book-inspection">
                {d?.ctaButtonPrefix} {s.title}
              </Button>
              <Button href="/whatsapp" variant="secondary">
                {settings.finalCta?.secondary?.label}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {src && (
        <div className="relative h-[clamp(360px,50vw,720px)] w-full overflow-hidden bg-mist">
          <div data-parallax="0.14" className="absolute inset-0 will-change-transform">
            <Image src={src} alt={s.image?.alt || s.title || ''} fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      )}

      <section className="wrap py-[clamp(72px,10vw,144px)]">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-[22px] font-medium lg:sticky lg:top-10">{d?.protocolLabel}</h2>
          </div>
          <div className="space-y-6 lg:col-span-8">
            {s.body?.map((p, i) => {
              // Short paragraphs read as statements; longer ones as body copy.
              const statement = p.length < 90 && !p.endsWith(':')
              return statement ? (
                <p
                  key={i}
                  className={
                    i === 0
                      ? 'display text-[clamp(24px,2.6vw,34px)] leading-[1.15] tracking-[-0.025em]'
                      : 'display pt-8 text-[clamp(24px,2.6vw,34px)] leading-[1.15] tracking-[-0.025em]'
                  }
                >
                  {p}
                </p>
              ) : (
                <p
                  key={i}
                  className={
                    p.endsWith(':') ? 'text-[18px] font-medium leading-[1.7] text-ink' : 'max-w-[680px] text-[18px] leading-[1.7] text-body'
                  }
                >
                  {p}
                </p>
              )
            })}
          </div>
        </div>
      </section>

      {s.faqs && s.faqs.length > 0 && (
        <section className="bg-mist py-[clamp(72px,10vw,144px)]">
          <div className="wrap grid gap-10 lg:grid-cols-12">
            <h2 className="display text-[clamp(24px,2.6vw,34px)] lg:col-span-4">{d?.faqHeading}</h2>
            <div className="space-y-2 lg:col-span-8">
              {s.faqs.map((f, i) => (
                <details key={f._key} className="group rounded-sm bg-paper px-6" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[18px] font-medium [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <span aria-hidden="true" className="relative h-4 w-4 shrink-0">
                      <span className="absolute top-1/2 left-0 h-px w-4 bg-ink" />
                      <span className="absolute top-0 left-1/2 h-4 w-px bg-ink transition-transform group-open:scale-y-0" />
                    </span>
                  </summary>
                  <p className="max-w-[680px] pb-6 text-[18px] leading-relaxed text-body">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="wrap py-[clamp(56px,7vw,96px)]">
        <div className="grid gap-8 rounded-sm bg-mist p-[clamp(28px,4vw,56px)] lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <h2 className="display text-[clamp(24px,2.6vw,34px)]">{d?.ctaHeading}</h2>
            <p className="mt-4 max-w-[560px] text-[18px] leading-relaxed text-body">{d?.ctaBody}</p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Button href="/book-inspection">
              {d?.ctaButtonPrefix} {s.title}
            </Button>
          </div>
        </div>
      </section>

      {s.shortsUrls && s.shortsUrls.length > 0 && (
        <section className="wrap pb-[clamp(72px,10vw,144px)]">
          <h2 className="display text-[clamp(24px,2.6vw,34px)]">{d?.shortsHeading}</h2>
          <ul className="mt-10 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {s.shortsUrls.map((u, i) => (
              <li key={u} className="empty:hidden">
                <YouTubeShort url={u} title={`${s.title} ${i + 1}`} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
