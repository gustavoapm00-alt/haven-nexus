import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// In-memory rate limiter (per isolate)
// Note: Edge functions may spawn multiple isolates, so this is best-effort
// For production, consider using Redis or database-backed rate limiting
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute window

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);
  
  // Clean up expired entries periodically
  if (rateLimiter.size > 1000) {
    for (const [key, value] of rateLimiter) {
      if (value.resetAt < now) rateLimiter.delete(key);
    }
  }
  
  if (!userLimit || userLimit.resetAt < now) {
    rateLimiter.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: userLimit.resetAt - now };
  }
  
  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - userLimit.count, resetIn: userLimit.resetAt - now };
}

// Mask sensitive data for logging
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***';
  const maskedLocal = local.length > 2 ? local[0] + '***' + local[local.length - 1] : '***';
  return `${maskedLocal}@${domain}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let runId: string | null = null;

  try {
    const { agent_key, input_json, idempotency_key } = await req.json();

    // 1. Validate required fields
    if (!agent_key) {
      return new Response(
        JSON.stringify({ error: "agent_key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate agent_key format (alphanumeric, underscores, hyphens only)
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(agent_key)) {
      return new Response(
        JSON.stringify({ error: "Invalid agent_key format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate environment configuration
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[agents-run] Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!lovableApiKey) {
      console.error("[agents-run] LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Get auth header and resolve user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAnon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Check if user is admin (bypass subscription/entitlement checks)
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!adminRole;

    // 5. Rate limiting check (admins get higher limits)
    const rateCheck = checkRateLimit(user.id);
    const adminRateLimit = 100; // Admins get 100 requests per minute
    if (!rateCheck.allowed && !isAdmin) {
      console.log(`[agents-run] Rate limit exceeded for user ${user.id.substring(0, 8)}...`);
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          retry_after_ms: rateCheck.resetIn
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(rateCheck.resetIn / 1000).toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(Date.now() / 1000 + rateCheck.resetIn / 1000).toString()
          } 
        }
      );
    }

    // Log without PII
    console.log(`[agents-run] Request from ${isAdmin ? 'ADMIN' : 'user'} ${user.id.substring(0, 8)}... for agent: ${agent_key}`);

    let orgId: string | null = null;
    let subscription: any = null;

    // 6. Admins bypass org/subscription checks
    if (isAdmin) {
      console.log(`[agents-run] Admin bypass enabled for ${user.id.substring(0, 8)}...`);
      
      // Try to get org for tracking, but don't require it
      const { data: orgMembership } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      orgId = orgMembership?.org_id || null;
      
      // Create a virtual admin org if needed
      if (!orgId) {
        // Use a consistent admin org or create one
        const { data: adminOrg } = await supabase
          .from("orgs")
          .select("id")
          .eq("name", "Admin")
          .maybeSingle();
        
        if (adminOrg) {
          orgId = adminOrg.id;
        } else {
          // Create admin org
          const { data: newOrg } = await supabase
            .from("orgs")
            .insert({ name: "Admin" })
            .select()
            .single();
          
          if (newOrg) {
            orgId = newOrg.id;
            // Add admin to org
            await supabase
              .from("org_members")
              .insert({ org_id: orgId, user_id: user.id, role: "owner" });
          }
        }
      }
    } else {
      // Non-admin: require org membership
      const { data: orgMembership, error: orgError } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      if (orgError || !orgMembership) {
        return new Response(
          JSON.stringify({ error: "User not in any organization" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      orgId = orgMembership.org_id;

      // 7. Verify subscription status (non-admins only)
      const { data: sub, error: subError } = await supabase
        .from("org_subscriptions")
        .select("*, plans(*)")
        .eq("org_id", orgId)
        .single();

      if (subError || !sub) {
        return new Response(
          JSON.stringify({ error: "No active subscription", hint: "Please select a plan at /pricing" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!["active", "trialing"].includes(sub.status)) {
        return new Response(
          JSON.stringify({ error: "Subscription not active", status: sub.status }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      subscription = sub;

      // 8. Check entitlement (non-admins only)
      const { data: entitlement, error: entError } = await supabase
        .from("plan_entitlements")
        .select("*")
        .eq("plan_id", subscription.plan_id)
        .eq("agent_key", agent_key)
        .eq("included", true)
        .single();

      if (entError || !entitlement) {
        return new Response(
          JSON.stringify({ error: "Agent not included in your plan", agent_key }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 9. Check usage limits (non-admins only)
      const plan = subscription.plans as any;
      if (subscription.runs_used_this_period >= plan.monthly_run_limit) {
        return new Response(
          JSON.stringify({ 
            error: "Monthly run limit reached", 
            used: subscription.runs_used_this_period,
            limit: plan.monthly_run_limit
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 9. Load agent template
    const { data: agent, error: agentError } = await supabase
      .from("agent_catalog")
      .select("*")
      .eq("agent_key", agent_key)
      .eq("is_active", true)
      .single();

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({ error: "Agent not found or inactive", agent_key }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 10. Validate and sanitize input
    const sanitizedInput: Record<string, string> = {};
    const inputData = input_json || {};
    
    // Limit input size and sanitize values
    for (const [key, value] of Object.entries(inputData)) {
      // Skip invalid keys
      if (typeof key !== 'string' || key.length > 64) continue;
      // Limit value length
      const strValue = String(value || "").substring(0, 10000);
      sanitizedInput[key] = strValue;
    }

    // 11. Insert run record
    const { data: run, error: insertError } = await supabase
      .from("agent_runs")
      .insert({
        org_id: orgId,
        agent_key,
        status: "running",
        input_json: sanitizedInput,
        idempotency_key: idempotency_key || null,
      })
      .select()
      .single();

    if (insertError) {
      // Handle idempotency conflict
      if (insertError.code === "23505" && idempotency_key) {
        const { data: existingRun } = await supabase
          .from("agent_runs")
          .select("id, status, output_text, output_json")
          .eq("org_id", orgId)
          .eq("idempotency_key", idempotency_key)
          .single();

        if (existingRun) {
          return new Response(
            JSON.stringify({ 
              runId: existingRun.id, 
              status: existingRun.status, 
              output_text: existingRun.output_text,
              output_json: existingRun.output_json,
              idempotent: true 
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      console.error("[agents-run] Insert error:", insertError.message);
      return new Response(
        JSON.stringify({ error: "Failed to create run" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    runId = run.id;

    // 12. Render user prompt template
    let userPrompt = agent.user_prompt_template;
    for (const [key, value] of Object.entries(sanitizedInput)) {
      userPrompt = userPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
    // Remove any remaining placeholders
    userPrompt = userPrompt.replace(/\{\{\w+\}\}/g, "[not provided]");

    // 13. Call Lovable AI
    console.log(`[agents-run] Calling AI for run ${runId?.substring(0, 8) ?? 'unknown'}...`);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: agent.model || "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: agent.system_prompt },
          { role: "user", content: userPrompt },
        ],
        ...(agent.output_schema && {
          tools: [{
            type: "function",
            function: {
              name: "structured_output",
              description: "Return structured output",
              parameters: agent.output_schema,
            }
          }],
          tool_choice: { type: "function", function: { name: "structured_output" } },
        }),
      }),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error(`[agents-run] AI error: ${aiResponse.status}`);

      // Handle rate limiting
      if (aiResponse.status === 429) {
        await supabase
          .from("agent_runs")
          .update({ status: "failed", error: "Rate limited. Please try again later." })
          .eq("id", runId);

        return new Response(
          JSON.stringify({ runId, status: "failed", error: "Rate limited. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (aiResponse.status === 402) {
        await supabase
          .from("agent_runs")
          .update({ status: "failed", error: "AI credits exhausted. Please add credits." })
          .eq("id", runId);

        return new Response(
          JSON.stringify({ runId, status: "failed", error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("agent_runs")
        .update({ status: "failed", error: `AI error: ${aiResponse.status}` })
        .eq("id", runId);

      return new Response(
        JSON.stringify({ runId, status: "failed", error: "AI generation failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    
    let outputText: string | null = null;
    let outputJson: any = null;

    // Check for tool call (structured output)
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      try {
        outputJson = JSON.parse(toolCall.function.arguments);
      } catch {
        outputText = toolCall.function.arguments;
      }
    } else {
      outputText = aiData.choices?.[0]?.message?.content || "";
    }

    // 14. Update run with result and increment usage
    await supabase
      .from("agent_runs")
      .update({ 
        status: "succeeded", 
        output_text: outputText,
        output_json: outputJson,
      })
      .eq("id", runId);

    // Only update usage for non-admins with subscriptions
    if (subscription && orgId) {
      await supabase
        .from("org_subscriptions")
        .update({ 
          runs_used_this_period: subscription.runs_used_this_period + 1,
        })
        .eq("org_id", orgId);
    }

    console.log(`[agents-run] Completed run ${runId?.substring(0, 8) ?? 'unknown'}...`);

    return new Response(
      JSON.stringify({ 
        runId, 
        status: "succeeded",
        output_text: outputText,
        output_json: outputJson,
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": rateCheck.remaining.toString()
        } 
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    console.error("[agents-run] Error:", errorMessage);

    // Update run status if we have a runId
    if (runId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from("agent_runs")
          .update({ status: "failed", error: errorMessage })
          .eq("id", runId);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        runId: runId ?? null,
        status: "failed",
        error: errorMessage, 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
