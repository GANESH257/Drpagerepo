import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How do I filter doctors by insurance?',
    answer:
      'On the doctors directory page, use the insurance filter dropdown to select your insurance provider. The list will automatically update to show only doctors who accept your plan.',
  },
  {
    question: 'How do booking requests work?',
    answer:
      'You can request an appointment time through a doctor\'s profile page. This is currently a placeholder feature - the doctor\'s office will contact you to confirm the appointment. In the future, this will integrate with real scheduling systems.',
  },
  {
    question: 'Are the reviews verified?',
    answer:
      'Yes, we verify reviews to ensure they come from actual patients. Reviews marked with a "Verified Visit" badge have been confirmed as authentic patient experiences.',
  },
  {
    question: 'How do I update my doctor\'s information?',
    answer:
      'If you notice incorrect information about a doctor, please contact us at info@alliancephysicians.com. We regularly update doctor profiles to ensure accuracy.',
  },
  {
    question: 'What is your privacy policy?',
    answer:
      'We take patient privacy seriously. All information submitted through our platform is handled according to HIPAA guidelines. We do not share personal information with third parties without consent. See our Privacy Policy page for full details.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24 relative overflow-hidden">
      {/* Enhanced layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/10 via-background via-60% to-brand-dark-blue/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-blue/8 via-transparent to-brand-teal/8" />
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-brand-teal rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-brand-dark-blue rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-teal/40 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about using our directory.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white/80 backdrop-blur-sm mb-2 rounded-lg px-4 border-2 border-transparent hover:border-brand-teal/20 transition-colors"
              >
                <AccordionTrigger className="text-left text-lg hover:no-underline text-brand-dark-blue">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
