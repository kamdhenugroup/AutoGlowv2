import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/client'
import {PRIVACY_QUERY} from '@/sanity/queries'
import {pageMetadata} from '@/lib/seo'
import {RichText} from '@/components/RichText'
import {TextLink} from '@/components/ui'

const getPage = () => sanityFetch({query: PRIVACY_QUERY, tags: ['privacyPage']})

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata((await getPage())?.seo, '/privacy')
}

export default async function PrivacyPage() {
  const p = await getPage()
  return (
    <section className="wrap py-[clamp(56px,8vw,112px)]">
      <div className="mx-auto max-w-[760px]">
        <h1 className="display text-[clamp(40px,5vw,72px)]">{p?.heading}</h1>
        <div className="mt-12">
          <RichText value={(p?.body ?? []) as Parameters<typeof RichText>[0]['value']} variant="legal" />
        </div>
        {p?.backLink?.href && (
          <TextLink href={p.backLink.href} className="mt-14 inline-block">
            {p.backLink.label}
          </TextLink>
        )}
      </div>
    </section>
  )
}
