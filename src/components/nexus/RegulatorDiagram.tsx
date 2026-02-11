export default function RegulatorDiagram() {
  return (
    <section>
      <h2
        className="text-[9px] tracking-[0.3em] mb-3 uppercase"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.6 }}
      >
        REGULATOR_INTERFACE // DATA_FLOW_SCHEMATIC
      </h2>

      <div
        className="relative overflow-hidden p-5"
        style={{
          border: '1px solid #1a1a1a',
          borderRadius: 0,
          background: 'rgba(0,0,0,0.4)',
        }}
      >
        {/* Data pulse animation keyframes */}
        <style>{`
          @keyframes dataPulseLeft {
            0% { left: 0; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { left: calc(100% - 2px); opacity: 0; }
          }
          @keyframes dataPulseRight {
            0% { left: 0; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { left: calc(100% - 2px); opacity: 0; }
          }
        `}</style>

        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-0">
          {/* Column 1: RAW DATA */}
          <div className="text-center space-y-2">
            <p
              className="text-[8px] tracking-[0.3em] uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FF4444', opacity: 0.8 }}
            >
              RAW_DATA // OPERATIONAL_CHAOS
            </p>
            <div className="space-y-px mx-auto max-w-[160px]">
              {['FRAGMENTED_INPUTS', 'UNGOVERNED_TOOLS', 'SHADOW_IT_VECTORS', 'DRIFT_SIGNALS'].map(
                (label) => (
                  <div
                    key={label}
                    className="text-[7px] py-1 px-2 uppercase"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#FF4444',
                      border: '1px solid rgba(255,68,68,0.15)',
                      borderRadius: 0,
                      opacity: 0.7,
                    }}
                  >
                    {label}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Arrow 1 with data pulse */}
          <div className="flex flex-col items-center px-3">
            <div className="relative w-14" style={{ height: '0.5px', background: 'linear-gradient(90deg, #FF4444, #39FF14)' }}>
              <div
                className="absolute top-[-1px]"
                style={{
                  width: 2,
                  height: 2,
                  background: '#39FF14',
                  borderRadius: '50%',
                  boxShadow: '0 0 4px #39FF14',
                  animation: 'dataPulseLeft 3s linear infinite',
                }}
              />
            </div>
            <span
              className="text-[6px] mt-1 uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#333' }}
            >
              INGEST
            </span>
          </div>

          {/* Column 2: AERELION LAYER */}
          <div className="text-center space-y-2">
            <p
              className="text-[8px] tracking-[0.3em] uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.8 }}
            >
              AERELION_LAYER // REGULATOR_GATE
            </p>
            <div
              className="mx-auto max-w-[180px] py-3 px-2 space-y-px"
              style={{
                border: '1px solid rgba(57,255,20,0.25)',
                borderRadius: 0,
                background: 'rgba(57,255,20,0.015)',
                boxShadow: '0 0 15px rgba(57,255,20,0.04)',
              }}
            >
              {['LOGIC_HARDENING', 'DATA_ONTOLOGY', 'GOVERNANCE_PROTOCOLS'].map(
                (label) => (
                  <div
                    key={label}
                    className="text-[7px] py-1 px-2 uppercase"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#39FF14',
                      border: '1px solid rgba(57,255,20,0.15)',
                      borderRadius: 0,
                      opacity: 0.8,
                    }}
                  >
                    {label}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Arrow 2 with data pulse */}
          <div className="flex flex-col items-center px-3">
            <div className="relative w-14" style={{ height: '0.5px', background: 'linear-gradient(90deg, #39FF14, #FFBF00)' }}>
              <div
                className="absolute top-[-1px]"
                style={{
                  width: 2,
                  height: 2,
                  background: '#FFBF00',
                  borderRadius: '50%',
                  boxShadow: '0 0 4px #FFBF00',
                  animation: 'dataPulseRight 3s linear infinite 1.5s',
                }}
              />
            </div>
            <span
              className="text-[6px] mt-1 uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#333' }}
            >
              STABILIZE
            </span>
          </div>

          {/* Column 3: EXECUTIVE OVERSIGHT */}
          <div className="text-center space-y-2">
            <p
              className="text-[8px] tracking-[0.3em] uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FFBF00', opacity: 0.8 }}
            >
              EXECUTIVE_OVERSIGHT // STABILIZED
            </p>
            <div className="space-y-px mx-auto max-w-[160px]">
              {['GOVERNED_OUTPUTS', 'AUDIT_READINESS', 'CMMC_COMPLIANCE', 'ZERO_DRIFT'].map(
                (label) => (
                  <div
                    key={label}
                    className="text-[7px] py-1 px-2 uppercase"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#FFBF00',
                      border: '1px solid rgba(255,191,0,0.15)',
                      borderRadius: 0,
                      opacity: 0.7,
                    }}
                  >
                    {label}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
