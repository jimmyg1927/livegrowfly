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
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
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