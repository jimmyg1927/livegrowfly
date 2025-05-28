import '../globals.css' // ✅ Make sure the path is correct

import { ReactNode } from 'react'

export const metadata = {
  title: 'Register – Growfly',
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark"> {/* or 'light dark' for theme toggle */}
      <body className="bg-background text-textPrimary">{children}</body>
    </html>
  )
}
