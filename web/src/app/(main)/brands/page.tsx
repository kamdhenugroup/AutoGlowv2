import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {BRANDS_PAGE_QUERY} from '@/sanity/queries'
import {originalUrl} from '@/sanity/image'
import {getBrands} from '@/lib/data'
import {pageMetadata} from '@/lib/seo'

const getPage = () => sanityFetch({query: BRANDS_PAGE_QUERY, tags: ['brandsPage']})

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await getPage())?.seo, '/brands')
}

export default async function BrandsPage() {
  const [p, brands] = await Promise.all([getPage(), getBrands()])
  return (
    <>
      <section className="wrap pt-[clamp(56px,8vw,112px)] pb-[clamp(48px,6vw,80px)]">
        <h1 className="display max-w-[1000px] text-[clamp(46px,7.6vw,112px)]">{p?.heading}</h1>
        <p className="mt-8 max-w-[600px] text-[18px] leading-relaxed text-body">{p?.intro}</p>
      </section>

      <section className="wrap" aria-label="Brands">
        <ul className="grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((b) => (
            <li key={b._id} className="flex flex-col justify-between gap-6 rounded-sm bg-mist p-5 sm:aspect-[5/3] md:p-8">
              {/* Fixed-height logo box, so every name sits on the same line. */}
              <span className="flex h-12 items-center md:h-16">
                {b.logo?.asset && (
                  // eslint-disable-next-line @next/next/no-img-element -- vector logo served as-is
                  <img src={originalUrl(b.logo)!} alt="" width={64} height={64} className="max-h-full w-auto max-w-[70%]" loading="lazy" />
                )}
              </span>
              <span className="text-[17px] leading-snug font-medium tracking-[-0.01em] md:text-[22px]">{b.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap py-[clamp(72px,10vw,144px)]">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8 lg:col-start-5">
            {p?.body?.map((t, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? 'display text-[clamp(24px,2.6vw,34px)] leading-[1.25] tracking-[-0.02em]'
                    : 'max-w-[680px] text-[18px] leading-[1.7] text-body'
                }
              >
                {t}
              </p>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
