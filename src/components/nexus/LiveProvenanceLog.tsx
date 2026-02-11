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

  return (
    <section>
      <h2
        className="text-xs tracking-[0.3em] mb-4"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14' }}
      >
        LIVE_PROVENANCE // TERMINAL_FEED
      </h2>

      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{
          background: '#0A0A0A',
          border: '1px solid #39FF14',
          borderRadius: 0,
          height: 360,
          padding: '12px 16px',
        }}
      >
        {isLoading && (
          <p
            className="text-xs animate-pulse"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14' }}
          >
            LOADING_FEED...
          </p>
        )}

        {!isLoading && logs.length === 0 && (
          <p
            className="text-xs opacity-40"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14' }}
          >
            NO_ENTRIES // AWAITING_SIGNAL
          </p>
        )}

        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 text-[11px] leading-relaxed mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span style={{ color: '#555', minWidth: 150, flexShrink: 0 }}>
              {new Date(log.created_at).toISOString().replace('T', ' ').slice(0, 19)}
            </span>
            <span
              className="uppercase"
              style={{ color: levelColor(log.level), minWidth: 42, flexShrink: 0 }}
            >
              {log.level}
            </span>
            <span style={{ color: '#FFBF00', minWidth: 160, flexShrink: 0 }}>
              {log.function_name}
            </span>
            <span style={{ color: '#39FF14', flex: 1 }}>
              {log.message}
            </span>
            {log.status_code != null && (
              <span style={{ color: log.status_code >= 400 ? '#FF4444' : '#555', flexShrink: 0 }}>
                [{log.status_code}]
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
