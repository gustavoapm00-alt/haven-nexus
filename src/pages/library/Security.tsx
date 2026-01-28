import { Shield, Lock, Eye, RefreshCw, Database, Mail, Key } from 'lucide-react';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO from '@/components/SEO';

const Security = () => {
  const practices = [
    {
      icon: Lock,
      title: 'Credentials Encrypted at Rest',
      description: 'All credentials you provide are encrypted using industry-standard encryption. API keys and access tokens are never stored in plain text.',
    },
    {
      icon: Key,
      title: 'Least-Privilege Access',
      description: 'We request only the minimum permissions required to operate your workflows. We never ask for more access than necessary.',
    },
    {
      icon: RefreshCw,
      title: 'Revocable Anytime',
      description: 'You maintain full control. Revoke our access at any time through your tool settings or by contacting us directly.',
    },
    {
      icon: Database,
      title: 'Data Retained Only as Needed',
      description: 'We retain operational data only as long as necessary to run your workflows. Logs and temporary data are regularly purged.',
    },
    {
      icon: Eye,
      title: 'We Never Sell Data',
      description: 'Your data is yours. We process data only to deliver agreed services. We do not sell, share, or monetize customer data.',
    },
    {
      icon: Shield,
      title: 'You Own Everything',
      description: 'You retain full ownership of your accounts, tools, and configured workflows. We operate on your behalf—nothing more.',
    },
  ];

  return (
    <>
      <SEO
        title="Security & Data Practices"
        description="AERELION uses encryption, least-privilege access, and gives you full control over credentials. We never sell your data."
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
              AERELION Systems installs and operates workflows on your behalf. We take the security 
              of your credentials and data seriously. Here's how we protect what matters.
            </p>

            <div className="space-y-8">
              {practices.map((practice) => (
                <div key={practice.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <practice.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground mb-1">
                      {practice.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {practice.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Optional Monitoring */}
            <div className="mt-12 p-5 bg-muted/30 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">After Your Engagement</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Once your 30-day engagement completes, you can self-manage workflows or opt into 
                an ongoing monitoring retainer. Either way, you control access—we only stay connected 
                if you choose.
              </p>
            </div>

            {/* Contact */}
            <div className="mt-8 p-5 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Questions?</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Security concerns or questions about our practices? Contact us.
                  </p>
                  <a 
                    href="mailto:contact@aerelion.systems" 
                    className="text-primary hover:underline font-medium text-sm"
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
