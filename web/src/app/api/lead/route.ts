import {NextResponse, type NextRequest} from 'next/server'
import {nowIST, sendEmail} from '@/lib/forms'

/** Leads from the Meta Ads landing page. Same request and response contract as the previous /api/lead. */
export async function POST(req: NextRequest) {
  try {
    const {name, phone, city, car, services, source} = await req.json()
    if (!name || !phone) {
      return NextResponse.json({success: false, error: 'Name and phone are required'}, {status: 400})
    }
    const ok = await sendEmail(
      `🚗 New Meta Ads Booking Lead: ${name} (${city || 'Studio'})`,
      [
        ['Name', name],
        ['Phone', phone],
        ['Studio Location', city || 'N/A'],
        ['Car Brand & Model', car || 'N/A'],
        ['Selected Services', services || 'N/A'],
        ['Source', source || 'Landing Page'],
        ['Time', nowIST()],
      ],
      'New Lead from the AutoGlow Landing Page',
    )
    if (!ok) return NextResponse.json({success: false, error: 'Internal Server Error'}, {status: 500})
    return NextResponse.json({success: true})
  } catch (error) {
    console.error('Lead API error:', error)
    return NextResponse.json({success: false, error: 'Internal Server Error'}, {status: 500})
  }
}
