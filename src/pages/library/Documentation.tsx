import { Book, Cloud, Settings, HelpCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO from '@/components/SEO';

const Documentation = () => {
  const docSections = [
    {
      icon: Cloud,
      title: 'Getting Started',
      description: 'New to AERELION hosted automations? Start here.',
      links: [
        { label: 'What is a hosted automation?', href: '#' },
        { label: 'How activation works', href: '#' },
        { label: 'Your first automation', href: '#' },
      ],
    },
    {
      icon: Settings,
      title: 'Connection Guides',
      description: 'Step-by-step instructions for connecting your tools.',
      links: [
        { label: 'Connecting your first tool', href: '#' },
        { label: 'Credential management', href: '#' },
        { label: 'Revoking access', href: '#' },
      ],
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'How we handle your data and credentials.',
      links: [
        { label: 'How credentials are stored', href: '/security' },
        { label: 'Data handling practices', href: '/security' },
        { label: 'Revoking access', href: '/security' },
      ],
    },
    {
      icon: HelpCircle,
      title: 'Troubleshooting',
      description: 'Common issues and solutions.',
      links: [
        { label: 'Connection issues', href: '#' },
        { label: 'Tool authorization', href: '#' },
        { label: 'Getting support', href: '#' },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Documentation"
        description="Comprehensive guides for AERELION hosted automations. Learn how we configure, run, and maintain automations for you."
        keywords="documentation, guides, hosted automation, automation setup"
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-12">
          <div className="container-main max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Book className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-semibold text-foreground">
                Documentation
              </h1>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              Comprehensive guides for getting started with AERELION hosted automations. We handle the technical complexity—these guides help you connect your tools and understand how everything works.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {docSections.map((section) => (
                <div key={section.title} className="card-enterprise p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <section.icon className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-foreground">{section.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-sm text-primary hover:underline"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Help CTA */}
            <div className="text-center p-8 bg-muted/50 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">Need assistance?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our team is here to help you get started with your hosted automations.
              </p>
              <Button asChild variant="outline">
                <Link to="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default Documentation;
