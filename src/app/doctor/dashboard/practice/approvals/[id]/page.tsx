import { PracticeAdminApprovalDetailClient } from './PracticeAdminApprovalDetailClient';

export function generateStaticParams() {
  return [];
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
