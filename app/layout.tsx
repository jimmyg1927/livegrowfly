import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';
import { ThemeProvider } from '@/context/ThemeContext';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Growfly',
  description: 'AI-powered marketing assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ClientLayout>{children}</ClientLayout>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
