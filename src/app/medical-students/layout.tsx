import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical Students Resources | Alliance of Independent Physicians',
  description:
    'Comprehensive resources for medical students including USMLE preparation guides, financial planning, research publishing tips, residency application strategies, and articles from experienced physicians.',
  openGraph: {
    title: 'Medical Students Resources | Alliance of Independent Physicians',
    description:
      'Comprehensive resources for medical students including USMLE preparation, financial planning, research tips, and residency guidance.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medical Students Resources | Alliance of Independent Physicians',
    description:
      'Comprehensive resources for medical students including USMLE preparation, financial planning, research tips, and residency guidance.',
  },
};

export default function MedicalStudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
