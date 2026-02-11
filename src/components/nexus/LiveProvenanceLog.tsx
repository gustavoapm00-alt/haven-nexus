import { ReactElement, CSSProperties } from 'react';
import { List, useListRef } from 'react-window';
import { useEdgeFunctionLogs, type EdgeFunctionLog } from '@/hooks/useEdgeFunctionLogs';

const ROW_HEIGHT = 22;

function levelColor(level: string): string {
  switch (level) {
    case 'error': return '#FF4444';
    case 'warn': return '#FFBF00';
    default: return '#39FF14';
  }
}

function messageColor(msg: string): string {
  const upper = msg.toUpperCase();
  if (upper.includes('SCANNING') || upper.includes('AUDITING')) return '#39FF14';
  if (upper.includes('ENFORCING') || upper.includes('VERIFYING')) return '#FFBF00';
  return '#39FF14';
}

interface LogRowProps {
  logs: EdgeFunctionLog[];
}

function ProvenanceRow({
  index,
  style,
  logs,
}: {
  ariaAttributes: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
  index: number;
  style: CSSProperties;
} & LogRowProps): ReactElement | null {
  const log = logs[index];
  if (!log) return null;

  const agentId =
    log.function_name === 'agent-heartbeat' && log.details
      ? (log.details as Record<string, string>).agent_id || 'SYS'
      : null;

  const isDrift =
    log.level === 'error' ||
    log.level === 'warn' ||
    log.message.toUpperCase().includes('DRIFT');

  return (
    <div
      style={{
        ...style,
        fontFamily: 'JetBrains Mono, monospace',
        opacity: index <= 5 ? 1 : index <= 15 ? 0.6 : 0.35,
      }}
      className="flex items-center gap-3 text-[9px] leading-none px-4 hover:bg-white/[0.02] transition-colors"
    >
      <span style={{ color: '#333', minWidth: 135, flexShrink: 0 }}>
        {new Date(log.created_at).toISOString().replace('T', ' ').slice(0, 19)}
      </span>
      <span className="uppercase" style={{ color: levelColor(log.level), minWidth: 36, flexShrink: 0 }}>
        {log.level}
      </span>
      {agentId && (
        <span
          className="uppercase font-bold"
          style={{ color: isDrift ? '#FFBF00' : '#39FF14', minWidth: 48, flexShrink: 0, opacity: 0.7 }}
        >
          [{agentId}]
        </span>
      )}
      <span style={{ color: '#FFBF00', minWidth: 130, flexShrink: 0, opacity: 0.5 }}>
        {log.function_name}
      </span>
      <span className="truncate" style={{ color: messageColor(log.message), flex: 1, opacity: 0.6 }}>
        // {log.message}
      </span>
      {log.status_code != null && (
        <span style={{ color: log.status_code >= 400 ? '#FF4444' : '#333', flexShrink: 0 }}>
          [{log.status_code}]
        </span>
      )}
    </div>
  );
}

export default function LiveProvenanceLog() {
  const { logs, isLoading, stats } = useEdgeFunctionLogs({ limit: 1000 });
  const listRef = useListRef();

  return (
    <section className="px-4 py-2">
      <style>{`
        .nexus-log-scroll::-webkit-scrollbar { width: 1px; }
        .nexus-log-scroll::-webkit-scrollbar-track { background: transparent; }
        .nexus-log-scroll::-webkit-scrollbar-thumb { background: #39FF14; }
        .nexus-log-scroll { scrollbar-width: thin; scrollbar-color: #39FF14 transparent; }
      `}</style>

      <div className="flex items-center justify-between mb-1">
        <h2
          className="text-[8px] tracking-[0.3em] uppercase"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.5 }}
        >
          GLOBAL_PROVENANCE_TRAIL // VIRTUALIZED_FEED
        </h2>
        <div className="flex items-center gap-4">
          <span
            className="text-[7px] tracking-wider uppercase"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.3 }}
          >
            {stats.total} EVENTS
          </span>
          {stats.errors > 0 && (
            <span
              className="text-[7px] tracking-wider uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#FF4444', opacity: 0.5 }}
            >
              {stats.errors} ERR
            </span>
          )}
          <span
            className="text-[8px] animate-pulse uppercase"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.4 }}
          >
            LIVE_SYNC
          </span>
        </div>
      </div>

      {isLoading ? (
        <p
          className="text-[9px] animate-pulse uppercase py-4"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.4 }}
        >
          LOADING_PROVENANCE_STREAM...
        </p>
      ) : logs.length === 0 ? (
        <p
          className="text-[9px] uppercase py-4"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#39FF14', opacity: 0.2 }}
        >
          NO_ENTRIES // AWAITING_SIGNAL
        </p>
      ) : (
        <List
          listRef={listRef}
          rowComponent={ProvenanceRow}
          rowCount={logs.length}
          rowHeight={ROW_HEIGHT}
          rowProps={{ logs }}
          className="nexus-log-scroll"
          style={{ height: 160, background: 'transparent' }}
        />
      )}
    </section>
  );
}
