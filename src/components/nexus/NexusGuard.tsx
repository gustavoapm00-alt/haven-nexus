import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTHSVerification } from '@/hooks/useTHSVerification';
import { motion } from 'framer-motion';

const THS_AUTHORIZE_URL = 'https://preview--human-veracity-layer.lovable.app/';

function THSLockedOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: '#000000' }}>
      {/* Scanline effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.015) 2px, rgba(57,255,20,0.015) 4px)',
        }}
      />

      {/* Centered AERELION watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center" style={{ opacity: 0.03 }}>
        <svg width="480" height="480" viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="240,40 420,140 420,340 240,440 60,340 60,140" stroke="#39FF14" strokeWidth="1" fill="none" />
          <polygon points="240,100 370,170 370,310 240,380 110,310 110,170" stroke="#39FF14" strokeWidth="0.5" fill="none" />
          <text x="240" y="250" textAnchor="middle" fill="#39FF14" fontFamily="JetBrains Mono, monospace" fontSize="14" letterSpacing="8">AERELION</text>
        </svg>
      </div>

      {/* Version watermark top */}
      <div
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-3"
        style={{
          borderBottom: '1px solid rgba(57,255,20,0.15)',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: '#FFBF00' }}>
          AERELION // SYS.OPS.V3.00 // GHOST_OPERATOR
        </span>
        <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(57,255,20,0.4)' }}>
          THS_VERACITY_LAYER
        </span>
      </div>

      {/* Central terminal content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-8 px-6"
      >
        {/* Status block */}
        <div
          className="flex flex-col items-center gap-3 p-8"
          style={{
            border: '1px solid rgba(255,191,0,0.3)',
            background: 'rgba(255,191,0,0.02)',
            minWidth: 420,
          }}
        >
          <div
            className="text-[10px] tracking-[0.5em] uppercase"
            style={{ color: '#FFBF00', fontFamily: 'JetBrains Mono, monospace' }}
          >
            STATUS: ACCESS_RESTRICTED
          </div>
          <div
            className="text-[9px] tracking-[0.3em] uppercase"
            style={{ color: 'rgba(255,191,0,0.6)', fontFamily: 'JetBrains Mono, monospace' }}
          >
            HUMAN_SIGNATURE_REQUIRED
          </div>

          {/* Divider */}
          <div className="w-full my-2" style={{ borderTop: '1px solid rgba(57,255,20,0.1)' }} />

          <div
            className="text-[8px] tracking-[0.2em] leading-relaxed text-center max-w-[360px]"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}
          >
            THE GHOST OPERATOR REQUIRES BIOLOGICAL VERIFICATION VIA THE HUMAN SIGNATURE ($THS) PROTOCOL.
            AUTHENTICATE YOUR PRESENCE TO INITIALIZE THE NEXUS CORE.
          </div>
        </div>

        {/* Authorize button */}
        <a
          href={THS_AUTHORIZE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center justify-center transition-all"
          style={{
            border: '1px solid rgba(57,255,20,0.5)',
            background: 'rgba(57,255,20,0.04)',
            padding: '14px 48px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.3em',
            color: '#39FF14',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(57,255,20,0.1)';
            e.currentTarget.style.borderColor = '#39FF14';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(57,255,20,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(57,255,20,0.04)';
            e.currentTarget.style.borderColor = 'rgba(57,255,20,0.5)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          [ AUTHORIZE_VIA_THS ]
        </a>

        {/* Pulse indicator */}
        <motion.div
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-[7px] tracking-[0.4em] uppercase"
          style={{ color: '#39FF14', fontFamily: 'JetBrains Mono, monospace' }}
        >
          AWAITING_HANDSHAKE...
        </motion.div>
      </motion.div>

      {/* Bottom watermark */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3"
        style={{
          borderTop: '1px solid rgba(57,255,20,0.1)',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        <span className="text-[7px] tracking-[0.3em]" style={{ color: 'rgba(57,255,20,0.2)' }}>
          /NEXUS/CMD // THS_GATE // DOCTRINE_V3
        </span>
        <span className="text-[7px] tracking-[0.3em]" style={{ color: 'rgba(57,255,20,0.2)' }}>
          AERELION // 2026
        </span>
      </div>
    </div>
  );
}

export default function NexusGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { isVerified, isLoading: thsLoading } = useTHSVerification(user?.id);

  // Auth still resolving
  if (authLoading) return null;

  // Not authenticated or not admin → silent redirect
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  // THS still resolving → minimal loading state
  if (thsLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#000000' }}>
        <div
          className="text-[9px] tracking-[0.4em] uppercase"
          style={{ color: 'rgba(57,255,20,0.4)', fontFamily: 'JetBrains Mono, monospace' }}
        >
          INITIALIZING_GHOST_SUBSTRATE...
        </div>
      </div>
    );
  }

  // THS not verified → locked overlay
  if (!isVerified) {
    return <THSLockedOverlay />;
  }

  // Fully authorized → render Nexus
  return <>{children}</>;
}
