import { describe, it, expect } from "vitest";
import { enterpriseIntakeSchema } from "../enterprise-validations";

describe("enterpriseIntakeSchema", () => {
  const valid = {
    name: "Col. Hayes",
    title: "CISO",
    email: "hayes@defense.gov",
    organization: "DOD Contractor Corp",
    compliance_needs: ["NIST 800-171"],
    current_posture: "partial",
    team_size: "50-100",
    primary_challenge: "CUI handoff gaps across subcontractors",
    timeline: "30_days",
  };

  it("accepts valid enterprise intake", () => {
    expect(enterpriseIntakeSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty compliance_needs", () => {
    expect(
      enterpriseIntakeSchema.safeParse({ ...valid, compliance_needs: [] }).success
    ).toBe(false);
  });

  it("allows optional cage_code", () => {
    expect(
      enterpriseIntakeSchema.safeParse({ ...valid, cage_code: "" }).success
    ).toBe(true);
  });

  it("rejects missing organization", () => {
    expect(
      enterpriseIntakeSchema.safeParse({ ...valid, organization: "" }).success
    ).toBe(false);
  });
});
