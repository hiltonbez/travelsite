// The Living Map sample's own content: group departures with their seat maps, example rates (shown only when the live
// Beachcomber feed can't be read), reviews, the example WhatsApp and email messages and lead reminders, and the team.
// Example content for a demo agency, and labelled as such on the page. Destinations come from the Enterprise sample.
import { DESTINATIONS, destination, type Destination } from "@/designs/enterprise/content";
import { BRAND } from "@/designs/shared";

export { DESTINATIONS, destination, type Destination };

/** A group departure with a fixed number of seats (Tribe Site Pro: bookings with seat limits). */
export type Departure = {
  slug: string;
  name: string;
  place: string;                // destination slug
  dates: string;
  nights: number;
  vehicle: "plane" | "coach";
  rows: number;                 // 4 seats a row, A B | C D
  taken: string[];              // seats already booked
  price: string;
  includes: string;
  host: string;
};

export const DEPARTURES: Departure[] = [
  {
    slug: "zanzibar-march", name: "Zanzibar group trip", place: "zanzibar", dates: "12–19 March 2027", nights: 7, vehicle: "plane", rows: 4,
    taken: ["1A", "1B", "1C", "1D", "2A", "2B", "2D", "3B", "3C", "3D", "4A", "4D"],
    price: "R24 900", includes: "Return flights from Johannesburg, 7 nights half board in Nungwi, a Stone Town walk and a Mnemba snorkel day.",
    host: "Thandi",
  },
  {
    slug: "kruger-april", name: "Kruger family safari", place: "kruger", dates: "3–7 April 2027", nights: 4, vehicle: "coach", rows: 5,
    taken: ["1A", "1B", "2C", "2D", "3A", "4B", "4C", "5A", "5D"],
    price: "R14 500", includes: "Return coach from Johannesburg, 4 nights full board at a Sabi Sand lodge and two game drives a day.",
    host: "Pieter",
  },
  {
    slug: "falls-may", name: "Victoria Falls long weekend", place: "victoria-falls", dates: "22–25 May 2027", nights: 3, vehicle: "plane", rows: 3,
    taken: ["1A", "1B", "1C", "2B", "2C", "3A", "3D"],
    price: "R18 750", includes: "Return flights, 3 nights bed and breakfast, a guided walk at the falls and a Zambezi sunset cruise.",
    host: "Pieter",
  },
  {
    slug: "mauritius-june", name: "Mauritius winter escape", place: "mauritius", dates: "14–21 June 2027", nights: 7, vehicle: "plane", rows: 5,
    taken: ["1A", "1B", "1C", "1D", "2A", "2B", "2C", "2D", "3A", "3B", "3D", "4A", "4B", "4C", "4D", "5C", "5D"],
    price: "R32 900", includes: "Return flights, 7 nights half board at a west-coast resort, transfers and a catamaran day to Ile aux Cerfs.",
    host: "Thandi",
  },
  {
    slug: "cape-town-september", name: "Cape Town & Winelands by coach", place: "cape-town", dates: "9–14 September 2027", nights: 5, vehicle: "coach", rows: 6,
    taken: ["1A", "1B", "1C", "1D", "2A", "2B", "4C", "4D", "6A", "6B"],
    price: "R16 200", includes: "Return flights, a coach and guide for the week, 5 nights in Cape Town and Franschhoek, and the wine tram.",
    host: "Aisha",
  },
];

export const departure = (slug: string) => DEPARTURES.find((d) => d.slug === slug);
export const seatsIn = (d: Departure) => d.rows * 4;
export const seatsLeft = (d: Departure) => seatsIn(d) - d.taken.length;

/** Example Beachcomber rates, shown (and labelled) only when the live feed can't be read. */
export const EXAMPLE_RATES: { hotel: string; star: string; nights: number; board: string; from: string }[] = [
  { hotel: "Paradis Beachcomber Golf Resort", star: "5★", nights: 7, board: "Half board", from: "R38 900" },
  { hotel: "Trou aux Biches Beachcomber", star: "5★", nights: 7, board: "Half board", from: "R34 500" },
  { hotel: "Shandrani Beachcomber", star: "4★", nights: 7, board: "All inclusive", from: "R36 200" },
  { hotel: "Canonnier Beachcomber", star: "4★", nights: 7, board: "Half board", from: "R27 800" },
];

/** Example reviews, each pinned on the map where the trip went. */
export const REVIEWS: { place: string; name: string; from: string; trip: string; when: string; stars: number; text: string }[] = [
  { place: "mauritius", name: "Lerato & Sipho", from: "Pretoria", trip: "Honeymoon, 9 nights", when: "August 2026", stars: 5,
    text: "Thandi found us a resort facing Le Morne and quietly arranged a sunset dinner on the beach. We didn't lift a finger." },
  { place: "zanzibar", name: "The Naidoo family", from: "Durban", trip: "Group trip, 7 nights", when: "March 2026", stars: 5,
    text: "We booked four seats on the group trip. The kids still talk about the turtles at Mnemba. Every transfer was waiting for us." },
  { place: "victoria-falls", name: "Johan B.", from: "Bloemfontein", trip: "Long weekend", when: "May 2026", stars: 5,
    text: "Three days, no stress. The WhatsApp reminders meant I never had to hunt for a voucher." },
  { place: "kruger", name: "Annelize & Kobus", from: "Stellenbosch", trip: "Sabi Sand safari", when: "July 2026", stars: 4,
    text: "Leopard on the first drive and lions on the last. The lodge Pieter picked was perfect for our two boys." },
  { place: "cape-town", name: "Ama O.", from: "Johannesburg", trip: "Winelands by coach", when: "October 2025", stars: 5,
    text: "I travelled alone and joined the coach group. Lovely people, a brilliant guide, and the wine tram was the highlight." },
  { place: "santorini", name: "Priya & Dev", from: "Cape Town", trip: "Greek islands", when: "June 2026", stars: 5,
    text: "Aisha sorted our Schengen visas and the ferries between the islands. The caldera at sunset is everything they say." },
];

/** The WhatsApp and email updates a client gets (Tribe Site Pro: WhatsApp and email notifications). Example messages. */
export const MESSAGES: { channel: "whatsapp" | "email"; title?: string; text: string; time: string }[] = [
  { channel: "whatsapp", text: `Hi Naledi, it's Thandi from ${BRAND.name}. Your Zanzibar quote Q-1042 is ready: 7 nights, flights and transfers. Tap to view.`, time: "09:12" },
  { channel: "email", title: "Your seats are held: Zanzibar group trip", text: "Seats 3A and 4B, 12–19 March. We'll hold them for 48 hours.", time: "09:13" },
  { channel: "whatsapp", text: "Reminder: your deposit is due Friday. Reply PAY and we'll send the link again.", time: "Tue 08:00" },
  { channel: "email", title: "Your travel documents", text: "Vouchers, flight times and your day-by-day itinerary are attached.", time: "Thu 16:40" },
  { channel: "whatsapp", text: "Your flight to Zanzibar leaves in 3 days. Check-in opens tomorrow at 06:00. Pack sunscreen!", time: "Sat 10:05" },
];

/** What the agency sees when a lead goes quiet (Tribe Site Pro: reminders). Example data. */
export const REMINDERS: { who: string; what: string; quiet: string; action: string }[] = [
  { who: "Thandi", what: "Mauritius quote for the Dlamini family", quiet: "3 days", action: "Follow up?" },
  { who: "Pieter", what: "Kruger safari enquiry from Jaco", quiet: "2 days", action: "Send a WhatsApp nudge?" },
  { who: "Aisha", what: "4 seats held on Cape Town & Winelands", quiet: "36 hours", action: "Hold expires tomorrow" },
  { who: "Thandi", what: "Zanzibar quote opened 4 times by Naledi", quiet: "1 day", action: "Hot lead: call now?" },
  { who: "Pieter", what: "Victoria Falls deposit not paid", quiet: "5 days", action: "Send the reminder?" },
];

export const TEAM: [string, string, string][] = [
  ["Thandi Mokoena", "Islands & honeymoons", "Has stayed at nine of Mauritius's resorts, so you don't have to guess."],
  ["Pieter van der Berg", "Safari & self-drive", "Fifteen years of trips into the Kruger and Botswana, and every group departure to the bush."],
  ["Aisha Khan", "Europe & cruises", "Knows the Schengen visa process inside out, and leads our Winelands coach week."],
];
