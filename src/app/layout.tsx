'use client'

import React from 'react'
import './globals.css'
import { Inter, Roboto_Mono } from 'next/font/google'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Growfly',
  description: 'AI-powered marketing assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
