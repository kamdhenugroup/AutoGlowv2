import Image from 'next/image'
import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {ABOUT_QUERY} from '@/sanity/queries'
import {imageSrc} from '@/sanity/image'
import {pageMetadata} from '@/lib/seo'
import {Section} from '@/components/ui'

const getPage = () => sanityFetch({query: ABOUT_QUERY, tags: ['aboutPage']})

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await getPage())?.seo, '/about')
}

export default async function AboutPage() {
  const p = await getPage()
  if (!p) return null
  const img = imageSrc(p.image, '/placeholder/bwstudio.jpg', 2400)!
  return (
    <>
      <section className="wrap pt-[clamp(56px,8vw,112px)] pb-[clamp(48px,6vw,88px)]">
        <h1 className="display max-w-[1100px] text-[clamp(46px,7.6vw,112px)]">{p.heading}</h1>
        <p className="mt-8 max-w-[640px] text-[18px] leading-relaxed text-body md:text-[22px]">{p.intro}</p>
      </section>

      <div className="relative h-[clamp(320px,46vw,680px)] overflow-hidden bg-mist">
        <div data-parallax="0.14" className="absolute inset-0 will-change-transform">
          <Image src={img} alt={p.image?.alt ?? ''} fill priority sizes="100vw" className="object-cover" />
        </div>
      </div>

      <Section>
        <div className="grid gap-8 lg:grid-cols-12">
          <p className="text-[22px] font-medium lg:col-span-4 lg:pt-3">{p.legacyEyebrow}</p>
          <div className="lg:col-span-8">
            <h2 className="display text-[clamp(36px,4.8vw,68px)]">{p.legacyHeading}</h2>
            <div className="mt-8 space-y-6">
              {p.legacyBody?.map((t, i) => (
                <p key={i} className="max-w-[680px] text-[18px] leading-[1.7] text-body">
                  {t}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <section className="bg-mist">
        <div className="wrap py-[clamp(72px,10vw,144px)]">
          <blockquote className="display max-w-[900px] text-[clamp(24px,2.6vw,34px)] leading-[1.2] tracking-[-0.025em]">
            {p.quote}
          </blockquote>
        </div>
      </section>

      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          {p.pillars?.map((x) => (
            <div key={x._key}>
              <h2 className="text-[22px] font-medium">{x.title}</h2>
              <p className="mt-4 max-w-[520px] text-[18px] leading-[1.7] text-body">{x.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
