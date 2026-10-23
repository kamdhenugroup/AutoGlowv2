import type {Settings} from '@/lib/data'
import {Logo} from './Logo'
import {NewsletterForm} from './NewsletterForm'
import {ManageCookiesButton} from './CookieConsent'
import {SmartLink, buttonClass} from './ui'

export function Footer({s}: {s: Settings}) {
  const ask = s.askAi
  const contact = s.contactPrompt
  return (
    <footer className="bg-paper">
      {/* Ask AI About Us */}
      {ask && (
        <section className="border-t border-line">
          <div className="wrap grid gap-8 py-16 lg:grid-cols-12 lg:items-end lg:py-20">
            <div className="lg:col-span-6">
              <h2 className="display text-[clamp(30px,3.4vw,44px)]">{ask.heading}</h2>
              <p className="mt-4 max-w-[520px] text-[17px] leading-relaxed text-body">{ask.body}</p>
            </div>
            <ul className="flex flex-wrap gap-3 lg:col-span-6 lg:justify-end">
              {ask.providers?.map((p) => (
                <li key={p._key}>
                  <a
                    href={`${p.urlPrefix}${encodeURIComponent(ask.prompt ?? '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass('secondary', 'h-11 px-5')}
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Need more information? */}
      {contact && (
        <section className="bg-mist">
          <div className="wrap flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[22px] font-medium">{contact.heading}</h2>
              <p className="mt-2 text-[16px] text-body">{contact.body}</p>
            </div>
            <ul className="flex flex-wrap gap-3">
              {contact.links?.map((l, i) => (
                <li key={l._key}>
                  <SmartLink href={l.href ?? '/'} className={buttonClass(i === 0 ? 'primary' : 'secondary', 'h-11 px-5')}>
                    {l.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="wrap pt-16 pb-10 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo className="h-11 w-auto" />
            {s.newsletter && (
              <div className="mt-8 max-w-[380px]">
                <h2 className="text-[20px] font-medium">{s.newsletter.heading}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{s.newsletter.body}</p>
                <NewsletterForm
                  placeholder={s.newsletter.placeholder ?? 'Email'}
                  button={s.newsletter.buttonLabel ?? ''}
                  note={s.newsletter.note ?? ''}
                  success={s.formMessages?.newsletterSuccess ?? ''}
                  error={s.formMessages?.genericError ?? ''}
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
            {s.footerColumns?.map((col) => (
              <div key={col._key}>
                <h2 className="text-[15px] font-medium text-muted">{col.heading}</h2>
                <ul className="mt-5 space-y-3">
                  {col.links?.map((l) => (
                    <li key={l._key}>
                      <SmartLink href={l.href ?? '/'} className="text-[15px] text-ink hover:underline hover:underline-offset-4">
                        {l.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-line pt-8 text-[14px] text-muted lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>
              {s.copyright} {s.companyLine}
            </span>
            {s.legalLinks?.map((l) => (
              <SmartLink key={l._key} href={l.href ?? '/'} className="hover:text-ink">
                {l.label}
              </SmartLink>
            ))}
            <ManageCookiesButton label={s.manageCookiesLabel ?? ''} />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {s.stickyBar?.label && (
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#1f9d55]" aria-hidden="true" />
                {s.stickyBar.label}
                {s.stickyBar.status && <span className="text-ink">{s.stickyBar.status}</span>}
              </span>
            )}
            {s.statusBadgeUrl && (
              <iframe
                src={s.statusBadgeUrl}
                width={250}
                height={30}
                title="System Status"
                loading="lazy"
                className="border-0"
                style={{colorScheme: 'normal'}}
              />
            )}
          </div>
        </div>
        {s.creditText && (
          <p className="mt-6 text-[13px] text-muted">
            {s.creditText}{' '}
            {s.creditLink?.href && (
              <SmartLink href={s.creditLink.href} className="text-ink hover:underline">
                {s.creditLink.label}
              </SmartLink>
            )}
          </p>
        )}
      </div>
    </footer>
  )
}
