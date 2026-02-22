import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "../auth-validations";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "admin@aerelion.com",
      password: "Str0ng!Pass",
    });
    expect(result.success).toBe(true);
  });

  it("rejects password under 6 chars", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password over 72 chars", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "X".repeat(73),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-email",
      password: "validpass",
    });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  const valid = {
    displayName: "Operator Alpha",
    email: "alpha@aerelion.com",
    password: "Secur3!Pass",
  };

  it("accepts valid signup", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty displayName", () => {
    expect(signupSchema.safeParse({ ...valid, displayName: "" }).success).toBe(false);
  });

  it("rejects displayName over 100 chars", () => {
    expect(
      signupSchema.safeParse({ ...valid, displayName: "N".repeat(101) }).success
    ).toBe(false);
  });
});
