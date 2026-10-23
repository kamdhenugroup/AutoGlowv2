import {defineField, defineType} from 'sanity'

/**
 * Page metadata. Empty title/description fall back to the site defaults in Site Settings.
 * The two switches mirror how each page emitted metadata before the redesign, so search
 * engines see exactly the same tags after cutover.
 */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: {collapsible: true, collapsed: false},
  fields: [
    defineField({
      name: 'title',
      title: 'Meta title',
      type: 'string',
      description: 'Leave empty to use the site default title.',
      validation: (rule) => rule.max(90).warning('Search engines usually cut titles after about 60 characters.'),
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(320).warning('Keep it under about 160 characters where possible.'),
    }),
    defineField({
      name: 'canonical',
      title: 'Emit canonical URL and og:url for this page',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'twitter',
      title: 'Emit Twitter title and description',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'noindex',
      title: 'Hide from search engines (noindex)',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
