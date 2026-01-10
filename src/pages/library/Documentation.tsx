import { Book, FileText, Download, Settings, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import { SEO } from '@/components/SEO';

const Documentation = () => {
  const docSections = [
    {
      icon: Download,
      title: 'Getting Started',
      description: 'New to AERELION agents? Start here.',
      links: [
        { label: 'What is an automation agent?', href: '#' },
        { label: 'System requirements', href: '#' },
        { label: 'Your first deployment', href: '#' },
      ],
    },
    {
      icon: Settings,
      title: 'Deployment Guides',
      description: 'Step-by-step deployment instructions.',
      links: [
        { label: 'n8n setup and configuration', href: '#' },
        { label: 'Importing workflow files', href: '#' },
        { label: 'Credential configuration', href: '#' },
      ],
    },
    {
      icon: FileText,
      title: 'Integration References',
      description: 'System-specific configuration guides.',
      links: [
        { label: 'Google Workspace integration', href: '#' },
        { label: 'Slack setup', href: '#' },
        { label: 'Stripe webhooks', href: '#' },
      ],
    },
    {
      icon: HelpCircle,
      title: 'Troubleshooting',
      description: 'Common issues and solutions.',
      links: [
        { label: 'Connection failures', href: '#' },
        { label: 'Trigger not firing', href: '#' },
        { label: 'Error handling', href: '#' },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Documentation"
        description="Comprehensive guides for deploying and configuring AERELION automation agents."
        keywords={['documentation', 'guides', 'n8n', 'automation setup', 'deployment guide']}
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
              Comprehensive guides for deploying and configuring automation agents. Each agent purchase includes specific documentation, but these general guides cover common setup tasks.
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
              <h3 className="font-semibold text-foreground mb-2">Need hands-on help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our installation assistance service can help you deploy and configure agents.
              </p>
              <Button asChild variant="outline">
                <Link to="/install">View Installation Options</Link>
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
