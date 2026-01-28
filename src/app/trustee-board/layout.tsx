import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trustee Board - Alliance of Independent Physicians',
  description:
    'Meet our Board of Trustees, view upcoming meetings, announcements, and governance policies.',
  openGraph: {
    title: 'Trustee Board - Alliance of Independent Physicians',
    description:
      'Meet our Board of Trustees, view upcoming meetings, announcements, and governance policies.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Trustee Board - Alliance of Independent Physicians',
    description:
      'Meet our Board of Trustees, view upcoming meetings, announcements, and governance policies.',
  },
};

export default function TrusteeBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
