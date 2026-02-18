import { motion } from 'framer-motion';
import { useHostingerMetrics } from '@/hooks/useHostingerMetrics';

const MONO = 'JetBrains Mono, monospace';

interface Props {
  instanceId: string | null;
  operationalMode?: string;
}

function MetricBar({
  label,
  percent,
  detail,
  isAmber = false,
}: {
  label: string;
  percent: number;
  detail: string;
  isAmber?: boolean;
}) {
  const color = isAmber ? '#FFBF00' : '#39FF14';
  const capped = Math.min(100, Math.max(0, percent));

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[7px] tracking-[0.2em] uppercase" style={{ fontFamily: MONO, color: '#444' }}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[7px]" style={{ fontFamily: MONO, color: '#555' }}>{detail}</span>
          <code className="text-[9px] tabular-nums" style={{ fontFamily: MONO, color }}>
            {capped.toFixed(1)}%
          </code>
        </div>
      </div>
      <div className="w-full h-1" style={{ background: '#0a0a0a', border: '1px solid #111' }}>
        <motion.div
          className="h-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}55` }}
          initial={{ width: 0 }}
          animate={{ width: `${capped}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function UptimeBadge({ seconds }: { seconds: number }) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const label = d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
  return (
    <div className="px-2 py-1" style={{ background: 'rgba(57,255,20,0.04)', border: '1px solid rgba(57,255,20,0.1)' }}>
      <span className="text-[7px] tracking-[0.2em] uppercase" style={{ fontFamily: MONO, color: '#444' }}>
        UPTIME
      </span>
      <code className="ml-2 text-[9px]" style={{ fontFamily: MONO, color: '#39FF14' }}>
        {label}
      </code>
    </div>
  );
}

export default function VitalityStream({ instanceId, operationalMode = 'STEALTH' }: Props) {
  const { metrics, isLoading, error, lastFetched } = useHostingerMetrics(instanceId, 30_000);
  const modeIsEncrypted = operationalMode === 'STEALTH' || operationalMode === 'SENTINEL';

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: '#030303', border: '1px solid rgba(57,255,20,0.1)' }}
    >
      {/* Scanline overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.01) 2px, rgba(57,255,20,0.01) 4px)',
          zIndex: 0,
        }}
      />

      {/* Moving scanline */}
      <motion.div
        className="absolute left-0 w-full h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.3), transparent)', zIndex: 1 }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 relative z-10"
        style={{ borderBottom: '1px solid rgba(57,255,20,0.07)' }}
      >
        <div>
          <p className="text-[7px] tracking-[0.3em] uppercase" style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.4 }}>
            VITALITY_STREAM // HOSTINGER_METRICS
          </p>
          <p className="text-[6px] tracking-wider uppercase mt-0.5" style={{ fontFamily: MONO, color: '#333' }}>
            POLL_INTERVAL: 30s // AES-256-GCM TUNNEL
          </p>
        </div>
        <div className="flex items-center gap-2">
          {modeIsEncrypted && (
            <div
              className="px-2 py-0.5"
              style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.15)' }}
            >
              <span className="text-[6px] tracking-[0.2em] uppercase" style={{ fontFamily: MONO, color: '#39FF14' }}>
                ENCRYPTED
              </span>
            </div>
          )}
          {isLoading && (
            <motion.div
              className="w-2 h-2 border-t"
              style={{ borderColor: '#39FF14', borderWidth: '1px', borderRadius: '50%' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          )}
          {!isLoading && metrics && (
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: '#39FF14' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 relative z-10">
        {!instanceId && (
          <div className="flex items-center justify-center h-24">
            <p className="text-[8px] tracking-widest uppercase" style={{ fontFamily: MONO, color: '#222' }}>
              NO_NODE_ASSIGNED
            </p>
          </div>
        )}

        {instanceId && error && (
          <div className="p-3" style={{ border: '1px solid rgba(255,68,68,0.2)', background: 'rgba(255,68,68,0.03)' }}>
            <p className="text-[7px] tracking-wider uppercase" style={{ fontFamily: MONO, color: '#FF4444' }}>
              VITALITY_ERROR: {error}
            </p>
          </div>
        )}

        {instanceId && !error && metrics && (
          <>
            <MetricBar
              label="CPU_UTILIZATION"
              percent={metrics.cpu_percent}
              detail=""
              isAmber={metrics.cpu_percent > 80}
            />
            <MetricBar
              label="RAM_PRESSURE"
              percent={metrics.ram_percent}
              detail={`${metrics.ram_used_mb}/${metrics.ram_total_mb} MB`}
              isAmber={metrics.ram_percent > 85}
            />
            <MetricBar
              label="DISK_SATURATION"
              percent={metrics.disk_percent}
              detail={`${metrics.disk_used_gb.toFixed(1)}/${metrics.disk_total_gb} GB`}
              isAmber={metrics.disk_percent > 80}
            />

            <div className="flex items-center justify-between mt-3 mb-2 gap-2">
              <div className="px-2 py-1 flex-1" style={{ background: 'rgba(57,255,20,0.03)', border: '1px solid #111' }}>
                <span className="text-[6px] tracking-[0.2em] uppercase" style={{ fontFamily: MONO, color: '#444' }}>NET_IN</span>
                <code className="block text-[9px] mt-0.5" style={{ fontFamily: MONO, color: '#39FF14' }}>
                  {metrics.network_in_mbps.toFixed(2)} Mbps
                </code>
              </div>
              <div className="px-2 py-1 flex-1" style={{ background: 'rgba(57,255,20,0.03)', border: '1px solid #111' }}>
                <span className="text-[6px] tracking-[0.2em] uppercase" style={{ fontFamily: MONO, color: '#444' }}>NET_OUT</span>
                <code className="block text-[9px] mt-0.5" style={{ fontFamily: MONO, color: '#39FF14' }}>
                  {metrics.network_out_mbps.toFixed(2)} Mbps
                </code>
              </div>
              <UptimeBadge seconds={metrics.uptime_seconds} />
            </div>
          </>
        )}

        {instanceId && !error && !metrics && !isLoading && (
          <div className="flex items-center justify-center h-20">
            <p className="text-[8px] tracking-widest uppercase" style={{ fontFamily: MONO, color: '#222' }}>
              AWAITING_FIRST_SAMPLE...
            </p>
          </div>
        )}
      </div>

      {/* Footer: last sampled */}
      {lastFetched && (
        <div
          className="px-4 py-1.5 relative z-10 flex items-center justify-between"
          style={{ borderTop: '1px solid #0a0a0a' }}
        >
          <p className="text-[6px] tracking-[0.3em] uppercase" style={{ fontFamily: MONO, color: '#1e1e1e' }}>
            AERELION // SYS.OPS.V2.06
          </p>
          <code className="text-[6px]" style={{ fontFamily: MONO, color: '#2a2a2a' }}>
            LAST_SAMPLE: {new Date(lastFetched).toISOString().replace('T', ' ').slice(0, 19)} UTC
          </code>
        </div>
      )}
    </div>
  );
}
