# AERELION // SOVEREIGN MULTI-NODE ALPHA
## SYS.OPS.V2.06 // STAGE_2_SOVEREIGN_MESH

---

## System Status

**Operational Tier:** Sovereign Multi-Node Alpha  
**Architecture Phase:** Stage 2 — Platform Sovereignty  
**Security Rating:** 8/10 (Post-Audit Hardened)  
**Mesh Topology:** Active

---

## Architecture Overview

AERELION is a Managed Automation Operator Node and Governance Framework built on a hardened Supabase/n8n/Hostinger stack.

```
┌─────────────────────────────────────────────────────────┐
│                  AERELION SOVEREIGN MESH                 │
│                                                         │
│  CLIENT REQUEST                                         │
│       │                                                 │
│       ▼                                                 │
│  hostinger-provision ──► provisioning_queue             │
│       (202 Accepted)          │                         │
│                               ▼                         │
│                       queue-processor (cron/60s)        │
│                               │                         │
│                               ▼                         │
│                     Hostinger VPS API                   │
│                               │                         │
│                               ▼                         │
│                      vps_instances table                │
│                                                         │
│  WORKFLOW ACTIVATION                                    │
│       │                                                 │
│       ▼                                                 │
│  duplicate-and-activate                                 │
│       │                                                 │
│       ▼                                                 │
│  n8n_instances table ──► Least-Load Router              │
│       │                                                 │
│  ┌────┴──────────────────────────────────┐              │
│  │  n8n Node 01    n8n Node 02   Node N  │              │
│  │  (PRIMARY)      (FAILOVER)    ...     │              │
│  └───────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## Stage 2 Changes (Current Release)

### A. Horizontal n8n Scaling

- New `n8n_instances` table tracks all n8n nodes with `current_load` and `max_capacity`.
- `duplicate-and-activate` now queries this table and routes each new client activation to the **least-loaded instance** (lowest `current_load / max_capacity` ratio).
- Falls back to `N8N_BASE_URL` env variable if table is empty or all instances are at capacity.
- Admin: add additional n8n nodes via the `n8n_instances` table in the backend.

### B. Operational Mode Enforcement

- `nexus_config.operational_mode` transitions now fire a **database trigger** (`trg_nexus_mode_change`).
- All mode changes are written to `edge_function_logs` as immutable audit events.
- `WAR_ROOM` transitions are logged at `error` severity for immediate visibility in the LiveProvenanceLog.

### C. System Registry (Lock-in Removal)

- New `system_registry` table stores all Stripe Price IDs, Hostinger API base URLs, and app domain config.
- Namespaces: `stripe`, `hostinger`, `app`.
- Stripe tiers remain in `src/lib/stripe-config.ts` as a typed cache for the frontend; the registry is the source of truth for backend functions.
- App domain defaults to `app.aerelion.systems` (configurable via `system_registry namespace=app, key=domain`).

### D. Non-Blocking Provisioning

- `hostinger-provision` now returns **HTTP 202** immediately after enqueuing a job.
- VPS spin-up is handled asynchronously by `queue-processor` (60s cron cycle).
- Frontend should poll `provisioning_queue` by `job_id` for status updates.
- Exponential backoff: max 3 attempts, delay doubles per failure (60s → 120s → 240s, capped at 1h).

---

## Elite 7 Agent Architecture

| Agent | Codename | Function |
|-------|----------|----------|
| AG-01 | The Sentinel | CUI Handoff, NIST 800-171, CMMC L2 Compliance |
| AG-02 | The Librarian | Universal Data Ontology & Schema Mapping |
| AG-03 | The Watchman | COOP & Drift Detection |
| AG-04 | The Gatekeeper | PoLP Access Governance |
| AG-05 | The Auditor | Shadow IT Surface Reduction |
| AG-06 | The Chronicler | Real-Time Status & Immutable Provenance |
| AG-07 | The Envoy | Executive Briefing AI & AAR Reporting |

---

## Infrastructure Requirements

- **n8n:** Self-hosted, single shared instance (multi-node supported via `n8n_instances` table)
- **VPS:** Hostinger VPS API (`HOSTINGER_API_TOKEN` required)
- **Backend:** Lovable Cloud (Supabase-powered)
- **Payments:** Stripe (webhooks via `library-webhook` and `stripe-portal-webhook` functions)

---

## Security Posture

- 13 CORS wildcards sealed (origin allowlist enforced per-function)
- All credentials encrypted at rest via AES-256-GCM
- Human signature tokens use dedicated `THS_SIGNING_SECRET` with 24h expiry
- `agent-auto-heal` resolves `n8n_mappings` via correct relational path
- `provisioning_queue` attempt count managed atomically by DB (no double-increment)
- RLS enforced on all tables

---

## Local Development

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

Required secrets (configure via Lovable Cloud secrets):
`STRIPE_SECRET_KEY`, `N8N_API_KEY`, `N8N_BASE_URL`, `HOSTINGER_API_TOKEN`,
`CREDENTIAL_ENCRYPTION_KEY`, `THS_SIGNING_SECRET`, `HEARTBEAT_SECRET`
