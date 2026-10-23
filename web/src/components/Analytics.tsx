import Script from 'next/script'

/**
 * Google Consent Mode v2 defaults, then Google Tag Manager — same setup as the previous site.
 * Rendered only from the root layout, which is where App Router expects beforeInteractive scripts.
 */
export function Analytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-P9JJKFNB'
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- rendered from app/layout.tsx */}
      <Script id="consent-mode-default" strategy="beforeInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {'analytics_storage': 'denied','ad_storage': 'denied','ad_user_data': 'denied','ad_personalization': 'denied','wait_for_update': 500});
gtag('set', 'ads_data_redaction', true);`}
      </Script>
      {gtmId && (
        <Script id="gtm-base" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
    </>
  )
}
