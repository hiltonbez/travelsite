/** Transparent planning rules, not live inventory, weather predictions or supplier prices. */
export type FamilyPreference = { ages: number[]; interests: string[]; pace: string; rooms: string };
export const FAMILY_IDEAS = [
  {
    id: "island",
    name: "An island, at their pace",
    tags: ["Water play", "Slow days", "Discovery"],
    pace: "Easy",
    setting: "Island stay",
    checks: [
      "Room layouts and connecting doors",
      "Kids’ club age policies and supervision",
      "Pools, beach access and transfers",
    ],
    days: [
      "Arrive, unpack and find a favourite corner of the beach.",
      "A little discovery in the morning; pool time after lunch.",
      "Leave a day open for whatever the family loves most.",
    ],
  },
  {
    id: "safari",
    name: "Safari, with room to play",
    tags: ["Wildlife", "Discovery", "Gentle walks"],
    pace: "Balanced",
    setting: "Nature lodge",
    checks: [
      "Activity ages and family-drive options",
      "Family room configuration",
      "Drive duration, downtime and lodge facilities",
    ],
    days: [
      "Settle in and meet the team who will guide your stay.",
      "An age-appropriate wildlife activity, with an unhurried afternoon.",
      "Explore a different part of the landscape, at the crew’s pace.",
    ],
  },
  {
    id: "rail",
    name: "Mountains through the window",
    tags: ["Discovery", "Gentle walks", "Trains"],
    pace: "Balanced",
    setting: "Rail & mountain stay",
    checks: [
      "Luggage, transfers and train connections",
      "Family seating and room arrangements",
      "Walking distances and accessibility",
    ],
    days: [
      "A scenic journey with time to enjoy the changing view.",
      "Choose a gentle walk or a day closer to your base.",
      "Spend another day exploring before the next connection.",
    ],
  },
  {
    id: "together",
    name: "Everyone under one roof",
    tags: ["Slow days", "Water play", "Together time"],
    pace: "Easy",
    setting: "Shared family base",
    checks: [
      "Bedrooms, bathrooms and shared living space",
      "Meals, mobility and different generations’ needs",
      "Suitable activities without moving every day",
    ],
    days: [
      "Arrive together, share a meal and settle into your space.",
      "Split into little adventures; come back for time together.",
      "A wonderfully open day, without another bag to pack.",
    ],
  },
] as const;
export function familyMatches(p: FamilyPreference) {
  return FAMILY_IDEAS.map((idea) => {
    const interests = p.interests.filter((x) => (idea.tags as readonly string[]).includes(x));
    const paceMatch = idea.pace === p.pace;
    const roomMatch = p.rooms === "Shared villa" && idea.id === "together";
    return {
      ...idea,
      score: interests.length * 2 + Number(paceMatch) + Number(roomMatch) * 2,
      reasons: [
        ...interests.map((x) => `Matches ${x.toLowerCase()}`),
        ...(paceMatch ? ["Your preferred pace"] : []),
        ...(roomMatch ? ["A shared family base"] : []),
      ],
      ageNote: p.ages.some((age) => age < 6)
        ? "Ask the agent about younger children’s activity and room requirements."
        : "Ask the agent to match activities to each child’s age and interests.",
    };
  }).sort((a, b) => b.score - a.score);
}
export type RouteStop = { id: string; city: string; nights: number };
export function moveStop(stops: RouteStop[], index: number, direction: -1 | 1): RouteStop[] {
  const to = index + direction;
  if (index < 0 || index >= stops.length || to < 0 || to >= stops.length) return stops;
  const next = [...stops];
  [next[index], next[to]] = [next[to]!, next[index]!];
  return next;
}
export function routeTotals(stops: RouteStop[]) {
  const nights = stops.reduce((n, s) => n + s.nights, 0);
  return { nights, days: stops.length ? nights + 1 : 0 };
}
export function validRouteDraft(value: unknown): value is {
  region: string;
  stops: RouteStop[];
  transport: string;
  crew: number;
  budget: string;
  priorities: string[];
} {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v["region"] === "string" &&
    ["Europe", "Asia", "Africa"].includes(v["region"]) &&
    Array.isArray(v["stops"]) &&
    v["stops"].length <= 6 &&
    v["stops"].every(
      (s) =>
        s &&
        typeof s.id === "string" &&
        typeof s.city === "string" &&
        s.city.trim().length > 0 &&
        s.city.length <= 80 &&
        Number.isInteger(s.nights) &&
        s.nights >= 1 &&
        s.nights <= 14,
    ) &&
    new Set(v["stops"].map((s) => s.id)).size === v["stops"].length &&
    typeof v["transport"] === "string" &&
    v["transport"].length <= 60 &&
    Number.isInteger(v["crew"]) &&
    Number(v["crew"]) >= 1 &&
    Number(v["crew"]) <= 8 &&
    typeof v["budget"] === "string" &&
    v["budget"].length <= 40 &&
    (v["budget"] === "" ||
      (/^\d+(?:\.\d{1,2})?$/.test(v["budget"]) && Number(v["budget"]) <= 1000000)) &&
    Array.isArray(v["priorities"]) &&
    v["priorities"].length <= 12 &&
    v["priorities"].every((p) => typeof p === "string" && p.length <= 60)
  );
}
export const ATLAS_IDEAS = [
  {
    id: "island",
    name: "An island interlude",
    theme: "Islands",
    pace: "Easy",
    nights: 7,
    image: "mauritius",
    line: "One lovely base. A little discovery. Plenty of time to do less.",
    details: [
      "Choose the room and meal arrangement that suits you",
      "Plan one or two optional outings",
      "Keep transfers and the rest of the trip simple",
    ],
  },
  {
    id: "rail",
    name: "The scenic way round",
    theme: "Rail",
    pace: "Balanced",
    nights: 9,
    image: "rail",
    line: "Landscapes, a window seat and a journey worth lingering over.",
    details: [
      "Discuss route, cabin or seat preferences",
      "Allow comfortable connections between stops",
      "Keep the luggage plan practical",
    ],
  },
  {
    id: "wildlife",
    name: "A chapter in the wild",
    theme: "Wildlife",
    pace: "Balanced",
    nights: 5,
    image: "safari",
    line: "A thoughtful lodge stay, with time to watch and wonder.",
    details: [
      "Match guiding and activities to your interests",
      "Discuss comfort, access and mobility needs",
      "Balance early activities with relaxed afternoons",
    ],
  },
  {
    id: "city",
    name: "A city, slowly discovered",
    theme: "Cities",
    pace: "Balanced",
    nights: 5,
    image: "capetown",
    line: "Walkable days, local discoveries and a place to return to.",
    details: [
      "Choose the area you want to stay in",
      "Pick the sights that matter most",
      "Leave some time wonderfully unplanned",
    ],
  },
  {
    id: "mountain",
    name: "Room for a wider view",
    theme: "Mountains",
    pace: "Active",
    nights: 7,
    image: "alpine",
    line: "Fresh air and a landscape that invites you outside.",
    details: [
      "Match walking and activity levels to your experience",
      "Choose a suitable base and transport plan",
      "Discuss seasonal conditions with your consultant",
    ],
  },
  {
    id: "coast",
    name: "The coast at your pace",
    theme: "Islands",
    pace: "Easy",
    nights: 5,
    image: "beach",
    line: "A shorter escape, with the water never far from your day.",
    details: [
      "Discuss your preferred type of beach and stay",
      "Make room for time together or time alone",
      "Ask your agent to advise on dates and destination conditions",
    ],
  },
] as const;
export function atlasMatches(theme: string, pace: string, maximum: number) {
  return ATLAS_IDEAS.filter(
    (i) => (theme === "All" || i.theme === theme) && i.nights <= maximum,
  ).sort((a, b) => Number(b.pace === pace) - Number(a.pace === pace) || a.nights - b.nights);
}
