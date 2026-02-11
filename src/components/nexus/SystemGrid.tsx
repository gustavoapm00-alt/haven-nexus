const AGENTS = [
  { id: 'AG-01', codename: 'THE SENTINEL', fn: 'CUI Handoff & NIST/CMMC Scanning', refId: 'REF-SENTINEL-800171', impact: 'NIST_800-171_COMPLIANCE' },
  { id: 'AG-02', codename: 'THE LIBRARIAN', fn: 'Universal Data Ontology & Schema Mapping', refId: 'REF-LIBRARIAN-ONTO', impact: 'DATA_NORMALIZATION' },
  { id: 'AG-03', codename: 'THE WATCHMAN', fn: 'COOP & Drift Detection Resilience', refId: 'REF-WATCHMAN-COOP', impact: 'CONTINUITY_ASSURANCE' },
  { id: 'AG-04', codename: 'THE GATEKEEPER', fn: 'PoLP Access Governance & Security', refId: 'REF-GATEKEEPER-POLP', impact: 'ACCESS_CONTROL' },
  { id: 'AG-05', codename: 'THE AUDITOR', fn: 'Threat Surface Reduction (Anti-Shadow IT)', refId: 'REF-AUDITOR-TSR', impact: 'THREAT_MITIGATION' },
  { id: 'AG-06', codename: 'THE CHRONICLER', fn: 'Real-Time System Status Ticker', refId: 'REF-CHRONICLER-SYS', impact: 'OBSERVABILITY' },
  { id: 'AG-07', codename: 'THE ENVOY', fn: 'Executive Briefing AI (After-Action Reports)', refId: 'REF-ENVOY-AAR', impact: 'EXECUTIVE_OVERSIGHT' },
];

export default function SystemGrid() {
  return (
    <section>
      <h2
        className="text-[9px] tracking-[0.3em] mb-4 uppercase"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.6 }}
      >
        ELITE_7 // AGENT_GRID
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1px]">
        {AGENTS.map((a) => (
          <div
            key={a.id}
            className="group relative p-3 transition-colors"
            style={{
              background: '#050505',
              border: '1px solid #1a1a1a',
              borderRadius: 0,
            }}
          >
            {/* Pulse indicator — attenuated 40% */}
            <span className="absolute top-3 right-3 flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full opacity-40"
                style={{ background: '#39FF14', borderRadius: '50%' }}
              />
              <span
                className="relative inline-flex h-2 w-2"
                style={{ background: '#39FF14', borderRadius: '50%', boxShadow: '0 0 10px #39FF1433' }}
              />
            </span>

            {/* Protocol ID */}
            <p
              className="text-[8px] tracking-[0.25em] mb-0.5 uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.4 }}
            >
              {a.id}
            </p>

            {/* Codename */}
            <h3
              className="text-xs tracking-wide mb-1 uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FFFFFF', fontWeight: 500 }}
            >
              {a.codename}
            </h3>

            {/* Function */}
            <p
              className="text-[10px] leading-relaxed mb-3"
              style={{ color: '#666', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {a.fn}
            </p>

            {/* Metadata — flush left */}
            <div className="space-y-px mb-3">
              <code
                className="block text-[8px] px-2 py-0.5"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#39FF14',
                  background: 'rgba(57,255,20,0.03)',
                  border: '1px solid rgba(57,255,20,0.1)',
                  borderRadius: 0,
                }}
              >
                [REF-ID] {a.refId}
              </code>
              <code
                className="block text-[8px] px-2 py-0.5"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#FFBF00',
                  background: 'rgba(255,191,0,0.03)',
                  border: '1px solid rgba(255,191,0,0.1)',
                  borderRadius: 0,
                }}
              >
                [SYSTEM_IMPACT] {a.impact}
              </code>
            </div>

            {/* Action — visible only on hover */}
            <div
              className="transition-opacity duration-200 opacity-0 group-hover:opacity-100"
            >
              <button
                className="w-full text-[8px] tracking-[0.2em] py-1.5 uppercase transition-all"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#39FF14',
                  background: 'transparent',
                  border: '1px solid #39FF14',
                  borderRadius: 0,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.boxShadow = '0 0 15px rgba(57,255,20,0.4), inset 0 0 15px rgba(57,255,20,0.1)';
                  (e.target as HTMLButtonElement).style.background = 'rgba(57,255,20,0.06)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.boxShadow = 'none';
                  (e.target as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                [FORCE_STABILIZATION]
              </button>
            </div>
            {/* Inactive wireframe placeholder when button hidden */}
            <div
              className="transition-opacity duration-200 opacity-100 group-hover:opacity-0 absolute bottom-3 left-3 right-3"
            >
              <div
                className="w-full py-1.5"
                style={{ border: '1px solid #111', borderRadius: 0 }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
