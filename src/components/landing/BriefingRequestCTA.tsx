import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const BriefingRequestCTA = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [criticality, setCriticality] = useState('MED');

  const buildContactUrl = () => {
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (email) params.set('email', email);
    if (subject) params.set('subject', subject);
    if (criticality) params.set('criticality', criticality);
    return `/contact?${params.toString()}`;
  };

  const criticalityConfig: Record<string, { label: string; activeClass: string }> = {
    LOW: { label: 'LOW', activeClass: 'text-[#39FF14] border-b-2 border-[#39FF14]/60' },
    MED: { label: 'MED', activeClass: 'text-[#FFBF00] border-b-2 border-[#FFBF00]/60' },
    HIGH: { label: 'HIGH', activeClass: 'text-[#ff4444] border-b-2 border-[#ff4444]/60' },
  };

  return (
    <section className="section-padding bg-[#040404] relative overflow-hidden">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFBF00]/15 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(255,191,0,0.02),transparent)]" />

      <div className="container-main max-w-2xl relative z-10">
        <span className="font-mono text-[10px] text-[#FFBF00]/50 uppercase tracking-[0.25em] mb-3 block">
          // GENESIS MISSION // REQUEST SCOPING
        </span>
        <h2 className="font-mono text-3xl md:text-4xl font-bold text-[#E0E0E0] mb-3 tracking-tight">
          Initiate Engagement
        </h2>
        <p className="font-sans text-sm text-white/30 mb-12 leading-relaxed">
          Genesis Mission program nodes begin with a scoping session. Declare your operational domain and transmit parameters below.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border border-white/[0.08] bg-white/[0.01] p-8 relative"
        >
          {/* Corner decorators */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#FFBF00]/30 -translate-x-px -translate-y-px" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#FFBF00]/30 translate-x-px -translate-y-px" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#FFBF00]/30 -translate-x-px translate-y-px" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#FFBF00]/30 translate-x-px translate-y-px" />

          <div className="space-y-7">
            {/* DESIGNATION */}
            <div>
              <label className="font-mono text-[9px] text-white/25 uppercase tracking-[0.2em] block mb-2.5">
                DESIGNATION
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="OPERATOR_NAME"
                className="w-full bg-transparent border-0 border-b border-white/10 px-0 py-2.5 font-mono text-sm text-[#E0E0E0] placeholder:text-white/10 focus:outline-none focus:border-[#39FF14] focus:shadow-[0_1px_0_0_rgba(57,255,20,0.4)] transition-all"
              />
            </div>

            {/* COMM_CHANNEL */}
            <div>
              <label className="font-mono text-[9px] text-white/25 uppercase tracking-[0.2em] block mb-2.5">
                COMM_CHANNEL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@organization.gov"
                className="w-full bg-transparent border-0 border-b border-white/10 px-0 py-2.5 font-mono text-sm text-[#E0E0E0] placeholder:text-white/10 focus:outline-none focus:border-[#39FF14] focus:shadow-[0_1px_0_0_rgba(57,255,20,0.4)] transition-all"
              />
            </div>

            {/* SUBJECT + CRITICALITY row */}
            <div className="grid sm:grid-cols-2 gap-7">
              <div>
                <label className="font-mono text-[9px] text-white/25 uppercase tracking-[0.2em] block mb-2.5">
                  SUBJECT
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#040404] border-0 border-b border-white/10 px-0 py-2.5 font-mono text-sm text-[#E0E0E0] focus:outline-none focus:border-[#39FF14] transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#040404]">SELECT_DOMAIN...</option>
                  <option value="prometheus" className="bg-[#040404]">Project Prometheus / Nuclear SMR</option>
                  <option value="grid" className="bg-[#040404]">Grid Intelligence / Energy Dominance</option>
                  <option value="autonomous-lab" className="bg-[#040404]">Autonomous Laboratory Ops</option>
                  <option value="data-digitization" className="bg-[#040404]">Historic Data Digitization / CUI</option>
                  <option value="governance-review" className="bg-[#040404]">Federated Governance Review</option>
                  <option value="consortium" className="bg-[#040404]">Genesis Mission Consortium</option>
                  <option value="other" className="bg-[#040404]">Other</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[9px] text-white/25 uppercase tracking-[0.2em] block mb-2.5">
                  SYSTEM_CRITICALITY
                </label>
                <div className="flex border-b border-white/10">
                  {Object.entries(criticalityConfig).map(([lvl, cfg]) => (
                    <button
                      key={lvl}
                      onClick={() => setCriticality(lvl)}
                      className={`flex-1 py-2.5 font-mono text-[10px] tracking-[0.2em] transition-all ${
                        criticality === lvl ? cfg.activeClass : 'text-white/20 hover:text-white/40'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to={buildContactUrl()}
                className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#39FF14] text-black font-mono text-xs tracking-[0.18em] font-medium transition-all duration-200 hover:bg-[#4dff2e] hover:shadow-[0_0_30px_rgba(57,255,20,0.25)]"
              >
                <Send className="w-3.5 h-3.5" />
                TRANSMIT REQUEST
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BriefingRequestCTA;
