import { describe, it, expect } from "vitest";
import { applyContentPolicy } from "./policy-engine";

describe("applyContentPolicy", () => {
  it("masks blocked word and accepts", () => {
    const { bodyDisplay, policyResult } = applyContentPolicy(
      "hello BADWORD world",
      ["BADWORD"],
      "m1",
    );
    expect(bodyDisplay).toContain("***");
    expect(policyResult.maskApplied).toBe(true);
    expect(policyResult.finalAction).toBe("accept_with_mask");
  });

  it("truncates when over max length conceptually still accepts", () => {
    const long = "a".repeat(9000);
    const { bodyDisplay, policyResult } = applyContentPolicy(long, [], "m2");
    expect(bodyDisplay.length).toBeLessThanOrEqual(8000);
    expect(policyResult.lengthCheckOk).toBe(false);
  });
});
