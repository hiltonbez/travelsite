// The design gallery: the demo site shows every website design TribeTravel offers, with a bar at the top of each
// page (components/design-bar.tsx) for switching between them. Each design but Classic is its own page under
// /designs/ (add new ones to PAGES in scripts/snapshot.mjs too).
import { AGENCY_SLUG } from "@/lib/site-content";

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

/** The bar shows on the demo agency's site only, unless VITE_SHOW_DESIGNS says otherwise. */
export const SHOW_DESIGNS = env["VITE_SHOW_DESIGNS"] ? env["VITE_SHOW_DESIGNS"] === "true" : AGENCY_SLUG === "sunset-travel";

export type Design = { path: string; name: string; blurb: string };

export const DESIGNS: Design[] = [
  { path: "/", name: "Classic", blurb: "Clean and editorial, edited in TribeTravel" },
  { path: "/designs/horizon", name: "Horizon", blurb: "Cinematic luxury with a full-screen video" },
  { path: "/designs/quick-quote", name: "Quick Quote", blurb: "A 4-step quote form, front and centre" },
  { path: "/designs/wanderlust", name: "Wanderlust", blurb: "Bold bento grid for adventure and groups" },
  { path: "/designs/meet-your-agent", name: "Meet Your Agent", blurb: "A personal site for a home-based agent" },
  { path: "/designs/itinerary", name: "Itinerary Story", blurb: "Day-by-day trip for destination specialists" },
];
