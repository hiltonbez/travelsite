import islands from "@/assets/islands.jpg";
import safari from "@/assets/safari.jpg";
import santorini from "@/assets/cities.jpg";
import mauritius from "@/assets/places/mauritius-2.jpg";

export type Audience = "Corporate" | "Family" | "Luxury" | "Youth" | "Classic";
export type Concept = {
  id: string;
  number: string;
  name: string;
  audience: Audience;
  line: string;
  headline: string;
  accent: string;
  copy: string;
  image: string;
  imageAlt: string;
  palette: string[];
  rationale: string;
  signature: string;
  experiences: [string, string, string];
};
export const CONCEPTS: Concept[] = [
  {
    id: "vector",
    number: "01",
    name: "Vector",
    audience: "Corporate",
    line: "Business travel. Clear direction.",
    headline: "Go further.",
    accent: "Stay focused.",
    copy: "From the first meeting to the flight home. Travel that works as hard as you do.",
    image: "/images/studio/architecture.jpg",
    imageAlt: "Sculptural glass office towers viewed from below",
    palette: ["#123e35", "#eaf0e7", "#c9f575"],
    rationale:
      "An architectural identity for ambitious businesses. Oversized, precise typography meets a quiet sage canvas and a sculptural city window.",
    signature: "Meeting-led multi-city planning · saved briefs · personal travel desk",
    experiences: ["Business journeys", "Team offsites", "Executive stays"],
  },
  {
    id: "altitude",
    number: "02",
    name: "Altitude",
    audience: "Corporate",
    line: "A better class of business travel.",
    headline: "Your next move.",
    accent: "Perfectly timed.",
    copy: "Complex schedules. Effortless journeys. A personal travel desk for people going places.",
    image: "/images/studio/city-night.jpg",
    imageAlt: "Dubai skyline and dramatic modern architecture at dusk",
    palette: ["#0b1927", "#d9e8f0", "#d6ac73"],
    rationale:
      "The calm of an airport private lounge, translated into a website. A cinematic city ribbon and departure-board typography make corporate travel feel considered.",
    signature: "Departure-board cinema · team event desk · room & policy brief",
    experiences: ["Global business travel", "Meetings & events", "Private transfers"],
  },
  {
    id: "little-big",
    number: "03",
    name: "Little / Big",
    audience: "Family",
    line: "Little people. Big adventures.",
    headline: "Less “are we there?”",
    accent: "More “again!”",
    copy: "Sandy toes, wildly happy kids and a little time for you. Let’s find your kind of family holiday.",
    image: "/images/studio/coast.jpg",
    imageAlt: "Warm turquoise sea and a wide sandy beach for family adventures",
    palette: ["#f8dad3", "#b53c2c", "#f9c84b"],
    rationale:
      "A joyful holiday scrapbook, with sunny paper cut-outs, oversized friendly type and a simple age-aware family planner.",
    signature: "Living family scrapbook · holiday daybook · individual child ages",
    experiences: ["Beach days", "Little explorers", "Big family gatherings"],
  },
  {
    id: "wildlings",
    number: "04",
    name: "Wildlings",
    audience: "Family",
    line: "Raise a little wonder.",
    headline: "Small humans.",
    accent: "Wild horizons.",
    copy: "Swap screen time for story time. Family adventures for curious minds and muddy shoes.",
    image: safari,
    imageAlt: "African safari landscape and wildlife",
    palette: ["#e6edc8", "#204635", "#ef8249"],
    rationale:
      "An illustrated explorer’s field guide. A nature-led palette, expedition labels and circular wildlife portraits invite children to help choose the adventure.",
    signature: "Age-aware family comparisons · room needs · expedition field guide",
    experiences: ["First family safari", "Island discoveries", "Mountains & fresh air"],
  },
  {
    id: "maison",
    number: "05",
    name: "Maison",
    audience: "Luxury",
    line: "The art of going away.",
    headline: "Somewhere",
    accent: "extraordinary.",
    copy: "Remarkable places. Quietly exceptional service. Journeys composed entirely around you.",
    image: mauritius,
    imageAlt: "Secluded tropical island retreat in Mauritius",
    palette: ["#f3efe6", "#363d33", "#a59371"],
    rationale:
      "A private travel atelier with the restraint of a fashion editorial. Fine rules, generous space and gallery-like photography let the destinations speak.",
    signature: "Editable private collections · personal dossier · island cinema",
    experiences: ["Private island retreats", "First class journeys", "Extraordinary rail"],
  },
  {
    id: "nocturne",
    number: "06",
    name: "Nocturne",
    audience: "Luxury",
    line: "For the beautifully elsewhere.",
    headline: "The world.",
    accent: "On your terms.",
    copy: "Beyond the expected, away from the ordinary. Private journeys with a rare sense of place.",
    image: safari,
    imageAlt: "Golden African wilderness at a secluded safari destination",
    palette: ["#181c18", "#e7ddc8", "#b99b6f"],
    rationale:
      "A cinematic private members’ club. Full-bleed wilderness, warm metal accents and a slow, confident pace appeal to travellers seeking discretion.",
    signature: "Wilderness cinema · private travel compass · cabin & privacy preferences",
    experiences: ["Private safari", "Ocean sanctuaries", "Legendary rail journeys"],
  },
  {
    id: "offscript",
    number: "07",
    name: "Offscript",
    audience: "Youth",
    line: "Good stories don’t follow scripts.",
    headline: "Less scrolling.",
    accent: "More living.",
    copy: "The group chat has talked about it long enough. Go find your people, your places, your next great story.",
    image: "/images/studio/friends.jpg",
    imageAlt: "Friends enjoying time together outdoors",
    palette: ["#d4f542", "#36285b", "#ff8259"],
    rationale:
      "A youth culture poster, not a tour catalogue. Acid lime, a giant typographic statement and a photo collage turn trip planning into something social.",
    signature: "Reorderable escape routes · nights & budgets · saved group briefs",
    experiences: ["Europe with your people", "Gap year adventures", "Island-hopping crews"],
  },
  {
    id: "sidequest",
    number: "08",
    name: "Sidequest",
    audience: "Youth",
    line: "Take the scenic detour.",
    headline: "Main character.",
    accent: "New coordinates.",
    copy: "Hostel friendships. Last-minute trains. That one night in Lisbon. Your next chapter starts out there.",
    image: santorini,
    imageAlt: "Blue-domed Santorini buildings overlooking the sea",
    palette: ["#2344dd", "#ffb373", "#f5f0e6"],
    rationale:
      "An electric blue travel zine. Stamped coordinates, a vertical image strip and an orange boarding stub create a bold identity for a new generation.",
    signature: "Electric travel poster · interactive budget receipt · group planning",
    experiences: ["First big Europe trip", "Contiki-style adventures", "Beach & festival escapes"],
  },
  {
    id: "meridian",
    number: "09",
    name: "Meridian",
    audience: "Classic",
    line: "Good travel. Beautifully considered.",
    headline: "A world worth",
    accent: "taking time for.",
    copy: "From the places you’ve always imagined to the ones you’ve yet to discover. We’ll take you there.",
    image: "/images/studio/alpine.jpg",
    imageAlt: "Alpine lake surrounded by dramatic mountains",
    palette: ["#f1ece2", "#8d4433", "#354a3c"],
    rationale:
      "A modern travel journal: warm stone, terracotta, an arched landscape and expressive serif type. Welcoming, clear and quietly memorable.",
    signature: "Personal travel atlas · destination comparisons · considered journeys",
    experiences: ["European discoveries", "Island favourites", "Closer to home"],
  },
  {
    id: "postcard",
    number: "10",
    name: "Postcard",
    audience: "Classic",
    line: "Wish you were here.",
    headline: "The next chapter",
    accent: "looks beautiful.",
    copy: "Thoughtful holidays, personal advice and a real person who takes care of the details. Where shall we go?",
    image: islands,
    imageAlt: "Tropical island beach with lush palms and clear water",
    palette: ["#e9eff2", "#234b65", "#d2553b"],
    rationale:
      "A contemporary postcard with a timeless coastal palette. A panoramic destination, postal details and a simple trip finder make it instantly approachable.",
    signature: "Coastal picture postcard · personal travel letter · considered journeys",
    experiences: ["Island escapes", "Journeys by rail", "Safaris & slow travel"],
  },
];
export const AUDIENCES: Audience[] = ["Corporate", "Family", "Luxury", "Youth", "Classic"];
export const conceptPath = (id: string) => `/designs/${id}`;
