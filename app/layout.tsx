// File: app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import ThemeContextProvider from '../src/context/ThemeContext'
import ClientLayout from './ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Growfly - AI-Powered Business Growth Platform',
  description: 'Growfly.io is the Artificial Intelligence (AI) powered growth platform for startups and small businesses.',
  keywords: 'AI, business growth, automation, analytics, productivity, startups, small business',
  authors: [{ name: 'Growfly Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  // ✅ ADD FAVICON TO METADATA
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Growfly - AI-Powered Business Growth Platform',
    description: 'Transform your business with AI-powered insights, automation, and growth strategies.',
    url: 'https://www.growfly.io',
    siteName: 'Growfly',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Growfly - AI-Powered Business Growth Platform',
    description: 'Transform your business with AI-powered insights, automation, and growth strategies.',
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      {/* ✅ REMOVE MANUAL HEAD SECTION - Let metadata handle it */}
      <body className={`${inter.className} h-full antialiased`}>
        <NextThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ThemeContextProvider>
            <ClientLayout>{children}</ClientLayout>
          </ThemeContextProvider>
        </NextThemeProvider>
      </body>
    </html>
  )
}