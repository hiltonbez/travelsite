// The design gallery: the demo site shows one website design for each TribeTravel website package, with a bar at the
// top of each page (components/design-bar.tsx) for switching between them. Each design is a whole site: Window Seat
// is the home page (/) with its other pages under /designs/window-seat, and the rest live under /designs/ (add every
// page to PAGES in scripts/snapshot.mjs too).
import { AGENCY_SLUG } from "@/lib/site-content";

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

/** The bar shows on the demo agency's site only, unless VITE_SHOW_DESIGNS says otherwise. */
export const SHOW_DESIGNS = env["VITE_SHOW_DESIGNS"] ? env["VITE_SHOW_DESIGNS"] === "true" : AGENCY_SLUG === "sunset-travel";

export type Design = { path: string; pkg: string; name: string; blurb: string; collection?: boolean };

/** In package order, cheapest first; the bar names each design by its package. Tribe Site (Window Seat) was removed from
 *  the bar on 10 Nov 2026: the demo agency's home page (/) is now the AiFundi websites landing page (src/landing/). */
export const DESIGNS: Design[] = [
  { path: "/designs/living-map", pkg: "Tribe Site Pro", name: "Living Map", blurb: "Tribe Site Pro (R16,500): a 10-page explorer's map with bookings and live rates" },
  { path: "/designs/atlas", pkg: "Business Platform", name: "Atlas", blurb: "Business Platform (from R29,500): a turning globe, three supplier feeds and the agency's own machinery" },
  { path: "/designs/enterprise", pkg: "Enterprise", name: "Enterprise", blurb: "Enterprise (R60,000): live booking, AI concierge, automation and an app" },
  { path: "/designs/vector", pkg: "Corporate", name: "Vector", blurb: "Architectural corporate travel", collection: true },
  { path: "/designs/altitude", pkg: "Corporate", name: "Altitude", blurb: "A private departure lounge for business travel", collection: true },
  { path: "/designs/little-big", pkg: "Family", name: "Little / Big", blurb: "A joyful family holiday scrapbook", collection: true },
  { path: "/designs/wildlings", pkg: "Family", name: "Wildlings", blurb: "An explorer’s field guide for families", collection: true },
  { path: "/designs/maison", pkg: "Luxury", name: "Maison", blurb: "The private travel atelier", collection: true },
  { path: "/designs/nocturne", pkg: "Luxury", name: "Nocturne", blurb: "A cinematic private collection", collection: true },
  { path: "/designs/offscript", pkg: "Youth", name: "Offscript", blurb: "A gig poster for your next great adventure", collection: true },
  { path: "/designs/sidequest", pkg: "Youth", name: "Sidequest", blurb: "An electric blue travel zine", collection: true },
  { path: "/designs/meridian", pkg: "Classic", name: "Meridian", blurb: "A warm contemporary travel journal", collection: true },
  { path: "/designs/postcard", pkg: "Classic", name: "Postcard", blurb: "A timeless panoramic postcard", collection: true },
];
