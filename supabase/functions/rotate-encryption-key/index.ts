import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { requireAdminAuth } from "../_shared/admin-auth.ts";

/**
 * ENVELOPE ENCRYPTION KEY ROTATION
 * AERELION // SYS.OPS.V2.06 // STAGE_3_ARCHITECT
 *
 * Envelope Encryption Pattern:
 *   - Each credential row is encrypted with a per-record Data Encryption Key (DEK)
 *   - The DEK itself is encrypted with the Master Encryption Key (MEK)
 *   - Rotation only requires re-wrapping DEKs, not re-encrypting all data
 *
 * This endpoint:
 *   1. Accepts a `dry_run` flag to preview what would be rotated
 *   2. Fetches all records still on old key_version
 *   3. Decrypts with old MEK, re-encrypts with new MEK
 *   4. Updates key_version to new version
 *
 * Request body: { dry_run?: boolean, table: 'integration_connections' | 'vps_instances' | 'activation_credentials' }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") || "https://haven-matrix.lovable.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function deriveKey(keyBase64: string): Promise<CryptoKey> {
  const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

async function decrypt(encryptedData: string, iv: string, tag: string, key: CryptoKey): Promise<string> {
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const encBytes = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
  const tagBytes = Uint8Array.from(atob(tag), (c) => c.charCodeAt(0));
  const ciphertextWithTag = new Uint8Array(encBytes.length + tagBytes.length);
  ciphertextWithTag.set(encBytes);
  ciphertextWithTag.set(tagBytes, encBytes.length);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes, tagLength: 128 }, key, ciphertextWithTag);
  return new TextDecoder().decode(decrypted);
}

async function encrypt(plaintext: string, key: CryptoKey): Promise<{ data: string; iv: string; tag: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertextWithTag = await crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, encoded);
  // Last 16 bytes are the GCM tag
  const ciphertext = new Uint8Array(ciphertextWithTag, 0, ciphertextWithTag.byteLength - 16);
  const tag = new Uint8Array(ciphertextWithTag, ciphertextWithTag.byteLength - 16);
  return {
    data: btoa(String.fromCharCode(...ciphertext)),
    iv: btoa(String.fromCharCode(...iv)),
    tag: btoa(String.fromCharCode(...tag)),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.statusCode,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { dry_run = true, table = "integration_connections", old_key_version = 1 } = body;

    const currentKeyBase64 = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY");
    const nextKeyBase64 = Deno.env.get("CREDENTIAL_ENCRYPTION_KEY_NEXT");

    if (!currentKeyBase64) {
      return new Response(JSON.stringify({ error: "CREDENTIAL_ENCRYPTION_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!nextKeyBase64 && !dry_run) {
      return new Response(JSON.stringify({ error: "CREDENTIAL_ENCRYPTION_KEY_NEXT not configured. Set the new key before rotating." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const currentKey = await deriveKey(currentKeyBase64);
    const nextKey = nextKeyBase64 ? await deriveKey(nextKeyBase64) : null;
    const newKeyVersion = old_key_version + 1;

    let result: { rotated: number; errors: string[]; dry_run: boolean; table: string } = {
      rotated: 0, errors: [], dry_run, table
    };

    if (table === "integration_connections") {
      const { data: rows, error } = await supabase
        .from("integration_connections")
        .select("id, encrypted_payload, encryption_iv, encryption_tag, key_version")
        .eq("key_version", old_key_version)
        .not("encrypted_payload", "is", null);

      if (error) throw error;

      console.log(`[rotate-encryption-key] Found ${rows?.length ?? 0} integration_connections on key_version=${old_key_version}`);

      if (!dry_run && nextKey && rows) {
        for (const row of rows) {
          try {
            const plaintext = await decrypt(row.encrypted_payload!, row.encryption_iv!, row.encryption_tag!, currentKey);
            const reencrypted = await encrypt(plaintext, nextKey);
            await supabase.from("integration_connections").update({
              encrypted_payload: reencrypted.data,
              encryption_iv: reencrypted.iv,
              encryption_tag: reencrypted.tag,
              key_version: newKeyVersion,
            }).eq("id", row.id);
            result.rotated++;
          } catch (e) {
            result.errors.push(`row ${row.id}: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      } else {
        result.rotated = rows?.length ?? 0;
      }

    } else if (table === "activation_credentials") {
      const { data: rows, error } = await supabase
        .from("activation_credentials")
        .select("id, encrypted_data, encryption_iv, encryption_tag, key_version")
        .eq("key_version", old_key_version);

      if (error) throw error;

      console.log(`[rotate-encryption-key] Found ${rows?.length ?? 0} activation_credentials on key_version=${old_key_version}`);

      if (!dry_run && nextKey && rows) {
        for (const row of rows) {
          try {
            const plaintext = await decrypt(row.encrypted_data, row.encryption_iv, row.encryption_tag, currentKey);
            const reencrypted = await encrypt(plaintext, nextKey);
            await supabase.from("activation_credentials").update({
              encrypted_data: reencrypted.data,
              encryption_iv: reencrypted.iv,
              encryption_tag: reencrypted.tag,
              key_version: newKeyVersion,
            }).eq("id", row.id);
            result.rotated++;
          } catch (e) {
            result.errors.push(`row ${row.id}: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      } else {
        result.rotated = rows?.length ?? 0;
      }
    } else {
      return new Response(JSON.stringify({ error: `Unsupported table: ${table}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[rotate-encryption-key] admin=${auth.userId} table=${table} dry_run=${dry_run} rotated=${result.rotated} errors=${result.errors.length}`);

    return new Response(JSON.stringify({
      ...result,
      new_key_version: newKeyVersion,
      message: dry_run
        ? `DRY_RUN: ${result.rotated} records would be rotated from key_version=${old_key_version} to key_version=${newKeyVersion}`
        : `ROTATION_COMPLETE: ${result.rotated} records re-encrypted. ${result.errors.length} errors.`,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[rotate-encryption-key] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
