import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join Us - Alliance of Independent Physicians',
  description:
    'Join our network of independent physicians. Get referrals, increase visibility, and connect with patients.',
  openGraph: {
    title: 'Join Us - Alliance of Independent Physicians',
    description:
      'Join our network of independent physicians. Get referrals, increase visibility, and connect with patients.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Join Us - Alliance of Independent Physicians',
    description:
      'Join our network of independent physicians. Get referrals, increase visibility, and connect with patients.',
  },
};

export default function JoinUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
