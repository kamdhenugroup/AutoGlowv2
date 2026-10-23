import Image from 'next/image'
import Link from 'next/link'

export function Logo({className = 'h-9 w-auto', priority = false}: {className?: string; priority?: boolean}) {
  return (
    <Link href="/" aria-label="AutoGlow home" className="inline-flex shrink-0">
      <Image src="/autoglow-logo.png" alt="AutoGlow Car Care Expert" width={1249} height={377} priority={priority} className={className} />
    </Link>
  )
}
