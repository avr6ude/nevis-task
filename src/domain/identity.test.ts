import { describe, expect, it } from "vitest";
import { AVATAR_PALETTE, avatarColor, initials } from "./identity";

describe("initials", () => {
  it("takes the first and last name", () => {
    expect(initials("Anna Blackwood")).toBe("AB");
  });

  it("falls back to one letter for a single word", () => {
    expect(initials("Company")).toBe("C");
  });

  it("ignores extra whitespace", () => {
    expect(initials("  Anna   Marie  Blackwood ")).toBe("AB");
  });

  it("survives an empty name", () => {
    expect(initials("")).toBe("");
  });
});

describe("avatarColor", () => {
  it("always lands inside the palette", () => {
    for (const name of ["Anna Blackwood", "Branch 1", "", "Ω"]) {
      expect(AVATAR_PALETTE).toContain(avatarColor(name));
    }
  });

  it("gives the same name the same colour", () => {
    expect(avatarColor("Anna Blackwood")).toBe(avatarColor("Anna Blackwood"));
  });
});
