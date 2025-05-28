import { ReactNode } from 'react'

export const metadata = {
  title: 'Register — growfly.io',
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-textPrimary">{children}</body>
    </html>
  )
}
