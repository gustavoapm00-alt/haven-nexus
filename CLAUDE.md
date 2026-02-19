# CLAUDE.md — AERELION Systems Project DNA

> Single source of truth for AI-assisted development sessions.
> All code changes must pass the acceptance criteria defined here.

---

## 1. What This System Is

**AERELION Systems** is a B2B managed automation operator.
We host, configure, and maintain n8n automations on behalf of clients.
Clients interact via a branded portal — they never access n8n or infrastructure directly.

**This is not a Go/Rust/Firecracker/NATS/eBPF system.**
The actual stack is: React 18 + TypeScript + Vite · Supabase (PostgreSQL + Edge Functions / Deno) · n8n (self-hosted) · Hostinger VPS · Stripe.

---

## 2. Actual Architecture

```
Browser (React SPA)
  └─ Supabase Auth (JWT)
  └─ Supabase Edge Functions (TypeScript / Deno) — 45 functions
       └─ PostgreSQL (source of truth, RLS enforced on all tables)
       └─ n8n REST API (workflow engine, self-hosted)
       └─ Hostinger API (VPS provisioning)
       └─ Stripe API (billing)
```

### Key Architectural Decisions

| Decision | Why |
|---|---|
| Template duplication model | Templates are never executed directly. Each activation = isolated per-client workflow copy in n8n. |
| Connect Once / Run Many | OAuth tokens stored at user level (`activation_request_id = NULL`), reused across automations. |
| Webhook isolation | Each activation gets a unique webhook: `aerelion/{activation_request_id}`. |
| Async provisioning queue | `provisioning_queue` table decouples VPS/n8n provisioning from synchronous HTTP. |
| Envelope encryption | AES-256-GCM with `key_version` column. Key rotation via `rotate-encryption-key` edge function. |

---

## 3. Security Must-Passes

Every code change must satisfy all of the following before merge:

### 3.1 CORS
- All edge functions MUST use `buildCorsHeaders(req)` from `_shared/rate-limiter.ts`
- The `ALLOWED_ORIGINS` list is the authoritative allowlist
- **No wildcard `"*"` origins are permitted** — `verify-human-signature` is a known exception that must be fixed

### 3.2 Authentication
- Every edge function must validate a Bearer JWT via `supabase.auth.getUser(token)` before accessing user data
- Admin operations must use `requireAdminAuth(req)` from `_shared/admin-auth.ts`
- Cron jobs must use `requireCronSecret(req)` from `_shared/admin-auth.ts`
- **Never use the service role key on the client side**

### 3.3 Credential Security
- Credentials are encrypted with AES-256-GCM before storage (Web Crypto API)
- IVs must be randomly generated per encryption (12 bytes for GCM)
- **Never log credential values** — only log metadata (requestId, serviceName, type)
- Decryption only occurs inside Edge Functions, never on the client

### 3.4 Secret Comparisons
- All secret comparisons (HEARTBEAT_SECRET, CRON_SECRET) must use constant-time XOR comparison
- Do not use `===` for secret comparison

### 3.5 SSRF
- Any edge function that fetches an external URL based on user-supplied input must validate against `isPrivateIp()` or equivalent

### 3.6 Rate Limiting
- Destructive or expensive operations (reboot, scale, activate) must go through `checkRateLimit()`
- Rate limiter must NOT fail open silently in production — log the failure

### 3.7 Revocation
- Revocation must deactivate the n8n workflow AND verify the deactivation via GET
- A revoked activation must return 403 on any retrigger attempt

---

## 4. Database Rules

- All new tables require `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- All new tables need explicit RLS policies (no implicit open access)
- All `updated_at` columns need the `update_updated_at_column()` trigger
- Template tables (`n8n_workflow_templates`) must have UPDATE/DELETE blocking triggers
- New indexes should include partial conditions where applicable

### Key Tables Reference

| Table | Purpose |
|---|---|
| `automation_agents` | Product catalog |
| `n8n_workflow_templates` | Immutable template registry |
| `installation_requests` | Per-client activation records |
| `n8n_mappings` | Runtime state (workflow IDs, webhook URLs, status) |
| `integration_connections` | User-level OAuth tokens (Connect Once) |
| `activation_credentials` | Per-activation encrypted credentials |
| `provisioning_queue` | Async job queue for VPS/n8n provisioning |
| `agent_heartbeats` | AG-01→AG-07 heartbeat log |
| `sovereign_bridge` | Human verification (THS) records |

### Deprecated Fields (Do Not Use)

| Field | Table | Reason |
|---|---|---|
| `webhook_url` | `automation_agents` | Use `n8n_mappings.webhook_url` |
| `workflow_id` | `automation_agents` | Use `n8n_template_ids[]` |

---

## 5. Known Technical Debt (Prioritized)

These must be tracked and not re-introduced:

| ID | Issue | Severity | Fix |
|---|---|---|---|
| TD-01 | `verify-human-signature` uses wildcard CORS | High | Replace with `buildCorsHeaders(req)` |
| TD-02 | THS token is base64, not HMAC-signed | High | Sign with `crypto.subtle.sign` using a server secret |
| TD-03 | THS veracity threshold = 25 (too permissive) | Medium | Raise to ≥45 after production data analysis |
| TD-04 | `provisioning_queue` has no `SKIP LOCKED` | Medium | Add advisory lock or `FOR UPDATE SKIP LOCKED` |
| TD-05 | `agent-auto-heal` does not restart real processes | Medium | Call n8n API to actually reactivate workflows |
| TD-06 | Rate limiter fails open on DB error | Medium | Fail closed with in-memory fallback |
| TD-07 | No test coverage (zero test files) | High | Add Deno.test for edge functions, Vitest for hooks |
| TD-08 | Migration index `WHERE key_version < 1` is never true | Low | Fix to `WHERE key_version = 1` |
| TD-09 | `queue-processor` admin bypass when CRON_SECRET unset | Medium | Add admin role check as fallback |

---

## 6. Business Acceptance Criteria

A feature is acceptable if it meets ALL of:

1. **Does not expose customer credentials** — encrypted at rest, never logged, never sent to client
2. **Preserves workflow isolation** — one customer's n8n workflow cannot affect another's
3. **Maintains revocability** — any activation can be revoked within 60 seconds
4. **Passes RLS** — all data access is scoped to the requesting user or admin
5. **Has an audit trail** — significant operations write to `edge_function_logs`
6. **Does not break the activation lifecycle** — purchase → connect → activate → live → revoke must remain intact

---

## 7. Edge Function Conventions

```typescript
// Required imports
import { buildCorsHeaders } from "../_shared/rate-limiter.ts";

// All functions must:
// 1. Handle OPTIONS preflight
// 2. Validate auth before any business logic
// 3. Use try/catch with structured error response
// 4. Return Content-Type: application/json on all responses
// 5. Log significant actions to edge_function_logs

// Pattern:
Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // 1. Auth
    // 2. Validate input
    // 3. Business logic
    // 4. Return success
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

---

## 8. What Claude Should NOT Do

- Do not introduce `process.env` — this is Deno; use `Deno.env.get()`
- Do not add `console.log` for credential values — only log safe metadata
- Do not use `*` for CORS origins
- Do not skip RLS when creating new tables
- Do not write edge functions that call other edge functions synchronously for long-running tasks — use `provisioning_queue`
- Do not mark `agent-auto-heal` as implemented until it calls the actual n8n API

---

## 9. Environment Secrets Reference

| Secret | Used By |
|---|---|
| `SUPABASE_URL` | All edge functions |
| `SUPABASE_ANON_KEY` | User-auth edge functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations, service-role writes |
| `N8N_BASE_URL` | n8n provisioning functions |
| `N8N_API_KEY` | n8n API authentication |
| `CREDENTIAL_ENCRYPTION_KEY` | AES-256-GCM key (32-byte base64) |
| `CREDENTIAL_ENCRYPTION_KEY_NEXT` | Key rotation target |
| `HOSTINGER_API_TOKEN` | VPS orchestrator |
| `HEARTBEAT_SECRET` | agent-heartbeat function |
| `CRON_SECRET` | queue-processor, scheduled jobs |
| `STRIPE_SECRET_KEY` | Payment functions |
| `SLACK_WEBHOOK_URL` | Optional admin notifications |

---

*Last updated: 2026-02-19 — Post architectural audit (claude/audit-orchestration-architecture-Qu5y5)*
