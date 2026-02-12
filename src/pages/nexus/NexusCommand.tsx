import { useState, useEffect } from 'react';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import { useNexusMode } from '@/hooks/useNexusMode';
import GlobalHealthStatus from '@/components/nexus/GlobalHealthStatus';
import NexusModuleGrid from '@/components/nexus/NexusModuleGrid';

import RegulatorDiagram from '@/components/nexus/RegulatorDiagram';
import DriftSimulationPanel from '@/components/nexus/DriftSimulationPanel';
import OperationalModeSelector from '@/components/nexus/OperationalModeSelector';
import AARReportPanel from '@/components/nexus/AARReportPanel';
import TelemetryTimeline from '@/components/nexus/TelemetryTimeline';
import AutoHealPanel from '@/components/nexus/AutoHealPanel';
import NexusAlertPanel from '@/components/nexus/NexusAlertPanel';
import ThreatSurfaceDashboard from '@/components/nexus/ThreatSurfaceDashboard';

function useSystemClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function useEntropy() {
  const [entropy, setEntropy] = useState('0.02%');
  useEffect(() => {
    const tick = () => {
      const v = (Math.random() * 0.03 + 0.01).toFixed(2);
      setEntropy(`${v}%`);
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);
  return entropy;
}

export default function NexusCommand() {
  const clock = useSystemClock();
  const entropy = useEntropy();
  const { agentStatuses, forceStabilize } = useAgentStatus();
  const { mode, setOperationalMode, config } = useNexusMode();

  return (
    <div className="relative min-h-screen w-full transition-colors duration-700" style={{ background: '#000000' }}>
      {/* Centered watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
        <svg
          width="480" height="480" viewBox="0 0 480 480" fill="none"
          xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.02 }}
        >
          <polygon points="240,40 420,140 420,340 240,440 60,340 60,140" stroke={config.pulse} strokeWidth="1" fill="none" />
          <polygon points="240,100 370,170 370,310 240,380 110,310 110,170" stroke={config.pulse} strokeWidth="0.5" fill="none" />
          <polygon points="240,140 340,280 140,280" stroke={config.pulse} strokeWidth="0.5" fill="none" />
          <line x1="240" y1="40" x2="240" y2="440" stroke={config.pulse} strokeWidth="0.3" />
          <line x1="60" y1="240" x2="420" y2="240" stroke={config.pulse} strokeWidth="0.3" />
          <text x="240" y="250" textAnchor="middle" fill={config.pulse} fontFamily="JetBrains Mono, monospace" fontSize="14" letterSpacing="8">AERELION</text>
        </svg>
      </div>

      {/* Scanline overlay — intensity varies by mode */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-700"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${config.pulse}${Math.round(config.scanlineOpacity * 255).toString(16).padStart(2, '0')} 2px, ${config.pulse}${Math.round(config.scanlineOpacity * 255).toString(16).padStart(2, '0')} 4px)`,
        }}
      />

      {/* WAR_ROOM vignette */}
      {mode === 'WAR_ROOM' && (
        <div
          className="fixed inset-0 pointer-events-none z-[2]"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(255,68,68,0.06) 100%)',
          }}
        />
      )}

      {/* HUD Header — border color reactive to mode */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-2 transition-all duration-500"
        style={{
          background: config.bg,
          borderBottom: `1px solid ${config.headerBorder}`,
          fontFamily: 'JetBrains Mono, monospace',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-4">
          <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: '#FFBF00' }}>
            AERELION // SYS.OPS.V3.00 // GHOST_OPERATOR
          </span>
          {/* Mode badge */}
          <span
            className="text-[8px] tracking-[0.2em] uppercase px-2 py-0.5 transition-all duration-500"
            style={{
              color: config.pulse,
              border: `1px solid ${config.border}`,
              background: `${config.pulse}0a`,
            }}
          >
            MODE: {config.label}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[9px] tracking-wider" style={{ color: config.pulse, opacity: 0.7 }}>{clock}</span>
          <span className="text-[9px] tracking-wider" style={{ color: '#FFBF00', opacity: 0.7 }}>ENTROPY_LEVEL: {entropy}</span>
        </div>
      </header>

      {/* GLOBAL HEALTH INDEX */}
      <div className="relative z-10">
        <GlobalHealthStatus agentStatuses={agentStatuses} mode={mode} />
      </div>

      {/* Main content */}
      <main className="relative z-10 px-6 py-6">
        <div className="max-w-[1440px] mx-auto">
          {/* Operational Mode Selector */}
          <div className="mb-8">
            <OperationalModeSelector mode={mode} onModeChange={setOperationalMode} />
          </div>

          {/* Nexus Module Grid */}
          <div className="mb-8">
            <NexusModuleGrid agentStatuses={agentStatuses} forceStabilize={forceStabilize} />
          </div>

          {/* Nexus Alerts */}
          <div className="mb-8">
            <NexusAlertPanel agentStatuses={agentStatuses} />
          </div>

          {/* Telemetry Timeline */}
          <div className="mb-8">
            <TelemetryTimeline />
          </div>

          {/* Auto-Healing Pipeline */}
          <div className="mb-8">
            <AutoHealPanel />
          </div>

          {/* Drift Simulation Panel */}
          <div className="mb-8">
            <DriftSimulationPanel />
          </div>

          {/* Threat Surface Dashboard (AG-05) */}
          <div className="mb-8">
            <ThreatSurfaceDashboard />
          </div>

          {/* Executive Briefing Generator (AG-07) */}
          <div className="mb-8">
            <AARReportPanel />
          </div>

          {/* Regulator Interface */}
          <div className="mb-8">
            <RegulatorDiagram />
          </div>
        </div>
      </main>

    </div>
  );
}
