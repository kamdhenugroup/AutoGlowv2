import Image from 'next/image'
import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {HOME_QUERY} from '@/sanity/queries'
import {imageSrc} from '@/sanity/image'
import {getBrands, getLocations, getServices} from '@/lib/data'
import {pageMetadata} from '@/lib/seo'
import {Carousel} from '@/components/ServiceCarousel'
import {HeroGL} from '@/components/fx/HeroGL'
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
      <section className="relative isolate flex min-h-[max(640px,100svh)] flex-col justify-end overflow-hidden bg-[#05070b] text-paper">
<div data-hero-media className="absolute inset-0 -z-10 will-change-transform">
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
          <HeroGL />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-black/30" aria-hidden="true" />
        <div data-hero-copy className="wrap flex flex-col gap-10 pb-[124px] md:pb-[clamp(40px,7vw,96px)] lg:flex-row lg:items-end lg:justify-between">
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

      {/* Brands */}
      {brands.length > 0 && (
        <section className="pb-[clamp(72px,10vw,144px)]" aria-labelledby="brands-heading">
          <div className="wrap grid gap-6 lg:grid-cols-12">
            <h2 id="brands-heading" className="text-[22px] font-medium lg:col-span-4">
              {home.brandsHeading}
            </h2>
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-[22px] tracking-[-0.01em] text-ink lg:col-span-8">
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
            <h2 id="services-heading" className="display text-[clamp(36px,4.8vw,68px)]">
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-mist lg:col-span-6">
              <Image src={glanzSrc} alt={glanzPro.image?.alt ?? ''} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
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
