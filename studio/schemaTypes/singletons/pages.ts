import {defineArrayMember, defineField, defineType, type FieldDefinition} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'
import {DocumentIcon} from '@sanity/icons/Document'

const seoField = defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'})
const groups = [
  {name: 'content', title: 'Content', default: true},
  {name: 'seo', title: 'SEO'},
]
const str = (name: string, title?: string) => defineField({name, title, type: 'string', group: 'content'})
const txt = (name: string, title?: string, rows = 3) => defineField({name, title, type: 'text', rows, group: 'content'})
const arr = (name: string, type: string, title?: string) =>
  defineField({name, title, type: 'array', group: 'content', of: [defineArrayMember({type})]})
const obj = (name: string, title: string, fields: FieldDefinition[]) =>
  defineField({
    name,
    title,
    type: 'object',
    group: 'content',
    options: {collapsible: true},
    // Groups only exist at document level; strip them from nested fields.
    fields: fields.map((f) => {
      const {group: _group, ...rest} = f as FieldDefinition & {group?: string}
      return rest as FieldDefinition
    }),
  })

function page(name: string, title: string, fields: FieldDefinition[], icon = DocumentIcon) {
  return defineType({
    name,
    title,
    type: 'document',
    icon,
    groups,
    fields: [...fields, seoField],
    preview: {prepare: () => ({title})},
  })
}

export const homePage = page(
  'homePage',
  'Home',
  [
    obj('hero', 'Hero', [
      arr('headingLines', 'string', 'Heading lines'),
      txt('subheading'),
      defineField({name: 'primary', type: 'link'}),
      defineField({name: 'secondary', type: 'link'}),
      defineField({name: 'image', type: 'imageWithAlt'}),
    ]),
    obj('standard', 'The AutoGlow Standard', [
      str('eyebrow'),
      txt('statement'),
      txt('tagline'),
      defineField({name: 'link', type: 'link'}),
    ]),
    str('brandsHeading', 'Brands strip heading'),
    str('servicesHeading', 'Services heading'),
    defineField({name: 'servicesLink', title: 'Services link', type: 'link', group: 'content'}),
    obj('glanzPro', 'GlanzPro', [
      str('label'),
      str('heading'),
      str('statement'),
      txt('body'),
      arr('features', 'feature'),
      defineField({name: 'image', type: 'imageWithAlt'}),
    ]),
    arr('stats', 'stat'),
    str('studiosHeading', 'Studios heading'),
    defineField({name: 'studiosLink', title: 'Studios link', type: 'link', group: 'content'}),
  ],
  HomeIcon,
)

export const servicesPage = page('servicesPage', 'Services', [
  str('heading'),
  txt('intro'),
  str('warrantyLabel', 'Warranty label'),
  str('exploreLabel', 'Card link label'),
  str('glanzProBadge', 'GlanzPro badge'),
  obj('detail', 'Service page labels', [
    str('breadcrumbHome', 'Breadcrumb: home'),
    str('breadcrumbServices', 'Breadcrumb: services'),
    str('poweredByLabel', 'Powered by label'),
    str('protocolLabel', 'Protocol heading'),
    str('faqHeading', 'FAQ heading'),
    str('ctaHeading', 'Closing box heading'),
    txt('ctaBody', 'Closing box text'),
    str('ctaButtonPrefix', 'Button text before the service name'),
    str('shortsHeading', 'Videos heading'),
  ]),
])

export const aboutPage = page('aboutPage', 'About', [
  str('heading'),
  txt('intro'),
  str('legacyEyebrow', 'Legacy eyebrow'),
  str('legacyHeading', 'Legacy heading'),
  arr('legacyBody', 'text', 'Legacy paragraphs'),
  txt('quote'),
  arr('pillars', 'feature', 'Mission and vision'),
  defineField({name: 'image', type: 'imageWithAlt', group: 'content'}),
])

export const brandsPage = page('brandsPage', 'Brands', [
  str('heading'),
  txt('intro'),
  arr('body', 'text', 'Paragraphs'),
])

export const locationsPage = page('locationsPage', 'Locations', [
  str('heading'),
  txt('intro'),
  str('addressLabel'),
  str('hoursLabel'),
  str('contactLabel'),
  str('whatsappLabel'),
  str('directionsLabel'),
])

export const articlesPage = page('articlesPage', 'Articles', [
  str('heading'),
  txt('intro'),
  str('allLabel', 'All categories label'),
  str('readMoreLabel'),
  str('backLabel', 'Back link on articles'),
  str('shareLabel', 'Share label'),
  str('authorLabel', 'Author label'),
  str('tocLabel', 'Table of contents label'),
  str('searchPlaceholder'),
  str('noResultsHeading'),
  txt('noResultsBody'),
])

export const bookInspectionPage = page('bookInspectionPage', 'Book Inspection', [
  str('heading'),
  txt('intro'),
  str('callLabel', 'Call heading'),
  arr('callLines', 'link', 'Call lines'),
  str('whatsappLabel', 'WhatsApp heading'),
  defineField({name: 'whatsappLink', title: 'WhatsApp link', type: 'link', group: 'content'}),
  str('formHeading'),
  txt('formIntro'),
  obj('fields', 'Form labels', [
    str('name'),
    str('phone'),
    str('phonePlaceholder'),
    str('city'),
    str('cityPlaceholder'),
    str('service'),
    str('servicePlaceholder'),
    str('date'),
    str('message'),
    str('submit'),
    str('submitting'),
    str('success'),
  ]),
  str('studiosHeading'),
  str('hoursHeading'),
  str('hoursDays'),
])

export const whatsappPage = page('whatsappPage', 'WhatsApp', [
  str('eyebrow'),
  str('heading'),
  txt('intro'),
  str('studioLabel', 'Label under each city'),
  str('chatLabel', 'Button label'),
  defineField({name: 'backLink', type: 'link', group: 'content'}),
])

export const landingPage = page('landingPage', 'Landing (Meta Ads)', [
  str('heading'),
  str('headingHighlight', 'Highlighted part of the heading'),
  txt('intro'),
  arr('stats', 'stat'),
  arr('features', 'feature'),
  str('formEyebrow'),
  str('formHeading'),
  txt('formIntro'),
  arr('formLabels', 'string', 'Form step labels (in order)'),
  str('locationOptionSuffix', 'Text after each studio city (e.g. " Studio")'),
  str('carPlaceholder'),
  str('namePlaceholder'),
  str('phonePrefix'),
  str('phonePlaceholder'),
  str('submitLabel'),
  str('errorRequired', 'Error: missing fields'),
  str('errorPhone', 'Error: invalid phone'),
  str('successHeading'),
  txt('successBody'),
  str('successButton'),
  str('leadSource', 'Lead source label'),
  txt('whatsappMessage', 'WhatsApp message template', 6),
  str('galleryEyebrow'),
  str('galleryHeading'),
  txt('galleryIntro'),
  arr('galleryEmbeds', 'url', 'Video embed URLs'),
  str('copyright'),
  arr('footerLinks', 'link'),
])

export const privacyPage = page('privacyPage', 'Privacy', [
  str('heading'),
  defineField({name: 'body', type: 'richText', group: 'content'}),
  defineField({name: 'backLink', type: 'link', group: 'content'}),
])

export const brandkitPage = page('brandkitPage', 'Brand Kit', [
  str('eyebrow'),
  str('heading'),
  txt('intro'),
  defineField({
    name: 'principles',
    type: 'array',
    group: 'content',
    of: [defineArrayMember({type: 'feature'})],
  }),
  str('logoEyebrow'),
  str('logoHeading'),
  txt('logoBody'),
  str('logoMinWidth'),
  str('paletteHeading'),
  defineField({
    name: 'palette',
    type: 'array',
    group: 'content',
    of: [
      defineArrayMember({
        type: 'object',
        name: 'swatch',
        fields: [defineField({name: 'name', type: 'string'}), defineField({name: 'hex', type: 'string'})],
        preview: {select: {title: 'name', subtitle: 'hex'}},
      }),
    ],
  }),
  defineField({
    name: 'typography',
    type: 'array',
    group: 'content',
    of: [
      defineArrayMember({
        type: 'object',
        name: 'typeSpecimen',
        fields: [
          defineField({name: 'eyebrow', type: 'string'}),
          defineField({name: 'name', type: 'string'}),
          defineField({name: 'usage', type: 'text', rows: 2}),
          defineField({name: 'sample', type: 'text', rows: 2}),
        ],
        preview: {select: {title: 'name', subtitle: 'eyebrow'}},
      }),
    ],
  }),
  str('voiceHeading'),
  defineField({
    name: 'voice',
    type: 'array',
    group: 'content',
    of: [
      defineArrayMember({
        type: 'object',
        name: 'voiceRule',
        fields: [
          defineField({name: 'title', type: 'string'}),
          defineField({name: 'body', type: 'text', rows: 3}),
          defineField({name: 'doExample', title: 'Do', type: 'string'}),
          defineField({name: 'dontExample', title: "Don't", type: 'string'}),
        ],
        preview: {select: {title: 'title'}},
      }),
    ],
  }),
])

export const singletonTypes = [
  homePage,
  servicesPage,
  aboutPage,
  brandsPage,
  locationsPage,
  articlesPage,
  bookInspectionPage,
  whatsappPage,
  landingPage,
  privacyPage,
  brandkitPage,
]
