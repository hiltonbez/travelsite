// The book's words: six chapters, one per trip, each with a choice. The choices score against the trips' moods, and
// staying in a place counts for that place, so the last page is a different book for different readers.
import { TRIPS, type ConceptTrip, type Mood } from "@/concepts/kit";

export type Choice = {
  /** The bold first word on the tag: Stay, Go on, Wait. */
  verb: string;
  rest: string;
  weights: Partial<Record<Mood, number>>;
  /** True when this choice means staying in this chapter's place. */
  stays: boolean;
  /** Opens the next chapter: "Still dripping a little, Thandi reached..." */
  after: string;
  /** Goes in the recap on the last page: "Thandi stayed for one more swim, ..." */
  tale: string;
};

export type Chapter = {
  slug: string;
  no: string;
  title: string;
  line: (hero: string) => string;
  ask: (hero: string) => string;
  /** What the pull-tab does, said to the traveller. */
  pull: string;
  choices: [Choice, Choice];
};

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const CHAPTERS: Chapter[] = [
  {
    slug: "mauritius",
    no: "Chapter One",
    title: "The Island of Doing Nothing",
    line: (h) =>
      `${h} woke on an island so relaxed that the palm trees were leaning on each other. The sea was the temperature of a good bath, and the to-do list had been left at home, on purpose.`,
    ask: (h) => `Does ${h} stay or go on?`,
    pull: "Pull to send the little boat out",
    choices: [
      {
        verb: "Stay",
        rest: "for one more swim",
        weights: { beach: 2, romance: 1, luxury: 1 },
        stays: true,
        after: "Still dripping a little,",
        tale: "stayed for one more swim (then four more)",
      },
      {
        verb: "Go on",
        rest: "sand gets everywhere",
        weights: { adventure: 2, wildlife: 1 },
        stays: false,
        after: "With sand still in one shoe,",
        tale: "shook out the sand and left the island",
      },
    ],
  },
  {
    slug: "kruger",
    no: "Chapter Two",
    title: "The Elephants Who Would Not Hurry",
    line: (h) =>
      `${h} reached the bushveld at breakfast time and found the road closed by a family of elephants under an acacia. Nobody hooted. You don't hoot at elephants.`,
    ask: (h) => `Does ${h} wait with the herd or go on?`,
    pull: "Pull to walk the elephants",
    choices: [
      {
        verb: "Wait",
        rest: "with a flask of coffee",
        weights: { wildlife: 3, family: 2 },
        stays: true,
        after: "Smelling faintly of elephant and coffee,",
        tale: "waited with the elephants over a flask of coffee",
      },
      {
        verb: "Go on",
        rest: "quietly, on tiptoe",
        weights: { adventure: 2, culture: 1 },
        stays: false,
        after: "Still on tiptoe for no good reason,",
        tale: "tiptoed past the elephants",
      },
    ],
  },
  {
    slug: "victoria-falls",
    no: "Chapter Three",
    title: "The River That Fell Off the Map",
    line: (h) =>
      `${h} heard it long before seeing it: a whole river going over the edge, throwing its spray higher than the cliffs. Everyone nearby was soaked and grinning.`,
    ask: (h) => `Does ${h} get closer or go on?`,
    pull: "Pull to raise the rainbow",
    choices: [
      {
        verb: "Get closer",
        rest: "and get properly wet",
        weights: { adventure: 4, wildlife: 1 },
        stays: true,
        after: "Wet to the socks and pleased about it,",
        tale: "got properly wet at the falls",
      },
      {
        verb: "Go on",
        rest: "with dry socks",
        weights: { luxury: 1, culture: 1, food: 1 },
        stays: false,
        after: "Dry-socked and slightly smug,",
        tale: "waved at the falls from a dry distance",
      },
    ],
  },
  {
    slug: "cape-town",
    no: "Chapter Four",
    title: "The Mountain on a Thread",
    line: (h) =>
      `${h} looked up at a mountain as flat as a table, with a small box travelling up it on a thread. Down below, someone was pouring the wine and the fish was nearly ready.`,
    ask: (h) => `Does ${h} stay for lunch or go on?`,
    pull: "Pull to send the cable car up",
    choices: [
      {
        verb: "Stay",
        rest: "lunch, then the cable car",
        weights: { food: 3, culture: 1, family: 1 },
        stays: true,
        after: "Full of lunch and one glass over,",
        tale: "stayed for a very long lunch under the mountain",
      },
      {
        verb: "Go on",
        rest: "the next boat is leaving",
        weights: { culture: 2, romance: 1 },
        stays: false,
        after: "Hungry, but on schedule,",
        tale: "skipped lunch to catch a boat",
      },
    ],
  },
  {
    slug: "santorini",
    no: "Chapter Five",
    title: "The Blue and White Steps",
    line: (h) =>
      `${h} climbed more white steps than anyone had warned about, past blue doors and one unimpressed cat, to a wall where people had gathered to watch the sun go down as if it were a film.`,
    ask: (h) => `Does ${h} stay for the sunset or go on?`,
    pull: "Pull to spin the sun",
    choices: [
      {
        verb: "Stay",
        rest: "and clap when it sets",
        weights: { romance: 3, luxury: 2, food: 1 },
        stays: true,
        after: "Still a bit in love with the view,",
        tale: "stayed on the wall and clapped for the sunset",
      },
      {
        verb: "Go on",
        rest: "warmer water ahead",
        weights: { beach: 2, culture: 1 },
        stays: false,
        after: "Knees complaining gently,",
        tale: "went back down all those steps",
      },
    ],
  },
  {
    slug: "zanzibar",
    no: "Chapter Six",
    title: "The Dhow at Sunset",
    line: (h) =>
      `${h} found an old wooden dhow waiting on an orange sea, with a patched sail, a smell of cloves and a captain in no rush. Behind the boat, narrow old streets. Ahead, the last page.`,
    ask: (h) => `Does ${h} stay aboard or turn the page?`,
    pull: "Pull to sail the dhow",
    choices: [
      {
        verb: "Stay",
        rest: "aboard until the stars",
        weights: { culture: 2, beach: 2 },
        stays: true,
        after: "",
        tale: "stayed aboard the dhow until the stars came out",
      },
      {
        verb: "Turn the page",
        rest: "and see how it ends",
        weights: {},
        stays: false,
        after: "",
        tale: "jumped ship to read the ending",
      },
    ],
  },
];

export const END = CHAPTERS.length;

export type Picks = (Choice | null)[];

/** The trip the story so far points at. Staying somewhere outweighs one mood but not a whole book of them. */
export function storyTrip(picks: Picks): ConceptTrip {
  let best = TRIPS[0] as ConceptTrip;
  let top = -Infinity;
  for (const t of TRIPS) {
    let s = 0;
    picks.forEach((p, i) => {
      if (!p) return;
      for (const [m, w] of Object.entries(p.weights)) s += t.moods[m as Mood] * (w ?? 0);
      if (p.stays && CHAPTERS[i]?.slug === t.slug) s += 10;
    });
    if (s > top) {
      top = s;
      best = t;
    }
  }
  return best;
}

export function recap(hero: string, picks: Picks) {
  const tales = picks.flatMap((p) => (p ? [p.tale] : []));
  if (!tales.length)
    return `${cap(hero)} went straight to the last page, which is cheating, but we'll allow it.`;
  if (tales.length === 1) return `${cap(hero)} ${tales[0]}.`;
  return `${cap(hero)} ${tales.slice(0, -1).join(", ")} and ${tales[tales.length - 1]}.`;
}
