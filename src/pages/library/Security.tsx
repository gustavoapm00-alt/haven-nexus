import { Shield, Lock, Eye, RefreshCw, Database, Mail, Key, Server, Users } from 'lucide-react';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO from '@/components/SEO';

const Security = () => {
  const practices = [
    {
      icon: Server,
      title: 'We Operate on Our Infrastructure',
      description: 'All automations run on AERELION-managed infrastructure. Your systems are never exposed to third-party runtimes or shared environments.',
    },
    {
      icon: Lock,
      title: 'Credentials Encrypted at Rest',
      description: 'All credentials you provide are encrypted using industry-standard encryption. Access tokens and authorization keys are never stored in plain text.',
    },
    {
      icon: Key,
      title: 'Least-Privilege Access',
      description: 'We request only the minimum permissions required to operate your automations. We never ask for more access than necessary to deliver your outcome.',
    },
    {
      icon: RefreshCw,
      title: 'Revocable Anytime',
      description: 'You maintain full control. Revoke our access at any time through your tool settings or by contacting us directly. We disconnect immediately upon request.',
    },
    {
      icon: Database,
      title: 'Data Retained Only as Needed',
      description: 'We retain operational data only as long as necessary to run your automations. Logs and temporary data are regularly purged according to our retention policy.',
    },
    {
      icon: Eye,
      title: 'We Never Sell Data',
      description: 'Your data is yours. We process data only to deliver agreed services. We do not sell, share, or monetize customer data under any circumstances.',
    },
    {
      icon: Users,
      title: 'Accountable Operators',
      description: 'Every automation is managed by trained operators who follow documented procedures. We take responsibility for execution quality and system reliability.',
    },
    {
      icon: Shield,
      title: 'You Own Everything',
      description: 'You retain full ownership of your accounts, tools, and operational outcomes. We operate on your behalf—nothing more.',
    },
  ];

  return (
    <>
      <SEO
        title="Security & Data Practices | AERELION Systems"
        description="AERELION operates automations on secure infrastructure with encrypted credentials, least-privilege access, and full customer control. We never sell your data."
        keywords="security, data practices, encryption, privacy, credentials, managed automation, compliance"
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
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              AERELION Systems is a managed automation operator. We configure, run, and maintain 
              automations on our own infrastructure so you don't have to.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              Because we operate systems on your behalf, we take the security of your credentials 
              and data seriously. Here's how we protect what matters.
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

            {/* How We Handle Credentials */}
            <div className="mt-12 p-5 bg-muted/30 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">How We Handle Your Credentials</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                During activation, you provide access to the tools we'll operate on your behalf. 
                We accept OAuth connections, workspace invites, or secure authorization links—never 
                raw passwords or plaintext secrets.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All credentials are encrypted immediately upon receipt and stored in isolated, 
                access-controlled environments. Only authorized operators access your systems, 
                and only when required for maintenance or monitoring.
              </p>
            </div>

            {/* After Engagement */}
            <div className="mt-6 p-5 bg-muted/30 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">After Your Engagement</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Once your 30-day engagement completes, you can choose ongoing monitoring and 
                maintenance—or revoke our access entirely. Either way, you control the relationship. 
                We only stay connected if you choose to continue.
              </p>
            </div>

            {/* Contact */}
            <div className="mt-6 p-5 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Security Questions?</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Have questions about our security practices or how we handle credentials?
                  </p>
                  <a 
                    href="/contact" 
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    Schedule a discovery call →
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
