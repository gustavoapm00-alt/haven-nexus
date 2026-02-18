import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENTS = [
  { id: 'AG-01', name: 'THE SENTINEL', module: 'SENTINEL', hasSiteScan: true },
  { id: 'AG-02', name: 'THE LIBRARIAN', module: 'LIBRARIAN', hasSiteScan: false },
  { id: 'AG-03', name: 'THE WATCHMAN', module: 'WATCHMAN', hasSiteScan: false },
  { id: 'AG-04', name: 'THE GATEKEEPER', module: 'GATEKEEPER', hasSiteScan: false },
  { id: 'AG-05', name: 'THE AUDITOR', module: 'AUDITOR', hasSiteScan: false },
  { id: 'AG-06', name: 'THE CHRONICLER', module: 'CHRONICLER', hasSiteScan: false },
  { id: 'AG-07', name: 'THE ENVOY', module: 'ENVOY', hasSiteScan: false },
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
            return { agent_id: agent.id, status: 'error', message: `n8n API error: ${createRes.status} - ${errText.slice(0, 200)}` };
          }

          const created = await createRes.json();
          const workflowId = created.id;

          // Activate the workflow
          const activateRes = await fetch(`${n8nBase}/api/v1/workflows/${workflowId}/activate`, {
            method: 'POST',
            headers: n8nHeaders,
          });

          const activated = activateRes.ok;

          // Log deployment to edge_function_logs
          const serviceClient = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
          );
          await serviceClient.from('edge_function_logs').insert({
            function_name: 'deploy-agent-workflows',
            level: 'info',
            message: `WORKFLOW_DEPLOYED: ${agent.id} // ${agent.module}`,
            details: {
              agent_id: agent.id,
              workflow_id: workflowId,
              activated,
              source: 'zero_touch_deployment',
            },
            status_code: 200,
          });

          return {
            agent_id: agent.id,
            name: agent.name,
            workflow_id: workflowId,
            status: activated ? 'deployed_and_active' : 'deployed_inactive',
          };
        } catch (err) {
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
