# CONNECT ONCE. RUN MANY. - Test Plan

## Architecture Overview

The AERELION platform implements a multi-tenant automation architecture where:
- **Credentials are stored at the user/account level** (not per-activation)
- **One connection powers unlimited automations**
- **n8n workflows fetch credentials at runtime** via the `runtime-credentials` API

## Database Schema

### Key Tables

| Table | Purpose |
|-------|---------|
| `integration_connections` | Encrypted credentials (user-level) |
| `installation_requests` | Activation instances (user -> template) |
| `automation_agents` | Template registry |
| `n8n_mappings` | Activation -> n8n state tracking |

### Critical Constraints

```sql
-- Unique index enforcing one active connection per user+provider
CREATE UNIQUE INDEX idx_integration_connections_user_provider_active
ON integration_connections(user_id, provider)
WHERE status NOT IN ('archived', 'revoked');
```

## Test Cases

### 1. Connect Provider Once, Use Across Activations

**Setup:**
1. User has no existing connections
2. User purchases Automation A (requires: HubSpot)
3. User purchases Automation B (requires: HubSpot, Gmail)

**Test Steps:**
1. Open ConnectorScreen for Automation A
2. Connect HubSpot with valid credentials
3. Verify:
   - `integration_connections` has 1 row for (user_id, 'hubspot', status='connected')
   - `activation_request_id` is NULL (user-level connection)
4. Open ConnectorScreen for Automation B
5. Verify HubSpot shows as "Connected" (no reconnect needed)
6. Connect Gmail
7. Verify both automations can use HubSpot credentials

**Expected Result:**
- HubSpot connected once, visible in both activation screens
- `/integrations` page shows both HubSpot and Gmail

### 2. Auto-Activation Trigger

**Setup:**
- User has Automation X (requires: Slack, Notion)
- User has no existing connections

**Test Steps:**
1. Open ConnectorScreen for Automation X
2. Connect Slack → verify no auto-activation yet
3. Connect Notion (final required provider)
4. Verify:
   - `connect-integration` returns `autoActivated: true`
   - `installation_requests.status` = 'live'
   - `n8n_mappings.metadata` contains `auto_activated: true`
   - User receives toast: "Automation Activated!"
   - User is redirected to dashboard

**Expected Result:**
- Automation goes live automatically when all requirements met

### 3. Runtime Credentials Resolution

**Setup:**
- User with active activation (status='live')
- User has connected HubSpot and Gmail

**Test Steps (via Edge Function):**
```bash
curl -X GET \
  "https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/runtime-credentials?activation_id=<UUID>" \
  -H "Authorization: Bearer <N8N_API_KEY>"
```

**Expected Response:**
```json
{
  "activation_id": "uuid",
  "automation_slug": "example-automation",
  "tenant_id": "user-uuid",
  "tenant_email": "user@example.com",
  "status": "live",
  "credentials": {
    "hubspot": { "access_token": "decrypted-token" },
    "gmail": { "access_token": "decrypted-token" }
  },
  "config": {}
}
```

**Verify:**
- Only required providers are returned (not all user connections)
- Credentials are decrypted correctly
- Cache-Control: no-store header present

### 4. Denied Access for Invalid Status

**Test Steps:**
1. Create activation with status='paused'
2. Call runtime-credentials

**Expected Result:**
- HTTP 403 response
- Body: `{ "error": "Activation not active", "status": "paused" }`

### 5. Revoke Connection (User-Level)

**Setup:**
- User has HubSpot connected
- User has 2 active automations using HubSpot

**Test Steps:**
1. Go to `/integrations` page
2. Click Disconnect on HubSpot
3. Confirm the warning dialog

**Expected Result:**
- `integration_connections.status` = 'revoked'
- Both automations now show HubSpot as missing
- New unique constraint allows new connection

### 6. Duplicate Prevention

**Test Steps:**
1. User connects HubSpot
2. Attempt to insert another (user_id, 'hubspot') with status='connected'

**Expected Result:**
- Database rejects with unique constraint violation
- Edge function handles via upsert (updates existing)

### 7. Account Integrations Page

**Test Steps:**
1. Navigate to `/integrations`
2. Verify displays all connected providers
3. Verify shows provider metadata (email, scopes, date)

**Expected Result:**
- Grid of connected integration cards
- Disconnect button with confirmation dialog

## Edge Function Endpoints

### connect-integration

| Action | Method | Description |
|--------|--------|-------------|
| `connect` | POST | Encrypt and upsert credential by (user_id, provider) |
| `revoke` | POST | Set status='revoked' for user's provider |
| `status` | POST | Return all non-revoked connections |
| `check_ready` | POST | Check if activation has all required integrations |

### runtime-credentials

| Method | Auth | Description |
|--------|------|-------------|
| GET | Bearer N8N_API_KEY | Resolve activation -> user -> credentials |

## Security Checklist

- [ ] Credentials encrypted with AES-256-GCM
- [ ] `CREDENTIAL_ENCRYPTION_KEY` is 32-byte base64
- [ ] `runtime-credentials` requires `N8N_API_KEY` bearer token
- [ ] No credentials in logs (audit trail only logs provider names)
- [ ] RLS prevents cross-user access
- [ ] Unique index prevents duplicate active connections

## Performance Considerations

- User lookup via `installation_requests.user_id` (direct) instead of `auth.admin.listUsers()`
- Backfill migration populates `user_id` for existing records
- Indexes on `user_id`, `provider`, `status` for fast queries
