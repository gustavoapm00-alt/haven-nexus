# n8n Integration Enterprise Audit - 2026-02-04

## Executive Summary

Conducted comprehensive enterprise-grade audit of the n8n integration pipeline focusing on:
- Edge Functions (n8n-provision, duplicate-and-activate, runtime-credentials)
- OAuth Flow (oauth-start, oauth-callback)
- Credential Management (store/read/revoke-activation-credentials, connect-integration)
- Frontend Hooks (useN8nProvisioning, useIntegrationConnections, useActivationStatus)
- Database Schema and RLS Policies

## Architecture Validation ✅

The "Connect Once. Run Many." architecture is correctly implemented:

1. **Template-Based Provisioning**: Immutable templates in `n8n_workflow_templates` are duplicated per-client
2. **Deterministic Webhook Isolation**: Each activation gets `aerelion/{activation_request_id}` path
3. **User-Level Credentials**: OAuth tokens stored in `integration_connections` at user level, not per-activation
4. **Runtime Credential Resolution**: `runtime-credentials` API fetches decrypted tokens at execution time

## Issues Found & Fixed

### 1. CRITICAL: ConnectorScreen OAuth Flow (FIXED)
**Location**: `src/pages/portal/ConnectorScreen.tsx`, `src/pages/library/ConnectorScreen.tsx`
**Issue**: Hardcoded OAuth URLs with empty client IDs instead of using `oauth-start` edge function
**Fix**: Replaced with proper `oauth-start` edge function call with CSRF protection

### 2. MODERATE: n8n-provision Email Assertion (FIXED)
**Location**: `supabase/functions/n8n-provision/index.ts:179`
**Issue**: `user.email!` assertion without null check could throw runtime error
**Fix**: Added explicit null check with proper error response

### 3. INFO: Missing OAuth Client Secrets
**Location**: Edge Function Secrets
**Issue**: OAuth providers (Google, HubSpot, Slack) require client credentials
**Required Secrets**:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `HUBSPOT_CLIENT_ID`
- `HUBSPOT_CLIENT_SECRET`
- `HUBSPOT_REDIRECT_URI`
- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`
- `SLACK_REDIRECT_URI`
- `NOTION_CLIENT_ID`
- `NOTION_CLIENT_SECRET`
- `NOTION_REDIRECT_URI`
- `SITE_URL` (for oauth-callback redirects)

## Security Audit Results ✅

### Encryption
- **AES-256-GCM** used consistently across all credential storage
- Encryption key validated as 32 bytes before use
- IV and auth tag stored separately
- Decryption only happens server-side in edge functions

### Authentication
- All edge functions properly validate JWT tokens
- `runtime-credentials` uses constant-time comparison for N8N_API_KEY
- Admin-only endpoints use `requireAdminAuth` helper
- CSRF protection via oauth_states table with 15-minute expiry

### Authorization
- User ownership verified before credential operations
- Activation requests verified against user email
- n8n-provision validates user owns the activation request

### Data Protection
- Credentials never logged (console outputs redacted)
- `Cache-Control: no-store` on credential responses
- Revoked credentials marked but not immediately deleted

## Database Schema Validation

### n8n_mappings Table
| Column | Purpose | Status |
|--------|---------|--------|
| `webhook_url` | Per-activation webhook (dedicated column) | ✅ Correct |
| `n8n_workflow_ids` | Created workflow IDs in n8n | ✅ Correct |
| `n8n_credential_ids` | Created credential IDs in n8n | ✅ Correct |
| `status` | provisioning/active/paused/revoked/error | ✅ Correct |

### integration_connections Table
| Column | Purpose | Status |
|--------|---------|--------|
| `activation_request_id` | Always NULL (user-level) | ✅ Correct |
| `encrypted_payload` | AES-256-GCM encrypted tokens | ✅ Correct |
| `user_id` | Connection owner | ✅ Correct |

### automation_agents Table
| Column | Purpose | Status |
|--------|---------|--------|
| `webhook_url` | DEPRECATED - all NULL | ✅ Correct |
| `n8n_template_ids` | Links to immutable templates | ✅ Correct |
| `required_integrations` | Providers needed for activation | ✅ Correct |

## Lifecycle Actions Verified

| Action | Edge Function | Database Update | n8n API Call |
|--------|---------------|-----------------|--------------|
| activate | n8n-provision → duplicate-and-activate | n8n_mappings.status='active', installation_requests.status='live' | POST /workflows, POST /credentials, POST /workflows/{id}/activate |
| pause | n8n-provision | n8n_mappings.status='paused', installation_requests.status='paused' | POST /workflows/{id}/deactivate |
| resume | n8n-provision | n8n_mappings.status='active', installation_requests.status='live' | POST /workflows/{id}/activate |
| revoke | n8n-provision | n8n_mappings.status='revoked', installation_requests.status='completed' | POST /workflows/{id}/deactivate + verification |
| retrigger | n8n-provision | webhook_status updated | POST {webhook_url} |

## Recommendations

### Immediate Actions Required
1. **Add OAuth Client Secrets**: Configure Google, HubSpot, Slack OAuth credentials in Cloud Secrets
2. **Add SITE_URL Secret**: Set to `https://haven-matrix.lovable.app` for OAuth callback redirects

### Future Improvements
1. **Token Refresh**: Implement automatic OAuth token refresh before expiry
2. **Health Checks**: Add periodic workflow health checks in n8n
3. **Audit Logging**: Expand edge_function_logs to capture all credential access events
4. **Rate Limiting**: Add rate limits to connect-integration endpoint

## Verified Secrets (Configured)
- ✅ CREDENTIAL_ENCRYPTION_KEY
- ✅ N8N_API_KEY
- ✅ N8N_BASE_URL
- ✅ STRIPE_SECRET_KEY
- ✅ STRIPE_LIBRARY_WEBHOOK_SECRET

## Missing Secrets (Action Required)
- ❌ GOOGLE_CLIENT_ID
- ❌ GOOGLE_CLIENT_SECRET
- ❌ GOOGLE_REDIRECT_URI
- ❌ HUBSPOT_CLIENT_ID
- ❌ HUBSPOT_CLIENT_SECRET
- ❌ HUBSPOT_REDIRECT_URI
- ❌ SLACK_CLIENT_ID
- ❌ SLACK_CLIENT_SECRET
- ❌ SLACK_REDIRECT_URI
- ❌ NOTION_CLIENT_ID
- ❌ NOTION_CLIENT_SECRET
- ❌ NOTION_REDIRECT_URI
- ❌ SITE_URL

---

**Audit Conducted By**: Lovable AI
**Date**: 2026-02-04
**Status**: PASSED (with action items)
