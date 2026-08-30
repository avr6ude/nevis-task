import { describe, expect, it } from "vitest";
import { AVATAR_PALETTE, avatarColor, initials } from "./identity";

describe("initials", () => {
  it("takes the first and last name", () => {
    expect(initials("Anna Blackwood")).toBe("AB");
  });

  it("falls back to one letter for a single word", () => {
    expect(initials("Company")).toBe("C");
  });
});

describe("avatarColor", () => {
  it("always lands inside the palette", () => {
    for (const name of ["Anna Blackwood", "Branch 1", "", "Ω"]) {
      expect(AVATAR_PALETTE).toContain(avatarColor(name));
    }
  });
});
