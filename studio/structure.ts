import type {StructureResolver} from 'sanity/structure'
import {CogIcon} from '@sanity/icons/Cog'
import {DocumentsIcon} from '@sanity/icons/Documents'

const PAGES: [string, string][] = [
  ['homePage', 'Home'],
  ['servicesPage', 'Services'],
  ['aboutPage', 'About'],
  ['brandsPage', 'Brands'],
  ['locationsPage', 'Locations'],
  ['articlesPage', 'Articles'],
  ['bookInspectionPage', 'Book Inspection'],
  ['whatsappPage', 'WhatsApp'],
  ['landingPage', 'Landing (Meta Ads)'],
  ['privacyPage', 'Privacy'],
  ['termsPage', 'Terms'],
  ['brandkitPage', 'Brand Kit'],
]

export const structure: StructureResolver = (S) =>
  S.list()
    .title('AutoGlow')
    .items([
      S.listItem()
        .title('Pages')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Pages')
            .items(PAGES.map(([type, title]) => S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type)))),
        ),
      S.divider(),
      S.documentTypeListItem('service').title('Services'),
      S.documentTypeListItem('article').title('Articles'),
      S.documentTypeListItem('location').title('Studios'),
      S.documentTypeListItem('brand').title('Car brands'),
      S.divider(),
      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
