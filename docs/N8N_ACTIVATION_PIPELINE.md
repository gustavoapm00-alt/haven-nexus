# n8n Activation Pipeline - Internal Documentation

## VERDICT: Previously Missing → Now Implemented

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ACTIVATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. PURCHASE                                                         │
│     └─> installation_request created (status: pending)              │
│                                                                      │
│  2. CONNECT INTEGRATIONS                                             │
│     └─> connect-integration encrypts & stores credentials           │
│     └─> integration_connections (user-level, AES-256-GCM)           │
│     └─> Auto-activation check when all required connected           │
│                                                                      │
│  3. ACTIVATE (duplicate-and-activate)                                │
│     ├─> Fetch immutable template from n8n_workflow_templates        │
│     ├─> POST /workflows → Create unique workflow in n8n             │
│     ├─> POST /credentials → Create n8n credentials (decrypted)      │
│     ├─> PATCH /workflows/{id} → Inject credential references        │
│     ├─> POST /workflows/{id}/activate → Enable workflow             │
│     └─> Store workflow_id in n8n_mappings                           │
│                                                                      │
│  4. RUNTIME                                                          │
│     └─> n8n calls runtime-credentials with activation_id            │
│     └─> Returns decrypted credentials for execution                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Components

| Component | Purpose |
|-----------|---------|
| `n8n_workflow_templates` | Immutable template storage (NEVER executed) |
| `integration_connections` | User-level encrypted credentials |
| `n8n_mappings` | Per-activation workflow tracking |
| `duplicate-and-activate` | Creates isolated per-client workflows |
| `runtime-credentials` | Server-to-server credential resolution |

## Isolation Enforcement

1. **Templates are read-only** - Trigger prevents UPDATE/DELETE
2. **Per-client workflow** - Each activation creates unique n8n workflow
3. **Per-client credentials** - n8n credentials created per activation
4. **Naming convention** - `[ClientName] Template - {activation_id}`

## Idempotency

- Check `n8n_mappings.n8n_workflow_ids` before provisioning
- If workflow exists and status is active, return existing
- Safe to retry activation requests

## Error Handling

- Failed provisioning → `n8n_mappings.status = 'error'`
- Admin notification created for manual intervention
- Activation marked `needs_attention`

## Security

- Credentials decrypted only in edge functions (never client)
- n8n API authenticated via `X-N8N-API-KEY`
- runtime-credentials authenticated via Bearer token
- No plaintext credentials stored in n8n or logs
