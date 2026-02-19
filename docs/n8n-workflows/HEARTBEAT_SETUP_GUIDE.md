# AERELION // HEARTBEAT_PIPELINE // SETUP_GUIDE

## Overview

7 n8n workflows maintain perpetual NOMINAL status across all Elite 7 agents.
Each workflow fires every 2 hours and POSTs to the `agent-heartbeat` edge function.
AG-01 (Sentinel) additionally performs a live HTTP scan of `https://aerelion.systems`
and will send DRIFT if the site is unreachable.

---

## Step 1 — Configure n8n Environment Variables

In your n8n instance, go to **Settings → Variables** and create:

| Variable Name | Value |
|---|---|
| `HEARTBEAT_SECRET` | *(your secret — same value as stored in Lovable Cloud secrets)* |
| `SUPABASE_FUNCTIONS_URL` | `https://YOUR_PROJECT_REF.supabase.co/functions/v1` |

> ⚠️ The `HEARTBEAT_SECRET` must exactly match the `HEARTBEAT_SECRET` stored in your Lovable Cloud backend secrets.

---

## Step 2 — Import the Workflows

Import each file into n8n via **Workflows → Import from file**:

| File | Agent | Trigger |
|---|---|---|
| `AG-01_SENTINEL_HEARTBEAT_2H.json` | AG-01 // THE SENTINEL | Every 2h + live site scan |
| `AG-02_LIBRARIAN_HEARTBEAT.json` | AG-02 // THE LIBRARIAN | Every 2h |
| `AG-03_WATCHMAN_HEARTBEAT.json` | AG-03 // THE WATCHMAN | Every 2h |
| `AG-04_GATEKEEPER_HEARTBEAT.json` | AG-04 // THE GATEKEEPER | Every 2h |
| `AG-05_AUDITOR_HEARTBEAT.json` | AG-05 // THE AUDITOR | Every 2h |
| `AG-06_CHRONICLER_HEARTBEAT.json` | AG-06 // THE CHRONICLER | Every 2h |
| `AG-07_ENVOY_HEARTBEAT.json` | AG-07 // THE ENVOY | Every 2h |

---

## Step 3 — Activate Each Workflow

After importing each workflow:
1. Open the workflow
2. Click **Activate** (toggle in the top-right)
3. Optionally click **Execute Workflow** to send an immediate test heartbeat

---

## Step 4 — Verify in Nexus

1. Navigate to `/ths/verify` and complete THS challenge
2. Access `/nexus/cmd`
3. All 7 agent cards should show **NOMINAL** (green pulse) within seconds of the first execution

---

## Node Configuration Reference

### HTTP Request node (Heartbeat POST)

```
Method: POST
URL: {{ $env.SUPABASE_FUNCTIONS_URL }}/agent-heartbeat

Headers:
  Content-Type: application/json
  x-heartbeat-key: {{ $env.HEARTBEAT_SECRET }}

Body (JSON):
{
  "agent_id": "AG-XX",
  "status": "NOMINAL",
  "message": "HEARTBEAT_CYCLE",
  "metadata": {
    "module": "MODULE_NAME",
    "cycle_iso": "{{ new Date().toISOString() }}",
    "source": "n8n_cron"
  }
}
```

---

## Heartbeat Endpoint

```
POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/agent-heartbeat
```

**Required header:**
```
x-heartbeat-key: <HEARTBEAT_SECRET>
```

**Valid agent_id values:** `AG-01`, `AG-02`, `AG-03`, `AG-04`, `AG-05`, `AG-06`, `AG-07`

**Valid status values:** `NOMINAL`, `PROCESSING`, `DRIFT`, `ERROR`

---

## OFFLINE Threshold

The Nexus SystemGrid marks an agent OFFLINE if no heartbeat has been received in **4 hours**.
With 2-hour cron intervals, each agent sends signals at the 0h and 2h marks — comfortably within the 4-hour window.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Agent shows OFFLINE | Cron not activated | Activate workflow in n8n |
| 401 Unauthorized | Wrong HEARTBEAT_SECRET | Re-check n8n variable vs Lovable Cloud secret |
| 400 Invalid agent_id | Typo in agent_id | Must be exactly `AG-01` through `AG-07` |
| AG-01 shows DRIFT | aerelion.systems unreachable | Check site uptime; AG-01 will auto-recover |
