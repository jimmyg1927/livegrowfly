import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import ThemeContextProvider from '../src/context/ThemeContext'; // ✅ your custom one
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Growfly',
  description: 'AI-powered growth dashboard',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ThemeContextProvider> {/* ✅ fixes useTheme crash */}
            <ClientLayout>{children}</ClientLayout>
          </ThemeContextProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}
