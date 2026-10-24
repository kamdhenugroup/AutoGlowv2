'use client'

import {useEffect, useState} from 'react'

let navigated = false

/**
 * Next.js mounts a fresh template on every navigation. After the first page, each new page
 * enters behind an ink curtain that lifts away while the content rises in. Transforms only.
 */
export default function Template({children}: {children: React.ReactNode}) {
  const [enter] = useState(() => navigated)
  useEffect(() => {
    navigated = true
  }, [])
  if (!enter) return children
  return (
    <>
      <div className="page-curtain" aria-hidden="true" />
      <div className="page-enter">{children}</div>
    </>
  )
}
