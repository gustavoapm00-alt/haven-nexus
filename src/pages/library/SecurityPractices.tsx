import { Shield, Lock, Eye, Users, Database } from 'lucide-react';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO from '@/components/SEO';

const SecurityPractices = () => {
  const practices = [
    {
      icon: Lock,
      title: 'Hosted Infrastructure',
      description: 'All automations run on AERELION\'s secure infrastructure. You never need to manage servers, deployments, or technical configurations.',
    },
    {
      icon: Database,
      title: 'Minimal Data Retention',
      description: 'AERELION retains operational data only as long as necessary to run your automations. Logs and temporary data are regularly purged.',
    },
    {
      icon: Eye,
      title: 'Automation Transparency',
      description: 'You have full visibility into what your automation does. We provide clear documentation of triggers, actions, and data flows.',
    },
    {
      icon: Users,
      title: 'Access Control',
      description: 'Automation management is restricted to authorized administrators. You maintain control over connected accounts and can revoke access at any time.',
    },
    {
      icon: Shield,
      title: 'Data Minimization',
      description: 'AERELION collects only the minimum data required to operate your automations: connection credentials (encrypted) and operational logs. We never sell customer data.',
    },
  ];

  return (
    <>
      <SEO
        title="Security & Data Practices"
        description="Learn about AERELION's security practices, data handling, and commitment to customer-controlled execution."
        keywords="security, data practices, privacy, customer control, data protection"
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
              AERELION is committed to transparency in how we handle data and deliver automation products. Our practices are designed to keep customers in control.
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

            {/* Summary */}
            <div className="mt-16 p-6 bg-muted/50 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-3">Summary</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                AERELION operates hosted automations on our infrastructure. We securely store your credentials, run your automations, and maintain everything for you. You retain control over connected accounts and can revoke access at any time. For detailed security information, visit our <a href="/security" className="text-primary hover:underline">Security & Data Practices</a> page.
              </p>
            </div>
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default SecurityPractices;
