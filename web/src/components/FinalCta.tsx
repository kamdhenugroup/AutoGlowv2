import {getSettings} from '@/lib/data'
import {Button} from './ui'

export async function FinalCta() {
  const {finalCta: c} = await getSettings()
  if (!c?.heading) return null
  return (
    <section className="bg-ink text-paper">
      <div className="wrap flex flex-col gap-10 py-[clamp(80px,10vw,144px)] lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[860px]">
          <h2 className="display text-[clamp(36px,4.8vw,68px)]">{c.heading}</h2>
          <p className="mt-6 max-w-[520px] text-[18px] leading-relaxed text-[#c9d0db]">{c.body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {c.primary?.href && (
            <Button href={c.primary.href} variant="onImage">
              {c.primary.label}
            </Button>
          )}
          {c.secondary?.href && (
            <Button href={c.secondary.href} variant="onImageGhost">
              {c.secondary.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
