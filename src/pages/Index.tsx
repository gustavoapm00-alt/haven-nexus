import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, ShoppingCart, CheckCircle, Eye, Users, Layers, Zap, Target, BarChart3 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO from '@/components/SEO';

const agents = [
  { name: 'AI Shop Builder', icon: ShoppingCart },
  { name: 'SEO Optimizer', icon: Target },
  { name: 'Product Page Generator', icon: Layers },
  { name: 'Abandoned Cart Email Writer', icon: BarChart3 },
  { name: 'Pricing Optimizer', icon: Zap },
  { name: 'Customer Support Assistant', icon: Users },
];

const howItWorks = [
  { step: '1', title: 'Choose a Plan', description: 'Pick the tier that fits your business needs.' },
  { step: '2', title: 'Unlock Your Agents', description: 'Your AI tools are instantly available in your dashboard.' },
  { step: '3', title: 'Run Agents On Demand', description: 'Provide your input. Let the agent do the work.' },
  { step: '4', title: 'Review Results', description: 'Outputs are saved, organized, and reusable.' },
];

const whoIsItFor = [
  'Founders and operators',
  'E-commerce brands',
  'Agencies that want repeatable AI results',
  'Teams that value structure over hype',
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        canonicalUrl="/"
        description="Aerelion is a software platform that gives you ready-to-use AI agents, packaged into clear plans, designed to help your business execute faster and smarter."
        keywords="AI agents, prepackaged AI, e-commerce AI, AI automation, business AI tools, SaaS AI platform"
      />
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center section-padding pt-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          </div>

          <div className="container-main relative z-10">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="tag-chip mb-6">Prepackaged AI Agents</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl mb-6"
              >
                AERELION.{' '}
                <span className="text-gradient">REAL BUSINESS RESULTS.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-muted-foreground mb-6 max-w-2xl"
              >
                Ready-to-use AI agents, packaged into clear plans, designed to help your business execute faster, smarter, and with less overhead.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-muted-foreground mb-10 space-y-1"
              >
                <p>No building. No prompt engineering. No technical setup.</p>
                <p className="text-primary font-medium">Just choose a plan, unlock your agents, and put them to work.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/pricing" className="btn-primary">
                  View Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link to="/auth" className="btn-secondary">
                  Get Started
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* AI That Works Like a Team Section */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-display text-3xl md:text-4xl mb-6">
                    AI THAT WORKS LIKE A <span className="text-gradient">TEAM</span> — NOT A TOY
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Most AI tools give you a blank box and tell you to "figure it out."
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Aerelion does the opposite.
                  </p>
                  <p className="text-muted-foreground">
                    We deliver prebuilt AI agents, each designed to handle a specific business function — from building e-commerce stores to optimizing SEO and writing high-converting product pages.
                  </p>
                </div>
                <div className="card-glass p-8 rounded-lg">
                  <h3 className="font-display text-xl mb-6">Every agent is:</h3>
                  <ul className="space-y-4">
                    {['Purpose-built', 'Professionally prompted', 'Continuously reusable', 'Logged, auditable, and reliable'].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-primary font-medium border-t border-border pt-6">
                    This isn't experimentation. This is execution.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Prepackaged AI Agents Section */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  PREPACKAGED <span className="text-gradient">AI AGENTS</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Each agent is a specialized tool, trained through carefully engineered prompts to perform a real task. No setup required. Just input your details and run.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="card-glass p-6 rounded-lg h-full flex items-center gap-4">
                    <agent.icon className="h-10 w-10 text-primary flex-shrink-0" />
                    <span className="font-display text-lg">{agent.name}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Clear Plans Section */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  CLEAR PLANS. <span className="text-gradient">CLEAR ACCESS.</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Aerelion uses tiered plans so you always know exactly what you're getting.
                </p>
                <div className="card-glass p-8 rounded-lg text-left">
                  <h3 className="font-display text-xl mb-4">Each plan includes:</h3>
                  <ul className="space-y-3 mb-6">
                    {['A bundle of AI agents', 'A monthly run limit', 'Immediate access after signup'].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground">
                    Upgrade anytime. No hidden complexity.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Built for Trust Section */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="card-glass p-8 rounded-lg">
                  <Eye className="h-12 w-12 text-primary mb-6" />
                  <h3 className="font-display text-xl mb-4">You can always see:</h3>
                  <ul className="space-y-3">
                    {['What input was used', 'What output was generated', 'When it ran', 'Whether it succeeded or failed'].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="font-display text-3xl md:text-4xl mb-6">
                    BUILT FOR <span className="text-gradient">TRUST</span> AND CONTROL
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Every AI action is logged.
                  </p>
                  <p className="text-muted-foreground">
                    This gives you confidence, transparency, and repeatability — the things most AI tools skip.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* E-Commerce Solutions Section */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center">
                <span className="tag-chip mb-6">E-Commerce Solutions</span>
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  AI AGENTS BUILT FOR <span className="text-gradient">ONLINE STORES</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  If you run an e-commerce business, Aerelion gives you an AI toolkit designed specifically for you.
                </p>
                <div className="card-glass p-8 rounded-lg text-left mb-8">
                  <h3 className="font-display text-xl mb-4">Our E-Commerce plans include agents that help you:</h3>
                  <ul className="space-y-3 mb-6">
                    {[
                      'Build store structures',
                      'Optimize SEO and product pages',
                      'Recover abandoned carts',
                      'Improve pricing strategy',
                      'Handle customer support content'
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground">
                    All bundled into simple monthly tiers.
                  </p>
                </div>
                <Link to="/pricing/ecom" className="btn-primary">
                  View E-Commerce AI Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  HOW <span className="text-gradient">AERELION</span> WORKS
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {howItWorks.map((item, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="card-glass p-6 rounded-lg h-full text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <span className="font-display text-xl text-primary">{item.step}</span>
                    </div>
                    <h3 className="font-display text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal>
              <div className="text-center text-muted-foreground">
                <p className="mb-2">That's it.</p>
                <p>No learning curve. No fragile workflows. No AI chaos.</p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Who Is It For Section */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto">
                <h2 className="font-display text-4xl md:text-5xl mb-8 text-center">
                  WHO <span className="text-gradient">AERELION</span> IS FOR
                </h2>
                <div className="card-glass p-8 rounded-lg">
                  <ul className="space-y-4 mb-6">
                    {whoIsItFor.map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-primary font-medium border-t border-border pt-6">
                    If you want AI that produces, not just talks — you're in the right place.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Why Different Section */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  WHY AERELION IS <span className="text-gradient">DIFFERENT</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-8">
              <ScrollReveal delay={0.1}>
                <div className="card-glass p-8 rounded-lg h-full border-destructive/20">
                  <h3 className="font-display text-xl mb-4 text-muted-foreground">Other platforms give you:</h3>
                  <ul className="space-y-3">
                    {['Generic chatbots', 'Endless prompt tweaking', 'Fragile automations'].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="card-glass p-8 rounded-lg h-full border-primary/20">
                  <h3 className="font-display text-xl mb-4 text-primary">Aerelion gives you:</h3>
                  <ul className="space-y-3">
                    {['Pre-engineered AI agents', 'Tier-based access', 'Execution you can trust', 'A system that scales with you'].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.3}>
              <p className="text-center text-primary font-medium mt-8">
                This is AI as infrastructure — not a novelty.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="card-glass p-12 md:p-16 rounded-lg text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  START USING AI THE <span className="text-gradient">RIGHT WAY</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-4">
                  Stop experimenting. Start executing.
                </p>
                <p className="text-muted-foreground mb-8">
                  Choose a plan and put your AI agents to work today.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/pricing" className="btn-primary">
                    View Plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link to="/auth" className="btn-secondary">
                    Get Started
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

export default Index;
