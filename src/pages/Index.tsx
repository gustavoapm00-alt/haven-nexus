import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Zap, 
  Users, 
  FileText, 
  BarChart3, 
  Bell, 
  Mail,
  CheckCircle,
  Clock,
  Shield,
  ChevronDown,
  Send,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO from '@/components/SEO';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

const automationCards = [
  { icon: Users, title: 'Lead Intake', description: 'Capture and route leads automatically from any source' },
  { icon: Bell, title: 'Follow-Ups', description: 'Automated email/SMS sequences that never miss a beat' },
  { icon: FileText, title: 'CRM Updates', description: 'Keep your pipeline clean with auto-synced data' },
  { icon: Zap, title: 'Task Routing', description: 'Assign tasks to the right person, automatically' },
  { icon: BarChart3, title: 'Reporting', description: 'Live dashboards that update without manual work' },
  { icon: Mail, title: 'Documentation', description: 'Auto-generated SOPs and handoff docs' },
];

const outcomes = [
  'Lead intake → CRM → follow-up, fully automated',
  'Fewer dropped leads and missed tasks',
  'Faster response time and cleaner pipeline visibility',
  'Centralized dashboards + documented handoff',
];

const inclusions = [
  'Intake forms + routing',
  'CRM pipeline setup OR integration with existing CRM',
  'Automated email/SMS follow-ups (provider-agnostic)',
  'Task routing (ClickUp/Trello/Asana where applicable)',
  'Lightweight reporting dashboard (web-based)',
  'SOP + handoff documentation',
];

const timeline = [
  { days: 'Day 1–2', title: 'Audit + Map', description: 'We map your current workflow and identify automation opportunities' },
  { days: 'Day 3–10', title: 'Build + Integrate', description: 'We build and connect your automated workflows' },
  { days: 'Day 11–14', title: 'QA + Launch', description: 'Testing, training, and documented handoff' },
];

const processSteps = [
  { step: '01', title: 'Audit', description: 'We analyze your current workflow and pain points' },
  { step: '02', title: 'Build', description: 'We create custom automations tailored to your stack' },
  { step: '03', title: 'Test', description: 'Rigorous QA to ensure everything works flawlessly' },
  { step: '04', title: 'Launch', description: 'Go live with training and documentation' },
];

const caseStudies = [
  {
    title: 'Real Estate Agency',
    problem: 'Leads from 5 sources were slipping through the cracks. Manual follow-ups took 8+ hours weekly.',
    automation: 'Unified lead intake → CRM routing → automated nurture sequences → task assignment for hot leads.',
    outcome: 'Response time dropped from 4 hours to 5 minutes. Zero leads lost to manual error.',
  },
  {
    title: 'E-Commerce Brand',
    problem: 'Order status updates, returns, and customer inquiries were handled manually across 3 platforms.',
    automation: 'Order sync → status notifications → return request routing → ticket creation in helpdesk.',
    outcome: 'Support workload reduced by 60%. Customer satisfaction improved with instant updates.',
  },
];

const comingSoonOffers = [
  {
    title: 'Internal Ops Systems Buildout',
    bullets: ['SOPs + process design', 'Tool consolidation + dashboards', 'Automation roadmap for teams'],
  },
  {
    title: 'AERELION OS / Agent Platform',
    bullets: ['Unified automation dashboard', 'Reusable agent/workflow modules', 'Client portal + monitoring'],
  },
];

const faqItems = [
  { q: 'What tools do you integrate with?', a: 'We work with most popular tools including HubSpot, Pipedrive, Salesforce, ClickUp, Trello, Asana, Slack, Gmail, Outlook, Twilio, and many more. If you use it, we can likely connect it.' },
  { q: 'Do I need n8n already?', a: 'No. We handle the entire technical setup. You don\'t need any existing automation infrastructure—we build it for you.' },
  { q: 'What if I don\'t have a CRM?', a: 'We can set one up for you as part of the project, or recommend a lightweight option that fits your needs and budget.' },
  { q: 'What\'s required from my team?', a: 'A 60-minute kickoff call, access to your tools (we\'ll guide you), and availability for a brief training session at launch.' },
  { q: 'How do you define scope?', a: 'We agree on exact deliverables before we start. Fixed scope means no surprise additions—what we quote is what you get.' },
  { q: 'Can you maintain it after launch?', a: 'Yes. We offer optional monthly support packages for ongoing maintenance, updates, and new automation requests.' },
  { q: 'Is this secure?', a: 'Absolutely. We follow security best practices, use encrypted connections, and never store your credentials. All access is revocable.' },
  { q: 'How fast can we start?', a: 'Most projects kick off within 1 week of signing. Book an audit call to get on the calendar.' },
];

const credibilityChips = [
  { icon: Shield, text: 'Fixed Scope' },
  { icon: Zap, text: 'Fast Delivery' },
  { icon: FileText, text: 'Documented Handoff' },
];

const volumeOptions = ['< 50', '50–200', '200–1000', '1000+'];

const Index = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    website: '',
    automationGoal: '',
    tools: '',
    leadVolume: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.automationGoal.trim()) newErrors.automationGoal = 'Please describe what you want to automate';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Store to localStorage and log for future API integration
    const payload = { ...formData, submittedAt: new Date().toISOString() };
    localStorage.setItem('aerelion_lead', JSON.stringify(payload));
    console.log('Lead submission:', payload);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Request received!",
      description: "We'll be in touch within 24 hours to schedule your audit.",
    });
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        canonicalUrl="/" 
        description="AERELION Systems builds workflow automations that replace repetitive manual work in 14 days. Fixed scope, fast delivery, documented handoff." 
        keywords="workflow automation, business automation, lead automation, CRM automation, task automation, n8n, zapier alternative" 
      />
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section id="hero" className="relative min-h-screen flex items-center section-padding pt-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          </div>

          <div className="container-main relative z-10">
            <div className="max-w-4xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className="tag-chip mb-6">AI Workflow Automation</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.1 }} 
                className="font-display text-5xl md:text-6xl lg:text-7xl mb-6"
              >
                AUTOMATE YOUR OPERATIONS{' '}
                <span className="text-gradient">IN 14 DAYS.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.2 }} 
                className="text-xl text-muted-foreground mb-10 max-w-2xl"
              >
                AERELION Systems builds workflow automations that replace repetitive manual work—so you can focus on growth.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.3 }} 
                className="flex flex-wrap gap-4"
              >
                <button onClick={scrollToContact} className="btn-primary">
                  Book a Free Automation Audit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <a href="#automate" className="btn-secondary">
                  See What We Automate
                  <ChevronDown className="ml-2 h-4 w-4" />
                </a>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.4 }} 
                className="flex flex-wrap gap-6 mt-12"
              >
                {credibilityChips.map((chip, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <chip.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm">{chip.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* What We Automate */}
        <section id="automate" className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  WHAT WE <span className="text-gradient">AUTOMATE</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  We replace manual busywork with reliable, automated workflows.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {automationCards.map((card, index) => (
                <ScrollReveal key={index} delay={index * 0.05}>
                  <div className="card-glass p-6 rounded-lg h-full">
                    <card.icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-display text-xl mb-2">{card.title}</h3>
                    <p className="text-muted-foreground text-sm">{card.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Primary Offer */}
        <section id="offer" className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-12">
                <span className="tag-chip mb-4">Live Offer</span>
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  AI WORKFLOW AUTOMATION{' '}
                  <span className="text-gradient">(14-DAY BUILD)</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  We replace repetitive manual work with automated workflows in 14 days.
                </p>
                <p className="text-muted-foreground mt-2">
                  For founders and small teams who are drowning in admin work and tool chaos.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Outcomes */}
              <ScrollReveal>
                <div className="card-glass p-8 rounded-lg h-full">
                  <h3 className="font-display text-2xl mb-6">OUTCOMES</h3>
                  <ul className="space-y-4">
                    {outcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              {/* What's Included */}
              <ScrollReveal delay={0.1}>
                <div className="card-glass p-8 rounded-lg h-full">
                  <h3 className="font-display text-2xl mb-6">WHAT'S INCLUDED</h3>
                  <ul className="space-y-3">
                    {inclusions.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>

            {/* Timeline */}
            <ScrollReveal>
              <div className="card-glass p-8 rounded-lg mb-8">
                <h3 className="font-display text-2xl mb-6 text-center">14-DAY TIMELINE</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {timeline.map((phase, index) => (
                    <div key={index} className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-display text-lg mb-4">
                        {index + 1}
                      </div>
                      <p className="text-primary font-medium text-sm mb-2">{phase.days}</p>
                      <h4 className="font-display text-lg mb-2">{phase.title}</h4>
                      <p className="text-muted-foreground text-sm">{phase.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Pricing & Day 14 Summary */}
            <div className="grid md:grid-cols-2 gap-8">
              <ScrollReveal>
                <div className="card-glass p-8 rounded-lg">
                  <h3 className="font-display text-2xl mb-4">PRICING</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Setup</p>
                      <p className="font-display text-3xl text-gradient">Starting at $1,500</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Support</p>
                      <p className="text-foreground">Optional monthly support available</p>
                    </div>
                    <p className="text-muted-foreground text-sm italic">
                      Fixed scope, fixed timeline, documented handoff.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="card-glass p-8 rounded-lg bg-primary/5">
                  <Sparkles className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-display text-2xl mb-4">WHAT YOU'LL HAVE ON DAY 14</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>✓ Live, working automations handling your workflow</li>
                    <li>✓ Reporting dashboard you can check anytime</li>
                    <li>✓ SOP documentation for your team</li>
                    <li>✓ Training session recording</li>
                    <li>✓ Direct support channel for 30 days</li>
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  HOW IT <span className="text-gradient">WORKS</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  A clear, 4-step process designed for 14-day delivery.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="card-glass p-6 rounded-lg text-center h-full">
                    <div className="font-display text-4xl text-primary/50 mb-4">{step.step}</div>
                    <h3 className="font-display text-xl mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section id="case-studies" className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  REAL <span className="text-gradient">RESULTS</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  See how we've helped businesses automate their operations.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {caseStudies.map((study, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="card-glass p-8 rounded-lg h-full">
                    <h3 className="font-display text-2xl mb-6">{study.title}</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-primary text-sm font-medium mb-1">Problem</p>
                        <p className="text-muted-foreground text-sm">{study.problem}</p>
                      </div>
                      <div>
                        <p className="text-primary text-sm font-medium mb-1">Automation</p>
                        <p className="text-muted-foreground text-sm">{study.automation}</p>
                      </div>
                      <div>
                        <p className="text-primary text-sm font-medium mb-1">Outcome</p>
                        <p className="text-foreground text-sm">{study.outcome}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal>
              <div className="text-center">
                <Link to="/case-studies" className="btn-secondary">
                  View All Case Studies
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Coming Soon */}
        <section id="coming-soon" className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  COMING <span className="text-gradient">SOON</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  More services on the horizon. Join the waitlist to be first in line.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-8">
              {comingSoonOffers.map((offer, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="card-glass p-8 rounded-lg opacity-80 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="font-display text-xl">{offer.title}</h3>
                      <span className="tag-chip text-xs">Coming Soon</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {offer.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <button onClick={scrollToContact} className="btn-secondary w-full justify-center text-sm">
                      Join the Waitlist
                    </button>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section-padding">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  FREQUENTLY ASKED <span className="text-gradient">QUESTIONS</span>
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`} 
                    className="card-glass rounded-lg px-6 border-none"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollReveal>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="section-padding bg-card/30">
          <div className="container-main max-w-3xl">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  REQUEST YOUR <span className="text-gradient">FREE AUDIT</span>
                </h2>
                <p className="text-muted-foreground">
                  Tell us what you're trying to automate. We'll get back within 24 hours.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              {isSubmitted ? (
                <div className="card-glass p-12 rounded-lg text-center">
                  <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h3 className="font-display text-2xl mb-4">REQUEST RECEIVED!</h3>
                  <p className="text-muted-foreground mb-2">Thanks for reaching out.</p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Next steps:</strong> We'll review your submission and email you within 24 hours to schedule a free 30-minute automation audit call.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card-glass p-8 rounded-lg space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                          errors.name ? 'border-destructive' : 'border-border'
                        }`}
                        placeholder="Your name"
                      />
                      {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${
                          errors.email ? 'border-destructive' : 'border-border'
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                        placeholder="Your company"
                      />
                    </div>

                    <div>
                      <label htmlFor="website" className="block text-sm font-medium mb-2">
                        Website
                      </label>
                      <input
                        type="text"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                        placeholder="https://yoursite.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="automationGoal" className="block text-sm font-medium mb-2">
                      What are you trying to automate? <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="automationGoal"
                      name="automationGoal"
                      value={formData.automationGoal}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full px-4 py-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors resize-none ${
                        errors.automationGoal ? 'border-destructive' : 'border-border'
                      }`}
                      placeholder="Describe your current workflow pain points..."
                    />
                    {errors.automationGoal && <p className="text-destructive text-sm mt-1">{errors.automationGoal}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="tools" className="block text-sm font-medium mb-2">
                        Tools you use
                      </label>
                      <input
                        type="text"
                        id="tools"
                        name="tools"
                        value={formData.tools}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                        placeholder="HubSpot, Slack, Gmail, etc."
                      />
                    </div>

                    <div>
                      <label htmlFor="leadVolume" className="block text-sm font-medium mb-2">
                        Monthly lead volume
                      </label>
                      <select
                        id="leadVolume"
                        name="leadVolume"
                        value={formData.leadVolume}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                      >
                        <option value="">Select...</option>
                        {volumeOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full justify-center"
                  >
                    {isSubmitting ? 'Submitting...' : (
                      <>
                        Request My Audit
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
