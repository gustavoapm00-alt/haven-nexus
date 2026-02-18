import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const MONO = 'JetBrains Mono, monospace';

interface LogEntry {
  id: string;
  created_at: string;
  function_name: string;
  level: string;
  message: string;
  details: Record<string, unknown> | null;
}

// Filter tags for non-operational noise
const NOISE_PATTERNS = ['stripe', 'auth', 'check-subscription', 'customer-portal'];

function isNoise(entry: LogEntry) {
  return NOISE_PATTERNS.some(p => entry.function_name.toLowerCase().includes(p) || entry.message.toLowerCase().includes(p));
}

function levelColor(level: string) {
  if (level === 'error') return '#FF4444';
  if (level === 'warn') return '#FFBF00';
  return '#39FF14';
}

function formatTs(ts: string) {
  return new Date(ts).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

export default function CapabilityHistoryLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    const { data } = await (supabase as any)
      .from('edge_function_logs')
      .select('id, created_at, function_name, level, message, details')
      .in('function_name', [
        'vps-orchestrator', 'hostinger-provision', 'hostinger-metrics',
        'hostinger-credentials', 'agent-heartbeat', 'deploy-agent-workflows',
        'agent-auto-heal',
      ])
      .order('created_at', { ascending: false })
      .limit(80);

    const filtered = ((data ?? []) as LogEntry[]).filter(e => !isNoise(e)).reverse();
    setLogs(filtered);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    // Real-time subscription
    const channel = supabase
      .channel('capability-log-stream')
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'edge_function_logs' },
        (payload) => {
          const entry = payload.new as LogEntry;
          if (isNoise(entry)) return;
          if (!['vps-orchestrator','hostinger-provision','hostinger-metrics','hostinger-credentials','agent-heartbeat','deploy-agent-workflows','agent-auto-heal'].includes(entry.function_name)) return;
          setLogs(prev => [...prev.slice(-79), entry]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: '#020202', border: '1px solid rgba(57,255,20,0.08)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid rgba(57,255,20,0.07)' }}
      >
        <div>
          <p className="text-[7px] tracking-[0.3em] uppercase" style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.4 }}>
            CAPABILITY_HISTORY // RADICAL_TRANSPARENCY
          </p>
          <p className="text-[6px] tracking-wider uppercase mt-0.5" style={{ fontFamily: MONO, color: '#2a2a2a' }}>
            OPERATIONAL_PROVENANCE // IMMUTABLE_AUDIT_LOG
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <motion.div
              className="w-2 h-2 border-t"
              style={{ borderColor: '#39FF14', borderWidth: '1px', borderRadius: '50%' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          )}
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: '#39FF14' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Log terminal */}
      <div
        className="overflow-y-auto px-4 py-3 space-y-1"
        style={{ maxHeight: '280px', scrollbarWidth: 'thin', scrollbarColor: '#1a1a1a transparent' }}
      >
        {logs.length === 0 && !isLoading && (
          <p className="text-[8px] tracking-widest uppercase" style={{ fontFamily: MONO, color: '#1a1a1a' }}>
            NO_LOG_ENTRIES — AWAITING_FIRST_CRON_CYCLE...
          </p>
        )}

        {logs.map((entry) => (
          <motion.div
            key={entry.id}
            className="flex gap-3 items-start"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <code className="text-[6px] shrink-0 tabular-nums mt-0.5" style={{ fontFamily: MONO, color: '#2a2a2a' }}>
              {formatTs(entry.created_at)}
            </code>
            <code
              className="text-[6px] shrink-0 uppercase tracking-wider"
              style={{ fontFamily: MONO, color: levelColor(entry.level), minWidth: '36px' }}
            >
              [{entry.level.toUpperCase()}]
            </code>
            <code className="text-[6px] shrink-0 uppercase" style={{ fontFamily: MONO, color: '#333', minWidth: '80px' }}>
              {entry.function_name}
            </code>
            <code className="text-[6px] leading-relaxed break-all" style={{ fontFamily: MONO, color: '#444' }}>
              {entry.message}
            </code>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Footer watermark */}
      <div
        className="px-4 py-1.5 flex items-center justify-between"
        style={{ borderTop: '1px solid #0a0a0a' }}
      >
        <p className="text-[6px] tracking-[0.3em] uppercase" style={{ fontFamily: MONO, color: '#1a1a1a' }}>
          AERELION // SYS.OPS.V2.06
        </p>
        <code className="text-[6px]" style={{ fontFamily: MONO, color: '#1a1a1a' }}>
          {logs.length} ENTRIES LOADED
        </code>
      </div>
    </div>
  );
}
