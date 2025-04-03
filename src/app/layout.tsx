import './globals.css';
import { Inter } from 'next/font/google';
import { NextAuthProvider } from './providers';
import { initializeDatabase } from './lib/db/db';

const inter = Inter({ subsets: ['latin'] });

// Initialize database on server start
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
});

export const metadata = {
  title: 'AI Image Generator',
  description: 'Generate professional product images for your marketing campaigns',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
} 