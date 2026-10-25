import Image from 'next/image'
import GithubSlugger from 'github-slugger'
import {PortableText, type PortableTextBlock, type PortableTextComponents} from 'next-sanity'
import {urlFor} from '@/sanity/image'
import {SmartLink} from './ui'

type Block = PortableTextBlock & {style?: string; children?: {text?: string}[]}

const plain = (b: Block) => (b.children ?? []).map((c) => c.text ?? '').join('')

/**
 * Heading ids follow GitHub's slug rules (the same as the previous site's rehype-slug),
 * so existing #anchor links into articles keep working.
 */
export function headingIds(blocks: Block[]) {
  const slugger = new GithubSlugger()
  const ids = new Map<string, string>()
  const toc: {id: string; text: string; level: number}[] = []
  for (const b of blocks) {
    if (b._type === 'block' && b.style && /^h[1-6]$/.test(b.style)) {
      const text = plain(b)
      const id = slugger.slug(text)
      ids.set(b._key ?? '', id)
      // Body h1s are shown as h2 (the title is the page's only h1), so they list as sections too.
      if (b.style === 'h1' || b.style === 'h2') toc.push({id, text, level: 2})
      else if (b.style === 'h3') toc.push({id, text, level: 3})
    }
  }
  return {ids, toc}
}

export function RichText({value, variant = 'article'}: {value: Block[]; variant?: 'article' | 'legal'}) {
  const {ids} = headingIds(value)
  const components: PortableTextComponents = {
    block: {
      normal: ({children}) => <p className="text-[18px] leading-[1.75] text-body">{children}</p>,
      // The page title is the only h1; headings marked h1 in the migrated body render as h2.
      h1: ({children, value: v}) => (
        <h2
          id={ids.get(v._key ?? '')}
          className="display scroll-mt-24 pt-10 text-[clamp(24px,2.6vw,34px)] leading-[1.15] tracking-[-0.02em]"
        >
          {children}
        </h2>
      ),
      h2: ({children, value: v}) => (
        <h2
          id={ids.get(v._key ?? '')}
          className="display scroll-mt-24 pt-10 text-[clamp(24px,2.6vw,34px)] leading-[1.15] tracking-[-0.02em]"
        >
          {children}
        </h2>
      ),
      h3: ({children, value: v}) => (
        <h3 id={ids.get(v._key ?? '')} className="scroll-mt-24 pt-6 text-[22px] leading-snug font-medium">
          {children}
        </h3>
      ),
      h4: ({children, value: v}) => (
        <h4 id={ids.get(v._key ?? '')} className="scroll-mt-24 pt-4 text-[18px] font-medium">
          {children}
        </h4>
      ),
      blockquote: ({children}) => <blockquote className="rounded-sm bg-mist p-6 text-[22px] leading-relaxed md:p-8">{children}</blockquote>,
    },
    list: {
      bullet: ({children}) => <ul className="list-disc space-y-2 pl-6 marker:text-[#8a93a1]">{children}</ul>,
      number: ({children}) => <ol className="list-decimal space-y-2 pl-6 marker:text-muted">{children}</ol>,
    },
    listItem: ({children}) => <li className="pl-1.5 text-[18px] leading-[1.75] text-body">{children}</li>,
    marks: {
      strong: ({children}) => <strong className="font-semibold text-ink">{children}</strong>,
      em: ({children}) => <em>{children}</em>,
      link: ({children, value: v}) => (
        <SmartLink
          href={(v as {href?: string})?.href ?? '#'}
          className="text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          {children}
        </SmartLink>
      ),
    },
    types: {
      imageWithAlt: ({value: v}) =>
        v?.asset ? (
          <figure className="my-4">
            <Image
              src={urlFor(v).width(1600).url()}
              alt={v.alt ?? ''}
              width={1600}
              height={1000}
              sizes="(min-width: 768px) 720px, 100vw"
              className="h-auto w-full rounded-sm"
            />
          </figure>
        ) : null,
    },
  }

  return <div className={variant === 'article' ? 'space-y-6' : 'space-y-5'}>{<PortableText value={value} components={components} />}</div>
}
