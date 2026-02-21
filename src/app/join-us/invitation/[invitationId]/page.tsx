import InvitationLandingClient from './InvitationLandingClient';

// Static export: provide placeholder so route is included; client reads real id from URL
export async function generateStaticParams() {
  return [{ invitationId: 'placeholder' }];
}

interface PageProps {
  params: Promise<{ invitationId: string }>;
}

export default async function InvitationLandingPage({ params }: PageProps) {
  await params; // satisfy Next.js; client gets real id via useParams()
  return <InvitationLandingClient />;
}
