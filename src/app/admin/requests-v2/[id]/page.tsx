import { ApprovalRequestDetailClient } from './ApprovalRequestDetailClient';

// Static export: provide at least one param so the route is included; client handles real id from URL
export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
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
