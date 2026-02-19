import { ApprovalRequestDetailClient } from './ApprovalRequestDetailClient';

export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminApprovalDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <ApprovalRequestDetailClient requestId={id} />;
}
