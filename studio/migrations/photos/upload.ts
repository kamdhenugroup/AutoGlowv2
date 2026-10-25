/**
 * One-off: uploads the first batch of new AutoGlow photos (24 Oct 2026) and sets them, with alt
 * text, on the home page, About page and six services. Run: npx tsx migrations/photos/upload.ts
 */
import {createClient} from '@sanity/client'
import {readFileSync} from 'node:fs'
import {join} from 'node:path'

const client = createClient({
  projectId: '6qzta0cg',
  dataset: 'production',
  apiVersion: '2026-10-23',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})
const dir = join(process.cwd(), 'migrations/photos')

async function image(file: string, alt: string) {
  const asset = await client.assets.upload('image', readFileSync(join(dir, file)), {filename: file, contentType: 'image/jpeg'})
  return {_type: 'imageWithAlt', asset: {_type: 'reference', _ref: asset._id}, alt}
}

const services: [string, string, string][] = [
  ['paint-protection-film', 'service-paint-protection-film.jpg', 'AutoGlow technician applying clear GlanzPro paint protection film to the front bumper of a white car'],
  ['window-tint', 'service-window-tint.jpg', 'AutoGlow technician applying tint film to the rear window of a silver car'],
  ['interior-protection', 'service-interior-protection.jpg', 'Technician applying GlanzPro interior protection to a beige leather driver seat'],
  ['exterior-protection', 'service-exterior-protection.jpg', 'Water beading on a black car bonnet protected with GlanzPro exterior protection'],
  ['ceramic-coating', 'service-ceramic-coating.jpg', 'Technician applying ceramic coating to the front wing of a deep blue car'],
  ['vehicle-wrapping', 'service-vehicle-wrapping.jpg', 'AutoGlow installer stretching satin green wrap film over a white car fender with a heat gun'],
]

async function main() {
  const heroDesk = await image('hero-desktop.jpg', 'Dark blue sedan in the bright AutoGlow detailing studio')
  const heroMob = await image('hero-mobile.jpg', 'Dark blue sedan in the bright AutoGlow detailing studio')
  const glanz = await image('glanzpro.jpg', 'Black luxury SUV with GlanzPro ceramic coating and detailer spray bottles')
  await client
    .patch('homePage')
    .set({'hero.image': heroDesk, 'hero.mobileImage': heroMob, 'glanzPro.image': glanz})
    .commit()
  console.log('set homePage')

  const about = await image('about.jpg', 'AutoGlow technicians detailing a white SUV and a grey sedan in a bright studio')
  await client.patch('aboutPage').set({image: about}).commit()
  console.log('set aboutPage')

  for (const [slug, file, alt] of services) {
    const id = await client.fetch<string>(`*[_type == "service" && slug.current == $slug][0]._id`, {slug})
    if (!id) {
      console.log('no service', slug)
      continue
    }
    await client.patch(id).set({image: await image(file, alt)}).commit()
    console.log('set', slug)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
