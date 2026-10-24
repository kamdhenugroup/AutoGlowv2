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
        // Tag Manager (GA4, Google Ads, Meta, Clarity) starts on the visitor's first scroll, tap,
        // key press or mouse move, or after 6 seconds at the latest, so it never competes with the
        // page's own first paint and first interaction.
        <Script id="gtm-base" strategy="afterInteractive">
          {`(function(w,d,i){var done=false,ev=['scroll','pointerdown','keydown','mousemove','touchstart'];
function go(){if(done)return;done=true;ev.forEach(function(e){w.removeEventListener(e,go)});
w.dataLayer=w.dataLayer||[];w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var j=d.createElement('script');j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;d.head.appendChild(j);}
ev.forEach(function(e){w.addEventListener(e,go,{once:true,passive:true})});setTimeout(go,6000);})(window,document,'${gtmId}');`}
        </Script>
      )}
    </>
  )
}
