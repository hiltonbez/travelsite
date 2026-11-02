// What search engines read about the agency's site (2 Nov 2026, TribeTravel's SEO Agent): the home page's title and
// description, the schema.org TravelAgency block and the site's own address (canonical, sitemap). See
// docs/superpowers/specs/2026-11-02-seo-agent-design.md in the TribeTravel repo.
import { AGENCY_SLUG, BRAND, type Destination, type SiteContent, type Trip } from "@/lib/site-content";

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

// ------------------------------------------------------------------ trip and destination pages (phase 2)
/** Cut at a word, with an ellipsis, so Google shows it whole. */
export function clip(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).replace(/[\s,;:.-]+\S*$/, "")}…`;
}

/** A picture's full address for link previews and Google: as it is when it's a web link, on the site's own address
 *  when it's one of the site's files (/assets/...), else "". */
export function absolute(src: string) {
  if (/^https:\/\//.test(src)) return src;
  const url = siteUrl();
  return url && src.startsWith("/") && !src.startsWith("//") ? `${url}${src}` : "";
}

/** The <head> tags of an inner page: title, description, canonical and the link preview. */
export function pageHead(title: string, description: string, path: string, image = "") {
  const url = siteUrl();
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      ...(url ? [{ property: "og:url", content: `${url}${path}` }] : []),
      ...(absolute(image) ? [{ property: "og:image", content: absolute(image) }] : []),
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: url ? [{ rel: "canonical", href: `${url}${path}` }] : [],
  };
}

const agencyOf = (c: SiteContent | undefined) => c?.agencyName || BRAND.name;

/** "Mauritius Easter escape | GET Travel" and the trip's own words (or its price and the agency's offer). */
export function tripTitle(t: Trip, c: SiteContent) {
  const name = agencyOf(c);
  const own = t.summary.replace(/\s+/g, " ").trim();
  const fill = `${t.name}${t.destination && !t.name.includes(t.destination) ? ` in ${t.destination}` : ""}: ${t.price}. `
    + `Tailor-made by ${name}, ask us for a quote.`;
  return { title: clip(`${t.name} | ${name}`, 65), description: clip(own.length >= 70 ? own : `${own ? `${own} ` : ""}${fill}`, 160) };
}

export function destinationTitle(d: Destination, c: SiteContent) {
  const name = agencyOf(c);
  const fill = `Holidays to ${d.name}, planned personally by ${name}. See our ${d.name} specials and ask us for a quote.`;
  return { title: clip(`${d.name} holidays | ${name}`, 65), description: clip(d.blurb.length >= 70 ? d.blurb : fill, 160) };
}

/** What Google is told about a special: a TouristTrip with its price as an Offer, sold by the agency. */
export function tripSchema(t: Trip, c: SiteContent) {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: t.name,
    description: tripTitle(t, c).description,
    ...(url ? { url: `${url}/trips/${t.slug}` } : {}),
    ...(absolute(t.img) ? { image: absolute(t.img) } : {}),
    ...(t.destination ? { itinerary: { "@type": "Place", name: t.destination } } : {}),
    provider: { "@type": "TravelAgency", name: agencyOf(c), ...(url ? { url: `${url}/` } : {}) },
    ...(t.fromPrice
      ? { offers: { "@type": "Offer", price: t.fromPrice, priceCurrency: "ZAR", ...(t.validUntil ? { validThrough: t.validUntil } : {}),
          ...(url ? { url: `${url}/trips/${t.slug}` } : {}) } }
      : {}),
  };
}

export function destinationSchema(d: Destination, c: SiteContent) {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: d.name,
    description: destinationTitle(d, c).description,
    ...(url ? { url: `${url}/destinations/${d.slug}` } : {}),
  };
}

/** A JSON-LD block's text: "<" escaped so nothing in it can close the script tag. */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

