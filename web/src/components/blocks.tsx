import Image from 'next/image'
import Link from 'next/link'
import type {Location, ServiceCard} from '@/lib/data'
import {imageSrc} from '@/sanity/image'
import {cn} from './ui'
import {Clock, MapPin, Phone, WhatsAppIcon} from './icons'

export function ServiceCardItem({s, sizes, className, rail}: {s: ServiceCard; sizes: string; className?: string; rail?: boolean}) {
  const src = imageSrc(s.image, s.legacyImageUrl, 900)
  return (
    <Link href={`/services/${s.slug}`} className={cn('group block', className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-mist">
        {/* In the pinned rail the photo drifts inside its frame as the row travels. */}
        <div data-rail-img={rail || undefined} className={cn('absolute inset-0', rail && 'scale-[1.08] will-change-transform')}>
          {src && (
            <Image
              src={src}
              alt={s.image?.alt || s.title || ''}
              fill
              sizes={sizes}
              quality={90}
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
            />
          )}
        </div>
      </div>
      <h3 className="mt-5 text-[22px] font-medium">{s.title}</h3>
      <p className="mt-2 text-[18px] leading-relaxed text-body">{s.oneLiner}</p>
    </Link>
  )
}

/**
 * One studio. Cards share rows with their neighbours (CSS subgrid), so names, addresses, hours
 * and contacts line up across the grid whatever their length.
 */
export function StudioCard({l, className, whatsappLabel}: {l: Location; className?: string; whatsappLabel?: string}) {
  return (
    <article className={cn('row-span-4 grid gap-5 rounded-sm bg-paper p-7 sm:grid-rows-subgrid xl:p-8', className)}>
      <div>
        <h3 className="display text-[clamp(24px,2.2vw,30px)] leading-[1.08] tracking-[-0.02em]">{l.title}</h3>
        <p className="mt-2 text-[15px] text-muted">
          {l.city}, {l.country}
        </p>
      </div>
      <p className="flex gap-3 text-[16px] leading-relaxed text-body">
        <MapPin size={18} aria-hidden="true" className="mt-1 shrink-0 text-muted" />
        {l.address}
      </p>
      <p className="flex gap-3 text-[16px] leading-relaxed">
        <Clock size={18} aria-hidden="true" className="mt-1 shrink-0 text-muted" />
        {l.hours}
      </p>
      <div className="flex flex-col gap-2.5 self-end pt-5 text-[15px] font-medium shadow-[inset_0_1px_0_var(--color-mist)]">
        {l.phone && (
          <a href={`tel:+91${l.phone}`} className="inline-flex items-center gap-2.5">
            <Phone size={16} aria-hidden="true" />
            <span className="link-underline">Call: {l.phone}</span>
          </a>
        )}
        {l.whatsapp ? (
          <a href={`https://wa.me/91${l.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5">
            <WhatsAppIcon size={16} />
            <span className="link-underline">WA: {l.whatsapp}</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <Link href="/whatsapp" className="inline-flex items-center gap-2.5">
            <WhatsAppIcon size={16} />
            <span className="link-underline">{whatsappLabel}</span>
          </Link>
        )}
      </div>
    </article>
  )
}

export function Stats({
  stats,
  className,
}: {
  stats: {_key: string; value: string | null; suffix: string | null; label: string | null}[]
  className?: string
}) {
  return (
    <dl className={cn('grid grid-cols-3 gap-4 md:gap-6', className)}>
      {stats.map((s) => (
        <div key={s._key}>
          <dt className="sr-only">{s.label}</dt>
          <dd className="display text-[clamp(36px,4.8vw,68px)]">{`${s.value ?? ''}${s.suffix ?? ''}`}</dd>
          <dd className="mt-2 text-[15px] leading-snug text-muted">{s.label}</dd>
        </div>
      ))}
    </dl>
  )
}
