import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Membership | Alliance of Independent Physicians',
  description: 'Join the Alliance network to access resources, referrals, visibility, and community. Choose from Basic, Professional, or Premier membership plans designed for independent physicians.',
  openGraph: {
    title: 'Membership | Alliance of Independent Physicians',
    description: 'Join the Alliance network to access resources, referrals, visibility, and community. Choose from Basic, Professional, or Premier membership plans.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Membership | Alliance of Independent Physicians',
    description: 'Join the Alliance network to access resources, referrals, visibility, and community.',
  },
};

export default function MembershipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
