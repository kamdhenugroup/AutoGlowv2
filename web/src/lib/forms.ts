import 'server-only'

/** Shared server-side helpers for form submissions. Never exported as server actions. */

export const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Date and time in India, as the team reads it. */
export const nowIST = () => new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})

/**
 * Every form submission arrives as an email (Resend) at LEAD_EMAIL_TO. This is the only copy of
 * the lead, so a failure is reported back to the form instead of being swallowed.
 * The sender stays on Resend's shared address until autoglowcare.in is verified in Resend;
 * then set LEAD_EMAIL_FROM to e.g. "AutoGlow Website <leads@autoglowcare.in>".
 */
export async function sendEmail(subject: string, rows: [string, unknown][], heading: string, replyTo?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  const to = process.env.LEAD_EMAIL_TO || 'info@autoglowcare.in'
  const from = process.env.LEAD_EMAIL_FROM || 'AutoGlow Website <onboarding@resend.dev>'
  if (!key) {
    console.error('RESEND_API_KEY is not set; the lead could not be delivered.')
    return false
  }
  const html = `<div style="font-family:Arial,sans-serif;color:#031533;max-width:560px">
<h2 style="margin:0 0 16px">${esc(heading)}</h2>
<table cellpadding="8" style="border-collapse:collapse;width:100%;font-size:15px">${rows
    .map(
      ([k, v]) =>
        `<tr style="border-top:1px solid #dde0e5"><td style="color:#556070;width:160px;vertical-align:top">${esc(k)}</td><td>${esc(v)}</td></tr>`,
    )
    .join('')}</table>
<p style="color:#556070;font-size:13px;margin-top:20px">Sent from the autoglowcare.in website.</p></div>`
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${key}`},
      body: JSON.stringify({from, to, subject, html, ...(replyTo ? {reply_to: replyTo} : {})}),
    })
    if (!res.ok) {
      console.error('Resend error:', res.status, await res.text())
      return false
    }
    return true
  } catch (e) {
    console.error('Resend email error:', e)
    return false
  }
}
