# Security Policy — AERELION Systems

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | ✅ Active support  |
| 1.x     | ❌ End of life     |

## Reporting a Vulnerability

If you discover a security vulnerability in AERELION Systems, please report it responsibly:

**Email:** security@aerelion.com  
**Response SLA:** Initial acknowledgment within 48 hours. Status update within 5 business days.

### What to include
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Your contact information (for follow-up)

### What to expect
- We will acknowledge receipt within **48 hours**
- We will provide an initial assessment within **5 business days**
- If accepted, we will coordinate a fix timeline and credit you (if desired)
- If declined, we will provide a rationale

### Scope
- All production endpoints at `*.aerelion.com`
- Client portal, admin panel, and API layer
- Edge Functions and webhook handlers

### Out of Scope
- Third-party services (Stripe, Supabase infrastructure, n8n cloud)
- Social engineering attacks against personnel
- Denial of service attacks

## Security Architecture

AERELION implements a defense-in-depth security model:

1. **Data Transmission**: TLS 1.3 enforced on all connections
2. **Credential Vaulting**: AES-256-GCM encryption via isolated Edge Functions
3. **Zero-Trust Access**: Row Level Security (RLS) + Behavioral Biometrics (THS)
4. **Revocability**: Token revocation capability in under 60 seconds
5. **Audit Trail**: Immutable edge function logging with PII redaction
