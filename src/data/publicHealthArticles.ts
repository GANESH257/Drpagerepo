import { PublicHealthArticle } from '@/types';

// All 25 disease topics
export const DISEASE_TOPICS = [
  'all',
  'bird-flu',
  'covid-19',
  'influenza',
  'mental-health',
  'heart-disease',
  'diabetes',
  'cancer',
  'hypertension',
  'obesity',
  'asthma',
  'arthritis',
  'alzheimers',
  'parkinsons',
  'stroke',
  'copd',
  'kidney-disease',
  'liver-disease',
  'osteoporosis',
  'depression',
  'anxiety',
  'substance-abuse',
  'infectious-diseases',
  'autoimmune',
  'nutrition',
] as const;

export const publicHealthArticles: PublicHealthArticle[] = [
  {
    id: '1',
    slug: 'understanding-bird-flu-prevention-and-safety',
    title: 'Understanding Bird Flu: Prevention and Safety Measures',
    author: 'Dr. Michael Chen',
    authorId: undefined,
    topics: ['bird-flu', 'infectious-diseases'],
    excerpt: 'Learn about avian influenza, how it spreads, and practical steps to protect yourself and your family from bird flu.',
    content: `
      <h2>What is Bird Flu?</h2>
      <p>Avian influenza, commonly known as bird flu, is a viral infection that primarily affects birds but can occasionally infect humans. Understanding the basics of this disease is crucial for public health awareness.</p>
      
      <h2>How Bird Flu Spreads</h2>
      <p>Bird flu viruses spread among birds through direct contact with infected birds or their droppings. Human infection typically occurs through close contact with infected birds or contaminated environments.</p>
      
      <h2>Prevention Strategies</h2>
      <p>Key prevention measures include avoiding contact with sick or dead birds, practicing good hand hygiene, and properly cooking poultry products. If you work with birds or poultry, use appropriate protective equipment.</p>
      
      <h2>When to Seek Medical Care</h2>
      <p>If you develop flu-like symptoms after exposure to birds, contact your healthcare provider immediately. Early treatment can help prevent complications.</p>
    `,
    readingTime: 6,
    publishDate: '2026-01-22',
    doctorWritten: true,
  },
  {
    id: '2',
    slug: 'covid-19-updates-vaccination-and-prevention',
    title: 'COVID-19 Updates: Vaccination and Prevention in 2026',
    author: 'Dr. Sarah Johnson',
    authorId: undefined,
    topics: ['covid-19', 'infectious-diseases'],
    excerpt: 'Stay informed about the latest COVID-19 guidance, vaccination recommendations, and effective prevention strategies for protecting yourself and your community.',
    content: `
      <h2>Current COVID-19 Situation</h2>
      <p>As we continue to navigate the COVID-19 pandemic, staying up-to-date with the latest guidance is essential. The virus continues to evolve, and our understanding of prevention and treatment improves.</p>
      
      <h2>Vaccination Recommendations</h2>
      <p>COVID-19 vaccines remain our best defense against severe illness. Updated boosters are recommended for eligible individuals, especially those at higher risk of complications.</p>
      
      <h2>Prevention Strategies</h2>
      <p>In addition to vaccination, practicing good hygiene, wearing masks in crowded settings, and staying home when sick help reduce transmission. Good ventilation in indoor spaces is also important.</p>
      
      <h2>When to Seek Care</h2>
      <p>If you develop symptoms such as fever, cough, or difficulty breathing, contact your healthcare provider. Early treatment options are available for those at high risk.</p>
    `,
    readingTime: 8,
    publishDate: '2026-01-20',
    doctorWritten: true,
  },
  {
    id: '3',
    slug: 'influenza-season-preparation-and-prevention',
    title: 'Influenza Season: Preparation and Prevention Guide',
    author: 'Dr. Robert Martinez',
    authorId: undefined,
    topics: ['influenza', 'infectious-diseases'],
    excerpt: 'Prepare for flu season with expert advice on vaccination, prevention strategies, and recognizing symptoms that require medical attention.',
    content: `
      <h2>Understanding Influenza</h2>
      <p>Influenza, or the flu, is a contagious respiratory illness caused by influenza viruses. It can cause mild to severe illness and sometimes lead to hospitalization or death.</p>
      
      <h2>Annual Vaccination</h2>
      <p>The best way to prevent the flu is by getting vaccinated each year. The vaccine is updated annually to match circulating strains and is recommended for everyone 6 months and older.</p>
      
      <h2>Additional Prevention Measures</h2>
      <p>Beyond vaccination, frequent handwashing, avoiding close contact with sick individuals, and covering your mouth when coughing or sneezing help prevent spread.</p>
      
      <h2>Recognizing Symptoms</h2>
      <p>Common flu symptoms include fever, cough, sore throat, body aches, and fatigue. If you're at high risk for complications, seek medical care promptly.</p>
    `,
    readingTime: 7,
    publishDate: '2026-01-18',
    doctorWritten: true,
  },
  {
    id: '4',
    slug: 'mental-health-awareness-and-support-resources',
    title: 'Mental Health Awareness: Recognizing Signs and Finding Support',
    author: 'Dr. Emily Thompson',
    authorId: undefined,
    topics: ['mental-health', 'depression', 'anxiety'],
    excerpt: 'Learn to recognize signs of mental health concerns and discover resources for support and treatment. Mental health is an essential part of overall wellness.',
    content: `
      <h2>Understanding Mental Health</h2>
      <p>Mental health encompasses our emotional, psychological, and social well-being. It affects how we think, feel, and act, and influences how we handle stress and make choices.</p>
      
      <h2>Common Mental Health Conditions</h2>
      <p>Depression, anxiety disorders, and other mental health conditions are common and treatable. Recognizing the signs early can lead to better outcomes.</p>
      
      <h2>Signs to Watch For</h2>
      <p>Persistent sadness, excessive worry, changes in sleep or appetite, difficulty concentrating, and withdrawal from activities may indicate a mental health concern.</p>
      
      <h2>Seeking Help</h2>
      <p>If you or someone you know is struggling, reach out to a healthcare provider or mental health professional. Support is available, and treatment can be highly effective.</p>
    `,
    readingTime: 9,
    publishDate: '2026-01-15',
    doctorWritten: true,
  },
  {
    id: '5',
    slug: 'heart-disease-prevention-lifestyle-changes',
    title: 'Heart Disease Prevention: Lifestyle Changes That Make a Difference',
    author: 'Dr. James Wilson',
    authorId: undefined,
    topics: ['heart-disease', 'hypertension', 'nutrition'],
    excerpt: 'Discover evidence-based strategies to reduce your risk of heart disease through diet, exercise, and lifestyle modifications that can significantly improve cardiovascular health.',
    content: `
      <h2>Understanding Heart Disease Risk</h2>
      <p>Heart disease remains a leading cause of death, but many risk factors are modifiable. Understanding your risk and taking action can significantly improve outcomes.</p>
      
      <h2>Dietary Changes</h2>
      <p>A heart-healthy diet emphasizes fruits, vegetables, whole grains, lean proteins, and healthy fats. Limiting processed foods, sodium, and saturated fats is crucial.</p>
      
      <h2>Physical Activity</h2>
      <p>Regular exercise strengthens the heart and improves circulation. Aim for at least 150 minutes of moderate-intensity exercise per week, as recommended by health guidelines.</p>
      
      <h2>Other Risk Factors</h2>
      <p>Managing blood pressure, cholesterol, and blood sugar levels, along with avoiding smoking and excessive alcohol, all contribute to heart health.</p>
      
      <h2>When to See a Doctor</h2>
      <p>Regular check-ups help monitor heart health. If you experience chest pain, shortness of breath, or other concerning symptoms, seek immediate medical attention.</p>
    `,
    readingTime: 10,
    publishDate: '2026-01-12',
    doctorWritten: true,
  },
  {
    id: '6',
    slug: 'diabetes-management-and-prevention-strategies',
    title: 'Diabetes Management and Prevention: A Comprehensive Guide',
    author: 'Dr. Patricia Lee',
    authorId: undefined,
    topics: ['diabetes', 'nutrition', 'obesity'],
    excerpt: 'Learn about Type 2 diabetes prevention strategies and effective management techniques for those living with diabetes, including diet, exercise, and monitoring.',
    content: `
      <h2>Understanding Diabetes</h2>
      <p>Diabetes is a chronic condition that affects how your body processes blood sugar. Type 2 diabetes, the most common form, is often preventable through lifestyle changes.</p>
      
      <h2>Prevention Strategies</h2>
      <p>Maintaining a healthy weight, eating a balanced diet, and staying physically active can significantly reduce your risk of developing Type 2 diabetes.</p>
      
      <h2>Management for Those with Diabetes</h2>
      <p>If you have diabetes, monitoring blood sugar, following a meal plan, taking medications as prescribed, and regular exercise are key to managing the condition effectively.</p>
      
      <h2>Complications Prevention</h2>
      <p>Well-managed diabetes reduces the risk of complications such as heart disease, kidney disease, and vision problems. Regular medical check-ups are essential.</p>
      
      <h2>When to Seek Care</h2>
      <p>If you experience symptoms like excessive thirst, frequent urination, or unexplained weight loss, consult your healthcare provider for evaluation.</p>
    `,
    readingTime: 9,
    publishDate: '2026-01-10',
    doctorWritten: true,
  },
  {
    id: '7',
    slug: 'cancer-screening-early-detection-saves-lives',
    title: 'Cancer Screening: Early Detection Saves Lives',
    author: 'Dr. David Kim',
    authorId: undefined,
    topics: ['cancer'],
    excerpt: 'Understand the importance of cancer screening, recommended tests by age and risk factors, and how early detection significantly improves treatment outcomes.',
    content: `
      <h2>The Importance of Screening</h2>
      <p>Cancer screening tests can detect cancer early, when treatment is most effective. Following recommended screening guidelines can save lives.</p>
      
      <h2>Common Screening Tests</h2>
      <p>Mammograms for breast cancer, colonoscopies for colorectal cancer, Pap tests for cervical cancer, and PSA tests for prostate cancer are among the most common screening tests.</p>
      
      <h2>Age and Risk-Based Recommendations</h2>
      <p>Screening recommendations vary by age, gender, and individual risk factors. Discuss with your healthcare provider which screenings are appropriate for you.</p>
      
      <h2>Early Detection Benefits</h2>
      <p>When cancer is detected early, treatment options are often more effective and less invasive. Regular screening is an investment in your long-term health.</p>
      
      <h2>When to Start Screening</h2>
      <p>Talk to your doctor about when to begin cancer screening based on your age, family history, and other risk factors.</p>
    `,
    readingTime: 8,
    publishDate: '2026-01-08',
    doctorWritten: true,
  },
  {
    id: '8',
    slug: 'hypertension-control-diet-and-lifestyle',
    title: 'Hypertension Control: Diet and Lifestyle Management',
    author: 'Dr. Maria Rodriguez',
    authorId: undefined,
    topics: ['hypertension', 'heart-disease', 'nutrition'],
    excerpt: 'High blood pressure affects millions. Learn how dietary changes, exercise, and lifestyle modifications can help control hypertension and reduce cardiovascular risk.',
    content: `
      <h2>Understanding Hypertension</h2>
      <p>Hypertension, or high blood pressure, is a common condition that increases the risk of heart disease and stroke. Many people can manage it through lifestyle changes.</p>
      
      <h2>Dietary Approaches</h2>
      <p>The DASH diet (Dietary Approaches to Stop Hypertension) emphasizes fruits, vegetables, whole grains, and low-fat dairy while limiting sodium and saturated fats.</p>
      
      <h2>Lifestyle Modifications</h2>
      <p>Regular exercise, maintaining a healthy weight, limiting alcohol, and managing stress all contribute to better blood pressure control.</p>
      
      <h2>Medication When Needed</h2>
      <p>For some individuals, lifestyle changes alone may not be enough. Medications can effectively control blood pressure when prescribed and taken as directed.</p>
      
      <h2>Monitoring and Follow-up</h2>
      <p>Regular blood pressure monitoring helps track progress. Work with your healthcare provider to establish a management plan that works for you.</p>
    `,
    readingTime: 7,
    publishDate: '2026-01-05',
    doctorWritten: true,
  },
  {
    id: '9',
    slug: 'obesity-prevention-healthy-weight-management',
    title: 'Obesity Prevention: Healthy Weight Management Strategies',
    author: 'Dr. Jennifer Brown',
    authorId: undefined,
    topics: ['obesity', 'nutrition', 'diabetes'],
    excerpt: 'Explore evidence-based approaches to achieving and maintaining a healthy weight through balanced nutrition, regular physical activity, and sustainable lifestyle changes.',
    content: `
      <h2>The Obesity Epidemic</h2>
      <p>Obesity is a complex health issue affecting millions of Americans. It increases the risk of many health conditions, but it's often preventable and manageable.</p>
      
      <h2>Balanced Nutrition</h2>
      <p>A balanced diet rich in whole foods, appropriate portion sizes, and mindful eating practices form the foundation of healthy weight management.</p>
      
      <h2>Physical Activity</h2>
      <p>Regular exercise not only burns calories but also improves metabolism, builds muscle, and supports overall health. Find activities you enjoy to maintain consistency.</p>
      
      <h2>Sustainable Approaches</h2>
      <p>Crash diets rarely work long-term. Focus on gradual, sustainable changes that you can maintain over time rather than quick fixes.</p>
      
      <h2>When to Seek Professional Help</h2>
      <p>If you're struggling with weight management, consider consulting with a healthcare provider, registered dietitian, or weight management specialist.</p>
    `,
    readingTime: 8,
    publishDate: '2026-01-03',
    doctorWritten: false,
  },
  {
    id: '10',
    slug: 'asthma-management-breathing-easier',
    title: 'Asthma Management: Breathing Easier Every Day',
    author: 'Dr. Christopher Davis',
    authorId: undefined,
    topics: ['asthma'],
    excerpt: 'Learn how to effectively manage asthma symptoms, identify triggers, use medications correctly, and create an action plan for better asthma control.',
    content: `
      <h2>Understanding Asthma</h2>
      <p>Asthma is a chronic condition that affects the airways, causing inflammation and narrowing that leads to breathing difficulties. With proper management, most people can live active lives.</p>
      
      <h2>Identifying Triggers</h2>
      <p>Common asthma triggers include allergens, exercise, cold air, respiratory infections, and irritants. Identifying and avoiding your triggers is key to control.</p>
      
      <h2>Medication Management</h2>
      <p>Asthma medications include quick-relief inhalers for immediate symptoms and controller medications for long-term management. Using them correctly is essential.</p>
      
      <h2>Creating an Action Plan</h2>
      <p>Work with your healthcare provider to create an asthma action plan that outlines daily management and what to do during an asthma attack.</p>
      
      <h2>When to Seek Emergency Care</h2>
      <p>If you experience severe breathing difficulty, symptoms that don't improve with medication, or signs of a severe attack, seek immediate medical attention.</p>
    `,
    readingTime: 7,
    publishDate: '2025-12-25',
    doctorWritten: true,
  },
  {
    id: '11',
    slug: 'arthritis-management-pain-relief-strategies',
    title: 'Arthritis Management: Pain Relief and Mobility Strategies',
    author: 'Dr. Lisa Anderson',
    authorId: undefined,
    topics: ['arthritis'],
    excerpt: 'Discover effective strategies for managing arthritis pain, improving joint mobility, and maintaining an active lifestyle despite arthritis challenges.',
    content: `
      <h2>Understanding Arthritis</h2>
      <p>Arthritis encompasses over 100 conditions affecting joints and surrounding tissues. The most common types are osteoarthritis and rheumatoid arthritis.</p>
      
      <h2>Pain Management</h2>
      <p>Effective pain management may include medications, physical therapy, hot and cold therapy, and assistive devices. Work with your healthcare provider to find what works best.</p>
      
      <h2>Exercise and Movement</h2>
      <p>Regular, gentle exercise helps maintain joint flexibility and strength. Low-impact activities like swimming, walking, and yoga are often well-tolerated.</p>
      
      <h2>Lifestyle Modifications</h2>
      <p>Maintaining a healthy weight reduces stress on joints. Proper rest, stress management, and joint protection techniques also help manage symptoms.</p>
      
      <h2>When to See a Specialist</h2>
      <p>If arthritis significantly impacts your daily life or symptoms worsen, consider consulting a rheumatologist for specialized care.</p>
    `,
    readingTime: 8,
    publishDate: '2025-12-25',
    doctorWritten: true,
  },
  {
    id: '12',
    slug: 'alzheimers-disease-understanding-and-support',
    title: "Alzheimer's Disease: Understanding and Supporting Loved Ones",
    author: 'Dr. Robert Taylor',
    authorId: undefined,
    topics: ['alzheimers'],
    excerpt: 'Learn about Alzheimer\'s disease, early warning signs, caregiving strategies, and resources available for families affected by this condition.',
    content: `
      <h2>Understanding Alzheimer's</h2>
      <p>Alzheimer's disease is a progressive brain disorder that affects memory, thinking, and behavior. It's the most common cause of dementia in older adults.</p>
      
      <h2>Early Warning Signs</h2>
      <p>Memory loss that disrupts daily life, difficulty planning or solving problems, confusion with time or place, and changes in mood or personality may indicate Alzheimer's.</p>
      
      <h2>Diagnosis and Treatment</h2>
      <p>Early diagnosis allows for better planning and access to treatments that may slow progression. While there's no cure, medications and interventions can help manage symptoms.</p>
      
      <h2>Caregiving Support</h2>
      <p>Caring for someone with Alzheimer's can be challenging. Support groups, respite care, and educational resources can help caregivers manage the journey.</p>
      
      <h2>When to Seek Evaluation</h2>
      <p>If you or a loved one experiences persistent memory problems or cognitive changes, consult a healthcare provider for evaluation.</p>
    `,
    readingTime: 9,
    publishDate: '2025-12-22',
    doctorWritten: true,
  },
  {
    id: '13',
    slug: 'parkinsons-disease-management-and-treatment',
    title: "Parkinson's Disease: Management and Treatment Options",
    author: 'Dr. Susan White',
    authorId: undefined,
    topics: ['parkinsons'],
    excerpt: 'Understand Parkinson\'s disease symptoms, treatment options, and strategies for maintaining quality of life while living with this neurological condition.',
    content: `
      <h2>Understanding Parkinson's</h2>
      <p>Parkinson's disease is a progressive neurological disorder that affects movement. It develops gradually, often starting with a barely noticeable tremor.</p>
      
      <h2>Common Symptoms</h2>
      <p>Tremor, slowed movement, rigid muscles, impaired posture and balance, and changes in speech and writing are hallmark symptoms of Parkinson's disease.</p>
      
      <h2>Treatment Approaches</h2>
      <p>While there's no cure, medications can significantly improve symptoms. In some cases, surgical procedures like deep brain stimulation may be considered.</p>
      
      <h2>Lifestyle Management</h2>
      <p>Physical therapy, exercise, and occupational therapy help maintain mobility and independence. A balanced diet and adequate rest also support overall well-being.</p>
      
      <h2>When to Seek Care</h2>
      <p>If you notice persistent movement problems or other Parkinson's symptoms, consult a neurologist for evaluation and treatment planning.</p>
    `,
    readingTime: 8,
    publishDate: '2025-12-20',
    doctorWritten: true,
  },
  {
    id: '14',
    slug: 'stroke-prevention-recognizing-signs',
    title: 'Stroke Prevention: Recognizing Signs and Reducing Risk',
    author: 'Dr. Mark Thompson',
    authorId: undefined,
    topics: ['stroke', 'heart-disease', 'hypertension'],
    excerpt: 'Learn to recognize stroke warning signs using FAST, understand risk factors, and discover prevention strategies that can save lives.',
    content: `
      <h2>Understanding Stroke</h2>
      <p>A stroke occurs when blood flow to the brain is interrupted, causing brain cells to die. Recognizing symptoms quickly is crucial for effective treatment.</p>
      
      <h2>FAST Warning Signs</h2>
      <p>Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency services. Quick action can minimize brain damage.</p>
      
      <h2>Risk Factors</h2>
      <p>High blood pressure, smoking, diabetes, high cholesterol, and atrial fibrillation are major risk factors. Many can be managed through lifestyle changes and medications.</p>
      
      <h2>Prevention Strategies</h2>
      <p>Controlling blood pressure, managing diabetes, quitting smoking, maintaining a healthy weight, and regular exercise all reduce stroke risk.</p>
      
      <h2>Emergency Response</h2>
      <p>If you suspect a stroke, call emergency services immediately. Time is critical, and prompt treatment can significantly improve outcomes.</p>
    `,
    readingTime: 7,
    publishDate: '2025-12-18',
    doctorWritten: true,
  },
  {
    id: '15',
    slug: 'copd-management-breathing-techniques',
    title: 'COPD Management: Breathing Techniques and Lifestyle Changes',
    author: 'Dr. Amanda Garcia',
    authorId: undefined,
    topics: ['copd'],
    excerpt: 'Chronic Obstructive Pulmonary Disease affects millions. Learn about management strategies, breathing techniques, and lifestyle modifications that improve quality of life.',
    content: `
      <h2>Understanding COPD</h2>
      <p>COPD is a group of lung diseases that make breathing difficult. Emphysema and chronic bronchitis are the most common forms of COPD.</p>
      
      <h2>Breathing Techniques</h2>
      <p>Pursed-lip breathing and diaphragmatic breathing can help manage shortness of breath. Pulmonary rehabilitation programs teach these techniques effectively.</p>
      
      <h2>Medication Management</h2>
      <p>Bronchodilators and inhaled corticosteroids help open airways and reduce inflammation. Using inhalers correctly is essential for effectiveness.</p>
      
      <h2>Lifestyle Changes</h2>
      <p>Quitting smoking is the most important step. Avoiding lung irritants, staying active, and getting vaccinated against flu and pneumonia also help.</p>
      
      <h2>When to Seek Care</h2>
      <p>If you experience worsening symptoms, increased coughing, or difficulty breathing, contact your healthcare provider promptly.</p>
    `,
    readingTime: 8,
    publishDate: '2025-12-15',
    doctorWritten: true,
  },
  {
    id: '16',
    slug: 'kidney-disease-prevention-and-management',
    title: 'Kidney Disease: Prevention and Management Strategies',
    author: 'Dr. Kevin Johnson',
    authorId: undefined,
    topics: ['kidney-disease', 'diabetes', 'hypertension'],
    excerpt: 'Learn how to protect your kidney health, recognize early signs of kidney disease, and manage conditions that can lead to kidney problems.',
    content: `
      <h2>Understanding Kidney Disease</h2>
      <p>Kidney disease occurs when kidneys are damaged and can't filter blood properly. Early detection and management can slow progression.</p>
      
      <h2>Risk Factors</h2>
      <p>Diabetes and high blood pressure are leading causes. Other risk factors include family history, age, and certain medications.</p>
      
      <h2>Prevention Strategies</h2>
      <p>Managing diabetes and blood pressure, maintaining a healthy weight, staying hydrated, and avoiding excessive use of certain medications protect kidney health.</p>
      
      <h2>Early Detection</h2>
      <p>Regular check-ups that include blood and urine tests can detect kidney disease early, when treatment is most effective.</p>
      
      <h2>When to See a Doctor</h2>
      <p>If you have risk factors or notice symptoms like swelling, fatigue, or changes in urination, discuss kidney health with your healthcare provider.</p>
    `,
    readingTime: 7,
    publishDate: '2025-12-12',
    doctorWritten: true,
  },
  {
    id: '17',
    slug: 'liver-disease-prevention-healthy-liver',
    title: 'Liver Disease Prevention: Maintaining a Healthy Liver',
    author: 'Dr. Rachel Kim',
    authorId: undefined,
    topics: ['liver-disease', 'nutrition'],
    excerpt: 'Discover how to protect your liver health through diet, lifestyle choices, and understanding risk factors for liver disease.',
    content: `
      <h2>The Liver's Role</h2>
      <p>The liver performs essential functions including filtering toxins, processing nutrients, and producing bile. Keeping it healthy is crucial for overall wellness.</p>
      
      <h2>Common Liver Conditions</h2>
      <p>Fatty liver disease, hepatitis, and cirrhosis are among the most common liver conditions. Many are preventable through lifestyle choices.</p>
      
      <h2>Prevention Strategies</h2>
      <p>Limiting alcohol consumption, maintaining a healthy weight, eating a balanced diet, and avoiding risky behaviors that can transmit hepatitis protect liver health.</p>
      
      <h2>Vaccination</h2>
      <p>Vaccines are available for hepatitis A and B. Getting vaccinated protects against these viral causes of liver disease.</p>
      
      <h2>When to Seek Care</h2>
      <p>Symptoms like jaundice, abdominal pain, or unexplained fatigue warrant medical evaluation for potential liver issues.</p>
    `,
    readingTime: 8,
    publishDate: '2025-12-10',
    doctorWritten: true,
  },
  {
    id: '18',
    slug: 'osteoporosis-prevention-bone-health',
    title: 'Osteoporosis Prevention: Building Strong Bones for Life',
    author: 'Dr. Thomas Moore',
    authorId: undefined,
    topics: ['osteoporosis', 'nutrition'],
    excerpt: 'Learn how to build and maintain strong bones through nutrition, exercise, and lifestyle choices to prevent osteoporosis and fractures.',
    content: `
      <h2>Understanding Osteoporosis</h2>
      <p>Osteoporosis is a condition that weakens bones, making them more prone to fractures. It's often called a "silent disease" because bone loss occurs without symptoms.</p>
      
      <h2>Building Bone Density</h2>
      <p>Peak bone mass is typically reached by age 30. Adequate calcium and vitamin D intake, along with weight-bearing exercise, help build strong bones.</p>
      
      <h2>Nutrition for Bone Health</h2>
      <p>Calcium-rich foods like dairy products, leafy greens, and fortified foods, combined with adequate vitamin D, support bone health throughout life.</p>
      
      <h2>Exercise Benefits</h2>
      <p>Weight-bearing exercises like walking, dancing, and strength training help maintain bone density and reduce fracture risk.</p>
      
      <h2>When to Get Screened</h2>
      <p>Bone density testing is recommended for women over 65 and men over 70, or earlier if risk factors are present.</p>
    `,
    readingTime: 7,
    publishDate: '2025-12-08',
    doctorWritten: true,
  },
  {
    id: '19',
    slug: 'depression-understanding-and-treatment',
    title: 'Depression: Understanding Symptoms and Treatment Options',
    author: 'Dr. Laura Martinez',
    authorId: undefined,
    topics: ['depression', 'mental-health'],
    excerpt: 'Depression is a common but serious condition. Learn to recognize symptoms, understand treatment options, and find hope for recovery.',
    content: `
      <h2>Understanding Depression</h2>
      <p>Depression is more than feeling sad. It's a medical condition that affects how you think, feel, and handle daily activities. It's treatable with proper care.</p>
      
      <h2>Recognizing Symptoms</h2>
      <p>Persistent sadness, loss of interest in activities, changes in sleep or appetite, fatigue, difficulty concentrating, and thoughts of self-harm are common symptoms.</p>
      
      <h2>Treatment Options</h2>
      <p>Treatment may include psychotherapy, medications, or a combination. Many people find relief through evidence-based treatments tailored to their needs.</p>
      
      <h2>Lifestyle Support</h2>
      <p>Regular exercise, adequate sleep, social support, and stress management complement professional treatment and support recovery.</p>
      
      <h2>When to Seek Help</h2>
      <p>If symptoms persist for more than two weeks or interfere with daily life, consult a healthcare provider or mental health professional.</p>
    `,
    readingTime: 9,
    publishDate: '2025-12-05',
    doctorWritten: true,
  },
  {
    id: '20',
    slug: 'anxiety-disorders-management-strategies',
    title: 'Anxiety Disorders: Management and Coping Strategies',
    author: 'Dr. Daniel Lee',
    authorId: undefined,
    topics: ['anxiety', 'mental-health'],
    excerpt: 'Anxiety disorders are highly treatable. Learn about different types of anxiety, effective management strategies, and when to seek professional help.',
    content: `
      <h2>Understanding Anxiety</h2>
      <p>Anxiety is a normal response to stress, but anxiety disorders involve excessive worry that interferes with daily life. They're among the most common mental health conditions.</p>
      
      <h2>Types of Anxiety Disorders</h2>
      <p>Generalized anxiety disorder, panic disorder, social anxiety, and phobias are common forms. Each has specific characteristics and treatment approaches.</p>
      
      <h2>Coping Strategies</h2>
      <p>Deep breathing, mindfulness, regular exercise, and maintaining a routine can help manage anxiety symptoms. Avoiding caffeine and getting adequate sleep also help.</p>
      
      <h2>Professional Treatment</h2>
      <p>Cognitive-behavioral therapy and medications are effective treatments. Many people benefit from a combination approach tailored to their needs.</p>
      
      <h2>When to Seek Help</h2>
      <p>If anxiety significantly impacts your daily life, relationships, or work, consider consulting a mental health professional for evaluation and treatment.</p>
    `,
    readingTime: 8,
    publishDate: '2025-12-03',
    doctorWritten: true,
  },
  {
    id: '21',
    slug: 'substance-abuse-prevention-and-recovery',
    title: 'Substance Abuse: Prevention and Recovery Resources',
    author: 'Dr. Nicole Adams',
    authorId: undefined,
    topics: ['substance-abuse', 'mental-health'],
    excerpt: 'Understand substance abuse risks, prevention strategies, and available resources for those seeking help with addiction and recovery support.',
    content: `
      <h2>Understanding Substance Abuse</h2>
      <p>Substance abuse involves harmful use of drugs or alcohol that leads to health problems, relationship issues, or difficulty functioning in daily life.</p>
      
      <h2>Risk Factors</h2>
      <p>Family history, mental health conditions, peer pressure, and early exposure increase risk. Understanding these factors helps with prevention efforts.</p>
      
      <h2>Prevention Strategies</h2>
      <p>Education, healthy coping skills, strong family relationships, and community support all contribute to preventing substance abuse, especially in young people.</p>
      
      <h2>Recovery Resources</h2>
      <p>Treatment options include therapy, support groups, medication-assisted treatment, and rehabilitation programs. Recovery is possible with appropriate support.</p>
      
      <h2>Getting Help</h2>
      <p>If you or someone you know struggles with substance abuse, reach out to healthcare providers, addiction specialists, or support hotlines for assistance.</p>
    `,
    readingTime: 8,
    publishDate: '2025-12-01',
    doctorWritten: true,
  },
  {
    id: '22',
    slug: 'infectious-diseases-prevention-hygiene',
    title: 'Infectious Diseases: Prevention Through Good Hygiene',
    author: 'Dr. Steven Clark',
    authorId: undefined,
    topics: ['infectious-diseases'],
    excerpt: 'Learn essential hygiene practices and prevention strategies that protect you and your community from infectious diseases, from common colds to more serious illnesses.',
    content: `
      <h2>Understanding Infectious Diseases</h2>
      <p>Infectious diseases are caused by pathogens like bacteria, viruses, fungi, or parasites. Many can be prevented through simple hygiene practices.</p>
      
      <h2>Hand Hygiene</h2>
      <p>Regular handwashing with soap and water for at least 20 seconds is one of the most effective ways to prevent the spread of infectious diseases.</p>
      
      <h2>Respiratory Etiquette</h2>
      <p>Covering your mouth when coughing or sneezing, using tissues, and wearing masks in appropriate settings help prevent respiratory disease transmission.</p>
      
      <h2>Vaccination</h2>
      <p>Vaccines are powerful tools for preventing many infectious diseases. Staying up-to-date with recommended vaccinations protects you and your community.</p>
      
      <h2>When to Stay Home</h2>
      <p>If you're sick, staying home helps prevent spreading illness to others. This is especially important during flu season or outbreaks.</p>
    `,
    readingTime: 6,
    publishDate: '2025-11-28',
    doctorWritten: false,
  },
  {
    id: '23',
    slug: 'autoimmune-diseases-understanding-management',
    title: 'Autoimmune Diseases: Understanding and Management',
    author: 'Dr. Michelle Chen',
    authorId: undefined,
    topics: ['autoimmune', 'arthritis'],
    excerpt: 'Autoimmune diseases occur when the immune system attacks the body. Learn about common conditions, symptoms, and management strategies.',
    content: `
      <h2>Understanding Autoimmune Diseases</h2>
      <p>Autoimmune diseases occur when the immune system mistakenly attacks healthy body tissues. There are over 80 types, affecting millions of people.</p>
      
      <h2>Common Conditions</h2>
      <p>Rheumatoid arthritis, lupus, type 1 diabetes, multiple sclerosis, and inflammatory bowel disease are among the most common autoimmune conditions.</p>
      
      <h2>Symptoms and Diagnosis</h2>
      <p>Symptoms vary widely but may include fatigue, joint pain, skin rashes, and digestive issues. Diagnosis often requires specialized testing and evaluation.</p>
      
      <h2>Management Approaches</h2>
      <p>Treatment focuses on reducing inflammation, managing symptoms, and preventing complications. Medications, lifestyle changes, and stress management all play roles.</p>
      
      <h2>When to See a Specialist</h2>
      <p>If you experience persistent symptoms that might indicate an autoimmune condition, consult a rheumatologist or appropriate specialist for evaluation.</p>
    `,
    readingTime: 8,
    publishDate: '2025-11-25',
    doctorWritten: true,
  },
  {
    id: '24',
    slug: 'nutrition-basics-healthy-eating-guide',
    title: 'Nutrition Basics: A Guide to Healthy Eating',
    author: 'Dr. Jessica Taylor',
    authorId: undefined,
    topics: ['nutrition', 'obesity', 'diabetes'],
    excerpt: 'Learn the fundamentals of good nutrition, including balanced meal planning, understanding food labels, and making healthy choices that support overall wellness.',
    content: `
      <h2>The Foundation of Good Nutrition</h2>
      <p>Good nutrition provides your body with essential nutrients needed for health, growth, and disease prevention. A balanced diet supports all body systems.</p>
      
      <h2>Building Balanced Meals</h2>
      <p>Aim for variety: include fruits, vegetables, whole grains, lean proteins, and healthy fats in your meals. Portion control is also important for maintaining a healthy weight.</p>
      
      <h2>Understanding Food Labels</h2>
      <p>Reading nutrition labels helps you make informed choices. Pay attention to serving sizes, calories, and nutrients like sodium, added sugars, and saturated fats.</p>
      
      <h2>Special Dietary Considerations</h2>
      <p>Individual needs vary based on age, activity level, and health conditions. Consult with a registered dietitian for personalized nutrition guidance.</p>
      
      <h2>Making Sustainable Changes</h2>
      <p>Small, gradual changes are more sustainable than drastic diets. Focus on adding healthy foods rather than just restricting less healthy options.</p>
    `,
    readingTime: 7,
    publishDate: '2025-11-15',
    doctorWritten: false,
  },
];
