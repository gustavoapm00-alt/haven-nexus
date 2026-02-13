import { Shield, Lock, Eye, Users, Database } from 'lucide-react';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import SEO, { schemas } from '@/components/SEO';

const SecurityPractices = () => {
  const practices = [
    {
      icon: Lock,
      title: 'Data Transmission (TLS 1.3)',
      description: 'All data is transmitted via TLS 1.3. AERELION enforces HTTPS-only connections. No data is ever sent in plaintext over the wire.',
    },
    {
      icon: Database,
      title: 'Credential Vaulting (AES-256-GCM)',
      description: 'Sensitive credentials are isolated from application logic. Upon receipt, they are encrypted using AES-256-GCM via isolated Edge Functions before storage. Plaintext secrets never exist in the database.',
    },
    {
      icon: Shield,
      title: 'Zero-Trust Access (RLS + THS)',
      description: 'Row Level Security and Behavioral Biometrics (The Human Signature) ensure valid credentials cannot be used by automated bots or unauthorized actors.',
    },
    {
      icon: Eye,
      title: 'Revocability (<60 Seconds)',
      description: 'Client access is managed via a central identity provider. Revoke access tokens globally in under 60 seconds, instantly severing connections to the infrastructure.',
    },
    {
      icon: Users,
      title: 'Data Minimization & Accountability',
      description: 'AERELION collects only the minimum data required to operate your automations. Logs are regularly purged. We never sell, share, or monetize customer data.',
    },
  ];

  const securityStructuredData = [
    schemas.webPage(
      "Security & Data Practices",
      "AERELION's security practices for hosted automation",
      "/security-practices"
    ),
    schemas.breadcrumb([
      { name: 'Home', url: '/' },
      { name: 'Security Practices', url: '/security-practices' }
    ])
  ];

  return (
    <>
      <SEO
        title="Security & Data Practices – Customer-Controlled Automation | AERELION"
        description="Learn about AERELION's security practices: hosted infrastructure, encrypted credentials, minimal data retention, and full customer control over connected accounts."
        keywords="automation security, data practices, hosted infrastructure, credential encryption, data minimization, customer control, access revocation"
        canonicalUrl="/security-practices"
        structuredData={securityStructuredData}
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
              All data transmitted via TLS 1.3. Credentials encrypted at rest with AES-256-GCM. Access governed by Zero-Trust identity layers. Revocable in under 60 seconds.
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
              <h3 className="font-semibold text-foreground mb-3">Security Architecture Summary</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All data is transmitted via TLS 1.3 (HTTPS-only). Credentials are encrypted at rest using AES-256-GCM via isolated Edge Functions. Access is enforced by Row Level Security and behavioral biometrics (The Human Signature). Revoke any connection globally in under 60 seconds. For full governance protocols, visit our <a href="/security" className="text-primary hover:underline">Security & Governance Practices</a> page.
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
