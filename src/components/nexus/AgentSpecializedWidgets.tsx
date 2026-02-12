import { motion } from 'framer-motion';
import type { AgentState } from '@/hooks/useAgentStatus';

const MONO = 'JetBrains Mono, monospace';

/** AG-01 Sentinel — Full Security Scan HUD */
export function SentinelGauge({ state }: { state?: AgentState }) {
  const meta = state?.metadata || {};
  const scanPercent = meta.scan_percent != null ? Number(meta.scan_percent) :
    state?.status === 'NOMINAL' ? 100 : state?.status === 'PROCESSING' ? 42 : 0;
  const sslValid = meta.ssl_valid === true;
  const httpStatus = meta.http_status ? Number(meta.http_status) : null;
  const responseTime = meta.response_time_ms ? Number(meta.response_time_ms) : null;
  const lastScanIso = meta.last_scan_iso ? String(meta.last_scan_iso) : null;
  const scanTarget = meta.scan_target ? String(meta.scan_target) : 'aerelion.systems';

  const barColor = scanPercent >= 80 ? '#39FF14' : scanPercent >= 40 ? '#FFBF00' : '#FF4444';
  const sslColor = sslValid ? '#39FF14' : '#FF4444';
  const statusColor = httpStatus === 200 ? '#39FF14' : httpStatus ? '#FFBF00' : '#333';

  const lastScanFormatted = lastScanIso
    ? new Date(lastScanIso).toISOString().replace('T', ' ').slice(0, 19)
    : 'AWAITING_SIGNAL';

  return (
    <div className="mt-2 space-y-1.5">
      {/* Scan progress bar */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[7px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#555' }}>
            SECURITY_SWEEP
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

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-px">
        {/* SSL */}
        <div className="px-1.5 py-1" style={{ background: 'rgba(57,255,20,0.02)', border: '1px solid #111' }}>
          <span className="block text-[6px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#444' }}>
            SSL_CERT
          </span>
          <span className="block text-[8px] uppercase" style={{ fontFamily: MONO, color: sslColor }}>
            {sslValid ? 'VALID' : httpStatus ? 'INVALID' : '—'}
          </span>
        </div>

        {/* HTTP Status */}
        <div className="px-1.5 py-1" style={{ background: 'rgba(57,255,20,0.02)', border: '1px solid #111' }}>
          <span className="block text-[6px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#444' }}>
            HTTP_STATUS
          </span>
          <span className="block text-[8px]" style={{ fontFamily: MONO, color: statusColor }}>
            {httpStatus || '—'}
          </span>
        </div>

        {/* Response Time */}
        <div className="px-1.5 py-1" style={{ background: 'rgba(57,255,20,0.02)', border: '1px solid #111' }}>
          <span className="block text-[6px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#444' }}>
            LATENCY_MS
          </span>
          <span className="block text-[8px]" style={{
            fontFamily: MONO,
            color: responseTime != null && responseTime > 0
              ? responseTime < 500 ? '#39FF14' : responseTime < 2000 ? '#FFBF00' : '#FF4444'
              : '#333',
          }}>
            {responseTime != null && responseTime > 0 ? `${responseTime}ms` : '—'}
          </span>
        </div>

        {/* Scan Target */}
        <div className="px-1.5 py-1" style={{ background: 'rgba(57,255,20,0.02)', border: '1px solid #111' }}>
          <span className="block text-[6px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#444' }}>
            TARGET
          </span>
          <span className="block text-[7px] truncate" style={{ fontFamily: MONO, color: '#555' }}>
            {scanTarget.replace('https://', '')}
          </span>
        </div>
      </div>

      {/* Last scan timestamp */}
      <div className="flex items-center justify-between">
        <span className="text-[6px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#333' }}>
          LAST_SWEEP
        </span>
        <span className="text-[6px]" style={{ fontFamily: MONO, color: '#444' }}>
          {lastScanFormatted}
        </span>
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

/** AG-07 Envoy — Generate Report button (scrolls to AAR panel) */
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
          // Scroll to AAR panel
          const el = document.querySelector('[data-aar-panel]');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      >
        [GENERATE_AAR_REPORT]
      </button>
    </div>
  );
}
