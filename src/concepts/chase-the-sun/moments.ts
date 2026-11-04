import { TRIPS, type ConceptTrip } from "@/concepts/kit";
import { SLOTS } from "./sky";

export type Moment = { line: string; chip: string };

/** What you'd be doing, in each place, in each of the six slots (dawn to night). */
export const MOMENTS: Record<string, Moment[]> = {
  // The Mauritius clip is generic coastline, so these lines stay on the water and off the landmarks.
  mauritius: [
    {
      line: "The lagoon is flat as glass, and the kayak is all yours.",
      chip: "Kayak at first light",
    },
    { line: "Face down over the reef, forgetting to check the time.", chip: "Snorkel the reef" },
    { line: "Barbecue smoke on the beach, and a catamaran in no hurry.", chip: "Catamaran lunch" },
    { line: "Doing nothing at all, and getting properly good at it.", chip: "Doing nothing, well" },
    { line: "A cold drink while the sea goes the colour of a peach.", chip: "Sunset drinks" },
    { line: "A small glass of island rum, warm air, no alarm set.", chip: "Rum, no alarm" },
  ],
  zanzibar: [
    {
      line: "Stone Town's alleys before the shutters open. Just you and the cats.",
      chip: "Stone Town waking",
    },
    {
      line: "Cloves, vanilla and cinnamon, straight off the tree and into your hand.",
      chip: "The spice farm",
    },
    {
      line: "Turtles underneath you off Mnemba, and nobody expecting you anywhere.",
      chip: "Turtles at Mnemba",
    },
    {
      line: "Nungwi. Swimming at any tide, which is the only timetable here.",
      chip: "Swim at Nungwi",
    },
    {
      line: "A dhow crosses the sun with its sail up, and everybody stops talking.",
      chip: "Dhow at sunset",
    },
    {
      line: "A rooftop table over Stone Town, and the old town's lamps coming on below.",
      chip: "Rooftop dinner",
    },
  ],
  kruger: [
    {
      line: "Coffee on the bonnet in the cold. Your ranger has found a leopard's track.",
      chip: "Coffee in the bush",
    },
    {
      line: "On foot with an armed guide, reading what walked past here last night.",
      chip: "The bush walk",
    },
    {
      line: "Too hot for the lions, too hot for you. Everybody naps. No regrets.",
      chip: "The great siesta",
    },
    {
      line: "Back on the vehicle. The ranger's radio has started whispering.",
      chip: "Afternoon game drive",
    },
    {
      line: "Elephants cross in front of the sun, taking their time, as is their right.",
      chip: "Elephants at dusk",
    },
    {
      line: "Dinner at the boma, fire on your shins, more stars than you remembered.",
      chip: "Boma under the stars",
    },
  ],
  "victoria-falls": [
    {
      line: "You see the smoke before you hear the thunder. Then you hear the thunder.",
      chip: "First sight of the spray",
    },
    {
      line: "Rainforest paths, a raincoat that isn't helping, a grin you can't shift.",
      chip: "Walk the falls",
    },
    {
      line: "Lunchtime in Botswana, on the river at Chobe, counting elephants.",
      chip: "Chobe by boat",
    },
    {
      line: "You step off the gorge swing. Your stomach follows a little later.",
      chip: "The gorge swing",
    },
    {
      line: "The Zambezi goes gold under the boat, and somebody passes the snacks.",
      chip: "Zambezi sunset cruise",
    },
    {
      line: "The falls still grumbling, somewhere out there in the dark.",
      chip: "Thunder at bedtime",
    },
  ],
  santorini: [
    {
      line: "White walls turn blue, then pink, and there's not a soul on the path.",
      chip: "The empty cliff path",
    },
    {
      line: "The ferry to Paros, fishing boats coming in, long beaches to choose from.",
      chip: "Ferry to Paros",
    },
    {
      line: "You sail the caldera, and swim the hot springs of a flooded volcano.",
      chip: "Sail the caldera",
    },
    {
      line: "Up through Plaka in Athens, with the Acropolis following you round every corner.",
      chip: "Plaka and the Acropolis",
    },
    { line: "Sunset in Oia. Yes, everybody's here. No, you won't mind.", chip: "Sunset in Oia" },
    {
      line: "Dinner above the black water, with the volcano keeping quiet.",
      chip: "Dinner over the caldera",
    },
  ],
  "cape-town": [
    {
      line: "The mountain goes pink while the city is still looking for its shoes.",
      chip: "Pink mountain",
    },
    {
      line: "The cable car up Table Mountain, with the whole Atlantic laid out below.",
      chip: "Up Table Mountain",
    },
    {
      line: "The wine tram through Franschhoek, and a long lunch just getting going.",
      chip: "Wine tram lunch",
    },
    {
      line: "Chapman's Peak with the windows down, then the penguins at Boulders, being ridiculous.",
      chip: "Chapman's Peak, penguins",
    },
    {
      line: "The sun drops into the Atlantic. The whole seaboard pretends not to watch.",
      chip: "Atlantic sundown",
    },
    {
      line: "A glass of something local under the Stellenbosch oaks. Then, perhaps, another.",
      chip: "A glass in Stellenbosch",
    },
  ],
};

/** East to west, by longitude, the way the sun crosses them. */
export const ORDER: { slug: string; short: string }[] = [
  { slug: "mauritius", short: "Mauritius" },
  { slug: "zanzibar", short: "Zanzibar" },
  { slug: "kruger", short: "Kruger" },
  { slug: "victoria-falls", short: "Vic Falls" },
  { slug: "santorini", short: "Santorini" },
  { slug: "cape-town", short: "Cape Town" },
];

export const tripOf = (slug: string): ConceptTrip =>
  TRIPS.find((t) => t.slug === slug) ?? TRIPS[0]!;

export type Pin = { slot: number; place: string; hour: number; seq: number };

export type Plan = {
  trips: ConceptTrip[];
  title: string;
  nights: number;
  price: number;
  /** Why these places: the sum of what was pinned, in words. */
  reason: string;
  /** The moments that fit this trip, dawn to night. */
  kept: Pin[];
  /** The moments that didn't make it. */
  left: Pin[];
  favourite: Pin;
};

const WORD = ["no", "one", "two", "three", "four", "five", "six"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const word = (n: number) => WORD[n] ?? String(n);
const each = (n: number) => (n === 1 ? "moment" : "moments");

export const momentOf = (place: string, slot: number): Moment => MOMENTS[place]![slot]!;
export const slotName = (slot: number) => SLOTS[slot]!.name;

/** Works out the trip from the pinned moments: the place with the most pins, plus a second if it earned one. */
export function workOut(pins: Pin[]): Plan {
  const tally = new Map<string, { n: number; latest: number }>();
  for (const p of pins) {
    const t = tally.get(p.place) ?? { n: 0, latest: 0 };
    tally.set(p.place, { n: t.n + 1, latest: Math.max(t.latest, p.seq) });
  }
  const ranked = [...tally.entries()].sort((a, b) => b[1].n - a[1].n || b[1].latest - a[1].latest);
  const first = ranked[0]!;
  const second = ranked[1];
  const both = !!second && (second[1].n >= 2 || pins.length <= 3);
  const slugs = both ? [first[0], second![0]] : [first[0]];
  const trips = slugs.map(tripOf);
  const byTime = [...pins].sort((a, b) => a.slot - b.slot);
  const kept = byTime.filter((p) => slugs.includes(p.place));
  const left = byTime.filter((p) => !slugs.includes(p.place));
  const favourite = kept.reduce((a, b) => (b.seq > a.seq ? b : a));

  const name = (t: ConceptTrip) => t.name.split(" & ")[0]!;
  const main = trips[0]!;
  let reason: string;
  if (both) {
    reason = `${cap(word(first[1].n))} ${each(first[1].n)} in ${name(main)}, ${word(second![1].n)} in ${name(trips[1]!)}. You'd never forgive us for choosing, so you get both.`;
  } else if (pins.length === 1) {
    reason = `One moment, and your mind was made up.`;
  } else if (left.length === 0) {
    reason = `${kept.length === 2 ? "Both" : `All ${word(kept.length)}`} of your moments happen in ${name(main)}. Nobody needs a map for this one.`;
  } else {
    reason = `${cap(word(kept.length))} of your ${word(pins.length)} moments happen in ${name(main)}, so that's where the sun is going.`;
  }

  return {
    trips,
    title: trips.map((t) => t.name).join(", then "),
    nights: trips.reduce((s, t) => s + t.nights, 0),
    price: trips.reduce((s, t) => s + t.price, 0),
    reason,
    kept,
    left,
    favourite,
  };
}
