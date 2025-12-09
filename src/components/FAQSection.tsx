import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Are you an agency?',
    answer: 'No. Agencies sell services. Haven Systems builds systems. Some of those systems look like done-for-you projects (Shopify builds, AI setups, etc.), but the long-term vision is a full ecosystem of tools, brands, housing, and content.',
  },
  {
    question: 'How do we start working together?',
    answer: 'Start simple. DM me on Instagram with one word: "SYSTEMS," "SHOPIFY," or "FOUNDATION" depending on what you need. We\'ll talk, see if it\'s a fit, and move from there.',
  },
  {
    question: 'Do you work with beginners?',
    answer: 'Yes—as long as you\'re serious. I work with both early-stage entrepreneurs and people already in motion who need structure, tech, and strategy.',
  },
  {
    question: 'What if I don\'t know exactly what I need?',
    answer: 'That\'s normal. Tell me where you\'re stuck. I\'ll help you figure out if you need a system, a store, a brand reset, or something else.',
  },
  {
    question: 'Where are you based?',
    answer: 'I\'m based in Virginia, working nights and building Haven Systems from the ground up.',
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="section-padding bg-background">
      <div className="container-main max-w-3xl">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-center mb-12">
          <span className="text-gradient">FAQ</span>
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border/50 rounded-sm px-6 bg-card data-[state=open]:border-primary/30 transition-colors"
            >
              <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
