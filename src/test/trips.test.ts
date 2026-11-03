import { describe, expect, it } from "vitest";

import { merge } from "@/lib/site-content";
import { destinationSchema, destinationTitle, pageHead, siteUrl, tripSchema, tripTitle } from "@/lib/seo";

// 2 Nov 2026: a page for every special and destination (TribeTravel's SEO Agent, phase 2), from the content feed.
const feed = {
  agency: { name: "GET Travel" },
  featured: [
    { name: "Mauritius Easter escape", slug: "mauritius-easter-escape", destination: "Mauritius", from_price: 24900, nights: 7,
      summary: "Seven nights on the east coast.", inclusions: ["Flights", "Breakfast daily", 4], valid_until: "2027-03-31",
      travel_from: "2027-04-01", travel_to: "2027-04-30", gallery: ["https://img.example.com/a.jpg"] },
    { name: "Le Morne week", slug: "le-morne-week", destination: "mauritius " },
    { name: "Bad slug", slug: "../etc/passwd", destination: "Mauritius" },
  ],
  destinations: [
    { slug: "mauritius", name: "Mauritius", blurb: "", specials: ["mauritius-easter-escape", "le-morne-week", "../etc/passwd"] },
    { slug: "kenya", name: "Kenya", blurb: "Big skies.", specials: [] },
  ],
};

describe("trip and destination pages", () => {
  const c = merge(feed);

  it("makes a trip for each special with a safe slug, and links its card to it", () => {
    expect(c.trips.map((t) => t.slug)).toEqual(["mauritius-easter-escape", "le-morne-week"]);
    const t = c.trips[0]!;
    expect(t.price).toMatch(/^7 nights from R24\s900 pp$/);
    expect(t.inclusions).toEqual(["Flights", "Breakfast daily"]);
    expect(t.destinationSlug).toBe("mauritius");
    expect(c.trips[1]!.destinationSlug).toBe("mauritius");
    expect(c.featured.cards[0]!.href).toBe("/trips/mauritius-easter-escape");
    expect(c.featured.cards[2]!.href).toBeUndefined();
  });

  it("keeps only destinations with trips, and only their known trips", () => {
    expect(c.destinations).toEqual([{ slug: "mauritius", name: "Mauritius", blurb: "", trips: ["mauritius-easter-escape", "le-morne-week"] }]);
  });

  it("gives each page a title and a description Google shows whole", () => {
    const t = tripTitle(c.trips[0]!, c);
    expect(t.title).toBe("Mauritius Easter escape | GET Travel");
    expect(t.description.length).toBeGreaterThanOrEqual(70);
    expect(t.description.length).toBeLessThanOrEqual(160);
    expect(t.description).toContain("R24 900");
    const d = destinationTitle(c.destinations[0]!, c);
    expect(d.title).toBe("Mauritius holidays | GET Travel");
    expect(d.description).toContain("GET Travel");
  });

  it("tells Google the special is a trip with a price, sold by the agency", () => {
    const s = tripSchema(c.trips[0]!, c) as Record<string, unknown>;
    expect(s["@type"]).toBe("TouristTrip");
    expect(s["offers"]).toMatchObject({ "@type": "Offer", price: 24900, priceCurrency: "ZAR", validThrough: "2027-03-31" });
    expect(s["provider"]).toMatchObject({ "@type": "TravelAgency", name: "GET Travel" });
    expect((tripSchema(c.trips[1]!, c) as Record<string, unknown>)["offers"]).toBeUndefined();
    expect((destinationSchema(c.destinations[0]!, c) as Record<string, unknown>)["@type"]).toBe("TouristDestination");
  });

  it("has no trip pages without TribeTravel", () => {
    expect(merge({}).trips).toEqual([]);
    expect(merge({}).destinations).toEqual([]);
  });
});

// 3 Nov 2026: the site's address and Google's ownership tag come from TribeTravel, so nobody sets them per site.
describe("the site's address from TribeTravel", () => {
  const withSeo = (seo: Record<string, unknown>) => merge({ agency: { name: "GET Travel" }, seo });

  it("uses the feed's address for the canonical and schema", () => {
    const c = withSeo({ site_url: "https://www.gettravel.global/" });
    expect(c.seo.siteUrl).toBe("https://www.gettravel.global");
    expect(siteUrl(c)).toBe("https://www.gettravel.global");
    expect(pageHead("T", "D", "/trips/x", "", c).links[0]?.href).toBe("https://www.gettravel.global/trips/x");
  });

  it("ignores an address that isn't a whole https site", () => {
    expect(withSeo({ site_url: "https://tribetravel.io/site/get-travel" }).seo.siteUrl).toBe("");
    expect(withSeo({ site_url: "http://www.gettravel.global" }).seo.siteUrl).toBe("");
    expect(withSeo({ site_url: 5 }).seo.siteUrl).toBe("");
  });

  it("keeps only a well-formed Google tag", () => {
    expect(withSeo({ google_verification: "abc_DEF-1234567" }).seo.googleVerification).toBe("abc_DEF-1234567");
    expect(withSeo({ google_verification: '"><script>' }).seo.googleVerification).toBe("");
  });
});
