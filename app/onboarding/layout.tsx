import { ReactNode } from 'react'

export const metadata = {
  title: 'growfly.io Onboarding',
}

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
