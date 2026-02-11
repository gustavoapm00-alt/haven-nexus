import { motion } from 'framer-motion';

const reports = [
  {
    refId: 'OPS-2026-004',
    title: 'CRM Follow-Up Automation for Legal Services',
    status: 'RESOLVED',
    impact: '8.2',
  },
  {
    refId: 'OPS-2026-003',
    title: 'Invoice Processing Pipeline — Accounting Firm',
    status: 'RESOLVED',
    impact: '7.5',
  },
  {
    refId: 'OPS-2026-002',
    title: 'Client Onboarding Workflow Standardization',
    status: 'RESOLVED',
    impact: '9.1',
  },
  {
    refId: 'OPS-2026-001',
    title: 'Document Intake & Classification System',
    status: 'ACTIVE',
    impact: '6.8',
  },
];

const BriefingArchives = () => {
  return (
    <section className="section-padding bg-[#0F0F0F]">
      <div className="container-main">
        <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
          // OPERATIONAL REPORTS
        </span>
        <h2 className="font-mono text-2xl md:text-3xl font-semibold text-[#E0E0E0] mb-10">
          Technical Briefing Archives
        </h2>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/10 mb-0">
          <span className="col-span-2 font-mono text-[9px] text-white/20 uppercase tracking-wider">REF-ID</span>
          <span className="col-span-5 font-mono text-[9px] text-white/20 uppercase tracking-wider">TITLE</span>
          <span className="col-span-2 font-mono text-[9px] text-white/20 uppercase tracking-wider">STATUS</span>
          <span className="col-span-3 font-mono text-[9px] text-white/20 uppercase tracking-wider">IMPACT-SCORE</span>
        </div>

        <div className="space-y-0">
          {reports.map((report, i) => (
            <motion.div
              key={report.refId}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-4 border border-white/5 hover:border-[rgba(57,255,20,0.3)] transition-colors cursor-default group"
            >
              <span className="md:col-span-2 font-mono text-xs text-[#39FF14]/50 tracking-wider">
                [{report.refId}]
              </span>
              <span className="md:col-span-5 font-sans text-sm text-white/60 group-hover:text-white/80 transition-colors">
                {report.title}
              </span>
              <span className="md:col-span-2">
                <span className={`font-mono text-[10px] tracking-wider ${
                  report.status === 'RESOLVED' ? 'text-[#39FF14]/50' : 'text-[#FFBF00]/50'
                }`}>
                  {report.status}
                </span>
              </span>
              <span className="md:col-span-3 font-mono text-xs text-white/30">
                IMPACT: {report.impact}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BriefingArchives;
