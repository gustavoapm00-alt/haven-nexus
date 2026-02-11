import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Shield, Radar, AlertTriangle } from 'lucide-react';
import { type OperationalMode, MODE_CONFIG } from '@/hooks/useNexusMode';

interface Props {
  mode: OperationalMode;
  onModeChange: (mode: OperationalMode) => Promise<boolean>;
}

const MODES: { key: OperationalMode; icon: typeof Shield }[] = [
  { key: 'STEALTH', icon: Shield },
  { key: 'SENTINEL', icon: Radar },
  { key: 'WAR_ROOM', icon: AlertTriangle },
];

export default function OperationalModeSelector({ mode, onModeChange }: Props) {
  const [confirming, setConfirming] = useState<OperationalMode | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const handleClick = (target: OperationalMode) => {
    if (target === mode) return;
    // WAR_ROOM requires confirmation
    if (target === 'WAR_ROOM') {
      setConfirming(target);
    } else {
      executeTransition(target);
    }
  };

  const executeTransition = async (target: OperationalMode) => {
    setTransitioning(true);
    setConfirming(null);
    await onModeChange(target);
    setTransitioning(false);
  };

  return (
    <div className="relative" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      <p
        className="text-[8px] tracking-[0.4em] uppercase mb-3"
        style={{ color: MODE_CONFIG[mode].pulse, opacity: 0.5 }}
      >
        OPERATIONAL_MODE_SELECTOR
      </p>

      <div className="flex gap-[1px]">
        {MODES.map(({ key, icon: Icon }) => {
          const isActive = mode === key;
          const cfg = MODE_CONFIG[key];

          return (
            <motion.button
              key={key}
              onClick={() => handleClick(key)}
              disabled={transitioning}
              className="relative flex-1 flex flex-col items-center gap-2 py-4 px-3 transition-all group"
              style={{
                background: isActive ? `${cfg.pulse}0a` : '#050505',
                border: `1px solid ${isActive ? cfg.pulse : '#1a1a1a'}`,
                cursor: isActive ? 'default' : 'pointer',
                opacity: transitioning ? 0.5 : 1,
              }}
              whileHover={!isActive ? { borderColor: `${cfg.pulse}66` } : undefined}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: cfg.pulse }}
                  layoutId="mode-indicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Pulse ring for active */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ border: `1px solid ${cfg.pulse}` }}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <Icon
                className="w-4 h-4"
                style={{ color: isActive ? cfg.pulse : '#444' }}
              />

              <span
                className="text-[9px] tracking-[0.2em] uppercase font-medium"
                style={{ color: isActive ? cfg.pulse : '#555' }}
              >
                {cfg.label}
              </span>

              <span
                className="text-[7px] tracking-wider uppercase text-center leading-tight"
                style={{ color: isActive ? `${cfg.pulse}99` : '#333' }}
              >
                {cfg.description}
              </span>

              {/* Status dot */}
              {isActive && (
                <span className="flex h-1.5 w-1.5 mt-1">
                  <span
                    className="animate-ping absolute inline-flex h-1.5 w-1.5 opacity-40"
                    style={{ background: cfg.pulse, borderRadius: '50%' }}
                  />
                  <span
                    className="relative inline-flex h-1.5 w-1.5"
                    style={{ background: cfg.pulse, borderRadius: '50%' }}
                  />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* WAR_ROOM Confirmation Dialog */}
      <AnimatePresence>
        {confirming === 'WAR_ROOM' && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 p-4"
            style={{
              background: 'rgba(255,68,68,0.06)',
              border: '1px solid rgba(255,68,68,0.4)',
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#FF4444' }} />
              <div className="flex-1">
                <p className="text-[10px] tracking-wider uppercase mb-2" style={{ color: '#FF4444' }}>
                  CONFIRM WAR_ROOM ACTIVATION
                </p>
                <p className="text-[9px] leading-relaxed mb-3" style={{ color: '#FF444499' }}>
                  WAR_ROOM engages maximum security guardrails with real-time logic refactoring. All agents will enter heightened operational state. This action is logged with full provenance.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => executeTransition('WAR_ROOM')}
                    className="text-[8px] tracking-[0.2em] uppercase px-4 py-1.5 font-medium transition-all"
                    style={{
                      background: 'rgba(255,68,68,0.15)',
                      border: '1px solid #FF4444',
                      color: '#FF4444',
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.boxShadow = '0 0 15px rgba(255,68,68,0.3)'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.boxShadow = 'none'; }}
                  >
                    AUTHORIZE WAR_ROOM
                  </button>
                  <button
                    onClick={() => setConfirming(null)}
                    className="text-[8px] tracking-[0.2em] uppercase px-4 py-1.5"
                    style={{ border: '1px solid #333', color: '#555' }}
                  >
                    ABORT
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
