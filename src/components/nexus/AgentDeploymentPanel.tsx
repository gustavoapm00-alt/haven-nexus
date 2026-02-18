import { motion, AnimatePresence } from 'framer-motion';
import { useDeployAgentWorkflows, DeployResult, WorkflowStatus } from '@/hooks/useDeployAgentWorkflows';

const AGENT_LABELS: Record<string, string> = {
  'AG-01': 'THE SENTINEL',
  'AG-02': 'THE LIBRARIAN',
  'AG-03': 'THE WATCHMAN',
  'AG-04': 'THE GATEKEEPER',
  'AG-05': 'THE AUDITOR',
  'AG-06': 'THE CHRONICLER',
  'AG-07': 'THE ENVOY',
};

const STATUS_COLOR: Record<string, string> = {
  deployed_and_active: '#39FF14',
  activated: '#39FF14',
  deployed_inactive: '#FFBF00',
  already_active: '#39FF14',
  error: '#FF4444',
};

const STATUS_LABEL: Record<string, string> = {
  deployed_and_active: 'DEPLOYED // ACTIVE',
  activated: 'ACTIVATED',
  deployed_inactive: 'DEPLOYED // AWAITING_ACTIVATION',
  already_active: 'ALREADY_ACTIVE',
  error: 'ERROR',
};

function PhaseIndicator({ phase }: { phase: string }) {
  const phases = ['idle', 'checking', 'deploying', 'activating', 'done'];
  const messages: Record<string, string> = {
    idle: 'READY_FOR_DEPLOYMENT',
    checking: 'QUERYING_N8N_INSTANCE...',
    deploying: 'DEPLOYING_WORKFLOWS_TO_N8N...',
    activating: 'ACTIVATING_CRON_TRIGGERS...',
    done: 'DEPLOYMENT_COMPLETE',
  };
  return (
    <div className="flex items-center gap-3">
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ background: phase === 'done' ? '#39FF14' : phase === 'idle' ? '#444' : '#FFBF00' }}
        animate={phase !== 'idle' && phase !== 'done' ? { opacity: [1, 0.3, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.8 }}
      />
      <span
        className="text-[10px] tracking-[0.3em] uppercase"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          color: phase === 'done' ? '#39FF14' : phase === 'idle' ? '#555' : '#FFBF00',
        }}
      >
        {messages[phase] || phase}
      </span>
    </div>
  );
}

function ResultRow({ result, index }: { result: DeployResult; index: number }) {
  const color = STATUS_COLOR[result.status] || '#FF4444';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center justify-between py-2 px-3"
      style={{ borderBottom: '1px solid rgba(57,255,20,0.06)' }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="w-1.5 h-1.5"
          style={{ background: color, flexShrink: 0 }}
          animate={result.status === 'deployed_and_active' ? { opacity: [1, 0.4, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <div>
          <span className="text-[10px] tracking-[0.2em]" style={{ color: '#888', fontFamily: 'JetBrains Mono, monospace' }}>
            {result.agent_id}
          </span>
          <span className="text-[10px] ml-2" style={{ color: '#555', fontFamily: 'JetBrains Mono, monospace' }}>
            // {AGENT_LABELS[result.agent_id] || result.name}
          </span>
          {result.workflow_id && (
            <span className="text-[9px] ml-2" style={{ color: '#333', fontFamily: 'JetBrains Mono, monospace' }}>
              [WF:{result.workflow_id.slice(0, 8)}]
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <span className="text-[9px] tracking-widest uppercase" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>
          {STATUS_LABEL[result.status] || result.status}
        </span>
        {result.message && result.status === 'error' && (
          <div className="text-[8px] mt-0.5" style={{ color: '#FF4444', fontFamily: 'JetBrains Mono, monospace' }}>
            {result.message.slice(0, 60)}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function WorkflowStatusRow({ wf, index }: { wf: WorkflowStatus; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between py-2 px-3"
      style={{ borderBottom: '1px solid rgba(57,255,20,0.06)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5" style={{ background: wf.active ? '#39FF14' : '#555' }} />
        <span className="text-[10px] tracking-[0.15em]" style={{ color: '#888', fontFamily: 'JetBrains Mono, monospace' }}>
          {wf.name}
        </span>
      </div>
      <span
        className="text-[9px] tracking-widest uppercase"
        style={{ color: wf.active ? '#39FF14' : '#FFBF00', fontFamily: 'JetBrains Mono, monospace' }}
      >
        {wf.active ? 'ACTIVE' : 'INACTIVE'}
      </span>
    </motion.div>
  );
}

export default function AgentDeploymentPanel() {
  const { isLoading, error, summary, results, existingWorkflows, phase, deployAll, checkStatus, activateAll, reset } =
    useDeployAgentWorkflows();

  return (
    <div
      className="w-full"
      style={{ border: '1px solid rgba(57,255,20,0.2)', background: 'rgba(0,0,0,0.9)', fontFamily: 'JetBrains Mono, monospace' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(57,255,20,0.15)' }}
      >
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase mb-0.5" style={{ color: '#FFBF00' }}>
            ZERO-TOUCH DEPLOYMENT
          </div>
          <div className="text-[9px] tracking-[0.2em]" style={{ color: '#444' }}>
            AGENT_MONITORING_INFRASTRUCTURE // n8n_CRON_AUTOMATION
          </div>
        </div>
        <div className="text-[9px] tracking-widest" style={{ color: '#333' }}>
          [7 AGENTS]
        </div>
      </div>

      {/* Phase + Status */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(57,255,20,0.08)' }}>
        <PhaseIndicator phase={phase} />
      </div>

      {/* Summary bar */}
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 flex items-center gap-8"
            style={{ borderBottom: '1px solid rgba(57,255,20,0.08)', background: 'rgba(57,255,20,0.03)' }}
          >
            {[
              { label: 'TOTAL', value: summary.total, color: '#888' },
              { label: 'ACTIVE', value: summary.deployed_active, color: '#39FF14' },
              { label: 'ERRORS', value: summary.errors, color: summary.errors > 0 ? '#FF4444' : '#333' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="text-[8px] tracking-widest" style={{ color: '#444' }}>{label}</div>
                <div className="text-[18px] font-bold" style={{ color }}>{value}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-2 text-[9px] tracking-wider"
            style={{ color: '#FF4444', background: 'rgba(255,68,68,0.06)', borderBottom: '1px solid rgba(255,68,68,0.15)' }}
          >
            ERROR // {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results list */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="px-3 py-2 text-[8px] tracking-[0.4em] uppercase" style={{ color: '#333' }}>
              DEPLOYMENT_MANIFEST
            </div>
            {results.map((r, i) => (
              <ResultRow key={r.agent_id} result={r} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing workflows status */}
      <AnimatePresence>
        {existingWorkflows.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="px-3 py-2 text-[8px] tracking-[0.4em] uppercase" style={{ color: '#333' }}>
              N8N_INSTANCE_INVENTORY ({existingWorkflows.length})
            </div>
            {existingWorkflows.map((wf, i) => (
              <WorkflowStatusRow key={wf.id} wf={wf} index={i} />
            ))}
          </motion.div>
        )}
        {phase === 'done' && existingWorkflows.length === 0 && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-3 text-[9px] tracking-wider"
            style={{ color: '#555' }}
          >
            NO_AERELION_WORKFLOWS_FOUND // Deploy to initialize monitoring infrastructure
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div
        className="px-4 py-4 flex flex-wrap items-center gap-3"
        style={{ borderTop: '1px solid rgba(57,255,20,0.1)' }}
      >
        {/* Primary: Deploy All */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={deployAll}
          disabled={isLoading}
          className="relative px-5 py-2.5 text-[10px] tracking-[0.3em] uppercase transition-all"
          style={{
            background: isLoading ? 'transparent' : 'rgba(57,255,20,0.08)',
            border: '1px solid #39FF14',
            color: isLoading ? '#39FF1466' : '#39FF14',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {isLoading && phase === 'deploying' ? (
            <span className="flex items-center gap-2">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>▌</motion.span>
              DEPLOYING...
            </span>
          ) : (
            '▶ DEPLOY ALL AGENTS'
          )}
        </motion.button>

        {/* Check Status */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={checkStatus}
          disabled={isLoading}
          className="px-4 py-2.5 text-[10px] tracking-[0.3em] uppercase transition-all"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,191,0,0.4)',
            color: isLoading ? '#FFBF0066' : '#FFBF00',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {isLoading && phase === 'checking' ? (
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>SCANNING...</motion.span>
          ) : '◎ CHECK_STATUS'}
        </motion.button>

        {/* Activate All */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={activateAll}
          disabled={isLoading}
          className="px-4 py-2.5 text-[10px] tracking-[0.3em] uppercase transition-all"
          style={{
            background: 'transparent',
            border: '1px solid rgba(57,255,20,0.25)',
            color: isLoading ? '#39FF1444' : '#39FF1499',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {isLoading && phase === 'activating' ? (
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>ACTIVATING...</motion.span>
          ) : '⚡ ACTIVATE_ALL'}
        </motion.button>

        {/* Reset */}
        {phase !== 'idle' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            onClick={reset}
            disabled={isLoading}
            className="px-3 py-2.5 text-[9px] tracking-widest uppercase"
            style={{
              background: 'transparent',
              border: '1px solid #222',
              color: '#444',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            ✕ RESET
          </motion.button>
        )}
      </div>

      {/* Doctrine footnote */}
      <div
        className="px-4 py-2 text-[8px] tracking-[0.25em]"
        style={{ color: '#2a2a2a', borderTop: '1px solid rgba(57,255,20,0.04)' }}
      >
        ZERO-TOUCH_PIPELINE // n8n_API_v1 // CRON_INTERVAL: 2H // OFFLINE_THRESHOLD: 4H
      </div>
    </div>
  );
}
