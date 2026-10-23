import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'meta', title: 'Details'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      description: 'Forms the URL: /articles/<slug>. Changing it breaks existing links and search rankings.',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Shown under the title and used as the meta description.',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'coverImage', type: 'imageWithAlt', group: 'content'}),
    defineField({
      name: 'legacyCoverImageUrl',
      title: 'Legacy cover image URL',
      type: 'url',
      group: 'content',
      description: 'Cover from the previous site. Used only when no cover image is uploaded above.',
    }),
    defineField({name: 'body', type: 'richText', group: 'content'}),
    defineField({name: 'date', title: 'Publish date', type: 'date', group: 'meta', validation: (rule) => rule.required()}),
    defineField({name: 'author', type: 'string', group: 'meta'}),
    defineField({name: 'category', type: 'string', group: 'meta'}),
    defineField({name: 'tags', type: 'array', group: 'meta', of: [defineArrayMember({type: 'string'})], options: {layout: 'tags'}}),
    defineField({name: 'featured', type: 'boolean', group: 'meta', initialValue: false}),
    defineField({
      name: 'readingTime',
      title: 'Reading time',
      type: 'string',
      group: 'meta',
      description: 'For example "8 min read". Leave empty to calculate it from the text.',
    }),
  ],
  orderings: [{title: 'Newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
  preview: {
    select: {title: 'title', subtitle: 'date', media: 'coverImage'},
  },
})
