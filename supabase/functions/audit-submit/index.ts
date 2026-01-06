import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HMAC-SHA256 signing
async function signPayload(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Fallback diagnosis engine
function generateFallbackDiagnosis(audit: any): any {
  // Base hours by tool entropy
  let leakLow = 6, leakHigh = 10;
  if (audit.tool_entropy === "tools_3_5") {
    leakLow = 10; leakHigh = 16;
  } else if (audit.tool_entropy === "tools_6_plus") {
    leakLow = 14; leakHigh = 22;
  }

  // Absence modifier
  if (audit.absence_test_48h === "things_slip") {
    leakLow += 4; leakHigh += 8;
  } else if (audit.absence_test_48h === "someone_fills_gaps_manually") {
    leakLow += 3; leakHigh += 6;
  } else if (audit.absence_test_48h === "systems_mostly_hold") {
    leakLow -= 2; leakHigh -= 4;
  } else {
    leakHigh += 2;
  }

  // Breakdown modifier
  if (audit.breakdown_first === "approvals_stall_decisions") {
    leakLow += 2; leakHigh += 6;
  } else if (audit.breakdown_first === "creates_customer_confusion") {
    leakLow += 2; leakHigh += 5;
  } else if (audit.breakdown_first === "someone_patches_manually") {
    leakLow += 2; leakHigh += 4;
  } else if (audit.breakdown_first === "things_slip_quietly") {
    leakLow += 3; leakHigh += 6;
  } else {
    leakHigh += 2;
  }

  // Volume modifier
  if (audit.operational_volume === "low_volume_chaotic") {
    leakLow += 2; leakHigh += 5;
  } else if (audit.operational_volume === "steady_weekly") {
    leakLow += 3; leakHigh += 7;
  } else if (audit.operational_volume === "high_throughput") {
    leakLow += 5; leakHigh += 10;
  }

  // Clamp
  leakLow = Math.max(4, Math.min(leakLow, 22));
  leakHigh = Math.max(8, Math.min(leakHigh, 35));
  if (leakLow > leakHigh) leakLow = leakHigh - 4;

  // Recovered hours
  const recoveredLow = Math.round(leakLow * 0.55);
  const recoveredHigh = Math.round(leakHigh * 0.75);

  // Map friction to failure mode
  const failureModes: Record<string, string> = {
    leads_followup: "Lead intake and follow-up are driven by memory, not structured routing.",
    fulfillment: "Fulfillment depends on manual handoffs that break under volume.",
    customer_support: "Support requests lack visibility, causing delays and confusion.",
    internal_ops: "Internal operations run on tribal knowledge, not documented workflows.",
    reporting_visibility: "No single source of truth—decisions are made on incomplete information.",
    tool_chaos: "Tools are disconnected, creating redundant work and data fragmentation.",
    other: "Work is being routed by memory, not rules.",
  };

  const causeDescriptions: Record<string, string> = {
    leads_followup: "Your lead flow relies on someone remembering to check, follow up, and track. When that person is busy or absent, leads fall through.",
    fulfillment: "Delivery depends on manual coordination across people and tools. Gaps appear when volume spikes or handoffs aren't explicit.",
    customer_support: "Support tickets don't have a clear lifecycle. Status isn't visible, escalation paths aren't enforced, and nothing logs itself.",
    internal_ops: "Your internal processes exist in people's heads. Onboarding someone new means shadowing, not reading a runbook.",
    reporting_visibility: "Data lives in multiple places and nobody trusts any single report. Decisions get delayed because nobody knows the real state.",
    tool_chaos: "You've added tools to solve problems, but now the tools themselves are the problem. Nothing talks to anything else.",
    other: "The current system depends on manual effort to hold together. That effort is invisible until it disappears.",
  };

  const whatHappening: Record<string, string> = {
    leads_followup: "Leads come in, but follow-ups are inconsistent. Some get three emails, others get none. You're not sure which are hot and which are cold.",
    fulfillment: "Orders or projects get stuck between steps. Someone has to check if the last step finished before starting the next.",
    customer_support: "Customers ask for updates you don't have. Team members aren't sure who's handling what. Tickets get duplicated or dropped.",
    internal_ops: "Tasks get assigned verbally or via chat. Nothing tracks completion. Recurring tasks get forgotten until they're urgent.",
    reporting_visibility: "You pull reports manually, often from multiple tools. The numbers don't always match. You hedge when making decisions.",
    tool_chaos: "You copy-paste between apps. Updates in one tool don't reflect in others. You've considered 'one more tool' to fix it.",
    other: "Work gets done, but it costs more effort than it should. The system holds together through heroics, not structure.",
  };

  // System recommendations based on friction
  const systemMap: Record<string, any[]> = {
    leads_followup: [
      { name: "Lead Intake Router", description: "Automatically captures, scores, and routes inbound leads to the right destination." },
      { name: "Follow-up Sequencing", description: "Time-based sequences that ensure no lead goes cold without contact." },
    ],
    fulfillment: [
      { name: "Tool Orchestration Layer", description: "Connects your existing tools into one operating flow to reduce fragmentation." },
      { name: "Internal Ops Workflow", description: "Structured handoffs and status tracking between fulfillment stages." },
    ],
    customer_support: [
      { name: "Support Status Automation", description: "Ticket lifecycle management with clear status, owner, and escalation rules." },
      { name: "Visibility Dashboard", description: "Shared operational state showing what's running, pending, and stuck." },
    ],
    internal_ops: [
      { name: "Internal Ops Workflow", description: "Documented processes with task assignment, deadlines, and completion tracking." },
      { name: "Visibility Dashboard", description: "Single view of operational state across the team." },
    ],
    reporting_visibility: [
      { name: "Visibility Dashboard", description: "Consolidated metrics from all your tools in one trusted view." },
      { name: "Tool Orchestration Layer", description: "Ensures data flows correctly between systems." },
    ],
    tool_chaos: [
      { name: "Tool Orchestration Layer", description: "Connects your tools so they work as one system, not isolated islands." },
      { name: "Visibility Dashboard", description: "Shows the true state of operations across all connected tools." },
    ],
    other: [
      { name: "Tool Orchestration Layer", description: "Connects tools into one operating flow." },
      { name: "Visibility Dashboard", description: "Shared operational state: what's running, pending, stuck." },
    ],
  };

  const recommendedSystems = [
    ...(systemMap[audit.primary_friction] || systemMap.other),
    { name: "Reliability Layer", description: "Logging, alerts, retries, and runbooks so systems remain trustworthy over time." },
  ];

  // Readiness and next step
  let readinessLevel = "medium";
  let nextStep = "send_email";
  
  if (!audit.decision_maker) {
    readinessLevel = "low";
    nextStep = "send_email";
  } else if (leakHigh >= 16) {
    readinessLevel = "high";
    nextStep = "request_deployment";
  }

  return {
    leak_hours_low: leakLow,
    leak_hours_high: leakHigh,
    recovered_hours_low: recoveredLow,
    recovered_hours_high: recoveredHigh,
    primary_failure_mode: failureModes[audit.primary_friction] || failureModes.other,
    plain_language_cause: causeDescriptions[audit.primary_friction] || causeDescriptions.other,
    what_is_happening: whatHappening[audit.primary_friction] || whatHappening.other,
    recommended_systems: recommendedSystems,
    readiness_level: readinessLevel,
    next_step: nextStep,
    confidence: 62,
    raw_signals: { source: "fallback", audit_friction: audit.primary_friction },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const n8nWebhookUrl = Deno.env.get("N8N_AUDITOR_WEBHOOK_URL");
    const n8nSecret = Deno.env.get("N8N_WEBHOOK_SECRET");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    console.log("Audit submission received:", { email: body.email, friction: body.primary_friction });

    // Validate required fields
    const requiredFields = [
      "name", "email", "primary_friction", "breakdown_first",
      "tool_entropy", "absence_test_48h", "operational_volume", "decision_maker"
    ];
    
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!body.consent_ack) {
      return new Response(
        JSON.stringify({ error: "Consent acknowledgment is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate idempotency key
    const n8nRequestId = crypto.randomUUID();
    const startTime = Date.now();

    // Create audit record
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .insert({
        name: body.name,
        email: body.email,
        primary_friction: body.primary_friction,
        breakdown_first: body.breakdown_first,
        tool_entropy: body.tool_entropy,
        absence_test_48h: body.absence_test_48h,
        operational_volume: body.operational_volume,
        decision_maker: body.decision_maker,
        notes: body.notes || null,
        consent_ack: true,
        status: "processing",
        n8n_status: "queued",
        n8n_request_id: n8nRequestId,
      })
      .select()
      .single();

    if (auditError) {
      console.error("Error creating audit:", auditError);
      return new Response(
        JSON.stringify({ error: "Failed to create audit" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Audit created:", audit.id);

    let diagnosis: any = null;
    let n8nStatus = "queued";
    let errorMessage: string | null = null;

    // Attempt to call n8n orchestrator
    if (n8nWebhookUrl && n8nSecret) {
      const n8nPayload = JSON.stringify({
        audit_id: audit.id,
        name: audit.name,
        email: audit.email,
        primary_friction: audit.primary_friction,
        breakdown_first: audit.breakdown_first,
        tool_entropy: audit.tool_entropy,
        absence_test_48h: audit.absence_test_48h,
        operational_volume: audit.operational_volume,
        decision_maker: audit.decision_maker,
        notes: audit.notes,
      });

      const signature = await signPayload(n8nSecret, n8nPayload);

      // Retry logic: 2 retries with exponential backoff
      const maxRetries = 2;
      const timeoutMs = 12000;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

          console.log(`n8n attempt ${attempt + 1}/${maxRetries + 1}`);

          const n8nResponse = await fetch(n8nWebhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-AERELION-SIGNATURE": signature,
              "X-AERELION-REQUEST-ID": n8nRequestId,
              "X-AERELION-AUDIT-ID": audit.id,
            },
            body: n8nPayload,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (n8nResponse.ok) {
            diagnosis = await n8nResponse.json();
            n8nStatus = "succeeded";
            console.log("n8n responded successfully");
            break;
          } else {
            throw new Error(`n8n returned status ${n8nResponse.status}`);
          }
        } catch (err: any) {
          console.error(`n8n attempt ${attempt + 1} failed:`, err.message);
          errorMessage = err.message;
          
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 800; // 0.8s, 1.6s
            await new Promise((r) => setTimeout(r, delay));
          } else {
            n8nStatus = err.name === "AbortError" ? "timeout" : "failed";
          }
        }
      }
    } else {
      console.log("n8n not configured, using fallback");
      n8nStatus = "failed";
      errorMessage = "n8n webhook not configured";
    }

    // Use fallback if n8n failed
    if (!diagnosis) {
      console.log("Generating fallback diagnosis");
      diagnosis = generateFallbackDiagnosis(audit);
    }

    const processingMs = Date.now() - startTime;

    // Save diagnosis
    const { error: diagError } = await supabase
      .from("diagnoses")
      .insert({
        audit_id: audit.id,
        leak_hours_low: diagnosis.leak_hours_low,
        leak_hours_high: diagnosis.leak_hours_high,
        recovered_hours_low: diagnosis.recovered_hours_low,
        recovered_hours_high: diagnosis.recovered_hours_high,
        primary_failure_mode: diagnosis.primary_failure_mode,
        plain_language_cause: diagnosis.plain_language_cause,
        what_is_happening: diagnosis.what_is_happening,
        recommended_systems: diagnosis.recommended_systems,
        readiness_level: diagnosis.readiness_level,
        next_step: diagnosis.next_step,
        confidence: diagnosis.confidence,
        raw_signals: diagnosis.raw_signals || {},
      });

    if (diagError) {
      console.error("Error saving diagnosis:", diagError);
    }

    // Update audit status
    await supabase
      .from("audits")
      .update({
        status: "processed",
        n8n_status: n8nStatus,
        processing_ms: processingMs,
        error_message: errorMessage,
      })
      .eq("id", audit.id);

    console.log("Audit processing complete:", { audit_id: audit.id, processing_ms: processingMs });

    return new Response(
      JSON.stringify({ audit_id: audit.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Audit submit error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});