import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MarketProvider from '@/components/MarketProvider';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Synthetic Market Engine',
  description: 'Real-time simulated stock market with fictional assets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <MarketProvider>
          <Navigation />
          {children}
        </MarketProvider>
      </body>
    </html>
  );
}
