import { Bot, Store, Layers } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import StaggerContainer, { StaggerItem } from './StaggerContainer';
const offers = [{
  icon: Bot,
  title: 'AI & Systems for Entrepreneurs',
  description: 'I help you plug AI and automation into your business so you stop doing everything manually.',
  includes: ['Custom AI agents for research and outreach', 'Automated workflows for content, lead gen, or operations', 'Strategy sessions to map your tech stack and systems'],
  cta: 'DM me "SYSTEMS" on Instagram',
  ctaCode: 'SYSTEMS'
}, {
  icon: Store,
  title: 'Shopify & E-com Builds',
  description: 'Done-for-you or guided Shopify builds that make your brand look expensive and feel organized.',
  includes: ['Store setup and structure', 'Product page and homepage strategy', 'Basic automations and app stack recommendations'],
  cta: 'DM me "SHOPIFY" on Instagram',
  ctaCode: 'SHOPIFY'
}, {
  icon: Layers,
  title: 'Brand & Digital Foundation',
  description: 'For new entrepreneurs who know they\'re meant for more but need structure.',
  includes: ['Brand story and positioning', 'Basic funnel (Instagram → offer → booking)', 'Simple tech stack you can actually maintain'],
  cta: 'DM me "FOUNDATION" on Instagram',
  ctaCode: 'FOUNDATION'
}];
const OffersSection = () => {
  return <section id="offers" className="section-padding bg-background">
      <div className="container-main">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
              WHAT I'M DOING <span className="text-gradient">RIGHT NOW</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These are the ways you can work with me today while the larger ecosystem keeps evolving.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid lg:grid-cols-3 gap-6" staggerDelay={0.15}>
          {offers.map(offer => {
          const Icon = offer.icon;
          return <StaggerItem key={offer.title}>
                <div className="card-glow p-8 rounded-sm border border-border/50 flex flex-col hover:border-primary/30 transition-all duration-500 h-full">
                  <div className="p-3 bg-primary/10 rounded-sm w-fit mb-6">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="font-display text-2xl text-foreground mb-3">
                    {offer.title}
                  </h3>

                  <p className="text-muted-foreground mb-6">
                    {offer.description}
                  </p>

                  <p className="text-sm font-medium text-foreground mb-3">This can look like:</p>

                  <ul className="space-y-2 mb-8 flex-grow">
                    {offer.includes.map((item, index) => <li key={index} className="flex items-start gap-2 text-muted-foreground text-sm">
                        <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>)}
                  </ul>

                  <a target="_blank" rel="noopener noreferrer" className="btn-primary text-center" href="https://www.instagram.com/null.username__/">
                    {offer.cta}
                  </a>
                </div>
              </StaggerItem>;
        })}
        </StaggerContainer>

        <ScrollReveal delay={0.3}>
          <p className="text-center text-muted-foreground mt-12 text-sm">
            All offers start with a conversation. No pressure, no fake urgency.
          </p>
        </ScrollReveal>
      </div>
    </section>;
};
export default OffersSection;