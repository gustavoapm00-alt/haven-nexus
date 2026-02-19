import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * ASYNC PROVISIONING QUEUE PROCESSOR
 * AERELION // SYS.OPS.V2.06 // STAGE_3_ARCHITECT
 *
 * Decouples VPS provisioning from synchronous HTTP chains.
 * Called by a cron schedule every 60 seconds to drain the queue.
 *
 * Supported actions:
 *   - provision_vps: Trigger Hostinger VPS provisioning
 *   - deploy_agents: Inject Elite 7 agent workflows into a running VPS
 *   - activate_workflows: Activate n8n workflows for a given activation
 *
 * Compensating rollback logic is baked into each action handler.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") || "https://haven-matrix.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Validate cron secret OR require an admin JWT for manual invocation.
  const cronSecret = Deno.env.get("CRON_SECRET");
  const authHeader = req.headers.get("Authorization");
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    // Manual trigger path: require a valid admin JWT (not just any authenticated user)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const token = authHeader?.replace("Bearer ", "") || "";
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await serviceClient.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleData } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Claim up to 5 queued/retrying jobs atomically via FOR UPDATE SKIP LOCKED.
  // Using a DB function avoids the race window of a separate select + update.
  const { data: jobs, error: claimError } = await supabase
    .rpc("claim_provisioning_jobs", { p_limit: 5 });

  if (claimError) {
    console.error("[queue-processor] Failed to claim jobs:", claimError);
    return new Response(JSON.stringify({ error: "Failed to fetch queue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!jobs || jobs.length === 0) {
    return new Response(JSON.stringify({ processed: 0, message: "QUEUE_EMPTY" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`[queue-processor] Processing ${jobs.length} job(s)`);

  const results: Array<{ id: string; action: string; status: string; error?: string }> = [];

  for (const job of jobs) {
    // Job is already marked 'processing' by claim_provisioning_jobs (atomic).
    try {
      let outcome = "completed";
      let errorMsg: string | null = null;

      if (job.action === "provision_vps") {
        // Delegate to the hostinger-provision edge function
        const resp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/hostinger-provision`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: job.user_id,
            activation_request_id: job.activation_request_id,
            ...(job.payload as Record<string, unknown>),
          }),
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`hostinger-provision returned ${resp.status}: ${text.slice(0, 200)}`);
        }

      } else if (job.action === "deploy_agents") {
        // Delegate to deploy-agent-workflows
        const resp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/deploy-agent-workflows`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "deploy", ...(job.payload as Record<string, unknown>) }),
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`deploy-agent-workflows returned ${resp.status}: ${text.slice(0, 200)}`);
        }

      } else if (job.action === "activate_workflows") {
        // Delegate to duplicate-and-activate
        const resp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/duplicate-and-activate`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(job.payload),
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`duplicate-and-activate returned ${resp.status}: ${text.slice(0, 200)}`);
        }

      } else {
        throw new Error(`Unknown action: ${job.action}`);
      }

      await supabase.from("provisioning_queue").update({
        status: outcome,
        completed_at: new Date().toISOString(),
        last_error: null,
      }).eq("id", job.id);

      // Log to provenance
      await supabase.from("edge_function_logs").insert({
        function_name: "queue-processor",
        level: "info",
        message: `QUEUE_JOB_COMPLETE: ${job.action} for user ${job.user_id}`,
        details: { job_id: job.id, action: job.action, attempt: job.attempt_count + 1 },
        user_id: job.user_id,
      }).select().single();

      results.push({ id: job.id, action: job.action, status: "completed" });

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const nextAttempt = job.attempt_count + 1;
      const isFinalAttempt = nextAttempt >= job.max_attempts;
      const retryDelay = Math.min(60 * Math.pow(2, nextAttempt), 3600); // exponential backoff, max 1h

      await supabase.from("provisioning_queue").update({
        status: isFinalAttempt ? "failed" : "retrying",
        last_error: errMsg,
        scheduled_at: isFinalAttempt ? undefined : new Date(Date.now() + retryDelay * 1000).toISOString(),
      }).eq("id", job.id);

      // Log failure to provenance
      await supabase.from("edge_function_logs").insert({
        function_name: "queue-processor",
        level: isFinalAttempt ? "error" : "warn",
        message: `QUEUE_JOB_${isFinalAttempt ? "FAILED" : "RETRYING"}: ${job.action} — ${errMsg.slice(0, 200)}`,
        details: { job_id: job.id, action: job.action, attempt: nextAttempt, retry_in_seconds: retryDelay },
        user_id: job.user_id,
      }).select().single();

      results.push({ id: job.id, action: job.action, status: isFinalAttempt ? "failed" : "retrying", error: errMsg });
      console.error(`[queue-processor] Job ${job.id} (${job.action}) failed attempt ${nextAttempt}:`, errMsg);
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
