import { useRef, useEffect } from 'react';
import { useEdgeFunctionLogs } from '@/hooks/useEdgeFunctionLogs';

export default function LiveProvenanceLog() {
  const { logs, isLoading } = useEdgeFunctionLogs({ limit: 50 });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const levelColor = (level: string) => {
    switch (level) {
      case 'error': return '#FF4444';
      case 'warn': return '#FFBF00';
      default: return '#39FF14';
    }
  };

  const messageColor = (msg: string) => {
    const upper = msg.toUpperCase();
    if (upper.includes('SCANNING') || upper.includes('AUDITING')) return '#39FF14';
    if (upper.includes('ENFORCING') || upper.includes('VERIFYING')) return '#FFBF00';
    return '#39FF14';
  };

  return (
    <section className="px-4 py-2">
      <style>{`
        .nexus-log-scroll::-webkit-scrollbar { width: 1px; }
        .nexus-log-scroll::-webkit-scrollbar-track { background: transparent; }
        .nexus-log-scroll::-webkit-scrollbar-thumb { background: #39FF14; }
        .nexus-log-scroll { scrollbar-width: thin; scrollbar-color: #39FF14 transparent; }
      `}</style>

      <h2
        className="text-[8px] tracking-[0.3em] mb-1 uppercase"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.5 }}
      >
        LIVE_PROVENANCE // TERMINAL_FEED
      </h2>

      <div
        ref={scrollRef}
        className="overflow-y-auto nexus-log-scroll"
        style={{ background: 'transparent', height: 160 }}
      >
        {isLoading && (
          <p
            className="text-[9px] animate-pulse uppercase"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.4 }}
          >
            LOADING_FEED...
          </p>
        )}

        {!isLoading && logs.length === 0 && (
          <p
            className="text-[9px] uppercase"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.2 }}
          >
            NO_ENTRIES // AWAITING_SIGNAL
          </p>
        )}

        {logs.map((log, index) => {
          const total = logs.length;
          // Ghosting: older logs fade to 30% opacity
          const age = total - index; // 1 = newest
          const opacity = age <= 5 ? 1 : age <= 15 ? 0.6 : 0.3;

          return (
            <div
              key={log.id}
              className="flex gap-3 text-[9px] leading-relaxed mb-px transition-opacity duration-500"
              style={{ fontFamily: 'JetBrains Mono, monospace', opacity }}
            >
              <span style={{ color: '#333', minWidth: 135, flexShrink: 0 }}>
                {new Date(log.created_at).toISOString().replace('T', ' ').slice(0, 19)}
              </span>
              <span
                className="uppercase"
                style={{ color: levelColor(log.level), minWidth: 36, flexShrink: 0 }}
              >
                {log.level}
              </span>
              <span style={{ color: '#FFBF00', minWidth: 140, flexShrink: 0, opacity: 0.7 }}>
                {log.function_name}
              </span>
              <span style={{ color: messageColor(log.message), flex: 1, opacity: 0.6 }}>
                {log.function_name === 'agent-heartbeat' && log.details
                  ? `[${(log.details as Record<string, string>).agent_id || 'SYS'}] // ${log.message}`
                  : log.message}
              </span>
              {log.status_code != null && (
                <span style={{ color: log.status_code >= 400 ? '#FF4444' : '#333', flexShrink: 0 }}>
                  [{log.status_code}]
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
