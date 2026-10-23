import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {WHATSAPP_QUERY} from '@/sanity/queries'
import {getLocations} from '@/lib/data'
import {pageMetadata} from '@/lib/seo'
import {Eyebrow, TextLink, buttonClass} from '@/components/ui'

const getPage = () => sanityFetch({query: WHATSAPP_QUERY, tags: ['whatsappPage']})

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await getPage())?.seo, '/whatsapp')
}

export default async function WhatsAppPage() {
  const [p, locations] = await Promise.all([getPage(), getLocations()])
  const studios = locations.filter((l) => l.whatsapp)
  return (
    <section className="wrap py-[clamp(56px,8vw,112px)]">
      <Eyebrow>{p?.eyebrow}</Eyebrow>
      <h1 className="display mt-5 text-[clamp(52px,7.6vw,112px)]">{p?.heading}</h1>
      <p className="mt-6 max-w-[560px] text-[19px] leading-relaxed text-body">{p?.intro}</p>
      <ul className="mt-14 grid gap-4 md:grid-cols-2">
        {studios.map((l) => (
          <li key={l._id}>
            <a
              href={`https://wa.me/91${l.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-start gap-6 rounded-sm bg-mist p-8 sm:flex-row sm:items-end sm:justify-between transition-colors hover:bg-[#e9ebee] md:p-10"
            >
              <span>
                <span className="display block text-[clamp(32px,3.4vw,48px)]">{l.city}</span>
                <span className="mt-2 block text-[15px] text-muted">{p?.studioLabel}</span>
              </span>
              <span className={buttonClass('primary', 'h-11 px-5')}>{p?.chatLabel}</span>
            </a>
          </li>
        ))}
      </ul>
      {p?.backLink?.href && (
        <TextLink href={p.backLink.href} className="mt-12 inline-block">
          {p.backLink.label}
        </TextLink>
      )}
    </section>
  )
}
