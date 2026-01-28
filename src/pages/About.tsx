import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, Target, Zap, Building2, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO, { schemas } from '@/components/SEO';
import { motion } from 'framer-motion';

const About = () => {
  const principles = [
    {
      icon: Target,
      title: 'Outcome-Driven',
      description: 'We focus on operational results, not feature checklists. Every engagement delivers measurable capacity recovery.',
    },
    {
      icon: Shield,
      title: 'Operator Accountability',
      description: "We take responsibility for execution. When something breaks, we fix it—not you.",
    },
    {
      icon: Handshake,
      title: 'Transparent Partnership',
      description: "No hidden complexity. You know exactly what we're doing, when, and why.",
    },
  ];

  const capabilities = [
    {
      icon: Building2,
      title: 'Infrastructure We Manage',
      points: [
        'Secure automation environments',
        'Credential storage and rotation',
        'Monitoring and alerting systems',
        'Backup and recovery procedures',
      ],
    },
    {
      icon: Zap,
      title: 'Operations We Handle',
      points: [
        'System configuration and deployment',
        'Ongoing maintenance and updates',
        'Issue detection and resolution',
        'Performance optimization',
      ],
    },
    {
      icon: Users,
      title: 'Support We Provide',
      points: [
        'Dedicated operator for each engagement',
        'Regular status updates and reporting',
        'Responsive issue escalation',
        'Knowledge transfer on handoff',
      ],
    },
  ];

  const aboutStructuredData = [
    schemas.organization,
    schemas.breadcrumb([
      { name: 'Home', url: '/' },
      { name: 'About', url: '/about' }
    ]),
    schemas.webPage(
      "About AERELION Systems",
      "Learn about AERELION's managed operator model for professional services automation",
      "/about"
    )
  ];

  return (
    <>
      <SEO
        title="About AERELION – The Managed Automation Operator Model"
        description="AERELION Systems is a managed automation operator for professional services firms. We configure, host, and operate automation systems so you can focus on serving clients. Learn about our operating principles."
        keywords="about AERELION, managed automation operator, automation as a service, professional services automation, business operations partner, workflow automation company"
        canonicalUrl="/about"
        structuredData={aboutStructuredData}
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        {/* Hero */}
        <section className="section-padding !pt-12">
          <div className="container-main max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-3 block">
                About AERELION
              </span>
              <h1 className="text-4xl font-semibold text-foreground mb-4">
                Your Operational Systems Partner
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                AERELION Systems builds automation platforms that replace repetitive work 
                and give business owners clarity and control. We're not a software vendor—we're 
                the team that makes automation actually work for your business.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What We Do */}
        <section className="section-padding !pt-0">
          <div className="container-main max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-enterprise p-8 md:p-10"
            >
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                The Managed Operator Model
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Most automation tools require you to become a technologist. You need to learn 
                the platform, build the workflows, maintain the connections, and troubleshoot 
                when things break. AERELION takes a different approach.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We operate automation systems on your behalf. You tell us what operational 
                outcomes you need—less time on data entry, faster client onboarding, 
                automated compliance checks—and we configure, deploy, and maintain the 
                systems that deliver those outcomes.
              </p>
              <p className="text-foreground font-medium">
                You buy results. We handle execution.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Principles */}
        <section className="section-padding bg-muted/20">
          <div className="container-main max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Our Operating Principles
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These principles guide every engagement and shape how we work with clients.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {principles.map((principle, index) => (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card-enterprise p-6"
                >
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <principle.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{principle.title}</h3>
                  <p className="text-sm text-muted-foreground">{principle.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Provide */}
        <section className="section-padding">
          <div className="container-main max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                What You Get With AERELION
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A complete operational layer—infrastructure, operations, and support—so you 
                can focus on your clients instead of your systems.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {capabilities.map((capability, index) => (
                <motion.div
                  key={capability.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card-enterprise p-6"
                >
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <capability.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-4">{capability.title}</h3>
                  <ul className="space-y-2">
                    {capability.points.map((point) => (
                      <li key={point} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="section-padding bg-muted/20">
          <div className="container-main max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Built for Professional Services
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              AERELION is purpose-built for professional services firms, government contractors, 
              and compliance-driven organizations. These businesses share common characteristics: 
              high operational complexity, strict data requirements, and limited technical staff.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We understand that your focus is on serving clients—not managing software. 
              That's why we take on the operational burden so you don't have to.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding">
          <div className="container-main max-w-3xl">
            <div className="card-enterprise p-8 md:p-10 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Ready to Work With a Systems Partner?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Schedule a discovery call to discuss your operational challenges and see if 
                AERELION is the right fit for your organization.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg">
                  <Link to="/contact">
                    Schedule Discovery Call
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/how-it-works">
                    See How It Works
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default About;
