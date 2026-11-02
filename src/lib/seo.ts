// What search engines read about the agency's site (2 Nov 2026, TribeTravel's SEO Agent): the home page's title and
// description, the schema.org TravelAgency block and the site's own address (canonical, sitemap). See
// docs/superpowers/specs/2026-11-02-seo-agent-design.md in the TribeTravel repo.
import { AGENCY_SLUG, BRAND, type SiteContent } from "@/lib/site-content";

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

/** The site's public address without a trailing slash: VITE_SITE_URL, else the demo site for the demo agency, else "". */
export function siteUrl(): string {
  const v = (env["VITE_SITE_URL"] || "").trim().replace(/\/$/, "");
  if (/^https?:\/\/[^/]+$/.test(v)) return v;
  return AGENCY_SLUG === "sunset-travel" ? "https://travelsite.aifundi.io" : "";
}

/** The title and description Google shows: what TribeTravel's SEO Agent set, else the agency's own name (2 Nov 2026:
 *  before this every agency's site was titled "Sun-Set Travel", the demo agency). */
export function homeTitle(c: SiteContent | undefined) {
  const name = c?.agencyName || BRAND.name;
  const demo = name === BRAND.name;
  return {
    title: c?.seo.title || (demo ? "Sun-Set Travel — Oh, the places you'll go" : `${name} — Tailor-made travel`),
    description: c?.seo.description || (demo
      ? "A small South African travel agency planning islands, safaris, city breaks and cruises, for business or pleasure, at the best possible price."
      : `${name}: tailor-made holidays, safaris, city breaks and cruises, planned personally for you. Ask us for a quote.`),
  };
}

/** What Google is told about the agency (schema.org TravelAgency), from TribeTravel's contact and SEO details. */
export function agencySchema(c: SiteContent) {
  const b = c.seo.business;
  const url = siteUrl();
  const sameAs = [b.googleProfile, c.contact.facebook, c.contact.instagram].filter((x) => /^https?:\/\//.test(x));
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: b.name || c.agencyName,
    description: homeTitle(c).description,
    ...(url ? { url: `${url}/` } : {}),
    ...(c.contact.email || b.email ? { email: c.contact.email || b.email } : {}),
    ...(c.contact.phone || b.phone ? { telephone: c.contact.phone || b.phone } : {}),
    ...(b.area ? { areaServed: b.area, address: { "@type": "PostalAddress", addressLocality: b.area, addressCountry: "ZA" } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(c.featured.cards.length
      ? { makesOffer: c.featured.cards.slice(0, 8).map((x) => ({ "@type": "Offer", name: x.name, description: x.line || x.price })) }
      : {}),
  };
}

