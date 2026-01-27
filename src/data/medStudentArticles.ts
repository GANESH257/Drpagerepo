import { StudentArticle } from '@/types';

export const studentArticles: StudentArticle[] = [
  {
    id: '1',
    slug: 'how-to-excel-in-medical-school',
    title: 'How to Excel in Medical School: Study Strategies That Work',
    excerpt: 'Learn evidence-based study techniques from a board-certified physician who graduated at the top of their class. Discover how to balance coursework, clinical rotations, and personal well-being.',
    content: `
      <h2>Introduction</h2>
      <p>Medical school is a challenging journey that requires dedication, strategic planning, and effective study methods. As a physician who has navigated this path successfully, I want to share the strategies that helped me excel.</p>
      
      <h2>Active Learning Techniques</h2>
      <p>Passive reading is not enough in medical school. Active learning techniques such as spaced repetition, practice questions, and teaching concepts to others significantly improve retention.</p>
      
      <h2>Time Management</h2>
      <p>Creating a structured study schedule that includes dedicated time for each subject, regular breaks, and self-care activities is essential for long-term success.</p>
      
      <h2>Clinical Rotations</h2>
      <p>Make the most of your clinical rotations by being proactive, asking thoughtful questions, and seeking feedback from attending physicians and residents.</p>
      
      <h2>Conclusion</h2>
      <p>Success in medical school comes from consistent effort, effective strategies, and maintaining balance. Remember that everyone's journey is unique, and it's important to find what works best for you.</p>
    `,
    authorName: 'Dr. Sarah Chen',
    authorSpecialty: 'Internal Medicine',
    authorId: undefined,
    category: 'study-exams',
    readingTime: 8,
    publishDate: '2026-01-18',
    featured: true,
  },
  {
    id: '2',
    slug: 'managing-stress-medical-school',
    title: 'Managing Stress and Maintaining Wellness in Medical School',
    excerpt: 'Medical school can be overwhelming. Learn practical strategies for managing stress, preventing burnout, and maintaining your physical and mental health throughout your training.',
    content: `
      <h2>The Reality of Medical School Stress</h2>
      <p>Medical school is inherently stressful, but that doesn't mean you have to suffer. Recognizing stress early and implementing coping strategies can make a significant difference.</p>
      
      <h2>Physical Wellness</h2>
      <p>Regular exercise, adequate sleep, and proper nutrition are foundational to managing stress. Even 20 minutes of exercise can improve mood and cognitive function.</p>
      
      <h2>Mental Health Support</h2>
      <p>Don't hesitate to seek professional help if you're struggling. Many medical schools offer counseling services, and there's no shame in prioritizing your mental health.</p>
      
      <h2>Building Support Networks</h2>
      <p>Connecting with classmates, mentors, and family members creates a support system that can help you navigate challenges and celebrate successes.</p>
      
      <h2>Conclusion</h2>
      <p>Your well-being is just as important as your academic performance. Taking care of yourself will make you a better student and, ultimately, a better physician.</p>
    `,
    authorName: 'Dr. Michael Rodriguez',
    authorSpecialty: 'Psychiatry',
    authorId: undefined,
    category: 'wellness',
    readingTime: 6,
    publishDate: '2026-01-15',
    featured: true,
  },
  {
    id: '3',
    slug: 'usmle-step1-study-plan',
    title: 'Creating an Effective USMLE Step 1 Study Plan',
    excerpt: 'A comprehensive guide to structuring your Step 1 preparation, including resource selection, timeline planning, and practice exam strategies from a physician who scored 260+.',
    content: `
      <h2>Understanding Step 1</h2>
      <p>USMLE Step 1 is a critical exam that tests your understanding of basic science concepts and their application to clinical scenarios. A well-structured study plan is essential for success.</p>
      
      <h2>Resource Selection</h2>
      <p>Choose 2-3 primary resources and stick with them. Popular options include First Aid, UWorld, and Pathoma. Consistency is more important than using every available resource.</p>
      
      <h2>Study Timeline</h2>
      <p>Most students dedicate 4-6 months of dedicated study time. Create a daily schedule that includes content review, practice questions, and regular self-assessments.</p>
      
      <h2>Practice Exams</h2>
      <p>Take NBME practice exams regularly to assess your progress. Aim to complete at least 4-6 practice exams before your actual test date.</p>
      
      <h2>Final Weeks</h2>
      <p>In the final weeks, focus on high-yield topics, review your incorrect questions, and maintain your routine. Avoid cramming new material.</p>
    `,
    authorName: 'Dr. Jennifer Park',
    authorSpecialty: 'Emergency Medicine',
    authorId: undefined,
    category: 'study-exams',
    readingTime: 10,
    publishDate: '2026-01-10',
    featured: false,
  },
  {
    id: '4',
    slug: 'getting-published-medical-student',
    title: 'Getting Published as a Medical Student: A Practical Guide',
    excerpt: 'Learn how to identify research opportunities, work with mentors, and navigate the publication process to build your academic portfolio.',
    content: `
      <h2>Why Publish?</h2>
      <p>Research publications strengthen your residency applications and demonstrate your commitment to advancing medical knowledge. They also help you develop critical thinking and analytical skills.</p>
      
      <h2>Finding Opportunities</h2>
      <p>Reach out to faculty members whose research interests align with yours. Attend research seminars, join student research groups, and explore summer research programs.</p>
      
      <h2>Working with Mentors</h2>
      <p>A good mentor can guide you through the research process and help you navigate challenges. Be proactive, communicate clearly, and show commitment to your projects.</p>
      
      <h2>Writing Your First Paper</h2>
      <p>Start with case reports or literature reviews if you're new to research. Follow journal guidelines carefully and seek feedback from your mentors before submission.</p>
      
      <h2>Conclusion</h2>
      <p>Getting published takes time and effort, but it's an achievable goal for medical students. Start early, be persistent, and don't be discouraged by rejections.</p>
    `,
    authorName: 'Dr. Robert Kim',
    authorSpecialty: 'Cardiology',
    authorId: undefined,
    category: 'research',
    readingTime: 7,
    publishDate: '2025-12-28',
    featured: false,
  },
  {
    id: '5',
    slug: 'residency-interview-tips',
    title: 'Residency Interview Tips: Making a Lasting Impression',
    excerpt: 'Expert advice on preparing for residency interviews, answering common questions, and standing out in a competitive application cycle.',
    content: `
      <h2>Pre-Interview Preparation</h2>
      <p>Research each program thoroughly. Understand their mission, values, and unique features. Prepare specific questions that demonstrate your genuine interest.</p>
      
      <h2>Common Interview Questions</h2>
      <p>Be ready to discuss your career goals, why you chose your specialty, your strengths and weaknesses, and how you handle challenges. Practice your answers but keep them authentic.</p>
      
      <h2>Virtual Interview Tips</h2>
      <p>Test your technology beforehand, ensure good lighting and a professional background, and maintain eye contact with the camera. Dress professionally even for virtual interviews.</p>
      
      <h2>Making Connections</h2>
      <p>Engage with residents and faculty during social events. Ask thoughtful questions and show enthusiasm for the program. Follow up with thank-you emails within 24 hours.</p>
      
      <h2>Conclusion</h2>
      <p>Interviews are an opportunity to show who you are beyond your application. Be yourself, be prepared, and remember that finding the right fit is a two-way process.</p>
    `,
    authorName: 'Dr. Lisa Thompson',
    authorSpecialty: 'Family Medicine',
    authorId: undefined,
    category: 'residency',
    readingTime: 9,
    publishDate: '2025-12-28',
    featured: true,
  },
  {
    id: '6',
    slug: 'medical-student-loans',
    title: 'Navigating Medical Student Loans: A Financial Guide',
    excerpt: 'Understanding your loan options, repayment strategies, and financial planning tips to manage medical school debt effectively.',
    content: `
      <h2>Understanding Your Loans</h2>
      <p>Most medical students rely on federal loans to finance their education. Understanding the difference between subsidized, unsubsidized, and Grad PLUS loans is crucial.</p>
      
      <h2>Loan Repayment Options</h2>
      <p>Income-driven repayment plans can make loan payments more manageable during residency. Public Service Loan Forgiveness (PSLF) may be an option for those pursuing careers in qualifying organizations.</p>
      
      <h2>Budgeting During Medical School</h2>
      <p>Create a realistic budget that accounts for tuition, living expenses, and loan interest. Minimize unnecessary expenses and consider part-time work if feasible.</p>
      
      <h2>Financial Planning</h2>
      <p>Start thinking about your financial future early. Consider meeting with a financial advisor who specializes in working with medical professionals.</p>
      
      <h2>Conclusion</h2>
      <p>While medical school debt can be significant, understanding your options and planning ahead can help you manage it effectively and build a solid financial foundation.</p>
    `,
    authorName: 'Dr. David Martinez',
    authorSpecialty: 'Internal Medicine',
    authorId: undefined,
    category: 'finance',
    readingTime: 8,
    publishDate: '2025-12-20',
    featured: false,
  },
  {
    id: '7',
    slug: 'clinical-rotations-success',
    title: 'Maximizing Your Clinical Rotations: Tips for Success',
    excerpt: 'Learn how to make the most of your clinical rotations, build strong relationships with preceptors, and demonstrate your readiness for residency.',
    content: `
      <h2>The Importance of Clinical Rotations</h2>
      <p>Clinical rotations are your opportunity to apply classroom knowledge, develop clinical skills, and explore different specialties. Making a positive impression can lead to strong letters of recommendation.</p>
      
      <h2>Being Proactive</h2>
      <p>Show initiative by reading about your patients, asking thoughtful questions, and volunteering for procedures. Come prepared each day and be ready to learn.</p>
      
      <h2>Building Relationships</h2>
      <p>Develop professional relationships with residents, attendings, and other team members. Be respectful, reliable, and demonstrate good communication skills.</p>
      
      <h2>Seeking Feedback</h2>
      <p>Regularly ask for feedback on your performance. Use constructive criticism to improve and show that you're committed to growth.</p>
      
      <h2>Conclusion</h2>
      <p>Clinical rotations are challenging but rewarding. Approach them with enthusiasm, humility, and a commitment to learning, and you'll gain valuable experience and connections.</p>
    `,
    authorName: 'Dr. Amanda White',
    authorSpecialty: 'Pediatrics',
    authorId: undefined,
    category: 'study-exams',
    readingTime: 7,
    publishDate: '2025-12-15',
    featured: false,
  },
  {
    id: '8',
    slug: 'work-life-balance-residency',
    title: 'Maintaining Work-Life Balance During Residency',
    excerpt: 'Practical strategies for managing the demands of residency while maintaining relationships, hobbies, and personal well-being.',
    content: `
      <h2>The Challenge of Residency</h2>
      <p>Residency is demanding, but maintaining balance is essential for your well-being and long-term career satisfaction. It's possible to excel professionally while taking care of yourself.</p>
      
      <h2>Time Management</h2>
      <p>Prioritize your tasks and learn to say no when necessary. Use your time off effectively to recharge and engage in activities you enjoy.</p>
      
      <h2>Maintaining Relationships</h2>
      <p>Communicate openly with family and friends about your schedule. Make time for important relationships, even if it's just a quick phone call or text.</p>
      
      <h2>Self-Care Strategies</h2>
      <p>Find small ways to take care of yourself daily. This might include exercise, meditation, reading, or hobbies. Even 15 minutes can make a difference.</p>
      
      <h2>Conclusion</h2>
      <p>Work-life balance in residency requires intentional effort, but it's achievable. Remember that taking care of yourself makes you a better physician.</p>
    `,
    authorName: 'Dr. James Wilson',
    authorSpecialty: 'Surgery',
    authorId: undefined,
    category: 'wellness',
    readingTime: 6,
    publishDate: '2025-12-10',
    featured: false,
  },
  {
    id: '9',
    slug: 'eras-application-guide',
    title: 'ERAS Application Guide: Standing Out in the Match',
    excerpt: 'A comprehensive guide to crafting a compelling ERAS application, including personal statements, CV formatting, and program selection strategies.',
    content: `
      <h2>Understanding ERAS</h2>
      <p>The Electronic Residency Application Service (ERAS) is the centralized application system for most residency programs. Understanding its components and timeline is crucial.</p>
      
      <h2>Crafting Your Personal Statement</h2>
      <p>Your personal statement should tell your story and explain why you're pursuing your chosen specialty. Be authentic, specific, and demonstrate your passion.</p>
      
      <h2>CV and Experiences</h2>
      <p>Highlight your most significant experiences and achievements. Use action verbs and quantify your impact when possible. Be honest and accurate.</p>
      
      <h2>Letters of Recommendation</h2>
      <p>Choose letter writers who know you well and can speak to your clinical abilities and character. Give them plenty of time and provide helpful information about your goals.</p>
      
      <h2>Program Selection</h2>
      <p>Research programs thoroughly and apply strategically. Consider factors like location, program size, fellowship match rates, and culture fit.</p>
      
      <h2>Conclusion</h2>
      <p>A strong ERAS application requires time, reflection, and attention to detail. Start early, seek feedback, and present your best self.</p>
    `,
    authorName: 'Dr. Patricia Brown',
    authorSpecialty: 'Obstetrics & Gynecology',
    authorId: undefined,
    category: 'residency',
    readingTime: 11,
    publishDate: '2025-12-01',
    featured: true,
  },
];
