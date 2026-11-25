import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { AppShell } from '../components/layout/AppShell';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'EZapply — Smart Job Applications & Career OS for All Professionals',
  description:
    'The simplest, smartest career platform for verified job openings, cold email outreach, and one-click applications across Tech, Finance, Consulting, Legal, and CA Articleships.',
  keywords: [
    'EZapply',
    'Job Application',
    'Career OS',
    'Tech Jobs',
    'Software Engineer Jobs',
    'Finance Jobs',
    'Investment Banking',
    'Management Consulting',
    'Legal Associate Jobs',
    'Chartered Accountant',
    'CA Articleship',
    'Articleship Vacancies',
    'Form 102',
    'Form 103',
    'Form 104 Industrial Training',
    'Cold Mail Outreach',
  ],
  authors: [{ name: 'EZapply' }],
  metadataBase: new URL('https://ezapply.work'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'EZapply — Smart Job Applications & Career OS for All Professionals',
    description:
      'Verified job openings, cold email outreach, and one-click applications across Tech, Finance, Consulting, Legal, and CA Articleships.',
    url: 'https://ezapply.work',
    siteName: 'EZapply',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EZapply — Smart Job Applications & Career OS for All Professionals',
    description:
      'Verified job openings and automated outreach across Tech, Finance, Consulting, Legal, and CA Articleships.',
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
