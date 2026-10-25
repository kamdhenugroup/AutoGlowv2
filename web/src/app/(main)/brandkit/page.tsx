import Image from 'next/image'
import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {BRANDKIT_QUERY} from '@/sanity/queries'
import {urlFor} from '@/sanity/image'
import {pageMetadata} from '@/lib/seo'
import {cn, Eyebrow, Section} from '@/components/ui'

const getPage = () => sanityFetch({query: BRANDKIT_QUERY, tags: ['brandkitPage']})

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await getPage())?.seo, '/brandkit')
}

const TILE: Record<string, string> = {
  white: 'bg-paper border border-line',
  mist: 'bg-mist',
  ink: 'bg-ink',
  black: 'bg-black',
}

const SPECIMEN: Record<string, string> = {
  display: 'display text-[clamp(40px,6vw,88px)] leading-[0.95]',
  body: 'text-[clamp(18px,1.6vw,22px)] leading-relaxed text-body',
  label: 'text-[clamp(18px,1.8vw,24px)] font-medium',
}

/** Dark swatches get light text so the name and code stay readable on the colour itself. */
function isDark(hex?: string | null) {
  const m = hex?.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return false
  const [r, g, b] = m.slice(1).map((x) => parseInt(x, 16))
  return 0.299 * r + 0.587 * g + 0.114 * b < 140
}

export default async function BrandKitPage() {
  const p = await getPage()
  if (!p) return null
  return (
    <>
      <section className="wrap pt-[clamp(56px,8vw,112px)] pb-[clamp(48px,6vw,80px)]">
        <Eyebrow>{p.eyebrow}</Eyebrow>
        <h1 className="display mt-5 text-[clamp(46px,7.6vw,112px)]">{p.heading}</h1>
        <p className="mt-6 max-w-[640px] text-[18px] leading-relaxed text-body">{p.intro}</p>
      </section>

      <section className="wrap">
        <ul className="grid gap-px border border-line bg-line md:grid-cols-3">
          {p.principles?.map((x, i) => (
            <li key={x._key} className="bg-paper p-8">
              <p className="text-[15px] font-medium text-muted tabular-nums">0{i + 1}</p>
              <h2 className="mt-6 text-[22px] font-medium">{x.title}</h2>
              <p className="mt-3 text-[18px] leading-relaxed text-body">{x.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Logos */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>{p.logoEyebrow}</Eyebrow>
            <h2 className="display mt-4 text-[clamp(28px,3.2vw,44px)]">{p.logoHeading}</h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-[18px] leading-relaxed text-body">{p.logoBody}</p>
            <p className="mt-5 text-[15px] font-medium">{p.logoMinWidth}</p>
          </div>
        </div>
        {p.logos?.length ? (
          <ul className="mt-14 grid gap-6 md:grid-cols-3">
            {p.logos.map((l) => {
              const asset = l.image?.asset
              const svg = asset?.url?.endsWith('.svg')
              const dims = asset?.metadata?.dimensions
              const src = svg ? asset?.url : l.image ? urlFor(l.image).width(900).url() : null
              return (
                <li key={l._key} className="flex flex-col">
                  <div className={cn('grid aspect-[4/3] place-items-center rounded-sm p-10', TILE[l.tone ?? 'white'])}>
                    {src && (
                      <Image
                        src={src}
                        alt={l.image?.alt ?? ''}
                        width={dims?.width ?? 800}
                        height={dims?.height ?? 300}
                        unoptimized={svg}
                        sizes="(min-width: 768px) 30vw, 80vw"
                        className={cn('h-auto', svg ? 'w-[38%] max-w-[120px]' : 'w-full max-w-[300px]')}
                      />
                    )}
                  </div>
                  <h3 className="mt-5 text-[18px] font-medium">{l.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-body">{l.usage}</p>
                </li>
              )
            })}
          </ul>
        ) : null}
      </Section>

      {/* Colour */}
      <Section tone="mist">
        <h2 className="display text-[clamp(28px,3.2vw,44px)]">{p.paletteHeading}</h2>
        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {p.palette?.map((c) => (
            <li key={c._key} className="flex flex-col overflow-hidden rounded-sm border border-line bg-paper">
              <div
                className={cn(
                  'flex aspect-[4/3] items-end p-4 text-[15px] font-medium uppercase tabular-nums',
                  isDark(c.hex) ? 'text-paper' : 'text-ink',
                )}
                style={{background: c.hex ?? undefined}}
              >
                {c.hex}
              </div>
              <div className="p-4">
                <p className="text-[15px] font-medium">{c.name}</p>
                {c.usage && <p className="mt-1 text-[15px] leading-snug text-muted">{c.usage}</p>}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Type */}
      <Section>
        <div className="divide-y divide-line border-y border-line">
          {p.typography?.map((t) => (
            <div key={t._key} className="grid gap-6 py-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                {t.eyebrow && <Eyebrow>{t.eyebrow}</Eyebrow>}
                <h2 className="mt-2 text-[22px] font-medium">{t.name}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{t.usage}</p>
              </div>
              <p className={cn('break-words lg:col-span-8', SPECIMEN[t.style ?? 'body'] ?? SPECIMEN.body)}>{t.sample}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Photography */}
      {p.photography?.length ? (
        <Section tone="mist">
          <div className="grid gap-8 lg:grid-cols-12">
            <h2 className="display text-[clamp(28px,3.2vw,44px)] lg:col-span-5">{p.photoHeading}</h2>
            <p className="text-[18px] leading-relaxed text-body lg:col-span-7">{p.photoIntro}</p>
          </div>
          <ul className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {p.photography.map((x) => (
              <li key={x._key} className="bg-paper p-7">
                <h3 className="text-[18px] font-medium">{x.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-body">{x.body}</p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Voice */}
      <Section>
        <h2 className="display text-[clamp(28px,3.2vw,44px)]">{p.voiceHeading}</h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {p.voice?.map((v) => (
            <article key={v._key} className="rounded-sm border border-line p-8">
              <h3 className="text-[22px] font-medium">{v.title}</h3>
              <p className="mt-3 text-[18px] leading-relaxed text-body">{v.body}</p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="border-t-2 border-[#1f7a45] pt-3">
                  <dt className="text-[15px] font-medium">Do:</dt>
                  <dd className="mt-1 text-[15px]">{v.doExample}</dd>
                </div>
                <div className="border-t-2 border-logo-red pt-3">
                  <dt className="text-[15px] font-medium">Don&apos;t:</dt>
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
