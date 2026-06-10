import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cryptoffiliate - Discover the Best Crypto Companies, Products & Services',
  description: 'The comprehensive cryptocurrency directory and discovery platform. Compare exchanges, wallets, trading tools, tax software, and more. Find the best crypto companies with honest reviews.',
  keywords: ['cryptocurrency', 'crypto', 'exchange', 'wallet', 'trading', 'DeFi', 'blockchain', 'bitcoin', 'ethereum'],
  openGraph: {
    title: 'Cryptoffiliate - Discover the Best Crypto Companies',
    description: 'The comprehensive cryptocurrency directory. Compare exchanges, wallets, trading tools, and more.',
    url: 'https://cryptoffiliate.com',
    siteName: 'Cryptoffiliate',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cryptoffiliate - Discover the Best Crypto Companies',
    description: 'The comprehensive cryptocurrency directory. Compare exchanges, wallets, trading tools, and more.',
    images: ['https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&h=630&fit=crop'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
