export interface GlobalMedicalEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  location: string;
  isOnline: boolean;
  description: string;
  url?: string;
}

export const globalMedicalEvents: GlobalMedicalEvent[] = [
  {
    id: '1',
    title: 'Annual Medical Conference 2026',
    date: '2026-03-15',
    location: 'San Francisco, CA',
    isOnline: false,
    description: 'Join leading physicians for three days of continuing education, networking, and the latest medical research presentations.',
    url: '#',
  },
  {
    id: '2',
    title: 'Cardiology Symposium: Advances in Heart Care',
    date: '2026-04-22',
    location: 'Online',
    isOnline: true,
    description: 'Virtual symposium covering the latest advances in cardiology, featuring expert presentations and case studies.',
    url: '#',
  },
  {
    id: '3',
    title: 'Primary Care Summit',
    date: '2026-05-10',
    location: 'Chicago, IL',
    isOnline: false,
    description: 'Comprehensive conference for primary care physicians focusing on evidence-based practices and patient care optimization.',
    url: '#',
  },
  {
    id: '4',
    title: 'Endocrinology Webinar Series',
    date: '2026-06-05',
    location: 'Online',
    isOnline: true,
    description: 'Monthly webinar series covering diabetes management, thyroid disorders, and metabolic health updates.',
    url: '#',
  },
  {
    id: '5',
    title: 'Rheumatology Annual Meeting',
    date: '2026-07-18',
    location: 'Boston, MA',
    isOnline: false,
    description: 'Annual gathering of rheumatology specialists featuring research presentations, workshops, and networking opportunities.',
    url: '#',
  },
  {
    id: '6',
    title: 'Telemedicine Best Practices Workshop',
    date: '2026-08-12',
    location: 'Online',
    isOnline: true,
    description: 'Interactive workshop on implementing effective telemedicine practices, patient engagement, and technology integration.',
    url: '#',
  },
  {
    id: '7',
    title: 'Medical Ethics & Patient Care Conference',
    date: '2026-09-20',
    location: 'Washington, DC',
    isOnline: false,
    description: 'Explore ethical considerations in modern healthcare delivery, patient autonomy, and professional responsibilities.',
    url: '#',
  },
  {
    id: '8',
    title: 'Preventive Medicine Forum',
    date: '2026-10-15',
    location: 'Online',
    isOnline: true,
    description: 'Virtual forum discussing preventive care strategies, screening guidelines, and population health initiatives.',
    url: '#',
  },
];
