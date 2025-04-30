// app/layout.tsx
import './globals.css'
import ClientLayout from './ClientLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Growfly',
  description: 'Your AI-powered marketing assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* wrap everything in your client layout which includes the Sidebar */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
