// What makes each Design Studio design its own on the kit's other pages: its three palette colours, the film its page
// banners play, and a line of intro copy in its audience's voice. Fonts and base colours come from the design's
// existing `concept-page theme-<id>` styling (designs/studio/studio.css), so a skin never repeats them.
import type { CSSProperties } from "react";
import { CONCEPTS, type Audience, type Concept } from "@/designs/studio/concepts";

export type SitePage = "destinations" | "about" | "quote" | "contact" | "privacy";

/** The five pages besides Home, in navigation order. */
export const SITE_PAGES: { page: SitePage; label: string }[] = [
  { page: "destinations", label: "Destinations" },
  { page: "about", label: "About us" },
  { page: "quote", label: "Get a quote" },
  { page: "contact", label: "Contact" },
  { page: "privacy", label: "Privacy" },
];

export type Skin = {
  concept: Concept;
  /** `--tk-a`, `--tk-b` and `--tk-c`: the concept's palette, for the kit's own parts. */
  vars: CSSProperties;
  /** A film in public/videos/studio, without its extension. */
  film: string;
  /** A public path to a still of that film. */
  filmPoster: string;
  intro: Record<SitePage, string>;
};

// Each design's own hero film where it has one; the others take the closest film in mood.
const FILMS: Record<string, string> = {
  vector: "city",
  altitude: "altitude-lounge",
  "little-big": "coast",
  wildlings: "wilderness",
  maison: "maison-rail",
  nocturne: "wilderness",
  offscript: "coast",
  sidequest: "islands",
  meridian: "islands",
  postcard: "coast",
};

const POSTERS: Record<string, string> = {
  city: "/images/studio/city-film.jpg",
  coast: "/images/studio/coast-film.jpg",
  wilderness: "/images/studio/wilderness-film.jpg",
  islands: "/images/studio/coast.jpg",
  "altitude-lounge": "/images/studio/altitude-editorial.webp",
  "maison-rail": "/images/studio/maison-rail-editorial.png",
};

const INTRO: Record<Audience, Record<SitePage, string>> = {
  Corporate: {
    destinations:
      "Cities, conference hubs and the offsite that gets a team talking. Check what is available before you brief us.",
    about: "A small travel desk that plans around your meetings, your policy and your people.",
    quote:
      "Tell us the route, the dates and who is travelling. Your consultant replies with a written quote.",
    contact: "Reach your travel desk by phone, email or a short note.",
    privacy: "How we handle your details and your team's, under POPIA.",
  },
  Family: {
    destinations:
      "Beaches, bush and holiday towns that work for every age in the car. Check what is available for your dates.",
    about:
      "We plan family holidays around school terms, nap times and what the children actually enjoy.",
    quote:
      "Share the children's ages and your school holiday dates. We reply with a written quote.",
    contact: "Ask us anything about travelling with children, by phone, email or message.",
    privacy:
      "How we look after your family's details, including your children's ages, under POPIA.",
  },
  Luxury: {
    destinations:
      "A short list of places worth the journey, arranged quietly and in your own time.",
    about: "A private travel desk for people who prefer to have the details handled for them.",
    quote:
      "Tell us what you have in mind. A consultant replies personally with a written proposal.",
    contact: "Speak to a consultant in confidence, by phone or email.",
    privacy: "How we keep your details private, under POPIA.",
  },
  Youth: {
    destinations:
      "Coasts, cities and trips worth a group chat. Check what is available for your dates.",
    about:
      "Real people who plan trips for groups, solo travellers and anyone who would rather skip the brochure.",
    quote: "Tell us where, when and your budget. We reply with a written quote, no fluff.",
    contact: "Message us, call us or send an email. A person answers.",
    privacy: "What we collect when you ask for a quote, and what we do with it, under POPIA.",
  },
  Classic: {
    destinations: "Well-loved places, planned with care and seen at the right time of year.",
    about:
      "A travel agency in the traditional sense: a consultant who knows you, and a written quote you can read.",
    quote:
      "Tell us where you would like to go and when. Your consultant replies with a written quote.",
    contact: "Telephone or write. We are glad to help.",
    privacy: "How we collect, use and protect your details, under POPIA.",
  },
};

const skins = new Map<string, Skin>(
  CONCEPTS.map((concept) => {
    const film = FILMS[concept.id] ?? "coast";
    const [a, b, c] = concept.palette;
    const skin: Skin = {
      concept,
      vars: { "--tk-a": a, "--tk-b": b, "--tk-c": c } as CSSProperties,
      film,
      filmPoster: POSTERS[film] ?? "/images/studio/coast.jpg",
      intro: INTRO[concept.audience],
    };
    return [concept.id, skin];
  }),
);

export const skinFor = (id: string): Skin | undefined => skins.get(id);

const PAGE_IDS = new Set<string>(SITE_PAGES.map((p) => p.page));

/** A design id and page from a URL, or null when either is not one of ours. */
export function resolveSubpage(
  design: string,
  page: string,
): { id: string; page: SitePage } | null {
  if (!skins.has(design) || !PAGE_IDS.has(page)) return null;
  return { id: design, page: page as SitePage };
}
