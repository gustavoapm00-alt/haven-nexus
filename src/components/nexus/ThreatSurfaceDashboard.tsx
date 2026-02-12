import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const MONO = 'JetBrains Mono, monospace';

interface ThreatEntry {
  type: 'shadow_it' | 'unverified_cred' | 'expired_oauth' | 'orphaned_mapping';
  label: string;
  detail: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
}

export default function ThreatSurfaceDashboard() {
  const [threats, setThreats] = useState<ThreatEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scan = async () => {
      setLoading(true);
      const found: ThreatEntry[] = [];

      // 1. Unverified credentials
      const { data: creds } = await supabase
        .from('activation_credentials')
        .select('id, service_name, status, created_at, last_verified_at')
        .eq('status', 'active')
        .is('last_verified_at', null)
        .limit(20);

      (creds || []).forEach((c) => {
        found.push({
          type: 'unverified_cred',
          label: `UNVERIFIED: ${c.service_name}`,
          detail: `Credential ${c.id.slice(0, 8)} active but never verified`,
          severity: 'high',
          timestamp: c.created_at,
        });
      });

      // 2. Expired OAuth connections
      const { data: oauths } = await supabase
        .from('integration_connections')
        .select('id, provider, status, expires_at, connected_email')
        .not('expires_at', 'is', null)
        .lt('expires_at', new Date().toISOString())
        .limit(20);

      (oauths || []).forEach((o) => {
        found.push({
          type: 'expired_oauth',
          label: `EXPIRED_OAUTH: ${o.provider}`,
          detail: `${o.connected_email || 'unknown'} — token expired ${o.expires_at?.slice(0, 10)}`,
          severity: 'medium',
          timestamp: o.expires_at || '',
        });
      });

      // 3. Orphaned n8n mappings (error state)
      const { data: mappings } = await supabase
        .from('n8n_mappings')
        .select('id, status, error_message, created_at')
        .eq('status', 'error')
        .limit(20);

      (mappings || []).forEach((m) => {
        found.push({
          type: 'orphaned_mapping',
          label: 'ORPHANED_MAPPING',
          detail: m.error_message || `Mapping ${m.id.slice(0, 8)} in error state`,
          severity: 'medium',
          timestamp: m.created_at,
        });
      });

      // 4. Shadow IT — integrations with unknown/unusual providers
      const { data: integrations } = await supabase
        .from('client_integrations')
        .select('id, provider, status, created_at')
        .not('status', 'eq', 'active')
        .limit(20);

      (integrations || []).forEach((i) => {
        found.push({
          type: 'shadow_it',
          label: `SHADOW_IT: ${i.provider}`,
          detail: `Integration ${i.id.slice(0, 8)} status: ${i.status}`,
          severity: 'low',
          timestamp: i.created_at || '',
        });
      });

      found.sort((a, b) => {
        const sev = { high: 0, medium: 1, low: 2 };
        return sev[a.severity] - sev[b.severity];
      });

      setThreats(found);
      setLoading(false);
    };

    scan();
  }, []);

  const sevColors = { high: '#FF4444', medium: '#FFBF00', low: '#555' };
  const highCount = threats.filter((t) => t.severity === 'high').length;
  const medCount = threats.filter((t) => t.severity === 'medium').length;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-[9px] tracking-[0.3em] uppercase"
          style={{ fontFamily: MONO, color: highCount > 0 ? '#FF4444' : '#39FF14', opacity: 0.6 }}
        >
          AG-05 // AUDITOR // THREAT_SURFACE_DASHBOARD
        </h2>
        <div className="flex items-center gap-2">
          {[
            { label: 'HIGH', count: highCount, color: '#FF4444' },
            { label: 'MED', count: medCount, color: '#FFBF00' },
            { label: 'TOTAL', count: threats.length, color: '#39FF14' },
          ].map((s) => (
            <span
              key={s.label}
              className="text-[7px] px-1.5 py-0.5"
              style={{
                fontFamily: MONO,
                color: s.count > 0 ? s.color : '#222',
                border: `1px solid ${s.count > 0 ? s.color + '40' : '#111'}`,
              }}
            >
              {s.label}: {s.count}
            </span>
          ))}
        </div>
      </div>

      <div style={{ background: '#030303', border: '1px solid #1a1a1a' }}>
        {loading ? (
          <div className="py-6 text-center">
            <span className="text-[8px] uppercase animate-pulse" style={{ fontFamily: MONO, color: '#333' }}>
              SCANNING_THREAT_SURFACE...
            </span>
          </div>
        ) : threats.length === 0 ? (
          <div className="py-6 text-center">
            <span className="text-[8px] uppercase" style={{ fontFamily: MONO, color: '#1a1a1a' }}>
              CLEAN_SURFACE — NO_THREATS_DETECTED
            </span>
          </div>
        ) : (
          <div className="max-h-[250px] overflow-auto">
            {threats.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-1.5"
                style={{ borderBottom: '1px solid #0a0a0a' }}
              >
                <span
                  className="flex-shrink-0 w-1.5 h-1.5"
                  style={{ background: sevColors[t.severity], borderRadius: '50%' }}
                />
                <span className="text-[7px] flex-shrink-0 uppercase" style={{ fontFamily: MONO, color: sevColors[t.severity] }}>
                  {t.severity}
                </span>
                <span className="text-[7px] flex-shrink-0" style={{ fontFamily: MONO, color: '#666' }}>
                  {t.label}
                </span>
                <span className="text-[7px] truncate flex-1" style={{ fontFamily: MONO, color: '#444' }}>
                  {t.detail}
                </span>
                <span className="text-[6px] flex-shrink-0" style={{ fontFamily: MONO, color: '#222' }}>
                  {t.timestamp?.slice(0, 10)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
