import './globals.css'
import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import ThemeContextProvider from '../src/context/ThemeContext'
import ClientLayout from './ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'growfly.io',
  description: 'growfly.io is the Artificial Intelligence (AI) powered growth platform for startups and small businesses.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <NextThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ThemeContextProvider>
            <ClientLayout>{children}</ClientLayout>
          </ThemeContextProvider>
        </NextThemeProvider>
      </body>
    </html>
  )
}
