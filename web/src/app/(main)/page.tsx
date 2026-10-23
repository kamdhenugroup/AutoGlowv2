import Image from 'next/image'
import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {HOME_QUERY} from '@/sanity/queries'
import {imageSrc} from '@/sanity/image'
import {getBrands, getLocations, getServices} from '@/lib/data'
import {pageMetadata} from '@/lib/seo'
import {Carousel} from '@/components/ServiceCarousel'
import {ServiceCardItem, Stats, StudioCard} from '@/components/blocks'
import {Button, Eyebrow, Section, TextLink} from '@/components/ui'

const getHome = () => sanityFetch({query: HOME_QUERY, tags: ['homePage']})

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHome()
  return pageMetadata(home?.seo, '/')
}

export default async function HomePage() {
  const [home, services, locations, brands] = await Promise.all([getHome(), getServices(), getLocations(), getBrands()])
  if (!home) return null
  const {hero, standard, glanzPro} = home
  const heroSrc = imageSrc(hero?.image, '/placeholder/darkroom.jpg', 2400)!
  const glanzSrc = imageSrc(glanzPro?.image, '/placeholder/whiteroom.jpg', 1800)!

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[max(640px,100svh)] flex-col justify-end overflow-hidden bg-[#05070b] text-paper">
        <Image
          src={heroSrc}
          alt={hero?.image?.alt ?? ''}
          fill
          priority
          sizes="100vw"
          className="animate-settle -z-10 object-cover object-[60%_50%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-black/30" aria-hidden="true" />
        <div className="wrap flex flex-col gap-10 pb-[clamp(40px,7vw,96px)] lg:flex-row lg:items-end lg:justify-between">
          <h1 className="display text-[clamp(54px,8.2vw,124px)]">
            {hero?.headingLines?.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
          <div className="max-w-[400px] lg:pb-3">
            <p className="text-[17px] leading-relaxed text-[#dce0e6] md:text-[18px]">{hero?.subheading}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {hero?.primary?.href && (
                <Button href={hero.primary.href} variant="onImage">
                  {hero.primary.label}
                </Button>
              )}
              {hero?.secondary?.href && (
                <Button href={hero.secondary.href} variant="onImageGhost">
                  {hero.secondary.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* The AutoGlow Standard */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-12">
          <Eyebrow className="lg:col-span-4">{standard?.eyebrow}</Eyebrow>
          <div className="lg:col-span-8">
            <p className="display text-[clamp(28px,3.4vw,46px)] leading-[1.14] tracking-[-0.03em]">{standard?.statement}</p>
            <p className="mt-8 max-w-[560px] text-[18px] leading-relaxed text-body">{standard?.tagline}</p>
            {standard?.link?.href && (
              <TextLink href={standard.link.href} className="mt-8 inline-block">
                {standard.link.label}
              </TextLink>
            )}
            {home.stats && <Stats stats={home.stats} className="mt-16" />}
          </div>
        </div>
      </Section>

      {/* Brands */}
      {brands.length > 0 && (
        <section className="border-y border-line py-12 md:py-14" aria-labelledby="brands-heading">
          <div className="wrap grid gap-6 lg:grid-cols-12">
            <h2 id="brands-heading" className="text-[15px] font-medium text-muted lg:col-span-3">
              {home.brandsHeading}
            </h2>
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-[17px] text-ink md:text-[19px] lg:col-span-9">
              {brands.map((b) => (
                <li key={b._id}>{b.name}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Our Discipline */}
      <section className="overflow-hidden bg-mist py-[clamp(72px,10vw,144px)]" aria-labelledby="services-heading">
        <Carousel
          label={home.servicesHeading ?? 'Services'}
          heading={
            <h2 id="services-heading" className="display text-[clamp(40px,4.6vw,64px)]">
              {home.servicesHeading}
            </h2>
          }
          link={home.servicesLink?.href ? <TextLink href={home.servicesLink.href}>{home.servicesLink.label}</TextLink> : null}
        >
          {services.map((s) => (
            <li key={s._id} className="w-[76vw] max-w-[400px] shrink-0 snap-start sm:w-[320px] lg:w-[400px]">
              <ServiceCardItem s={s} sizes="(min-width: 1024px) 400px, 76vw" />
            </li>
          ))}
        </Carousel>
      </section>

      {/* GlanzPro */}
      {glanzPro && (
        <Section>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-mist lg:col-span-7">
              <Image src={glanzSrc} alt={glanzPro.image?.alt ?? ''} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            </div>
            <div className="lg:col-span-5">
              <Eyebrow>{glanzPro.heading}</Eyebrow>
              <h2 className="display mt-5 text-[clamp(36px,3.8vw,54px)] leading-[1.04]">{glanzPro.statement}</h2>
              <p className="mt-6 text-[17px] leading-relaxed text-body">{glanzPro.body}</p>
              <dl className="mt-8">
                {glanzPro.features?.map((f) => (
                  <div key={f._key} className="border-t border-line py-5">
                    <dt className="text-[18px] font-medium">{f.title}</dt>
                    <dd className="mt-2 text-[15px] leading-relaxed text-body">{f.body}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Section>
      )}

      {/* Studios */}
      <Section tone="mist">
        <div className="flex items-end justify-between gap-6">
          <h2 className="display text-[clamp(40px,4.6vw,64px)]">{home.studiosHeading}</h2>
          {home.studiosLink?.href && (
            <TextLink href={home.studiosLink.href} className="mb-2">
              {home.studiosLink.label}
            </TextLink>
          )}
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map((l) => (
            <StudioCard key={l._id} l={l} />
          ))}
        </div>
      </Section>
    </>
  )
}
