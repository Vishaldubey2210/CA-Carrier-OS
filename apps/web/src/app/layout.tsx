import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { AppShell } from '../components/layout/AppShell';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'CharteredOS — Career Platform for Indian Chartered Accountants',
  description:
    'The premier career operating system for Indian Chartered Accountants: capability diagnostics, 7 specialized horizons, verified resumes, Big 4 mock drills, and unbundled take-home compensation analytics.',
  keywords: [
    'Chartered Accountant',
    'CharteredOS',
    'ICAI',
    'Big 4 Interview',
    'Ind AS',
    'Statutory Audit',
    'Transfer Pricing',
    'FP&A',
    'CA Career',
    'CA Jobs India',
  ],
  authors: [{ name: 'CharteredOS' }],
  metadataBase: new URL('https://cacareeros.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CharteredOS — Career Platform for Indian Chartered Accountants',
    description:
      'Career capability diagnostics, 7 specialized horizons, verified resumes, Big 4 interview drills, and in-hand take-home compensation analytics.',
    url: 'https://cacareeros.com',
    siteName: 'CharteredOS',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CharteredOS — Career Platform for Indian Chartered Accountants',
    description:
      'Career capability diagnostics, 7 specialized horizons, verified resumes, and Big 4 mock drills.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1E3A8A',
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
      <body className="antialiased selection:bg-[#1E3A8A] selection:text-white">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
