import type { Metadata } from 'next';
import { PatientsHero } from '@/components/patients/PatientsHero';
import { BenefitsJumbledGrid } from '@/components/patients/BenefitsJumbledGrid';
import { MissionStatementNewHome } from '@/components/newhome/MissionStatementNewHome';
import { BoardCertifiedBadge } from '@/components/patients/BoardCertifiedBadge';
import { FindSpecialistBar } from '@/components/patients/FindSpecialistBar';
import { PatientSteps } from '@/components/patients/PatientSteps';
import { DepartmentsSection } from '@/components/DepartmentsSection';
import { PatientsFAQ } from '@/components/patients/PatientsFAQ';

export const metadata: Metadata = {
  title: 'For Patients - Alliance of Independent Physicians',
  description:
    'Find independent physicians and book appointments. Experience healthcare the way it should be—personal, accessible, and transparent.',
  openGraph: {
    title: 'For Patients - Alliance of Independent Physicians',
    description:
      'Find independent physicians and book appointments. Experience healthcare the way it should be.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For Patients - Alliance of Independent Physicians',
    description:
      'Find independent physicians and book appointments. Experience healthcare the way it should be.',
  },
};

export default function PatientsPage() {
  return (
    <>
      <PatientsHero />
      <BenefitsJumbledGrid />
      <MissionStatementNewHome />
      <BoardCertifiedBadge />
      <FindSpecialistBar />
      <PatientSteps />
      <DepartmentsSection />
      <PatientsFAQ />
    </>
  );
}
