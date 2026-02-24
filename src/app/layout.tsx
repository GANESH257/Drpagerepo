import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TopBar } from '@/components/TopBar';
import { Header } from '@/components/Header';
import { ConditionalFooter } from '@/components/ConditionalFooter';
import { FloatingCTA } from '@/components/FloatingCTA';
import { FloatingMessageIcon } from '@/components/FloatingMessageIcon';
import { HandCursor } from '@/components/HandCursor';
import { LoadingScreenWrapper } from '@/components/LoadingScreenWrapper';
import { PageTransition } from '@/components/PageTransition';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Alliance of Independent Physicians - Physician Network & Patient Directory',
  description:
    'A trusted physician network and patient directory that supports referrals, collaboration, and easier access to quality care across specialties. Connect, refer, find care, and collaborate.',
  openGraph: {
    title: 'Alliance of Independent Physicians - Physician Network & Patient Directory',
    description:
      'A trusted physician network and patient directory that supports referrals, collaboration, and easier access to quality care across specialties.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alliance of Independent Physicians - Physician Network & Patient Directory',
    description:
      'A trusted physician network and patient directory that supports referrals, collaboration, and easier access to quality care.',
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
        <LoadingScreenWrapper>
          <HandCursor />
          <TopBar />
          <Header />
          <main>
            <PageTransition>{children}</PageTransition>
          </main>
          <ConditionalFooter />
          <FloatingCTA />
          <FloatingMessageIcon />
        </LoadingScreenWrapper>
      </body>
    </html>
  );
}
