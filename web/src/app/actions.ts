'use server'

/**
 * Form submissions. Same destinations as the previous site (Google Sheets via Apps Script,
 * plus an email through Resend), but every secret now comes from the environment.
 */

import {sendEmail, toSheet} from '@/lib/forms'

export type FormResult = {success: boolean; error?: string}

export async function submitBooking(formData: FormData): Promise<FormResult> {
  if (formData.get('bot_field')) return {success: true}
  const data = {
    formType: 'booking',
    name: formData.get('name'),
    phone: formData.get('phone'),
    city: formData.get('city'),
    service: formData.get('service'),
    date: formData.get('date'),
    message: formData.get('message'),
    timestamp: new Date().toISOString(),
  }
  try {
    await toSheet(data)
  } catch (e) {
    console.error(e)
    return {success: false, error: 'Failed to submit form'}
  }
  await sendEmail(
    `🚗 New Inspection Booking: ${data.name} (${data.city || 'Studio'})`,
    [
      ['Name', data.name],
      ['Phone', data.phone],
      ['City / Studio', data.city || 'N/A'],
      ['Service', data.service || 'N/A'],
      ['Preferred Date', data.date || 'N/A'],
      ['Message', data.message || 'N/A'],
      ['Time', data.timestamp],
    ],
    'New Inspection Booking Request',
  )
  return {success: true}
}

export async function submitNewsletter(formData: FormData): Promise<FormResult> {
  if (formData.get('bot_field')) return {success: true}
  const data = {
    formType: 'newsletter',
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    timestamp: new Date().toISOString(),
  }
  try {
    await toSheet(data)
  } catch (e) {
    console.error(e)
    return {success: false, error: 'Failed to submit newsletter'}
  }
  await sendEmail(
    `📩 New Newsletter / Footer Signup: ${data.email}`,
    [
      ['Name', data.name || 'N/A'],
      ['Email', data.email],
      ['Phone', data.phone || 'N/A'],
      ['Time', data.timestamp],
    ],
    'New Newsletter Signup (Footer)',
  )
  return {success: true}
}
