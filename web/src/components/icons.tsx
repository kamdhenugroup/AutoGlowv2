import {siInstagram, siWhatsapp, siYoutube} from 'simple-icons'
import type {SVGProps} from 'react'

type P = SVGProps<SVGSVGElement> & {size?: number}

function Brand({path, size = 18, ...rest}: P & {path: string}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
      <path d={path} />
    </svg>
  )
}

export const WhatsAppIcon = (p: P) => <Brand path={siWhatsapp.path} {...p} />
export const InstagramIcon = (p: P) => <Brand path={siInstagram.path} {...p} />
export const YouTubeIcon = (p: P) => <Brand path={siYoutube.path} {...p} />

export {ArrowRight, ArrowUpRight, CalendarCheck, Clock, Mail, MapPin, Navigation, Phone, Plus, Search, ShieldCheck} from 'lucide-react'
