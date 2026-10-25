'use client'

import {useEffect, useState, type ComponentType} from 'react'

type Kind = 'success' | 'error'
type ToasterProps = {position?: 'bottom-right'; theme?: 'light'}

/** Shows a toast. The toast library is loaded on the first call, not with every page. */
export function notify(kind: Kind, message: string) {
  window.dispatchEvent(new CustomEvent('ag-toast', {detail: {kind, message}}))
}

/** Mounts the toast area the first time a toast is shown. */
export function LazyToaster() {
  const [Toaster, setToaster] = useState<ComponentType<ToasterProps> | null>(null)
  useEffect(() => {
    const show = async (e: Event) => {
      const {kind, message} = (e as CustomEvent<{kind: Kind; message: string}>).detail
      const m = await import('sonner')
      setToaster(() => m.Toaster as ComponentType<ToasterProps>)
      // Give a first-time Toaster a frame to mount before the toast is added.
      setTimeout(() => (kind === 'success' ? m.toast.success(message) : m.toast.error(message)), 50)
    }
    window.addEventListener('ag-toast', show)
    return () => window.removeEventListener('ag-toast', show)
  }, [])
  return Toaster ? <Toaster position="bottom-right" theme="light" /> : null
}
