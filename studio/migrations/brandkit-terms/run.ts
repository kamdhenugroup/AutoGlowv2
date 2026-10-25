/**
 * One-off (25 Oct 2026): rewrites the Brand Kit for the Studio Light brand, uploads its three
 * logos, creates the Terms page, and points the footer "Legal" link at it as "Terms" next to a
 * new "Brand Kit" link. The previous Brand Kit document is saved to backup-brandkit.json first.
 * Run: npx tsx migrations/brandkit-terms/run.ts
 */
import {createClient} from '@sanity/client'
import {readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'

const client = createClient({
  projectId: '6qzta0cg',
  dataset: 'production',
  apiVersion: '2026-10-23',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})
const dir = join(process.cwd(), 'migrations/brandkit-terms')
let n = 0
const key = () => `k${(n++).toString(36).padStart(4, '0')}`

async function image(file: string, contentType: string, alt: string) {
  const asset = await client.assets.upload('image', readFileSync(join(dir, file)), {
    filename: file,
    contentType,
  })
  return {_type: 'imageWithAlt', asset: {_type: 'reference', _ref: asset._id}, alt}
}

// Portable Text helpers for the Terms page.
type Mark = {_key: string; _type: 'link'; href: string}
function block(style: string, text: string, listItem?: 'bullet') {
  // [label](href) inside the text becomes a link.
  const markDefs: Mark[] = []
  const children: {_type: 'span'; _key: string; text: string; marks: string[]}[] = []
  let rest = text
  const re = /\[([^\]]+)\]\(([^)]+)\)/
  while (rest) {
    const m = rest.match(re)
    if (!m || m.index === undefined) {
      children.push({_type: 'span', _key: key(), text: rest, marks: []})
      break
    }
    if (m.index)
      children.push({_type: 'span', _key: key(), text: rest.slice(0, m.index), marks: []})
    const mk: Mark = {_key: key(), _type: 'link', href: m[2]}
    markDefs.push(mk)
    children.push({_type: 'span', _key: key(), text: m[1], marks: [mk._key]})
    rest = rest.slice(m.index + m[0].length)
  }
  return {
    _type: 'block',
    _key: key(),
    style,
    markDefs,
    children,
    ...(listItem ? {listItem, level: 1} : {}),
  }
}
const h = (t: string) => block('h2', t)
const p = (t: string) => block('normal', t)
const li = (t: string) => block('normal', t, 'bullet')

const TERMS = [
  h('1. About these terms'),
  p(
    'These terms apply when you use autoglowcare.in and when you book or receive a service from AutoGlow Car Care Expert ("AutoGlow", "we", "us"), part of Kamdhenu Group. By using the website or booking with us, you agree to them. Please read them together with our [Privacy Policy](/privacy).',
  ),
  h('2. Who we are'),
  p(
    'AutoGlow runs automotive protection and detailing studios in Ahmedabad and Kochi (India) and in Dubai and Abu Dhabi (UAE). Addresses, opening hours and contact numbers for each studio are on our [Locations](/locations) page.',
  ),
  h('3. Using this website'),
  p(
    'The information on this website describes our services in general terms. We keep it accurate and up to date, but it is not a quotation or a promise that a service suits your vehicle. You may use the website for your own, non-commercial purposes. You may not misuse it, try to disrupt it, or copy its content in bulk.',
  ),
  h('4. Bookings, inspections and quotes'),
  li(
    'A booking made on this website, by WhatsApp or by phone is a request. It is confirmed when our team contacts you with a date and time.',
  ),
  li(
    'We inspect every vehicle before work starts. The price, the scope of work and the time needed are confirmed in a written quote after that inspection.',
  ),
  li(
    'Prices shown or mentioned anywhere on this website are indicative. The quote or invoice you receive is final, including applicable taxes.',
  ),
  li(
    'If you need to change or cancel an appointment, please tell your studio as early as you can.',
  ),
  h('5. Your vehicle'),
  li('Please remove valuables and personal items before handing over your vehicle.'),
  li(
    'Existing damage, such as chips, dents, scratches or worn leather, is recorded at inspection. Some treatments can make existing defects more visible; we will tell you when that applies.',
  ),
  li(
    'Results depend on the condition, age and paint of each vehicle. We will explain what a treatment can and cannot achieve before we start.',
  ),
  h('6. Warranties and aftercare'),
  p(
    'Paint Protection Film, coatings, tint and other products carry the warranty stated in writing when your vehicle is handed back. A warranty applies only when the aftercare instructions given at handover are followed, and does not cover damage from accidents, misuse, improper washing or repairs carried out elsewhere.',
  ),
  h('7. Photographs'),
  p(
    'We photograph vehicles before, during and after work to record their condition and our workmanship. We will ask your permission before publishing any photograph in which your vehicle or its number plate can be identified.',
  ),
  h('8. Names, logos and content'),
  p(
    'AutoGlow, GlanzPro and their logos belong to Kamdhenu Group, as do the text, photographs and design of this website. You may not use them without our written permission. Names and logos of car makers shown on this website belong to their owners and are used only to identify the vehicles we work on.',
  ),
  h('9. Other websites and services'),
  p(
    'This website links to services run by others, such as WhatsApp, Google Maps, YouTube and Instagram. Their own terms and privacy policies apply when you use them, and we are not responsible for their content.',
  ),
  h('10. Liability'),
  p(
    'To the extent the law allows, we are not liable for indirect or consequential loss arising from use of this website. Nothing in these terms limits any right you have by law as a consumer, or our liability where the law does not allow it to be limited.',
  ),
  h('11. Changes to these terms'),
  p(
    'We may update these terms from time to time. The date at the top of this page shows when they last changed. The version shown when you book applies to that booking.',
  ),
  h('12. Governing law'),
  p(
    'These terms are governed by the laws of India, and the courts at Ahmedabad, Gujarat have jurisdiction. For services carried out at our studios in the UAE, the laws of the United Arab Emirates apply to that service.',
  ),
  h('13. Contact us'),
  p('If you have any questions about these terms, please contact us at:'),
  p('[info@autoglowcare.in](mailto:info@autoglowcare.in)'),
]

async function main() {
  const old = await client.getDocument('brandkitPage')
  writeFileSync(join(dir, 'backup-brandkit.json'), JSON.stringify(old, null, 1))

  const [logo, mark, glanz] = await Promise.all([
    image('autoglow-logo.png', 'image/png', 'AutoGlow Car Care Expert logo'),
    image('autoglow-mark.svg', 'image/svg+xml', 'AutoGlow steering-wheel mark'),
    image('glanzpro-logo.png', 'image/png', 'GlanzPro logo'),
  ])

  await client
    .patch('brandkitPage')
    .set({
      eyebrow: 'Brand Kit',
      heading: 'Brand Kit.',
      intro:
        'How AutoGlow looks, sounds and signs its work. One bright, precise studio language for the website, our studios, social media and print. Use this page whenever you make something that carries our name.',
      principles: [
        {
          _key: key(),
          _type: 'feature',
          title: 'Clarity',
          body: 'Bright light, white space and honest photographs. Nothing gets between the customer and the work.',
        },
        {
          _key: key(),
          _type: 'feature',
          title: 'Precision',
          body: 'Straight lines, exact spacing and real numbers. We show the detail, because the detail is the job.',
        },
        {
          _key: key(),
          _type: 'feature',
          title: 'Calm',
          body: 'Premium without the noise: one accent colour, few words, no gimmicks.',
        },
      ],
      logoEyebrow: 'Logos',
      logoHeading: 'Three marks, three jobs',
      logoBody:
        'Use the files exactly as supplied. Never redraw, recolour, stretch, outline or add effects to a logo, and never place two of them on the same object. Leave clear space around each logo at least the height of the steering wheel.',
      logoMinWidth: 'Minimum width of the AutoGlow logo: 120 px on screen, 30 mm in print.',
      logos: [
        {
          _key: key(),
          _type: 'logoUse',
          name: 'AutoGlow logo',
          tone: 'white',
          image: logo,
          usage:
            'The studio. Signage, uniforms, the website, social media, documents and print. Always the full lock-up on its navy panel.',
        },
        {
          _key: key(),
          _type: 'logoUse',
          name: 'Steering-wheel mark',
          tone: 'mist',
          image: mark,
          usage:
            'Favicon, app icon and social profile picture. Only where the full logo would be too small to read.',
        },
        {
          _key: key(),
          _type: 'logoUse',
          name: 'GlanzPro',
          tone: 'black',
          image: glanz,
          usage:
            'Our product line. Only on GlanzPro labels, packaging and product pages; never on walls or uniforms.',
        },
      ],
      paletteHeading: 'Colour palette',
      palette: [
        {
          _key: key(),
          _type: 'swatch',
          name: 'Ink',
          hex: '#031533',
          usage: 'Headlines, buttons, logo panel',
        },
        {_key: key(), _type: 'swatch', name: 'Body', hex: '#18243A', usage: 'Running text'},
        {
          _key: key(),
          _type: 'swatch',
          name: 'Muted',
          hex: '#556070',
          usage: 'Captions and secondary text',
        },
        {
          _key: key(),
          _type: 'swatch',
          name: 'Signature Red',
          hex: '#CD2B34',
          usage: 'The logo only; never for text',
        },
        {_key: key(), _type: 'swatch', name: 'Line', hex: '#DDE0E5', usage: 'Dividers and borders'},
        {
          _key: key(),
          _type: 'swatch',
          name: 'Mist',
          hex: '#F2F3F5',
          usage: 'Alternate section background',
        },
        {_key: key(), _type: 'swatch', name: 'Paper', hex: '#FFFFFF', usage: 'Page background'},
      ],
      typography: [
        {
          _key: key(),
          _type: 'typeSpecimen',
          style: 'display',
          eyebrow: 'Typography / Display',
          name: 'Mona Sans, wide',
          usage: 'Headlines. Large, tight and in sentence case, ending with a full stop.',
          sample: 'Protect. Enhance. Preserve.',
        },
        {
          _key: key(),
          _type: 'typeSpecimen',
          style: 'body',
          eyebrow: 'Typography / Text',
          name: 'Mona Sans Regular',
          usage: 'All running text, at 18 px on the website with generous line spacing.',
          sample:
            'Paint Protection Film stops stone chips and scratches before they reach the paint, and heals light swirl marks in the sun.',
        },
        {
          _key: key(),
          _type: 'typeSpecimen',
          style: 'label',
          eyebrow: 'Typography / Labels',
          name: 'Mona Sans Medium',
          usage: 'Buttons, section labels and navigation, at 15 px.',
          sample: 'Book Inspection · WhatsApp Us · Our Studios',
        },
      ],
      photoHeading: 'Photography',
      photoIntro:
        'Our photographs look like a real commercial shoot in a bright studio: true colours, real reflections and the work in sharp focus.',
      photography: [
        {
          _key: key(),
          _type: 'feature',
          title: 'Bright and real',
          body: 'Daylight or a white studio with soft light panels. No dark, moody or neon looks, and nothing that reads as CGI.',
        },
        {
          _key: key(),
          _type: 'feature',
          title: 'The work in focus',
          body: 'Hands, tools and surfaces: film being laid, water beading, a polisher halfway across a panel.',
        },
        {
          _key: key(),
          _type: 'feature',
          title: 'Our people',
          body: 'Technicians in navy work wear and black gloves, seen from the shoulders down or from behind.',
        },
        {
          _key: key(),
          _type: 'feature',
          title: 'Clean frames',
          body: 'No car-maker badges or readable number plates. Logos only where they would really be: a wall sign, a uniform, a product label.',
        },
      ],
      voiceHeading: 'Voice & tone',
      voice: [
        {
          _key: key(),
          _type: 'voiceRule',
          title: 'Confident, never loud',
          body: 'We say what a treatment does, plainly, and let the result speak. No capitals, exclamation marks or superlatives.',
          doExample: 'Paint Protection Film stops stone chips before they reach the paint.',
          dontExample: 'The ULTIMATE protection your car will EVER need!!!',
        },
        {
          _key: key(),
          _type: 'voiceRule',
          title: 'Expert, in plain words',
          body: 'We know the chemistry, but we explain the benefit to the owner first and the technical detail second.',
          doExample: 'A ceramic coating makes washing easier and keeps the gloss for years.',
          dontExample: 'Our SiO2 nano-matrix cross-links with the clear coat.',
        },
        {
          _key: key(),
          _type: 'voiceRule',
          title: 'Honest about limits',
          body: 'We tell customers what a service will not do. It builds the trust that sells the right protection.',
          doExample: 'Ceramic coating will not stop stone chips. PPF will.',
          dontExample: 'Ceramic coating makes your car scratch-proof.',
        },
        {
          _key: key(),
          _type: 'voiceRule',
          title: 'Specific and local',
          body: 'Name the studio, the city and the time. Real details make it easy to visit us.',
          doExample: 'Book an inspection at our Kochi studio.',
          dontExample: 'Visit us anytime, anywhere.',
        },
      ],
    })
    .commit()
  console.log('brandkitPage updated')

  await client.createOrReplace({
    _id: 'termsPage',
    _type: 'termsPage',
    heading: 'Terms & Conditions',
    updated: '2026-10-25',
    body: TERMS,
    backLink: {_type: 'link', label: 'Back to Home', href: '/'},
    seo: {
      _type: 'seo',
      title: 'Terms & Conditions | AutoGlow Car Care Expert',
      description:
        'The terms for using autoglowcare.in and for booking and receiving services at AutoGlow studios in India and the UAE.',
    },
  })
  console.log('termsPage created')

  // Footer: "Legal" -> "Terms", and Brand Kit added before the sitemap link.
  const settings = await client.fetch<{
    _id: string
    legalLinks: {_key: string; href: string; label: string}[]
  }>(`*[_type=="siteSettings" && !(_id in path("drafts.**"))][0]{_id, legalLinks}`)
  const links = settings.legalLinks.map((l) => (l.href === '/terms' ? {...l, label: 'Terms'} : l))
  if (!links.some((l) => l.href === '/brandkit')) {
    const i = links.findIndex((l) => l.href === '/sitemap.xml')
    links.splice(i < 0 ? links.length : i, 0, {
      _key: key(),
      _type: 'link',
      href: '/brandkit',
      label: 'Brand Kit',
    } as never)
  }
  await client.patch(settings._id).set({legalLinks: links}).commit()
  console.log('footer links:', links.map((l) => l.label).join(' · '))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
