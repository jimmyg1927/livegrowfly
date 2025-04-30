// app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import ThemeContextProvider from '../src/context/ThemeContext'
import ClientLayout from './ClientLayout'        // ← fixed import path
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
        <ThemeContextProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeContextProvider>
      </body>
    </html>
  )
}
