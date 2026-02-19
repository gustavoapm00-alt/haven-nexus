# Activation Lifecycle Test Plan

Complete, reproducible test procedure for Option A webhook isolation.

## Prerequisites

### 1. Get User JWT Token

```bash
# Login to get token (or use browser devtools)
USER_TOKEN="<JWT_TOKEN>"
BASE_URL="https://<YOUR_PROJECT_REF>.supabase.co/functions/v1"
```

### 2. SQL Preflight Checks

```sql
-- Check user has required OAuth connections
SELECT id, provider, status, 
       encrypted_payload IS NOT NULL as has_payload
FROM integration_connections 
WHERE user_id = '<USER_ID>' 
  AND status = 'connected'
ORDER BY provider;

-- Check automation's required_integrations
SELECT slug, name, required_integrations
FROM automation_agents
WHERE id = '<AUTOMATION_ID>';

-- Verify template exists
SELECT id, name, 
       jsonb_array_length(workflow_json->'nodes') as node_count
FROM n8n_workflow_templates
WHERE id = ANY(
  SELECT unnest(n8n_template_ids) 
  FROM automation_agents 
  WHERE id = '<AUTOMATION_ID>'
);
```

## Test Sequence

### Step 1: Activate

```bash
curl -X POST "$BASE_URL/n8n-provision" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "activate",
    "activationRequestId": "<ACTIVATION_UUID>"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "workflowId": "abc123...",
  "webhookUrl": "https://<YOUR_N8N_HOSTNAME>/webhook/aerelion/<ACTIVATION_UUID>",
  "message": "Automation activated successfully"
}
```

**Verify DB:**
```sql
SELECT nm.status, nm.n8n_workflow_ids, nm.webhook_url,
       ir.status as request_status, ir.customer_visible_status
FROM n8n_mappings nm
JOIN installation_requests ir ON ir.id = nm.activation_request_id
WHERE nm.activation_request_id = '<ACTIVATION_UUID>';
```

Expected: `status=active`, `request_status=live`, `webhook_url` populated.

### Step 2: Trigger Webhook

```bash
curl -X POST "https://<YOUR_N8N_HOSTNAME>/webhook/aerelion/<ACTIVATION_UUID>" \
  -H "Content-Type: application/json" \
  -d '{
    "activation_id": "<ACTIVATION_UUID>",
    "user_id": "<USER_ID>",
    "automation_slug": "<SLUG>",
    "config": {},
    "input": {"test": true},
    "triggered_by": "manual_test",
    "timestamp": "2026-02-04T21:00:00Z"
  }'
```

**Expected:** HTTP 200, workflow execution logged in n8n.

### Step 3: Pause

```bash
curl -X POST "$BASE_URL/n8n-provision" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "pause",
    "activationRequestId": "<ACTIVATION_UUID>"
  }'
```

**Expected:**
```json
{
  "success": true,
  "message": "Automation paused"
}
```

### Step 4: Resume

```bash
curl -X POST "$BASE_URL/n8n-provision" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "resume",
    "activationRequestId": "<ACTIVATION_UUID>"
  }'
```

**Expected:**
```json
{
  "success": true,
  "message": "Automation resumed",
  "webhookUrl": "https://<YOUR_N8N_HOSTNAME>/webhook/aerelion/<ACTIVATION_UUID>"
}
```

### Step 5: Retrigger (via API)

```bash
curl -X POST "$BASE_URL/n8n-provision" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "retrigger",
    "activationRequestId": "<ACTIVATION_UUID>",
    "config": {"test": true}
  }'
```

### Step 6: Revoke

```bash
curl -X POST "$BASE_URL/n8n-provision" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "revoke",
    "activationRequestId": "<ACTIVATION_UUID>"
  }'
```

**Expected:**
```json
{
  "success": true,
  "message": "Automation revoked and workflow deactivated",
  "workflowId": "abc123...",
  "deactivation_attempted": true,
  "deactivation_verified": true
}
```

**Verify DB:**
```sql
SELECT status, metadata->>'revoked_at' as revoked_at,
       metadata->>'revoked_by' as revoked_by,
       (metadata->>'deactivation_verified')::boolean as verified
FROM n8n_mappings
WHERE activation_request_id = '<ACTIVATION_UUID>';
```

Expected: `status=revoked`, metadata shows revocation details.

### Step 7: Confirm Retrigger Blocked

```bash
curl -X POST "$BASE_URL/n8n-provision" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "retrigger",
    "activationRequestId": "<ACTIVATION_UUID>"
  }'
```

**Expected:** HTTP 403
```json
{
  "error": "Activation revoked"
}
```

## Quick Reference: required_integrations Setup

```sql
-- List all automations with their required_integrations
SELECT slug, name, 
       required_integrations,
       required_integrations IS NULL OR required_integrations = '[]'::jsonb as needs_setup
FROM automation_agents
ORDER BY slug;

-- Bulk update template
UPDATE automation_agents SET required_integrations = CASE slug
  WHEN 'client-onboarding-pack' THEN '[{"provider": "hubspot"}, {"provider": "gmail"}, {"provider": "google_calendar"}]'::jsonb
  WHEN 'customer-support-triage' THEN '[{"provider": "gmail"}, {"provider": "slack"}]'::jsonb
  WHEN 'weekly-kpi-digest' THEN '[{"provider": "google_sheets"}, {"provider": "gmail"}]'::jsonb
  -- Add more slugs as needed
  ELSE required_integrations
END
WHERE slug IN ('client-onboarding-pack', 'customer-support-triage', 'weekly-kpi-digest');
```

## Observability

### Check n8n Workflow State (via API)

```bash
N8N_API_KEY="<API_KEY>"
WORKFLOW_ID="<ID_FROM_ACTIVATION>"

curl "https://<YOUR_N8N_HOSTNAME>/api/v1/workflows/$WORKFLOW_ID" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq '{id, name, active}'
```

### Edge Function Logs

```sql
SELECT created_at, level, message, details
FROM edge_function_logs
WHERE function_name IN ('n8n-provision', 'duplicate-and-activate')
ORDER BY created_at DESC
LIMIT 20;
```
