import { describe, expect, it } from "vitest";
import { MAX_LEVEL, MIN_LEVEL, levelLabel } from "@/lib/skills";

describe("levelLabel", () => {
  it("names each level", () => {
    expect(levelLabel(MIN_LEVEL)).toBe("Newbie");
    expect(levelLabel(5)).toBe("Advanced");
  });

  it("adds the CEFR grade for languages", () => {
    expect(levelLabel(5, "CEFR")).toBe("Advanced (C1)");
    // Level 0 has no CEFR grade
    expect(levelLabel(MIN_LEVEL, "CEFR")).toBe("Newbie");
  });

  it("calls the top level Native for languages and Master otherwise", () => {
    expect(levelLabel(MAX_LEVEL, "CEFR")).toBe("Native");
    expect(levelLabel(MAX_LEVEL)).toBe("Master");
  });
});
