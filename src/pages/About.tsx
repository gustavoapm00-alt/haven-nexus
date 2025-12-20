import { Link } from 'react-router-dom';
import { ArrowRight, Target, Lightbulb, Users, Zap, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO, { schemas } from '@/components/SEO';

const values = [
  {
    icon: Target,
    title: 'Systems Over Hustle',
    description: 'Sustainable growth comes from structure, not overwork.'
  },
  {
    icon: Lightbulb,
    title: 'Clarity Beats Complexity',
    description: 'If it\'s hard to understand, it\'s not finished.'
  },
  {
    icon: Users,
    title: 'Automation Must Serve Humans',
    description: 'Tech reduces cognitive load, not increases it.'
  },
  {
    icon: Shield,
    title: 'Truthful Capability',
    description: 'Only claim what we can actually deliver.'
  },
  {
    icon: Zap,
    title: 'Long-Term Thinking',
    description: 'Design systems that won\'t break as the business grows.'
  }
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="About"
        description="AERELION Systems exists to reduce operational friction for modern businesses by turning repetitive work and scattered tools into clear, intelligent systems."
        keywords="about AERELION Systems, automation company, operational systems, business automation"
        canonicalUrl="/about"
        structuredData={schemas.breadcrumb([
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' }
        ])}
      />
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <span className="tag-chip mb-6">About Us</span>
                <h1 className="font-display text-5xl md:text-6xl mb-6">
                  WHY WE <span className="text-gradient">EXIST</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  AERELION Systems exists to reduce operational friction for modern businesses 
                  by turning repetitive work and scattered tools into clear, intelligent systems.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Mission */}
        <section className="section-padding pt-0">
          <div className="container-main">
            <ScrollReveal>
              <div className="card-glass p-12 rounded-lg text-center max-w-4xl mx-auto">
                <span className="text-primary text-sm uppercase tracking-wider font-medium">Our Mission</span>
                <h2 className="font-display text-2xl md:text-3xl mt-4 text-muted-foreground">
                  Design and deploy automation systems using AI agents and workflow orchestration 
                  that remove repetitive tasks, offload routine decisions, and give business owners 
                  operational clarity.
                </h2>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Vision */}
        <section className="section-padding bg-card/30">
          <div className="container-main max-w-4xl">
            <ScrollReveal>
              <div className="text-center">
                <span className="text-primary text-sm uppercase tracking-wider font-medium">Our Vision</span>
                <h2 className="font-display text-3xl md:text-4xl mt-4 mb-6">
                  A world where businesses operate on <span className="text-gradient">systems</span>, not memory.
                </h2>
                <p className="text-muted-foreground text-lg">
                  Where owners spend less time managing processes and more time leading with clarity.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  OUR <span className="text-gradient">VALUES</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {values.map((value, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="text-center card-glass p-6 rounded-lg">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 mb-4">
                      <value.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-display text-xl mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="section-padding bg-card/30">
          <div className="container-main max-w-4xl">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl mb-4">
                  WHO WE <span className="text-gradient">SERVE</span>
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="card-glass p-8 rounded-lg">
                <h3 className="font-display text-2xl mb-4 text-center">The Overloaded Operator</h3>
                <p className="text-muted-foreground text-center mb-6">
                  A founder or operator running a real business who feels constantly busy, 
                  mentally overloaded, and stuck managing operations instead of growing the company.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-sm uppercase tracking-wider text-primary mb-3">They Are:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Competent, not lazy</li>
                      <li>• System-poor, not skill-poor</li>
                      <li>• Holding the business together manually</li>
                      <li>• Ready for structure, not hacks</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm uppercase tracking-wider text-primary mb-3">They Want:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Relief from operational overload</li>
                      <li>• Trust that things are handled</li>
                      <li>• Control without constant involvement</li>
                      <li>• Growth without more chaos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Founder Section */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  LEADERSHIP
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="card-glass p-8 md:p-12 rounded-lg max-w-3xl mx-auto text-center">
                <span className="tag-chip mb-4">Founder</span>
                <h3 className="font-display text-4xl mb-2">GUSTAVO PUERTO MARTINEZ</h3>
                <div className="space-y-4 text-muted-foreground mt-6">
                  <p>
                    Gustavo founded AERELION Systems to help operators escape the trap of 
                    endless manual work through intelligent systems.
                  </p>
                  <p>
                    His approach is rooted in the belief that the right systems can 
                    transform not just businesses, but the lives of the people running them.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  LET'S BUILD <span className="text-gradient">SYSTEMS</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Ready to trade chaos for clarity?
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/get-started" className="btn-primary">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link to="/capabilities" className="btn-secondary">
                    View Capabilities
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

export default About;
