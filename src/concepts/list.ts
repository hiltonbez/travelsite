// The ten sample designs for agents to choose from, shown at /concepts. They stay out of the design bar (lib/designs.ts)
// and the sitemap until the top five are chosen. Add every sample to PAGES in scripts/snapshot.mjs too.
export type Concept = { slug: string; name: string; pitch: string; poster: string };

export const CONCEPTS: Concept[] = [
  {
    slug: "holiday-mix",
    name: "The Holiday Mix",
    pitch: "Slide the faders on a DJ desk and the footage crossfades. Your mix becomes your trip.",
    poster: "/videos/concepts/mauritius.jpg",
  },
  {
    slug: "pack-your-bag",
    name: "Pack Your Bag",
    pitch: "Throw things into a suitcase. What you pack decides where you're going.",
    poster: "/videos/concepts/coast.jpg",
  },
  {
    slug: "scratch-the-world",
    name: "Scratch the World",
    pitch: "Scratch gold foil to reveal moving destinations, and a deal underneath.",
    poster: "/videos/concepts/santorini.jpg",
  },
  {
    slug: "the-trailer",
    name: "The Trailer",
    pitch: "Pick a genre, a cast and a location. Watch the trailer of your trip, then get tickets.",
    poster: "/videos/concepts/zanzibar.jpg",
  },
  {
    slug: "tune-in",
    name: "Tune In",
    pitch: "Turn a vintage radio dial through static to stations that broadcast each destination.",
    poster: "/videos/concepts/falls.jpg",
  },
  {
    slug: "the-lift",
    name: "The Lift",
    pitch: "Ride a brass hotel lift. Every floor's doors open onto a different world.",
    poster: "/videos/concepts/capetown.jpg",
  },
  {
    slug: "pop-up-book",
    name: "The Pop-Up Book",
    pitch: "Turn the pages of a paper book as scenes unfold in layers, with you as the hero.",
    poster: "/videos/concepts/herd.jpg",
  },
  {
    slug: "holiday-bar",
    name: "The Holiday Bar",
    pitch: "Pour sun, sea, wildlife and city into a glass. The cocktail is your trip.",
    poster: "/videos/concepts/reef.jpg",
  },
  {
    slug: "chase-the-sun",
    name: "Chase the Sun",
    pitch:
      "Drag the sun across the sky. The whole site moves from dawn to night as you build a perfect day.",
    poster: "/videos/concepts/zanzibar.jpg",
  },
  {
    slug: "cover-story",
    name: "Cover Story",
    pitch: "Type your name and a glossy travel magazine builds itself around you, page by page.",
    poster: "/videos/concepts/santorini.jpg",
  },
];
