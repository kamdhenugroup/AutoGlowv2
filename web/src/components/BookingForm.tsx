'use client'

import {useRef, useTransition} from 'react'
import {toast} from 'sonner'
import {submitBooking} from '@/app/actions'

type Labels = {
  name?: string | null
  phone?: string | null
  phonePlaceholder?: string | null
  city?: string | null
  cityPlaceholder?: string | null
  service?: string | null
  servicePlaceholder?: string | null
  date?: string | null
  message?: string | null
  submit?: string | null
  submitting?: string | null
  success?: string | null
} | null

const field =
  'mt-2 h-[52px] w-full rounded-sm border border-line-strong bg-paper px-4 text-[18px] text-ink placeholder:text-muted focus:border-ink focus:outline-none'
const label = 'block text-[15px] font-medium'

function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-4 mt-1 -translate-y-1/2 text-ink"
    >
      <path d="m3 6 5 5 5-5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function BookingForm({labels: l, cities, services, error}: {labels: Labels; cities: string[]; services: string[]; error: string}) {
  const ref = useRef<HTMLFormElement>(null)
  const [pending, start] = useTransition()
  return (
    <form
      ref={ref}
      className="grid gap-5"
      action={(fd) =>
        start(async () => {
          const r = await submitBooking(fd)
          if (r.success) {
            toast.success(l?.success ?? '')
            ref.current?.reset()
          } else toast.error(r.error || error)
        })
      }
    >
      <input type="text" name="bot_field" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className={label}>
        {l?.name}
        <input required name="name" autoComplete="name" className={field} />
      </label>
      <label className={label}>
        {l?.phone}
        <input
          required
          type="tel"
          name="phone"
          autoComplete="tel"
          pattern="^(\+91)?\s*[0-9]{10}$"
          title="Please enter a valid 10-digit Indian phone number"
          placeholder={l?.phonePlaceholder ?? ''}
          className={field}
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={label}>
          {l?.city}
          <span className="relative block">
            <select required name="city" defaultValue="" className={`${field} appearance-none pr-10`}>
              <option value="">{l?.cityPlaceholder}</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Chevron />
          </span>
        </label>
        <label className={label}>
          {l?.service}
          <span className="relative block">
            <select required name="service" defaultValue="" className={`${field} appearance-none pr-10`}>
              <option value="">{l?.servicePlaceholder}</option>
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Chevron />
          </span>
        </label>
      </div>
      <label className={label}>
        {l?.date}
        <input type="date" name="date" className={field} />
      </label>
      <label className={label}>
        {l?.message}
        <textarea name="message" rows={4} className={`${field} h-auto py-3`} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 h-[52px] w-full rounded-sm bg-ink text-[15px] font-medium text-paper transition-colors hover:bg-[#0b2550] disabled:opacity-60"
      >
        {pending ? l?.submitting : l?.submit}
      </button>
    </form>
  )
}
