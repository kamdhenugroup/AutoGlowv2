import Link from 'next/link'
import type {ComponentProps, ReactNode} from 'react'

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
    </a>
  )
}

type Variant = 'primary' | 'secondary' | 'onImage' | 'onImageGhost'
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-[#0b2550]',
  secondary: 'border border-line-strong text-ink hover:border-ink',
  onImage: 'bg-paper text-ink hover:bg-mist',
  onImageGhost: 'border border-white/55 text-paper hover:border-paper hover:bg-white/10',
}

export function buttonClass(variant: Variant = 'primary', extra?: string) {
  return cn(
    'inline-flex h-[52px] items-center justify-center rounded-sm px-7 text-[15px] font-medium whitespace-nowrap transition-colors duration-200',
    VARIANTS[variant],
    extra,
  )
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
      {children}
    </SmartLink>
  )
}

export function TextLink({href, children, className}: {href: string; children: ReactNode; className?: string}) {
  return (
    <SmartLink href={href} className={cn('link-underline shrink-0 text-[16px] font-medium whitespace-nowrap', className)}>
      {children}
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
