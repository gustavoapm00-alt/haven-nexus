import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

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

  return (
    <section className="section-padding bg-[#0F0F0F]">
      <div className="container-main max-w-2xl">
        <span className="font-mono text-[10px] text-[#FFBF00]/50 uppercase tracking-[0.25em] mb-3 block">
          // REQUEST SCOPING
        </span>

        <div className="border border-white/10 p-6 md:p-8">
          <div className="space-y-5">
            {/* DESIGNATION */}
            <div>
              <label className="font-mono text-[10px] text-white/30 uppercase tracking-wider block mb-2">
                DESIGNATION
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-transparent border-0 border-b border-white/15 px-0 py-2 font-mono text-sm text-[#E0E0E0] placeholder:text-white/15 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
            </div>

            {/* COMM_CHANNEL */}
            <div>
              <label className="font-mono text-[10px] text-white/30 uppercase tracking-wider block mb-2">
                COMM_CHANNEL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-transparent border-0 border-b border-white/15 px-0 py-2 font-mono text-sm text-[#E0E0E0] placeholder:text-white/15 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
            </div>

            {/* SUBJECT + CRITICALITY row */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="font-mono text-[10px] text-white/30 uppercase tracking-wider block mb-2">
                  SUBJECT
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-white/15 px-0 py-2 font-mono text-sm text-[#E0E0E0] focus:outline-none focus:border-[#39FF14] transition-colors"
                >
                  <option value="" className="bg-[#0F0F0F]">Select...</option>
                  <option value="operational-briefing" className="bg-[#0F0F0F]">Operational Briefing</option>
                  <option value="governance-review" className="bg-[#0F0F0F]">Governance Review</option>
                  <option value="protocol-deployment" className="bg-[#0F0F0F]">Protocol Deployment</option>
                  <option value="other" className="bg-[#0F0F0F]">Other</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] text-white/30 uppercase tracking-wider block mb-2">
                  SYSTEM_CRITICALITY
                </label>
                <div className="flex gap-0 border-b border-white/15">
                  {['LOW', 'MED', 'HIGH'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setCriticality(lvl)}
                      className={`flex-1 py-2 font-mono text-[10px] tracking-wider transition-colors ${
                        criticality === lvl
                          ? lvl === 'HIGH' ? 'text-[#FFBF00] border-b border-[#FFBF00]' : 'text-[#39FF14] border-b border-[#39FF14]'
                          : 'text-white/20 hover:text-white/40'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to={buildContactUrl()}
                className="btn-launch-primary w-full justify-center gap-3 py-3"
              >
                TRANSMIT REQUEST
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BriefingRequestCTA;
