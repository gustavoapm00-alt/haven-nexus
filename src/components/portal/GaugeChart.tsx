import { motion } from 'framer-motion';

const MONO = 'JetBrains Mono, monospace';

interface Props {
  label: string;
  percent: number;
  detail?: string;
  size?: number;
}

export default function GaugeChart({ label, percent, detail, size = 96 }: Props) {
  const capped = Math.min(100, Math.max(0, percent));
  const isAmber = capped > 80;
  const isRed = capped > 95;
  const color = isRed ? '#FF4444' : isAmber ? '#FFBF00' : '#39FF14';

  // SVG arc math
  const r = 36;
  const cx = size / 2;
  const cy = size / 2 + 8;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const fillAngle = startAngle + (capped / 100) * totalAngle;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const bgEnd = { x: cx + r * Math.cos(toRad(endAngle)), y: cy + r * Math.sin(toRad(endAngle)) };
  const bgStart = { x: cx + r * Math.cos(toRad(startAngle)), y: cy + r * Math.sin(toRad(startAngle)) };
  const fgEnd = { x: cx + r * Math.cos(toRad(fillAngle)), y: cy + r * Math.sin(toRad(fillAngle)) };

  const bgArcLarge = totalAngle > 180 ? 1 : 0;
  const fgArcLarge = (capped / 100) * totalAngle > 180 ? 1 : 0;

  const bgD = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${bgArcLarge} 1 ${bgEnd.x} ${bgEnd.y}`;
  const fgD = capped > 0
    ? `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${fgArcLarge} 1 ${fgEnd.x} ${fgEnd.y}`
    : '';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.8} viewBox={`0 0 ${size} ${size * 0.8}`}>
        {/* Background arc */}
        <path
          d={bgD}
          fill="none"
          stroke="#111"
          strokeWidth={5}
          strokeLinecap="butt"
        />
        {/* Glow ring */}
        {capped > 0 && (
          <path
            d={fgD}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="butt"
            opacity={0.2}
            style={{ filter: `blur(4px)` }}
          />
        )}
        {/* Fill arc */}
        {capped > 0 && (
          <motion.path
            d={fgD}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="butt"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        )}
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const tickAngle = startAngle + (tick / 100) * totalAngle;
          const inner = r - 6;
          const outer = r + 2;
          const x1 = cx + inner * Math.cos(toRad(tickAngle));
          const y1 = cy + inner * Math.sin(toRad(tickAngle));
          const x2 = cx + outer * Math.cos(toRad(tickAngle));
          const y2 = cy + outer * Math.sin(toRad(tickAngle));
          return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1e1e1e" strokeWidth={1} />;
        })}
        {/* Center readout */}
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fill={color}
          fontSize={11}
          fontFamily={MONO}
          fontWeight="500"
        >
          {capped.toFixed(0)}%
        </text>
      </svg>
      <div className="text-center -mt-1">
        <p className="text-[6px] tracking-[0.2em] uppercase" style={{ fontFamily: MONO, color: '#444' }}>
          {label}
        </p>
        {detail && (
          <p className="text-[6px] mt-0.5" style={{ fontFamily: MONO, color: '#2a2a2a' }}>
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
