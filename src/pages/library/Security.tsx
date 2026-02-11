import { Shield, Lock, Eye, RefreshCw, Database, Mail, Key, Server, Users } from 'lucide-react';
import SEO, { schemas } from '@/components/SEO';

const Security = () => {
  const practices = [
    { icon: Server, id: 'SEC-001', title: 'Infrastructure Isolation', description: 'All automations run on AERELION-managed infrastructure. Your systems are never exposed to third-party runtimes or shared environments.' },
    { icon: Lock, id: 'SEC-002', title: 'Credential Encryption at Rest', description: 'All credentials are encrypted using industry-standard encryption. Access tokens and authorization keys are never stored in plain text.' },
    { icon: Key, id: 'SEC-003', title: 'Least-Privilege Access Protocol', description: 'We request only the minimum permissions required to operate your automations. No excess access is ever requested.' },
    { icon: RefreshCw, id: 'SEC-004', title: 'Revocable Authorization', description: 'You maintain full control. Revoke access at any time through your tool settings or by contacting us directly.' },
    { icon: Database, id: 'SEC-005', title: 'Data Retention Policy', description: 'Operational data retained only as long as necessary. Logs and temporary data are regularly purged per retention policy.' },
    { icon: Eye, id: 'SEC-006', title: 'Zero Data Monetization', description: 'Your data is yours. We do not sell, share, or monetize customer data under any circumstances.' },
    { icon: Users, id: 'SEC-007', title: 'Accountable Operators', description: 'Every automation is managed by trained operators who follow documented procedures with full execution accountability.' },
    { icon: Shield, id: 'SEC-008', title: 'Full Ownership Guarantee', description: 'You retain full ownership of your accounts, tools, and operational outcomes. We operate on your behalf—nothing more.' },
  ];

  const securityStructuredData = [
    schemas.webPage("Security & Governance Practices", "How AERELION protects your credentials and data", "/security"),
    schemas.breadcrumb([{ name: 'Home', url: '/' }, { name: 'Governance', url: '/security' }])
  ];

  return (
    <>
      <SEO
        title="Governance & Security Practices – AERELION Systems"
        description="AERELION operates automations on secure, encrypted infrastructure. Least-privilege credential access, data encryption, full customer control."
        canonicalUrl="/security"
        structuredData={securityStructuredData}
      />

      <div className="min-h-screen bg-[#0F0F0F] watermark-confidential scanline-overlay">
        <section className="section-padding !pt-12 relative z-10">
          <div className="container-main max-w-3xl">
            <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
              // GOVERNANCE PROTOCOLS
            </span>
            <h1 className="font-mono text-3xl font-semibold text-[#E0E0E0] mb-3">
              Security & Governance Practices
            </h1>
            <p className="font-sans text-base text-white/40 leading-relaxed mb-4">
              AERELION Systems is a managed infrastructure operator. We configure, stabilize, and maintain
              operational protocols on governed infrastructure.
            </p>
            <p className="font-sans text-base text-white/40 leading-relaxed mb-12">
              Because we operate systems under authorization, the integrity of credential handling
              and data governance is foundational to the operational doctrine.
            </p>

            <div className="space-y-6">
              {practices.map((practice) => (
                <div key={practice.id} className="flex gap-4 py-4 border-b border-white/5 group">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 border border-[rgba(57,255,20,0.2)] flex items-center justify-center">
                      <practice.icon className="w-5 h-5 text-[#39FF14]/50" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-[9px] text-[#39FF14]/30 tracking-wider">[{practice.id}]</span>
                      <h2 className="font-mono text-sm font-semibold text-[#E0E0E0]">{practice.title}</h2>
                    </div>
                    <p className="font-sans text-sm text-white/35 leading-relaxed">{practice.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Credential Handling — Amber border */}
            <div className="mt-12 p-5 border border-[rgba(255,191,0,0.3)] bg-[rgba(255,191,0,0.02)]">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[9px] text-[#FFBF00]/50 tracking-wider">[ALERT: HIGH-SENSITIVITY]</span>
              </div>
              <h3 className="font-mono text-sm font-semibold text-[#E0E0E0] mb-2">How We Handle Your Credentials</h3>
              <p className="font-sans text-sm text-white/35 leading-relaxed mb-3">
                During activation, you provide access to the tools we'll operate on your behalf.
                We accept OAuth connections, workspace invites, or secure authorization links—never
                raw passwords or plaintext secrets.
              </p>
              <p className="font-sans text-sm text-white/35 leading-relaxed">
                All credentials are encrypted immediately upon receipt and stored in isolated,
                access-controlled environments. Only authorized operators access your systems.
              </p>
            </div>

            {/* After Engagement */}
            <div className="mt-6 p-5 border border-white/10">
              <h3 className="font-mono text-sm font-semibold text-[#E0E0E0] mb-2">After Your Engagement</h3>
              <p className="font-sans text-sm text-white/35 leading-relaxed">
                Once your 30-day engagement completes, you can choose ongoing monitoring and
                maintenance—or revoke our access entirely. You control the relationship.
              </p>
            </div>

            {/* Contact */}
            <div className="mt-6 p-5 border border-white/10">
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-[#39FF14]/40 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-mono text-sm font-semibold text-[#E0E0E0] mb-1">Governance Inquiries</h3>
                  <p className="font-sans text-sm text-white/35 mb-2">
                    For questions regarding credential handling protocols or data governance practices.
                  </p>
                  <a href="/contact" className="font-mono text-xs text-[#39FF14]/60 hover:text-[#39FF14] transition-colors uppercase tracking-wider">
                    Request briefing →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Security;
