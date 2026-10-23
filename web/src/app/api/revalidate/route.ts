import {revalidateTag} from 'next/cache'
import {NextResponse, type NextRequest} from 'next/server'
import {parseBody} from 'next-sanity/webhook'

/**
 * Sanity webhook target. Configure in Sanity Manage → API → Webhooks:
 *   URL:        https://<site>/api/revalidate
 *   Trigger:    create, update, delete
 *   Projection: {"tags": [_type, _type + ":" + slug.current]}
 *   Secret:     same value as SANITY_REVALIDATE_SECRET
 */
export async function POST(req: NextRequest) {
  try {
    const {isValidSignature, body} = await parseBody<{tags?: string[]}>(req, process.env.SANITY_REVALIDATE_SECRET, true)
    if (!isValidSignature) return new Response('Invalid signature', {status: 401})
    const tags = (body?.tags ?? []).filter((t) => typeof t === 'string' && !t.endsWith(':null'))
    if (!tags.length) return new Response('Missing tags', {status: 400})
    tags.forEach((t) => revalidateTag(t, 'max'))
    return NextResponse.json({revalidated: tags})
  } catch (err) {
    return new Response((err as Error).message, {status: 500})
  }
}
