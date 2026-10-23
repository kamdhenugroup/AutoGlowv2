import Image from 'next/image'
import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {BRANDKIT_QUERY} from '@/sanity/queries'
import {pageMetadata} from '@/lib/seo'
import {Eyebrow, Section} from '@/components/ui'

const getPage = () => sanityFetch({query: BRANDKIT_QUERY, tags: ['brandkitPage']})

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await getPage())?.seo, '/brandkit')
}

export default async function BrandKitPage() {
  const p = await getPage()
  if (!p) return null
  return (
    <>
      <section className="wrap pt-[clamp(56px,8vw,112px)] pb-[clamp(48px,6vw,80px)]">
        <Eyebrow>{p.eyebrow}</Eyebrow>
        <h1 className="display mt-5 text-[clamp(56px,8vw,120px)]">{p.heading}</h1>
        <p className="mt-6 max-w-[640px] text-[19px] leading-relaxed text-body">{p.intro}</p>
      </section>

      <section className="wrap">
        <ul className="grid gap-px border border-line bg-line md:grid-cols-3">
          {p.principles?.map((x) => (
            <li key={x._key} className="bg-paper p-8">
              <h2 className="text-[22px] font-medium">{x.title}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-body">{x.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <Eyebrow>{p.logoEyebrow}</Eyebrow>
            <h2 className="display mt-4 text-[clamp(32px,3.4vw,48px)]">{p.logoHeading}</h2>
            <p className="mt-5 text-[17px] leading-relaxed text-body">{p.logoBody}</p>
            <p className="mt-5 text-[15px] font-medium">{p.logoMinWidth}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            <div className="grid aspect-[4/3] place-items-center rounded-sm border border-line bg-paper p-10">
              <Image
                src="/autoglow-logo.png"
                alt="AutoGlow logo on white"
                width={1249}
                height={377}
                className="h-auto w-full max-w-[280px]"
              />
            </div>
            <div className="grid aspect-[4/3] place-items-center rounded-sm bg-mist p-10">
              <Image
                src="/autoglow-logo.png"
                alt="AutoGlow logo on grey"
                width={1249}
                height={377}
                className="h-auto w-full max-w-[280px]"
              />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <h2 className="display text-[clamp(32px,3.4vw,48px)]">{p.paletteHeading}</h2>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {p.palette?.map((c) => (
            <li key={c._key}>
              <div className="aspect-[4/3] rounded-sm border border-line" style={{background: c.hex ?? undefined}} />
              <p className="mt-3 text-[15px] font-medium">{c.name}</p>
              <p className="text-[14px] text-muted">{c.hex}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="divide-y divide-line border-y border-line">
          {p.typography?.map((t) => (
            <div key={t._key} className="grid gap-4 py-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                {t.eyebrow && <Eyebrow>{t.eyebrow}</Eyebrow>}
                <h2 className="mt-2 text-[24px] font-medium">{t.name}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{t.usage}</p>
              </div>
              <p className="text-[clamp(20px,2vw,28px)] leading-snug break-words lg:col-span-8">{t.sample}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="mist">
        <h2 className="display text-[clamp(32px,3.4vw,48px)]">{p.voiceHeading}</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {p.voice?.map((v) => (
            <article key={v._key} className="rounded-sm bg-paper p-8">
              <h3 className="text-[22px] font-medium">{v.title}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-body">{v.body}</p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="border-t-2 border-[#1f9d55] pt-3">
                  <dt className="text-[14px] font-medium">Do:</dt>
                  <dd className="mt-1 text-[15px]">{v.doExample}</dd>
                </div>
                <div className="border-t-2 border-logo-red pt-3">
                  <dt className="text-[14px] font-medium">Don&apos;t:</dt>
                  <dd className="mt-1 text-[15px]">{v.dontExample}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </Section>
    </>
  )
}
