'use server'

/**
 * Form submissions. Each one is emailed to the AutoGlow inbox through Resend (see lib/forms.ts);
 * every secret comes from the environment.
 */

import {nowIST, sendEmail} from '@/lib/forms'

export type FormResult = {success: boolean; error?: string}

const val = (f: FormData, k: string) => String(f.get(k) ?? '').trim()

export async function submitBooking(formData: FormData): Promise<FormResult> {
  if (formData.get('bot_field')) return {success: true}
  const name = val(formData, 'name')
  const phone = val(formData, 'phone')
  const city = val(formData, 'city')
  const ok = await sendEmail(
    `🚗 New Inspection Booking: ${name} (${city || 'Studio'})`,
    [
      ['Name', name],
      ['Phone', phone],
      ['City / Studio', city || 'N/A'],
      ['Service', val(formData, 'service') || 'N/A'],
      ['Preferred Date', val(formData, 'date') || 'N/A'],
      ['Message', val(formData, 'message') || 'N/A'],
      ['Time', nowIST()],
    ],
    'New Inspection Booking Request',
  )
  return ok ? {success: true} : {success: false, error: 'Failed to submit form'}
}

export async function submitNewsletter(formData: FormData): Promise<FormResult> {
  if (formData.get('bot_field')) return {success: true}
  const email = val(formData, 'email')
  const ok = await sendEmail(
    `📩 New Newsletter Signup: ${email}`,
    [
      ['Name', val(formData, 'name') || 'N/A'],
      ['Email', email],
      ['Phone', val(formData, 'phone') || 'N/A'],
      ['Time', nowIST()],
    ],
    'New Newsletter Signup (Footer)',
    email || undefined,
  )
  return ok ? {success: true} : {success: false, error: 'Failed to submit newsletter'}
}
