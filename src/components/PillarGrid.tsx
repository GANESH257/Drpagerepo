import { studentPillars } from '@/data/medStudentPillars';
import { PillarCard } from './PillarCard';

export function PillarGrid() {
  return (
    <section id="main-tracks" className="py-16 md:py-24 relative bg-gradient-to-br from-brand-dark-blue/90 via-brand-dark-blue-alt/80 to-brand-dark-blue/95 overflow-visible">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Main Tracks
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Explore our comprehensive resources organized by your stage in medical training
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {studentPillars.map((pillar, index) => (
            <PillarCard key={pillar.id} pillar={pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
