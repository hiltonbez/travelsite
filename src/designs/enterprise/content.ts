// The Enterprise sample's words and pictures: destinations, travel news and the gallery. Example content for a demo
// agency; a real agency's comes from its TribeTravel content back end. Photos: Unsplash, each one checked by eye.
import mauritius1 from "@/assets/places/mauritius-1.jpg";
import mauritius2 from "@/assets/places/mauritius-2.jpg";
import mauritius3 from "@/assets/places/mauritius-3.jpg";
import zanzibar1 from "@/assets/places/zanzibar-1.jpg";
import zanzibar2 from "@/assets/places/zanzibar-2.jpg";
import zanzibar3 from "@/assets/places/zanzibar-3.jpg";
import falls1 from "@/assets/places/falls-1.jpg";
import falls2 from "@/assets/places/falls-2.jpg";
import falls3 from "@/assets/places/falls-3.jpg";
import kruger1 from "@/assets/places/kruger-1.jpg";
import kruger2 from "@/assets/places/kruger-2.jpg";
import kruger3 from "@/assets/places/kruger-3.jpg";
import capetown1 from "@/assets/places/capetown-1.jpg";
import capetown2 from "@/assets/places/capetown-2.jpg";
import capetown3 from "@/assets/places/capetown-3.jpg";
import santorini1 from "@/assets/places/santorini-1.jpg";
import santorini2 from "@/assets/places/santorini-2.jpg";
import santorini3 from "@/assets/places/santorini-3.jpg";

export type Destination = {
  slug: string;
  name: string;
  code: string;              // the airport, as it appears on a boarding pass
  region: string;
  flight: string;            // from Johannesburg
  tagline: string;
  intro: string;
  bestTime: string;
  goodFor: string[];
  photos: [string, string, string];
  days: [string, string][];  // a sample itinerary: title, what happens
  supplier: "beachcomber" | "thompsons";
};

export const DESTINATIONS: Destination[] = [
  {
    slug: "mauritius", name: "Mauritius", code: "MRU", region: "Indian Ocean", flight: "4h 10m from JNB",
    tagline: "Lagoons, Le Morne and long lunches.",
    intro: "Calm lagoons inside the reef, a mountain that drops straight into the sea, and resorts that do everything for you. The easiest island holiday from South Africa, with no visa needed.",
    bestTime: "May to December: dry, sunny and not too hot.",
    goodFor: ["Honeymoons", "Families", "All-inclusive", "Golf"],
    photos: [mauritius1, mauritius2, mauritius3],
    days: [
      ["Arrive", "Private transfer to your resort on the south-west coast. Sunset drinks facing Le Morne."],
      ["Lagoon day", "Snorkel the reef, kayak to the islets, or do nothing at all."],
      ["Chamarel", "The seven-coloured earth, the waterfall and a rum tasting in the hills."],
      ["Ile aux Cerfs", "Catamaran day out with a beach barbecue lunch."],
      ["Home", "A late check-out, then the short flight back to Johannesburg."],
    ],
    supplier: "beachcomber",
  },
  {
    slug: "zanzibar", name: "Zanzibar", code: "ZNZ", region: "East Africa", flight: "3h 50m from JNB",
    tagline: "Spice island, white sand and Stone Town.",
    intro: "Turquoise water at Nungwi and Kendwa, dhows at sunset, and the alleys and markets of Stone Town. Pair the beach with a few nights on safari in Tanzania.",
    bestTime: "June to October, and December to February.",
    goodFor: ["Beach", "Culture", "Safari add-on", "Diving"],
    photos: [zanzibar1, zanzibar2, zanzibar3],
    days: [
      ["Stone Town", "A guided walk through the old town, then dinner on a rooftop."],
      ["Spice farm", "Cloves, vanilla and cinnamon straight from the tree."],
      ["Nungwi", "Head north to the beach. Swimming at any tide."],
      ["Mnemba", "Snorkel with turtles and dolphins off Mnemba atoll."],
      ["Home", "Back to Johannesburg, or on to the Serengeti."],
    ],
    supplier: "thompsons",
  },
  {
    slug: "victoria-falls", name: "Victoria Falls", code: "VFA", region: "Zimbabwe & Zambia", flight: "1h 50m from JNB",
    tagline: "The smoke that thunders.",
    intro: "One of the world's great waterfalls, an hour and fifty minutes from Johannesburg. Add a sunset cruise on the Zambezi and a day trip to Chobe for the elephants.",
    bestTime: "February to May for full falls, August to December for game in Chobe.",
    goodFor: ["Short breaks", "Adventure", "Couples", "Chobe safari"],
    photos: [falls1, falls2, falls3],
    days: [
      ["Arrive", "Settle in, then a sunset cruise on the Zambezi."],
      ["The falls", "A guided walk along the rainforest paths. Bring a raincoat."],
      ["Chobe", "Day trip to Botswana: a river cruise and game drive."],
      ["Adrenaline", "Gorge swing, white-water rafting or a helicopter flip."],
      ["Home", "A short flight back to Johannesburg."],
    ],
    supplier: "thompsons",
  },
  {
    slug: "kruger", name: "Kruger & Sabi Sand", code: "MQP", region: "South Africa", flight: "55m from JNB, or a 5-hour drive",
    tagline: "The Big Five, a few hours from home.",
    intro: "Private reserves bordering the Kruger, with game drives at dawn and dusk and nights around the fire. A safari that fits into a long weekend.",
    bestTime: "May to September, when the bush is thin and animals gather at water.",
    goodFor: ["Big Five", "Families", "Long weekends", "Photography"],
    photos: [kruger1, kruger2, kruger3],
    days: [
      ["Arrive", "Fly into Skukuza or drive in. Afternoon game drive."],
      ["Dawn drive", "Coffee in the bush, tracking leopard with your ranger."],
      ["Bush walk", "On foot with an armed guide: tracks, birds and smaller things."],
      ["Boma night", "A last drive, then dinner under the stars."],
      ["Home", "A morning drive, then back to Johannesburg."],
    ],
    supplier: "thompsons",
  },
  {
    slug: "cape-town", name: "Cape Town & Winelands", code: "CPT", region: "South Africa", flight: "2h 10m from JNB",
    tagline: "Mountain, ocean and a glass of something local.",
    intro: "Table Mountain, the Atlantic seaboard and Chapman's Peak, then a few days in Franschhoek and Stellenbosch among the vineyards.",
    bestTime: "October to April for beach weather, May to September for wine and fires.",
    goodFor: ["Food & wine", "Self-drive", "City", "Whales (Hermanus)"],
    photos: [capetown1, capetown2, capetown3],
    days: [
      ["The mountain", "Cable car up Table Mountain, then the V&A Waterfront."],
      ["Peninsula", "Chapman's Peak, Boulders penguins and Cape Point."],
      ["Franschhoek", "The wine tram, and a long lunch."],
      ["Stellenbosch", "Oak-lined streets and a cellar tour."],
      ["Home", "Back to Cape Town for the flight home."],
    ],
    supplier: "thompsons",
  },
  {
    slug: "santorini", name: "Santorini & the Greek Islands", code: "JTR", region: "Greece", flight: "Via Athens, about 12h from JNB",
    tagline: "White walls, blue domes, the caldera at sunset.",
    intro: "Clifftop villages above a flooded volcano, then a ferry to Naxos or Paros for quieter beaches. Best as part of a longer Europe trip or a Mediterranean cruise.",
    bestTime: "May, June and September: warm sea, fewer crowds.",
    goodFor: ["Honeymoons", "Island hopping", "Cruises", "Food"],
    photos: [santorini1, santorini2, santorini3],
    days: [
      ["Athens", "The Acropolis and Plaka, then dinner with a view of the Parthenon."],
      ["Santorini", "Ferry or a short flight. Sunset in Oia."],
      ["Caldera", "Sail the caldera, swim at the hot springs."],
      ["Paros", "Ferry to Paros: fishing villages and long beaches."],
      ["Home", "Back via Athens."],
    ],
    supplier: "thompsons",
  },
];

export const destination = (slug: string) => DESTINATIONS.find((d) => d.slug === slug);

export type Article = { slug: string; title: string; tag: string; date: string; minutes: number; image: string; summary: string; body: string[] };

export const ARTICLES: Article[] = [
  {
    slug: "mauritius-in-winter", title: "Why Mauritius is at its best in our winter", tag: "Islands", date: "2026-10-12", minutes: 4,
    image: mauritius2,
    summary: "Dry days, cooler nights and quieter resorts: the case for an island escape between May and September.",
    body: [
      "Most South Africans picture Mauritius as a December holiday. But the island's winter, from May to September, is when it is at its most comfortable: days in the mid-twenties, low humidity and very little rain on the west and north coasts.",
      "It is also when resorts are quieter. Outside the school holidays you will often find better rates, easier dinner bookings and empty stretches of beach, especially around Le Morne and Flic en Flac.",
      "The trade winds that blow in winter make the south-east coast a favourite for kitesurfers, while the sheltered west stays calm for swimming and snorkelling. If you want still water every day, ask us for a west-coast resort.",
      "The flight from Johannesburg is just over four hours, there is no visa to arrange, and Mauritius runs on a time zone two hours ahead of ours. A week is enough; ten days is better.",
      "Our tip: book the transfer and the first night's dinner with your package, and leave the rest of the week free. The island is small and easy, and the best days are the unplanned ones.",
    ],
  },
  {
    slug: "first-safari", title: "Your first safari: what to pack and what to expect", tag: "Safari", date: "2026-09-28", minutes: 5,
    image: kruger1,
    summary: "Early mornings, neutral colours and a good pair of binoculars. A practical guide to a first trip to the Kruger.",
    body: [
      "A safari day starts early. Wake-up calls come at around five, with coffee and rusks before the morning drive. You are back for brunch, rest through the heat of the day, and head out again in the late afternoon.",
      "Pack neutral colours: khaki, olive and brown. Bright white shows dust and startles animals; dark blue and black attract tsetse flies in some areas. Layers matter more than anything, because winter mornings in an open vehicle are cold.",
      "Bring binoculars, a hat, sunscreen and a camera with a zoom lens if you have one. Phones take good landscape photos, but leopards rarely sit close.",
      "The Kruger area is a malaria area. Speak to your doctor or a travel clinic about prophylaxis before you go, especially in summer.",
      "And trust your ranger. The best sightings usually come from patience: a quiet half hour at a waterhole often beats a fast drive around the reserve.",
    ],
  },
  {
    slug: "greek-islands-on-a-cruise", title: "Seeing the Greek islands on a cruise", tag: "Cruises", date: "2026-09-10", minutes: 3,
    image: santorini2,
    summary: "Santorini, Mykonos and Crete in one week, unpacking once. How a Mediterranean cruise works for South Africans.",
    body: [
      "A Mediterranean cruise is the easiest way to see several Greek islands in one trip: you unpack once, wake up somewhere new, and spend the day ashore.",
      "Most cruises leave from Athens (Piraeus) or from Italy, and a typical week takes in Santorini, Mykonos, Crete and sometimes Rhodes or Kusadasi in Turkey.",
      "In Santorini, ships anchor in the caldera and you go ashore by tender. Take the cable car up to Fira, then the bus or a taxi to Oia. Allow time for the queue back down.",
      "South African passport holders need a Schengen visa for Greece and Italy. Apply early: appointments fill up months ahead in peak season. We help with the documents.",
      "Add a few nights in Athens before the cruise. Flights from Johannesburg arrive in the evening, and it is a lot less stressful than flying in on the day you sail.",
    ],
  },
];

export const article = (slug: string) => ARTICLES.find((a) => a.slug === slug);

/** Every destination photo for the gallery, with where it was taken: each place's first photo, then each second,
 *  so the gallery's columns mix places instead of stacking one place's photos together. */
export const GALLERY = [0, 1, 2].flatMap((i) => DESTINATIONS.map((d) => ({ src: d.photos[i] as string, place: d.name, slug: d.slug })));
