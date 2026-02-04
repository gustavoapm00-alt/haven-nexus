# AERELION Template Duplication Contract

## Overview

This document describes the workflow template lifecycle: from import to per-client workflow execution.

## Core Principle

**Templates never execute directly.**

Every client activation receives its own duplicated workflow instance. This ensures complete isolation between clients and prevents credential sharing.

---

## Lifecycle Stages

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TEMPLATE IMPORT                                  │
│  (Admin uploads n8n JSON → stored in n8n_workflow_templates)            │
│                                                                          │
│  • Admin-only access                                                     │
│  • SHA-256 hash for deduplication                                        │
│  • IMMUTABLE after insert (no UPDATE/DELETE)                             │
│  • Never calls n8n API                                                   │
│  • Never activates workflows                                             │
│  • Stores raw workflow_json exactly as uploaded                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     AUTOMATION AGENT LINKING                             │
│  (automation_agents.n8n_template_ids → references template IDs)         │
│                                                                          │
│  • Admin links a template to a published automation agent                │
│  • Multiple templates can be linked (for complex workflows)              │
│  • Template remains immutable; agent metadata can be updated             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLIENT PURCHASE                                   │
│  (purchases table + installation_requests created)                       │
│                                                                          │
│  • Client purchases automation agent                                     │
│  • installation_request created with status='pending'                    │
│  • No workflow created yet                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CREDENTIAL COLLECTION                               │
│  (integration_connections table)                                         │
│                                                                          │
│  • Client connects required integrations (OAuth or API keys)             │
│  • Credentials encrypted with AES-256-GCM                                │
│  • Stored at ACCOUNT level (reusable across activations)                 │
│  • installation_request.status → 'credentials_received'                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW DUPLICATION (FUTURE)                         │
│  (n8n-provision edge function)                                           │
│                                                                          │
│  1. Fetch template JSON from n8n_workflow_templates                      │
│  2. Generate unique workflow name: "{template_slug}_{activation_id}"     │
│  3. POST to n8n API: create new workflow from template JSON              │
│  4. n8n returns: duplicated workflow_id + webhook_url                    │
│  5. Store in n8n_mappings:                                               │
│     - activation_request_id                                              │
│     - n8n_workflow_ids[]                                                 │
│     - webhook_url                                                        │
│     - status='provisioned'                                               │
│  6. installation_request.status → 'live'                                 │
│                                                                          │
│  CRITICAL: Each client gets their OWN workflow instance                  │
│  CRITICAL: Webhook URLs belong to activations, not templates             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      RUNTIME EXECUTION                                   │
│                                                                          │
│  1. External trigger hits client's webhook_url                           │
│  2. n8n starts workflow execution                                        │
│  3. n8n calls runtime-credentials edge function:                         │
│     GET /runtime-credentials?activation_id=X&providers=google,hubspot    │
│  4. Edge function:                                                       │
│     - Verifies activation is active                                      │
│     - Decrypts required credentials                                      │
│     - Logs access to audit_log                                           │
│     - Returns decrypted tokens                                           │
│  5. n8n executes workflow with credentials                               │
│  6. Run logged to automation_runs table                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    LIFECYCLE MANAGEMENT                                  │
│                                                                          │
│  PAUSE:                                                                  │
│  - n8n workflow deactivated (stops receiving triggers)                   │
│  - n8n_mappings.status → 'paused'                                        │
│  - Credentials remain connected                                          │
│                                                                          │
│  RESUME:                                                                 │
│  - n8n workflow activated                                                │
│  - n8n_mappings.status → 'active'                                        │
│                                                                          │
│  REVOKE:                                                                 │
│  - n8n workflow deleted                                                  │
│  - n8n_mappings.status → 'revoked'                                       │
│  - installation_request.status → 'revoked'                               │
│  - Credentials NOT affected (remain at account level)                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Relationships

```
n8n_workflow_templates (IMMUTABLE)
├── id (PK)
├── slug (unique)
├── name
├── workflow_json (raw n8n export)
├── file_hash (SHA-256, unique - prevents duplicates)
├── detected_providers[]
├── automation_agent_id (FK → automation_agents, optional)
└── imported_by (FK → auth.users)

automation_agents
├── id (PK)
├── slug
├── n8n_template_ids[] (references template IDs)
├── webhook_url (NULL - templates don't have webhooks)
└── status (draft, published, live)

installation_requests (per-client activation)
├── id (PK)
├── automation_id (FK → automation_agents)
├── user_id
├── email
└── status (pending, credentials_received, live, paused, revoked)

n8n_mappings (per-client workflow instance)
├── id (PK)
├── activation_request_id (FK → installation_requests)
├── n8n_workflow_ids[] (DUPLICATED workflow IDs in n8n)
├── webhook_url (client-specific webhook)
├── status (pending, provisioned, active, paused, revoked)
└── last_webhook_response
```

---

## Security Invariants

1. **Templates are immutable** - Enforced by database trigger that blocks UPDATE/DELETE
2. **Templates never execute** - No webhook_url stored on templates; no n8n API calls during import
3. **Credentials are isolated** - Decryption only happens at runtime via runtime-credentials
4. **Audit trail** - All credential access logged to audit_log
5. **Per-client isolation** - Each activation gets its own duplicated workflow instance

---

## Future Implementation Notes

The workflow duplication step is not yet implemented. When implementing:

1. **n8n API integration** - Use n8n's POST /workflows endpoint to create duplicates
2. **Credential injection** - Credentials are fetched at runtime, not baked into workflow JSON
3. **Webhook registration** - After workflow creation, store the webhook URL in n8n_mappings
4. **Error handling** - If duplication fails, rollback and set status='failed'
5. **Retry logic** - Implement idempotency using activation_request_id

---

## Testing Checklist

- [ ] Templates can be imported without calling n8n
- [ ] Duplicate file_hash is rejected (skipped, not errored)
- [ ] Templates cannot be updated (trigger blocks UPDATE)
- [ ] Templates cannot be deleted (trigger blocks DELETE)
- [ ] Only admins can insert/select templates
- [ ] Template JSON is stored exactly as uploaded (no modifications)
