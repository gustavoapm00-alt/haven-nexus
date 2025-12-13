import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

    // 2. Validate environment configuration
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY is not configured");
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

    // 4. Get user's org
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

    const orgId = orgMembership.org_id;

    // 5. Verify subscription status
    const { data: subscription, error: subError } = await supabase
      .from("org_subscriptions")
      .select("*, plans(*)")
      .eq("org_id", orgId)
      .single();

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({ error: "No active subscription", hint: "Please select a plan at /pricing/ecom" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["active", "trialing"].includes(subscription.status)) {
      return new Response(
        JSON.stringify({ error: "Subscription not active", status: subscription.status }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Check entitlement
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

    // 7. Check usage limits
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

    // 8. Load agent template
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

    // 9. Insert run record
    const { data: run, error: insertError } = await supabase
      .from("agent_runs")
      .insert({
        org_id: orgId,
        agent_key,
        status: "running",
        input_json: input_json || {},
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
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create run", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    runId = run.id;

    // 10. Render user prompt template
    let userPrompt = agent.user_prompt_template;
    const inputData = input_json || {};
    for (const [key, value] of Object.entries(inputData)) {
      userPrompt = userPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value || ""));
    }
    // Remove any remaining placeholders
    userPrompt = userPrompt.replace(/\{\{\w+\}\}/g, "[not provided]");

    // 11. Call Lovable AI
    console.log(`[agents-run] Calling Lovable AI for agent ${agent_key}, run ${runId}`);

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
      console.error(`[agents-run] Lovable AI error: ${aiResponse.status} ${errorBody}`);

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
        .update({ status: "failed", error: `AI error: ${aiResponse.status} ${errorBody.substring(0, 500)}` })
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

    // 12. Update run with result and increment usage
    await supabase
      .from("agent_runs")
      .update({ 
        status: "succeeded", 
        output_text: outputText,
        output_json: outputJson,
      })
      .eq("id", runId);

    await supabase
      .from("org_subscriptions")
      .update({ 
        runs_used_this_period: subscription.runs_used_this_period + 1,
      })
      .eq("org_id", orgId);

    console.log(`[agents-run] Successfully completed run ${runId}`);

    return new Response(
      JSON.stringify({ 
        runId, 
        status: "succeeded",
        output_text: outputText,
        output_json: outputJson,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("[agents-run] Unhandled error:", errorMessage, errorStack);

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
