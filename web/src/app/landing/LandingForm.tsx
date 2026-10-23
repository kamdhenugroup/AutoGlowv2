'use client'

import {useState} from 'react'
import {cn} from '@/components/ui'

type Props = {
  studios: {city: string; whatsapp: string}[]
  services: {slug: string; title: string}[]
  labels: string[]
  suffix: string
  carPlaceholder: string
  namePlaceholder: string
  phonePrefix: string
  phonePlaceholder: string
  submit: string
  errorRequired: string
  errorPhone: string
  successHeading: string
  successBody: string
  successButton: string
  source: string
  template: string
}

const input =
  'h-[52px] w-full rounded-sm border border-line-strong bg-paper px-4 text-[18px] text-ink placeholder:text-muted focus:border-ink focus:outline-none'
const lbl = 'text-[15px] font-medium'

export function LandingForm(p: Props) {
  const [location, setLocation] = useState(p.studios[0]?.city ?? '')
  const [service, setService] = useState(p.services[0]?.slug ?? '')
  const [car, setCar] = useState('')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const wa = p.studios.find((s) => s.city === location)?.whatsapp ?? p.studios[0]?.whatsapp ?? ''

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !car.trim() || !mobile.trim()) return setError(p.errorRequired)
    const digits = mobile.replace(/\D/g, '')
    if (!/^\d{10}$/.test(digits)) return setError(p.errorPhone)
    setBusy(true)
    const serviceName = p.services.find((s) => s.slug === service)?.title ?? service
    await fetch('/api/lead', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, phone: mobile, city: location, car, services: serviceName, source: p.source}),
    }).catch(() => {})
    setBusy(false)
    setDone(true)
    const message = p.template
      .replaceAll('{location}', location)
      .replaceAll('{name}', name)
      .replaceAll('{mobile}', mobile)
      .replaceAll('{car}', car)
      .replaceAll('{service}', serviceName)
    setTimeout(() => {
      window.location.href = `https://wa.me/91${wa}?text=${encodeURIComponent(message)}`
    }, 1500)
  }

  if (done)
    return (
      <div className="py-12 text-center" role="status">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mist text-[22px]" aria-hidden="true">
          ✓
        </div>
        <h3 className="display mt-6 text-[22px]">{p.successHeading}</h3>
        <p className="mx-auto mt-3 max-w-[340px] text-[15px] text-body">{p.successBody}</p>
        <a
          href={`https://wa.me/91${wa}`}
          className="mt-6 inline-flex h-[52px] items-center rounded-sm bg-ink px-6 text-[15px] font-medium text-paper"
        >
          {p.successButton}
        </a>
      </div>
    )

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      {error && (
        <p role="alert" className="rounded-sm border border-logo-red/40 bg-[#fdf2f2] px-4 py-3 text-[15px] text-[#8a1c22]">
          {error}
        </p>
      )}
      <fieldset>
        <legend className={lbl}>{p.labels[0]}</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {p.studios.map((s) => (
            <label
              key={s.city}
              className={cn(
                'flex h-[52px] cursor-pointer items-center justify-center rounded-sm border text-[15px] font-medium',
                location === s.city ? 'border-ink bg-ink text-paper' : 'border-line-strong',
              )}
            >
              <input
                type="radio"
                name="location"
                value={s.city}
                checked={location === s.city}
                onChange={() => setLocation(s.city)}
                className="sr-only"
              />
              {s.city}
              {p.suffix}
            </label>
          ))}
        </div>
      </fieldset>
      <label className={lbl}>
        {p.labels[1]}
        <input value={car} onChange={(e) => setCar(e.target.value)} placeholder={p.carPlaceholder} className={cn(input, 'mt-2')} />
      </label>
      <label className={lbl}>
        {p.labels[2]}
        <select value={service} onChange={(e) => setService(e.target.value)} className={cn(input, 'mt-2')}>
          {p.services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
            </option>
          ))}
        </select>
      </label>
      <label className={lbl}>
        {p.labels[3]}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={p.namePlaceholder}
          autoComplete="name"
          className={cn(input, 'mt-2')}
        />
      </label>
      <label className={lbl}>
        {p.labels[4]}
        <span className="mt-2 flex">
          <span className="grid h-[52px] place-items-center rounded-l-sm border border-r-0 border-line-strong bg-mist px-4 text-[15px]">
            {p.phonePrefix}
          </span>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            type="tel"
            inputMode="numeric"
            placeholder={p.phonePlaceholder}
            autoComplete="tel-national"
            className={cn(input, 'rounded-l-none')}
          />
        </span>
      </label>
      <button
        type="submit"
        disabled={busy}
        className="mt-1 h-[52px] w-full rounded-sm bg-ink text-[15px] font-medium text-paper hover:bg-[#0b2550] disabled:opacity-60"
      >
        {p.submit}
      </button>
    </form>
  )
}
