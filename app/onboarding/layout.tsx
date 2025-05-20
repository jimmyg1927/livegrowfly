import { ReactNode } from 'react'

export const metadata = {
  title: 'Growfly Onboarding',
}

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
