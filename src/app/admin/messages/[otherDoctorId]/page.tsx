import { AdminMessagesWrapper } from '@/components/admin/AdminMessagesWrapper';
import { getAllDoctors } from '@/lib/memberStorage';

// For static export
export function generateStaticParams() {
    const doctors = getAllDoctors();
    const params = doctors.map((doctor) => ({
        otherDoctorId: doctor.id,
    }));

    // Add admin to support messaging the admin if needed
    params.push({ otherDoctorId: 'admin' });

    return params;
}

export default async function AdminMessageWithDoctorPage({
    params,
}: {
    params: Promise<{ otherDoctorId: string }>;
}) {
    const { otherDoctorId } = await params;
    return <AdminMessagesWrapper otherDoctorId={otherDoctorId} />;
}
