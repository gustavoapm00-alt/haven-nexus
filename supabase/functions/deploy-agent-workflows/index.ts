import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS: Accept both the production domain and Lovable preview origins
const ALLOWED_ORIGINS = [
  'https://aerelion.systems',
  'https://haven-matrix.lovable.app',
  Deno.env.get('SITE_URL') || '',
].filter(Boolean);

function buildCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// AGENT_DEFINITIONS is now fetched from the agent_registry table at runtime.
// Fallback to static array only when DB is unavailable.
const AGENT_DEFINITIONS_FALLBACK = [
  { id: 'AG-01', module: 'SENTINEL',   has_site_scan: true  },
  { id: 'AG-02', module: 'LIBRARIAN',  has_site_scan: false },
  { id: 'AG-03', module: 'WATCHMAN',   has_site_scan: false },
  { id: 'AG-04', module: 'GATEKEEPER', has_site_scan: false },
  { id: 'AG-05', module: 'AUDITOR',    has_site_scan: false },
  { id: 'AG-06', module: 'CHRONICLER', has_site_scan: false },
  { id: 'AG-07', module: 'ENVOY',      has_site_scan: false },
];

/**
 * Build the n8n workflow JSON for a standard (non-Sentinel) agent heartbeat
 */
function buildStandardWorkflow(agent: { id: string; name: string; module: string }, supabaseFunctionsUrl: string, heartbeatSecret: string) {
  return {
    name: `AERELION_${agent.id}_${agent.module}_HEARTBEAT_2H`,
    nodes: [
      {
        parameters: {
          rule: { interval: [{ field: 'hours', hoursInterval: 2 }] }
        },
        id: `${agent.id.toLowerCase()}-schedule-trigger`,
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.2,
        position: [240, 300],
      },
      {
        parameters: {
          method: 'POST',
          url: `${supabaseFunctionsUrl}/agent-heartbeat`,
          sendHeaders: true,
          headerParameters: {
            parameters: [
              { name: 'Content-Type', value: 'application/json' },
              { name: 'x-heartbeat-key', value: heartbeatSecret },
            ],
          },
          sendBody: true,
          specifyBody: 'json',
          jsonBody: JSON.stringify({
            agent_id: agent.id,
            status: 'NOMINAL',
            message: `HEARTBEAT_2H_CYCLE`,
            metadata: {
              module: agent.module,
              cycle_iso: '={{ new Date().toISOString() }}',
              source: 'n8n_cron',
            },
          }),
          options: {},
        },
        id: `${agent.id.toLowerCase()}-heartbeat`,
        name: 'Heartbeat NOMINAL',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [480, 300],
      },
    ],
    connections: {
      'Schedule Trigger': {
        main: [[{ node: 'Heartbeat NOMINAL', type: 'main', index: 0 }]],
      },
    },
    settings: {
      executionOrder: 'v1',
      saveManualExecutions: true,
      callerPolicy: 'workflowsFromSameOwner',
    },
  };
}

/**
 * Build AG-01 Sentinel workflow with live HTTP scan
 */
function buildSentinelWorkflow(supabaseFunctionsUrl: string, heartbeatSecret: string) {
  return {
    name: 'AERELION_AG-01_SENTINEL_HEARTBEAT_2H',
    nodes: [
      {
        parameters: {
          rule: { interval: [{ field: 'hours', hoursInterval: 2 }] }
        },
        id: 'sentinel-2h-schedule-trigger',
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.2,
        position: [240, 300],
      },
      {
        parameters: {
          url: 'https://aerelion.systems',
          options: {
            response: { response: { fullResponse: true, neverError: true } },
            timeout: 15000,
          },
        },
        id: 'sentinel-http-scan',
        name: 'HTTP Scan Target',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [480, 300],
      },
      {
        parameters: {
          conditions: {
            conditions: [
              {
                id: 'condition-status-ok',
                leftValue: '={{ $json.statusCode }}',
                rightValue: 200,
                operator: { type: 'number', operation: 'equals' },
              },
            ],
            combinator: 'and',
          },
        },
        id: 'sentinel-if-validation',
        name: 'Validate Response',
        type: 'n8n-nodes-base.if',
        typeVersion: 2.2,
        position: [720, 300],
      },
      {
        parameters: {
          method: 'POST',
          url: `${supabaseFunctionsUrl}/agent-heartbeat`,
          sendHeaders: true,
          headerParameters: {
            parameters: [
              { name: 'Content-Type', value: 'application/json' },
              { name: 'x-heartbeat-key', value: heartbeatSecret },
            ],
          },
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={\n  "agent_id": "AG-01",\n  "status": "NOMINAL",\n  "message": "SCAN_COMPLETE_2H_CYCLE",\n  "metadata": {\n    "module": "SENTINEL",\n    "http_status": {{ $('HTTP Scan Target').item.json.statusCode }},\n    "scan_target": "https://aerelion.systems",\n    "cycle_iso": "{{ new Date().toISOString() }}",\n    "source": "n8n_cron"\n  }\n}`,
          options: {},
        },
        id: 'sentinel-heartbeat-pass',
        name: 'Heartbeat NOMINAL',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [960, 200],
      },
      {
        parameters: {
          method: 'POST',
          url: `${supabaseFunctionsUrl}/agent-heartbeat`,
          sendHeaders: true,
          headerParameters: {
            parameters: [
              { name: 'Content-Type', value: 'application/json' },
              { name: 'x-heartbeat-key', value: heartbeatSecret },
            ],
          },
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={\n  "agent_id": "AG-01",\n  "status": "DRIFT",\n  "message": "SCAN_FAIL_TIMEOUT",\n  "metadata": {\n    "module": "SENTINEL",\n    "http_status": {{ $('HTTP Scan Target').item.json.statusCode || 0 }},\n    "scan_target": "https://aerelion.systems",\n    "cycle_iso": "{{ new Date().toISOString() }}",\n    "source": "n8n_cron"\n  }\n}`,
          options: {},
        },
        id: 'sentinel-heartbeat-fail',
        name: 'Heartbeat DRIFT',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [960, 420],
      },
    ],
    connections: {
      'Schedule Trigger': {
        main: [[{ node: 'HTTP Scan Target', type: 'main', index: 0 }]],
      },
      'HTTP Scan Target': {
        main: [[{ node: 'Validate Response', type: 'main', index: 0 }]],
      },
      'Validate Response': {
        main: [
          [{ node: 'Heartbeat NOMINAL', type: 'main', index: 0 }],
          [{ node: 'Heartbeat DRIFT', type: 'main', index: 0 }],
        ],
      },
    },
    settings: {
      executionOrder: 'v1',
      saveManualExecutions: true,
      callerPolicy: 'workflowsFromSameOwner',
    },
  };
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Admin auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Admin role check
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin role required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse body for optional action
    const body = await req.json().catch(() => ({}));
    // Normalize action — accept both UI-sent 'PROBE_N8N' and lowercase 'probe'
    const rawAction: string = body.action || 'deploy';
    const action = rawAction.toUpperCase() === 'PROBE_N8N' ? 'probe' : rawAction; // 'deploy' | 'probe' | 'status' | 'activate_all'

    const n8nBaseUrl = Deno.env.get('N8N_BASE_URL');
    const n8nApiKey = Deno.env.get('N8N_API_KEY');
    const heartbeatSecret = Deno.env.get('HEARTBEAT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!n8nBaseUrl || !n8nApiKey || !heartbeatSecret || !supabaseUrl) {
      return new Response(JSON.stringify({ error: 'Missing required environment configuration' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Normalize base URL — ensure https:// protocol and strip trailing slash
    const rawBase = n8nBaseUrl.replace(/\/$/, '');
    const n8nBase = rawBase.startsWith('http://') || rawBase.startsWith('https://')
      ? rawBase
      : `https://${rawBase}`;
    const supabaseFunctionsUrl = `${supabaseUrl}/functions/v1`;
    const n8nHeaders = {
      'X-N8N-API-KEY': n8nApiKey,
      'Content-Type': 'application/json',
    };

    // ACTION: Connectivity probe — validates n8n API key before any deployment
    if (action === 'probe') {
      const probeRes = await fetch(`${n8nBase}/api/v1/workflows?limit=1`, {
        headers: n8nHeaders,
      });
      const probeBody = await probeRes.text();
      return new Response(JSON.stringify({
        status: probeRes.status,
        ok: probeRes.ok,
        n8n_base_url: n8nBase,
        key_length: n8nApiKey.length,
        key_prefix: n8nApiKey.slice(0, 8) + '...',
        response_preview: probeBody.slice(0, 300),
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Get status of existing AERELION workflows
    if (action === 'status') {
      const statusRes = await fetch(`${n8nBase}/api/v1/workflows?limit=100`, {
        headers: n8nHeaders,
      });

      if (!statusRes.ok) {
        const errText = await statusRes.text();
        return new Response(JSON.stringify({ error: `n8n API error: ${errText}` }), {
          status: statusRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const statusData = await statusRes.json();
      // Filter locally for AERELION workflows by name prefix
      const aerelionWorkflows = (statusData.data || []).filter((wf: { name: string }) =>
        wf.name.startsWith('AERELION_')
      );
      return new Response(JSON.stringify({ workflows: aerelionWorkflows, total: aerelionWorkflows.length }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: AUTONOMOUS_REMEDIATION — Deep Purge + Re-deploy from master template
    if (action === 'remediate_agent') {
      const agentId: string = body.agent_id;
      const driftType: 'ORPHAN' | 'LATENCY' | 'ERROR' = body.drift_type || 'ERROR';

      if (!agentId) {
        return new Response(JSON.stringify({ error: 'INVALID_REQUEST: agent_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate a unique CORRECTION_ID linking the failure to its remediation
      const correctionId = `COR-${agentId}-${Date.now().toString(36).toUpperCase()}`;
      const remediationStart = Date.now();

      // BUG-FIX: Use AERELION_SERVICE_ROLE_KEY (the configured secret name) with
      // SUPABASE_SERVICE_ROLE_KEY as fallback for compatibility.
      const serviceRoleKey =
        Deno.env.get('AERELION_SERVICE_ROLE_KEY') ||
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

      const serviceClientR = createClient(
        Deno.env.get('SUPABASE_URL')!,
        serviceRoleKey
      );

      try {
        // Step 1: Log REMEDIATION_INITIATED
        await serviceClientR.from('edge_function_logs').insert({
          function_name: 'deploy-agent-workflows',
          level: 'warn',
          message: `AUTONOMOUS_REMEDIATION_INITIATED: ${agentId} // CORRECTION_ID: ${correctionId}`,
          details: {
            correction_id: correctionId,
            agent_id: agentId,
            drift_type: driftType,
            phase: 'DEEP_PURGE',
            source: 'remediate_agent',
          },
        });

        // Step 2: DEEP_PURGE — find and delete all existing AERELION workflows for this agent
        const listRes = await fetch(`${n8nBase}/api/v1/workflows?limit=100`, { headers: n8nHeaders });
        if (!listRes.ok) throw new Error(`N8N_LIST_FAILED: ${listRes.status}`);

        const listData = await listRes.json();
        const targetPrefix = `AERELION_${agentId}_`;
        const toDelete = (listData.data || []).filter((wf: { name: string }) =>
          wf.name.startsWith(targetPrefix)
        );

        const purgeResults: string[] = [];
        for (const wf of toDelete) {
          // BUG-FIX: MUST await deactivate before delete — n8n returns 409 Conflict
          // if you attempt to DELETE an active workflow. The previous .catch(() => {})
          // was swallowing this silently, causing the re-deploy to collide with the
          // undead workflow and throw REDEPLOY_CREATION_FAILED on duplicate names.
          const deactivateRes = await fetch(`${n8nBase}/api/v1/workflows/${wf.id}/deactivate`, {
            method: 'POST', headers: n8nHeaders,
          });
          if (!deactivateRes.ok) {
            // Consume body to avoid resource leak, then log as non-fatal
            await deactivateRes.text().catch(() => {});
          }

          const delRes = await fetch(`${n8nBase}/api/v1/workflows/${wf.id}`, {
            method: 'DELETE', headers: n8nHeaders,
          });
          // Consume body to prevent Deno resource leak
          await delRes.text().catch(() => {});
          purgeResults.push(`${wf.id}:${delRes.ok ? 'PURGED' : `PURGE_FAILED_${delRes.status}`}`);
        }

        // Step 3: Fetch agent definition from registry
        const { data: agentDef } = await serviceClientR
          .from('agent_registry')
          .select('id, module, has_site_scan')
          .eq('id', agentId)
          .single();

        const fallbackDef = AGENT_DEFINITIONS_FALLBACK.find(a => a.id === agentId);
        const moduleName = agentDef?.module || fallbackDef?.module || agentId.replace('AG-0', 'AGENT_');
        const hasSiteScan = agentDef?.has_site_scan ?? fallbackDef?.has_site_scan ?? false;

        // Step 4: RE-DEPLOY from master AERELION template
        const workflowPayload = hasSiteScan
          ? buildSentinelWorkflow(supabaseFunctionsUrl, heartbeatSecret)
          : buildStandardWorkflow(
              { id: agentId, name: `THE ${moduleName}`, module: moduleName },
              supabaseFunctionsUrl,
              heartbeatSecret
            );

        const createRes = await fetch(`${n8nBase}/api/v1/workflows`, {
          method: 'POST',
          headers: n8nHeaders,
          body: JSON.stringify(workflowPayload),
        });

        if (!createRes.ok) {
          const errText = await createRes.text();
          throw new Error(`REDEPLOY_CREATION_FAILED: ${createRes.status} - ${errText.slice(0, 200)}`);
        }

        const created = await createRes.json();
        const newWorkflowId = created.id;

        // Step 5: Activate the freshly-deployed workflow
        const activateRes = await fetch(`${n8nBase}/api/v1/workflows/${newWorkflowId}/activate`, {
          method: 'POST', headers: n8nHeaders,
        });

        const activated = activateRes.ok;
        const duration = Date.now() - remediationStart;

        if (!activated) {
          throw new Error(`REDEPLOY_ACTIVATION_FAILED: workflow ${newWorkflowId} created but not activated`);
        }

        // Step 6: IMMUTABLE AUDIT — log REMEDIATION_SUCCESS with CORRECTION_ID
        await serviceClientR.from('edge_function_logs').insert({
          function_name: 'deploy-agent-workflows',
          level: 'info',
          message: `REMEDIATION_SUCCESS: ${agentId} // CORRECTION_ID: ${correctionId}`,
          details: {
            correction_id: correctionId,
            agent_id: agentId,
            drift_type: driftType,
            purged_workflows: purgeResults,
            new_workflow_id: newWorkflowId,
            duration_ms: duration,
            source: 'autonomous_remediation',
          },
          duration_ms: duration,
          status_code: 200,
        });

        return new Response(JSON.stringify({
          success: true,
          correction_id: correctionId,
          agent_id: agentId,
          drift_type: driftType,
          purged_count: toDelete.length,
          new_workflow_id: newWorkflowId,
          duration_ms: duration,
          status: 'REMEDIATION_SUCCESS',
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown remediation error';
        const duration = Date.now() - remediationStart;

        // IMMUTABLE AUDIT — log REMEDIATION_FAILURE with CORRECTION_ID
        await serviceClientR.from('edge_function_logs').insert({
          function_name: 'deploy-agent-workflows',
          level: 'error',
          message: `REMEDIATION_FAILURE: ${agentId} // CORRECTION_ID: ${correctionId}`,
          details: {
            correction_id: correctionId,
            agent_id: agentId,
            drift_type: driftType,
            error: errMsg,
            duration_ms: duration,
            source: 'autonomous_remediation',
          },
          duration_ms: duration,
          status_code: 500,
        }).catch(() => {});

        return new Response(JSON.stringify({
          success: false,
          correction_id: correctionId,
          agent_id: agentId,
          drift_type: driftType,
          error: errMsg,
          status: 'REMEDIATION_FAILURE',
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // ACTION: Activate all existing AERELION workflows
    if (action === 'activate_all') {
      const listRes = await fetch(`${n8nBase}/api/v1/workflows?limit=100`, {
        headers: n8nHeaders,
      });
      const listData = await listRes.json();
      // Filter locally for AERELION workflows by name prefix
      const workflows = (listData.data || []).filter((wf: { name: string }) =>
        wf.name.startsWith('AERELION_')
      );

      const results = await Promise.all(
        workflows.map(async (wf: { id: string; name: string; active: boolean }) => {
          if (wf.active) return { id: wf.id, name: wf.name, result: 'already_active' };
          const activateRes = await fetch(`${n8nBase}/api/v1/workflows/${wf.id}/activate`, {
            method: 'POST',
            headers: n8nHeaders,
          });
          return { id: wf.id, name: wf.name, result: activateRes.ok ? 'activated' : 'error' };
        })
      );

      return new Response(JSON.stringify({ activated: results }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Deploy all 7 heartbeat workflows
    // Fetch agent definitions from agent_registry (single source of truth)
    // BUG-FIX: Use correct secret name — AERELION_SERVICE_ROLE_KEY with fallback
    const deployServiceKey =
      Deno.env.get('AERELION_SERVICE_ROLE_KEY') ||
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      deployServiceKey
    );

    const { data: registryData } = await serviceClient
      .from('agent_registry')
      .select('id, module, has_site_scan')
      .order('sort_order', { ascending: true });

    const AGENTS = (registryData && registryData.length > 0)
      ? registryData.map((r: { id: string; module: string; has_site_scan: boolean }) => ({
          id: r.id,
          name: `THE ${r.module}`,
          module: r.module,
          hasSiteScan: r.has_site_scan,
        }))
      : AGENT_DEFINITIONS_FALLBACK.map(r => ({
          id: r.id,
          name: `THE ${r.module}`,
          module: r.module,
          hasSiteScan: r.has_site_scan,
        }));

    const deployResults = await Promise.all(
      AGENTS.map(async (agent) => {
        try {
          const workflowPayload = agent.hasSiteScan
            ? buildSentinelWorkflow(supabaseFunctionsUrl, heartbeatSecret)
            : buildStandardWorkflow(agent, supabaseFunctionsUrl, heartbeatSecret);

          // Create workflow via n8n API
          const createRes = await fetch(`${n8nBase}/api/v1/workflows`, {
            method: 'POST',
            headers: n8nHeaders,
            body: JSON.stringify(workflowPayload),
          });

          if (!createRes.ok) {
            const errText = await createRes.text();
            const errMsg = `n8n API error: ${createRes.status} - ${errText.slice(0, 200)}`;

            // COOP: Log LOGIC_DRIFT alert to immutable provenance — no silent failures
            await serviceClient.from('edge_function_logs').insert({
              function_name: 'deploy-agent-workflows',
              level: 'error',
              message: `LOGIC_DRIFT: ${agent.id} // WORKFLOW_CREATION_FAILED`,
              details: {
                agent_id: agent.id,
                module: agent.module,
                n8n_status: createRes.status,
                error_preview: errText.slice(0, 500),
                source: 'zero_touch_deployment',
                drift_type: 'PIPELINE_CREATION_FAILURE',
              },
              status_code: createRes.status,
            }).catch(() => { /* log write is non-blocking */ });

            return { agent_id: agent.id, status: 'error', message: errMsg };
          }

          const created = await createRes.json();
          const workflowId = created.id;

          // Activate the workflow — track latency for stabilization reporting
          const activateStart = Date.now();
          const activateRes = await fetch(`${n8nBase}/api/v1/workflows/${workflowId}/activate`, {
            method: 'POST',
            headers: n8nHeaders,
          });
          const activateLatencyMs = Date.now() - activateStart;

          const activated = activateRes.ok;

          // COOP: Log activation failure as LOGIC_DRIFT — no silent failures
          if (!activated) {
            const activateErrText = await activateRes.text().catch(() => 'UNREADABLE_RESPONSE');
            await serviceClient.from('edge_function_logs').insert({
              function_name: 'deploy-agent-workflows',
              level: 'warn',
              message: `LOGIC_DRIFT: ${agent.id} // ACTIVATION_FAILED_AFTER_CREATION`,
              details: {
                agent_id: agent.id,
                module: agent.module,
                workflow_id: workflowId,
                n8n_status: activateRes.status,
                error_preview: activateErrText.slice(0, 300),
                drift_type: 'PIPELINE_ACTIVATION_FAILURE',
                source: 'zero_touch_deployment',
              },
              status_code: activateRes.status,
            }).catch(() => { /* non-blocking */ });
          }

          // Log successful deployment with latency telemetry
          await serviceClient.from('edge_function_logs').insert({
            function_name: 'deploy-agent-workflows',
            level: activated ? 'info' : 'warn',
            message: `WORKFLOW_DEPLOYED: ${agent.id} // ${agent.module} // ${activated ? 'ACTIVE' : 'INACTIVE'}`,
            details: {
              agent_id: agent.id,
              workflow_id: workflowId,
              activated,
              activate_latency_ms: activateLatencyMs,
              latency_flag: activateLatencyMs > 500 ? 'HIGH_LATENCY' : 'NOMINAL',
              source: 'zero_touch_deployment',
            },
            status_code: 200,
            duration_ms: activateLatencyMs,
          });

          return {
            agent_id: agent.id,
            name: agent.name,
            workflow_id: workflowId,
            activated,
            latency_ms: activateLatencyMs,
            status: activated ? 'deployed_and_active' : 'deployed_inactive',
          };
        } catch (err) {
          // COOP: Catch-all — every exception becomes an immutable LOGIC_DRIFT record
          await serviceClient.from('edge_function_logs').insert({
            function_name: 'deploy-agent-workflows',
            level: 'error',
            message: `LOGIC_DRIFT: ${agent.id} // UNHANDLED_EXCEPTION`,
            details: {
              agent_id: agent.id,
              module: agent.module,
              error: err instanceof Error ? err.message : 'Unknown error',
              drift_type: 'UNHANDLED_PIPELINE_EXCEPTION',
              source: 'zero_touch_deployment',
            },
            status_code: 500,
          }).catch(() => { /* non-blocking */ });

          return {
            agent_id: agent.id,
            name: agent.name,
            status: 'error',
            message: err instanceof Error ? err.message : 'Unknown error',
          };
        }
      })
    );

    const successCount = deployResults.filter(r => r.status === 'deployed_and_active').length;
    const errorCount = deployResults.filter(r => r.status === 'error').length;

    return new Response(
      JSON.stringify({
        summary: {
          total: AGENTS.length,
          deployed_active: successCount,
          errors: errorCount,
        },
        results: deployResults,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
