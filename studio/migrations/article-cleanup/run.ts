/**
 * One-off (25 Oct 2026): removes leftovers the old site's editor left in article bodies.
 * - "Group Credit Block" / "Group Credit" headings: the heading goes, the paragraph under it stays.
 * - "CTA" headings: renamed to a real heading for the paragraph under them.
 * - An opening h1 that restates the article title (the page already shows the title as its h1).
 * - The first FAQ question in the scratches article was an h2; the other questions are h3.
 * Run: npx tsx migrations/article-cleanup/run.ts  (add DRY=1 to only print what would change)
 */
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: '6qzta0cg',
  dataset: 'production',
  apiVersion: '2026-10-23',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

type Span = {_type: string; text?: string}
type Block = {_key: string; _type: string; style?: string; children?: Span[]}
const text = (b: Block) =>
  (b.children ?? [])
    .map((c) => c.text ?? '')
    .join('')
    .trim()

const CTA_HEADINGS: Record<string, string> = {
  'car-leather-restoration': 'Book an Interior Assessment',
  'ceramic-coating-for-cars': 'Book a Paint Inspection',
}

async function main() {
  const docs = await client.fetch<{_id: string; slug: string; body: Block[]}[]>(
    `*[_type=="article" && !(_id in path("drafts.**"))]{_id, "slug": slug.current, body}`,
  )
  const drafts = await client.fetch<string[]>(`*[_type=="article" && _id in path("drafts.**")]._id`)
  if (drafts.length) console.warn('Open drafts (publish or discard them first):', drafts)

  for (const d of docs) {
    let body = [...(d.body ?? [])]
    const log: string[] = []

    // A leading h1 is the old page title repeated inside the body.
    if (body[0]?._type === 'block' && body[0].style === 'h1') {
      log.push(`drop opening h1 "${text(body[0])}"`)
      body = body.slice(1)
    }
    body = body.flatMap((b) => {
      if (b._type !== 'block') return [b]
      const t = text(b)
      if (/^group credit( block)?$/i.test(t)) {
        log.push(`drop "${t}" heading`)
        return []
      }
      if (t === 'CTA') {
        const heading = CTA_HEADINGS[d.slug]
        log.push(`rename "CTA" -> "${heading}"`)
        return [
          {...b, style: 'h2', children: [{...(b.children?.[0] ?? {_type: 'span'}), text: heading}]},
        ]
      }
      if (
        d.slug.startsWith('ceramic-coating-vs-ppf') &&
        t === 'Does ceramic coating make a car scratch-proof?' &&
        b.style === 'h2'
      ) {
        log.push('FAQ question h2 -> h3')
        return [{...b, style: 'h3'}]
      }
      return [b]
    })

    if (!log.length) continue
    console.log(`\n${d.slug}\n  ${log.join('\n  ')}`)
    if (!process.env.DRY) await client.patch(d._id).set({body}).commit()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
