import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {LOCATIONS_PAGE_QUERY} from '@/sanity/queries'
import {getLocations, getSettings} from '@/lib/data'
import {SITE_URL, jsonLd, pageMetadata} from '@/lib/seo'
import {Clock, MapPin, Navigation, Phone, WhatsAppIcon} from '@/components/icons'
import {MapEmbed} from '@/components/MapEmbed'
import {buttonClass} from '@/components/ui'

const getPage = () => sanityFetch({query: LOCATIONS_PAGE_QUERY, tags: ['locationsPage']})

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await getPage())?.seo, '/locations')
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default async function LocationsPage() {
  const [p, locations, s] = await Promise.all([getPage(), getLocations(), getSettings()])
  const ld = locations.map((l) => ({
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: l.title,
    address: {'@type': 'PostalAddress', addressLocality: l.city, addressCountry: l.country, streetAddress: l.address},
    ...(l.phone ? {telephone: `+91${l.phone}`} : {}),
    url: `${SITE_URL}/locations`,
    hasMap: l.mapUrl,
    ...(l.phone
      ? {
          openingHoursSpecification: [
            {'@type': 'OpeningHoursSpecification', dayOfWeek: DAYS, opens: s.businessHoursOpens, closes: s.businessHoursCloses},
          ],
        }
      : {}),
  }))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <section className="wrap pt-[clamp(56px,8vw,112px)] pb-[clamp(48px,6vw,80px)]">
        <h1 className="display text-[clamp(46px,7.6vw,112px)]">{p?.heading}</h1>
        <p className="mt-6 max-w-[560px] text-[18px] leading-relaxed text-body">{p?.intro}</p>
      </section>

      <section className="wrap pb-[clamp(72px,10vw,144px)]">
        <ul className="space-y-3">
          {locations.map((l) => (
            <li key={l._id} className="grid gap-8 rounded-sm bg-mist p-[clamp(24px,3.4vw,48px)] lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-5">
                <h2 className="display text-[clamp(24px,2.6vw,34px)]">{l.title}</h2>
                <p className="mt-2 text-[15px] text-muted">
                  {l.city}, {l.country}
                </p>
                <dl className="mt-8 grid gap-6 text-[18px] sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="flex items-center gap-2 text-[15px] text-muted">
                      <MapPin size={15} aria-hidden="true" />
                      {p?.addressLabel}
                    </dt>
                    <dd className="mt-1 leading-relaxed">{l.address}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 text-[15px] text-muted">
                      <Clock size={15} aria-hidden="true" />
                      {p?.hoursLabel}
                    </dt>
                    <dd className="mt-1">{l.hours}</dd>
                  </div>
                  {l.phone && (
                    <div>
                      <dt className="flex items-center gap-2 text-[15px] text-muted">
                        <Phone size={15} aria-hidden="true" />
                        {p?.contactLabel}
                      </dt>
                      <dd className="mt-1">
                        <a href={`tel:+91${l.phone}`} className="link-underline">
                          {l.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
                <div className="mt-8 flex flex-wrap gap-3">
                  {l.whatsapp && (
                    <a
                      href={`https://wa.me/91${l.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClass('primary', 'h-11 px-5')}
                    >
                      <WhatsAppIcon size={16} />
                      {p?.whatsappLabel}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                  {l.mapUrl && (
                    <a href={l.mapUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('quiet', 'h-11 px-5')}>
                      <Navigation size={16} aria-hidden="true" />
                      {p?.directionsLabel}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="lg:col-span-7">{l.embedUrl && <MapEmbed src={l.embedUrl} title={l.title ?? ''} />}</div>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
