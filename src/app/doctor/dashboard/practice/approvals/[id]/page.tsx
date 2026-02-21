import { PracticeAdminApprovalDetailClient } from './PracticeAdminApprovalDetailClient';

// Static export: provide placeholder so route is included; client uses real id from URL
export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PracticeAdminApprovalDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <PracticeAdminApprovalDetailClient requestId={id} />;
}
