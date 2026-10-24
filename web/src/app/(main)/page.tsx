import Image from 'next/image'
import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {HOME_QUERY} from '@/sanity/queries'
import {imageSrc} from '@/sanity/image'
import {getBrands, getLocations, getServices} from '@/lib/data'
import {pageMetadata} from '@/lib/seo'
import {ServiceCardItem, Stats, StudioCard} from '@/components/blocks'
import {Button, Section, TextLink} from '@/components/ui'

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
  const heroMobileSrc = hero?.mobileImage?.asset ? imageSrc(hero.mobileImage, undefined, 1200) : null
  const glanzSrc = imageSrc(glanzPro?.image, '/placeholder/whiteroom.jpg', 1800)!

  return (
    <>
      {/* Hero */}
      <section
        data-hero
        className="relative isolate flex min-h-[max(640px,100svh)] flex-col justify-end overflow-hidden bg-[#05070b] text-paper"
      >
        <div data-hero-media className="absolute inset-0 -z-10 origin-top will-change-transform">
          <Image
            src={heroSrc}
            alt={hero?.image?.alt ?? ''}
            fill
            priority
            sizes="100vw"
            className={`animate-settle object-cover object-[60%_50%] ${heroMobileSrc ? 'max-md:hidden' : ''}`}
          />
          {heroMobileSrc && (
            <Image
              src={heroMobileSrc}
              alt={hero?.mobileImage?.alt ?? hero?.image?.alt ?? ''}
              fill
              priority
              sizes="100vw"
              className="animate-settle object-cover md:hidden"
            />
          )}
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-black/30" aria-hidden="true" />
        <div
          data-hero-copy
          className="wrap flex flex-col gap-10 pb-[124px] md:pb-[clamp(40px,7vw,96px)] lg:flex-row lg:items-end lg:justify-between"
        >
          <h1 className="display text-[clamp(46px,7.6vw,112px)]">
            {hero?.headingLines?.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
          <div className="max-w-[400px] lg:pb-3">
            <p className="text-[18px] leading-relaxed text-[#dce0e6]">{hero?.subheading}</p>
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
          <h2 className="text-[22px] font-medium lg:col-span-4">{standard?.eyebrow}</h2>
          <div className="lg:col-span-8">
            <p className="display max-w-[880px] text-[clamp(24px,2.2vw,30px)] leading-[1.25] tracking-[-0.02em]">{standard?.statement}</p>
            <p className="mt-8 max-w-[560px] text-[18px] leading-relaxed text-body">{standard?.tagline}</p>
            {home.stats && <Stats stats={home.stats} className="mt-14" />}
            {standard?.link?.href && (
              <TextLink href={standard.link.href} className="mt-12 inline-block">
                {standard.link.label}
              </TextLink>
            )}
          </div>
        </div>
      </Section>

      {/* Brands: a row that runs on its own and answers the scroll */}
      {brands.length > 0 && (
        <section className="overflow-hidden pb-[clamp(72px,10vw,144px)]" aria-labelledby="brands-heading">
          <div className="wrap">
            <h2 id="brands-heading" className="text-[22px] font-medium">
              {home.brandsHeading}
            </h2>
          </div>
          <div className="mt-10 motion-reduce:wrap">
            <div data-marquee className="flex w-max will-change-transform motion-reduce:w-auto">
              {[0, 1].map((copy) => (
                <ul
                  key={copy}
                  aria-hidden={copy === 1 || undefined}
                  className={`display flex shrink-0 gap-x-[clamp(32px,4vw,64px)] pr-[clamp(32px,4vw,64px)] text-[clamp(36px,4.8vw,68px)] whitespace-nowrap text-ink motion-reduce:flex-wrap motion-reduce:gap-y-2 motion-reduce:whitespace-normal ${copy === 1 ? 'motion-reduce:hidden' : ''}`}
                >
                  {brands.map((b) => (
                    <li key={b._id}>{b.name}</li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our Discipline: pinned on desktop, the row travels sideways as the page scrolls */}
      <section data-rail className="relative bg-mist" aria-labelledby="services-heading">
        <div className="flex flex-col justify-center overflow-hidden py-[clamp(72px,10vw,144px)] lg:sticky lg:top-0 lg:h-svh lg:py-0">
          <div className="wrap flex items-end justify-between gap-6">
            <h2 id="services-heading" className="display text-[clamp(36px,4.8vw,68px)]">
              {home.servicesHeading}
            </h2>
            {home.servicesLink?.href && (
              <TextLink href={home.servicesLink.href} className="mb-2">
                {home.servicesLink.label}
              </TextLink>
            )}
          </div>
          <ul
            data-rail-track
            aria-label={home.servicesHeading ?? 'Services'}
            className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scroll-padding-inline:clamp(20px,5.5vw,80px)] [padding-inline:clamp(20px,5.5vw,80px)] md:gap-5 lg:mt-14 lg:snap-none lg:overflow-visible lg:will-change-transform"
          >
            {services.map((s) => (
              <li key={s._id} className="w-[76vw] max-w-[400px] shrink-0 snap-start sm:w-[320px] lg:w-[min(30vw,420px)] lg:max-w-none">
                <ServiceCardItem s={s} sizes="(min-width: 1024px) 420px, 76vw" lean />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* GlanzPro */}
      {glanzPro && (
        <Section>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-mist lg:col-span-6">
              <div data-parallax="0.12" className="absolute inset-0 will-change-transform">
                <Image
                  src={glanzSrc}
                  alt={glanzPro.image?.alt ?? ''}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-6">
              <h2 className="display text-[clamp(34px,3.6vw,52px)] leading-[1.04]">{glanzPro.statement}</h2>
              <p className="mt-6 text-[18px] leading-relaxed text-body">{glanzPro.body}</p>
              <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                {glanzPro.features?.map((f) => (
                  <div key={f._key} className="rounded-sm bg-mist p-6">
                    <dt className="text-[18px] font-medium">{f.title}</dt>
                    <dd className="mt-2 text-[18px] leading-relaxed text-body">{f.body}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-[15px] font-medium text-muted">{glanzPro.heading}</p>
            </div>
          </div>
        </Section>
      )}

      {/* Studios */}
      <Section tone="mist">
        <div className="flex items-end justify-between gap-6">
          <h2 className="display text-[clamp(36px,4.8vw,68px)]">{home.studiosHeading}</h2>
          {home.studiosLink?.href && (
            <TextLink href={home.studiosLink.href} className="mb-2">
              {home.studiosLink.label}
            </TextLink>
          )}
        </div>
        <div className="mt-14 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map((l) => (
            <StudioCard key={l._id} l={l} />
          ))}
        </div>
      </Section>
    </>
  )
}
