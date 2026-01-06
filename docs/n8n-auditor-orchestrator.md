# n8n Auditor Orchestrator Integration

This document describes the integration between AERELION Systems and the n8n Auditor Orchestrator.

## Overview

The AERELION System Audit flow sends audit data to an n8n workflow which processes the information and returns a diagnosis. The website backend handles all communication with n8n—the frontend never interacts with n8n directly.

## Webhook URL

**Environment Variable:** `N8N_AUDITOR_WEBHOOK_URL`

This should be set to your n8n webhook URL, e.g.:
```
https://your-n8n-instance.app.n8n.cloud/webhook/auditor-orchestrator
```

## Request Headers

The backend sends the following headers with each request:

| Header | Description |
|--------|-------------|
| `Content-Type` | `application/json` |
| `X-AERELION-SIGNATURE` | HMAC-SHA256 signature of the request body |
| `X-AERELION-REQUEST-ID` | Unique idempotency key (UUID) |
| `X-AERELION-AUDIT-ID` | The audit record ID |

## Signature Verification

All requests are signed using HMAC-SHA256 with the `N8N_WEBHOOK_SECRET` environment variable.

### How to Verify (in n8n)

```javascript
const crypto = require('crypto');

function verifySignature(secret, body, signature) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(typeof body === 'string' ? body : JSON.stringify(body));
  const calculated = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(signature));
}

// In your n8n webhook node:
const signature = $input.first().headers['x-aerelion-signature'];
const body = $input.first().body;
const secret = 'YOUR_N8N_WEBHOOK_SECRET';

if (!verifySignature(secret, body, signature)) {
  throw new Error('Invalid signature');
}
```

## Request Payload

```json
{
  "audit_id": "uuid",
  "name": "string",
  "email": "string",
  "primary_friction": "leads_followup | fulfillment | customer_support | internal_ops | reporting_visibility | tool_chaos | other",
  "breakdown_first": "things_slip_quietly | someone_patches_manually | approvals_stall_decisions | creates_customer_confusion | not_sure",
  "tool_entropy": "tools_1_2 | tools_3_5 | tools_6_plus",
  "absence_test_48h": "things_slip | someone_fills_gaps_manually | systems_mostly_hold | not_sure",
  "operational_volume": "low_volume_chaotic | steady_weekly | high_throughput",
  "decision_maker": true | false,
  "notes": "string | null"
}
```

## Response Contract

n8n **must** return exactly this JSON structure:

```json
{
  "leak_hours_low": 12,
  "leak_hours_high": 18,
  "recovered_hours_low": 7,
  "recovered_hours_high": 13,
  "primary_failure_mode": "Work is being routed by memory, not rules.",
  "plain_language_cause": "Your lead flow relies on someone remembering to check, follow up, and track. When that person is busy or absent, leads fall through.",
  "what_is_happening": "Leads come in, but follow-ups are inconsistent. Some get three emails, others get none. You're not sure which are hot and which are cold.",
  "recommended_systems": [
    {
      "name": "Lead Intake Router",
      "description": "Automatically captures, scores, and routes inbound leads to the right destination."
    },
    {
      "name": "Follow-up Sequencing",
      "description": "Time-based sequences that ensure no lead goes cold without contact."
    },
    {
      "name": "Reliability Layer",
      "description": "Logging, alerts, retries, and runbooks so systems remain trustworthy over time."
    }
  ],
  "readiness_level": "low | medium | high",
  "next_step": "request_deployment | send_email | self_serve",
  "confidence": 82,
  "raw_signals": {
    "scores": {},
    "notes": [],
    "agent_versions": {}
  }
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `leak_hours_low` | integer | Lower bound of estimated hours leaking per week |
| `leak_hours_high` | integer | Upper bound of estimated hours leaking per week |
| `recovered_hours_low` | integer | Lower bound of recoverable hours with systems |
| `recovered_hours_high` | integer | Upper bound of recoverable hours with systems |
| `primary_failure_mode` | string | One-sentence summary of the core operational failure |
| `plain_language_cause` | string | Paragraph explaining the root cause |
| `what_is_happening` | string | Paragraph describing current symptoms |
| `recommended_systems` | array | 2-4 systems with name and description |
| `readiness_level` | string | `low`, `medium`, or `high` |
| `next_step` | string | Recommended next action |
| `confidence` | integer | 0-100 confidence score |
| `raw_signals` | object | Optional diagnostic metadata |

### System Library (Reference)

Valid system names to recommend:

1. **Lead Intake Router** - Automatically captures, scores, and routes inbound leads
2. **Follow-up Sequencing** - Time-based sequences for consistent outreach
3. **Visibility Dashboard** - Shared operational state across the team
4. **Tool Orchestration Layer** - Connects tools into unified workflows
5. **Support Status Automation** - Ticket lifecycle management
6. **Internal Ops Workflow** - Documented processes with task tracking
7. **Reliability Layer** - Logging, alerts, retries, runbooks (always include)

## Sync vs Async Mode

### Sync Mode (Default)

- `N8N_MODE=sync` or not set
- Backend waits up to 12 seconds for n8n response
- 2 retries with exponential backoff (0.8s, 1.6s)
- If timeout/failure, fallback diagnosis is generated

### Async Mode

- `N8N_MODE=async`
- Backend sends request and returns immediately
- n8n calls back to `POST /api/audit/callback` with results
- Callback must include same signature headers for verification

#### Callback Payload

```json
{
  "audit_id": "uuid",
  "diagnosis": {
    // Same structure as sync response
  }
}
```

## Idempotency

- Each request includes `X-AERELION-REQUEST-ID` (UUID)
- If the same request ID is received twice, return cached response
- The backend will not create duplicate diagnoses for the same audit

## Error Handling

If n8n returns an error or times out:

1. Backend logs the error with audit ID
2. Fallback diagnosis is generated using deterministic rules
3. User receives a valid diagnosis (marked with lower confidence)
4. `audits.n8n_status` is set to `failed` or `timeout`
5. `audits.error_message` contains the error details

## Security Notes

1. **Never expose webhook URL in frontend code**
2. **Always verify signatures in n8n before processing**
3. **Use HTTPS for all webhook URLs**
4. **Rotate `N8N_WEBHOOK_SECRET` periodically**
5. **Rate limit webhook endpoints in n8n**

## Testing

To test the integration:

1. Submit an audit through `/system-audit`
2. Check edge function logs for request/response
3. Verify diagnosis appears on result page
4. If n8n is down, confirm fallback diagnosis works

## Environment Variables Required

| Variable | Required | Description |
|----------|----------|-------------|
| `N8N_AUDITOR_WEBHOOK_URL` | Yes | n8n webhook endpoint |
| `N8N_WEBHOOK_SECRET` | Yes | HMAC signing secret |
| `APP_BASE_URL` | Yes | Base URL for links (e.g., `https://aerelion.com`) |
| `N8N_MODE` | No | `sync` (default) or `async` |
