
# AERELION // LIFE_INFUSION_PROTOCOL (V2.06)

## Objective

Transform the Elite 7 Agent Grid from static UI cards into **state-aware, reactive logic circuits** powered by Supabase Realtime subscriptions. Each agent will listen to live database events, transition between operational states (NOMINAL, PROCESSING, DRIFT, ERROR), and display animated visual feedback.

---

## 1. Database Foundation -- `agent_heartbeats` Table

Create a new `agent_heartbeats` table to serve as the central nervous system for all agent state tracking. This table receives status signals from n8n cron jobs and internal system events.

**Schema:**
| Column | Type | Default |
|---|---|---|
| id | uuid | gen_random_uuid() |
| agent_id | text | required (e.g. AG-01) |
| status | text | 'NOMINAL' |
| message | text | '' |
| metadata | jsonb | {} |
| created_at | timestamptz | now() |

**RLS:** Admin-only SELECT. Service role INSERT (via edge functions). No public access.

**Realtime:** Enable via `ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_heartbeats;`

This gives every agent a dedicated data channel to listen on.

---

## 2. Agent State Hook -- `useAgentStatus.ts`

Create `src/hooks/useAgentStatus.ts` -- a single hook that manages the state of all 7 agents.

**Logic:**
- On mount, fetch the latest heartbeat row per agent_id from `agent_heartbeats`
- Subscribe to Supabase Realtime on `agent_heartbeats` for INSERT events
- When a new heartbeat arrives, update the corresponding agent's state
- Derive a status enum per agent: `NOMINAL` (green), `PROCESSING` (green pulse), `DRIFT` (amber border + button flash), `ERROR` (red border)
- Expose: `agentStatuses: Record<string, { status, message, lastSeen, metadata }>`

**Fallback:** If no heartbeat has been received for an agent in the last 10 minutes, auto-degrade to `OFFLINE` (dim gray).

---

## 3. Agent Subscriptions -- Dual-Channel Listeners

In addition to the `agent_heartbeats` channel, two agents get secondary listeners:

- **AG-06 (Chronicler) and AG-07 (Envoy)**: Also subscribe to `edge_function_logs` (already enabled for Realtime). When a new log arrives, AG-06's "last event" counter increments and its status pulses to PROCESSING for 2 seconds before returning to NOMINAL.

This leverages the existing `useEdgeFunctionLogs` hook and the Realtime subscription already configured for that table.

---

## 4. SystemGrid Refactor -- Reactive Cards

Refactor `SystemGrid.tsx` to consume the `useAgentStatus` hook and render state-driven visuals:

**Per-card state rendering:**
- **NOMINAL**: Current green pulse (unchanged)
- **PROCESSING**: Framer-motion scanline animation (a 1px green line sweeping horizontally across the card, 2s duration, repeat)
- **DRIFT**: Border transitions to amber (`#FFBF00`), `[FORCE_STABILIZATION]` button becomes permanently visible and flashes at 2Hz using a CSS animation
- **ERROR**: Border transitions to red (`#FF4444`), pulse dot turns red
- **OFFLINE**: All colors dim to `#222`, pulse stops

**Additional per-card data:**
- Display `LAST_SIGNAL: {relative time}` below the SYSTEM_IMPACT tag
- Show the latest heartbeat message as a one-line truncated status string

**Animations** (framer-motion):
- Scanline sweep on PROCESSING state using `motion.div` with `animate={{ x: ['0%', '100%'] }}`
- Border color transitions using `animate={{ borderColor }}` with 0.3s spring

---

## 5. FORCE_STABILIZATION Button Logic

When clicked, the `[FORCE_STABILIZATION]` button will:
1. Insert a row into `agent_heartbeats` with `status: 'NOMINAL'` and `message: 'MANUAL_STABILIZATION'` for that agent
2. Visually reset the card to NOMINAL state
3. Show a brief flash confirmation (green glow pulse, 500ms)

This requires the admin user to have INSERT permission on `agent_heartbeats`, so the RLS policy will allow authenticated admins to insert.

---

## 6. Heartbeat Edge Function -- `agent-heartbeat`

Create `supabase/functions/agent-heartbeat/index.ts`:
- Accepts POST with `{ agent_id, status, message, metadata }`
- Validates the agent_id is one of AG-01 through AG-07
- Inserts into `agent_heartbeats` using service role
- Returns 200 with the inserted row

This endpoint can be called by n8n cron jobs to send periodic NOMINAL signals, or by internal processes to report DRIFT/ERROR states. The function uses `verify_jwt = false` in config.toml but validates a shared secret header (`X-Heartbeat-Key`) to prevent unauthorized inserts.

---

## 7. Cleanup -- Auto-Purge Old Heartbeats

Add a database function `cleanup_old_heartbeats()` that deletes heartbeats older than 24 hours, similar to the existing `cleanup_old_edge_logs()` pattern.

---

## Technical Details

### Files to Create
| File | Purpose |
|---|---|
| `src/hooks/useAgentStatus.ts` | Realtime agent state management hook |
| `supabase/functions/agent-heartbeat/index.ts` | Heartbeat ingestion endpoint for n8n |

### Files to Edit
| File | Change |
|---|---|
| `src/components/nexus/SystemGrid.tsx` | Consume useAgentStatus, add framer-motion animations, state-driven rendering |
| `supabase/config.toml` | Add `[functions.agent-heartbeat]` with `verify_jwt = false` |

### Database Changes
| Change | SQL |
|---|---|
| Create `agent_heartbeats` table | CREATE TABLE with RLS policies |
| Enable Realtime | ALTER PUBLICATION |
| Cleanup function | CREATE FUNCTION cleanup_old_heartbeats() |

### What Remains Untouched
- NexusCommand.tsx layout (no changes needed)
- LiveProvenanceLog.tsx (already functional)
- RegulatorDiagram.tsx (unchanged)
- All public-facing pages
- All existing admin functionality

### Secret Required
- `HEARTBEAT_SECRET`: A shared key for the agent-heartbeat edge function. You will be prompted to set this before deployment.

### n8n Integration (Post-Build)
After this build, you can create a simple n8n workflow:
1. Cron trigger (every 5 minutes)
2. HTTP Request node: POST to `{SUPABASE_URL}/functions/v1/agent-heartbeat` with header `X-Heartbeat-Key: {secret}` and body `{ "agent_id": "AG-06", "status": "NOMINAL", "message": "HEARTBEAT_CYCLE" }`
3. Watch AG-06 (The Chronicler) light up in the Shadow Command Center
