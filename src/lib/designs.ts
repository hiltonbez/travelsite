// The design gallery: the demo site shows one website design for each TribeTravel website package, with a bar at the
// top of each page (components/design-bar.tsx) for switching between them. Each design is a whole site: Window Seat
// is the home page (/) with its other pages under /designs/window-seat, and the rest live under /designs/ (add every
// page to PAGES in scripts/snapshot.mjs too).
import { AGENCY_SLUG } from "@/lib/site-content";

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

/** The bar shows on the demo agency's site only, unless VITE_SHOW_DESIGNS says otherwise. */
export const SHOW_DESIGNS = env["VITE_SHOW_DESIGNS"] ? env["VITE_SHOW_DESIGNS"] === "true" : AGENCY_SLUG === "sunset-travel";

export type Design = { path: string; pkg: string; name: string; blurb: string };

/** In package order, cheapest first; the bar names each design by its package. */
export const DESIGNS: Design[] = [
  { path: "/", pkg: "Tribe Site", name: "Window Seat", blurb: "Tribe Site (R7,000): a 6-page site seen through an aeroplane window" },
  { path: "/designs/living-map", pkg: "Tribe Site Pro", name: "Living Map", blurb: "Tribe Site Pro (R16,500): a 10-page explorer's map with bookings and live rates" },
  { path: "/designs/atlas", pkg: "Business Platform", name: "Atlas", blurb: "Business Platform (from R29,500): a turning globe, three supplier feeds and the agency's own machinery" },
  { path: "/designs/enterprise", pkg: "Enterprise", name: "Enterprise", blurb: "Enterprise (R60,000): live booking, AI concierge, automation and an app" },
];
