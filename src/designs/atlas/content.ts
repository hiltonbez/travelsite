// The Atlas sample's words and figures: where the globe's trips fly, the example supplier's packages, the group
// departures, and everything on the agency's dashboard. All example content for a demo agency; the destinations
// themselves are the Enterprise sample's (enterprise/content.ts).
import { DESTINATIONS, destination, type Destination } from "@/designs/enterprise/content";
import resort3 from "@/assets/resort-3.jpg";
import resort5 from "@/assets/resort-5.jpg";
import cruises from "@/assets/cruises.jpg";
import mauritius3 from "@/assets/places/mauritius-3.jpg";
import zanzibar2 from "@/assets/places/zanzibar-2.jpg";
import santorini3 from "@/assets/places/santorini-3.jpg";

export { DESTINATIONS, destination, type Destination };

/** A place on the globe: latitude and longitude in degrees. */
export type Point = { code: string; name: string; lat: number; lon: number };

export const CITIES = {
  JNB: { code: "JNB", name: "Johannesburg", lat: -26.1, lon: 28.2 },
  CPT: { code: "CPT", name: "Cape Town", lat: -33.9, lon: 18.6 },
  DUR: { code: "DUR", name: "Durban", lat: -29.6, lon: 31.1 },
  MRU: { code: "MRU", name: "Mauritius", lat: -20.4, lon: 57.7 },
  ZNZ: { code: "ZNZ", name: "Zanzibar", lat: -6.2, lon: 39.2 },
  VFA: { code: "VFA", name: "Victoria Falls", lat: -18.1, lon: 25.8 },
  MQP: { code: "MQP", name: "Kruger", lat: -24.6, lon: 31.6 },
  JTR: { code: "JTR", name: "Santorini", lat: 36.4, lon: 25.4 },
  SEZ: { code: "SEZ", name: "Seychelles", lat: -4.6, lon: 55.5 },
  DXB: { code: "DXB", name: "Dubai", lat: 25.25, lon: 55.4 },
  MLE: { code: "MLE", name: "Maldives", lat: 4.2, lon: 73.5 },
  HKT: { code: "HKT", name: "Phuket", lat: 8.1, lon: 98.3 },
  DPS: { code: "DPS", name: "Bali", lat: -8.7, lon: 115.2 },
  LHR: { code: "LHR", name: "London", lat: 51.5, lon: -0.4 },
  FCO: { code: "FCO", name: "Rome", lat: 41.8, lon: 12.2 },
  MIA: { code: "MIA", name: "Miami", lat: 25.8, lon: -80.3 },
} satisfies Record<string, Point>;

export type CityCode = keyof typeof CITIES;

/** A trip in progress, drawn as a glowing arc. Example travellers. */
export type Trip = { from: CityCode; to: CityCode; who: string; day: string };

export const TRIPS: Trip[] = [
  { from: "JNB", to: "MRU", who: "The Mokoenas", day: "Day 3 of 7" },
  { from: "CPT", to: "ZNZ", who: "Lerato & Sipho", day: "Day 5 of 9" },
  { from: "JNB", to: "VFA", who: "Pieterse family", day: "Day 2 of 4" },
  { from: "DUR", to: "SEZ", who: "Anika & Dev", day: "Honeymoon, day 6" },
  { from: "JNB", to: "JTR", who: "Book club of 8", day: "Day 4 of 12" },
  { from: "CPT", to: "DXB", who: "Naidoo family", day: "Day 1 of 6" },
  { from: "JNB", to: "MLE", who: "The Van Wyks", day: "Day 8 of 10" },
  { from: "JNB", to: "HKT", who: "Sam & Thabo", day: "Day 3 of 11" },
  { from: "CPT", to: "LHR", who: "Grace M.", day: "Day 9 of 14" },
  { from: "DUR", to: "DPS", who: "The Govenders", day: "Day 2 of 12" },
  { from: "JNB", to: "FCO", who: "Choir tour (22)", day: "Day 5 of 10" },
  { from: "CPT", to: "MIA", who: "Ruan & Mia", day: "Cruise, day 4" },
  { from: "JNB", to: "MQP", who: "Dlamini family", day: "Day 2 of 3" },
];

/** Where each destination page turns the globe, and the airport its arc lands on. */
export const PLACE: Record<string, CityCode> = {
  mauritius: "MRU", zanzibar: "ZNZ", "victoria-falls": "VFA", kruger: "MQP", "cape-town": "CPT", santorini: "JTR",
};

/** The third feed: an example cruise and island supplier, for the supplier this agency would add next. */
export type ExamplePackage = { id: string; name: string; place: string; nights: number; from_pp: number; image: string; line: string };
export const EXAMPLE_PACKAGES: ExamplePackage[] = [
  { id: "ex-1", name: "Indian Ocean island hopper", place: "Mauritius · Réunion · Seychelles", nights: 10, from_pp: 32900, image: cruises, line: "Sails from Port Louis, ocean-view cabin, all meals" },
  { id: "ex-2", name: "Zanzibar dhow & beach", place: "Zanzibar", nights: 7, from_pp: 21450, image: zanzibar2, line: "Two nights sailing, five at Kendwa" },
  { id: "ex-3", name: "Greek isles by sea", place: "Athens · Santorini · Mykonos", nights: 8, from_pp: 36500, image: santorini3, line: "Balcony cabin, drinks package" },
  { id: "ex-4", name: "Le Morne lagoon week", place: "Mauritius", nights: 7, from_pp: 28750, image: mauritius3, line: "Half board, catamaran day included" },
];

/** Group departures with a fixed number of seats. Example trips; a request goes to the agency as a real enquiry. */
export type Departure = { id: string; title: string; when: string; nights: number; from_pp: number; seats: number; left: number; image: string; host: string };
export const DEPARTURES: Departure[] = [
  { id: "d1", title: "Mauritius winter escape", when: "12 June 2027", nights: 7, from_pp: 24900, seats: 24, left: 5, image: DESTINATIONS[0]!.photos[1], host: "Hosted by Thandi" },
  { id: "d2", title: "Zanzibar & Stone Town", when: "3 July 2027", nights: 8, from_pp: 27400, seats: 16, left: 9, image: DESTINATIONS[1]!.photos[0], host: "Small group" },
  { id: "d3", title: "Victoria Falls long weekend", when: "20 August 2027", nights: 4, from_pp: 14650, seats: 12, left: 2, image: DESTINATIONS[2]!.photos[0], host: "Includes Chobe day trip" },
  { id: "d4", title: "Greek islands with Aisha", when: "9 September 2027", nights: 12, from_pp: 48900, seats: 20, left: 11, image: DESTINATIONS[5]!.photos[0], host: "Hosted by Aisha" },
  { id: "d5", title: "Seychelles honeymoon week", when: "14 October 2027", nights: 7, from_pp: 38200, seats: 10, left: 4, image: resort3, host: "Couples only" },
  { id: "d6", title: "Kruger spring safari", when: "1 November 2027", nights: 3, from_pp: 12800, seats: 8, left: 0, image: DESTINATIONS[3]!.photos[0], host: "Private reserve" },
];

// ---- the agency's dashboard (example data)
export const KPIS: { name: string; value: number; prefix?: string; suffix?: string; decimals?: number; change: string }[] = [
  { name: "Enquiries this month", value: 186, change: "+24% on October" },
  { name: "Quotes sent", value: 121, change: "Median 2h 50m to send" },
  { name: "Conversion", value: 34.7, suffix: "%", decimals: 1, change: "+4.1 points" },
  { name: "Booked value", value: 2.36, prefix: "R", suffix: "m", decimals: 2, change: "+R410k on October" },
];

export const WEEKLY = [22, 26, 24, 31, 29, 34, 33, 38, 36, 41, 44, 47];
export const MONTHLY: [string, number][] = [["Jun", 1.42], ["Jul", 1.71], ["Aug", 1.55], ["Sep", 1.88], ["Oct", 1.95], ["Nov", 2.36]];
export const FUNNEL: [string, number][] = [["Website visits", 8420], ["Enquiries", 186], ["Quotes sent", 121], ["Quotes opened", 104], ["Booked", 42]];
export const BY_DESTINATION: [string, number, string][] = [
  ["Mauritius", 742000, "#0E9FAE"], ["Zanzibar", 468000, "#1D6FD8"], ["Cape Town", 336000, "#F08C2E"],
  ["Greek islands", 418000, "#7B61FF"], ["Kruger", 214000, "#5AB06B"], ["Other", 182000, "#94A3B8"],
];
export const BY_SOURCE: [string, number][] = [["AI web chat", 61], ["Quote form", 54], ["WhatsApp", 38], ["Group departures", 19], ["Online booking", 14]];

export type Client = { name: string; trip: string; status: "New lead" | "Quoted" | "Quiet 5 days" | "Booked" | "Travelling"; last: string; value: string };
export const CLIENTS: Client[] = [
  { name: "Naledi Dlamini", trip: "Zanzibar, 2 adults, June", status: "Quiet 5 days", last: "5 days ago", value: "R54 800" },
  { name: "Lerato & Sipho Mokoena", trip: "Mauritius, April", status: "Booked", last: "Today 09:12", value: "R78 400" },
  { name: "Mark Fourie", trip: "Kruger, family of 4", status: "Quoted", last: "Yesterday", value: "R41 200" },
  { name: "Priya Naidoo", trip: "Seychelles honeymoon", status: "New lead", last: "4 min ago", value: "—" },
  { name: "The Van Wyks", trip: "Maldives, 10 nights", status: "Travelling", last: "Day 8 of 10", value: "R132 000" },
  { name: "Johan Botha", trip: "Greek islands group", status: "Quoted", last: "2 days ago", value: "R97 800" },
];

export type Supplier = { name: string; kind: string; status: "Live" | "Example" | "Manual"; last: string; bookings: number; colour: string };
export const SUPPLIERS: Supplier[] = [
  { name: "Beachcomber", kind: "Live rates · online booking", status: "Live", last: "Synced 2 min ago", bookings: 18, colour: "#0E9FAE" },
  { name: "Thompsons Holidays", kind: "Live packages · enquire", status: "Live", last: "Synced 6 min ago", bookings: 15, colour: "#F08C2E" },
  { name: "Coastline Cruises", kind: "Example feed · enquire", status: "Example", last: "Synced 11 min ago", bookings: 6, colour: "#7B61FF" },
  { name: "Airlink", kind: "Contracted fares · manual", status: "Manual", last: "Rates loaded 1 Nov", bookings: 9, colour: "#94A3B8" },
];

export const RESORT = resort5;
