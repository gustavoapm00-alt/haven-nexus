import { motion } from 'framer-motion';
import type { AgentState } from '@/hooks/useAgentStatus';

const MONO = 'JetBrains Mono, monospace';

/** AG-01 Sentinel — Security Scan Gauge */
export function SentinelGauge({ state }: { state?: AgentState }) {
  // Derive scan % from metadata or default to 100 when NOMINAL
  const scanPercent = state?.metadata?.scan_percent
    ? Number(state.metadata.scan_percent)
    : state?.status === 'NOMINAL' ? 100 : state?.status === 'PROCESSING' ? 42 : 0;

  const barColor = scanPercent >= 80 ? '#39FF14' : scanPercent >= 40 ? '#FFBF00' : '#FF4444';

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[7px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#555' }}>
          SECURITY_SCAN
        </span>
        <span className="text-[7px]" style={{ fontFamily: MONO, color: barColor }}>
          {scanPercent}%
        </span>
      </div>
      <div className="h-[3px] w-full" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
        <motion.div
          className="h-full"
          style={{ background: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${scanPercent}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/** AG-05 Auditor — Last Commit readout */
export function AuditorLastCommit({ state }: { state?: AgentState }) {
  const commit = state?.metadata?.last_commit
    ? String(state.metadata.last_commit)
    : state?.message || 'NO_COMMIT_DATA';

  return (
    <div className="mt-2">
      <span className="text-[7px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#555' }}>
        LAST_COMMIT
      </span>
      <code
        className="block text-[8px] px-2 py-1 mt-0.5 truncate"
        style={{
          fontFamily: MONO,
          color: '#39FF14',
          background: 'rgba(57,255,20,0.03)',
          border: '1px solid rgba(57,255,20,0.08)',
          borderRadius: 0,
          maxWidth: '100%',
        }}
      >
        {commit.slice(0, 40)}
      </code>
    </div>
  );
}

/** AG-07 Envoy — Generate Report button (UI only) */
export function EnvoyReportButton() {
  return (
    <div className="mt-2">
      <button
        className="w-full text-[8px] tracking-[0.2em] py-1.5 uppercase transition-all"
        style={{
          fontFamily: MONO,
          color: '#FFBF00',
          background: 'transparent',
          border: '1px solid rgba(255,191,0,0.3)',
          borderRadius: 0,
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(255,191,0,0.25), inset 0 0 12px rgba(255,191,0,0.08)';
          (e.target as HTMLButtonElement).style.background = 'rgba(255,191,0,0.05)';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.boxShadow = 'none';
          (e.target as HTMLButtonElement).style.background = 'transparent';
        }}
        onClick={() => {
          // UI-only placeholder — future AAR integration
        }}
      >
        [GENERATE_AAR_REPORT]
      </button>
    </div>
  );
}
