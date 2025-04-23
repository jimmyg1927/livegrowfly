import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';
import ThemeContextProvider from '@/context/ThemeContext'; // ✅ Correct import
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Growfly',
  description: 'AI-powered marketing assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeContextProvider>  {/* ✅ Correct usage here */}
          <ClientLayout>{children}</ClientLayout>
          <Analytics />
        </ThemeContextProvider>  {/* ✅ Closing correctly */}
      </body>
    </html>
  );
}
