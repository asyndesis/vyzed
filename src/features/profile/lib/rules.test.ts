import { describe, expect, it } from "vitest";
import {
  BIO_MAX,
  type ProfileSource,
  isProfileDirty,
  priceToCents,
  toProfileForm,
  toProfileInput,
} from "@/features/profile/lib/rules";

const spanish = { id: "es", name: "Spanish", framework: "CEFR" as const };
const guitar = { id: "gtr", name: "Guitar", framework: "DEFAULT" as const };

const me: ProfileSource = {
  firstName: "Ana",
  lastName: null,
  bio: null,
  priceAmount: 2500,
  allowBarter: true,
  skills: [
    { kind: "speaks", skillId: "es", proficiency: 7, skill: spanish },
    { kind: "teaches", skillId: "gtr", proficiency: 5, skill: guitar },
  ],
};

describe("toProfileForm", () => {
  it("fills blanks for missing fields and splits skills by kind", () => {
    const f = toProfileForm(me);
    expect(f).toMatchObject({ lastName: "", bio: "", price: "25" });
    expect(f.speaks.map((s) => s.skillId)).toEqual(["es"]);
    expect(f.teaches.map((s) => s.skillId)).toEqual(["gtr"]);
    expect(f.learns).toEqual([]);
  });

  it("leaves the rate empty for free teachers", () => {
    expect(toProfileForm({ ...me, priceAmount: 0 }).price).toBe("");
  });
});

describe("priceToCents", () => {
  it("converts euros and treats junk as free", () => {
    expect(priceToCents("19.99")).toBe(1999);
    expect(priceToCents("")).toBe(0);
    expect(priceToCents("-5")).toBe(0);
    expect(priceToCents("abc")).toBe(0);
  });
});

describe("toProfileInput", () => {
  it("round-trips a profile back to the same input", () => {
    const input = toProfileInput(toProfileForm(me));
    expect(input.priceAmount).toBe(2500);
    expect(input.skills).toEqual(
      expect.arrayContaining([
        { kind: "speaks", skillId: "es", proficiency: 7 },
        { kind: "teaches", skillId: "gtr", proficiency: 5 },
      ]),
    );
    expect(input.skills).toHaveLength(2);
  });

  it("trims names and bio", () => {
    const f = { ...toProfileForm(me), firstName: "  Ana ", bio: " hi\n" };
    expect(toProfileInput(f)).toMatchObject({ firstName: "Ana", bio: "hi" });
  });
});

describe("bio limit", () => {
  it("cuts the bio to the limit on save", () => {
    const f = { ...toProfileForm(me), bio: "x".repeat(BIO_MAX + 20) };
    expect(toProfileInput(f).bio).toHaveLength(BIO_MAX);
  });
});

describe("isProfileDirty", () => {
  const saved = toProfileForm(me);

  it("ignores edits that save to the same thing", () => {
    expect(isProfileDirty({ ...saved, firstName: "Ana  " }, saved)).toBe(false);
    expect(isProfileDirty({ ...saved, price: "25.0" }, saved)).toBe(false);
  });

  it("notices real changes", () => {
    expect(isProfileDirty({ ...saved, price: "30" }, saved)).toBe(true);
    expect(isProfileDirty({ ...saved, learns: saved.speaks }, saved)).toBe(
      true,
    );
  });
});
