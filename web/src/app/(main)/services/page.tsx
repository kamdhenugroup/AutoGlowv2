import Image from 'next/image'
import Link from 'next/link'
import type {Metadata} from 'next'
import {getServices, getServicesPage} from '@/lib/data'
import {imageSrc} from '@/sanity/image'
import {pageMetadata} from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await getServicesPage())?.seo, '/services')
}

export default async function ServicesPage() {
  const [page, services] = await Promise.all([getServicesPage(), getServices()])
  return (
    <>
      <section className="wrap pt-[clamp(56px,8vw,112px)] pb-[clamp(48px,6vw,80px)]">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h1 className="display text-[clamp(46px,7.6vw,112px)] lg:col-span-7">{page?.heading}</h1>
          <p className="max-w-[460px] text-[18px] leading-relaxed text-body lg:col-span-5 lg:pb-3">{page?.intro}</p>
        </div>
      </section>

      <section className="wrap pb-[clamp(72px,10vw,144px)]">
        <ul className="space-y-2">
          {services.map((s) => {
            const src = imageSrc(s.image, s.legacyImageUrl, 900)
            return (
              <li key={s._id} className="rounded-sm bg-mist transition-colors hover:bg-[#e9ebee]">
                <Link href={`/services/${s.slug}`} className="group grid items-center gap-6 p-4 md:grid-cols-12 md:gap-8 md:p-5">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-mist md:col-span-3">
                    {src && (
                      <Image
                        src={src}
                        alt={s.image?.alt || s.title || ''}
                        fill
                        sizes="(min-width: 768px) 25vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="md:col-span-6">
                    <h2 className="display text-[clamp(24px,2.6vw,34px)] tracking-[-0.025em]">{s.title}</h2>
                    <p className="mt-3 max-w-[520px] text-[18px] leading-relaxed text-body">{s.oneLiner}</p>
                    {s.isGlanzPro && (
                      <span className="mt-4 inline-block rounded-full bg-paper px-3 py-1 text-[15px] font-medium">{page?.glanzProBadge}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-4 md:col-span-3 md:items-end md:text-right">
                    {s.warranty && (
                      <p className="text-[15px] text-muted">
                        {page?.warrantyLabel} <span className="text-ink">{s.warranty}</span>
                      </p>
                    )}
                    <span className="link-underline text-[18px] font-medium">{page?.exploreLabel}</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}
