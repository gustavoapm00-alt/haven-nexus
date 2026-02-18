import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Copy, Check, Terminal, Key, Lock, Shield } from 'lucide-react';

const MONO = 'JetBrains Mono, monospace';

interface CredentialData {
  instance_id: string;
  ip_address: string | null;
  hostname: string | null;
  first_view: boolean;
  ssh: { private_key: string; public_key: string } | null;
  n8n: { url: string; username: string; password: string } | null;
}

interface Props {
  instanceId: string;
  onClose: () => void;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 px-2 py-0.5 shrink-0 transition-colors"
      style={{
        fontFamily: MONO,
        fontSize: '7px',
        color: copied ? '#39FF14' : '#444',
        border: `1px solid ${copied ? 'rgba(57,255,20,0.3)' : '#1a1a1a'}`,
        background: 'transparent',
        cursor: 'pointer',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}
    >
      {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
      {copied ? 'COPIED' : 'COPY'}
    </button>
  );
}

function CredentialRow({
  label,
  value,
  secret = false,
  monospace = true,
}: {
  label: string;
  value: string;
  secret?: boolean;
  monospace?: boolean;
}) {
  const [revealed, setRevealed] = useState(!secret);
  const display = !revealed ? '••••••••••••••••' : value;

  return (
    <div className="mb-3" style={{ borderBottom: '1px solid #0a0a0a', paddingBottom: '10px' }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[7px] tracking-[0.2em] uppercase" style={{ fontFamily: MONO, color: '#444' }}>
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {secret && (
            <button
              onClick={() => setRevealed(r => !r)}
              className="flex items-center gap-0.5 px-1.5 py-0.5"
              style={{ fontFamily: MONO, fontSize: '7px', color: '#555', border: '1px solid #1a1a1a', background: 'transparent', cursor: 'pointer', letterSpacing: '0.15em', textTransform: 'uppercase' }}
            >
              {revealed ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
              {revealed ? 'HIDE' : 'REVEAL'}
            </button>
          )}
          <CopyButton value={value} label={label} />
        </div>
      </div>
      <div
        className="w-full px-2 py-1.5 overflow-x-auto"
        style={{
          background: '#030303',
          border: '1px solid #111',
          maxHeight: value.length > 200 ? '80px' : 'auto',
          overflowY: value.length > 200 ? 'auto' : 'hidden',
        }}
      >
        <code
          className="text-[8px] break-all whitespace-pre-wrap"
          style={{
            fontFamily: monospace ? MONO : 'inherit',
            color: revealed ? '#39FF14' : '#333',
            opacity: revealed ? 1 : 0.8,
          }}
        >
          {display}
        </code>
      </div>
    </div>
  );
}

export default function CredentialDrawer({ instanceId, onClose }: Props) {
  const [data, setData] = useState<CredentialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await supabase.functions.invoke('hostinger-credentials', {
          body: { instance_id: instanceId },
        });
        if (res.error) throw new Error(res.error.message);
        setData(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'CREDENTIAL_LOAD_ERROR');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [instanceId]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.85)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <motion.div
        className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-hidden"
        style={{
          width: 'min(540px, 100vw)',
          background: '#020202',
          borderLeft: '1px solid rgba(57,255,20,0.15)',
        }}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.28 }}
      >
        {/* Scanline overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.012) 2px, rgba(57,255,20,0.012) 4px)',
            zIndex: 0,
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0 relative z-10"
          style={{ borderBottom: '1px solid rgba(57,255,20,0.12)' }}
        >
          <div>
            <p className="text-[7px] tracking-[0.3em] uppercase mb-0.5" style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.5 }}>
              SECURE_CREDENTIAL_VAULT // ONE-TIME ACCESS
            </p>
            <div className="flex items-center gap-2">
              <Key className="w-3 h-3" style={{ color: '#39FF14' }} />
              <h3 className="text-xs tracking-widest uppercase" style={{ fontFamily: MONO, color: '#e0e0e0', fontWeight: 500 }}>
                NODE_CREDENTIALS
              </h3>
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: '#39FF14' }}
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] tracking-widest px-3 py-1.5 uppercase transition-colors"
            style={{ fontFamily: MONO, color: '#444', border: '1px solid #1a1a1a', background: 'transparent', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#39FF14'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(57,255,20,0.3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#444'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#1a1a1a'; }}
          >
            [ CLOSE ]
          </button>
        </div>

        {/* Watermark */}
        <div className="px-5 py-2 shrink-0 relative z-10" style={{ borderBottom: '1px solid #0a0a0a', background: '#020202' }}>
          <p className="text-[6px] tracking-[0.35em] uppercase" style={{ fontFamily: MONO, color: '#1e1e1e' }}>
            AERELION // SYS.OPS.V2.06 // AES-256-GCM ENCRYPTED // CREDENTIAL_REF: {instanceId.slice(0, 12).toUpperCase()}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto relative z-10">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <motion.div
                className="w-5 h-5 border-t"
                style={{ borderColor: '#39FF14', borderWidth: '1px', borderRadius: '50%' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-[8px] tracking-widest uppercase" style={{ fontFamily: MONO, color: '#333' }}>
                DECRYPTING_VAULT...
              </p>
            </div>
          )}

          {error && (
            <div className="p-5">
              <div className="p-3" style={{ border: '1px solid rgba(255,68,68,0.3)', background: 'rgba(255,68,68,0.04)' }}>
                <p className="text-[8px] tracking-wider uppercase" style={{ fontFamily: MONO, color: '#FF4444' }}>
                  VAULT_ACCESS_ERROR: {error}
                </p>
              </div>
            </div>
          )}

          {data && !error && (
            <div className="p-5 space-y-4">
              {/* First-view warning */}
              {data.first_view && !acknowledged && (
                <motion.div
                  className="p-3 mb-4"
                  style={{ border: '1px solid rgba(255,191,0,0.4)', background: 'rgba(255,191,0,0.04)' }}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Shield className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#FFBF00' }} />
                    <p className="text-[8px] tracking-wider uppercase" style={{ fontFamily: MONO, color: '#FFBF00' }}>
                      FIRST ACCESS DETECTED — SAVE CREDENTIALS SECURELY BEFORE CLOSING
                    </p>
                  </div>
                  <p className="text-[7px] leading-relaxed mb-3" style={{ fontFamily: MONO, color: '#555' }}>
                    These credentials will continue to be accessible for 60 days but this is their first reveal. Store SSH keys in a secure vault immediately.
                  </p>
                  <button
                    onClick={() => setAcknowledged(true)}
                    className="text-[8px] tracking-widest uppercase px-3 py-1.5 w-full transition-colors"
                    style={{ fontFamily: MONO, color: '#FFBF00', border: '1px solid rgba(255,191,0,0.3)', background: 'rgba(255,191,0,0.05)', cursor: 'pointer' }}
                  >
                    [ I HAVE SECURED A BACKUP — PROCEED ]
                  </button>
                </motion.div>
              )}

              {(acknowledged || !data.first_view) && (
                <>
                  {/* Node Identity */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Terminal className="w-3 h-3" style={{ color: '#39FF14', opacity: 0.5 }} />
                      <span className="text-[8px] tracking-[0.25em] uppercase" style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.5 }}>
                        NODE_IDENTITY
                      </span>
                    </div>
                    <CredentialRow label="IP_ADDRESS" value={data.ip_address ?? 'PENDING'} />
                    <CredentialRow label="HOSTNAME" value={data.hostname ?? 'PENDING'} />
                    <CredentialRow label="SSH_CONNECT_CMD" value={`ssh root@${data.ip_address ?? '<IP>'}`} />
                  </div>

                  {/* SSH Credentials */}
                  {data.ssh && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Key className="w-3 h-3" style={{ color: '#39FF14', opacity: 0.5 }} />
                        <span className="text-[8px] tracking-[0.25em] uppercase" style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.5 }}>
                          SSH_CREDENTIALS
                        </span>
                      </div>
                      <CredentialRow label="SSH_PRIVATE_KEY" value={data.ssh.private_key} secret />
                      <CredentialRow label="SSH_PUBLIC_KEY" value={data.ssh.public_key} />
                    </div>
                  )}

                  {/* n8n Credentials */}
                  {data.n8n && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Lock className="w-3 h-3" style={{ color: '#39FF14', opacity: 0.5 }} />
                        <span className="text-[8px] tracking-[0.25em] uppercase" style={{ fontFamily: MONO, color: '#39FF14', opacity: 0.5 }}>
                          N8N_INSTANCE_CREDENTIALS
                        </span>
                      </div>
                      {data.n8n.url && <CredentialRow label="N8N_URL" value={data.n8n.url} />}
                      <CredentialRow label="N8N_USERNAME" value={data.n8n.username} />
                      <CredentialRow label="N8N_PASSWORD" value={data.n8n.password} secret />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 shrink-0 flex items-center justify-between relative z-10"
          style={{ borderTop: '1px solid #0a0a0a' }}
        >
          <p className="text-[6px] tracking-[0.3em] uppercase" style={{ fontFamily: MONO, color: '#1e1e1e' }}>
            AES-256-GCM // ZERO_PLAINTEXT_STORAGE
          </p>
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#39FF14' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
