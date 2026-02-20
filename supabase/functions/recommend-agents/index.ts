import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createLogger } from "../_shared/edge-logger.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EngagementSignals {
  primary_goal: string | null;
  operational_pain: string;
  current_tools: string[] | null;
  calm_in_30_days: string | null;
  team_size: string | null;
  company_name: string | null;
}

interface AgentSummary {
  id: string;
  slug: string;
  name: string;
  short_outcome: string;
  description: string;
  sectors: string[];
  systems: string[];
  price_cents: number;
  capacity_recovered_min: number;
  capacity_recovered_max: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const logger = createLogger("recommend-agents", req);

  try {
    // 1. JWT validation
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token || token.split(".").length !== 3) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 2. Parse request
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const { engagement_request_id } = body as { engagement_request_id?: string };
    if (!engagement_request_id || typeof engagement_request_id !== "string") {
      return new Response(JSON.stringify({ error: "engagement_request_id required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 3. Auth check - admin only
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    logger.setUserId(user.id);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 4. Fetch engagement request
    const { data: engagement, error: engError } = await supabase
      .from("engagement_requests")
      .select("primary_goal, operational_pain, current_tools, calm_in_30_days, team_size, company_name")
      .eq("id", engagement_request_id)
      .single();

    if (engError || !engagement) {
      return new Response(JSON.stringify({ error: "Engagement request not found" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 5. Fetch all published agents
    const { data: agents, error: agentsError } = await supabase
      .from("automation_agents")
      .select("id, slug, name, short_outcome, description, sectors, systems, price_cents, capacity_recovered_min, capacity_recovered_max")
      .eq("status", "published");

    if (agentsError) throw agentsError;

    if (!agents || agents.length === 0) {
      return new Response(JSON.stringify({ recommendations: [], reasoning: "No published agents available." }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // 6. Build AI prompt
    const signals = engagement as EngagementSignals;
    const agentCatalog = (agents as AgentSummary[]).map(a => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      outcome: a.short_outcome,
      description: a.description,
      sectors: a.sectors,
      systems: a.systems,
      hours_recovered: `${a.capacity_recovered_min}-${a.capacity_recovered_max}`,
    }));

    const systemPrompt = `You are the AERELION Recommendation Engine. You analyze client engagement signals and match them to automation agents from a catalog.

Rules:
- Return ONLY a tool call with structured recommendations
- Rank by relevance to the client's operational pain and goals
- Maximum 5 recommendations, minimum 1
- Each recommendation must include a confidence score (0-100) and a brief rationale
- Consider the client's current tools when assessing fit
- Be precise and clinical in your reasoning`;

    const userPrompt = `## Client Engagement Signals

**Primary Goal:** ${signals.primary_goal || "Not specified"}
**Operational Pain:** ${signals.operational_pain}
**Current Tools:** ${Array.isArray(signals.current_tools) ? signals.current_tools.join(", ") : "None specified"}
**Calm in 30 Days:** ${signals.calm_in_30_days || "Not specified"}
**Team Size:** ${signals.team_size || "Not specified"}
**Company:** ${signals.company_name || "Not specified"}

## Available Agent Catalog

${JSON.stringify(agentCatalog, null, 2)}

Analyze the client's signals and recommend the most relevant agents from the catalog.`;

    // 7. Call Lovable AI with tool calling for structured output
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_agents",
              description: "Return ranked agent recommendations with confidence scores and rationale.",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "A 1-2 sentence executive summary of the client's needs and why these agents were selected.",
                  },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        agent_id: { type: "string", description: "The agent ID from the catalog" },
                        agent_name: { type: "string" },
                        confidence: { type: "number", description: "0-100 confidence score" },
                        rationale: { type: "string", description: "Why this agent matches the client's needs" },
                        impact_statement: { type: "string", description: "Expected operational impact in one sentence" },
                      },
                      required: ["agent_id", "agent_name", "confidence", "rationale", "impact_statement"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["summary", "recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recommend_agents" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "recommend_agents") {
      throw new Error("AI did not return structured recommendations");
    }

    let result: { summary: string; recommendations: Array<{ agent_id: string; agent_name: string; confidence: number; rationale: string; impact_statement: string }> };
    try {
      result = JSON.parse(toolCall.function.arguments);
    } catch {
      throw new Error("Failed to parse AI recommendation output");
    }

    // 8. Provenance log
    await logger.logResponse(200, `Generated ${result.recommendations.length} recommendations for engagement ${engagement_request_id}`, {
      engagement_request_id,
      recommendation_count: result.recommendations.length,
      top_agent: result.recommendations[0]?.agent_name ?? "none",
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[SYSTEM CRITICAL] Recommendation Engine Failure: ${message}`);
    await logger.logResponse(500, `Recommendation engine failure: ${message}`);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
