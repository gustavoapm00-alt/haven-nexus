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
        className="text-xs tracking-[0.3em] mb-6"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14' }}
      >
        ELITE_7 // AGENT_GRID
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {AGENTS.map((a) => (
          <div
            key={a.id}
            className="relative p-5 transition-colors"
            style={{
              background: '#0F0F0F',
              border: '1px solid #333333',
              borderRadius: 0,
            }}
          >
            {/* Pulse indicator */}
            <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
              <span
                className="animate-ping absolute inline-flex h-full w-full opacity-75"
                style={{ background: '#39FF14', borderRadius: '50%' }}
              />
              <span
                className="relative inline-flex h-2.5 w-2.5"
                style={{ background: '#39FF14', borderRadius: '50%', boxShadow: '0 0 6px #39FF14' }}
              />
            </span>

            {/* Protocol ID */}
            <p
              className="text-[10px] tracking-[0.25em] mb-1 opacity-60"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14' }}
            >
              {a.id}
            </p>

            {/* Codename */}
            <h3
              className="text-sm font-bold tracking-wide mb-2"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FFFFFF' }}
            >
              {a.codename}
            </h3>

            {/* Function */}
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#888888' }}>
              {a.fn}
            </p>

            {/* Metadata */}
            <div className="space-y-1 mb-4">
              <code
                className="block text-[10px] px-2 py-1"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#39FF14',
                  background: 'rgba(57,255,20,0.05)',
                  border: '1px solid rgba(57,255,20,0.15)',
                  borderRadius: 0,
                }}
              >
                [REF-ID] {a.refId}
              </code>
              <code
                className="block text-[10px] px-2 py-1"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#FFBF00',
                  background: 'rgba(255,191,0,0.05)',
                  border: '1px solid rgba(255,191,0,0.15)',
                  borderRadius: 0,
                }}
              >
                [SYSTEM_IMPACT] {a.impact}
              </code>
            </div>

            {/* Action */}
            <button
              className="w-full text-[10px] tracking-[0.2em] py-2 font-bold transition-all"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                color: '#39FF14',
                background: 'transparent',
                border: '1px solid #39FF14',
                borderRadius: 0,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.boxShadow = '0 0 15px rgba(57,255,20,0.4), inset 0 0 15px rgba(57,255,20,0.1)';
                (e.target as HTMLButtonElement).style.background = 'rgba(57,255,20,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.boxShadow = 'none';
                (e.target as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              [FORCE_STABILIZATION]
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
