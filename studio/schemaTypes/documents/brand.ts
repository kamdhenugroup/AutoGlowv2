import {defineField, defineType} from 'sanity'
import {StarIcon} from '@sanity/icons/Star'

export const brand = defineType({
  name: 'brand',
  title: 'Car brand',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'name'}, validation: (rule) => rule.required()}),
    defineField({name: 'orderRank', title: 'Display order', type: 'number', validation: (rule) => rule.required().integer()}),
    defineField({
      name: 'icon',
      title: 'Icon key',
      type: 'string',
      description: 'Simple Icons key, for example "mercedes".',
    }),
    defineField({name: 'logo', title: 'Logo (optional)', type: 'image', description: 'Overrides the icon when set.'}),
  ],
  orderings: [{title: 'Display order', name: 'order', by: [{field: 'orderRank', direction: 'asc'}]}],
  preview: {select: {title: 'name', media: 'logo'}},
})
