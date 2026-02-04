# n8n Activation Pipeline - Internal Documentation

## Overview

Institutional-grade n8n workflow provisioning with **complete tenant isolation** via per-client workflow duplication and deterministic webhook paths.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ACTIVATION PIPELINE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. PURCHASE                                                              │
│     └─> installation_requests (status: received)                         │
│                                                                           │
│  2. CONNECT INTEGRATIONS                                                  │
│     └─> integration_connections (encrypted OAuth tokens)                 │
│                                                                           │
│  3. ACTIVATE (n8n-provision action=activate)                             │
│     │                                                                     │
│     ├─> duplicate-and-activate Edge Function                             │
│     │   │                                                                 │
│     │   ├─> Fetch immutable template from n8n_workflow_templates         │
│     │   │                                                                 │
│     │   ├─> POST /workflows → Create per-client workflow                 │
│     │   │   └─> Webhook path: aerelion/{activation_request_id}           │
│     │   │                                                                 │
│     │   ├─> POST /credentials → Create per-client credentials            │
│     │   │                                                                 │
│     │   ├─> PATCH /workflows/{id} → Inject credential references         │
│     │   │                                                                 │
│     │   ├─> POST /workflows/{id}/activate → Activate workflow            │
│     │   │                                                                 │
│     │   └─> Store in n8n_mappings:                                       │
│     │       - n8n_workflow_ids                                           │
│     │       - n8n_credential_ids                                         │
│     │       - webhook_url (dedicated column)                             │
│     │       - status: active                                             │
│     │                                                                     │
│     └─> installation_requests.status = live                              │
│                                                                           │
│  4. RUNTIME EXECUTION                                                     │
│     └─> POST {N8N_BASE_URL}/webhook/aerelion/{activation_id}             │
│         └─> Executes isolated per-client workflow                        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Webhook Isolation (Option A)

### Deterministic Webhook Path

Each activation gets a unique, deterministic webhook path:

```
Path format: aerelion/{activation_request_id}
Full URL:    {N8N_BASE_URL}/webhook/aerelion/{activation_request_id}

Example:
- activation_request_id: 550e8400-e29b-41d4-a716-446655440000
- webhook_url: https://n8n.srv1297251.hstgr.cloud/webhook/aerelion/550e8400-e29b-41d4-a716-446655440000
```

### Implementation Details

1. **duplicate-and-activate** sets the webhook path during workflow creation:
   ```typescript
   if (node.type === "n8n-nodes-base.webhook") {
     node.parameters.path = `aerelion/${activationId}`;
   }
   ```

2. **Webhook URL persisted** in `n8n_mappings.webhook_url` (dedicated column)

3. **n8n-provision** uses `n8n_mappings.webhook_url` for runtime triggers:
   - `retrigger` action reads webhook_url from n8n_mappings
   - `automation_agents.webhook_url` is **DEPRECATED** for runtime use

## Key Tables

### n8n_workflow_templates (Immutable Registry)
- Stores raw n8n workflow JSON
- Deduplicated by SHA-256 hash
- **NEVER modified or executed directly**
- Database triggers prevent UPDATE/DELETE

### n8n_mappings (Per-Activation State)
| Column | Purpose |
|--------|---------|
| `n8n_workflow_ids` | Created workflow IDs in n8n |
| `n8n_credential_ids` | Created credential IDs in n8n |
| `webhook_url` | **Runtime webhook URL** (dedicated column) |
| `status` | provisioning, active, paused, revoked, error |
| `activation_request_id` | Links to installation_requests |

### automation_agents
| Column | Purpose |
|--------|---------|
| `n8n_template_ids` | References n8n_workflow_templates |
| `required_integrations` | Providers needed for activation |
| `webhook_url` | **DEPRECATED** - not used for runtime |

## Lifecycle Actions

### activate
Calls `duplicate-and-activate` to provision isolated workflow.

### pause
1. Deactivates workflow in n8n (POST /workflows/{id}/deactivate)
2. Sets `n8n_mappings.status = paused`

### resume
1. Reactivates workflow in n8n (POST /workflows/{id}/activate)
2. Sets status back to `active`/`live`

### revoke
1. Deactivates workflow in n8n
2. Sets `n8n_mappings.status = revoked`
3. **Does NOT revoke user credentials** (shared across activations)

### retrigger
1. Reads `webhook_url` from `n8n_mappings`
2. POSTs to webhook with activation context

## Idempotency

- Check `n8n_mappings.n8n_workflow_ids` before provisioning
- If workflow exists and status is active, return existing data
- Same activation always gets same webhook path

## Security

- Credentials decrypted only in edge functions (never client)
- n8n API authenticated via `X-N8N-API-KEY`
- Each client gets isolated workflow + credentials
- No shared state between tenants

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "No template linked" | `n8n_template_ids` empty | Link template to automation |
| "Missing integrations" | Required OAuth not connected | User must connect integrations |
| "n8n API error" | n8n instance issue | Check n8n logs/connectivity |
| "No webhook_url" | Not provisioned yet | Run `activate` action first |

## Migration Notes

`automation_agents.webhook_url` is deprecated for runtime. All runtime webhook URLs are now stored per-activation in `n8n_mappings.webhook_url`.

```sql
-- Added column
ALTER TABLE n8n_mappings ADD COLUMN webhook_url TEXT;
```
