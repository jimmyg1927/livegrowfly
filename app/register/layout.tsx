// ✅ FILE: app/register/layout.tsx
import { ReactNode } from 'react'

export const metadata = {
  title: 'Growfly — Register',
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  // ✅ Do NOT rewrap <html> or <body> to avoid breaking layout inheritance
  return <>{children}</>
}
