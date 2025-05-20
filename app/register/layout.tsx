// ✅ FILE: app/register/layout.tsx
import { ReactNode } from 'react'

export const metadata = {
  title: 'Growfly — Register',
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  // This ensures it bypasses sidebar/header
  return <>{children}</>
}
