import { studentPillars } from '@/data/medStudentPillars';
import { PillarCard } from './PillarCard';

export function PillarGrid() {
  return (
    <section id="main-tracks" className="py-16 md:py-24 relative bg-teal-50 overflow-visible" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(46, 196, 182, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(26, 75, 127, 0.03) 0%, transparent 50%)' }}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            Main Tracks
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
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
