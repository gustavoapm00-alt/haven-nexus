# AERELION // HAVEN NEXUS — SOVEREIGN INFRASTRUCTURE AUDIT
**Classification:** INTERNAL — GHOST OPERATOR EYES ONLY
**Audit Date:** 2026-02-19
**Auditor:** Senior Systems Architect & Business Strategist
**Codebase Ref:** `gustavoapm00-alt/haven-nexus` → branch `claude/audit-haven-nexus-3v7UL`

---

## EXECUTIVE HEALTH SCORE

```
OVERALL SCORE: 5.5 / 10

  Security Posture:      5/10  ██████░░░░  (13/40 edge functions with wildcard CORS)
  Code Quality:          7/10  ███████░░░  (solid patterns, but inconsistent enforcement)
  Business Readiness:    4/10  █████░░░░░  (Lovable-locked, single n8n, SaaS not Sovereign)
```

**Verdict:** The foundation is architecturally sound — AES-256-GCM credential vaulting, RLS-enforced
admin gates, SSRF guards, and a provisioning queue all show deliberate thinking. However,
the system cannot survive client handoff in its current state. Critical CORS exposure on
credential endpoints, a single-node n8n bottleneck, and deep Lovable platform dependency
are the three structural blockers between you and a sovereign infrastructure product.

---

## PART 1: TECHNICAL & STRUCTURAL AUDIT

### 1.1 System Cohesion: Frontend ↔ Supabase ↔ n8n

**Architecture Map:**
```
React/Tailwind (Lovable SPA)
  └── Supabase JS Client (anon key, RLS-enforced)
      └── Supabase Edge Functions (Deno, ~40 functions)
          ├── n8n REST API  (single N8N_BASE_URL — SPOF)
          ├── Hostinger VPS API
          ├── Stripe API
          └── Twilio API
```

**Hardcoded Constants That Should Be in the Database:**

| Constant | Location | Risk |
|---|---|---|
| Stripe price IDs (`price_1Szda...`) | `src/lib/stripe-config.ts` | Price changes require code deploy |
| Product IDs (`prod_TxYh...`) | `src/lib/stripe-config.ts` | Env-coupled, no staging/prod split |
| Agent ID list `["AG-01"..."AG-07"]` | `agent-auto-heal/index.ts:57` | Hardcoded, bypasses `agent_registry` table |
| CORS allowlist (`haven-matrix.lovable.app`) | `_shared/rate-limiter.ts` + 4 edge fns | Domain migration requires code change |
| `HOSTINGER_BASE` URL | `hostinger-provision/index.ts`, `vps-orchestrator/index.ts` | Vendor URL baked in |
| n8n webhook path prefix (`aerelion/{id}`) | `duplicate-and-activate/index.ts` | Multi-tenant routing not configurable |

**Positive:** The `agent_registry` table exists as a canonical source of truth for agent
definitions. However, `agent-auto-heal` still hardcodes the valid agent list inline instead
of querying it.

---

### 1.2 Security Posture: "Security by Afterthought" Audit

#### CRITICAL: Wildcard CORS on Sensitive Endpoints

**13 of 40 edge functions use `"Access-Control-Allow-Origin": "*"`.**

The most dangerous offender:

```typescript
// hostinger-credentials/index.ts — DECRYPTS SSH PRIVATE KEYS + n8n PASSWORDS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",   // ← ANY ORIGIN CAN CROSS-ORIGIN CALL THIS
  ...
};
```

This function returns decrypted SSH private keys and n8n admin credentials. While bearer
token auth is required, wildcard CORS means a malicious page on ANY domain can make
authenticated cross-origin requests on behalf of a victim user (CSRF via credential-bearing
requests in some browser configurations). Functions affected:

- `hostinger-credentials` — decrypts VPS SSH keys + n8n creds
- `admin-import-workflows` — admin-only bulk workflow import
- `verify-human-signature` — THS biometric gate
- `oauth-start` — OAuth flow initiation
- `import-n8n-templates` — admin function
- `notify-activation-status`, `notify-activation-customer-update` — customer PII
- `hostinger-metrics`, `purchase-email`, `send-activation-reminders`, `library-webhook`,
  `twilio-webhook`, `stripe-portal-webhook`

`buildCorsHeaders()` in `_shared/rate-limiter.ts` already provides the correct
allowlisted implementation. These 13 functions simply didn't adopt it.

#### MEDIUM: CRON_SECRET Timing Attack Partial Fix

```typescript
// admin-auth.ts:96 — leaks secret length
if (providedSecret.length !== cronSecret.length) {
  return { authorized: false, error: "Invalid cron secret", statusCode: 403 };
}
// Constant-time loop only runs if lengths match
```

The early bail-out on length mismatch reveals secret length to a timing attacker. A true
constant-time comparison must run unconditionally. The XOR loop below it is correct; the
length pre-check negates it.

#### LOW: DriftSimulationPanel Direct DB Write

```typescript
// DriftSimulationPanel.tsx:35 — writes directly to agent_heartbeats from client
const { error } = await supabase.from('agent_heartbeats').insert({ ... });
```

The RLS policy (`is_admin()`) on `agent_heartbeats` blocks non-admins at the database
layer, and `NexusGuard` wraps this component. The layered defense is intact. However,
writing operational state from a UI component directly to a table (bypassing an Edge
Function) means there is no server-side validation, rate limiting, or audit log for
drift injections. In a client-handoff scenario, this is a liability.

#### POSITIVE: What's Working Well

- AES-256-GCM encryption for all VPS credentials (SSH + n8n) with proper IV/tag separation
- SSRF guard in `hostinger-provision` and `vps-orchestrator` blocks private IP ranges
- `requireAdminAuth()` in `_shared/admin-auth.ts` is a clean, reusable pattern
- `nexus_config` RLS properly enforces `is_admin()` on UPDATE
- `agent_heartbeats` RLS enforces `is_admin()` on INSERT
- Rate limiting via `checkRateLimit()` on destructive operations (provision, reboot, scale)
- Key versioning columns added to `integration_connections`, `vps_instances`,
  `activation_credentials` — correct forward-planning for key rotation
- CSP in `index.html` is non-trivially configured (no `*` wildcard in connect-src)

---

### 1.3 Scalability Health: Path to 10,000 Nodes

#### Single n8n Instance — Will Fail First

Every workflow activation, pause, resume, and revoke flows through one `N8N_BASE_URL`:

```typescript
// Seen in 5 different edge functions:
const n8nBaseUrl = Deno.env.get("N8N_BASE_URL");  // one string, one instance
const n8nApiKey = Deno.env.get("N8N_API_KEY");     // one key
```

n8n (self-hosted) is not designed for multi-tenancy at this scale. A single n8n instance
handling 10,000 active workflows will hit:
- **Execution queue saturation** at ~200-500 concurrent workflows on typical VPS
- **API rate limits** on the n8n REST API (no retry/backoff in `n8nApiCall()`)
- **Single point of failure**: if this instance goes down, all client automations stop

**Fix requires:** n8n instance pool with routing table (e.g., `n8n_instances` table with
region/capacity fields), and a dispatch layer in `duplicate-and-activate` to assign clients
to the least-loaded instance.

#### Provisioning Queue: Right Direction, Not Fully Wired

The `provisioning_queue` table was added in the Stage 3 migration — this is the correct
architectural direction. However, the `hostinger-provision` edge function still provisions
synchronously within a single HTTP request. The queue is not yet consumed by a polling
worker, meaning synchronous timeouts remain a risk for long VPS provisioning operations
(Hostinger API can take 30-120 seconds).

#### Supabase: Known Bottlenecks

- `agent_heartbeats` volume at 10,000 nodes × multiple heartbeats/day will be high.
  The 30-day TTL with `pg_cron` is in place — adequate.
- Realtime subscriptions on `nexus_config`, `vps_instances`, `agent_registry` are
  fine for the admin dashboard but will need to be carefully scoped as client count grows.
- `edge_function_logs` will become a write-heavy table. The 7-day TTL is correct.

---

## PART 2: BUSINESS & MODEL ALIGNMENT

### 2.1 Value Proposition Check: Sovereign Node vs. Managed SaaS

**Current Reality: Managed SaaS with Sovereign aesthetics.**

The system provisions VPS nodes per client (sovereign intent) but the actual automation
runtime is a shared, centrally-operated n8n instance. This means:

- Client A's workflows and Client B's workflows run on the **same n8n process**
- There is **no runtime isolation** between clients
- If the central n8n instance is compromised, **all clients are exposed**

This is the definition of multi-tenant SaaS, not sovereign infrastructure.

**Vendor Dependency Flags:**

| Vendor | Lock-in Level | Impact |
|---|---|---|
| Lovable (lovable.dev) | HIGH | README, `@lovable.dev/cloud-auth-js`, `lovable-tagger` in vite.config, CORS hardcoded to `haven-matrix.lovable.app` |
| Supabase | MEDIUM | Entire backend — acceptable for current stage but a migration risk at scale |
| Hostinger | MEDIUM | `HOSTINGER_BASE` hardcoded, only one VPS provider supported |
| Stripe | LOW | Credentials via env vars; price IDs hardcoded in frontend |
| n8n | HIGH | Single instance, no multi-vendor fallback |

The Lovable lock-in is the most urgent to address before client handoff. The CORS
allowlist and auth integration are tied to `haven-matrix.lovable.app`. Clients will
not accept receiving a product whose infrastructure is visibly dependent on a third-party
web IDE platform.

---

### 2.2 Product Maturity: Nexus Command Feature Assessment

#### Stealth / Sentinel / War Room Modes

**Verdict: UI-level aesthetics only. No infrastructure enforcement.**

Mode changes update the `nexus_config.operational_mode` field in the database. This
triggers a Supabase Realtime event that updates the frontend color palette:
- **STEALTH**: green scanlines, opacity 0.012
- **SENTINEL**: amber scanlines, opacity 0.025
- **WAR_ROOM**: red scanlines, opacity 0.04

**What does NOT happen when switching modes:**
- No change to agent heartbeat frequency
- No change to network firewall rules
- No change to n8n workflow execution policies
- No change to rate limits or auth thresholds
- No automated incident response triggered
- No logging intensity change

The WAR_ROOM confirmation dialog and provenance log are good UX patterns. But the mode
switch currently has zero operational effect on the actual infrastructure. It is a
dashboard aesthetic, not an operational control.

#### Auto-Heal Panel

`agent-auto-heal` inserts a "NOMINAL" heartbeat record — it does not actually restart
any process, kill any container, or trigger any n8n workflow. "Healing" an agent means
writing a new status to the heartbeats table. This resets the dashboard UI but doesn't
fix underlying automation issues.

#### Drift Simulation

The Drift Simulation panel (write fake heartbeat statuses directly to the DB) is a
testing/demo tool. It should not be present in a client-facing production build. A
client who discovers they can inject `ERROR` status into their own system's display
will lose confidence.

#### THS (The Human Signature) — Strongest Feature

The THS biometric verification layer in `NexusGuard` is the most production-ready
Nexus feature. It adds a genuine second authentication factor (beyond Supabase auth)
specifically for the Nexus Command interface. This is a real differentiator.

#### AgentDeploymentPanel, AARReportPanel, TelemetryTimeline

These connect to real edge functions (`deploy-agent-workflows`, `generate-aar`,
agent heartbeat queries). They represent the most functionally complete parts of
the Nexus Command interface.

---

## PART 3: REQUIRED DELIVERABLES

### 3.1 Critical Gaps (Top 5)

| # | Gap | Severity | Blast Radius |
|---|---|---|---|
| **G-01** | 13/40 edge functions use wildcard CORS — includes credential decryption endpoint | CRITICAL | SSH keys + n8n passwords exposed to cross-origin attacks |
| **G-02** | Single `N8N_BASE_URL` — zero horizontal scalability for n8n layer | CRITICAL | All 10,000 clients share one process; single failure kills all automations |
| **G-03** | Lovable platform lock-in — CORS, auth, and README tied to `haven-matrix.lovable.app` | HIGH | Cannot hand off to client without exposing vendor dependency |
| **G-04** | War Room / Stealth modes are UI-only — no infrastructure enforcement | HIGH | Product misrepresents capabilities; client discovers this post-handoff |
| **G-05** | `DriftSimulationPanel` exposed in production — clients can inject fake operational states | MEDIUM | Trust and confidence risk in client-facing builds |

### 3.2 Quick Wins (Top 5)

| # | Win | Effort | Impact |
|---|---|---|---|
| **W-01** | Replace wildcard CORS in 13 edge functions with `buildCorsHeaders(req)` | 2 hours | Closes G-01 immediately |
| **W-02** | Fix CRON_SECRET constant-time comparison (remove length bail-out) | 15 min | Eliminates timing side-channel |
| **W-03** | Replace hardcoded agent list in `agent-auto-heal` with `agent_registry` table query | 30 min | Enforces single source of truth |
| **W-04** | Gate `DriftSimulationPanel` behind a `NODE_ENV !== 'production'` or `isDev` flag | 30 min | Removes demo artifact from production |
| **W-05** | Move Stripe price IDs from `stripe-config.ts` to database (`products` table or Supabase secrets) | 2 hours | Price changes no longer require code deployment |

---

### 3.3 Next Sprint Plan — 3-Stage Hardening Roadmap

#### STAGE 1: Security Triage (Prerequisite for any client handoff)
*Goal: Eliminate all CRITICAL and HIGH security findings*

1. **CORS Sweep** — Replace all 13 wildcard CORS implementations with `buildCorsHeaders(req)`.
   Target files: `notify-activation-status`, `verify-human-signature`, `hostinger-credentials`,
   `notify-activation-customer-update`, `admin-import-workflows`, `library-webhook`,
   `twilio-webhook`, `stripe-portal-webhook`, `oauth-start`, `purchase-email`,
   `send-activation-reminders`, `hostinger-metrics`, `import-n8n-templates`.

2. **Crypto Fix** — Remove the length-check bail-out in `requireCronSecret()` in `admin-auth.ts`.
   Run the XOR loop unconditionally, set `mismatch` to non-zero if lengths differ.

3. **Production Build Gate** — Wrap `DriftSimulationPanel` in a dev-only conditional.
   Either remove it from production routes in `App.tsx` or add an explicit `import.meta.env.DEV` guard.

4. **README Replacement** — Replace the Lovable boilerplate README with an AERELION
   operational runbook. Remove all `REPLACE_WITH_PROJECT_ID` placeholders.

5. **Lovable Dependency Audit** — Evaluate `@lovable.dev/cloud-auth-js` and `lovable-tagger`.
   The `lovable-tagger` is dev-only and harmless. The `cloud-auth-js` OAuth wrapper should
   be assessed: does it add functionality not available directly via `supabase.auth.signInWithOAuth()`?

**Deliverable:** Security posture score upgrades from 5/10 → 8/10.

---

#### STAGE 2: Platform Sovereignty (Required for "Sovereign Node" product claim)
*Goal: Remove Lovable dependency, establish operational mode enforcement*

1. **Domain Migration** — Move the production deployment to a custom domain
   (`app.aerelion.systems` or similar). Update CORS allowlist in `_shared/rate-limiter.ts`
   and the 4 edge functions with local `getCorsHeaders()`. This is a config change, not
   architectural.

2. **n8n Instance Pool** — Design and implement `n8n_instances` table:
   ```sql
   CREATE TABLE n8n_instances (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     base_url text NOT NULL,
     api_key_secret_name text NOT NULL,  -- reference to Supabase secret, not the key itself
     region text NOT NULL,
     current_workflow_count integer NOT NULL DEFAULT 0,
     max_workflow_count integer NOT NULL DEFAULT 500,
     status text NOT NULL DEFAULT 'active',
     created_at timestamptz NOT NULL DEFAULT now()
   );
   ```
   Update `duplicate-and-activate` to query the least-loaded active instance and route
   new activations to it. Store `n8n_instance_id` on `n8n_mappings`.

3. **Operational Mode Enforcement** — Wire mode changes to actual infrastructure controls:
   - **STEALTH**: Set agent heartbeat interval to 5 minutes (low noise)
   - **SENTINEL**: Set heartbeat interval to 60 seconds + enable drift detection alerts
   - **WAR_ROOM**: Set heartbeat interval to 15 seconds + trigger admin notification +
     lock all client-facing provisioning requests

   Implement this via a `mode_change` webhook that triggers an n8n workflow when
   `nexus_config` changes, or via a Supabase DB trigger that inserts into `admin_notifications`.

4. **Provisioning Queue Worker** — Wire the existing `provisioning_queue` table to an
   actual queue processor. The `queue-processor` edge function appears to exist — verify
   it is scheduled (pg_cron) and consuming the queue. VPS provisioning must be fully
   async: client gets a `provisioning` status immediately; a worker polls Hostinger for
   completion and updates `vps_instances.status`.

**Deliverable:** Business Readiness score upgrades from 4/10 → 7/10.

---

#### STAGE 3: Client Handoff Hardening (Production-grade readiness)
*Goal: System is safe to place in client hands without Aerelion operational oversight*

1. **Auto-Heal Real Implementation** — Replace the heartbeat-write stub with actual
   n8n workflow restart calls via the n8n API. `agent-auto-heal` should call
   `POST /workflows/{workflowId}/activate` and verify the response. Log the actual
   n8n API response, not just a synthetic "NOMINAL" heartbeat.

2. **Per-Client n8n Isolation** — For "Ghost" tier clients ($25K), provision a
   **dedicated n8n instance** on their VPS node rather than routing them to the
   shared pool. This is the actual Sovereign Node differentiator. The `hostinger-provision`
   function already installs n8n on the VPS — validate that this n8n instance is being
   used for that client's workflows, not the central shared instance.

3. **Stripe Price ID Migration** — Move tier pricing to a `pricing_tiers` table.
   Edge functions read prices at checkout time from the database. Frontend reads
   display prices from an authenticated API call. This allows price changes without
   code deployment.

4. **Agent Registry Enforcement** — Replace all hardcoded agent ID arrays with
   `agent_registry` table queries. This is a single source of truth for the 7 agents.

5. **Client Runbook Generation** — Build a PDF/markdown export from `generate-aar`
   that produces a client-ready deployment report: VPS IP, n8n URL, active workflows,
   and support escalation path. This is the deliverable the client signs off on.

**Deliverable:** Executive Health Score upgrades from 5.5/10 → 8.5/10. System cleared
for client handoff.

---

## APPENDIX: AUDIT EVIDENCE TRAIL

```bash
# Files reviewed:
# 40 edge functions in supabase/functions/
# 43 DB migrations
# 150+ src/ components, pages, hooks
# Key files:
#   supabase/functions/_shared/admin-auth.ts       — auth patterns
#   supabase/functions/_shared/rate-limiter.ts     — CORS + rate limit
#   supabase/functions/hostinger-credentials/index.ts  — credential decryption (CRITICAL CORS)
#   supabase/functions/n8n-provision/index.ts      — n8n SPOF confirmed
#   supabase/functions/duplicate-and-activate/index.ts — activation pipeline
#   src/hooks/useNexusMode.ts                      — mode = UI only
#   src/components/nexus/DriftSimulationPanel.tsx  — prod artifact risk
#   src/lib/stripe-config.ts                       — hardcoded IDs
#   src/integrations/lovable/index.ts              — vendor lock
#   supabase/migrations/20260211134151_*.sql        — nexus_config RLS (correct)
#   supabase/migrations/20260211054325_*.sql        — agent_heartbeats RLS (correct)

# CORS audit command:
# grep -rn '"Access-Control-Allow-Origin": "\*"' supabase/functions --include="*.ts"
# Result: 13 matches

# N8N SPOF confirmation:
# grep -rn "N8N_BASE_URL" supabase/functions --include="*.ts" | grep "Deno.env.get"
# Result: 5 edge functions share single N8N_BASE_URL env var
```

---

*AERELION // SOVEREIGN AUDIT v1.0 // GHOST_OPERATOR // 2026-02-19*
