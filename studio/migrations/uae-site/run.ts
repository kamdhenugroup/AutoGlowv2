/**
 * One-off (25 Oct 2026): links AutoGlow's UAE website, autoglow.ae.
 * - Dubai and Abu Dhabi studios get website = https://autoglow.ae
 * - Footer "Connect" column gets "autoglow.ae (UAE)"
 * - Organization sameAs gets https://autoglow.ae
 * - Terms, section 2, mentions the UAE website
 * Run: npx tsx migrations/uae-site/run.ts
 */
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: '6qzta0cg',
  dataset: 'production',
  apiVersion: '2026-10-23',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})
const UAE = 'https://autoglow.ae'

type Link = {_key: string; _type: 'link'; href: string; label: string}
type Col = {_key: string; heading: string; links: Link[]}
type Span = {_type: 'span'; _key: string; text: string; marks: string[]}
type Block = {_key: string; _type: string; style?: string; markDefs?: {_key: string; _type: string; href: string}[]; children?: Span[]}

async function main() {
  const ids = await client.fetch<string[]>(`*[_type=="location" && country=="UAE" && !(_id in path("drafts.**"))]._id`)
  for (const id of ids) await client.patch(id).set({website: UAE}).commit()
  console.log('locations:', ids.length)

  const s = await client.fetch<{_id: string; sameAs: string[]; footerColumns: Col[]}>(
    `*[_type=="siteSettings" && !(_id in path("drafts.**"))][0]{_id, sameAs, footerColumns}`,
  )
  const cols = s.footerColumns.map((c) =>
    c.heading === 'Connect' && !c.links.some((l) => l.href.startsWith(UAE))
      ? {...c, links: [...c.links, {_key: 'uaesite', _type: 'link' as const, href: UAE, label: 'autoglow.ae (UAE)'}]}
      : c,
  )
  const sameAs = s.sameAs.includes(UAE) ? s.sameAs : [...s.sameAs, UAE]
  await client.patch(s._id).set({footerColumns: cols, sameAs}).commit()
  console.log('settings updated')

  const t = await client.getDocument<{body: Block[]}>('termsPage')
  const body = t!.body
  const i = body.findIndex((b) => b.children?.some((c) => c.text.startsWith('AutoGlow runs automotive protection')))
  const b = body[i]
  if (!b.markDefs?.some((m) => m.href === UAE)) {
    const mk = {_key: 'uaelink', _type: 'link', href: UAE}
    body[i] = {
      ...b,
      markDefs: [...(b.markDefs ?? []), mk],
      children: [
        ...(b.children ?? []),
        {_type: 'span', _key: 'uae1', text: ' Our UAE studios also have their own website, ', marks: []},
        {_type: 'span', _key: 'uae2', text: 'autoglow.ae', marks: [mk._key]},
        {_type: 'span', _key: 'uae3', text: '.', marks: []},
      ],
    }
    await client.patch('termsPage').set({body}).commit()
    console.log('terms updated')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
