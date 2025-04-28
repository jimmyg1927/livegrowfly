'use client';

import React from 'react';
import { Inter, Roboto_Mono } from 'next/font/google';
import { ThemeContextProvider } from '../src/context/ThemeContext';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} font-sans`}>
        <ThemeContextProvider>{children}</ThemeContextProvider>
        <Analytics />
      </body>
    </html>
  );
}
