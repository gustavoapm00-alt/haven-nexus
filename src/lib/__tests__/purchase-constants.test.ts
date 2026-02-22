import { describe, it, expect } from "vitest";
import { SUCCESS_STATUSES, PURCHASE_SUCCESS_STATUS } from "../purchase-constants";

describe("Purchase Constants", () => {
  it("canonical success status is 'completed'", () => {
    expect(PURCHASE_SUCCESS_STATUS).toBe("completed");
  });

  it("SUCCESS_STATUSES includes both legacy and current", () => {
    expect(SUCCESS_STATUSES).toContain("completed");
    expect(SUCCESS_STATUSES).toContain("paid");
  });
});
