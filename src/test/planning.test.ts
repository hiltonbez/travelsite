import { describe, it, expect } from "vitest";
import {
  familyMatches,
  moveStop,
  routeTotals,
  validRouteDraft,
  atlasMatches,
} from "@/designs/studio/planning";
describe("Personal planning rules", () => {
  it("explains family matches without claiming provider age eligibility", () => {
    const result = familyMatches({
      ages: [3, 9],
      interests: ["Wildlife", "Discovery"],
      pace: "Balanced",
      rooms: "Connecting rooms",
    });
    expect(result[0]!.id).toBe("safari");
    expect(result[0]!.reasons).toEqual([
      "Matches wildlife",
      "Matches discovery",
      "Your preferred pace",
    ]);
    expect(result[0]!.ageNote).toContain("younger children’s activity");
    expect(result[0]!.checks).toContain("Activity ages and family-drive options");
  });
  it("reorders stops without losing their nights and handles route boundaries", () => {
    const original = [
      { id: "a", city: "Lisbon", nights: 2 },
      { id: "b", city: "Rome", nights: 4 },
      { id: "c", city: "Athens", nights: 3 },
    ];
    const reordered = moveStop(original, 2, -1);
    expect(reordered.map((s) => s.city)).toEqual(["Lisbon", "Athens", "Rome"]);
    expect(original[1]!.city).toBe("Rome");
    expect(routeTotals(reordered)).toEqual({ nights: 9, days: 10 });
    expect(moveStop(reordered, 0, -1)).toBe(reordered);
    expect(routeTotals([])).toEqual({ nights: 0, days: 0 });
  });
  it("rejects malformed saved routes and preserves a zero budget", () => {
    const value = {
      region: "Europe",
      stops: [{ id: "a", city: "Rome", nights: 3 }],
      transport: "Mostly trains",
      crew: 2,
      budget: "0",
      priorities: ["Local experiences"],
    };
    expect(validRouteDraft(value)).toBe(true);
    expect(validRouteDraft({ ...value, stops: [{ id: "a", city: "Rome", nights: -2 }] })).toBe(
      false,
    );
    expect(validRouteDraft({ ...value, stops: [...value.stops, ...value.stops] })).toBe(false);
    expect(validRouteDraft({ ...value, crew: 99 })).toBe(false);
    expect(validRouteDraft({})).toBe(false);
  });
  it("filters a destination comparison by style and stay length before ranking pace", () => {
    expect(atlasMatches("Rail", "Easy", 5)).toEqual([]);
    expect(atlasMatches("Rail", "Easy", 14).map((i) => i.id)).toEqual(["rail"]);
    expect(atlasMatches("All", "Active", 14)[0]!.id).toBe("mountain");
    expect(atlasMatches("All", "Easy", 5).every((i) => i.nights <= 5)).toBe(true);
  });
});
