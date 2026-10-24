import type {Metadata} from 'next'
import {getSettings} from '@/lib/data'
import {Button} from '@/components/ui'

export const metadata: Metadata = {
  title: '404 - Page Not Found | AutoGlow Studio',
  description: "The page you are looking for doesn't exist. Return to AutoGlow Studio.",
  robots: {index: false, follow: true},
}

export default async function NotFound() {
  const {notFound: n} = await getSettings()
  return (
    <section className="wrap flex min-h-[70vh] flex-col justify-center py-24">
      <p className="text-[15px] font-medium text-muted">404</p>
      <h1 className="display mt-4 text-[clamp(46px,7.6vw,112px)]">{n?.heading}</h1>
      <p className="mt-6 max-w-[520px] text-[18px] leading-relaxed text-body">{n?.body}</p>
      {n?.link?.href && (
        <Button href={n.link.href} className="mt-10 self-start">
          {n.link.label}
        </Button>
      )}
    </section>
  )
}
