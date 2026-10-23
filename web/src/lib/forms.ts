import 'server-only'

/** Shared server-side helpers for form submissions. Never exported as server actions. */

export const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export async function toSheet(payload: Record<string, unknown>) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (!url) throw new Error('GOOGLE_SHEETS_WEBHOOK_URL is not set')
  const res = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)})
  if (!res.ok) throw new Error(`Sheet webhook failed: ${res.status}`)
}

export async function sendEmail(
  subject: string,
  rows: [string, unknown][],
  heading: string,
  from = 'Kamdhenu Auto Care <onboarding@resend.dev>',
) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.LEAD_EMAIL_TO || 'info@kamdhenucars.com'
  if (!key) {
    console.warn('RESEND_API_KEY is not set; email skipped.')
    return
  }
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${key}`},
      body: JSON.stringify({
        from,
        to,
        subject,
        html: `<h2>${esc(heading)}</h2><ul>${rows.map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`).join('')}</ul>`,
      }),
    })
  } catch (e) {
    console.error('Resend email error:', e)
  }
}
