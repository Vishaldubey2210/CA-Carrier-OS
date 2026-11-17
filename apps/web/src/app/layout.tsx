import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { AppShell } from '../components/layout/AppShell';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'CharteredOS — Verified CA Articleship & Job Board',
  description:
    'The simplest platform for verified CA Articleship vacancies (Form 102/103), Corporate Industrial Training (Form 104), and Qualified Chartered Accountant jobs in India.',
  keywords: [
    'Chartered Accountant',
    'CharteredOS',
    'CA Articleship',
    'Articleship Vacancies',
    'Form 102',
    'Form 103',
    'Form 104 Industrial Training',
    'CA Jobs India',
    'Big 4 Articleship',
  ],
  authors: [{ name: 'CharteredOS' }],
  metadataBase: new URL('https://cacareeros.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CharteredOS — Verified CA Articleship & Job Board',
    description:
      'Verified CA Articleship vacancies (Form 102/103), Corporate Industrial Training (Form 104), and Qualified Chartered Accountant jobs in India.',
    url: 'https://cacareeros.com',
    siteName: 'CharteredOS',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CharteredOS — Verified CA Articleship & Job Board',
    description:
      'Verified CA Articleship vacancies and Qualified Chartered Accountant jobs in India.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-black selection:text-white bg-white text-black">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
