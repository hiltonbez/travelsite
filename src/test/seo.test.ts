import { describe, expect, it } from "vitest";

import { merge } from "@/lib/site-content";
import { agencySchema, homeTitle } from "@/lib/seo";

// 2 Nov 2026: what Google reads about an agency's site, from TribeTravel's content feed (SEO Agent).
describe("SEO", () => {
  it("uses the title and description TribeTravel's SEO Agent set", () => {
    const c = merge({ agency: { name: "GET Travel" }, seo: { title: "Mauritius Holidays | GET Travel", description: "Tailor-made trips." } });
    expect(homeTitle(c)).toEqual({ title: "Mauritius Holidays | GET Travel", description: "Tailor-made trips." });
  });

  it("falls back to the agency's own name, never the demo agency's", () => {
    const t = homeTitle(merge({ agency: { name: "GET Travel" } }));
    expect(t.title).toBe("GET Travel — Tailor-made travel");
    expect(t.title + t.description).not.toContain("Sun-Set");
  });

  it("keeps the demo agency's own words when TribeTravel can't be reached", () => {
    expect(homeTitle(merge({})).title).toContain("Sun-Set Travel");
  });

  it("tells Google it is a travel agency, with its area, contact and specials", () => {
    const c = merge({
      agency: { name: "GET Travel" },
      seo: { business: { name: "GET Travel", area: "Pretoria", google_profile: "https://g.page/get-travel", email: "x@y.z" } },
      featured: [{ name: "Mauritius Easter escape", from_price: 24900, nights: 7 }],
    });
    const s = agencySchema(c) as Record<string, unknown>;
    expect(s["@type"]).toBe("TravelAgency");
    expect(s["name"]).toBe("GET Travel");
    expect(s["areaServed"]).toBe("Pretoria");
    expect(s["sameAs"]).toContain("https://g.page/get-travel");
    expect((s["makesOffer"] as { name: string }[])[0]?.name).toBe("Mauritius Easter escape");
  });
});
