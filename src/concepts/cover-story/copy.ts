// Every word in the magazine, written from what the traveller chose: their name, the issue, the place and who's going.
import { BRAND, rand, TRIPS, type ConceptTrip, type Mood } from "@/concepts/kit";

export type Theme = "romance" | "wild" | "family" | "food";
export type Who = "solo" | "two" | "tribe";

export const THEMES: {
  id: Theme;
  word: string;
  title: string;
  weights: Partial<Record<Mood, number>>;
}[] = [
  {
    id: "romance",
    word: "Romance",
    title: "The Romance Issue",
    weights: { romance: 3, luxury: 1 },
  },
  { id: "wild", word: "Wild", title: "The Wild Issue", weights: { adventure: 2, wildlife: 2 } },
  { id: "family", word: "Family", title: "The Family Issue", weights: { family: 3 } },
  { id: "food", word: "Food", title: "The Food Issue", weights: { food: 3, culture: 1 } },
];

export const WHO: { id: Who; label: string }[] = [
  { id: "solo", label: "Just me" },
  { id: "two", label: "The two of us" },
  { id: "tribe", label: "The whole lot" },
];

const SHORT: Record<string, string> = {
  mauritius: "Mauritius",
  zanzibar: "Zanzibar",
  "victoria-falls": "Victoria Falls",
  kruger: "the Kruger",
  "cape-town": "Cape Town",
  santorini: "Santorini",
};

export const shortName = (t: ConceptTrip) => SHORT[t.slug] ?? t.name;
const headName = (t: ConceptTrip) => shortName(t).replace(/^the /, "");

/** The issue each place appears as on the shelf, so the six covers don't all look alike. */
export const SHELF_THEME: Record<string, Theme> = {
  mauritius: "romance",
  zanzibar: "food",
  "victoria-falls": "wild",
  kruger: "family",
  "cape-town": "food",
  santorini: "romance",
};

const COVER_LINES: Record<Theme, (s: { n: string; place: string }) => [string, string]> = {
  romance: ({ place }) => [
    `${place}, slowly, with nobody asking about the geyser`,
    "Your out-of-office: a love story",
  ],
  wild: ({ place }) => [
    `${place}: no signal, no mercy, no Monday`,
    "Charged by own inbox. Survived.",
  ],
  family: ({ place }) => [
    `${place}, and every way to say "are we there yet"`,
    "Snacks: the negotiation",
  ],
  food: ({ place }) => [`${place}, one long lunch at a time`, "Is pudding a personality? Yes."],
};

const PULL: Record<Theme, Record<Who, (n: string) => string>> = {
  romance: {
    solo: (n) => `${n} took ${n} out to dinner. It went very well. There may be a second date.`,
    two: (n) =>
      `By the third sunset, ${n} had stopped mentioning the office. By the fourth, nobody could remember where it was.`,
    tribe: (n) =>
      `${n} brought everyone. Romance, it turns out, can seat twelve if you book ahead.`,
  },
  wild: {
    solo: (n) => `Nobody heard ${n} shout. That was rather the point.`,
    two: (n) =>
      `${n} went first. The other one held the phone, and has the video, and will use it.`,
    tribe: (n) =>
      `${n} counted heads at the start and at the end. The numbers matched. Everyone was impressed.`,
  },
  family: {
    solo: (n) =>
      `${n} went alone and phoned home once, to say the family would have loved it, and that nobody should come.`,
    two: (n) =>
      `${n} packed for two and still needed a third bag. Some mysteries are bigger than travel writing.`,
    tribe: (n) =>
      `The children asked if it was far. ${n} said no. It was the finest lie of the holiday.`,
  },
  food: {
    solo: (n) =>
      `A table for one means ${n} never had to share the last one. Any of the last ones.`,
    two: (n) =>
      `${n} said "let's just have something light". The waiter laughed, kindly, and brought the bread.`,
    tribe: (n) => `${n} ordered for the table. The table has not stopped talking about it.`,
  },
};

const ASIDES: Record<Theme, [string, string, string, string, string]> = {
  romance: [
    "The phones stayed in the room.",
    "Nobody checked the time.",
    "A second bottle was discussed, and approved.",
    "Hands were held. Reports were not filed.",
    "Tears at the check-in desk, the good kind.",
  ],
  wild: [
    "The signal gave up first.",
    "Knees were grazed and not regretted.",
    "Sunscreen was, once again, not enough.",
    "Everyone agreed it was the best bad idea yet.",
    "Boots are still drying.",
  ],
  family: [
    "Snacks were negotiated.",
    "Somebody needed the loo at the worst moment.",
    "All photos feature one thumb.",
    "Bedtime became a rumour.",
    "The car is still full of sand.",
  ],
  food: [
    "Lunch ran gently into supper.",
    "The menu was treated as a checklist.",
    'Nobody said the word "salad".',
    "A belt was loosened, in public.",
    "The suitcase is heavier, and so is the traveller.",
  ],
};

/** A fake but consistent barcode: same name and place, same bars. Seeded, so server and browser draw the same one. */
export function barcode(seed: string): number[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const bars: number[] = [];
  for (let i = 0; i < 34; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    bars.push(1 + (Math.abs(h) % 3));
  }
  return bars;
}

export type Story = ReturnType<typeof makeStory>;

export function makeStory(rawName: string, trip: ConceptTrip, theme: Theme, who: Who) {
  const typed = rawName.trim();
  const n = typed || "You";
  const first = n.split(/\s+/)[0] ?? n;
  const place = shortName(trip);
  const Place = place.charAt(0).toUpperCase() + place.slice(1);
  const meta = THEMES.find((t) => t.id === theme) ?? { word: "", title: "" };
  const issueNo = TRIPS.findIndex((t) => t.slug === trip.slug) + 1;
  const party =
    who === "solo" ? first : who === "two" ? `${first} & plus-one` : `${first} & the whole lot`;
  const whoWords = WHO.find((w) => w.id === who)?.label.toLowerCase() ?? "";
  // With no name typed yet the cover star is "You", which needs a small y mid-sentence.
  const mid = (s: string) => (typed ? s : s.replace(/(?<=[^.!?] )You(?![a-z'])/g, "you"));
  const lines = COVER_LINES[theme]({ n: first, place: Place });
  return {
    typed,
    name: n,
    first,
    place,
    Place,
    head: headName(trip),
    party,
    whoWords,
    theme,
    title: meta.title,
    word: meta.word,
    issueNo,
    nights: trip.nights,
    price: rand(trip.price),
    lines,
    pull: mid(PULL[theme][who](first)),
    pull2: mid(`${trip.nights} nights. Not one person asked ${first} to circle back.`),
    asides: ASIDES[theme],
    letter: mid(
      `Dear ${first}. We've looked at your leave balance and frankly it's a cry for help. So we've cleared the cover, sent a crew to ${place} and made this issue entirely about you. Nobody else was available.`,
    ),
    standfirst: `Starring ${party}. Left behind: the country, the group chat and all sense of urgency. Duration: ${trip.nights} nights in ${place}.`,
    moving: [
      `The trouble with a photograph is that it sits still, and sitting still is what our cover star does all year, in a chair with a broken lever, under a light that hums. So we pointed a camera at somewhere better and let it run. Nothing happens in this picture for a very long time. That is the entire appeal. Look at it. Now look at your calendar. Now look back at it.`,
      `Our art department wanted a caption here. Our legal department wanted a caption here. ${typed ? first : "The reader"} wanted to know how soon this could be arranged, which is the only sensible question a moving picture has ever provoked. The answer sits on the back page. It costs less than you fear and, unlike the printer, it works. Turn over when you're ready.`,
    ] as [string, string],
    summary: `${first}'s ${meta.word} Issue: ${trip.nights} nights in ${place}, ${whoWords}`,
    brand: BRAND.name,
  };
}

export const HOROSCOPE: [string, string][] = [
  ["Capricorn", "You need a holiday."],
  ["Aquarius", "You need a holiday."],
  ["Pisces", "You need a holiday."],
  ["Aries", "You need a holiday."],
  ["Taurus", "You need a holiday. And a snack."],
  ["Gemini", "You both need a holiday."],
  ["Cancer", "You need a holiday."],
  ["Leo", "You need a holiday. You've already told everyone."],
  ["Virgo", "You need a holiday. Yes, we checked twice."],
  ["Libra", "You need a holiday. Stop weighing it up."],
  ["Scorpio", "You need a holiday."],
  ["Sagittarius", "You knew this one."],
];

export const CLASSIFIEDS: [string, string][] = [
  ["For sale", 'Annual leave, large quantity, barely used. Owner keeps saying "next year".'],
  ["Wanted", "Window seat. Will trade one middle seat and most of my dignity."],
  ["Lost", "Sense of humour. Last seen in a 4pm meeting that could have been an email."],
  ["Found", "Your passport. It was in the drawer with the takeaway menus. Check the date."],
  ["Personal", "Tired professional seeks beach. Beach need not reply. Beach need only be there."],
  ["Notice", "The office will still be there when you get back. We checked. Sorry."],
];
