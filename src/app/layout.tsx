import type { Metadata } from 'next';
import { Inter, Space_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { Providers } from '@/components/PrivyProvider';
import { ToastProvider } from '@/components/ToastProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-mono',
});

const APP_NAME = 'ChadWallet';
const APP_DESCRIPTION = 'From memecoins to viral tokens, trade any crypto in seconds.';

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Solana, all in one app`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  icons: { icon: '/logo/dark.png', shortcut: '/logo/dark.png', apple: '/logo/dark.png' },
  manifest: '/manifest.json',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://chadwallet.example.com' },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: `${APP_NAME} — Solana, all in one app`,
    description: APP_DESCRIPTION,
    url: 'https://chadwallet.example.com',
    locale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — Solana, all in one app`,
    description: APP_DESCRIPTION,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
      <body className="bg-dark text-white antialiased font-sans">
        <Suspense><Providers><ToastProvider><ErrorBoundary>{children}</ErrorBoundary></ToastProvider></Providers></Suspense>
      </body>
    </html>
  );
}
