// The radio's dial: what's broadcast where, and how pressed-in presets become one holiday's programme.
import { EXTRA_CLIPS, TRIPS, type ConceptTrip } from "@/concepts/kit";

export const BAND_LOW = 88;
export const BAND_HIGH = 108;

export type StationId =
  "capetown" | "zanzibar" | "kruger" | "falls" | "mauritius" | "santorini" | "reef";

export type Station = {
  id: StationId;
  freq: number;
  /** On the dial glass. */
  name: string;
  /** Warm colour the screen casts into the room. */
  tint: string;
  /** What the announcer says: the first visit, then a second line for coming back. */
  lines: [string, string];
  video: string;
  poster: string;
  /** The holiday this station sells. The pirate station at the bottom of the dial has none. */
  trip: ConceptTrip | null;
};

const trip = (slug: string) => {
  const t = TRIPS.find((x) => x.slug === slug);
  if (!t) throw new Error(`No trip ${slug}`);
  return { trip: t, video: t.video, poster: t.poster };
};

/** Every station on the dial, low to high. */
export const STATIONS: Station[] = [
  {
    id: "reef",
    freq: 88.6,
    name: "No name",
    tint: "#2c7f8f",
    ...EXTRA_CLIPS.reef,
    trip: null,
    lines: [
      "You've drifted onto 88.6. No name, no presenter, nothing to book. Just a turtle and some fish. Turn back up the dial for the holidays.",
      "88.6 again. The turtle sends regards. Still nothing to book down here.",
    ],
  },
  {
    id: "capetown",
    freq: 90.7,
    name: "Cape Town",
    tint: "#d9713a",
    ...trip("cape-town"),
    lines: [
      "You're tuned to 90.7 Cape Town. South-easter's up, hats are down, and lunch is running long.",
      "Back on 90.7 Cape Town. Wind warning for hats. No warning at all for wine.",
    ],
  },
  {
    id: "zanzibar",
    freq: 94.2,
    name: "Zanzibar",
    tint: "#e0893a",
    ...trip("zanzibar"),
    lines: [
      "You're tuned to 94.2 Zanzibar. Tide's out, dhows are in.",
      "Back on 94.2 Zanzibar. Cloves on the breeze, dinner on the roof, and nobody's in a hurry.",
    ],
  },
  {
    id: "kruger",
    freq: 97.4,
    name: "Kruger",
    tint: "#a98a3c",
    ...trip("kruger"),
    lines: [
      "You're tuned to 97.4 Kruger. Coffee's in the bush, the drive leaves at dawn, and elephants have right of way.",
      "Back on 97.4 Kruger. Traffic report: a herd at the waterhole. Expect delays. Enjoy them.",
    ],
  },
  {
    id: "falls",
    freq: 100.6,
    name: "Vic Falls",
    tint: "#7fa5a8",
    ...trip("victoria-falls"),
    lines: [
      "You're tuned to 100.6 Victoria Falls. We'd speak up, but the river has the microphone.",
      "Back on 100.6 Victoria Falls. Today's forecast: rain, from below. Bring a raincoat.",
    ],
  },
  {
    id: "mauritius",
    freq: 103.2,
    name: "Mauritius",
    tint: "#3f9aa0",
    ...trip("mauritius"),
    lines: [
      "You're tuned to 103.2 Mauritius. Water's warm, breeze is light, and nobody here has looked at a watch.",
      "Back on 103.2 Mauritius. The news at noon has been cancelled in favour of lunch.",
    ],
  },
  {
    id: "santorini",
    freq: 105.9,
    name: "Santorini",
    tint: "#c9a15c",
    ...trip("santorini"),
    lines: [
      "You're tuned to 105.9 Santorini. Sun's going down at the usual spot, and everyone's turned up to watch.",
      "Back on 105.9 Santorini. White walls, blue domes, and a bell somewhere keeping loose time.",
    ],
  },
];

export const TRIP_STATIONS = STATIONS.filter((s) => s.trip);

export const stationById = (id: StationId) => STATIONS.find((s) => s.id === id) as Station;

/** The closest station to a frequency, and how far off it is in megacycles. */
export function nearestStation(f: number): { station: Station; off: number } {
  let station = STATIONS[0] as Station;
  let off = Infinity;
  for (const s of STATIONS) {
    const d = Math.abs(s.freq - f);
    if (d < off) {
      off = d;
      station = s;
    }
  }
  return { station, off };
}

/** Signal strength, 0 in pure static, 1 bang on the station. */
export function signalAt(off: number) {
  if (off <= 0.12) return 1;
  if (off >= 1.1) return 0;
  const x = 1 - (off - 0.12) / 0.98;
  return x * x * (3 - 2 * x);
}

export type Slot = {
  when: string;
  title: string;
  text: string;
  tag?: "sign-on" | "repeat" | "sign-off";
};
export type Leg = {
  station: Station;
  trip: ConceptTrip;
  nights: number;
  slots: Slot[];
  next: Station | null;
};
export type Programme = { legs: Leg[]; nights: number; price: number };

const dayLabel = (from: number, count: number) =>
  count > 1 ? `Days ${from}-${from + count - 1}` : `Day ${from}`;

/**
 * Runs the pressed-in stations one after the other as a single schedule. Each stop takes as many days as it has nights,
 * spread over its itinerary (extra days become repeats of the middle programmes), and only the last stop goes home.
 */
export function buildProgramme(stations: Station[]): Programme {
  let day = 1;
  let nights = 0;
  let price = 0;
  const legs: Leg[] = [];
  stations.forEach((station, i) => {
    const t = station.trip;
    if (!t) return;
    const plan = t.days.slice(0, -1);
    const home = t.days[t.days.length - 1] as [string, string];
    const counts = plan.map(() => 1);
    if (t.nights < plan.length) counts.length = t.nights;
    for (
      let extra = t.nights - plan.length, at = 1;
      extra > 0;
      extra--, at = at + 1 >= plan.length ? 1 : at + 1
    )
      counts[at] = (counts[at] ?? 1) + 1;
    const slots: Slot[] = counts.map((count, n) => {
      const [title, text] = plan[n] as [string, string];
      const slot: Slot = { when: dayLabel(day, count), title, text };
      if (n === 0 && i === 0) slot.tag = "sign-on";
      else if (count > 1) slot.tag = "repeat";
      day += count;
      return slot;
    });
    const next = stations[i + 1] ?? null;
    if (!next)
      slots.push({ when: dayLabel(day, 1), title: home[0], text: home[1], tag: "sign-off" });
    legs.push({ station, trip: t, nights: t.nights, slots, next });
    nights += t.nights;
    price += t.price;
  });
  return { legs, nights, price };
}
