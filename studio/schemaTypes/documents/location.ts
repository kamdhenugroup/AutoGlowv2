import {defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons/Pin'

export const location = defineType({
  name: 'location',
  title: 'Studio',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({name: 'title', type: 'string', description: 'For example "AutoGlow Ahmedabad".', validation: (rule) => rule.required()}),
    defineField({name: 'city', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'country', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'orderRank', title: 'Display order', type: 'number', validation: (rule) => rule.required().integer()}),
    defineField({name: 'address', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({
      name: 'shortAddress',
      title: 'Short address',
      type: 'string',
      description: 'Used in the studio list on the booking page.',
    }),
    defineField({name: 'hours', type: 'string'}),
    defineField({name: 'phone', type: 'string', description: 'Digits only, without country code.'}),
    defineField({name: 'whatsapp', title: 'WhatsApp number', type: 'string', description: 'Digits only, without country code.'}),
    defineField({name: 'mapUrl', title: 'Google Maps link', type: 'url'}),
    defineField({name: 'embedUrl', title: 'Google Maps embed URL', type: 'url'}),
  ],
  orderings: [{title: 'Display order', name: 'order', by: [{field: 'orderRank', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'country'}},
})
