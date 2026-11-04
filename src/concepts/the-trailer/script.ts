// The trailer's screenplay: turns the three box-office choices into a list of shots. Each genre writes its own film
// here (its jokes, its pacing, its idea of a cut); TrailerPlayer only plays whatever list it's given.
import { bestTrip, TRIPS, type ConceptTrip, type Mood } from "@/concepts/kit";

export type Genre = "romance" | "action" | "comedy" | "documentary" | "family";
export type CastId = "me" | "two" | "family" | "crew";
export type Cue = "hit" | "boom" | "riser" | "scratch" | "boing" | "tick" | "chime" | "pop";
export type Media = "clip" | 0 | 1 | 2 | "card";
export type Motion =
  "push" | "pull" | "panl" | "panr" | "punch" | "shake" | "drift" | "still" | "freeze";
export type Kind = "band" | "studio" | "slam" | "hush" | "caption" | "third" | "scene" | "film";

export type Shot = {
  ms: number;
  media: Media;
  motion?: Motion;
  kind?: Kind;
  text?: string;
  label?: string;
  sub?: string;
  cue?: Cue;
  flash?: boolean;
  /** Stops the footage dead, tilted on the card colour: comedy's freeze frame. */
  freeze?: boolean;
  /** Montage shots, dropped when the device asks for less motion. */
  fast?: boolean;
};

export const GENRES: { id: Genre; label: string; hint: string }[] = [
  { id: "romance", label: "Romance", hint: "Slow dissolves. Long looks." },
  { id: "action", label: "Action", hint: "Hard cuts. Loud everything." },
  { id: "comedy", label: "Comedy", hint: "It cuts on the joke." },
  { id: "documentary", label: "Documentary", hint: "A hushed voice. Field notes." },
  { id: "family", label: "Family", hint: "Bouncy. Counted in sleeps." },
];

type CastInfo = {
  id: CastId;
  label: string;
  seats: number;
  fallback: string;
  one: string;
  rom: string;
  role: string;
  bag: [string, string];
  bill: string;
};

export const CASTS: CastInfo[] = [
  {
    id: "me",
    label: "Just me",
    seats: 1,
    fallback: "You",
    one: "ONE HERO.",
    rom: "One person, finally on leave",
    role: "Solitary adult, seldom seen at the office",
    bag: ["ONE SUITCASE.", "(TWO KILOS OVER.)"],
    bill: "and a very good book",
  },
  {
    id: "two",
    label: "The two of us",
    seats: 2,
    fallback: "You two",
    one: "ONE COUPLE.",
    rom: "Two people",
    role: "Mated pair, sharing one charger",
    bag: ["ONE SUITCASE.", "(THAT WAS THE FIRST ARGUMENT.)"],
    bill: "and the one who packed",
  },
  {
    id: "family",
    label: "The whole family",
    seats: 4,
    fallback: "Your lot",
    one: "ONE FAMILY.",
    rom: "One family, still speaking",
    role: "Family group, audible from a distance",
    bag: ["EIGHT SUITCASES.", "(NO SOCKS.)"],
    bill: "and the kids, as themselves",
  },
  {
    id: "crew",
    label: "The crew",
    seats: 6,
    fallback: "Your lot",
    one: "ONE CREW.",
    rom: "Old friends",
    role: "Herd, loud, moving towards the bar",
    bag: ["ONE GROUP CHAT.", "(412 UNREAD.)"],
    bill: "and the crew, as themselves",
  },
];

export const castOf = (id: CastId) => CASTS.find((c) => c.id === id) as CastInfo;

const GENRE_MOODS: Record<Genre, Partial<Record<Mood, number>>> = {
  romance: { romance: 3, luxury: 1, beach: 1 },
  action: { adventure: 3, wildlife: 1 },
  comedy: { food: 2, family: 1, culture: 1, adventure: 1 },
  documentary: { wildlife: 3, culture: 1 },
  family: { family: 3, beach: 1 },
};
const CAST_MOODS: Record<CastId, Partial<Record<Mood, number>>> = {
  me: { culture: 1, adventure: 1 },
  two: { romance: 1 },
  family: { family: 2 },
  crew: { food: 1, adventure: 1 },
};

/** What "Surprise me" resolves to: the trip that scores best for this genre and this cast. */
export function surprise(genre: Genre, cast: CastId): ConceptTrip {
  const w: Partial<Record<Mood, number>> = { ...GENRE_MOODS[genre] };
  for (const [m, v] of Object.entries(CAST_MOODS[cast]))
    w[m as Mood] = (w[m as Mood] ?? 0) + (v ?? 0);
  return bestTrip(w);
}

/** The genre a trip gets when someone goes straight to its trailer from "Now showing". */
export const HOUSE_GENRE: Record<string, Genre> = {
  mauritius: "romance",
  zanzibar: "family",
  "victoria-falls": "action",
  kruger: "documentary",
  "cape-town": "comedy",
  santorini: "romance",
};

export const tripBySlug = (slug: string) =>
  (TRIPS.find((t) => t.slug === slug) ?? TRIPS[0]) as ConceptTrip;

const NUM: Record<number, string> = {
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
};
const nightsWord = (t: ConceptTrip) => NUM[t.nights] ?? String(t.nights);
export const shortName = (t: ConceptTrip) => t.name.split(" & ")[0] ?? t.name;

/** The name in lights: tidied, capitalised, and the cast's stand-in when nobody typed one. */
export function starName(typed: string, cast: CastId): string {
  const s = typed.replace(/\s+/g, " ").trim().slice(0, 16);
  if (!s) return castOf(cast).fallback;
  return s.replace(/(^|\s)(\S)/g, (_, a: string, b: string) => a + b.toUpperCase());
}

/** The film's title, line by line. */
export function filmTitle(genre: Genre, t: ConceptTrip): string[] {
  const n = shortName(t);
  switch (genre) {
    case "romance":
      return [`${nightsWord(t)} Nights`, `in ${n}`];
    case "action":
      return [n.toUpperCase(), "LAST CHECK-OUT"];
    case "comedy":
      return ["OUT OF OFFICE:", n.toUpperCase()];
    case "documentary":
      return [n, "A Natural History of Annual Leave"];
    case "family":
      return ["ARE WE THERE YET?", `The ${n} Story`];
  }
}

/** The title as one line of plain words. */
export function titleText(genre: Genre, t: ConceptTrip): string {
  return filmTitle(genre, t).join(genre === "action" || genre === "documentary" ? ": " : " ");
}

export const TAGLINE: Record<Genre, string> = {
  romance: "Some leave should never be cancelled.",
  action: "Out of office. Out of time.",
  comedy: "From the people who said “just hand luggage”.",
  documentary: "Few will survive the return to the office.",
  family: "Bring sunscreen. Bring snacks. Bring more snacks.",
};

export const RATING_GAG: Record<Genre, string> = {
  romance: "Contains prolonged hand-holding and one unnecessary dessert.",
  action: "Contains strong relaxation, mild sunburn and sustained out-of-office replies.",
  comedy: "Contains strong language at the baggage carousel.",
  documentary: "Contains adults napping in their natural habitat.",
  family: "Contains sand in everything. Parental guidance is a lovely idea.",
};

const BAND: Shot = { ms: 1500, media: "card", kind: "band" };
const STUDIO = (cue: Cue, ms = 1500): Shot => ({ ms, media: "card", kind: "studio", cue });

const COMEDY_GAGS = [
  "NOBODY PACKED SUNSCREEN.",
  "“JUST ONE MORE.” IT WAS NOT ONE MORE.",
  "SOMEONE IS STILL LOOKING FOR THE PASSPORTS.",
];

/** The whole film. Comes out at 25 to 30 seconds whichever way it's cut. */
export function buildTrailer(
  genre: Genre,
  castId: CastId,
  typedStar: string,
  t: ConceptTrip,
): Shot[] {
  const cast = castOf(castId);
  const star = starName(typedStar, castId);
  const STAR = star.toUpperCase();
  const title = filmTitle(genre, t).join("\n");
  const N = nightsWord(t);
  const d = (i: number): [string, string] => t.days[i] ?? ["", ""];
  const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

  switch (genre) {
    case "action":
      return [
        BAND,
        STUDIO("hit", 1400),
        { ms: 1100, media: "card", kind: "slam", text: "THIS WINTER.", cue: "hit", flash: true },
        { ms: 600, media: "clip", motion: "punch", cue: "tick" },
        { ms: 1000, media: "card", kind: "slam", text: cast.one, cue: "hit" },
        { ms: 500, media: 0, motion: "punch", cue: "tick" },
        { ms: 1000, media: "clip", motion: "shake", kind: "slam", text: `${STAR}.`, cue: "hit" },
        { ms: 450, media: 1, motion: "punch", cue: "tick" },
        { ms: 1000, media: "card", kind: "slam", text: `${N.toUpperCase()} NIGHTS.`, cue: "hit" },
        { ms: 450, media: "clip", motion: "punch", cue: "tick" },
        { ms: 1100, media: "card", kind: "slam", text: "ZERO EMAILS.", cue: "hit", flash: true },
        {
          ms: 1000,
          media: 2,
          motion: "push",
          kind: "slam",
          text: "THE OFFICE CALLED.",
          cue: "tick",
        },
        { ms: 1000, media: "card", kind: "slam", text: "NOBODY ANSWERED.", cue: "hit" },
        ...t.days.map((day, i): Shot => ({
          ms: 850,
          media: (i % 3) as Media,
          motion: "punch",
          kind: "scene",
          label: `Scene ${i + 1}`,
          text: day[0].toUpperCase(),
          cue: i === 0 ? "riser" : "tick",
        })),
        { ms: 300, media: "clip", motion: "punch", fast: true },
        { ms: 260, media: 2, motion: "punch", fast: true },
        { ms: 220, media: 0, motion: "punch", fast: true },
        { ms: 200, media: "clip", motion: "punch", fast: true },
        { ms: 180, media: 1, motion: "punch", fast: true },
        { ms: 160, media: 2, motion: "punch", fast: true },
        { ms: 160, media: 0, motion: "punch", fast: true },
        { ms: 1200, media: "card", kind: "hush", text: "Check-out is at ten." },
        {
          ms: 3000,
          media: "clip",
          motion: "pull",
          kind: "film",
          text: title,
          cue: "boom",
          flash: true,
        },
        { ms: 1400, media: "card", kind: "slam", text: TAGLINE.action.toUpperCase(), cue: "hit" },
        {
          ms: 1500,
          media: 2,
          motion: "push",
          kind: "hush",
          text: "Coming soon to a leave form near you",
          cue: "tick",
        },
      ];
    case "romance":
      return [
        { ...BAND, ms: 1400 },
        STUDIO("chime", 2000),
        {
          ms: 3000,
          media: "clip",
          motion: "drift",
          kind: "slam",
          text: "This winter",
          cue: "chime",
        },
        { ms: 3000, media: 0, motion: "panl", kind: "slam", text: cast.rom },
        {
          ms: 3000,
          media: "clip",
          motion: "drift",
          kind: "slam",
          text: `${star} said yes.`,
          cue: "chime",
        },
        { ms: 2600, media: 1, motion: "panr", kind: "slam", text: `${N} nights.` },
        { ms: 2600, media: 2, motion: "pull", kind: "slam", text: "Zero emails.", cue: "chime" },
        { ms: 2300, media: 0, motion: "panr", kind: "scene", text: d(0)[0], sub: d(0)[1] },
        { ms: 2300, media: 1, motion: "drift", kind: "scene", text: d(1)[0], sub: d(1)[1] },
        { ms: 2300, media: 2, motion: "panl", kind: "scene", text: d(3)[0], sub: d(3)[1] },
        { ms: 3700, media: "clip", motion: "drift", kind: "film", text: title, cue: "chime" },
        { ms: 2200, media: "card", kind: "hush", text: TAGLINE.romance },
      ];
    case "comedy":
      return [
        { ...BAND, ms: 1700 },
        STUDIO("boing", 1400),
        {
          ms: 1500,
          media: "clip",
          motion: "push",
          kind: "slam",
          text: "THIS WINTER.",
          cue: "riser",
        },
        {
          ms: 1400,
          media: "card",
          kind: "slam",
          text: `${STAR} NEEDED A HOLIDAY.`,
          cue: "scratch",
        },
        {
          ms: 1500,
          media: 0,
          motion: "freeze",
          freeze: true,
          kind: "slam",
          text: "THE OFFICE DISAGREED.",
          cue: "boing",
        },
        {
          ms: 1600,
          media: "card",
          kind: "slam",
          text: "THE OFFICE WAS NOT CONSULTED.",
          cue: "pop",
        },
        { ms: 1200, media: "clip", motion: "push", kind: "slam", text: cast.one, cue: "tick" },
        { ms: 1100, media: 1, motion: "push", kind: "slam", text: cast.bag[0], cue: "tick" },
        { ms: 1500, media: "card", kind: "slam", text: cast.bag[1], cue: "scratch" },
        {
          ms: 1200,
          media: "clip",
          motion: "push",
          kind: "slam",
          text: `${N.toUpperCase()} NIGHTS.`,
          cue: "tick",
        },
        { ms: 1200, media: 2, motion: "push", kind: "slam", text: "ZERO EMAILS.", cue: "tick" },
        {
          ms: 1400,
          media: "clip",
          motion: "freeze",
          freeze: true,
          kind: "slam",
          text: "(FINE. ONE EMAIL.)",
          cue: "scratch",
        },
        ...[0, 1, 3].map((n, i): Shot => ({
          ms: 1700,
          media: (i % 3) as Media,
          motion: "freeze",
          freeze: true,
          kind: "scene",
          label: `Scene ${i + 1}: ${d(n)[0]}`,
          text: COMEDY_GAGS[i] ?? "",
          cue: i === 1 ? "boing" : "pop",
        })),
        { ms: 2600, media: "clip", motion: "pull", kind: "film", text: title, cue: "boom" },
        { ms: 1800, media: "card", kind: "slam", text: TAGLINE.comedy.toUpperCase(), cue: "boing" },
      ];
    case "documentary":
      return [
        { ...BAND, ms: 1400 },
        STUDIO("chime", 1600),
        {
          ms: 3000,
          media: "clip",
          motion: "panr",
          kind: "caption",
          text: "This winter, on the vast plains of annual leave,",
          cue: "tick",
        },
        {
          ms: 2600,
          media: 0,
          motion: "panl",
          kind: "caption",
          text: "a remarkable migration begins.",
        },
        {
          ms: 2800,
          media: "clip",
          motion: "drift",
          kind: "third",
          text: star,
          sub: cast.role,
          cue: "tick",
        },
        {
          ms: 2400,
          media: 1,
          motion: "panr",
          kind: "caption",
          text: `${sentence(cast.one)} ${N} nights. Zero emails. Nobody can explain it.`,
        },
        ...[0, 1, 2, 3].map((n): Shot => ({
          ms: 2500,
          media: (n % 3) as Media,
          motion: n % 2 ? "panl" : "panr",
          kind: "scene",
          label: `Field notes, part ${n + 1}`,
          text: d(n)[0],
          sub: d(n)[1],
          cue: "tick",
        })),
        {
          ms: 2400,
          media: 2,
          motion: "pull",
          kind: "caption",
          text: TAGLINE.documentary,
          cue: "chime",
        },
        { ms: 3000, media: "clip", motion: "drift", kind: "film", text: title },
      ];
    case "family":
      return [
        { ...BAND, ms: 1400 },
        STUDIO("chime", 1500),
        { ms: 1700, media: "clip", motion: "push", kind: "slam", text: "THIS WINTER", cue: "pop" },
        {
          ms: 1600,
          media: 0,
          motion: "drift",
          kind: "slam",
          text: cast.one.replace(".", ""),
          cue: "pop",
        },
        { ms: 1600, media: 1, motion: "drift", kind: "slam", text: `AND ${STAR}`, cue: "pop" },
        {
          ms: 1700,
          media: "clip",
          motion: "push",
          kind: "slam",
          text: `${N.toUpperCase()} SLEEPS.`,
          cue: "boing",
        },
        { ms: 1700, media: 2, motion: "drift", kind: "slam", text: "ZERO HOMEWORK.", cue: "pop" },
        {
          ms: 1700,
          media: "card",
          kind: "slam",
          text: "AND ONLY ONE “ARE WE THERE YET?”",
          cue: "pop",
        },
        { ms: 1100, media: "card", kind: "hush", text: "(That’s a fib.)", cue: "boing" },
        ...t.days.map((day, i): Shot => ({
          ms: 1700,
          media: (i % 3) as Media,
          motion: i % 2 ? "pull" : "push",
          kind: "scene",
          label: `Chapter ${i + 1}`,
          text: day[0].toUpperCase(),
          cue: "pop",
        })),
        { ms: 2700, media: "clip", motion: "drift", kind: "film", text: title, cue: "chime" },
        { ms: 1400, media: "card", kind: "slam", text: "BRING MORE SNACKS.", cue: "boing" },
      ];
  }
}
