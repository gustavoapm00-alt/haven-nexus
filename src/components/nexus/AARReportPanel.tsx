import { useState } from 'react';
import { useAARGenerator } from '@/hooks/useAARGenerator';

const MONO = 'JetBrains Mono, monospace';

const WINDOWS = [
  { label: '6H', hours: 6 },
  { label: '24H', hours: 24 },
  { label: '7D', hours: 168 },
  { label: '30D', hours: 720 },
];

export default function AARReportPanel() {
  const { isGenerating, report, error, generate, reset } = useAARGenerator();
  const [selectedWindow, setSelectedWindow] = useState(24);

  return (
    <section data-aar-panel>
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-[9px] tracking-[0.3em] uppercase"
          style={{ fontFamily: MONO, color: '#FFBF00', opacity: 0.6 }}
        >
          AG-07 // ENVOY // AFTER-ACTION_REPORT
        </h2>
        <div className="flex items-center gap-1">
          {WINDOWS.map((w) => (
            <button
              key={w.hours}
              onClick={() => setSelectedWindow(w.hours)}
              className="text-[7px] tracking-wider uppercase px-2 py-0.5 transition-all"
              style={{
                fontFamily: MONO,
                color: selectedWindow === w.hours ? '#FFBF00' : '#444',
                border: `1px solid ${selectedWindow === w.hours ? 'rgba(255,191,0,0.4)' : '#1a1a1a'}`,
                background: selectedWindow === w.hours ? 'rgba(255,191,0,0.05)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate / Reset controls */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => generate(selectedWindow)}
          disabled={isGenerating}
          className="text-[8px] tracking-[0.2em] uppercase px-4 py-1.5 transition-all"
          style={{
            fontFamily: MONO,
            color: isGenerating ? '#333' : '#FFBF00',
            border: `1px solid ${isGenerating ? '#222' : 'rgba(255,191,0,0.4)'}`,
            background: isGenerating ? '#0a0a0a' : 'transparent',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isGenerating) {
              (e.target as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(255,191,0,0.2)';
              (e.target as HTMLButtonElement).style.background = 'rgba(255,191,0,0.05)';
            }
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.boxShadow = 'none';
            if (!isGenerating) (e.target as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          {isGenerating ? '[GENERATING...]' : '[GENERATE_AAR_REPORT]'}
        </button>
        {report && !isGenerating && (
          <button
            onClick={reset}
            className="text-[8px] tracking-[0.2em] uppercase px-3 py-1.5"
            style={{
              fontFamily: MONO,
              color: '#444',
              border: '1px solid #1a1a1a',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            [CLEAR]
          </button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div
          className="px-3 py-2 mb-3 text-[8px]"
          style={{
            fontFamily: MONO,
            color: '#FF4444',
            border: '1px solid rgba(255,68,68,0.3)',
            background: 'rgba(255,68,68,0.03)',
          }}
        >
          [ERROR] {error}
        </div>
      )}

      {/* Streaming report */}
      {(report || isGenerating) && (
        <div
          className="relative overflow-auto max-h-[500px] px-4 py-3"
          style={{
            background: '#030303',
            border: '1px solid #1a1a1a',
          }}
        >
          {/* Scanline while generating */}
          {isGenerating && (
            <div
              className="absolute top-0 left-0 right-0 h-[2px] animate-pulse"
              style={{ background: 'rgba(255,191,0,0.4)' }}
            />
          )}

          <pre
            className="text-[9px] leading-relaxed whitespace-pre-wrap break-words"
            style={{ fontFamily: MONO, color: '#aaa' }}
          >
            {report || 'INITIALIZING_TELEMETRY_SCAN...'}
          </pre>

          {isGenerating && (
            <span
              className="inline-block w-[6px] h-[10px] animate-pulse ml-0.5"
              style={{ background: '#FFBF00' }}
            />
          )}
        </div>
      )}

      {/* Empty state */}
      {!report && !isGenerating && !error && (
        <div
          className="px-4 py-6 text-center"
          style={{ border: '1px solid #111', background: '#030303' }}
        >
          <p className="text-[8px] uppercase tracking-wider" style={{ fontFamily: MONO, color: '#333' }}>
            SELECT_WINDOW → GENERATE_REPORT
          </p>
          <p className="text-[7px] mt-1" style={{ fontFamily: MONO, color: '#222' }}>
            AG-07 will synthesize agent telemetry into an executive-grade After-Action Report
          </p>
        </div>
      )}
    </section>
  );
}
