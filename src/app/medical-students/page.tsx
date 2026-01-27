import { StudentsHero } from '@/components/StudentsHero';
import { HowToUseStudentsPage } from '@/components/HowToUseStudentsPage';
import { GenericCTASection } from '@/components/GenericCTASection';
import { PillarGrid } from '@/components/PillarGrid';
import { QuickToolsGrid } from '@/components/QuickToolsGrid';
import { ArticlesSection } from '@/components/ArticlesSection';
import { NewsSection } from '@/components/NewsSection';

export default function MedicalStudentsPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-24">
        <StudentsHero />
        <HowToUseStudentsPage />
        <GenericCTASection />
        <PillarGrid />
        <QuickToolsGrid />
        <ArticlesSection />
        <NewsSection />
      </div>
    </div>
  );
}
