import "https://deno.land/std@0.224.0/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/agent-heartbeat`;

Deno.test("agent-heartbeat: rejects GET requests", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const body = await res.text();
  if (res.status !== 405) {
    throw new Error(`Expected 405, got ${res.status}: ${body}`);
  }
});

Deno.test("agent-heartbeat: rejects missing heartbeat key", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent_id: "AG-01", status: "NOMINAL" }),
  });
  const body = await res.text();
  if (res.status !== 401) {
    throw new Error(`Expected 401, got ${res.status}: ${body}`);
  }
});

Deno.test("agent-heartbeat: rejects invalid heartbeat key", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-heartbeat-key": "invalid-key-value",
    },
    body: JSON.stringify({ agent_id: "AG-01", status: "NOMINAL" }),
  });
  const body = await res.text();
  if (res.status !== 401) {
    throw new Error(`Expected 401, got ${res.status}: ${body}`);
  }
});

Deno.test("agent-heartbeat: CORS preflight returns 200", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: {
      Origin: "https://aerelion.systems",
      "Access-Control-Request-Method": "POST",
    },
  });
  await res.text();
  if (res.status !== 200 && res.status !== 204) {
    throw new Error(`Expected 200/204 for OPTIONS, got ${res.status}`);
  }
  const allowHeaders = res.headers.get("access-control-allow-headers") || "";
  if (!allowHeaders.includes("content-type")) {
    throw new Error(`CORS missing content-type in allow-headers: ${allowHeaders}`);
  }
});
