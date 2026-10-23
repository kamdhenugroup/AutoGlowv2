import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {LANDING_QUERY} from '@/sanity/queries'
import {getLocations, getServices} from '@/lib/data'
import {pageMetadata} from '@/lib/seo'
import {Stats} from '@/components/blocks'
import {Eyebrow, SmartLink} from '@/components/ui'
import {LandingForm} from './LandingForm'

const getPage = () => sanityFetch({query: LANDING_QUERY, tags: ['landingPage']})

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await getPage())?.seo, '/landing')
}

export default async function LandingPage() {
  const [p, locations, services] = await Promise.all([getPage(), getLocations(), getServices()])
  if (!p) return null
  const [before, after] =
    p.headingHighlight && p.heading?.includes(p.headingHighlight) ? p.heading.split(p.headingHighlight) : [p.heading, null]

  return (
    <>
      <section className="wrap grid gap-12 pt-[clamp(40px,6vw,88px)] pb-[clamp(56px,8vw,112px)] lg:grid-cols-12 lg:gap-16">
        <div className="order-last lg:order-none lg:col-span-7">
          <h1 className="display text-[clamp(36px,4.8vw,68px)] leading-[1.02]">
            {before}
            {after !== null && (
              <>
                <span className="underline decoration-logo-red decoration-2 underline-offset-[0.14em]">{p.headingHighlight}</span>
                {after}
              </>
            )}
          </h1>
          <p className="mt-6 max-w-[620px] text-[18px] leading-relaxed text-body">{p.intro}</p>
          {p.stats && <Stats stats={p.stats} className="mt-10" />}
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {p.features?.map((f) => (
              <li key={f._key} className="rounded-sm bg-mist p-6">
                <h2 className="text-[18px] font-medium">{f.title}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5">
          <div className="rounded-sm border border-line p-[clamp(24px,3vw,40px)] shadow-[0_24px_64px_-32px_rgba(3,21,51,0.3)] lg:sticky lg:top-8">
            <Eyebrow>{p.formEyebrow}</Eyebrow>
            <h2 className="display mt-3 text-[clamp(24px,2.6vw,34px)]">{p.formHeading}</h2>
            <p className="mt-2 text-[15px] text-body">{p.formIntro}</p>
            <div className="mt-8">
              <LandingForm
                studios={locations.filter((l) => l.whatsapp).map((l) => ({city: l.city ?? '', whatsapp: l.whatsapp ?? ''}))}
                services={services.map((s) => ({slug: s.slug ?? '', title: s.title ?? ''}))}
                labels={p.formLabels ?? []}
                suffix={p.locationOptionSuffix ?? ''}
                carPlaceholder={p.carPlaceholder ?? ''}
                namePlaceholder={p.namePlaceholder ?? ''}
                phonePrefix={p.phonePrefix ?? ''}
                phonePlaceholder={p.phonePlaceholder ?? ''}
                submit={p.submitLabel ?? ''}
                errorRequired={p.errorRequired ?? ''}
                errorPhone={p.errorPhone ?? ''}
                successHeading={p.successHeading ?? ''}
                successBody={p.successBody ?? ''}
                successButton={p.successButton ?? ''}
                source={p.leadSource ?? ''}
                template={p.whatsappMessage ?? ''}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist py-[clamp(72px,10vw,128px)]">
        <div className="wrap">
          <Eyebrow>{p.galleryEyebrow}</Eyebrow>
          <h2 className="display mt-4 max-w-[800px] text-[clamp(36px,4.8vw,68px)]">{p.galleryHeading}</h2>
          <p className="mt-4 max-w-[560px] text-[18px] text-body">{p.galleryIntro}</p>
          <ul className="mt-10 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {p.galleryEmbeds?.map((src) => (
              <li key={src} className="relative aspect-[9/16] overflow-hidden rounded-sm bg-paper">
                <iframe
                  src={src}
                  title={p.galleryHeading ?? 'Video'}
                  loading="lazy"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="wrap flex flex-col gap-4 border-t border-line py-8 text-[15px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{p.copyright}</p>
        <ul className="flex gap-6">
          {p.footerLinks?.map((l) => (
            <li key={l._key}>
              <SmartLink href={l.href ?? '/'} className="hover:text-ink">
                {l.label}
              </SmartLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
