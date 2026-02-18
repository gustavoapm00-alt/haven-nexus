import { motion } from 'framer-motion';

const reports = [
  {
    refId: 'OPS-2026-004',
    title: 'CRM Follow-Up Protocol — Legal Services Substrate',
    status: 'RESOLVED',
    impact: '8.2',
    sector: 'LEGAL OPS',
  },
  {
    refId: 'OPS-2026-003',
    title: 'Invoice Processing Pipeline — Accounting Firm Governance',
    status: 'RESOLVED',
    impact: '7.5',
    sector: 'FINANCE',
  },
  {
    refId: 'OPS-2026-002',
    title: 'Client Onboarding Workflow — Schema Standardization',
    status: 'RESOLVED',
    impact: '9.1',
    sector: 'OPERATIONS',
  },
  {
    refId: 'OPS-2026-001',
    title: 'Document Intake & Classification System — ACTIVE NODE',
    status: 'ACTIVE',
    impact: '6.8',
    sector: 'COMPLIANCE',
  },
];

const BriefingArchives = () => {
  return (
    <section className="section-padding bg-[#060606] relative overflow-hidden">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="container-main">
        <div className="flex items-end justify-between mb-14">
          <div>
            <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
              // OPERATIONAL REPORTS
            </span>
            <h2 className="font-mono text-3xl md:text-4xl font-bold text-[#E0E0E0] tracking-tight">
              Technical Briefing Archives
            </h2>
          </div>
          <span className="hidden md:block font-mono text-[9px] text-white/15 tracking-[0.2em]">
            [RECORDS: {reports.length} // ACCESS: CLEARED]
          </span>
        </div>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2.5 border-b border-white/[0.08] mb-0">
          {[
            { label: 'REF-ID', cols: 'col-span-2' },
            { label: 'ENGAGEMENT_TITLE', cols: 'col-span-4' },
            { label: 'SECTOR', cols: 'col-span-2' },
            { label: 'AUTHORIZATION', cols: 'col-span-2' },
            { label: 'SYSTEM_IMPACT', cols: 'col-span-2' },
          ].map((h) => (
            <span key={h.label} className={`${h.cols} font-mono text-[9px] text-white/15 uppercase tracking-[0.2em]`}>
              {h.label}
            </span>
          ))}
        </div>

        <div>
          {reports.map((report, i) => (
            <motion.div
              key={report.refId}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-5 border-b border-white/[0.04] hover:bg-[#39FF14]/[0.015] hover:border-[rgba(57,255,20,0.2)] transition-all duration-200 cursor-default group"
            >
              <span className="md:col-span-2 font-mono text-[10px] text-[#39FF14]/50 tracking-wider">
                [{report.refId}]
              </span>
              <span className="md:col-span-4 font-sans text-sm text-white/50 group-hover:text-white/75 transition-colors leading-tight">
                {report.title}
              </span>
              <span className="md:col-span-2 font-mono text-[9px] text-[#FFBF00]/35 tracking-[0.15em]">
                {report.sector}
              </span>
              <span className="md:col-span-2">
                <span className={`font-mono text-[9px] tracking-wider px-2 py-0.5 border ${
                  report.status === 'RESOLVED'
                    ? 'text-[#39FF14]/60 border-[#39FF14]/20 bg-[#39FF14]/[0.04]'
                    : 'text-[#FFBF00]/60 border-[#FFBF00]/20 bg-[#FFBF00]/[0.04]'
                }`}>
                  {report.status}
                </span>
              </span>
              <div className="md:col-span-2 flex items-center gap-2">
                <div className="flex-1 h-px bg-white/10 relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-[#39FF14]/40"
                    style={{ width: `${(parseFloat(report.impact) / 10) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-white/30 shrink-0">
                  {report.impact}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BriefingArchives;
