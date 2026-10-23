'use client'

import {useEffect, useState} from 'react'
import {onSoundChange, setSoundEnabled, soundEnabled} from '@/lib/sound'
import {cn} from '../ui'

/** Four bars that move while sound is on and lie flat when it is off. */
export function SoundToggle({className, tone = 'ink'}: {className?: string; tone?: 'ink' | 'paper'}) {
  const [on, setOn] = useState(true)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the stored choice after hydration
    setOn(soundEnabled())
    return onSoundChange(setOn)
  }, [])
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      onClick={() => setSoundEnabled(!on)}
      className={cn('grid h-11 w-11 place-items-center', tone === 'paper' ? 'text-paper' : 'text-ink', className)}
    >
      <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn('w-[2px] origin-bottom bg-current', on ? 'sound-bar' : '')}
            style={{height: on ? '100%' : '2px', animationDelay: `${i * -0.23}s`}}
          />
        ))}
      </span>
    </button>
  )
}
