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
      description: 'New to AERELION managed automations? Start here.',
      links: [
        { label: 'What is a managed automation?', href: '/how-it-works' },
        { label: 'How activation works', href: '/activation-walkthrough' },
        { label: 'What to expect', href: '/how-it-works' },
      ],
    },
    {
      icon: Settings,
      title: 'Connection & Access',
      description: 'How we connect to your tools securely.',
      links: [
        { label: 'What access we need from you', href: '/activation-walkthrough' },
        { label: 'How credentials are handled', href: '/security' },
        { label: 'Revoking access at any time', href: '/security' },
      ],
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'How AERELION protects your data and credentials.',
      links: [
        { label: 'Credential encryption', href: '/security' },
        { label: 'Data handling practices', href: '/security' },
        { label: 'Compliance considerations', href: '/security' },
      ],
    },
    {
      icon: HelpCircle,
      title: 'Support & Status',
      description: 'Tracking your automations and getting help.',
      links: [
        { label: 'Status tracking in your dashboard', href: '/dashboard' },
        { label: 'Contacting our team', href: '/contact' },
        { label: 'Common questions', href: '/how-it-works' },
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Documentation - AERELION Systems"
        description="Guidance for AERELION managed automations. Learn how we configure, operate, and maintain automations on your behalf."
        keywords="documentation, guides, managed automation, automation operator"
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
              Guidance for working with AERELION. We handle the technical complexity—these resources help you understand what to expect and how we operate on your behalf.
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
                        <Link
                          to={link.href}
                          className="text-sm text-primary hover:underline"
                        >
                          {link.label}
                        </Link>
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
                Our team is here to help you with your managed automations.
              </p>
              <Button asChild variant="outline">
                <Link to="/contact">Contact Us</Link>
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
