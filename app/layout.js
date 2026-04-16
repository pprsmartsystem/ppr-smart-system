import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import BroadcastBar from '@/components/BroadcastBar';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PPR Smart System - Digital Gifting & Corporate Rewards Platform',
  description: 'A comprehensive digital gifting, corporate rewards, and virtual card management platform built for modern businesses.',
  keywords: 'digital gifting, corporate rewards, virtual cards, employee benefits, gift vouchers',
  authors: [{ name: 'PPR Smart System' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4F46E5',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="71GoRQgLCV3lmnKflKZfcr8AuiDWBwf8viHgGohJFlM" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17994581567"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17994581567');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <BroadcastBar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#fff' },
              },
            }}
          />
          <Analytics />
          <SpeedInsights />
        </div>
      </body>
    </html>
  );
}