import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTelemetryTimeline } from '@/hooks/useTelemetryTimeline';

const MONO = 'JetBrains Mono, monospace';

const WINDOWS = [
  { label: '24H', hours: 24 },
  { label: '7D', hours: 168 },
  { label: '30D', hours: 720 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '6px 10px', fontFamily: MONO, fontSize: 8 }}>
      <p style={{ color: '#666', marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.dataKey.toUpperCase()}: {p.value}</p>
      ))}
    </div>
  );
};

export default function TelemetryTimeline() {
  const [windowHours, setWindowHours] = useState(24);
  const { data, loading } = useTelemetryTimeline(windowHours);

  const totalHeartbeats = data.reduce((s, d) => s + d.total, 0);
  const totalDrifts = data.reduce((s, d) => s + d.drift, 0);
  const totalErrors = data.reduce((s, d) => s + d.error, 0);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-[9px] tracking-[0.3em] uppercase"
          style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.6 }}
        >
          TELEMETRY_TIMELINE // HEARTBEAT_FREQUENCY
        </h2>
        <div className="flex items-center gap-1">
          {WINDOWS.map((w) => (
            <button
              key={w.hours}
              onClick={() => setWindowHours(w.hours)}
              className="text-[7px] tracking-wider uppercase px-2 py-0.5 transition-all"
              style={{
                fontFamily: MONO,
                color: windowHours === w.hours ? '#39FF14' : '#444',
                border: `1px solid ${windowHours === w.hours ? 'rgba(57,255,20,0.4)' : '#1a1a1a'}`,
                background: windowHours === w.hours ? 'rgba(57,255,20,0.05)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 mb-3">
        {[
          { label: 'SIGNALS', value: totalHeartbeats, color: '#39FF14' },
          { label: 'DRIFTS', value: totalDrifts, color: '#FFBF00' },
          { label: 'ERRORS', value: totalErrors, color: '#FF4444' },
        ].map((s) => (
          <div key={s.label} className="px-2 py-1" style={{ border: '1px solid #111', background: '#030303' }}>
            <span className="block text-[6px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#444' }}>
              {s.label}
            </span>
            <span className="block text-[10px]" style={{ fontFamily: MONO, color: s.value > 0 ? s.color : '#333' }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div
        className="relative"
        style={{ background: '#030303', border: '1px solid #1a1a1a', padding: '12px 8px 4px' }}
      >
        {loading ? (
          <div className="h-[180px] flex items-center justify-center">
            <span className="text-[8px] uppercase animate-pulse" style={{ fontFamily: MONO, color: '#333' }}>
              LOADING_TELEMETRY...
            </span>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[180px] flex items-center justify-center">
            <span className="text-[8px] uppercase" style={{ fontFamily: MONO, color: '#222' }}>
              INSUFFICIENT_TELEMETRY_DATA
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gNominal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDrift" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFBF00" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FFBF00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gError" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 7, fill: '#333', fontFamily: MONO }}
                axisLine={{ stroke: '#111' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 7, fill: '#333', fontFamily: MONO }}
                axisLine={{ stroke: '#111' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="nominal" stroke="#39FF14" fill="url(#gNominal)" strokeWidth={1} />
              <Area type="monotone" dataKey="drift" stroke="#FFBF00" fill="url(#gDrift)" strokeWidth={1} />
              <Area type="monotone" dataKey="error" stroke="#FF4444" fill="url(#gError)" strokeWidth={1} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
