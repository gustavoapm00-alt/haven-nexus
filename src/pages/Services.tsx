import { Link } from 'react-router-dom';
import { Bot, Workflow, ShoppingBag, Cpu, Database, Palette, ArrowRight, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

const services = [
  {
    icon: Bot,
    title: 'Custom AI Agents',
    description: 'Intelligent virtual assistants that handle customer inquiries, qualify leads, and automate support around the clock.',
    features: [
      '24/7 automated customer support',
      'Lead qualification and scoring',
      'Appointment scheduling',
      'FAQ and knowledge base integration',
      'Multi-channel deployment (web, SMS, social)'
    ]
  },
  {
    icon: Workflow,
    title: 'Automated Workflows',
    description: 'Connect your tools and eliminate manual processes with intelligent automation that runs your business while you sleep.',
    features: [
      'CRM and email automation',
      'Task and project management flows',
      'Data sync across platforms',
      'Custom trigger-based actions',
      'Reporting and analytics automation'
    ]
  },
  {
    icon: ShoppingBag,
    title: 'E-Commerce Solutions',
    description: 'Complete Shopify store builds with AI-powered features that drive sales and streamline operations.',
    features: [
      'Full Shopify store setup',
      'AI-powered inventory management',
      'Dynamic pricing optimization',
      'Automated order processing',
      'Customer behavior analytics'
    ]
  },
  {
    icon: Cpu,
    title: 'AI Integration',
    description: 'Embed artificial intelligence into your existing systems to unlock new capabilities and efficiencies.',
    features: [
      'GPT and LLM integration',
      'Computer vision solutions',
      'Natural language processing',
      'Predictive analytics',
      'Custom AI model training'
    ]
  },
  {
    icon: Database,
    title: 'SaaS Development',
    description: 'Build scalable software-as-a-service products with modern architecture and AI capabilities baked in.',
    features: [
      'Full-stack development',
      'Cloud infrastructure setup',
      'API design and integration',
      'User authentication systems',
      'Subscription management'
    ]
  },
  {
    icon: Palette,
    title: 'Brand & Digital Foundation',
    description: 'Establish your digital presence with strategic branding, positioning, and foundational systems.',
    features: [
      'Brand strategy and identity',
      'Website design and development',
      'Content management systems',
      'SEO and analytics setup',
      'Social media integration'
    ]
  }
];

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <span className="tag-chip mb-6">Our Services</span>
                <h1 className="font-display text-5xl md:text-6xl mb-6">
                  AUTOMATION <span className="text-gradient">SOLUTIONS</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  From AI agents to complete e-commerce systems, we build the 
                  technology that powers modern businesses.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Services Grid */}
        <section className="section-padding pt-0">
          <div className="container-main">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="card-glass p-8 rounded-lg h-full flex flex-col">
                    <service.icon className="h-12 w-12 text-primary mb-6" />
                    <h3 className="font-display text-2xl mb-4">{service.title}</h3>
                    <p className="text-muted-foreground mb-6">{service.description}</p>
                    <ul className="space-y-2 mt-auto">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  READY TO GET <span className="text-gradient">STARTED</span>?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Start your free trial today and experience the power of AI automation.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/auth?plan=free-trial" className="btn-primary">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link to="/pricing" className="btn-secondary">
                    View Pricing
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
