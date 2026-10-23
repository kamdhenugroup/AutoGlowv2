/**
 * Minimal Markdown -> Portable Text converter for the legacy MDX articles.
 * Supports what those files use: headings, paragraphs, bullet/numbered lists (nested),
 * blockquotes, horizontal rules (dropped), strong, emphasis and links.
 * Text is preserved exactly; only Markdown syntax is removed.
 */
import {marked, type Token, type Tokens} from 'marked'
import {randomUUID} from 'node:crypto'

type Span = {_type: 'span'; _key: string; text: string; marks: string[]}
type MarkDef = {_type: 'link'; _key: string; href: string}
export type Block = {
  _type: 'block'
  _key: string
  style: string
  children: Span[]
  markDefs: MarkDef[]
  listItem?: 'bullet' | 'number'
  level?: number
}

const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

function decode(s: string) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function inline(tokens: Token[] | undefined, marks: string[], markDefs: MarkDef[], out: Span[]) {
  for (const t of tokens ?? []) {
    switch (t.type) {
      case 'strong':
        inline((t as Tokens.Strong).tokens, [...marks, 'strong'], markDefs, out)
        break
      case 'em':
        inline((t as Tokens.Em).tokens, [...marks, 'em'], markDefs, out)
        break
      case 'link': {
        const l = t as Tokens.Link
        const def: MarkDef = {_type: 'link', _key: key(), href: l.href}
        markDefs.push(def)
        inline(l.tokens, [...marks, def._key], markDefs, out)
        break
      }
      case 'codespan':
        out.push({_type: 'span', _key: key(), text: decode((t as Tokens.Codespan).text), marks})
        break
      case 'br':
        out.push({_type: 'span', _key: key(), text: '\n', marks})
        break
      case 'text': {
        const tt = t as Tokens.Text
        if (tt.tokens && tt.tokens.length) inline(tt.tokens, marks, markDefs, out)
        else out.push({_type: 'span', _key: key(), text: decode(tt.text), marks})
        break
      }
      case 'escape':
        out.push({_type: 'span', _key: key(), text: decode((t as Tokens.Escape).text), marks})
        break
      default:
        if ('text' in t) out.push({_type: 'span', _key: key(), text: decode(String((t as {text: string}).text)), marks})
    }
  }
}

function block(tokens: Token[] | undefined, style: string, extra: Partial<Block> = {}): Block {
  const markDefs: MarkDef[] = []
  const children: Span[] = []
  inline(tokens, [], markDefs, children)
  // merge adjacent spans with identical marks
  const merged: Span[] = []
  for (const c of children) {
    const prev = merged[merged.length - 1]
    if (prev && prev.marks.join() === c.marks.join()) prev.text += c.text
    else merged.push({...c})
  }
  return {_type: 'block', _key: key(), style, children: merged.length ? merged : [{_type: 'span', _key: key(), text: '', marks: []}], markDefs, ...extra}
}

function list(l: Tokens.List, level: number, out: Block[]) {
  for (const item of l.items) {
    const textTokens: Token[] = []
    const nested: Tokens.List[] = []
    for (const t of item.tokens) {
      if (t.type === 'list') nested.push(t as Tokens.List)
      else if (t.type === 'text' || t.type === 'paragraph') textTokens.push(...(((t as Tokens.Text).tokens ?? [t]) as Token[]))
      else textTokens.push(t)
    }
    out.push(block(textTokens, 'normal', {listItem: l.ordered ? 'number' : 'bullet', level}))
    for (const n of nested) list(n, level + 1, out)
  }
}

export function markdownToBlocks(md: string): Block[] {
  const tokens = marked.lexer(md)
  const out: Block[] = []
  for (const t of tokens) {
    switch (t.type) {
      case 'heading': {
        const h = t as Tokens.Heading
        out.push(block(h.tokens, `h${Math.min(h.depth, 4)}`))
        break
      }
      case 'paragraph':
        out.push(block((t as Tokens.Paragraph).tokens, 'normal'))
        break
      case 'list':
        list(t as Tokens.List, 1, out)
        break
      case 'blockquote':
        for (const inner of (t as Tokens.Blockquote).tokens) {
          if (inner.type === 'paragraph') out.push(block((inner as Tokens.Paragraph).tokens, 'blockquote'))
        }
        break
      case 'space':
      case 'hr':
        break
      default:
        throw new Error(`Unsupported Markdown token "${t.type}": ${t.raw.slice(0, 80)}`)
    }
  }
  return out
}

/** Plain text of blocks, used to verify that no words were lost in conversion. */
export function blocksToText(blocks: Block[]) {
  return blocks.map((b) => b.children.map((c) => c.text).join('')).join('\n')
}
