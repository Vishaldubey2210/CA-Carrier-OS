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
      </head>
      <body className="bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-[#1E3A8A] selection:text-white">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
