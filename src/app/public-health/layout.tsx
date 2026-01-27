import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Public Health | Latest Medical News & Resources',
  description: 'Latest medical news, public health updates, and evidence-based guidance from physicians. Explore diseases, prevention strategies, and trusted resources.',
  openGraph: {
    title: 'Public Health | Latest Medical News & Resources',
    description: 'Latest medical news, public health updates, and evidence-based guidance from physicians. Explore diseases, prevention strategies, and trusted resources.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Public Health | Latest Medical News & Resources',
    description: 'Latest medical news, public health updates, and evidence-based guidance from physicians.',
  },
};

export default function PublicHealthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
