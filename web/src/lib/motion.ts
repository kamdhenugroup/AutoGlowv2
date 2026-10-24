/** True when the visitor has not asked for less motion or less data. */
export function motionAllowed() {
  if (typeof window === 'undefined') return false
  const saveData = (navigator as Navigator & {connection?: {saveData?: boolean}}).connection?.saveData
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !saveData
}
