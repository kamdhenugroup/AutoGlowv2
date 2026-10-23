'use client'

import {useState, useTransition} from 'react'
import {toast} from 'sonner'
import {submitNewsletter} from '@/app/actions'

export function NewsletterForm({
  placeholder,
  button,
  note,
  success,
  error,
}: {
  placeholder: string
  button: string
  note: string
  success: string
  error: string
}) {
  const [more, setMore] = useState(false)
  const [pending, start] = useTransition()

  return (
    <form
      className="mt-6"
      action={(fd) =>
        start(async () => {
          const r = await submitNewsletter(fd)
          if (r.success) {
            toast.success(success)
            ;(document.getElementById('newsletter-form') as HTMLFormElement | null)?.reset()
            setMore(false)
          } else toast.error(r.error || error)
        })
      }
      id="newsletter-form"
    >
      <input type="text" name="bot_field" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="nl-email">
          {placeholder}
        </label>
        <input
          id="nl-email"
          name="email"
          type="email"
          required
          placeholder={placeholder}
          className="h-[52px] min-w-0 flex-1 rounded-sm border border-line-strong bg-paper px-4 text-[15px] text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setMore((m) => !m)}
          aria-expanded={more}
          aria-label="Add name and phone"
          className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-sm bg-mist text-ink hover:bg-[#e4e7eb]"
        >
          {more ? '−' : '+'}
        </button>
      </div>
      {more && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            name="name"
            placeholder="Name"
            aria-label="Name"
            className="h-[52px] min-w-0 rounded-sm border border-line-strong px-4 text-[15px] placeholder:text-muted focus:border-ink focus:outline-none"
          />
          <input
            name="phone"
            type="tel"
            placeholder="Phone"
            aria-label="Phone"
            className="h-[52px] min-w-0 rounded-sm border border-line-strong px-4 text-[15px] placeholder:text-muted focus:border-ink focus:outline-none"
          />
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 h-[52px] w-full rounded-sm bg-ink px-6 text-[15px] font-medium text-paper transition-colors hover:bg-[#0b2550] disabled:opacity-60"
      >
        {button}
      </button>
      <p className="mt-3 text-[15px] text-muted">{note}</p>
    </form>
  )
}
