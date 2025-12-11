import { Link } from 'react-router-dom';
import { ArrowRight, Target, Lightbulb, Users, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

const values = [
  {
    icon: Target,
    title: 'Systems Over Hustle',
    description: 'We believe in building sustainable systems that work for you, not just working harder.'
  },
  {
    icon: Lightbulb,
    title: 'Innovation First',
    description: 'We stay at the cutting edge of AI and automation technology to deliver the best solutions.'
  },
  {
    icon: Users,
    title: 'Human-Centered',
    description: 'Technology should empower people, not replace them. We build tools that amplify human potential.'
  },
  {
    icon: Zap,
    title: 'Results Driven',
    description: 'Every solution we build is measured by the real impact it has on your business.'
  }
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <span className="tag-chip mb-6">About Us</span>
                <h1 className="font-display text-5xl md:text-6xl mb-6">
                  BUILDING THE FUTURE OF{' '}
                  <span className="text-gradient">AUTOMATION</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Aerlion Systems is an AI automation company helping businesses 
                  scale through intelligent technology and streamlined operations.
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
                <h2 className="font-display text-3xl md:text-4xl mt-4">
                  To transform how businesses operate by making powerful AI automation 
                  accessible to entrepreneurs and organizations of all sizes.
                </h2>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  OUR <span className="text-gradient">VALUES</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 mb-4">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-display text-xl mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
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
                <span className="tag-chip mb-4">Founder & Visionary</span>
                <h3 className="font-display text-4xl mb-2">GUSTAVO PUERTO MARTINEZ</h3>
                <div className="space-y-4 text-muted-foreground mt-6">
                  <p>
                    Gustavo founded Aerlion Systems with a clear mission: to help entrepreneurs 
                    and businesses escape the trap of endless manual work through intelligent automation.
                  </p>
                  <p>
                    His journey from personal challenges to building systems that create lasting 
                    change drives the company's human-centered approach to technology. He believes 
                    that the right systems can transform not just businesses, but lives.
                  </p>
                  <p>
                    Today, Gustavo leads a team dedicated to making AI automation accessible to 
                    businesses of all sizes, combining cutting-edge technology with practical, 
                    results-driven solutions.
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
                  LET'S BUILD <span className="text-gradient">TOGETHER</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Ready to transform your business with intelligent automation?
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/contact" className="btn-primary">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link to="/services" className="btn-secondary">
                    View Services
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
