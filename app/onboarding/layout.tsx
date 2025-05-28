import { ReactNode } from 'react'

export const metadata = {
  title: 'growfly.io Onboarding',
}

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-textPrimary">
      {children}
    </div>
  )
}
