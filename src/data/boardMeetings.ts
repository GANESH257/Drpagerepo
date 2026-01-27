import { BoardMeeting } from '@/types';

// TODO: Update ICS file with real meeting details
// ICS file location: /public/ics/next-board-meeting.ics
export const nextMeeting: BoardMeeting = {
  id: 'next',
  date: '2026-02-15',
  time: '2:00 PM',
  timezone: 'PST',
  location: 'Virtual Meeting',
  isVirtual: true,
  meetingLink: 'https://zoom.us/j/123456789', // Placeholder
  agendaHighlights: [
    'Review of Q4 2025 financials and budget approval',
    'Discussion of new member applications and onboarding process',
    'Policy updates: Code of Conduct and Conflict of Interest revisions',
    'Strategic planning for 2026-2027 initiatives',
    'Update on physician recruitment and retention programs',
    'Open forum for member questions and feedback',
  ],
  icsFile: '/ics/next-board-meeting.ics',
};

export const upcomingMeetings: BoardMeeting[] = [
  {
    id: 'upcoming-1',
    date: '2026-03-15',
    time: '2:00 PM',
    timezone: 'PST',
    location: 'Virtual Meeting',
    isVirtual: true,
    agendaHighlights: [
      'Annual strategic planning session',
      'Review of membership growth metrics',
      'Discussion of new programs and initiatives',
    ],
  },
  {
    id: 'upcoming-2',
    date: '2026-04-15',
    time: '2:00 PM',
    timezone: 'PST',
    location: 'Virtual Meeting',
    isVirtual: true,
    agendaHighlights: [
      'Quarterly financial review',
      'Policy committee updates',
      'Member engagement initiatives',
    ],
  },
  {
    id: 'upcoming-3',
    date: '2026-05-15',
    time: '2:00 PM',
    timezone: 'PST',
    location: 'Virtual Meeting',
    isVirtual: true,
    agendaHighlights: [
      'Annual meeting preparation',
      'Board member elections',
      'Strategic priorities for next fiscal year',
    ],
  },
];
