import {FinalCta} from '@/components/FinalCta'

/** Every page except the ad landing page closes with the shared call to action. */
export default function MainLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      {children}
      <FinalCta />
    </>
  )
}
