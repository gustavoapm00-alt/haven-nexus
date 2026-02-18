# HAVEN-NEXUS: AI-Native Orchestration Audit

**Date:** 2026-02-18
**Scope:** Full technical, security, and business alignment audit
**Auditor:** Automated deep-tissue analysis

---

## CRITICAL PREFACE: Architecture Reality Check

The most important finding: **several components referenced in the audit scope do not exist in this repository.**

| Requested Component | Actual Status |
|---|---|
| `/packages/orchestrator` (Go) | Does not exist. No Go code. |
| `/packages/runtime` (Rust) | Does not exist. No Rust code. |
| `/apps/studio` | Does not exist. No `/apps` directory. |
| gRPC / Protobuf interfaces | None. Zero `.proto` files. |
| Firecracker MicroVM | Not implemented. VPS via Hostinger API. |
| overlayfs | Not implemented. Standard VPS filesystem. |
| NATS / JetStream | Not implemented. Supabase webhooks + polling. |
| eBPF Containment Field | Not implemented. No kernel-level isolation. |
| `@packages/agents` | Does not exist. Agents are n8n cron workflows. |

### Actual Technology Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS (115 components, ~10K LOC)
- **Backend:** 42 Supabase Edge Functions (Deno runtime)
- **Database:** PostgreSQL via Supabase (150+ tables, 57 migrations)
- **Workflow Engine:** Self-hosted n8n instance (single node)
- **Infrastructure:** Hostinger VPS (API-provisioned)
- **Billing:** Stripe
- **Auth:** Supabase Auth + JWT + RLS

---

## Part 1: Technical & Structural Audit

### 1.1 System Cohesion — Score: 6/10

**Strengths:**
- Clean separation between frontend hooks and backend edge functions
- Shared utilities (`_shared/admin-auth.ts`, `_shared/rate-limiter.ts`) reduce duplication
- "Connect Once, Run Many" OAuth pattern is architecturally sound

**Weaknesses:**
- Agent definitions hardcoded in 3+ locations with no single source of truth
- Dual status fields (`status` + `customer_visible_status`) with no synchronization constraint
- Dead schema fields (`webhook_url`, `workflow_file_path`) coexist with replacements

### 1.2 Performance Constraints

| Area | Finding | Severity |
|---|---|---|
| Single n8n instance | All agents + customer workflows on one node | HIGH |
| Polling-based metrics | 30-second polling via edge function → Hostinger API | MEDIUM |
| No message queue | Provisioning is synchronous HTTP with no retry queue | HIGH |
| Credential parallelism | All n8n credentials created in parallel, no backpressure | MEDIUM |
| Heartbeat table growth | ~30K rows/year with no TTL policy | LOW |
| Missing database indexes | No indexes on key query patterns | MEDIUM |

### 1.3 Security Audit

**Encryption:** AES-256-GCM with random IVs — correct implementation.

#### Critical Vulnerabilities

| # | Vulnerability | Severity | Location |
|---|---|---|---|
| 1 | CORS wildcard `*` on all edge functions | CRITICAL | All 42 functions |
| 2 | Email-based user fallback in credential resolution | CRITICAL | `runtime-credentials/index.ts:185-191` |
| 3 | No secret rotation for API keys or encryption key | CRITICAL | Environment config |
| 4 | SSRF in VPS agent injection (no private IP validation) | HIGH | `hostinger-provision/index.ts:152-185` |
| 5 | Rate limiter exists but never invoked on critical ops | HIGH | `vps-orchestrator`, `hostinger-provision` |
| 6 | Weak constant-time comparison (length leak) | HIGH | `runtime-credentials`, `agent-heartbeat` |
| 7 | No transaction safety in multi-step provisioning | HIGH | `hostinger-provision/index.ts:117-144` |

#### Additional Security Issues

| # | Issue | Severity |
|---|---|---|
| 8 | Single `CREDENTIAL_ENCRYPTION_KEY` with no rotation | MEDIUM |
| 9 | No validation of encrypted payload format before `atob()` | MEDIUM |
| 10 | `in_build`/`testing` status can access production credentials | MEDIUM |
| 11 | SSH private keys stored in `vps_instances` table | MEDIUM |
| 12 | Verbose error messages leak Hostinger API internals | LOW |
| 13 | Audit logs go to console, not persisted to database | LOW |
| 14 | Client-constructed messages injected into audit logs | LOW |

#### Positive Security Implementations

- AES-256-GCM with per-record IV and auth tag
- CSRF protection on OAuth flows (state token, 15-min expiry)
- Immutable n8n workflow templates (DB triggers block UPDATE/DELETE)
- RLS policies on `vps_instances` for user isolation
- Admin role verification via shared auth module
- THS verification gate for admin panel access

---

## Part 2: Business & Model Alignment

### 2.1 Feature-Market Fit: "Sovereign Infrastructure"

| Sovereign Infra Goal | Current Implementation | Gap |
|---|---|---|
| Customer-isolated compute | Shared Hostinger VPS, shared n8n | No isolation |
| Self-hosted by customer | SaaS model, Aerelion-managed | Opposite model |
| Customer owns their data | Supabase-hosted PostgreSQL | Vendor-dependent |
| Kernel-level isolation | No eBPF, no MicroVMs | Not started |
| Private networking | Public internet + HTTPS | No private mesh |

**Assessment:** Current system is a managed automation SaaS platform. The 7-agent system is an ops monitoring layer, not customer-facing sovereign compute.

### 2.2 Scalability: 10,000+ Concurrent Nodes

| Component | Current Capacity | 10K Requirement | Gap |
|---|---|---|---|
| n8n instance | ~50-100 concurrent workflows | 10K+ workflows | Need clustered engine |
| Hostinger VPS API | Rate-limited, manual | 10K provisioning calls | Need IaC |
| Edge Functions | Cold starts, 60s timeout | High-throughput orchestration | Need dedicated compute |
| PostgreSQL | Supabase shared | 10K rows/sec heartbeat writes | Need dedicated/TSDB |
| Credential encryption | In-memory per request | 10K concurrent decryptions | Need HSM/KMS |

**Verdict:** Architecture cannot reach this target without fundamental redesign.

---

## Part 3: Outputs

### Executive Health Score: 4/10

| Dimension | Score | Notes |
|---|---|---|
| Security | 4/10 | CORS wildcard, no rate limiting, SSRF risk |
| Architecture | 5/10 | Clean patterns but single points of failure |
| Scalability | 2/10 | Single n8n, single VPS, no message queue |
| Code Quality | 6/10 | Good TypeScript, dead fields, no tests |
| Business Alignment | 4/10 | SaaS reality vs. sovereign infra goal |
| Operational Maturity | 5/10 | Heartbeats exist, no automated remediation |

### 5 Critical Gaps

| # | Gap | Impact | Effort |
|---|---|---|---|
| 1 | CORS wildcard on all edge functions | Credential theft from any origin | Low |
| 2 | No compute isolation (shared n8n + VPS) | Single breach = total compromise | High |
| 3 | No async provisioning / message queue | Partial failures corrupt state | Medium |
| 4 | No secret rotation mechanism | Key leak = permanent compromise | Medium |
| 5 | Architecture-aspiration mismatch | Wasted effort, unclear direction | Strategic |

### 5 Quick Wins

| # | Quick Win | Impact | Effort |
|---|---|---|---|
| 1 | Replace CORS `*` with allowlisted origins | Eliminate browser credential theft | ~1 hour |
| 2 | Add missing database indexes | Dashboard performance | ~30 min |
| 3 | Invoke existing rate limiter on critical ops | Prevent abuse/billing fraud | ~2 hours |
| 4 | Add CHECK constraints on status fields | Prevent invalid DB states | ~1 hour |
| 5 | Centralize agent definitions in DB | Single source of truth | ~3 hours |

### 3-Stage Implementation Strategy

#### Stage 1: Harden (Security & Stability)

- [ ] Fix CORS wildcard across all 42 edge functions
- [ ] Remove email-based user fallback in `runtime-credentials`
- [ ] Invoke rate limiter on `vps-orchestrator`, `hostinger-provision`
- [ ] Add IP validation to prevent SSRF in agent injection
- [ ] Add CHECK constraints and missing indexes via migration
- [ ] Persist audit logs to database

#### Stage 2: Consolidate (Data Integrity & Code Quality)

- [ ] Centralize agent definitions — query from DB, delete hardcoded arrays
- [ ] Implement OAuth token refresh background job (12-hour cycle)
- [ ] Add transaction semantics to `duplicate-and-activate`
- [ ] Remove deprecated schema fields
- [ ] Reconcile dual status fields into single field + computed view
- [ ] Add heartbeat TTL policy (auto-delete > 30 days)

#### Stage 3: Architect (Scale Foundation)

- [ ] Prototype message queue (NATS or BullMQ) for async provisioning
- [ ] Implement encryption key rotation with envelope encryption
- [ ] Design multi-node n8n or evaluate Temporal as replacement
- [ ] Build customer-facing health dashboard
- [ ] Resolve product direction: managed SaaS vs. sovereign infrastructure

---

## Appendix: Database Schema Concerns

### Missing Foreign Keys
- `agent_heartbeats.agent_id` → no FK to `automation_agents`
- `vps_instances.activation_request_id` → no CASCADE policy
- `n8n_mappings.credentials_reference_id` → no FK to `activation_credentials`

### Missing Indexes
```sql
CREATE INDEX idx_agent_heartbeats_agent_id ON agent_heartbeats(agent_id);
CREATE INDEX idx_n8n_mappings_user_request ON n8n_mappings(user_id, activation_request_id);
CREATE INDEX idx_integration_connections_user_provider ON integration_connections(user_id, provider, status);
CREATE INDEX idx_installation_requests_user_status ON installation_requests(user_id, status, created_at DESC);
```

### Recommended CHECK Constraints
```sql
ALTER TABLE installation_requests
ADD CONSTRAINT valid_status
CHECK (status IN ('pending', 'live', 'paused', 'needs_attention', 'completed'));

ALTER TABLE agent_heartbeats
ADD CONSTRAINT valid_heartbeat_status
CHECK (status IN ('NOMINAL', 'DRIFT', 'ERROR', 'PROCESSING', 'OFFLINE'));

ALTER TABLE n8n_mappings
ADD CONSTRAINT valid_mapping_status
CHECK (status IN ('provisioning', 'active', 'paused', 'revoked', 'error'));
```

### Credential Lifecycle Gaps
1. No token refresh loop — expired OAuth tokens cause silent workflow failures
2. No revocation cascade — provider-side revocation undetected
3. SSH private keys stored in DB — should be ephemeral
4. No per-record encryption key derivation — single master key
