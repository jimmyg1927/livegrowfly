// app/onboarding/layout.tsx
import { ReactNode } from 'react'

export const metadata = {
  title: 'Growfly Onboarding',
}

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  // By returning children directly, we bypass the default ClientLayout (header/sidebar)
  return <>{children}</>
}
