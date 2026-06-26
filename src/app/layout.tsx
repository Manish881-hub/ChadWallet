import type { Metadata } from 'next';
import { Exo_2, Orbitron, Space_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { Providers } from '@/components/PrivyProvider';
import { ToastProvider } from '@/components/ToastProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import './globals.css';

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'ChadWallet — Solana,all in one app',
  description: 'From memecoins to viral tokens, trade any crypto in seconds.',
  icons: { icon: '/logo/dark.png', shortcut: '/logo/dark.png', apple: '/logo/dark.png' },
  openGraph: {
    title: 'ChadWallet — Solana,all in one app',
    description: 'From memecoins to viral tokens, trade any crypto in seconds.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${exo2.variable} ${orbitron.variable} ${spaceMono.variable}`}>
      <body className="bg-dark text-white antialiased font-sans">
        <Suspense><Providers><ToastProvider><ErrorBoundary>{children}</ErrorBoundary></ToastProvider></Providers></Suspense>
      </body>
    </html>
  );
}
