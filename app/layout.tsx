// app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import ClientLayout from './ClientLayout'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Growfly',
  description: 'AI-powered growth dashboard',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
