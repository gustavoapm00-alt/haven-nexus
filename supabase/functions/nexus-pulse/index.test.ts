import "https://deno.land/std@0.224.0/dotenv/load.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/nexus-pulse`;

Deno.test("nexus-pulse: rejects GET requests", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  const body = await res.text();
  if (res.status !== 405) {
    throw new Error(`Expected 405, got ${res.status}: ${body}`);
  }
});

Deno.test("nexus-pulse: rejects missing auth token", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent_id: "AG-01" }),
  });
  const body = await res.text();
  if (res.status !== 401) {
    throw new Error(`Expected 401, got ${res.status}: ${body}`);
  }
});

Deno.test("nexus-pulse: rejects malformed JWT", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      Authorization: "Bearer not.a.valid.jwt.token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ agent_id: "AG-01" }),
  });
  const body = await res.text();
  // Should reject — either 401 (malformed) or 403 (not admin)
  if (res.status !== 401 && res.status !== 403) {
    throw new Error(`Expected 401/403, got ${res.status}: ${body}`);
  }
});

Deno.test("nexus-pulse: rejects anon key (non-admin)", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ agent_id: "AG-01", status: "NOMINAL" }),
  });
  const body = await res.text();
  // Anon key is not an admin — should get 401 or 403
  if (res.status !== 401 && res.status !== 403) {
    throw new Error(`Expected 401/403 for non-admin, got ${res.status}: ${body}`);
  }
});

Deno.test("nexus-pulse: CORS preflight returns 200", async () => {
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
});
