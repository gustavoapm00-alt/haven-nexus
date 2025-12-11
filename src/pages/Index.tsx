import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Bot, ShoppingBag, Workflow, Shield, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SEO from '@/components/SEO';

const features = [
  {
    icon: Bot,
    title: 'Custom AI Agents',
    description: 'Intelligent automation that handles customer service, lead qualification, and routine tasks 24/7.'
  },
  {
    icon: Workflow,
    title: 'Automated Workflows',
    description: 'Streamline operations with smart processes that connect your tools and eliminate manual work.'
  },
  {
    icon: ShoppingBag,
    title: 'E-Commerce Solutions',
    description: 'Complete Shopify builds with AI-powered inventory, pricing, and customer engagement systems.'
  }
];

const benefits = [
  { icon: Clock, text: 'Save 20+ hours per week' },
  { icon: Shield, text: 'Enterprise-grade security' },
  { icon: Zap, text: 'Deploy in days, not months' }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        canonicalUrl="/"
        description="Aerlion Systems builds intelligent automation solutions that handle repetitive tasks so you can focus on growth. AI agents, workflows, and e-commerce solutions."
        keywords="AI automation, business automation, AI agents, workflow automation, e-commerce automation, Shopify development"
      />
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center section-padding pt-32">
          {/* Background Effects */}
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
                <span className="tag-chip mb-6">AI-Powered Automation Platform</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl mb-6"
              >
                AUTOMATE YOUR BUSINESS.{' '}
                <span className="text-gradient">SCALE WITHOUT LIMITS.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-muted-foreground mb-10 max-w-2xl"
              >
                Aerlion Systems builds intelligent automation solutions that handle 
                your repetitive tasks, so you can focus on growth.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/pricing" className="btn-primary">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link to="/services" className="btn-secondary">
                  View Services
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-6 mt-12"
              >
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <benefit.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm">{benefit.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-display text-3xl md:text-4xl mb-6">
                    THE PROBLEM WITH MANUAL WORK
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Entrepreneurs spend 60% of their time on tasks that could be automated. 
                    That's time stolen from strategy, creativity, and growth.
                  </p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                      Repetitive customer inquiries eating your day
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                      Manual data entry and reporting tasks
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                      Disconnected tools that don't communicate
                    </li>
                  </ul>
                </div>
                <div className="card-glass p-8 rounded-lg">
                  <h3 className="font-display text-2xl mb-4 text-gradient">THE AERLION SOLUTION</h3>
                  <p className="text-muted-foreground mb-4">
                    We deploy AI systems that handle your operations automatically, 
                    giving you back the time to focus on what matters.
                  </p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      AI agents that respond instantly, 24/7
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      Automated workflows that sync your tools
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      Data-driven insights delivered automatically
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding">
          <div className="container-main">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl md:text-5xl mb-4">
                  WHAT WE <span className="text-gradient">BUILD</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  From custom AI agents to complete e-commerce systems, we deliver 
                  automation solutions that scale with your business.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="card-glass p-8 rounded-lg h-full">
                    <feature.icon className="h-12 w-12 text-primary mb-6" />
                    <h3 className="font-display text-2xl mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.3}>
              <div className="text-center mt-12">
                <Link to="/services" className="btn-secondary">
                  Explore All Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-card/30">
          <div className="container-main">
            <ScrollReveal>
              <div className="card-glass p-12 md:p-16 rounded-lg text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-6">
                  READY TO <span className="text-gradient">AUTOMATE</span>?
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Start your free trial today. No credit card required. 
                  See how AI automation can transform your business.
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

export default Index;
