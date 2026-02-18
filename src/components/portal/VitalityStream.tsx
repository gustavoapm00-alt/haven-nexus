import { motion } from 'framer-motion';
import { useHostingerMetrics } from '@/hooks/useHostingerMetrics';
import GaugeChart from './GaugeChart';

const MONO = 'JetBrains Mono, monospace';

interface Props {
  instanceId: string | null;
  operationalMode?: string;
}

function UptimeBadge({ seconds }: { seconds: number }) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const label = d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
  return (
    <div className="px-3 py-2 text-center" style={{ background: 'rgba(57,255,20,0.04)', border: '1px solid rgba(57,255,20,0.1)' }}>
      <span className="text-[6px] tracking-[0.2em] uppercase block mb-0.5" style={{ fontFamily: MONO, color: '#444' }}>UPTIME</span>
      <code className="text-[10px]" style={{ fontFamily: MONO, color: '#39FF14' }}>{label}</code>
    </div>
  );
}

function NetStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2 flex-1" style={{ background: 'rgba(57,255,20,0.03)', border: '1px solid #111' }}>
      <span className="text-[6px] tracking-[0.2em] uppercase block mb-0.5" style={{ fontFamily: MONO, color: '#444' }}>{label}</span>
      <code className="text-[9px]" style={{ fontFamily: MONO, color: '#39FF14' }}>{value}</code>
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
            <div className="px-2 py-0.5" style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.15)' }}>
              <span className="text-[6px] tracking-[0.2em] uppercase" style={{ fontFamily: MONO, color: '#39FF14' }}>ENCRYPTED</span>
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
      <div className="px-4 py-4 relative z-10">

        {/* EMPTY — No node */}
        {!instanceId && (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <div className="w-8 h-8 border" style={{ borderColor: '#1a1a1a' }} />
            <p className="text-[8px] tracking-widest uppercase" style={{ fontFamily: MONO, color: '#222' }}>
              NODE_OFFLINE // NO_INSTANCE_ASSIGNED
            </p>
          </div>
        )}

        {/* CONNECTING — loading */}
        {instanceId && isLoading && !metrics && (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <motion.div
              className="w-5 h-5 border-t"
              style={{ borderColor: '#39FF14', borderWidth: '1px', borderRadius: '50%' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-[8px] tracking-widest uppercase" style={{ fontFamily: MONO, color: '#333' }}>
              ESTABLISHING_VITALITY_LINK...
            </p>
          </div>
        )}

        {/* ERROR */}
        {instanceId && error && (
          <div className="p-3 mb-3" style={{ border: '1px solid rgba(255,68,68,0.2)', background: 'rgba(255,68,68,0.03)' }}>
            <p className="text-[7px] tracking-wider uppercase" style={{ fontFamily: MONO, color: '#FF4444' }}>
              VITALITY_ERROR: {error}
            </p>
          </div>
        )}

        {/* NOMINAL — gauge charts */}
        {instanceId && !error && metrics && (
          <>
            {/* Gauge row */}
            <div className="flex items-start justify-around gap-2 mb-4">
              <GaugeChart
                label="CPU_UTIL"
                percent={metrics.cpu_percent}
                size={100}
              />
              <GaugeChart
                label="RAM_PRESSURE"
                percent={metrics.ram_percent}
                detail={`${metrics.ram_used_mb}/${metrics.ram_total_mb}MB`}
                size={100}
              />
              <GaugeChart
                label="DISK_SAT"
                percent={metrics.disk_percent}
                detail={`${metrics.disk_used_gb.toFixed(1)}/${metrics.disk_total_gb}GB`}
                size={100}
              />
            </div>

            {/* Network + uptime row */}
            <div className="flex items-stretch gap-2">
              <NetStat label="NET_IN" value={`${metrics.network_in_mbps.toFixed(2)} Mbps`} />
              <NetStat label="NET_OUT" value={`${metrics.network_out_mbps.toFixed(2)} Mbps`} />
              <UptimeBadge seconds={metrics.uptime_seconds} />
            </div>
          </>
        )}

        {/* Awaiting first sample */}
        {instanceId && !error && !metrics && !isLoading && (
          <div className="flex items-center justify-center h-20">
            <p className="text-[8px] tracking-widest uppercase" style={{ fontFamily: MONO, color: '#222' }}>
              AWAITING_FIRST_SAMPLE...
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
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
