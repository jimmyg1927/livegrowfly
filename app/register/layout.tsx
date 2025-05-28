// ✅ FILE: app/register/layout.tsx
import { ReactNode } from 'react'

export const metadata = {
  title: 'growfly — Register for an account with growfly.io',
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  // This ensures it bypasses sidebar/header
  return <>{children}</>
}
