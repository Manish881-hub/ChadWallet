import type { Metadata } from 'next';
import { Inter, Space_Mono } from 'next/font/google';
import { Providers } from '@/components/PrivyProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'ChadWallet — where traders become legends.',
  description: 'From memecoins to viral tokens, trade any crypto in seconds.',
  openGraph: {
    title: 'ChadWallet — where traders become legends.',
    description: 'From memecoins to viral tokens, trade any crypto in seconds.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
      <body className="bg-dark text-white antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
