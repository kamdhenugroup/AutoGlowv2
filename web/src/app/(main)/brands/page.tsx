import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {BRANDS_PAGE_QUERY} from '@/sanity/queries'
import {urlFor} from '@/sanity/image'
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
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((b) => (
            <li key={b._id} className="flex items-center gap-4 rounded-sm bg-mist px-6 py-8">
              {b.logo?.asset && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urlFor(b.logo).width(160).url()} alt="" className="h-7 w-auto opacity-80 grayscale" loading="lazy" />
              )}
              <span className="display text-[clamp(24px,2.6vw,34px)] tracking-[-0.02em]">{b.name}</span>
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
