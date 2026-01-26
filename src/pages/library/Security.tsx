import { Shield, Lock, Eye, RefreshCw, Database, Mail } from 'lucide-react';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO from '@/components/SEO';

const Security = () => {
  const practices = [
    {
      icon: Lock,
      title: 'Credentials Encrypted at Rest',
      description: 'All credentials you provide are encrypted using industry-standard encryption before storage. Your API keys and access tokens are never stored in plain text.',
    },
    {
      icon: Shield,
      title: 'Least-Privilege Access',
      description: 'We request only the minimum permissions required to operate your automations. We never ask for more access than necessary.',
    },
    {
      icon: RefreshCw,
      title: 'You Can Revoke Access Anytime',
      description: 'You maintain control over your connected accounts. Revoke access at any time through your tool\'s security settings or by contacting us.',
    },
    {
      icon: Database,
      title: 'Data Retained Only as Needed',
      description: 'We retain operational data only as long as necessary to run your automations. Logs and temporary data are regularly purged.',
    },
    {
      icon: Eye,
      title: 'We Never Sell Customer Data',
      description: 'Your data is yours. We do not sell, share, or monetize customer data in any way. Period.',
    },
  ];

  return (
    <>
      <SEO
        title="Security & Data Practices"
        description="Learn how AERELION protects your credentials and data. We use encryption, least-privilege access, and give you full control."
        keywords="security, data practices, encryption, privacy, credentials, access control"
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-12">
          <div className="container-main max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-semibold text-foreground">
                Security & Data Practices
              </h1>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              AERELION Systems hosts and maintains automations on your behalf. We take the security of your credentials and data seriously. Here's how we protect what matters.
            </p>

            <div className="space-y-10">
              {practices.map((practice) => (
                <div key={practice.title} className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <practice.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      {practice.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {practice.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-16 p-6 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Questions or Concerns?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                    If you have any questions about our security practices or need to report a concern, please contact us.
                  </p>
                  <a 
                    href="mailto:contact@aerelion.systems" 
                    className="text-primary hover:underline font-medium"
                  >
                    contact@aerelion.systems
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default Security;
