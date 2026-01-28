import { ToolCard, Tool } from './ToolCard';

const tools: Tool[] = [
  {
    id: 'study-planner',
    title: 'Medical School Study Planner',
    description: 'Printable / Editable',
    icon: 'Calendar',
    url: '/resources/medical-students/tools/study-planner.pdf',
  },
  {
    id: 'usmle-timeline',
    title: 'USMLE Study Timeline Template',
    description: 'Printable / Editable',
    icon: 'FileText',
    url: '/resources/medical-students/tools/usmle-timeline.pdf',
  },
  {
    id: 'cv-checklist',
    title: 'Medical CV / Resume Checklist',
    description: 'Printable / Editable',
    icon: 'FileCheck',
    url: '/resources/medical-students/tools/cv-checklist.pdf',
  },
  {
    id: 'research-checklist',
    title: 'Research Publication Checklist',
    description: 'Printable / Editable',
    icon: 'ClipboardList',
    url: '/resources/medical-students/tools/research-checklist.pdf',
  },
  {
    id: 'residency-checklist',
    title: 'Residency Application Checklist',
    description: 'Printable / Editable',
    icon: 'Briefcase',
    url: '/resources/medical-students/tools/residency-checklist.pdf',
  },
  {
    id: 'interview-guide',
    title: 'Interview Preparation Guide',
    description: 'Printable / Editable',
    icon: 'FileText',
    url: '/resources/medical-students/tools/interview-guide.pdf',
  },
];

export function QuickToolsGrid() {
  return (
    <section id="quick-tools" className="py-16 md:py-24 relative bg-teal-50 overflow-visible" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(46, 196, 182, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(26, 75, 127, 0.03) 0%, transparent 50%)' }}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            Quick Tools
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Downloadable templates and checklists to help you stay organized and prepared
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
