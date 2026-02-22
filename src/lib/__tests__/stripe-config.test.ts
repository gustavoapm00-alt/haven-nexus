import { describe, it, expect } from "vitest";
import { STRIPE_TIERS, getTierByProductId, getTierByPriceId } from "../stripe-config";

describe("STRIPE_TIERS", () => {
  it("defines three tiers", () => {
    expect(Object.keys(STRIPE_TIERS)).toEqual(["pulse", "operator", "ghost"]);
  });

  it("pulse is a subscription", () => {
    expect(STRIPE_TIERS.pulse.mode).toBe("subscription");
  });

  it("ghost is a one-time payment", () => {
    expect(STRIPE_TIERS.ghost.mode).toBe("payment");
  });
});

describe("getTierByProductId", () => {
  it("resolves known product ID", () => {
    expect(getTierByProductId(STRIPE_TIERS.operator.productId)).toBe("operator");
  });

  it("returns null for unknown product ID", () => {
    expect(getTierByProductId("prod_UNKNOWN")).toBeNull();
  });
});

describe("getTierByPriceId", () => {
  it("resolves known price ID", () => {
    expect(getTierByPriceId(STRIPE_TIERS.ghost.priceId)).toBe("ghost");
  });

  it("returns null for unknown price ID", () => {
    expect(getTierByPriceId("price_UNKNOWN")).toBeNull();
  });
});
