export default function RegulatorDiagram() {
  return (
    <section>
      <h2
        className="text-[10px] tracking-[0.3em] mb-4"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14' }}
      >
        REGULATOR_INTERFACE // DATA_FLOW_SCHEMATIC
      </h2>

      <div
        className="relative overflow-hidden p-6"
        style={{
          border: '1px solid #333',
          borderRadius: 0,
          background: 'rgba(1,1,1,0.6)',
        }}
      >
        {/* 3-column flow diagram */}
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-0">
          {/* Column 1: RAW DATA */}
          <div className="text-center space-y-3">
            <p
              className="text-[9px] tracking-[0.3em]"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FF4444' }}
            >
              RAW_DATA // OPERATIONAL_CHAOS
            </p>
            <div className="space-y-2 mx-auto max-w-[180px]">
              {['FRAGMENTED_INPUTS', 'UNGOVERNED_TOOLS', 'SHADOW_IT_VECTORS', 'DRIFT_SIGNALS'].map(
                (label) => (
                  <div
                    key={label}
                    className="text-[8px] py-1.5 px-3"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#FF4444',
                      border: '1px solid rgba(255,68,68,0.3)',
                      borderRadius: 0,
                      background: 'rgba(255,68,68,0.04)',
                    }}
                  >
                    {label}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="flex flex-col items-center px-4">
            <div
              className="w-16 h-px"
              style={{ background: 'linear-gradient(90deg, #FF4444, #39FF14)' }}
            />
            <span
              className="text-[7px] mt-1"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#555' }}
            >
              INGEST
            </span>
          </div>

          {/* Column 2: AERELION LAYER (REGULATOR) */}
          <div className="text-center space-y-3">
            <p
              className="text-[9px] tracking-[0.3em]"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14' }}
            >
              AERELION_LAYER // REGULATOR_GATE
            </p>
            <div
              className="mx-auto max-w-[200px] py-4 px-3 space-y-2"
              style={{
                border: '1px solid #39FF14',
                borderRadius: 0,
                background: 'rgba(57,255,20,0.03)',
                boxShadow: '0 0 20px rgba(57,255,20,0.08)',
              }}
            >
              {['LOGIC_HARDENING', 'DATA_ONTOLOGY', 'GOVERNANCE_PROTOCOLS'].map(
                (label) => (
                  <div
                    key={label}
                    className="text-[8px] py-1.5 px-3"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#39FF14',
                      border: '1px solid rgba(57,255,20,0.3)',
                      borderRadius: 0,
                    }}
                  >
                    {label}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="flex flex-col items-center px-4">
            <div
              className="w-16 h-px"
              style={{ background: 'linear-gradient(90deg, #39FF14, #FFBF00)' }}
            />
            <span
              className="text-[7px] mt-1"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#555' }}
            >
              STABILIZE
            </span>
          </div>

          {/* Column 3: EXECUTIVE OVERSIGHT */}
          <div className="text-center space-y-3">
            <p
              className="text-[9px] tracking-[0.3em]"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FFBF00' }}
            >
              EXECUTIVE_OVERSIGHT // STABILIZED
            </p>
            <div className="space-y-2 mx-auto max-w-[180px]">
              {['GOVERNED_OUTPUTS', 'AUDIT_READINESS', 'CMMC_COMPLIANCE', 'ZERO_DRIFT'].map(
                (label) => (
                  <div
                    key={label}
                    className="text-[8px] py-1.5 px-3"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#FFBF00',
                      border: '1px solid rgba(255,191,0,0.3)',
                      borderRadius: 0,
                      background: 'rgba(255,191,0,0.04)',
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
