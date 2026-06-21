// src/app/layout.tsx
import { Providers } from '@/components/PrivyProvider';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}