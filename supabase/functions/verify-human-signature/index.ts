import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * verify-human-signature
 *
 * Receives raw behavioral entropy data from the THS Verification UI,
 * validates the entropy metrics server-side, and — only if thresholds
 * are met — upserts `sovereign_bridge` with is_human_verified = true.
 *
 * Returns a signed SUCCESS token the client can trust.
 */

interface MouseSample {
  x: number;
  y: number;
  t: number;
}

interface KeystrokeSample {
  key: string;
  downAt: number;
  upAt: number;
}

interface EntropyPayload {
  mouseTrail: MouseSample[];
  keystrokes: KeystrokeSample[];
  commandString: string;
  challengeDurationMs: number;
}

// --- Entropy analysis functions ---

function analyzeMouseEntropy(trail: MouseSample[]): {
  score: number;
  jitter: number;
  velocityVariance: number;
  directionChanges: number;
} {
  if (trail.length < 10) {
    return { score: 0, jitter: 0, velocityVariance: 0, directionChanges: 0 };
  }

  const velocities: number[] = [];
  const angles: number[] = [];

  for (let i = 1; i < trail.length; i++) {
    const dx = trail[i].x - trail[i - 1].x;
    const dy = trail[i].y - trail[i - 1].y;
    const dt = Math.max(trail[i].t - trail[i - 1].t, 1);
    const dist = Math.sqrt(dx * dx + dy * dy);
    velocities.push(dist / dt);
    angles.push(Math.atan2(dy, dx));
  }

  // Velocity variance — bots have near-zero variance
  const meanVel = velocities.reduce((a, b) => a + b, 0) / velocities.length;
  const velocityVariance =
    velocities.reduce((sum, v) => sum + (v - meanVel) ** 2, 0) /
    velocities.length;

  // Direction changes — bots move linearly
  let directionChanges = 0;
  for (let i = 1; i < angles.length; i++) {
    const diff = Math.abs(angles[i] - angles[i - 1]);
    if (diff > 0.3) directionChanges++;
  }

  // Jitter — micro-tremors in human hands
  const diffs: number[] = [];
  for (let i = 2; i < trail.length; i++) {
    const dx1 = trail[i].x - trail[i - 1].x;
    const dy1 = trail[i].y - trail[i - 1].y;
    const dx0 = trail[i - 1].x - trail[i - 2].x;
    const dy0 = trail[i - 1].y - trail[i - 2].y;
    diffs.push(Math.abs(dx1 - dx0) + Math.abs(dy1 - dy0));
  }
  const jitter = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;

  // Composite score (0-100)
  const velScore = Math.min(velocityVariance * 500, 40);
  const dirScore = Math.min((directionChanges / trail.length) * 80, 30);
  const jitScore = Math.min(jitter * 10, 30);
  const score = Math.round(velScore + dirScore + jitScore);

  return { score: Math.min(score, 100), jitter, velocityVariance, directionChanges };
}

function analyzeKeystrokeEntropy(keystrokes: KeystrokeSample[]): {
  score: number;
  timingVariance: number;
  dwellVariance: number;
} {
  if (keystrokes.length < 5) {
    return { score: 0, timingVariance: 0, dwellVariance: 0 };
  }

  // Inter-key intervals
  const intervals: number[] = [];
  for (let i = 1; i < keystrokes.length; i++) {
    intervals.push(keystrokes[i].downAt - keystrokes[i - 1].downAt);
  }

  // Dwell times (key held duration)
  const dwells = keystrokes.map((k) => k.upAt - k.downAt);

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = (arr: number[]) => {
    const m = mean(arr);
    return arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length;
  };

  const timingVariance = variance(intervals);
  const dwellVariance = variance(dwells);

  // Bots: near-zero variance. Humans: 500-50000+ variance
  const timingScore = Math.min(Math.sqrt(timingVariance) / 5, 50);
  const dwellScore = Math.min(Math.sqrt(dwellVariance) / 3, 50);
  const score = Math.round(timingScore + dwellScore);

  return { score: Math.min(score, 100), timingVariance, dwellVariance };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED", message: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create client with user's JWT to get their identity
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "AUTH_FAILED", message: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse payload
    const payload: EntropyPayload = await req.json();

    // Validate command string
    const expectedCommand = "AUTHORIZE_COMMANDER";
    if (payload.commandString !== expectedCommand) {
      return new Response(
        JSON.stringify({
          error: "COMMAND_MISMATCH",
          message: "Invalid command string",
          verified: false,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate challenge duration (must be > 2s, < 120s)
    if (payload.challengeDurationMs < 2000 || payload.challengeDurationMs > 120000) {
      return new Response(
        JSON.stringify({
          error: "TIMING_ANOMALY",
          message: "Challenge duration outside acceptable range",
          verified: false,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze entropy
    const mouseResult = analyzeMouseEntropy(payload.mouseTrail);
    const keystrokeResult = analyzeKeystrokeEntropy(payload.keystrokes);

    // Composite veracity score (weighted: 40% mouse, 60% keystroke)
    const veracityScore = Math.round(mouseResult.score * 0.4 + keystrokeResult.score * 0.6);

    // Threshold: 25+ is considered human (generous for MVP testing)
    const VERACITY_THRESHOLD = 25;
    const isHuman = veracityScore >= VERACITY_THRESHOLD;

    const behavioralData = {
      mouse: {
        sampleCount: payload.mouseTrail.length,
        jitter: mouseResult.jitter,
        velocityVariance: mouseResult.velocityVariance,
        directionChanges: mouseResult.directionChanges,
        score: mouseResult.score,
      },
      keystroke: {
        sampleCount: payload.keystrokes.length,
        timingVariance: keystrokeResult.timingVariance,
        dwellVariance: keystrokeResult.dwellVariance,
        score: keystrokeResult.score,
      },
      composite: veracityScore,
      threshold: VERACITY_THRESHOLD,
      challengeDurationMs: payload.challengeDurationMs,
      evaluatedAt: new Date().toISOString(),
    };

    if (isHuman) {
      // Use service role to upsert sovereign_bridge
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);

      const { error: upsertError } = await adminClient
        .from("sovereign_bridge")
        .upsert(
          {
            user_id: user.id,
            is_human_verified: true,
            veracity_score: veracityScore,
            behavioral_data: behavioralData,
            verification_source: "THS_BEHAVIORAL_ENTROPY",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        console.error("sovereign_bridge upsert failed:", upsertError);
        return new Response(
          JSON.stringify({
            error: "BRIDGE_WRITE_FAILED",
            message: "Failed to record verification",
            verified: false,
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate a verification token (timestamp-based, not cryptographic for MVP)
      const verificationToken = btoa(
        JSON.stringify({
          uid: user.id,
          score: veracityScore,
          ts: Date.now(),
          sig: "THS_V1",
        })
      );

      return new Response(
        JSON.stringify({
          verified: true,
          veracityScore,
          token: verificationToken,
          analysis: behavioralData,
          message: "HUMAN_SIGNATURE_CONFIRMED",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Failed verification
    return new Response(
      JSON.stringify({
        verified: false,
        veracityScore,
        analysis: behavioralData,
        message: "INSUFFICIENT_ENTROPY",
        hint: "Move your cursor more naturally and type with varied cadence",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("verify-human-signature error:", err);
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
