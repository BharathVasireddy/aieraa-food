import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import { SessionProvider } from '@/components/providers/session-provider';
import { ToastProvider } from '@/components/ui/toast';
import { StudentOrderingProvider } from '@/components/student/student-ordering-provider';

import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
});

export const metadata: Metadata = {
  title: 'Aieraa Food - Hostel Food Ordering',
  description: 'Internal food ordering system for hostels by Aieraa Hospitality',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} font-sans antialiased min-h-screen bg-white`}>
        <SessionProvider>
          <StudentOrderingProvider>
            {children}
            <ToastProvider />
          </StudentOrderingProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
