import { Shield, Lock, Eye, Users, Database } from 'lucide-react';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO from '@/components/SEO';

const SecurityPractices = () => {
  const practices = [
    {
      icon: Lock,
      title: 'Customer-Controlled Execution',
      description: 'All automation agents execute entirely within the customer\'s own automation environment. AERELION does not run workflows on behalf of customers or access customer systems remotely.',
    },
    {
      icon: Database,
      title: 'No Centralized Data Ingestion',
      description: 'AERELION does not store, process, or retain operational data that flows through deployed agents. Data remains within the customer\'s infrastructure at all times.',
    },
    {
      icon: Eye,
      title: 'Workflow Transparency',
      description: 'Every agent is delivered as a complete, inspectable workflow file. Customers have full visibility into the logic, data handling, and system connections before and after deployment.',
    },
    {
      icon: Users,
      title: 'Access Control',
      description: 'Agent publishing and library management is restricted to authorized administrators. Public access is limited to viewing published agents and completing purchases.',
    },
    {
      icon: Shield,
      title: 'Data Minimization',
      description: 'AERELION collects only the minimum data required to process purchases and deliver products: email address, purchase record, and payment confirmation. No operational data is collected.',
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
                AERELION delivers pre-engineered automation workflows that customers deploy and operate independently. We do not access customer systems, process operational data, or maintain ongoing connections to deployed agents. Customers retain full control over their automation infrastructure.
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
