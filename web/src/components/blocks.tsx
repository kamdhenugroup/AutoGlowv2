import Image from 'next/image'
import Link from 'next/link'
import type {Location, ServiceCard} from '@/lib/data'
import {imageSrc} from '@/sanity/image'
import {cn} from './ui'

export function ServiceCardItem({s, sizes, className}: {s: ServiceCard; sizes: string; className?: string}) {
  const src = imageSrc(s.image, s.legacyImageUrl, 900)
  return (
    <Link href={`/services/${s.slug}`} className={cn('group block', className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-mist">
        {src && (
          <Image
            src={src}
            alt={s.image?.alt || s.title || ''}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
          />
        )}
      </div>
      <h3 className="mt-5 text-[22px] font-medium">{s.title}</h3>
      <p className="mt-2 text-[18px] leading-relaxed text-body">{s.oneLiner}</p>
    </Link>
  )
}

export function StudioCard({l, className}: {l: Location; className?: string}) {
  return (
    <article className={cn('flex flex-col gap-4', className)}>
      <div>
        <h3 className="display text-[clamp(24px,2.6vw,34px)] tracking-[-0.02em]">{l.title}</h3>
        <p className="mt-1 text-[15px] text-muted">
          {l.city}, {l.country}
        </p>
      </div>
      <p className="text-[18px] leading-relaxed text-body">{l.address}</p>
      {l.hours && <p className="text-[18px]">{l.hours}</p>}
      {(l.phone || l.whatsapp) && (
        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-2 text-[15px] font-medium">
          {l.phone && (
            <a href={`tel:+91${l.phone}`} className="link-underline">
              Call: {l.phone}
            </a>
          )}
          {l.whatsapp && (
            <a href={`https://wa.me/91${l.whatsapp}`} target="_blank" rel="noopener noreferrer" className="link-underline">
              WA: {l.whatsapp}
            </a>
          )}
        </div>
      )}
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
