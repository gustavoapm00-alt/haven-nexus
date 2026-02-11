# AG-01 // THE SENTINEL — n8n Workflow Specification

## Workflow: `AERELION_SENTINEL_SECURITY_SWEEP`

### Purpose
Automated 15-minute security sweep of `https://aerelion.systems` with SSL validation, HTTP status checks, and response time monitoring. Results are transmitted to the AERELION Heartbeat Protocol as AG-01 telemetry.

### Node Architecture

```
[Schedule Trigger] → [HTTP Scan] → [If/Else Validation] → [Heartbeat POST]
   (15 min)        (GET target)    (status + SSL check)    (agent-heartbeat)
```

### Required n8n Credentials
- None (uses header-based auth via `x-heartbeat-key`)

### Required n8n Environment Variables
- `HEARTBEAT_SECRET` — Must match the Supabase secret
- `SUPABASE_FUNCTIONS_URL` — e.g. `https://<project-id>.supabase.co/functions/v1`

### Metadata Schema (sent in heartbeat)
```json
{
  "scan_percent": 100,
  "ssl_valid": true,
  "response_time_ms": 142,
  "http_status": 200,
  "scan_target": "https://aerelion.systems",
  "last_scan_iso": "2026-02-11T12:00:00.000Z"
}
```

---

## Workflow JSON

See `AG-01_SENTINEL_SWEEP.json` below. Import directly into n8n.

### Installation
1. Import the JSON into your n8n instance
2. Set the `HEARTBEAT_SECRET` value in the HTTP Request (Heartbeat) node header
3. Set the correct Supabase Functions URL in the Heartbeat node
4. Activate the workflow

### Heartbeat Contract
- `agent_id`: `AG-01`
- `status`: `NOMINAL` (pass) or `DRIFT` (fail)
- `message`: Dynamic — e.g. `SCAN_COMPLETE_200_142ms` or `SCAN_FAIL_503`
