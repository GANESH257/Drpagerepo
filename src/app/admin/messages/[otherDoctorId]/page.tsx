import { AdminMessagesWrapper } from '@/components/admin/AdminMessagesWrapper';
import { getAllDoctors } from '@/lib/memberStorage';

// For static export - Note: generateStaticParams must be synchronous
// If getAllDoctors becomes async-only, we'll need to handle this differently
// For now, keeping synchronous call for static generation
export async function generateStaticParams() {
    try {
        const doctors = await getAllDoctors();
        const params = doctors.map((doctor) => ({
            otherDoctorId: doctor.id,
        }));

        // Add admin to support messaging the admin if needed
        params.push({ otherDoctorId: 'admin' });

        return params;
    } catch (error) {
        console.error('Error generating static params for messages:', error);
        // Return at least admin as fallback
        return [{ otherDoctorId: 'admin' }];
    }
}

export default async function AdminMessageWithDoctorPage({
    params,
}: {
    params: Promise<{ otherDoctorId: string }>;
}) {
    const { otherDoctorId } = await params;
    return <AdminMessagesWrapper otherDoctorId={otherDoctorId} />;
}
