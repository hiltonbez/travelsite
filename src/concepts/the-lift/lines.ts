// Everything the lift operator says, and the suite the concierge files a traveller under.
import { TRIPS, type ConceptTrip, type Mood } from "@/concepts/kit";

export const OPENING = "Going up? Press a floor. Each one is a different holiday.";
export const IDLE = "Any button. I've been told they all work.";
export const ALREADY = "We are already here. I checked.";
export const PATIENCE = "Patience. She's an old lift.";
export const HANDED_BACK = "Returned without a scratch. Pity.";
export const TOP_OF_HOUSE = "That's the roof. Above it is weather.";
export const BOTTOM_OF_HOUSE = "That's the lobby. Below it is the boiler, and you're on holiday.";
export const LOBBY = "The lobby. Front desk, directory, and no pressure.";

export const ARRIVE: Record<string, string> = {
  mauritius: "Mind the step. It's a lagoon.",
  zanzibar: "Spice island. Do not ask me what's in the tea.",
  "victoria-falls": "You'll hear it before you see it. Bring a raincoat. I don't lend mine.",
  kruger: "Keep your arms inside the lift. The herd has right of way.",
  "cape-town": "The mountain is real. The parking is a rumour.",
  santorini: "Twelve hours from Johannesburg and worth every stiff leg.",
};

const KEPT: Record<string, string> = {
  mauritius: "Mauritius. You'll want the room nearest the water. Everyone does.",
  zanzibar: "Zanzibar. An excellent choice. I shall say nothing of the sunburn.",
  "victoria-falls": "Four nights at the Falls. Long enough to get properly wet.",
  kruger: "Four nights and a knock on the door before dawn. Brave.",
  "cape-town": "Cape Town. I'll have someone hide the wine list from you. No I won't.",
  santorini: "Santorini. Expensive taste. We'll get along.",
};

const floorOf = (slug: string) => TRIPS.findIndex((t) => t.slug === slug) + 1;

/** What he says as a key lands on the ring. The more keys, the less he pretends not to notice. */
export function keptLine(keys: number[], trip: ConceptTrip) {
  const has = (slug: string) => keys.includes(floorOf(slug));
  if (keys.length === 6) return "All six. I shall have to take the stairs.";
  if (keys.length === 5) return "Five keys. I'm starting to think you own the place.";
  if (keys.length === 4) return "Four keys. Does your boss know?";
  if (keys.length === 3) return "Three keys. That is not a holiday, that is a campaign.";
  if (keys.length === 2) {
    if (has("kruger") && has("santorini"))
      return "Elephants, then Greek sunsets. You've thought about this.";
    if (has("mauritius") && has("zanzibar"))
      return "Two islands. You do know you can only lie on one at a time?";
    if (has("kruger") && has("victoria-falls"))
      return "Wet, then dusty. In that order, if you've any sense.";
    return "Two keys. That's no longer a whim, it's a plan.";
  }
  return KEPT[trip.slug] ?? "A fine choice. I shall say nothing further.";
}

const ROOMS = [
  "They're all unlocked. Bad security, good holiday.",
  "Housekeeping has been told you're lovely.",
  "Do take the towels. Everyone does.",
  "A fine room. I'd tell you if it wasn't. I wouldn't, actually.",
];

/** What he says as a room's door opens. The last room on every floor is the trip home, and he'd rather not. */
export function roomLine(count: number, title: string) {
  if (title === "Home") return "Room five is always 'Home'. We don't talk about room five.";
  return ROOMS[count % ROOMS.length] ?? "";
}

export function ridingLine(from: number, to: number, name: string) {
  if (Math.abs(to - from) >= 4) return `Express to ${name}. Hold on to your hat. I've got mine.`;
  return to > from ? "Going up." : "Going down. Nobody's fault.";
}

export function roofLine(keys: number) {
  if (keys === 0) return "No keys, no luggage. I admire it. The concierge has a suggestion.";
  if (keys === 1) return "One key. A person of decision. The concierge will see you now.";
  return `${keys} keys. The concierge will see you now. Try not to look smug.`;
}

const SUITES: Record<Mood, string> = {
  beach: "The Barefoot Suite",
  adventure: "The Bruises-and-Stories Suite",
  luxury: "The Room-Service Suite",
  culture: "The Sensible-Shoes Suite",
  wildlife: "The Dawn Drive Suite",
  romance: "The Do-Not-Disturb Suite",
  family: "The Interconnecting Suite",
  food: "The Second-Helping Suite",
};

/** The mood the kept trips share most strongly, as the name on the traveller's file. Ties go to the earlier mood. */
export function suiteFor(trips: ConceptTrip[]) {
  let best: Mood = "beach";
  let top = -1;
  for (const m of Object.keys(SUITES) as Mood[]) {
    const s = trips.reduce((n, t) => n + t.moods[m], 0);
    if (s > top) {
      top = s;
      best = m;
    }
  }
  return SUITES[best];
}
