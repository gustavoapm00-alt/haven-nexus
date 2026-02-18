import { motion } from 'framer-motion';
import { useVpsInstance } from '@/hooks/useVpsInstance';
import { useNexusMode } from '@/hooks/useNexusMode';
import { useState } from 'react';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import VitalityStream from './VitalityStream';
import CredentialDrawer from './CredentialDrawer';

const MONO = 'JetBrains Mono, monospace';
const CRON_CYCLE_MS = 2 * 60 * 60 * 1000;

const AGENTS = [
  { id: 'AG-01', codename: 'THE SENTINEL', fn: 'CUI Handoff & NIST/CMMC Scanning' },
  { id: 'AG-02', codename: 'THE LIBRARIAN', fn: 'Universal Data Ontology' },
  { id: 'AG-03', codename: 'THE WATCHMAN', fn: 'COOP & Drift Detection' },
  { id: 'AG-04', codename: 'THE GATEKEEPER', fn: 'PoLP Access Governance' },
  { id: 'AG-05', codename: 'THE AUDITOR', fn: 'Threat Surface Reduction' },
  { id: 'AG-06', codename: 'THE CHRONICLER', fn: 'Real-Time System Status' },
  { id: 'AG-07', codename: 'THE ENVOY', fn: 'Executive Briefing AI' },
];

type AgentStatusEnum = 'NOMINAL' | 'DRIFT' | 'ERROR' | 'PROCESSING' | 'OFFLINE';

const STATUS_COLORS: Record<AgentStatusEnum, { border: string; pulse: string; text: string }> = {
  NOMINAL:    { border: '#1a1a1a', pulse: '#39FF14', text: '#39FF14' },
  PROCESSING: { border: '#39FF14', pulse: '#39FF14', text: '#39FF14' },
  DRIFT:      { border: '#FFBF00', pulse: '#FFBF00', text: '#FFBF00' },
  ERROR:      { border: '#FF4444', pulse: '#FF4444', text: '#FF4444' },
  OFFLINE:    { border: '#222',    pulse: '#333',    text: '#444' },
};

function VeracityTTL({ lastSeen }: { lastSeen: string | null }) {
  const [display, setDisplay] = useState('--:--:--');
  const [isAmber, setIsAmber] = useState(false);

  useState(() => {
    if (!lastSeen) { setDisplay('NO_SIGNAL'); setIsAmber(true); return; }
    const tick = () => {
      const age = Date.now() - new Date(lastSeen).getTime();
      setIsAmber(age > CRON_CYCLE_MS);
      if (age > 4 * CRON_CYCLE_MS) { setDisplay('EXPIRED'); return; }
      const totalSec = Math.floor(age / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      setDisplay(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  });

  const color = isAmber ? '#FFBF00' : '#39FF14';

  return (
    <div
      className="flex items-center justify-between px-2 py-1"
      style={{ background: isAmber ? 'rgba(255,191,0,0.05)' : 'rgba(57,255,20,0.03)', border: `1px solid ${isAmber ? 'rgba(255,191,0,0.2)' : 'rgba(57,255,20,0.1)'}` }}
    >
      <span className="text-[6px] tracking-[0.25em] uppercase" style={{ fontFamily: MONO, color: '#444' }}>
        VERACITY_TTL
      </span>
      <motion.code
        className="text-[8px] tabular-nums"
        style={{ fontFamily: MONO, color }}
        animate={isAmber ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
        transition={isAmber ? { duration: 1.2, repeat: Infinity } : {}}
      >
        {display}
      </motion.code>
    </div>
  );
}

function AgentMiniCard({ agent, status }: { agent: typeof AGENTS[0]; status: AgentStatusEnum }) {
  const colors = STATUS_COLORS[status];
  const isOffline = status === 'OFFLINE';
  const isProcessing = status === 'PROCESSING';

  return (
    <div className="relative p-2 overflow-hidden" style={{ background: '#050505', border: `1px solid ${colors.border}` }}>
      {isProcessing && (
        <motion.div
          className="absolute top-0 left-0 h-full pointer-events-none"
          style={{ width: '1px', background: '#39FF14', opacity: 0.5 }}
          animate={{ x: ['0px', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}
      <div className="flex items-center justify-between mb-0.5">
        <code className="text-[7px] uppercase tracking-wider" style={{ fontFamily: MONO, color: colors.text, opacity: 0.5 }}>
          {agent.id}
        </code>
        <span className="flex h-1.5 w-1.5">
          {!isOffline && (
            <span className="animate-ping absolute inline-flex h-1.5 w-1.5 opacity-40" style={{ background: colors.pulse, borderRadius: '50%' }} />
          )}
          <span className="relative inline-flex h-1.5 w-1.5" style={{ background: colors.pulse, borderRadius: '50%' }} />
        </span>
      </div>
      <p className="text-[7px] uppercase tracking-wide truncate" style={{ fontFamily: MONO, color: '#ccc', fontWeight: 500 }}>
        {agent.codename}
      </p>
      <p className="text-[6px] truncate mt-0.5" style={{ fontFamily: MONO, color: '#333' }}>
        {agent.fn}
      </p>
    </div>
  );
}

export default function ClientNodeDashboard() {
  const { instance, isLoading: vpsLoading, provision } = useVpsInstance();
  const { mode, config } = useNexusMode();
  const { agentStatuses } = useAgentStatus();
  const [showCredentials, setShowCredentials] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  const isEncryptedMode = mode === 'STEALTH' || mode === 'SENTINEL';
  const hasInstance = !!instance;

  const handleProvision = async () => {
    setIsProvisioning(true);
    setProvisionError(null);
    try {
      await provision();
    } catch (err) {
      setProvisionError(err instanceof Error ? err.message : 'PROVISION_FAILED');
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Credential drawer */}
      {showCredentials && instance && (
        <CredentialDrawer
          instanceId={instance.id}
          onClose={() => setShowCredentials(false)}
        />
      )}

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[8px] tracking-[0.3em] uppercase mb-0.5" style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.5 }}>
            MANAGED_INFRASTRUCTURE
          </p>
          <h2 className="text-[11px] tracking-widest uppercase" style={{ fontFamily: MONO, color: '#e0e0e0' }}>
            CLIENT NODE ALPHA
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isEncryptedMode && (
            <motion.div
              className="px-2 py-1"
              style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.2)' }}
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-[6px] tracking-[0.25em] uppercase" style={{ fontFamily: MONO, color: '#39FF14' }}>
                ENCRYPTED // {mode}
              </span>
            </motion.div>
          )}
          <div className="text-[6px] tracking-[0.2em] uppercase" style={{ fontFamily: MONO, color: '#2a2a2a' }}>
            AERELION // SYS.OPS.V2.06
          </div>
        </div>
      </div>

      {/* Node status card */}
      <div
        className="p-4 relative overflow-hidden"
        style={{
          background: '#030303',
          border: hasInstance ? 'rgba(57,255,20,0.2)' : '1px solid #111',
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: hasInstance ? 'rgba(57,255,20,0.2)' : '#111',
        }}
      >
        {/* Scanline */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.008) 2px, rgba(57,255,20,0.008) 4px)' }}
        />

        <div className="relative z-10">
          {vpsLoading ? (
            <div className="flex items-center gap-2">
              <motion.div className="w-3 h-3 border-t" style={{ borderColor: '#39FF14', borderWidth: '1px', borderRadius: '50%' }} animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              <p className="text-[8px] tracking-widest uppercase" style={{ fontFamily: MONO, color: '#333' }}>SCANNING_NODE_REGISTRY...</p>
            </div>
          ) : hasInstance ? (
            <div className="space-y-3">
              {/* Node identity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[6px] tracking-[0.25em] uppercase mb-1" style={{ fontFamily: MONO, color: '#444' }}>NODE_STATUS</p>
                  <div className="flex items-center gap-1.5">
                    <motion.div className="w-2 h-2 rounded-full" style={{ background: '#39FF14' }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <code className="text-[9px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#39FF14' }}>
                      {instance.status.toUpperCase()}
                    </code>
                  </div>
                </div>
                <div>
                  <p className="text-[6px] tracking-[0.25em] uppercase mb-1" style={{ fontFamily: MONO, color: '#444' }}>IP_ADDRESS</p>
                  <code className="text-[9px]" style={{ fontFamily: MONO, color: '#e0e0e0' }}>
                    {instance.ip_address ?? '—'}
                  </code>
                </div>
                <div>
                  <p className="text-[6px] tracking-[0.25em] uppercase mb-1" style={{ fontFamily: MONO, color: '#444' }}>AGENTS_DEPLOYED</p>
                  <code className="text-[9px] uppercase" style={{ fontFamily: MONO, color: instance.agents_deployed ? '#39FF14' : '#FFBF00' }}>
                    {instance.agents_deployed ? 'ELITE_7_ACTIVE' : 'PENDING_INJECTION'}
                  </code>
                </div>
                <div>
                  <p className="text-[6px] tracking-[0.25em] uppercase mb-1" style={{ fontFamily: MONO, color: '#444' }}>REGION</p>
                  <code className="text-[9px] uppercase" style={{ fontFamily: MONO, color: '#ccc' }}>
                    {instance.region ?? '—'}
                  </code>
                </div>
              </div>

              {/* VERACITY_TTL */}
              <VeracityTTL lastSeen={instance.updated_at} />

              {/* Credential access button */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowCredentials(true)}
                  className="flex-1 py-2 text-[8px] tracking-widest uppercase transition-colors"
                  style={{ fontFamily: MONO, color: '#39FF14', border: '1px solid rgba(57,255,20,0.3)', background: 'rgba(57,255,20,0.04)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(57,255,20,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(57,255,20,0.04)')}
                >
                  {instance.credentials_viewed_at ? '[ ACCESS CREDENTIALS ]' : '[ FIRST UNLOCK: VIEW CREDENTIALS ]'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[8px] tracking-wider uppercase" style={{ fontFamily: MONO, color: '#333' }}>
                NO_NODE_ASSIGNED // AWAITING_PROVISIONING
              </p>
              {provisionError && (
                <p className="text-[7px] tracking-wider" style={{ fontFamily: MONO, color: '#FF4444' }}>
                  ERROR: {provisionError}
                </p>
              )}
              <button
                onClick={handleProvision}
                disabled={isProvisioning}
                className="py-2 px-4 text-[8px] tracking-widest uppercase transition-colors"
                style={{ fontFamily: MONO, color: '#39FF14', border: '1px solid rgba(57,255,20,0.3)', background: 'rgba(57,255,20,0.04)', cursor: isProvisioning ? 'not-allowed' : 'pointer', opacity: isProvisioning ? 0.5 : 1 }}
              >
                {isProvisioning ? '[ PROVISIONING_NODE... ]' : '[ ONE-CLICK DEPLOY: PROVISION NODE ]'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AG-01 through AG-07 mini grid */}
      <div>
        <p className="text-[7px] tracking-[0.3em] uppercase mb-2" style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.4 }}>
          ELITE_7 // NODE_ALPHA_STATUS
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[1px]">
          {AGENTS.map(agent => {
            const s = agentStatuses[agent.id];
            const status: AgentStatusEnum = (s?.status ?? 'OFFLINE') as AgentStatusEnum;
            return <AgentMiniCard key={agent.id} agent={agent} status={status} />;
          })}
        </div>
      </div>

      {/* Vitality Stream */}
      {hasInstance && (
        <div>
          <p className="text-[7px] tracking-[0.3em] uppercase mb-2" style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.4 }}>
            REAL-TIME_TELEMETRY
          </p>
          <VitalityStream instanceId={instance.id} operationalMode={mode} />
        </div>
      )}
    </div>
  );
}
