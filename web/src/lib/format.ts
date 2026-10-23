const short = new Intl.DateTimeFormat('en-US', {timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric'})
const long = new Intl.DateTimeFormat('en-US', {timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric'})

/** "Jul 9, 2026" */
export const shortDate = (iso?: string | null) => (iso ? short.format(new Date(iso)) : '')
/** "July 9, 2026" */
export const longDate = (iso?: string | null) => (iso ? long.format(new Date(iso)) : '')
