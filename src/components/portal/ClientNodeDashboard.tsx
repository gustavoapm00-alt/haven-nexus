import { motion } from 'framer-motion';
import { useVpsInstance } from '@/hooks/useVpsInstance';
import { useNexusMode } from '@/hooks/useNexusMode';
import { useState, useEffect } from 'react';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import { useHostingerMetrics } from '@/hooks/useHostingerMetrics';
import { useVpsOrchestrator } from '@/hooks/useVpsOrchestrator';
import VitalityStream from './VitalityStream';
import CredentialDrawer from './CredentialDrawer';
import CapabilityHistoryLog from './CapabilityHistoryLog';
import AgentHealthPanel from './AgentHealthPanel';

const MONO = 'JetBrains Mono, monospace';
const CRON_CYCLE_MS = 2 * 60 * 60 * 1000;
const VERACITY_THRESHOLD_MS = 4 * 60 * 60 * 1000;

// AGENTS is now sourced from useAgentRegistry hook — see ClientNodeDashboard component

type AgentStatusEnum = 'NOMINAL' | 'DRIFT' | 'ERROR' | 'PROCESSING' | 'OFFLINE';

const STATUS_COLORS: Record<AgentStatusEnum, { border: string; pulse: string; text: string }> = {
  NOMINAL:    { border: '#1a1a1a', pulse: '#39FF14', text: '#39FF14' },
  PROCESSING: { border: '#39FF14', pulse: '#39FF14', text: '#39FF14' },
  DRIFT:      { border: '#FFBF00', pulse: '#FFBF00', text: '#FFBF00' },
  ERROR:      { border: '#FF4444', pulse: '#FF4444', text: '#FF4444' },
  OFFLINE:    { border: '#222',    pulse: '#333',    text: '#444' },
};

type Tab = 'pulse' | 'vault' | 'history';

function VeracityTTL({ lastSeen, threshold = VERACITY_THRESHOLD_MS }: { lastSeen: string | null; threshold?: number }) {
  const [display, setDisplay] = useState('--:--:--');
  const [isAmber, setIsAmber] = useState(false);

  useEffect(() => {
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
  }, [lastSeen]);

  const color = isAmber ? '#FFBF00' : '#39FF14';

  return (
    <div
      className="flex items-center justify-between px-2 py-1"
      style={{ background: isAmber ? 'rgba(255,191,0,0.05)' : 'rgba(57,255,20,0.03)', border: `1px solid ${isAmber ? 'rgba(255,191,0,0.2)' : 'rgba(57,255,20,0.1)'}` }}
    >
      <span className="text-[6px] tracking-[0.25em] uppercase" style={{ fontFamily: MONO, color: '#444' }}>VERACITY_TTL</span>
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

function ProvenanceTag({ agentId, lastSeen }: { agentId: string; lastSeen: string | null }) {
  // Determine if this was an automated n8n cron or a manual pulse
  const isManual = !lastSeen || (Date.now() - new Date(lastSeen).getTime()) > VERACITY_THRESHOLD_MS;
  const label = isManual ? '⚠ MANUAL' : 'n8n_cron';
  const color = isManual ? '#FFBF00' : '#2a5a2a';
  const textColor = isManual ? '#FFBF00' : '#39FF14';

  return (
    <div
      className="px-1.5 py-0.5"
      style={{ background: `${color}11`, border: `1px solid ${color}33` }}
    >
      <span className="text-[5px] tracking-[0.15em] uppercase" style={{ fontFamily: MONO, color: textColor }}>
        {label}
      </span>
    </div>
  );
}

function AgentMiniCard({ agent, status, lastSeen }: { agent: { id: string; codename: string; fn_description: string }; status: AgentStatusEnum; lastSeen: string | null }) {
  const colors = STATUS_COLORS[status];
  const isOffline = status === 'OFFLINE';
  const isProcessing = status === 'PROCESSING';

  return (
    <div className="relative p-2.5 overflow-hidden" style={{ background: '#050505', border: `1px solid ${colors.border}` }}>
      {isProcessing && (
        <motion.div
          className="absolute top-0 left-0 h-full pointer-events-none"
          style={{ width: '1px', background: '#39FF14', opacity: 0.5 }}
          animate={{ x: ['0px', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}
      <div className="flex items-center justify-between mb-1">
        <code className="text-[7px] uppercase tracking-wider" style={{ fontFamily: MONO, color: colors.text, opacity: 0.6 }}>
          {agent.id}
        </code>
        <span className="flex h-1.5 w-1.5">
          {!isOffline && (
            <span className="animate-ping absolute inline-flex h-1.5 w-1.5 opacity-40" style={{ background: colors.pulse, borderRadius: '50%' }} />
          )}
          <span className="relative inline-flex h-1.5 w-1.5" style={{ background: colors.pulse, borderRadius: '50%' }} />
        </span>
      </div>
      <p className="text-[7px] uppercase tracking-wide truncate mb-1" style={{ fontFamily: MONO, color: '#ccc', fontWeight: 500 }}>
        {agent.codename}
      </p>
      <p className="text-[6px] truncate mb-2" style={{ fontFamily: MONO, color: '#333' }}>
        {agent.fn_description}
      </p>

      {/* VERACITY_TTL */}
      <VeracityTTL lastSeen={lastSeen} />

      {/* PROVENANCE tag */}
      <div className="mt-1.5">
        <ProvenanceTag agentId={agent.id} lastSeen={lastSeen} />
      </div>
    </div>
  );
}

function RebootButton({ instanceId, onSuccess }: { instanceId: string; onSuccess: () => void }) {
  const { reboot, isRebooting, rebootError } = useVpsOrchestrator();
  const [confirmed, setConfirmed] = useState(false);

  const handleClick = async () => {
    if (!confirmed) { setConfirmed(true); return; }
    try {
      await reboot(instanceId);
      setConfirmed(false);
      onSuccess();
    } catch { /* error shown below */ }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isRebooting}
        className="py-2 px-4 text-[8px] tracking-widest uppercase transition-colors w-full"
        style={{
          fontFamily: MONO,
          color: confirmed ? '#FF4444' : '#FFBF00',
          border: `1px solid ${confirmed ? 'rgba(255,68,68,0.4)' : 'rgba(255,191,0,0.3)'}`,
          background: confirmed ? 'rgba(255,68,68,0.05)' : 'rgba(255,191,0,0.04)',
          cursor: isRebooting ? 'not-allowed' : 'pointer',
          opacity: isRebooting ? 0.5 : 1,
        }}
      >
        {isRebooting ? '[ REBOOTING_NODE... ]' : confirmed ? '[ CONFIRM_RESTART ]' : '[ SYSTEM_RESTART ]'}
      </button>
      {rebootError && (
        <p className="text-[7px] mt-1 tracking-wider" style={{ fontFamily: MONO, color: '#FF4444' }}>
          ERROR: {rebootError}
        </p>
      )}
      {confirmed && !isRebooting && (
        <button
          onClick={() => setConfirmed(false)}
          className="text-[6px] tracking-wider uppercase mt-1"
          style={{ fontFamily: MONO, color: '#444', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          [ CANCEL ]
        </button>
      )}
    </div>
  );
}

function ScaleButton({ instanceId }: { instanceId: string }) {
  const { metrics } = useHostingerMetrics(instanceId, 0);
  const { requestScale, isRequestingScale, scaleRequested } = useVpsOrchestrator();

  const handleScale = async () => {
    await requestScale(instanceId, metrics);
  };

  if (scaleRequested) {
    return (
      <div className="py-2 px-4 text-center" style={{ border: '1px solid rgba(57,255,20,0.2)', background: 'rgba(57,255,20,0.04)' }}>
        <span className="text-[8px] tracking-widest uppercase" style={{ fontFamily: MONO, color: '#39FF14' }}>
          ✓ SCALE_REQUEST_SUBMITTED
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleScale}
      disabled={isRequestingScale}
      className="py-2 px-4 text-[8px] tracking-widest uppercase transition-colors w-full"
      style={{
        fontFamily: MONO,
        color: '#39FF14',
        border: '1px solid rgba(57,255,20,0.2)',
        background: 'rgba(57,255,20,0.03)',
        cursor: isRequestingScale ? 'not-allowed' : 'pointer',
        opacity: isRequestingScale ? 0.5 : 1,
      }}
    >
      {isRequestingScale ? '[ SUBMITTING... ]' : '[ SCALE_NODE ↑ ]'}
    </button>
  );
}

export default function ClientNodeDashboard() {
  const { instance, isLoading: vpsLoading, provision, refetch } = useVpsInstance();
  const { mode } = useNexusMode();
  const { agentStatuses } = useAgentStatus();
  const { agents: AGENTS } = useAgentRegistry();
  const [showCredentials, setShowCredentials] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('pulse');

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

  const TABS: { id: Tab; label: string }[] = [
    { id: 'pulse', label: 'SYSTEM_PULSE' },
    { id: 'vault', label: 'CREDENTIAL_VAULT' },
    { id: 'history', label: 'CAPABILITY_HISTORY' },
  ];

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
            MANAGED_SOVEREIGN_NODE
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
          border: '1px solid',
          borderColor: hasInstance ? 'rgba(57,255,20,0.2)' : '#111',
        }}
      >
        {/* Scanline */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.008) 2px, rgba(57,255,20,0.008) 4px)' }}
        />

        <div className="relative z-10">
          {/* CONNECTING state */}
          {vpsLoading ? (
            <div className="flex items-center gap-2">
              <motion.div className="w-3 h-3 border-t" style={{ borderColor: '#39FF14', borderWidth: '1px', borderRadius: '50%' }} animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              <p className="text-[8px] tracking-widest uppercase" style={{ fontFamily: MONO, color: '#333' }}>SCANNING_NODE_REGISTRY...</p>
            </div>
          ) : hasInstance ? (
            <div className="space-y-3">
              {/* Node identity grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[6px] tracking-[0.25em] uppercase mb-1" style={{ fontFamily: MONO, color: '#444' }}>NODE_STATUS</p>
                  <div className="flex items-center gap-1.5">
                    <motion.div className="w-2 h-2 rounded-full" style={{ background: instance.status === 'running' ? '#39FF14' : '#FFBF00' }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <code className="text-[9px] uppercase tracking-wider" style={{ fontFamily: MONO, color: instance.status === 'running' ? '#39FF14' : '#FFBF00' }}>
                      {instance.status.toUpperCase()}
                    </code>
                  </div>
                </div>
                <div>
                  <p className="text-[6px] tracking-[0.25em] uppercase mb-1" style={{ fontFamily: MONO, color: '#444' }}>IP_ADDRESS</p>
                  <code className="text-[9px]" style={{ fontFamily: MONO, color: '#e0e0e0' }}>{instance.ip_address ?? '—'}</code>
                </div>
                <div>
                  <p className="text-[6px] tracking-[0.25em] uppercase mb-1" style={{ fontFamily: MONO, color: '#444' }}>AGENTS_DEPLOYED</p>
                  <code className="text-[9px] uppercase" style={{ fontFamily: MONO, color: instance.agents_deployed ? '#39FF14' : '#FFBF00' }}>
                    {instance.agents_deployed ? 'ELITE_7_ACTIVE' : 'PENDING_INJECTION'}
                  </code>
                </div>
                <div>
                  <p className="text-[6px] tracking-[0.25em] uppercase mb-1" style={{ fontFamily: MONO, color: '#444' }}>REGION</p>
                  <code className="text-[9px] uppercase" style={{ fontFamily: MONO, color: '#ccc' }}>{instance.region ?? '—'}</code>
                </div>
              </div>

              {/* VERACITY TTL */}
              <VeracityTTL lastSeen={instance.updated_at} />

              {/* Node actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setShowCredentials(true)}
                  className="py-2 text-[8px] tracking-widest uppercase transition-colors"
                  style={{ fontFamily: MONO, color: '#39FF14', border: '1px solid rgba(57,255,20,0.3)', background: 'rgba(57,255,20,0.04)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(57,255,20,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(57,255,20,0.04)')}
                >
                  {instance.credentials_viewed_at ? '[ ACCESS CREDENTIALS ]' : '[ FIRST UNLOCK ]'}
                </button>
                <RebootButton instanceId={instance.id} onSuccess={refetch} />
              </div>

              {/* Scale node */}
              <ScaleButton instanceId={instance.id} />
            </div>
          ) : (
            /* EMPTY / OFFLINE state */
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border" style={{ borderColor: '#222' }} />
                <p className="text-[8px] tracking-wider uppercase" style={{ fontFamily: MONO, color: '#333' }}>
                  NODE_OFFLINE // AWAITING_PROVISIONING
                </p>
              </div>
              {provisionError && (
                <p className="text-[7px] tracking-wider" style={{ fontFamily: MONO, color: '#FF4444' }}>
                  ERROR: {provisionError}
                </p>
              )}
              <button
                onClick={handleProvision}
                disabled={isProvisioning}
                className="py-2 px-4 text-[8px] tracking-widest uppercase transition-colors w-full"
                style={{ fontFamily: MONO, color: '#39FF14', border: '1px solid rgba(57,255,20,0.3)', background: 'rgba(57,255,20,0.04)', cursor: isProvisioning ? 'not-allowed' : 'pointer', opacity: isProvisioning ? 0.5 : 1 }}
              >
                {isProvisioning ? '[ PROVISIONING_NODE... ]' : '[ ONE-CLICK DEPLOY: PROVISION SOVEREIGN NODE ]'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs — only shown when node exists */}
      {hasInstance && (
        <>
          {/* Tab nav */}
          <div className="flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-2 text-[7px] tracking-widest uppercase transition-colors"
                style={{
                  fontFamily: MONO,
                  background: activeTab === tab.id ? 'rgba(57,255,20,0.06)' : 'transparent',
                  color: activeTab === tab.id ? '#39FF14' : '#333',
                  border: `1px solid ${activeTab === tab.id ? 'rgba(57,255,20,0.2)' : '#111'}`,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: System Pulse */}
          {activeTab === 'pulse' && (
            <div className="space-y-4">
              {/* Agent Health Panel — customer-facing live telemetry */}
              <AgentHealthPanel />

              {/* Vitality Stream */}
              <div>
                <p className="text-[7px] tracking-[0.3em] uppercase mb-2" style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.4 }}>
                  REAL-TIME_TELEMETRY // GAUGE_HUD
                </p>
                <VitalityStream instanceId={instance.id} operationalMode={mode} />
              </div>
            </div>
          )}

          {/* Tab: Credential Vault */}
          {activeTab === 'vault' && (
            <div
              className="p-4"
              style={{ background: '#030303', border: '1px solid rgba(57,255,20,0.1)' }}
            >
              {/* Scanline */}
              <div className="pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.008) 2px, rgba(57,255,20,0.008) 4px)', position: 'absolute', inset: 0 }} />

              <p className="text-[7px] tracking-[0.3em] uppercase mb-3" style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.4 }}>
                SECURE_CREDENTIAL_VAULT // AES-256-GCM
              </p>

              {instance.status === 'running' || instance.agents_deployed ? (
                <div className="space-y-3">
                  <div className="p-3" style={{ border: '1px solid rgba(57,255,20,0.15)', background: 'rgba(57,255,20,0.03)' }}>
                    <p className="text-[8px] tracking-wider uppercase mb-1" style={{ fontFamily: MONO, color: '#39FF14' }}>
                      NODE_STATUS: NOMINAL // CREDENTIALS_READY
                    </p>
                    <p className="text-[7px] leading-relaxed" style={{ fontFamily: MONO, color: '#444' }}>
                      Your VPS SSH keys and n8n instance credentials are encrypted and available for one-time retrieval. Store securely upon first access.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCredentials(true)}
                    className="w-full py-3 text-[8px] tracking-widest uppercase transition-colors"
                    style={{ fontFamily: MONO, color: '#39FF14', border: '1px solid rgba(57,255,20,0.3)', background: 'rgba(57,255,20,0.04)', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(57,255,20,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(57,255,20,0.04)')}
                  >
                    {instance.credentials_viewed_at ? '[ OPEN_SECURE_VAULT ]' : '[ FIRST_UNLOCK: INITIALIZE_CREDENTIAL_VAULT ]'}
                  </button>
                  {instance.credentials_viewed_at && (
                    <p className="text-[6px] tracking-wider text-center" style={{ fontFamily: MONO, color: '#2a2a2a' }}>
                      LAST_ACCESS: {new Date(instance.credentials_viewed_at).toISOString().replace('T', ' ').slice(0, 16)} UTC
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 gap-2">
                  <div className="w-6 h-6 border" style={{ borderColor: '#222' }} />
                  <p className="text-[8px] tracking-widest uppercase text-center" style={{ fontFamily: MONO, color: '#333' }}>
                    VAULT_LOCKED // NODE_INITIALIZATION_IN_PROGRESS
                  </p>
                  <p className="text-[7px]" style={{ fontFamily: MONO, color: '#222' }}>
                    Credentials available once node reaches NOMINAL status.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Capability History */}
          {activeTab === 'history' && (
            <CapabilityHistoryLog />
          )}
        </>
      )}

      {/* Agent grid for offline state */}
      {!hasInstance && !vpsLoading && (
        <div>
          <p className="text-[7px] tracking-[0.3em] uppercase mb-2" style={{ fontFamily: MONO, color: '#333', opacity: 0.6 }}>
            ELITE_7 // STANDBY_MODE
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[1px]">
            {AGENTS.map(agent => (
              <AgentMiniCard key={agent.id} agent={agent} status="OFFLINE" lastSeen={null} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
