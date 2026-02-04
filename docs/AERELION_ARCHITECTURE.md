# AERELION Systems Architecture
## Canonical Reference Document (v1.0)

> **This is the single source of truth.** All implementation decisions must align with this document.

---

## 1. System Overview

AERELION Systems is a **B2B managed automation operator**. We host, configure, and maintain automations on behalf of customers. Customers never access the underlying systems directly.

### Core Components

| Component | Role | Access |
|-----------|------|--------|
| **Lovable.dev** | Control Plane | Customer-facing UI, auth, billing, orchestration |
| **Self-hosted n8n** | Execution Engine | Internal only, runs duplicated workflows |
| **Supabase** | Database & Auth | Source of truth, encrypted credential storage |
| **Stripe** | Billing | One-time automation purchases |

### Locked Architecture Principles

1. **Customers never access n8n** - All interaction via Lovable portal
2. **Connect Once. Run Many.** - OAuth tokens stored at user level, reused across automations
3. **Template Duplication Model** - Templates are NEVER executed directly; each activation creates an isolated copy
4. **Webhook Isolation** - Each activation gets a unique webhook path: `aerelion/{activation_request_id}`

---

## 2. Data Model

### Key Tables

```
automation_agents (Catalog)
├── id (PK)
├── slug (unique)
├── name, description, price_cents
├── n8n_template_ids[] ← REQUIRED for activation
├── required_integrations[] ← OAuth providers needed
├── status (draft | published)
└── webhook_url ⚠️ DEPRECATED - not used for runtime

n8n_workflow_templates (Immutable Registry)
├── id (PK)
├── slug (unique)
├── workflow_json (raw n8n export)
├── file_hash (SHA-256 for deduplication)
├── detected_providers[]
└── ⛔ UPDATE/DELETE blocked by trigger

installation_requests (Per-Client Activation)
├── id (PK) ← Used for webhook path
├── user_id (FK → auth.users)
├── automation_id (FK → automation_agents)
├── status (received → in_build → live → completed)
└── customer_visible_status

n8n_mappings (Runtime State)
├── id (PK)
├── activation_request_id (FK)
├── user_id
├── n8n_workflow_ids[] ← Created workflow IDs in n8n
├── n8n_credential_ids[] ← Created credential IDs in n8n
├── webhook_url ← ✅ RUNTIME WEBHOOK (authoritative)
├── status (provisioning | active | paused | revoked | error)
└── metadata (revocation info, etc.)

integration_connections (User-Level OAuth)
├── id (PK)
├── user_id (FK)
├── provider (gmail, hubspot, slack, etc.)
├── encrypted_payload (AES-256-GCM)
├── encryption_iv, encryption_tag
├── status (connected | revoked | archived)
└── activation_request_id = NULL (Connect Once)
```

---

## 3. Lifecycle Flow

### Purchase → Execution Pipeline

```
1. PURCHASE (Stripe Checkout)
   └─> installation_requests.status = "received"
   └─> installation_requests.customer_visible_status = "received"

2. CONNECT INTEGRATIONS (Connector Screen)
   └─> User authorizes OAuth for each required_integrations provider
   └─> integration_connections upserted (user-level, activation_request_id = NULL)
   └─> When all connected → auto-triggers activation

3. ACTIVATE (n8n-provision action=activate)
   └─> duplicate-and-activate Edge Function:
       ├─> Fetch template from n8n_workflow_templates
       ├─> POST /workflows → Create per-client workflow
       │   └─> Webhook path set to: aerelion/{activation_request_id}
       ├─> POST /credentials → Create per-client n8n credentials
       ├─> PATCH /workflows/{id} → Inject credential references
       ├─> POST /workflows/{id}/activate → Enable workflow
       └─> Store in n8n_mappings:
           ├─> n8n_workflow_ids
           ├─> n8n_credential_ids
           ├─> webhook_url (unique per activation)
           └─> status = "active"
   └─> installation_requests.status = "live"

4. RUNTIME EXECUTION
   └─> POST {N8N_BASE_URL}/webhook/aerelion/{activation_request_id}
   └─> n8n executes the isolated per-client workflow
   └─> Workflow calls runtime-credentials API to get decrypted OAuth tokens
```

---

## 4. Credential Security

### Encryption

- **Algorithm**: AES-256-GCM (Web Crypto API)
- **Key**: 32-byte base64-encoded `CREDENTIAL_ENCRYPTION_KEY` secret
- **Storage**: `encrypted_payload`, `encryption_iv`, `encryption_tag` columns
- **Decryption**: Only in Edge Functions, never on client

### Connect Once. Run Many.

OAuth connections are stored at the **user level**, not per-activation:

```sql
-- All connections for a user (reusable across automations)
SELECT * FROM integration_connections 
WHERE user_id = 'xxx' 
  AND status = 'connected'
  AND activation_request_id IS NULL;
```

### Runtime Credential Resolution

n8n workflows fetch credentials via the `runtime-credentials` API:

```
POST /functions/v1/runtime-credentials
Authorization: Bearer {N8N_API_KEY}
Body: { "activation_id": "xxx" }

Response: {
  "activation_id": "xxx",
  "tenant_email": "customer@example.com",
  "credentials": {
    "gmail": { "access_token": "...", "refresh_token": "..." },
    "hubspot": { "access_token": "..." }
  }
}
```

---

## 5. Lifecycle Actions

All managed via `n8n-provision` Edge Function:

| Action | Effect |
|--------|--------|
| `activate` | Calls `duplicate-and-activate`, creates isolated workflow |
| `pause` | Deactivates workflow in n8n, sets status = "paused" |
| `resume` | Reactivates workflow in n8n, sets status = "active" |
| `revoke` | Deactivates workflow, sets status = "revoked", blocks retrigger |
| `retrigger` | POSTs to `n8n_mappings.webhook_url` for debugging |

### Revocation Hardening

- Workflow deactivation verified via n8n API GET
- `n8n_mappings.status` = "revoked"
- `installation_requests.status` = "completed"
- Retrigger blocked with 403

---

## 6. Deprecated Fields (DO NOT USE)

| Field | Table | Reason |
|-------|-------|--------|
| `webhook_url` | `automation_agents` | Legacy single-workflow model. Runtime webhooks are per-activation in `n8n_mappings.webhook_url` |
| `workflow_id` | `automation_agents` | Replaced by `n8n_template_ids[]` |
| `workflow_file_path` | `automation_agents` | Legacy file storage, templates stored in `n8n_workflow_templates` |

---

## 7. Required Configuration

### Edge Function Secrets

| Secret | Purpose |
|--------|---------|
| `N8N_BASE_URL` | n8n instance URL (e.g., `https://n8n.srv1297251.hstgr.cloud`) |
| `N8N_API_KEY` | n8n API authentication |
| `CREDENTIAL_ENCRYPTION_KEY` | 32-byte base64 key for AES-256-GCM |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role for admin operations |
| `STRIPE_SECRET_KEY` | Stripe API key |

### Automation Data Requirements

Every published automation MUST have:
- `n8n_template_ids[]` populated (at least one template)
- `required_integrations[]` populated (OAuth providers needed)
- `status = "published"`

---

## 8. Admin Operations

### Import Templates
`/admin/library/templates` → Batch import n8n JSON files → Stored in `n8n_workflow_templates`

### Link Templates to Automations
`/admin/library/agents/{id}` → Select templates from dropdown → Saved to `n8n_template_ids[]`

### Monitor Activations
`/admin/n8n-mappings` → View all activations, trigger lifecycle actions

---

## 9. Error States

| Status | Meaning | Resolution |
|--------|---------|------------|
| `needs_attention` | Activation failed or requires manual intervention | Check `activation_notes_internal` |
| `error` | n8n provisioning failed | Check Edge Function logs |
| `awaiting_activation` | Integrations connected but no template linked | Link template to automation |

---

## 10. Change Log

| Date | Change |
|------|--------|
| 2026-02-04 | Initial v1.0 - Template duplication model, webhook isolation |

---

**END OF DOCUMENT**
