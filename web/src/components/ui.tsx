import Link from 'next/link'
import type {ComponentProps, ReactNode} from 'react'
import {ArrowRight, ArrowUpRight, CalendarCheck, Mail, Phone, WhatsAppIcon} from './icons'

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

export function isInternal(href: string) {
  return href.startsWith('/') && !href.startsWith('//')
}

/** Next.js Link for site paths; a plain anchor for external, mailto: and tel: links. */
export function SmartLink({href, children, ...rest}: {href: string; children: ReactNode} & Omit<ComponentProps<'a'>, 'href'>) {
  if (isInternal(href) && !href.endsWith('.xml') && !href.endsWith('.txt')) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    )
  }
  const external = /^https?:\/\//.test(href)
  return (
    <a href={href} {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {})} {...rest}>
      {children}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  )
}

type Variant = 'primary' | 'secondary' | 'quiet' | 'onImage' | 'onImageGhost'
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-[#0b2550]',
  secondary: 'bg-mist text-ink hover:bg-[#e4e7eb]',
  /** On a mist field: a white fill keeps it a button without an outline. */
  quiet: 'bg-paper text-ink hover:bg-[#e4e7eb]',
  onImage: 'bg-paper text-ink hover:bg-mist',
  onImageGhost: 'bg-white/14 text-paper hover:bg-white/24',
}

export function buttonClass(variant: Variant = 'primary', extra?: string) {
  return cn(
    'inline-flex h-[52px] items-center justify-center gap-2.5 rounded-sm px-7 text-[15px] font-medium whitespace-nowrap transition-[background-color,transform] duration-200 active:scale-[0.97]',
    VARIANTS[variant],
    extra,
  )
}

/** The icon a call to action carries, chosen from where it goes. Decorative: the label says it all. */
export function ActionIcon({href, size = 17}: {href: string; size?: number}) {
  if (/wa\.me|whatsapp/i.test(href)) return <WhatsAppIcon size={size} />
  if (href.startsWith('tel:')) return <Phone size={size} aria-hidden="true" />
  if (href.startsWith('mailto:')) return <Mail size={size} aria-hidden="true" />
  if (/book|contact|inspection/i.test(href)) return <CalendarCheck size={size} aria-hidden="true" />
  return null
}

export function Button({
  href,
  variant = 'primary',
  className,
  children,
}: {
  href: string
  variant?: Variant
  className?: string
  children: ReactNode
}) {
  return (
    <SmartLink href={href} className={buttonClass(variant, className)}>
      <ActionIcon href={href} />
      {children}
    </SmartLink>
  )
}

export function TextLink({href, children, className}: {href: string; children: ReactNode; className?: string}) {
  return (
    <SmartLink
      href={href}
      data-scramble
      className={cn('group link-underline shrink-0 text-[18px] font-medium whitespace-nowrap', className)}
    >
      {children}
      {/^https?:/.test(href) ? (
        <ArrowUpRight size={16} aria-hidden="true" className="ml-1 inline-block align-[-2px]" />
      ) : (
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="ml-1.5 inline-block align-[-2px] transition-transform group-hover:translate-x-0.5"
        />
      )}
    </SmartLink>
  )
}

export function Eyebrow({children, className}: {children: ReactNode; className?: string}) {
  return <p className={cn('text-[15px] font-medium text-muted', className)}>{children}</p>
}

export function Section({
  children,
  className,
  tone = 'paper',
  id,
}: {
  children: ReactNode
  className?: string
  tone?: 'paper' | 'mist' | 'ink'
  id?: string
}) {
  const bg = tone === 'mist' ? 'bg-mist' : tone === 'ink' ? 'bg-ink text-paper' : 'bg-paper'
  return (
    <section id={id} className={cn(bg, 'py-[clamp(72px,10vw,144px)]', className)}>
      <div className="wrap">{children}</div>
    </section>
  )
}
