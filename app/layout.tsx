// app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import ThemeContextProvider from '../src/context/ThemeContext'
import ClientLayout from '../src/components/ClientLayout' // if you have a shared layout component
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Growfly',
  description: 'AI-powered growth dashboard',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {/* 1) THEME CONTEXT */}
        <ThemeContextProvider>
          {/* 2) YOUR APP SHELL (SIDEBAR / HEADER) */}
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeContextProvider>
      </body>
    </html>
  )
}
