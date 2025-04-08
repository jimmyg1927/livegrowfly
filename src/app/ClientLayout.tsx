'use client'

import React from 'react'
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' })

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <body className={`${inter.variable} ${robotoMono.variable} font-sans`}>
      {children}
    </body>
  )
}
