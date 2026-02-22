import { describe, it, expect } from "vitest";
import {
  emailSignupSchema,
  contactFormSchema,
  engagementFormSchema,
} from "../validations";

describe("emailSignupSchema", () => {
  it("accepts a valid email", () => {
    const result = emailSignupSchema.safeParse({ email: "ops@aerelion.com" });
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = emailSignupSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });

  it("rejects malformed email", () => {
    const result = emailSignupSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("trims whitespace", () => {
    const result = emailSignupSchema.safeParse({ email: "  ops@aerelion.com  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ops@aerelion.com");
    }
  });

  it("rejects email over 255 chars", () => {
    const longEmail = "a".repeat(250) + "@b.com";
    const result = emailSignupSchema.safeParse({ email: longEmail });
    expect(result.success).toBe(false);
  });
});

describe("contactFormSchema", () => {
  const validPayload = {
    name: "Commander",
    email: "cmd@aerelion.com",
    message: "Request briefing on AG-01 deployment.",
  };

  it("accepts valid contact submission", () => {
    expect(contactFormSchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects missing name", () => {
    expect(contactFormSchema.safeParse({ ...validPayload, name: "" }).success).toBe(false);
  });

  it("rejects missing message", () => {
    expect(contactFormSchema.safeParse({ ...validPayload, message: "" }).success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    expect(
      contactFormSchema.safeParse({ ...validPayload, name: "X".repeat(101) }).success
    ).toBe(false);
  });
});

describe("engagementFormSchema", () => {
  const validPayload = {
    name: "Sentinel",
    email: "sentinel@aerelion.com",
    team_size: "5-10",
    primary_goal: "Compliance hardening",
    operational_pain: "Manual CUI handoff creates audit gaps",
  };

  it("accepts valid engagement request", () => {
    expect(engagementFormSchema.safeParse(validPayload).success).toBe(true);
  });

  it("allows optional company_name", () => {
    expect(
      engagementFormSchema.safeParse({ ...validPayload, company_name: "" }).success
    ).toBe(true);
  });

  it("rejects missing operational_pain", () => {
    expect(
      engagementFormSchema.safeParse({ ...validPayload, operational_pain: "" }).success
    ).toBe(false);
  });

  it("defaults current_tools to empty array", () => {
    const result = engagementFormSchema.safeParse(validPayload);
    if (result.success) {
      expect(result.data.current_tools).toEqual([]);
    }
  });
});
