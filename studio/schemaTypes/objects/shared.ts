import {defineArrayMember, defineField, defineType} from 'sanity'

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'href',
      title: 'URL or path',
      type: 'string',
      description: 'A site path such as /book-inspection, or a full URL, mailto: or tel: link.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {select: {title: 'label', subtitle: 'href'}},
})

export const faq = defineType({
  name: 'faq',
  title: 'Question',
  type: 'object',
  fields: [
    defineField({name: 'question', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'answer', type: 'text', rows: 4, validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'question', subtitle: 'answer'}},
})

export const feature = defineType({
  name: 'feature',
  title: 'Feature',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'body', type: 'text', rows: 3}),
  ],
  preview: {select: {title: 'title', subtitle: 'body'}},
})

export const stat = defineType({
  name: 'stat',
  title: 'Statistic',
  type: 'object',
  fields: [
    defineField({name: 'value', type: 'string', description: 'For example 2500 or 4.8', validation: (rule) => rule.required()}),
    defineField({name: 'suffix', type: 'string', description: 'For example + or ★ or Yrs'}),
    defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
  ],
  preview: {
    select: {value: 'value', suffix: 'suffix', label: 'label'},
    prepare: ({value, suffix, label}) => ({title: `${value ?? ''}${suffix ?? ''}`, subtitle: label}),
  },
})

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Describe the image for people who cannot see it.',
    }),
  ],
})

/** Rich text for articles and legal pages. */
export const richText = defineType({
  name: 'richText',
  title: 'Rich text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Heading 1', value: 'h1'},
        {title: 'Heading 2', value: 'h2'},
        {title: 'Heading 3', value: 'h3'},
        {title: 'Heading 4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [defineField({name: 'href', type: 'string', title: 'URL'})],
          }),
        ],
      },
    }),
    defineArrayMember({type: 'imageWithAlt'}),
  ],
})
