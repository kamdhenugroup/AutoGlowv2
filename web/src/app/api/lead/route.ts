import {NextResponse, type NextRequest} from 'next/server'
import {sendEmail} from '@/lib/forms'

/** Leads from the Meta Ads landing page. Same contract as the previous /api/lead. */
export async function POST(req: NextRequest) {
  try {
    const {name, phone, city, car, services, source} = await req.json()
    if (!name || !phone) {
      return NextResponse.json({success: false, error: 'Name and phone are required'}, {status: 400})
    }
    const timestamp = new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            formType: 'landing_booking',
            name,
            phone,
            city,
            car,
            services,
            source: source || 'Landing Page',
            timestamp,
          }),
        })
      } catch (e) {
        console.error('Webhook error:', e)
      }
    }

    await sendEmail(
      `🚗 New Meta Ads Booking Lead: ${name} (${city})`,
      [
        ['Name', name],
        ['Phone', phone],
        ['Studio Location', city],
        ['Car Brand & Model', car],
        ['Selected Services', services],
        ['Source', source || 'Landing Page'],
        ['Time', timestamp],
      ],
      'New Lead from Kamdhenu Landing Page',
      'Kamdhenu Leads <onboarding@resend.dev>',
    )

    return NextResponse.json({success: true})
  } catch (error) {
    console.error('Lead API error:', error)
    return NextResponse.json({success: false, error: 'Internal Server Error'}, {status: 500})
  }
}
