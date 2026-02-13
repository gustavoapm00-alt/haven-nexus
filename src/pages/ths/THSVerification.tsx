import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const MONO = 'JetBrains Mono, monospace';
const COMMAND = 'AUTHORIZE_COMMANDER';
const FALLBACK_NEXUS = '/nexus/cmd';

interface MouseSample { x: number; y: number; t: number; }
interface KeystrokeSample { key: string; downAt: number; upAt: number; }
interface VerificationResult {
  verified: boolean;
  veracityScore: number;
  message: string;
  analysis?: Record<string, unknown>;
}

export default function THSVerification() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  // All hooks must be called before any conditional returns
  const [mouseTrail, setMouseTrail] = useState<MouseSample[]>([]);
  const [keystrokes, setKeystrokes] = useState<KeystrokeSample[]>([]);
  const [typedCommand, setTypedCommand] = useState('');
  const [challengeStart] = useState(Date.now());
  const [phase, setPhase] = useState<'entropy' | 'analyzing' | 'granted' | 'denied'>('entropy');
  const [veracityMeter, setVeracityMeter] = useState(0);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const zoneRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeKeysRef = useRef<Map<string, number>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw mouse trail on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (mouseTrail.length < 2) return;

    ctx.strokeStyle = 'rgba(57, 255, 20, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mouseTrail[0].x, mouseTrail[0].y);
    for (let i = 1; i < mouseTrail.length; i++) {
      ctx.lineTo(mouseTrail[i].x, mouseTrail[i].y);
    }
    ctx.stroke();

    const last = mouseTrail[mouseTrail.length - 1];
    ctx.fillStyle = '#39FF14';
    ctx.shadowColor = '#39FF14';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [mouseTrail]);

  const addEntropySample = useCallback((clientX: number, clientY: number) => {
    const rect = zoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sample: MouseSample = {
      x: clientX - rect.left,
      y: clientY - rect.top,
      t: Date.now(),
    };
    setMouseTrail(prev => {
      const next = [...prev, sample];
      const mouseContrib = Math.min(next.length / 50, 1) * 40;
      setVeracityMeter(() => {
        const keystrokeContrib = Math.min(keystrokes.length / COMMAND.length, 1) * 60;
        return Math.round(mouseContrib + keystrokeContrib);
      });
      return next;
    });
  }, [keystrokes.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    addEntropySample(e.clientX, e.clientY);
  }, [addEntropySample]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) addEntropySample(touch.clientX, touch.clientY);
  }, [addEntropySample]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1 && !activeKeysRef.current.has(e.key)) {
      activeKeysRef.current.set(e.key, Date.now());
    }
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const downAt = activeKeysRef.current.get(e.key);
    if (downAt) {
      activeKeysRef.current.delete(e.key);
      setKeystrokes(prev => {
        const next = [...prev, { key: e.key, downAt, upAt: Date.now() }];
        const keystrokeContrib = Math.min(next.length / COMMAND.length, 1) * 60;
        setVeracityMeter(prev2 => {
          const mouseContrib = Math.min(mouseTrail.length / 50, 1) * 40;
          return Math.round(mouseContrib + keystrokeContrib);
        });
        return next;
      });
    }
  }, [mouseTrail.length]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= COMMAND.length) {
      setTypedCommand(val);
    }
  }, []);

  const submitVerification = useCallback(async () => {
    if (typedCommand !== COMMAND) {
      setError('COMMAND_INCOMPLETE');
      return;
    }
    if (mouseTrail.length < 10) {
      setError('INSUFFICIENT_MOUSE_ENTROPY');
      return;
    }

    setPhase('analyzing');
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-human-signature', {
        body: {
          mouseTrail,
          keystrokes,
          commandString: typedCommand,
          challengeDurationMs: Date.now() - challengeStart,
        },
      });

      if (fnError) {
        setError(fnError.message || 'EDGE_FUNCTION_ERROR');
        setPhase('denied');
        return;
      }

      setResult(data as VerificationResult);
      setPhase(data.verified ? 'granted' : 'denied');
    } catch (err) {
      setError(String(err));
      setPhase('denied');
    }
  }, [typedCommand, mouseTrail, keystrokes, challengeStart]);

  // Auth gates — after all hooks
  if (authLoading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden" style={{ background: '#000' }}>
      {/* Ambient grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.01) 2px, rgba(57,255,20,0.01) 4px)',
        }}
      />

      {/* Header */}
      <div
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-3 z-50"
        style={{ borderBottom: '1px solid rgba(57,255,20,0.15)', fontFamily: MONO }}
      >
        <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: '#FFBF00' }}>
          THE HUMAN SIGNATURE // VERACITY_LAYER_V1
        </span>
        <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(57,255,20,0.4)' }}>
          BEHAVIORAL_ENTROPY_CHALLENGE
        </span>
      </div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {phase === 'entropy' && (
          <motion.div
            key="entropy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-lg w-full"
          >
            {/* Title */}
            <div className="text-center">
              <div className="text-[10px] tracking-[0.5em] uppercase mb-2" style={{ color: '#FFBF00', fontFamily: MONO }}>
                VERIFICATION_ZONE
              </div>
              <div className="text-[8px] tracking-[0.2em] leading-relaxed max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: MONO }}>
                MOVE YOUR CURSOR OR FINGER WITHIN THE ZONE BELOW. THEN TYPE THE COMMAND STRING TO PROVE HUMAN PRESENCE.
              </div>
            </div>

            {/* Mouse entropy zone */}
            <div
              ref={zoneRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative cursor-crosshair touch-none"
              style={{
                width: '100%',
                maxWidth: 280,
                aspectRatio: '1 / 1',
                border: `1px solid ${mouseTrail.length > 20 ? 'rgba(57,255,20,0.4)' : 'rgba(255,191,0,0.3)'}`,
                background: 'rgba(57,255,20,0.02)',
                transition: 'border-color 0.5s',
              }}
            >
              <canvas ref={canvasRef} width={280} height={280} className="absolute inset-0 w-full h-full" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="text-[6px] tracking-[0.3em] uppercase" style={{ color: 'rgba(57,255,20,0.3)', fontFamily: MONO }}>
                  ENTROPY_SENSOR
                </span>
                <span className="text-[6px]" style={{ color: 'rgba(57,255,20,0.3)', fontFamily: MONO }}>
                  {mouseTrail.length} SAMPLES
                </span>
              </div>
            </div>

            {/* Veracity Meter */}
            <div className="w-full max-w-[280px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[7px] tracking-[0.3em] uppercase" style={{ color: '#FFBF00', fontFamily: MONO }}>
                  VERACITY_METER
                </span>
                <span className="text-[8px]" style={{ color: veracityMeter > 60 ? '#39FF14' : '#FFBF00', fontFamily: MONO }}>
                  {veracityMeter}%
                </span>
              </div>
              <div className="h-[3px] w-full" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
                <motion.div
                  className="h-full"
                  style={{
                    background: veracityMeter > 60 ? '#39FF14' : veracityMeter > 30 ? '#FFBF00' : '#FF4444',
                  }}
                  animate={{ width: `${veracityMeter}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Command string input */}
            <div className="w-full max-w-[280px]">
              <div className="text-[7px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: MONO }}>
                COMMAND_STRING: <span style={{ color: '#FFBF00' }}>{COMMAND}</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={typedCommand}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                placeholder="TYPE COMMAND HERE..."
                autoComplete="off"
                spellCheck={false}
                className="w-full py-2 px-3 text-[10px] tracking-[0.2em] uppercase outline-none"
                style={{
                  fontFamily: MONO,
                  color: typedCommand === COMMAND ? '#39FF14' : '#FFBF00',
                  background: 'rgba(57,255,20,0.03)',
                  border: `1px solid ${typedCommand === COMMAND ? 'rgba(57,255,20,0.5)' : 'rgba(255,191,0,0.3)'}`,
                  borderRadius: 0,
                }}
              />
              <div className="flex gap-[2px] mt-1">
                {COMMAND.split('').map((char, i) => (
                  <div
                    key={i}
                    className="h-[2px] flex-1"
                    style={{
                      background: i < typedCommand.length
                        ? typedCommand[i] === char ? '#39FF14' : '#FF4444'
                        : '#1a1a1a',
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-[8px] tracking-[0.2em] uppercase" style={{ color: '#FF4444', fontFamily: MONO }}>
                ERR: {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={submitVerification}
              disabled={typedCommand !== COMMAND || mouseTrail.length < 10}
              className="transition-all disabled:opacity-20"
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '0.3em',
                color: '#39FF14',
                textTransform: 'uppercase',
                border: '1px solid rgba(57,255,20,0.5)',
                background: 'rgba(57,255,20,0.04)',
                padding: '14px 48px',
                cursor: typedCommand === COMMAND && mouseTrail.length >= 10 ? 'pointer' : 'not-allowed',
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                if (typedCommand === COMMAND && mouseTrail.length >= 10) {
                  e.currentTarget.style.background = 'rgba(57,255,20,0.1)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(57,255,20,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(57,255,20,0.04)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              [ SUBMIT_SIGNATURE ]
            </button>
          </motion.div>
        )}

        {phase === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[10px] tracking-[0.5em] uppercase"
              style={{ color: '#FFBF00', fontFamily: MONO }}
            >
              ANALYZING_BEHAVIORAL_ENTROPY...
            </motion.div>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  className="w-1 h-4"
                  style={{ background: '#39FF14' }}
                  animate={{ scaleY: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'granted' && result && (
          <motion.div
            key="granted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 flex flex-col items-center gap-6 px-6"
          >
            <div
              className="flex flex-col items-center gap-4 p-8"
              style={{
                border: '1px solid rgba(57,255,20,0.5)',
                background: 'rgba(57,255,20,0.03)',
                minWidth: 400,
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke="#39FF14" strokeWidth="1" />
                  <motion.path
                    d="M14 24L22 32L34 16"
                    stroke="#39FF14"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  />
                </svg>
              </motion.div>

              <div className="text-[12px] tracking-[0.5em] uppercase" style={{ color: '#39FF14', fontFamily: MONO }}>
                ACCESS GRANTED
              </div>

              <div className="text-[8px] tracking-[0.2em] uppercase" style={{ color: 'rgba(57,255,20,0.6)', fontFamily: MONO }}>
                HUMAN_SIGNATURE_CONFIRMED // VERACITY: {result.veracityScore}%
              </div>

              <div className="w-full my-1" style={{ borderTop: '1px solid rgba(57,255,20,0.15)' }} />

              <div className="text-[7px] tracking-[0.15em] leading-relaxed text-center max-w-sm" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: MONO }}>
                YOUR BIOLOGICAL PRESENCE HAS BEEN CRYPTOGRAPHICALLY VERIFIED. THE NEXUS CORE IS NOW ACCESSIBLE. VERIFICATION VALID FOR 24 HOURS.
              </div>
            </div>

            <a
              href={FALLBACK_NEXUS}
              className="group relative inline-flex items-center justify-center transition-all"
              style={{
                border: '1px solid rgba(57,255,20,0.7)',
                background: 'rgba(57,255,20,0.06)',
                padding: '16px 56px',
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: '0.4em',
                color: '#39FF14',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(57,255,20,0.15)';
                e.currentTarget.style.borderColor = '#39FF14';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(57,255,20,0.2), inset 0 0 20px rgba(57,255,20,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(57,255,20,0.06)';
                e.currentTarget.style.borderColor = 'rgba(57,255,20,0.7)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              [ INITIALIZE_NEXUS_LINK ]
            </a>

            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-[6px] tracking-[0.4em] uppercase"
              style={{ color: '#39FF14', fontFamily: MONO }}
            >
              SOVEREIGN_BRIDGE :: ACTIVE
            </motion.div>
          </motion.div>
        )}

        {phase === 'denied' && (
          <motion.div
            key="denied"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col items-center gap-6 px-6"
          >
            <div
              className="flex flex-col items-center gap-3 p-8"
              style={{
                border: '1px solid rgba(255,68,68,0.5)',
                background: 'rgba(255,68,68,0.03)',
                minWidth: 400,
              }}
            >
              <div className="text-[10px] tracking-[0.5em] uppercase" style={{ color: '#FF4444', fontFamily: MONO }}>
                VERIFICATION FAILED
              </div>
              <div className="text-[8px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,68,68,0.6)', fontFamily: MONO }}>
                {result?.message || error || 'INSUFFICIENT_ENTROPY'}
              </div>
              {result && (
                <div className="text-[7px] tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: MONO }}>
                  VERACITY_SCORE: {result.veracityScore}% // THRESHOLD: 25%
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setPhase('entropy');
                setMouseTrail([]);
                setKeystrokes([]);
                setTypedCommand('');
                setVeracityMeter(0);
                setResult(null);
                setError(null);
              }}
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: '0.3em',
                color: '#FFBF00',
                textTransform: 'uppercase',
                border: '1px solid rgba(255,191,0,0.4)',
                background: 'rgba(255,191,0,0.04)',
                padding: '12px 40px',
                cursor: 'pointer',
                borderRadius: 0,
              }}
            >
              [ RETRY_VERIFICATION ]
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 z-50"
        style={{ borderTop: '1px solid rgba(57,255,20,0.1)', fontFamily: MONO }}
      >
        <span className="text-[7px] tracking-[0.3em]" style={{ color: 'rgba(57,255,20,0.2)' }}>
          /THS/VERIFY // BEHAVIORAL_ENTROPY // V1.0
        </span>
        <span className="text-[7px] tracking-[0.3em]" style={{ color: 'rgba(57,255,20,0.2)' }}>
          AERELION // THE HUMAN SIGNATURE // 2026
        </span>
      </div>
    </div>
  );
}
