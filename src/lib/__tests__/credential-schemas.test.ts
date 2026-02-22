import { describe, it, expect } from "vitest";
import { CREDENTIAL_SCHEMAS, getSchemasForSystems } from "../credential-schemas";

describe("CREDENTIAL_SCHEMAS registry", () => {
  it("contains gmail_oauth entry", () => {
    expect(CREDENTIAL_SCHEMAS.gmail_oauth).toBeDefined();
    expect(CREDENTIAL_SCHEMAS.gmail_oauth.authMethod).toBe("oauth");
  });

  it("all schemas have required fields", () => {
    for (const [key, schema] of Object.entries(CREDENTIAL_SCHEMAS)) {
      expect(schema.credentialType, `${key} missing credentialType`).toBeTruthy();
      expect(schema.serviceName, `${key} missing serviceName`).toBeTruthy();
      expect(schema.fields, `${key} missing fields`).toBeInstanceOf(Array);
    }
  });

  it("sensitive fields are password type", () => {
    for (const [key, schema] of Object.entries(CREDENTIAL_SCHEMAS)) {
      for (const field of schema.fields) {
        if (field.sensitive && field.required) {
          expect(field.type, `${key}.${field.key} sensitive field should be password`).toBe(
            "password"
          );
        }
      }
    }
  });
});

describe("getSchemasForSystems()", () => {
  it("returns empty for no systems", () => {
    expect(getSchemasForSystems([])).toEqual([]);
  });

  it("maps 'Gmail' to gmail_oauth", () => {
    const schemas = getSchemasForSystems(["Gmail"]);
    expect(schemas.length).toBeGreaterThanOrEqual(1);
    expect(schemas[0].credentialType).toBe("gmail_oauth");
  });

  it("deduplicates matching systems", () => {
    const schemas = getSchemasForSystems(["Gmail", "gmail", "Google Mail"]);
    const types = schemas.map((s) => s.credentialType);
    const unique = new Set(types);
    expect(types.length).toBe(unique.size);
  });

  it("maps 'Slack' to slack_bot", () => {
    const schemas = getSchemasForSystems(["Slack"]);
    expect(schemas[0].credentialType).toBe("slack_bot");
  });
});
