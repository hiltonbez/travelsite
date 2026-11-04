// The bar's stock: the eight bottles, the table of words the barman names a drink from, and the six house cocktails.
import { TRIPS, bestTrip, type ConceptTrip, type Mood } from "@/concepts/kit";

export type IngredientId =
  "sun" | "sea" | "wildlife" | "oldtowns" | "luxury" | "adrenaline" | "romance" | "food";
export type RGB = [number, number, number];
export type Vols = Partial<Record<IngredientId, number>>;

export type Ingredient = {
  id: IngredientId;
  label: string;
  rgb: RGB;
  /** What a measure of this bottle asks of a trip. Chosen so that each bottle on its own leans somewhere of its own. */
  weights: Partial<Record<Mood, number>>;
  adj: [string, string, string];
  noun: [string, string, string];
  /** What the barman says the first time this bottle comes off the shelf. */
  line: string;
  /** How it's described on the menu card: "You went heavy on ...". */
  taste: string;
};

export const INGREDIENTS: Ingredient[] = [
  {
    id: "sun",
    label: "Sun",
    rgb: [255, 170, 20],
    weights: { beach: 1, luxury: 0.3 },
    adj: ["Slow", "Golden", "Sun-drunk"],
    noun: ["Sundowner", "Deckchair", "Siesta"],
    line: "Sun. Good start, nobody has ever complained about that.",
    taste: "long, lazy sun",
  },
  {
    id: "sea",
    label: "Sea",
    rgb: [8, 190, 205],
    weights: { beach: 1, culture: 0.3 },
    adj: ["Salty", "Barefoot", "Tidal"],
    noun: ["Lagoon", "Castaway", "Mermaid"],
    line: "Sea. Top shelf, that. Mind the salt.",
    taste: "warm, salty sea",
  },
  {
    id: "wildlife",
    label: "Wildlife",
    rgb: [128, 186, 36],
    weights: { wildlife: 1 },
    adj: ["Untamed", "Tusked", "Feral"],
    noun: ["Elephant", "Honey Badger", "Warthog"],
    line: "Wildlife. Careful, this one bites back.",
    taste: "things with teeth and tusks",
  },
  {
    id: "oldtowns",
    label: "Old Towns",
    rgb: [214, 84, 40],
    weights: { culture: 1, food: 0.3 },
    adj: ["Cobbled", "Whitewashed", "Crumbling"],
    noun: ["Alleyway", "Spice Merchant", "Archway"],
    line: "Old Towns. Aged for centuries in narrow alleys.",
    taste: "narrow lanes and old walls",
  },
  {
    id: "luxury",
    label: "Luxury",
    rgb: [246, 224, 158],
    weights: { luxury: 1 },
    adj: ["Velvet", "Gilded", "Upgraded"],
    noun: ["Butler", "Bathrobe", "Turndown"],
    line: "Luxury. Ah. You have done this before.",
    taste: "someone else carrying your bags",
  },
  {
    id: "adrenaline",
    label: "Adrenaline",
    rgb: [255, 40, 50],
    weights: { adventure: 1 },
    adj: ["Reckless", "Breathless", "Unwise"],
    noun: ["Gorge Swing", "Leap", "Rapids"],
    line: "Adrenaline. I'll need you to sign something.",
    taste: "your heart in your throat",
  },
  {
    id: "romance",
    label: "Romance",
    rgb: [255, 90, 160],
    weights: { romance: 1, beach: 0.1 },
    adj: ["Smitten", "Moonlit", "Besotted"],
    noun: ["Slow Dance", "Love Letter", "Honeymoon"],
    line: "Romance. Say no more. I saw nothing.",
    taste: "holding hands without being asked",
  },
  {
    id: "food",
    label: "Good Food",
    rgb: [150, 24, 76],
    weights: { food: 1, adventure: 0.3 },
    adj: ["Hungry", "Peri-Peri", "Well-fed"],
    noun: ["Long Lunch", "Braai", "Second Helping"],
    line: "Good Food. A person of taste. Literally.",
    taste: "a very long lunch",
  },
];

export const ingredient = (id: IngredientId) => INGREDIENTS.find((i) => i.id === id) as Ingredient;

export const rgbCss = ([r, g, b]: RGB, a = 1) => `rgba(${r},${g},${b},${a})`;

/** What's in the glass, biggest pour first. */
export function ranked(vols: Vols) {
  return (Object.entries(vols) as [IngredientId, number][])
    .filter(([, v]) => v > 0.004)
    .sort((a, b) => b[1] - a[1]);
}

export function weightsOf(vols: Vols) {
  const w: Partial<Record<Mood, number>> = {};
  for (const [id, v] of ranked(vols)) {
    for (const [m, x] of Object.entries(ingredient(id).weights))
      w[m as Mood] = (w[m as Mood] ?? 0) + (x ?? 0) * v;
  }
  return w;
}

export const leadingTrip = (vols: Vols): ConceptTrip => bestTrip(weightsOf(vols));

/** Lead bottle gives the noun, second bottle the adjective, and the exact amounts choose from each bottle's three words. */
export function nameCocktail(vols: Vols) {
  const r = ranked(vols);
  if (!r.length) return "The Empty Glass";
  const total = r.reduce((s, [, v]) => s + v, 0);
  const [leadId, leadV] = r[0] as [IngredientId, number];
  const second = r[1]?.[0] ?? leadId;
  const n = Math.round(leadV * 100) + Math.round((r[1]?.[1] ?? 0) * 37);
  const base = `The ${ingredient(second).adj[(n % 3) as 0 | 1 | 2]} ${ingredient(leadId).noun[((n >> 1) % 3) as 0 | 1 | 2]}`;
  if (r.length >= 5) return `${base}, With the Lot`;
  if (leadV / total > 0.88) return `${base}, Neat`;
  if (total > 0.8) return `${base}, a Double`;
  return base;
}

const TRIP_WHY: Record<string, string> = {
  mauritius:
    "That's an island that does everything for you, in water warm enough to skip the towel.",
  zanzibar:
    "That's white sand on one side, spice-scented alleys on the other, and dhows going past at sunset.",
  "victoria-falls":
    "That's one of the world's great waterfalls, under two hours from Johannesburg, with a gorge to jump into.",
  kruger:
    "That's the Big Five at dawn, a fire at night, and a guide who knows where everything is hiding.",
  "cape-town": "That's a mountain, two oceans and a table you won't want to leave. Pace yourself.",
  santorini:
    "That's whitewashed lanes above the caldera, a slow dinner and the most shamelessly pretty sunset in Greece.",
};

export function whyLine(vols: Vols, trip: ConceptTrip) {
  const r = ranked(vols);
  const lead = ingredient(r[0]?.[0] ?? "sun");
  const also = r[1] ? ingredient(r[1][0]) : null;
  const open = also
    ? `Mostly ${lead.taste}, with a good slug of ${also.taste}.`
    : `Nothing in it but ${lead.taste}. Bold.`;
  return `${open} ${TRIP_WHY[trip.slug] ?? ""}`;
}

export type Signature = { slug: string; name: string; blurb: string; recipe: Vols };

/** One house cocktail for each trip. The recipes are real: mix one by hand and it lands on the same trip. */
export const SIGNATURES: Signature[] = [
  {
    slug: "mauritius",
    name: "The Golden Butler",
    blurb: "Warm lagoons, someone else's problem. Served with a towel animal.",
    recipe: { sun: 0.34, luxury: 0.28, romance: 0.12 },
  },
  {
    slug: "zanzibar",
    name: "The Cobbled Lagoon",
    blurb: "Turquoise on top, spice market underneath. Stir with a dhow.",
    recipe: { sea: 0.4, oldtowns: 0.2, sun: 0.08 },
  },
  {
    slug: "victoria-falls",
    name: "The Reckless Gorge Swing",
    blurb: "Short, loud and very wet. Bring a raincoat.",
    recipe: { adrenaline: 0.42, wildlife: 0.14, sea: 0.04 },
  },
  {
    slug: "kruger",
    name: "The Feral Elephant",
    blurb: "An early start and a long finish. Do not stand up in the vehicle.",
    recipe: { wildlife: 0.46, luxury: 0.12, adrenaline: 0.08 },
  },
  {
    slug: "cape-town",
    name: "The Hungry Braai",
    blurb: "Big, generous and slightly windy. Comes with a view of everything.",
    recipe: { food: 0.38, adrenaline: 0.16, sun: 0.06 },
  },
  {
    slug: "santorini",
    name: "The Moonlit Alleyway",
    blurb: "Blue and white with a slow pink finish. Pairs well with staring.",
    recipe: { oldtowns: 0.3, romance: 0.24, food: 0.12, luxury: 0.08 },
  },
];

export const tripBySlug = (slug: string) => TRIPS.find((t) => t.slug === slug) as ConceptTrip;
