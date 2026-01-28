import { PreventionTopic } from '@/types';

export const preventionTopics: PreventionTopic[] = [
  {
    id: '1',
    slug: 'preventive-care',
    title: 'Preventive Care',
    description: 'Regular check-ups, screenings, and vaccinations are essential for maintaining good health and catching potential issues early.',
    resources: [
      {
        title: 'Annual Health Check-ups: What to Expect',
        url: '/public-health/articles/annual-health-checkups',
        type: 'internal',
      },
      {
        title: 'CDC Preventive Care Guidelines',
        url: 'https://www.cdc.gov/prevention/index.html',
        type: 'external',
      },
      {
        title: 'Vaccination Schedule for Adults',
        url: '/public-health/articles/vaccination-schedule-adults',
        type: 'internal',
      },
    ],
  },
  {
    id: '2',
    slug: 'nutrition-diet',
    title: 'Nutrition & Diet',
    description: 'A balanced diet rich in fruits, vegetables, whole grains, and lean proteins supports overall health and helps prevent chronic diseases.',
    resources: [
      {
        title: 'Nutrition Basics: A Guide to Healthy Eating',
        url: '/public-health/articles/nutrition-basics-healthy-eating-guide',
        type: 'internal',
      },
      {
        title: 'MyPlate Guidelines',
        url: 'https://www.myplate.gov/',
        type: 'external',
      },
      {
        title: 'Heart-Healthy Diet Tips',
        url: '/public-health/articles/heart-disease-prevention-lifestyle-changes',
        type: 'internal',
      },
    ],
  },
  {
    id: '3',
    slug: 'sleep',
    title: 'Sleep',
    description: 'Quality sleep is essential for physical and mental health. Most adults need 7-9 hours of sleep per night for optimal functioning.',
    resources: [
      {
        title: 'Sleep Hygiene: Tips for Better Rest',
        url: '/public-health/articles/sleep-hygiene-better-rest',
        type: 'internal',
      },
      {
        title: 'National Sleep Foundation',
        url: 'https://www.sleepfoundation.org/',
        type: 'external',
      },
      {
        title: 'Managing Sleep Disorders',
        url: '/public-health/articles/managing-sleep-disorders',
        type: 'internal',
      },
    ],
  },
  {
    id: '4',
    slug: 'exercise',
    title: 'Exercise',
    description: 'Regular physical activity strengthens your heart, improves mood, helps maintain a healthy weight, and reduces risk of many chronic diseases.',
    resources: [
      {
        title: 'Getting Started with Exercise',
        url: '/public-health/articles/getting-started-exercise',
        type: 'internal',
      },
      {
        title: 'Physical Activity Guidelines',
        url: 'https://www.cdc.gov/physicalactivity/index.html',
        type: 'external',
      },
      {
        title: 'Exercise for Heart Health',
        url: '/public-health/articles/heart-disease-prevention-lifestyle-changes',
        type: 'internal',
      },
    ],
  },
  {
    id: '5',
    slug: 'vaccines',
    title: 'Vaccines',
    description: 'Vaccines are one of the most effective ways to prevent infectious diseases. Staying up-to-date with recommended vaccinations protects you and your community.',
    resources: [
      {
        title: 'Vaccination Schedule for Adults',
        url: '/public-health/articles/vaccination-schedule-adults',
        type: 'internal',
      },
      {
        title: 'CDC Vaccine Information',
        url: 'https://www.cdc.gov/vaccines/index.html',
        type: 'external',
      },
      {
        title: 'COVID-19 Vaccination Updates',
        url: '/public-health/articles/covid-19-updates-vaccination-and-prevention',
        type: 'internal',
      },
    ],
  },
  {
    id: '6',
    slug: 'type-2-diabetes-prevention',
    title: 'Type 2 Diabetes Prevention',
    description: 'Type 2 diabetes is largely preventable through lifestyle changes. Maintaining a healthy weight, eating well, and staying active significantly reduce risk.',
    resources: [
      {
        title: 'Diabetes Management and Prevention',
        url: '/public-health/articles/diabetes-management-and-prevention-strategies',
        type: 'internal',
      },
      {
        title: 'American Diabetes Association',
        url: 'https://www.diabetes.org/',
        type: 'external',
      },
      {
        title: 'Healthy Weight Management',
        url: '/public-health/articles/obesity-prevention-healthy-weight-management',
        type: 'internal',
      },
    ],
  },
  {
    id: '7',
    slug: 'hypertension-control',
    title: 'Hypertension Control',
    description: 'High blood pressure can be managed and often prevented through diet, exercise, stress management, and when needed, medication.',
    resources: [
      {
        title: 'Hypertension Control: Diet and Lifestyle',
        url: '/public-health/articles/hypertension-control-diet-and-lifestyle',
        type: 'internal',
      },
      {
        title: 'American Heart Association',
        url: 'https://www.heart.org/',
        type: 'external',
      },
      {
        title: 'DASH Diet for Blood Pressure',
        url: '/public-health/articles/hypertension-control-diet-and-lifestyle',
        type: 'internal',
      },
    ],
  },
  {
    id: '8',
    slug: 'improving-public-health',
    title: 'Improving Public Health',
    description: 'Public health is everyone\'s responsibility. Learn how individual actions contribute to community wellness and disease prevention.',
    resources: [
      {
        title: 'Infectious Disease Prevention',
        url: '/public-health/articles/infectious-diseases-prevention-hygiene',
        type: 'internal',
      },
      {
        title: 'CDC Public Health Resources',
        url: 'https://www.cdc.gov/publichealth/index.html',
        type: 'external',
      },
      {
        title: 'Community Health Initiatives',
        url: '/public-health/articles/community-health-initiatives',
        type: 'internal',
      },
    ],
  },
];
