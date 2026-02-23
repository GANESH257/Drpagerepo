import { ApprovalRequestDetailClient } from '../../requests-v2/[id]/ApprovalRequestDetailClient';

export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminApprovalDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ApprovalRequestDetailClient requestId={id} backHref="/admin/approvals" />;
}
