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
          <h1 className="display text-[clamp(52px,7.6vw,112px)] lg:col-span-7">{page?.heading}</h1>
          <p className="max-w-[460px] text-[18px] leading-relaxed text-body lg:col-span-5 lg:pb-3">{page?.intro}</p>
        </div>
      </section>

      <section className="wrap pb-[clamp(72px,10vw,144px)]">
        <ul className="border-t border-ink">
          {services.map((s) => {
            const src = imageSrc(s.image, s.legacyImageUrl, 900)
            return (
              <li key={s._id} className="border-b border-line">
                <Link href={`/services/${s.slug}`} className="group grid items-center gap-6 py-8 md:grid-cols-12 md:gap-8">
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
                    {s.isGlanzPro && (
                      <span className="mb-3 inline-block rounded-full border border-line-strong px-3 py-1 text-[13px] font-medium">
                        {page?.glanzProBadge}
                      </span>
                    )}
                    <h2 className="display text-[clamp(28px,3vw,40px)] tracking-[-0.025em]">{s.title}</h2>
                    <p className="mt-3 max-w-[520px] text-[16px] leading-relaxed text-body">{s.oneLiner}</p>
                  </div>
                  <div className="flex flex-col gap-4 md:col-span-3 md:items-end md:text-right">
                    {s.warranty && (
                      <p className="text-[14px] text-muted">
                        {page?.warrantyLabel} <span className="text-ink">{s.warranty}</span>
                      </p>
                    )}
                    <span className="link-underline text-[16px] font-medium">{page?.exploreLabel}</span>
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
