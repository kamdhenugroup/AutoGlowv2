import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {BOOK_QUERY} from '@/sanity/queries'
import {getLocations, getServices, getSettings} from '@/lib/data'
import {pageMetadata} from '@/lib/seo'
import {BookingForm} from '@/components/BookingForm'
import {Button, SmartLink} from '@/components/ui'

const getPage = () => sanityFetch({query: BOOK_QUERY, tags: ['bookInspectionPage']})

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await getPage())?.seo, '/book-inspection')
}

export default async function BookInspectionPage() {
  const [p, locations, services, s] = await Promise.all([getPage(), getLocations(), getServices(), getSettings()])
  if (!p) return null
  return (
    <>
      <section className="wrap pt-[clamp(56px,8vw,112px)] pb-12 text-center">
        <h1 className="display text-[clamp(46px,7.6vw,112px)]">{p.heading}</h1>
        <p className="mx-auto mt-6 max-w-[600px] text-[18px] leading-relaxed text-body">{p.intro}</p>
      </section>

      <section className="wrap pb-12">
        <div className="mx-auto grid max-w-[880px] gap-4 md:grid-cols-2">
          <div className="rounded-sm bg-mist p-8">
            <h2 className="text-[15px] font-medium text-muted">{p.callLabel}</h2>
            <ul className="mt-4 space-y-2">
              {p.callLines?.map((c) => (
                <li key={c._key}>
                  <SmartLink href={c.href ?? '#'} className="text-[18px] font-medium hover:underline hover:underline-offset-4">
                    {c.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col rounded-sm bg-mist p-8">
            <h2 className="text-[15px] font-medium text-muted">{p.whatsappLabel}</h2>
            {p.whatsappLink?.href && (
              <Button href={p.whatsappLink.href} variant="secondary" className="mt-6 self-start bg-paper">
                {p.whatsappLink.label}
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="wrap pb-[clamp(72px,10vw,144px)]">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 lg:pr-8">
            <h2 className="display text-[clamp(24px,2.6vw,34px)] tracking-[-0.025em]">{p.formHeading}</h2>
            <p className="mt-3 text-[18px] text-body">{p.formIntro}</p>
            <div className="mt-8">
              <BookingForm
                labels={p.fields}
                cities={locations.map((l) => l.city ?? '').filter(Boolean)}
                services={services.map((x) => x.title ?? '').filter(Boolean)}
                error={s.formMessages?.genericError ?? ''}
              />
            </div>
          </div>
          <aside className="rounded-sm bg-mist p-[clamp(24px,4vw,48px)] lg:col-span-5">
            <h2 className="display text-[clamp(24px,2.6vw,34px)] tracking-[-0.02em]">{p.studiosHeading}</h2>
            <ul className="mt-6 space-y-3">
              {locations.map((l) => (
                <li key={l._id} className="text-[18px] text-body">
                  {l.city}: {l.shortAddress}
                </li>
              ))}
            </ul>
            <h2 className="display mt-12 text-[clamp(24px,2.6vw,34px)] tracking-[-0.02em]">{p.hoursHeading}</h2>
            <p className="mt-6 flex justify-between gap-4 text-[18px]">
              <span className="text-body">{p.hoursDays}</span>
              <span className="font-medium">
                {s.businessHoursOpens} — {s.businessHoursCloses}
              </span>
            </p>
          </aside>
        </div>
      </section>
    </>
  )
}
