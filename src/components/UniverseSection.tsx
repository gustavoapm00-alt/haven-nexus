import { Cpu, ShoppingCart, Shirt, Heart, Film, Building2 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import StaggerContainer, { StaggerItem } from './StaggerContainer';
const divisions = [{
  icon: Cpu,
  title: 'HavenTech',
  label: 'AI tools, software, and systems',
  description: 'AI agents, research tools, scrapers, and SaaS products that help entrepreneurs and operators move faster, make better decisions, and automate the boring work.'
}, {
  icon: ShoppingCart,
  title: 'HavenCommerce',
  label: 'E-commerce and digital infrastructure',
  description: 'High-converting Shopify builds, product validation systems, and done-for-you store setups. From branding to structure, I build online stores that feel premium and perform.'
}, {
  icon: Shirt,
  title: 'HavenWear',
  label: 'Clothing and identity',
  description: 'Streetwear and faith-inspired apparel that carries story, emotion, and calling. Clothing for the lost, the different, the ones rebuilding themselves.'
}, {
  icon: Heart,
  title: 'Haven Health',
  label: 'Supplements and performance',
  description: 'Mind–body–spirit focused supplements designed for people rebuilding themselves—especially those healing from addiction, depression, and burnout.'
}, {
  icon: Film,
  title: 'Haven Media',
  label: 'Stories, content, and films',
  description: 'Short films, testimony-based content, and faceless digital storytelling that documents real transformation, real pain, and real breakthrough.'
}, {
  icon: Building2,
  title: 'Haven Housing & Development',
  label: 'Future builds and real estate',
  description: 'Long-term, I\'m building housing and development projects for people who need a fresh start—Section 8 rehabs, transitional housing, and structures that restore dignity.'
}];
const UniverseSection = () => {
  return <section id="universe" className="section-padding bg-secondary/30">
      <div className="container-main">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
              THE HAVEN SYSTEMS <span className="text-gradient">UNIVERSE</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every project fits into one of these divisions. This keeps the vision big and the execution focused.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-2 gap-6" staggerDelay={0.1}>
          {divisions.map(division => {
          const Icon = division.icon;
          return <StaggerItem key={division.title}>
                <div className="card-glow p-8 rounded-sm border border-border/50 group hover:border-primary/30 transition-all duration-500 h-full">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-sm group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl text-foreground mb-1">
                        {division.title}
                      </h3>
                      <p className="text-sm text-primary font-medium uppercase tracking-wider mb-3">
                        {division.label}
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        {division.description}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>;
        })}
        </StaggerContainer>

        <ScrollReveal delay={0.3}>
          <p className="text-center text-muted-foreground mt-12">
            Want to collaborate on one of these divisions?{' '}
            <a target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" href="https://www.instagram.com/null.username__/">
              DM me on Instagram
            </a>
            .
          </p>
        </ScrollReveal>
      </div>
    </section>;
};
export default UniverseSection;