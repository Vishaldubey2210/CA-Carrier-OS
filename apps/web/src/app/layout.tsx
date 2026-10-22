import type { Metadata } from 'next';
import '../styles/globals.css';
import { AppShell } from '../components/layout/AppShell';

import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'CA Career OS — Operating System for Chartered Accountants',
  description:
    'Production-grade career platform for Chartered Accountants: verified credentials, zero-fabrication resumes, role discovery, and AI career guidance.',
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
