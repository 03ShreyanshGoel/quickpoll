import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuickPoll - Real-Time Opinion Polling',
  description: 'Create polls, vote, and see results in real-time',
};

// Import Inter font
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Adjust as needed
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
