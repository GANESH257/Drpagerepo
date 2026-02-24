import { redirect } from 'next/navigation';

/** Required for static export: no paths pre-generated; redirect runs when reached via client nav or fallback. */
export function generateStaticParams() {
  return [];
}

export default async function AdminMessageWithDoctorPage({
  params,
}: {
  params: Promise<{ otherDoctorId: string }>;
}) {
  const { otherDoctorId } = await params;
  redirect(`/admin/messages?otherDoctorId=${encodeURIComponent(otherDoctorId)}`);
}
