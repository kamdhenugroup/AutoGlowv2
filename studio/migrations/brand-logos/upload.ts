/**
 * One-off: uploads the car brand logos (ink, SVG) and sets each brand's logo.
 * Sources: Simple Icons (CC0) for 17 brands; car-brand-logos (MIT) for Mercedes-Benz,
 * Jaguar and Land Rover, recoloured to the site ink. Run: npx tsx migrations/brand-logos/upload.ts
 */
import {createClient} from '@sanity/client'
import {readFileSync, readdirSync} from 'node:fs'
import {join} from 'node:path'

const client = createClient({
  projectId: '6qzta0cg',
  dataset: 'production',
  apiVersion: '2026-10-23',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const dir = join(process.cwd(), 'migrations/brand-logos')

async function main() {
  const brands: {_id: string; name: string; icon: string}[] = await client.fetch(`*[_type == "brand"]{_id, name, icon}`)
  const files = new Set(readdirSync(dir).filter((f) => f.endsWith('.svg')))
  for (const b of brands) {
    const file = `${b.icon}.svg`
    if (!files.has(file)) {
      console.log('no logo for', b.name)
      continue
    }
    const asset = await client.assets.upload('image', readFileSync(join(dir, file)), {filename: `${b.icon}-logo.svg`, contentType: 'image/svg+xml'})
    await client.patch(b._id).set({logo: {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}}).commit()
    console.log('set', b.name)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
