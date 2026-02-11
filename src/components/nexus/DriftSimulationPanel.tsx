import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import type { AgentStatusEnum } from '@/hooks/useAgentStatus';

const MODULES = [
  { id: 'AG-01', name: 'SENTINEL' },
  { id: 'AG-02', name: 'LIBRARIAN' },
  { id: 'AG-03', name: 'WATCHMAN' },
  { id: 'AG-04', name: 'GATEKEEPER' },
  { id: 'AG-05', name: 'AUDITOR' },
  { id: 'AG-06', name: 'CHRONICLER' },
  { id: 'AG-07', name: 'ENVOY' },
] as const;

type InjectableStatus = 'NOMINAL' | 'DRIFT' | 'ERROR';

const STATUS_OPTIONS: { value: InjectableStatus; label: string; color: string }[] = [
  { value: 'NOMINAL', label: 'NOMINAL', color: '#39FF14' },
  { value: 'DRIFT', label: 'DRIFT', color: '#FFBF00' },
  { value: 'ERROR', label: 'ERROR', color: '#FF4444' },
];

export default function DriftSimulationPanel() {
  const [open, setOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('AG-01');
  const [selectedStatus, setSelectedStatus] = useState<InjectableStatus>('DRIFT');
  const [injecting, setInjecting] = useState(false);
  const [lastResult, setLastResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const inject = useCallback(async () => {
    setInjecting(true);
    setLastResult(null);
    try {
      const { error } = await supabase.from('agent_heartbeats').insert({
        agent_id: selectedAgent,
        status: selectedStatus,
        message: `SIM_INJECT::${selectedStatus}`,
        metadata: { source: 'drift_simulation', injected_at: new Date().toISOString() },
      });
      if (error) {
        setLastResult({ ok: false, msg: error.message });
      } else {
        setLastResult({ ok: true, msg: `${selectedAgent} → ${selectedStatus}` });
      }
    } catch (e) {
      setLastResult({ ok: false, msg: 'Injection failed' });
    } finally {
      setInjecting(false);
    }
  }, [selectedAgent, selectedStatus]);

  const injectAll = useCallback(async (status: InjectableStatus) => {
    setInjecting(true);
    setLastResult(null);
    try {
      const rows = MODULES.map(m => ({
        agent_id: m.id,
        status,
        message: `SIM_INJECT_ALL::${status}`,
        metadata: { source: 'drift_simulation_batch', injected_at: new Date().toISOString() },
      }));
      const { error } = await supabase.from('agent_heartbeats').insert(rows);
      if (error) {
        setLastResult({ ok: false, msg: error.message });
      } else {
        setLastResult({ ok: true, msg: `ALL → ${status}` });
      }
    } catch {
      setLastResult({ ok: false, msg: 'Batch injection failed' });
    } finally {
      setInjecting(false);
    }
  }, []);

  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {/* Toggle */}
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 text-[9px] tracking-[0.3em] uppercase px-3 py-1.5 transition-colors"
        style={{
          color: open ? '#FFBF00' : '#555',
          border: `1px solid ${open ? 'rgba(255,191,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
          background: open ? 'rgba(255,191,0,0.06)' : 'transparent',
        }}
      >
        <span style={{ fontSize: 10 }}>⚡</span>
        DRIFT_SIMULATION
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 p-4"
              style={{
                border: '1px solid rgba(255,191,0,0.15)',
                background: 'rgba(255,191,0,0.02)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[8px] tracking-[0.3em] uppercase" style={{ color: '#FFBF00', opacity: 0.6 }}>
                  OPERATOR_TEST_HARNESS // INJECT_STATE
                </span>
                <span className="text-[7px] tracking-wider uppercase" style={{ color: '#FF4444', opacity: 0.5 }}>
                  ⚠ SIMULATION_MODE
                </span>
              </div>

              {/* Module selector */}
              <div className="mb-3">
                <label className="text-[7px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: '#666' }}>
                  TARGET_MODULE
                </label>
                <div className="flex flex-wrap gap-1">
                  {MODULES.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedAgent(m.id)}
                      className="text-[8px] tracking-wider uppercase px-2 py-1 transition-all"
                      style={{
                        color: selectedAgent === m.id ? '#000' : '#888',
                        background: selectedAgent === m.id ? '#FFBF00' : 'transparent',
                        border: `1px solid ${selectedAgent === m.id ? '#FFBF00' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      {m.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status selector */}
              <div className="mb-4">
                <label className="text-[7px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: '#666' }}>
                  INJECT_STATUS
                </label>
                <div className="flex gap-1">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setSelectedStatus(s.value)}
                      className="text-[8px] tracking-wider uppercase px-3 py-1 transition-all"
                      style={{
                        color: selectedStatus === s.value ? '#000' : s.color,
                        background: selectedStatus === s.value ? s.color : 'transparent',
                        border: `1px solid ${selectedStatus === s.value ? s.color : `${s.color}33`}`,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={inject}
                  disabled={injecting}
                  className="text-[9px] tracking-[0.2em] uppercase px-4 py-1.5 transition-all"
                  style={{
                    color: '#000',
                    background: '#FFBF00',
                    border: '1px solid #FFBF00',
                    opacity: injecting ? 0.5 : 1,
                  }}
                >
                  {injecting ? 'INJECTING...' : `INJECT → ${selectedAgent}`}
                </button>

                <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />

                {/* Batch actions */}
                <button
                  onClick={() => injectAll('NOMINAL')}
                  disabled={injecting}
                  className="text-[8px] tracking-wider uppercase px-2 py-1 transition-all"
                  style={{
                    color: '#39FF14',
                    border: '1px solid rgba(57,255,20,0.2)',
                    background: 'transparent',
                    opacity: injecting ? 0.5 : 1,
                  }}
                >
                  ALL → NOMINAL
                </button>
                <button
                  onClick={() => injectAll('DRIFT')}
                  disabled={injecting}
                  className="text-[8px] tracking-wider uppercase px-2 py-1 transition-all"
                  style={{
                    color: '#FFBF00',
                    border: '1px solid rgba(255,191,0,0.2)',
                    background: 'transparent',
                    opacity: injecting ? 0.5 : 1,
                  }}
                >
                  ALL → DRIFT
                </button>
                <button
                  onClick={() => injectAll('ERROR')}
                  disabled={injecting}
                  className="text-[8px] tracking-wider uppercase px-2 py-1 transition-all"
                  style={{
                    color: '#FF4444',
                    border: '1px solid rgba(255,68,68,0.2)',
                    background: 'transparent',
                    opacity: injecting ? 0.5 : 1,
                  }}
                >
                  ALL → ERROR
                </button>
              </div>

              {/* Result feedback */}
              <AnimatePresence>
                {lastResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 text-[8px] tracking-wider uppercase px-2 py-1"
                    style={{
                      color: lastResult.ok ? '#39FF14' : '#FF4444',
                      border: `1px solid ${lastResult.ok ? 'rgba(57,255,20,0.2)' : 'rgba(255,68,68,0.2)'}`,
                      background: lastResult.ok ? 'rgba(57,255,20,0.04)' : 'rgba(255,68,68,0.04)',
                    }}
                  >
                    {lastResult.ok ? '✓' : '✗'} {lastResult.msg}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
