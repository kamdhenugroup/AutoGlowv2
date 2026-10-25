import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {sanityFetch} from '@/sanity/client'
import {TERMS_QUERY} from '@/sanity/queries'
import {pageMetadata} from '@/lib/seo'
import {RichText} from '@/components/RichText'
import {TextLink} from '@/components/ui'

const getPage = () => sanityFetch({query: TERMS_QUERY, tags: ['termsPage']})

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await getPage())?.seo, '/terms')
}

export default async function TermsPage() {
  const p = await getPage()
  if (!p) notFound()
  const updated = p.updated
    ? new Date(`${p.updated}T00:00:00`).toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'})
    : null
  return (
    <section className="wrap py-[clamp(56px,8vw,112px)]">
      <div className="mx-auto max-w-[760px]">
        <h1 className="display text-[clamp(36px,4.8vw,68px)]">{p.heading}</h1>
        {updated && (
          <p className="mt-5 text-[15px] text-muted">
            Last updated <time dateTime={p.updated ?? undefined}>{updated}</time>
          </p>
        )}
        <div className="mt-12">
          <RichText value={(p.body ?? []) as Parameters<typeof RichText>[0]['value']} variant="legal" />
        </div>
        {p.backLink?.href && (
          <TextLink href={p.backLink.href} className="mt-14 inline-block">
            {p.backLink.label}
          </TextLink>
        )}
      </div>
    </section>
  )
}
