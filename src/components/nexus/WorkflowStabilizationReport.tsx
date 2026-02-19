import { motion, AnimatePresence } from 'framer-motion';
import {
  useDeployAgentWorkflows,
  type StabilizationReport,
  type RemediationEvent,
  type HealingTier,
} from '@/hooks/useDeployAgentWorkflows';

const MONO = 'JetBrains Mono, monospace';

const INTEGRITY_CONFIG = {
  NOMINAL:  { color: '#39FF14', bg: 'rgba(57,255,20,0.04)',  border: 'rgba(57,255,20,0.2)',  label: 'PIPELINE_INTEGRITY_CONFIRMED' },
  WARN:     { color: '#FFBF00', bg: 'rgba(255,191,0,0.04)',  border: 'rgba(255,191,0,0.3)',  label: 'ANOMALY_DETECTED' },
  CRITICAL: { color: '#FF4444', bg: 'rgba(255,68,68,0.05)',  border: 'rgba(255,68,68,0.3)',  label: 'CRITICAL_BREACH_DETECTED' },
};

function ReportMetric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[7px] tracking-[0.3em] uppercase" style={{ fontFamily: MONO, color: '#333' }}>{label}</span>
      <span className="text-[18px] font-bold tabular-nums" style={{ fontFamily: MONO, color }}>{value}</span>
    </div>
  );
}

function OrphanRow({ orphan, index }: { orphan: StabilizationReport['orphans'][0]; index: number }) {
  const color = orphan.risk === 'CRITICAL' ? '#FF4444' : '#FFBF00';
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-start gap-3 py-2 px-3"
      style={{ borderBottom: '1px solid rgba(255,68,68,0.06)' }}
    >
      <motion.div
        className="w-1.5 h-1.5 flex-shrink-0 mt-0.5"
        style={{ background: color, borderRadius: '50%' }}
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[8px] tracking-wider uppercase" style={{ fontFamily: MONO, color }}>
            [{orphan.risk}]
          </span>
          {orphan.parsed_agent_id && (
            <span className="text-[8px] tracking-wider" style={{ fontFamily: MONO, color: '#555' }}>
              {orphan.parsed_agent_id}
            </span>
          )}
        </div>
        <p className="text-[8px] truncate" style={{ fontFamily: MONO, color: '#444' }}>
          {orphan.name}
        </p>
        <p className="text-[7px] mt-0.5" style={{ fontFamily: MONO, color: '#2a2a2a' }}>
          STATUS: ACTIVE_IN_N8N // NO_NEXUS_HEARTBEAT_DETECTED
        </p>
      </div>
      <span className="text-[7px] flex-shrink-0 px-1.5 py-0.5 uppercase" style={{
        fontFamily: MONO, color, border: `1px solid ${color}44`, background: `${color}08`,
      }}>
        ORPHAN
      </span>
    </motion.div>
  );
}

function LatencyFlag({ agentId, index }: { agentId: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-2 py-1.5 px-3"
      style={{ borderBottom: '1px solid rgba(255,191,0,0.06)' }}
    >
      <div className="w-1.5 h-1.5" style={{ background: '#FFBF00' }} />
      <span className="text-[9px] tracking-wider" style={{ fontFamily: MONO, color: '#888' }}>{agentId}</span>
      <span className="text-[7px] ml-auto" style={{ fontFamily: MONO, color: '#FFBF00' }}>
        &gt;500ms // STABILIZATION_RECOMMENDED
      </span>
    </motion.div>
  );
}

/* ─── Governance Tier Selector ─── */
function TierSelector({
  tier,
  onChange,
}: {
  tier: HealingTier;
  onChange: (t: HealingTier) => void;
}) {
  const tiers: { id: HealingTier; label: string; sub: string; color: string }[] = [
    { id: 'OPERATOR', label: 'OPERATOR', sub: 'Manual consent required before each remediation', color: '#FFBF00' },
    { id: 'GHOST',    label: 'GHOST',    sub: 'Fully autonomous — no confirmation required',       color: '#39FF14' },
  ];
  return (
    <div className="px-4 py-3" style={{ borderBottom: '1px solid #111' }}>
      <div className="text-[7px] tracking-[0.35em] uppercase mb-2" style={{ fontFamily: MONO, color: '#333' }}>
        GOVERNANCE_TIER // HEALING_AUTONOMY
      </div>
      <div className="flex gap-2">
        {tiers.map(t => {
          const active = tier === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="flex-1 px-3 py-2 text-left transition-all"
              style={{
                fontFamily: MONO,
                border: `1px solid ${active ? t.color + '66' : '#1a1a1a'}`,
                background: active ? `${t.color}08` : 'transparent',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <motion.div
                  className="w-1.5 h-1.5"
                  style={{ background: active ? t.color : '#222', borderRadius: '50%' }}
                  animate={active ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                />
                <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: active ? t.color : '#333' }}>
                  {t.label}
                </span>
              </div>
              <p className="text-[7px] leading-relaxed" style={{ color: '#2a2a2a' }}>{t.sub}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Pending Consent Queue (OPERATOR tier) ─── */
function ConsentQueue({
  pending,
  onApprove,
  isHealing,
}: {
  pending: RemediationEvent[];
  onApprove: (id: string) => void;
  isHealing: boolean;
}) {
  if (pending.length === 0) return null;
  return (
    <div style={{ borderBottom: '1px solid rgba(255,191,0,0.15)' }}>
      <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,191,0,0.1)' }}>
        <span className="text-[7px] tracking-[0.35em] uppercase" style={{ fontFamily: MONO, color: '#FFBF00', opacity: 0.7 }}>
          PENDING_OPERATOR_CONSENT // {pending.length} AGENT(S)
        </span>
        <motion.div
          className="w-1.5 h-1.5"
          style={{ background: '#FFBF00', borderRadius: '50%' }}
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
      </div>
      {pending.map((e, i) => (
        <motion.div
          key={e.correction_id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 px-3 py-2"
          style={{ borderBottom: '1px solid rgba(255,191,0,0.05)' }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-[9px] tracking-wider uppercase" style={{ fontFamily: MONO, color: '#FFBF00' }}>
              {e.agent_id}
            </div>
            <div className="text-[7px] mt-0.5" style={{ fontFamily: MONO, color: '#444' }}>
              [{e.drift_type}] // COR: {e.correction_id}
            </div>
          </div>
          <button
            onClick={() => onApprove(e.correction_id)}
            disabled={isHealing}
            className="px-3 py-1 text-[8px] tracking-[0.2em] uppercase transition-all"
            style={{
              fontFamily: MONO,
              color: isHealing ? '#222' : '#FFBF00',
              border: `1px solid ${isHealing ? '#111' : 'rgba(255,191,0,0.4)'}`,
              background: isHealing ? 'transparent' : 'rgba(255,191,0,0.05)',
              cursor: isHealing ? 'not-allowed' : 'pointer',
            }}
          >
            AUTHORIZE
          </button>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Immutable Remediation Audit Log ─── */
function RemediationAuditLog({ log }: { log: RemediationEvent[] }) {
  if (log.length === 0) return null;
  return (
    <div style={{ borderBottom: '1px solid #111' }}>
      <div className="px-3 py-2" style={{ borderBottom: '1px solid #111' }}>
        <span className="text-[7px] tracking-[0.35em] uppercase" style={{ fontFamily: MONO, color: '#333' }}>
          AUTONOMOUS_REMEDIATION_LOG // IMMUTABLE_PROVENANCE
        </span>
      </div>
      <div className="max-h-[160px] overflow-auto">
        {log.map((e, i) => {
          const color =
            e.status === 'REMEDIATION_SUCCESS' ? '#39FF14'
            : e.status === 'REMEDIATION_FAILURE' ? '#FF4444'
            : '#FFBF00';
          const icon =
            e.status === 'REMEDIATION_SUCCESS' ? '✓'
            : e.status === 'REMEDIATION_FAILURE' ? '✗'
            : '⊙';
          return (
            <motion.div
              key={`${e.correction_id}-${i}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-2 px-3 py-1.5 text-[7px]"
              style={{ borderBottom: '1px solid #0d0d0d', fontFamily: MONO }}
            >
              <span style={{ color, flexShrink: 0 }}>{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ color: '#333' }}>{e.timestamp}</span>
                  <span style={{ color }}>{e.status}</span>
                  <span style={{ color: '#555' }}>[{e.agent_id}]</span>
                  <span style={{ color: '#FFBF00' }}>{e.drift_type}</span>
                </div>
                <div className="mt-0.5 text-[6px]" style={{ color: '#2a2a2a' }}>
                  COR_ID: {e.correction_id}
                  {e.duration_ms != null && ` // ${e.duration_ms}ms`}
                  {e.error && ` // ERR: ${e.error.slice(0, 60)}`}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ReportBody({
  report,
  tier,
  onTierChange,
  onSelfHeal,
  pendingConsent,
  onApprove,
  remediationLog,
  isHealing,
  isCritical,
}: {
  report: StabilizationReport;
  tier: HealingTier;
  onTierChange: (t: HealingTier) => void;
  onSelfHeal: () => void;
  pendingConsent: RemediationEvent[];
  onApprove: (id: string) => void;
  remediationLog: RemediationEvent[];
  isHealing: boolean;
  isCritical: boolean;
}) {
  const cfg = INTEGRITY_CONFIG[report.integrity_status];
  const ts = report.scanned_at.replace('T', ' ').slice(0, 19) + ' UTC';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Integrity Banner */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}>
        <div className="flex items-center gap-3">
          <motion.div
            className="w-2 h-2"
            style={{ background: cfg.color, borderRadius: '50%' }}
            animate={report.integrity_status !== 'NOMINAL' ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: MONO, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px]" style={{ fontFamily: MONO, color: '#333' }}>{ts}</span>
          {/* SENTINEL_LOOP trigger button — only shown when CRITICAL */}
          {isCritical && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSelfHeal}
              disabled={isHealing}
              className="px-3 py-1 text-[8px] tracking-[0.2em] uppercase transition-all"
              style={{
                fontFamily: MONO,
                color: isHealing ? '#222' : '#FF4444',
                border: `1px solid ${isHealing ? '#111' : 'rgba(255,68,68,0.5)'}`,
                background: isHealing ? 'transparent' : 'rgba(255,68,68,0.06)',
                cursor: isHealing ? 'not-allowed' : 'pointer',
              }}
            >
              {isHealing ? (
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                  HEALING...
                </motion.span>
              ) : tier === 'GHOST' ? '⚡ AUTO_HEAL' : '⊙ QUEUE_REMEDIATION'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="px-4 py-4 flex items-center gap-10" style={{ borderBottom: '1px solid rgba(57,255,20,0.06)' }}>
        <ReportMetric label="TOTAL_WORKFLOWS" value={report.total_workflows} color="#888" />
        <ReportMetric label="ACTIVE" value={report.active_count} color="#39FF14" />
        <ReportMetric label="INACTIVE" value={report.inactive_count} color="#FFBF00" />
        <ReportMetric label="ORPHANS" value={report.orphan_count} color={report.orphan_count > 0 ? '#FF4444' : '#333'} />
        <ReportMetric label="HIGH_LATENCY" value={report.high_latency_agents.length} color={report.high_latency_agents.length > 0 ? '#FFBF00' : '#333'} />
        <ReportMetric label="REMEDIATED" value={remediationLog.filter(e => e.status === 'REMEDIATION_SUCCESS').length} color="#39FF14" />
      </div>

      {/* Governance Tier Selector */}
      <TierSelector tier={tier} onChange={onTierChange} />

      {/* Pending Consent Queue */}
      <AnimatePresence>
        {pendingConsent.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <ConsentQueue pending={pendingConsent} onApprove={onApprove} isHealing={isHealing} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orphan Workflows */}
      {report.orphans.length > 0 ? (
        <div>
          <div className="px-3 py-2 text-[7px] tracking-[0.4em] uppercase" style={{ fontFamily: MONO, color: '#FF4444', opacity: 0.6 }}>
            ORPHAN_PIPELINE_REGISTRY // ACTIVE_WITHOUT_NEXUS_REPORTING
          </div>
          {report.orphans.map((o, i) => <OrphanRow key={o.id} orphan={o} index={i} />)}
        </div>
      ) : (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(57,255,20,0.05)' }}>
          <span className="text-[8px] tracking-wider uppercase" style={{ fontFamily: MONO, color: '#1a3a1a' }}>
            ✓ NO_ORPHAN_PIPELINES — ALL_ACTIVE_WORKFLOWS_REPORTING_TO_NEXUS
          </span>
        </div>
      )}

      {/* High Latency Agents */}
      {report.high_latency_agents.length > 0 && (
        <div>
          <div className="px-3 py-2 text-[7px] tracking-[0.4em] uppercase" style={{ fontFamily: MONO, color: '#FFBF00', opacity: 0.6 }}>
            LATENCY_FLAGS // PIPELINES_EXCEEDING_500ms_THRESHOLD
          </div>
          {report.high_latency_agents.map((id, i) => <LatencyFlag key={id} agentId={id} index={i} />)}
        </div>
      )}

      {/* Immutable Remediation Audit Log */}
      <RemediationAuditLog log={remediationLog} />

      {/* Governance Sign-off */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(57,255,20,0.05)', background: 'rgba(0,0,0,0.5)' }}>
        <span className="text-[7px] tracking-[0.25em] uppercase" style={{ fontFamily: MONO, color: '#1e2e1e' }}>
          AERELION // GOVERNANCE_COUNCIL // WORKFLOW_STABILIZATION_REPORT
        </span>
        <span className="text-[7px]" style={{ fontFamily: MONO, color: '#1e2e1e' }}>
          [REF: COOP-PIPELINE-INTEGRITY-V2]
        </span>
      </div>
    </motion.div>
  );
}

export default function WorkflowStabilizationReport() {
  const {
    isLoading, error, stabilizationReport, phase,
    runStabilizationScan,
    healingTier, setHealingTier,
    triggerSelfHealing,
    approveRemediation,
    pendingConsent,
    remediationLog,
    isHealing,
  } = useDeployAgentWorkflows();

  const isScanning = isLoading && phase === 'scanning';
  const isHealingPhase = isHealing || phase === 'healing';
  const isCritical = stabilizationReport?.integrity_status === 'CRITICAL';

  return (
    <div className="w-full" style={{ border: '1px solid rgba(57,255,20,0.15)', background: 'rgba(0,0,0,0.9)', fontFamily: MONO }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(57,255,20,0.1)' }}>
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase mb-0.5" style={{ color: '#FFBF00' }}>
            WORKFLOW_STABILIZATION_REPORT
          </div>
          <div className="text-[8px] tracking-[0.2em]" style={{ color: '#333' }}>
            ORPHAN_DETECTION // LATENCY_AUDIT // AUTONOMOUS_REMEDIATION
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={runStabilizationScan}
          disabled={isLoading}
          className="px-4 py-2 text-[9px] tracking-[0.25em] uppercase transition-all"
          style={{
            background: isScanning ? 'transparent' : 'rgba(57,255,20,0.06)',
            border: '1px solid rgba(57,255,20,0.4)',
            color: isLoading ? '#39FF1444' : '#39FF14',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: MONO,
          }}
        >
          {isScanning ? (
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
              SCANNING...
            </motion.span>
          ) : '⬡ RUN_SCAN'}
        </motion.button>
      </div>

      {/* SENTINEL_LOOP active indicator */}
      <AnimatePresence>
        {isHealingPhase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2 flex items-center gap-2"
            style={{ background: 'rgba(255,68,68,0.05)', borderBottom: '1px solid rgba(255,68,68,0.1)' }}
          >
            <motion.div className="w-1.5 h-1.5" style={{ background: '#FF4444', borderRadius: '50%' }}
              animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} />
            <span className="text-[8px] tracking-[0.3em] uppercase" style={{ fontFamily: MONO, color: '#FF4444' }}>
              SENTINEL_LOOP_ACTIVE // AUTONOMOUS_REMEDIATION_IN_PROGRESS
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      <AnimatePresence>
        {isScanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-4 py-8 flex flex-col items-center gap-3">
            <motion.div className="w-2 h-2" style={{ background: '#39FF14', borderRadius: '50%' }}
              animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} />
            <span className="text-[8px] tracking-[0.3em] uppercase" style={{ fontFamily: MONO, color: '#333' }}>
              SCANNING_PIPELINE_INTEGRITY...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && !isScanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="px-4 py-2 text-[9px] tracking-wider"
            style={{ color: '#FF4444', background: 'rgba(255,68,68,0.05)', borderBottom: '1px solid rgba(255,68,68,0.1)' }}>
            SCAN_ERROR // {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle state */}
      {!isScanning && !stabilizationReport && !error && (
        <div className="px-4 py-8 flex items-center justify-center">
          <span className="text-[8px] tracking-[0.3em] uppercase" style={{ fontFamily: MONO, color: '#1e1e1e' }}>
            AWAITING_SCAN // PRESS_RUN_SCAN_TO_AUDIT_PIPELINE_INTEGRITY
          </span>
        </div>
      )}

      {/* Report */}
      <AnimatePresence>
        {stabilizationReport && !isScanning && (
          <ReportBody
            report={stabilizationReport}
            tier={healingTier}
            onTierChange={setHealingTier}
            onSelfHeal={triggerSelfHealing}
            pendingConsent={pendingConsent}
            onApprove={approveRemediation}
            remediationLog={remediationLog}
            isHealing={isHealingPhase}
            isCritical={!!isCritical}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
