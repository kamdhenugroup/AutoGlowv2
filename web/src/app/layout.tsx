import type {Metadata, Viewport} from 'next'
import {Mona_Sans} from 'next/font/google'
import {Toaster} from 'sonner'
import {getLocations, getSettings} from '@/lib/data'
import {jsonLd} from '@/lib/seo'
import {Header} from '@/components/Header'
import {Footer} from '@/components/Footer'
import {CookieConsent} from '@/components/CookieConsent'
import {Analytics} from '@/components/Analytics'
import {MobileActions} from '@/components/MobileActions'
import './globals.css'

const mona = Mona_Sans({subsets: ['latin'], axes: ['wdth'], variable: '--font-mona', display: 'swap'})

export const viewport: Viewport = {width: 'device-width', initialScale: 1}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const title = s.defaultTitle ?? undefined
  const description = s.defaultDescription ?? undefined
  const image = s.defaultOgImageUrl ?? undefined
  const icon = s.logoUrl ?? undefined
  return {
    metadataBase: new URL(s.siteUrl ?? 'https://autoglowcare.in'),
    title,
    description,
    openGraph: {
      title,
      description,
      url: s.siteUrl ?? undefined,
      siteName: s.siteName ?? undefined,
      images: image ? [{url: image, width: 1200, height: 630, alt: s.defaultOgImageAlt ?? undefined}] : undefined,
      locale: s.locale ?? 'en_IN',
      type: 'website',
    },
    twitter: {card: 'summary_large_image', title, description, images: image ? [image] : undefined},
    icons: icon
      ? {icon: [{url: icon, type: 'image/png'}], shortcut: [icon], apple: [{url: icon, sizes: '180x180', type: 'image/png'}]}
      : undefined,
  }
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const [s, locations] = await Promise.all([getSettings(), getLocations()])
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.siteName,
    url: s.siteUrl,
    logo: s.logoUrl,
    sameAs: s.sameAs,
    parentOrganization: {'@type': 'Organization', name: s.parentOrganization},
  }
  const phones = locations.filter((l) => l.phone).map((l) => ({city: l.city ?? '', phone: l.phone!}))

  return (
    <html lang="en" className={mona.variable}>
      <body className="min-h-dvh">
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organization)} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:bg-paper focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <Header nav={s.mainNav ?? []} cta={s.headerCta} />
        <main id="main">{children}</main>
        <Footer s={s} />
        <MobileActions phones={phones} callLabel={s.stickyBar?.callLabel ?? ''} whatsappLabel={s.stickyBar?.whatsappLabel ?? ''} />
        <CookieConsent c={s.cookieConsent} />
        <Toaster position="bottom-right" theme="light" />
      </body>
    </html>
  )
}
