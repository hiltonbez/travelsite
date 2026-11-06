import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Minus,
  Plane,
  Sun,
  X,
  Sparkles,
} from "lucide-react";
import { PHOTO, RouteDrawing, SunDrawing } from "./experience-hero";
import type { Concept } from "./concepts";

export type TravelBrief = {
  destination: string;
  dates?: string;
  travellers?: string;
  notes: string;
};
type JourneyProps = { c: Concept; onBrief: (brief: TravelBrief) => void };
function Label({ children }: { children: React.ReactNode }) {
  return <p className="x-eyebrow">{children}</p>;
}
function BriefButton({
  children = "Make this journey mine",
  disabled = false,
}: {
  children?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button className="j-submit" type="submit" disabled={disabled}>
      {children}
      <ArrowUpRight size={18} />
    </button>
  );
}

function CorporateDesk({ c, onBrief }: JourneyProps) {
  const [origin, setOrigin] = useState("Johannesburg");
  const [destination, setDestination] = useState("Dubai");
  const [cabin, setCabin] = useState("Business");
  const [date, setDate] = useState("");
  const [priorities, setPriorities] = useState(["Flexible fares"]);
  const toggle = (value: string) =>
    setPriorities((p) => (p.includes(value) ? p.filter((x) => x !== value) : [...p, value]));
  function submit(e: FormEvent) {
    e.preventDefault();
    onBrief({
      destination: `${origin} → ${destination}`,
      dates: date,
      travellers: "1 business traveller",
      notes: `Corporate journey · ${cabin} cabin. Preferences: ${priorities.join(", ") || "Discuss with consultant"}.`,
    });
  }
  return (
    <section id="discover" className="j-section j-corporate">
      <div className="j-heading">
        <Label>YOUR NEXT MOVE, PERFECTLY CONSIDERED</Label>
        <h2>
          From A to B.
          <br />
          <em>With everything in between.</em>
        </h2>
        <p>Build the brief. We’ll bring the flights, stays and transfers together.</p>
      </div>
      <div className="j-desk">
        <form onSubmit={submit}>
          <div className="j-desk-top">
            <Plane size={20} />
            <span>YOUR PERSONAL TRAVEL DESK</span>
            <small>01 / BRIEF</small>
          </div>
          <div className="j-fields">
            <label>
              Departing from
              <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
                <option>Johannesburg</option>
                <option>Cape Town</option>
                <option>Durban</option>
              </select>
            </label>
            <label>
              Travelling to
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                maxLength={100}
              />
            </label>
            <label>
              Preferred departure
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label>
              Cabin preference
              <select value={cabin} onChange={(e) => setCabin(e.target.value)}>
                <option>Business</option>
                <option>Premium economy</option>
                <option>Economy</option>
                <option>First class</option>
              </select>
            </label>
          </div>
          <p className="j-field-title">What matters most?</p>
          <div className="j-priorities">
            {["Flexible fares", "Direct flights", "Stay near the meeting", "Add a weekend"].map(
              (p) => (
                <button
                  type="button"
                  key={p}
                  aria-pressed={priorities.includes(p)}
                  onClick={() => toggle(p)}
                >
                  {priorities.includes(p) ? <Check size={13} /> : <Plus size={13} />} {p}
                </button>
              ),
            )}
          </div>
          <BriefButton>Prepare my travel brief</BriefButton>
        </form>
        <aside className="j-route-panel">
          <RouteDrawing />
          <div className="j-route-caption">
            <span>YOUR JOURNEY STARTS HERE</span>
            <h3>
              {origin}
              <ArrowRight size={22} />
              {destination || "Your next destination"}
            </h3>
            <p>{cabin} / Personally planned</p>
            <small>Route illustration · flight options confirmed by your consultant</small>
          </div>
        </aside>
      </div>
      <div className="j-process">
        <span>
          <b>01</b> Brief your travel desk
        </span>
        <span>
          <b>02</b> Review your personal quote
        </span>
        <span>
          <b>03</b> Arrive ready
        </span>
      </div>
    </section>
  );
}

const FAMILY_WORLDS = [
  {
    name: "Beach days",
    place: "Mauritius",
    image: PHOTO.beach,
    line: "Sandcastles. Sea swims. Absolutely no school bells.",
    tips: [
      "Ask about family rooms and kids’ clubs",
      "Leave room for slow mornings",
      "Plan transfers around little travellers",
    ],
  },
  {
    name: "Little explorers",
    place: "An African family safari",
    image: PHOTO.safari,
    line: "Big skies. Bigger animals. Very wide eyes.",
    tips: [
      "Match game drives to children’s ages",
      "Choose a lodge that welcomes your crew",
      "Balance wildlife time with pool time",
    ],
  },
  {
    name: "Big family gatherings",
    place: "A family holiday together",
    image: PHOTO.family,
    line: "Grandparents, cousins, and one very full camera roll.",
    tips: [
      "Discuss connecting rooms or a shared villa",
      "Plan something for every generation",
      "Keep some days wonderfully unplanned",
    ],
  },
];
function FamilyPlanner({ c, onBrief }: JourneyProps) {
  const [world, setWorld] = useState(0);
  const [adults, setAdults] = useState(2);
  const [ages, setAges] = useState<number[]>([5, 9]);
  const [energy, setEnergy] = useState(45);
  const [month, setMonth] = useState("");
  const chosen = FAMILY_WORLDS[world]!;
  const caption =
    energy < 35
      ? "Slow mornings & plenty of pool time"
      : energy > 65
        ? "Big discoveries & active days"
        : "A little adventure. A little doing nothing.";
  function submit(e: FormEvent) {
    e.preventDefault();
    onBrief({
      destination: chosen.place,
      dates: month,
      travellers: `${adults} adults${ages.length ? `, children aged ${ages.join(", ")}` : ", no children"}`,
      notes: `${chosen.name}. ${caption}. ${c.id === "wildlings" ? "We would love nature-led experiences." : ""}`,
    });
  }
  return (
    <section className="j-section j-family" id="discover">
      <div className="j-heading">
        <Label>LET EVERYONE HAVE A SAY</Label>
        <h2>
          {c.id === "wildlings"
            ? "What makes their eyes light up?"
            : "Big plans. Little co-planners."}
        </h2>
        <p>Start with the fun bit. We’ll help with the grown-up details.</p>
      </div>
      <div className="j-family-worlds" role="group" aria-label="Choose your family adventure">
        {FAMILY_WORLDS.map((w, i) => (
          <button key={w.name} onClick={() => setWorld(i)} aria-pressed={world === i}>
            <img src={w.image} alt="" loading="lazy" />
            <span>
              <small>ADVENTURE 0{i + 1}</small>
              <b>{w.name}</b>
            </span>
            <i>{world === i ? <Check size={18} /> : <Plus size={18} />}</i>
          </button>
        ))}
      </div>
      <div className="j-family-bottom">
        <aside>
          <SunDrawing />
          <Label>THE FAMILY VOTE IS IN</Label>
          <h3>{chosen.line}</h3>
          <ul>
            {chosen.tips.map((t) => (
              <li key={t}>
                <Check size={15} />
                {t}
              </li>
            ))}
          </ul>
          <small>
            Planning ideas, tailored by your consultant to your dates and children’s ages.
          </small>
        </aside>
        <form onSubmit={submit}>
          <h3>Meet the adventure crew.</h3>
          <div className="j-crew">
            <div>
              <span>Grown-ups</span>
              <button
                type="button"
                aria-label="Remove an adult"
                disabled={adults <= 1}
                onClick={() => setAdults(adults - 1)}
              >
                <Minus size={14} />
              </button>
              <b>{adults}</b>
              <button
                type="button"
                aria-label="Add an adult"
                disabled={adults >= 8}
                onClick={() => setAdults(adults + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
            <div>
              <span>Kids</span>
              <button
                type="button"
                aria-label="Remove a child"
                disabled={!ages.length}
                onClick={() => setAges(ages.slice(0, -1))}
              >
                <Minus size={14} />
              </button>
              <b>{ages.length}</b>
              <button
                type="button"
                aria-label="Add a child"
                disabled={ages.length >= 6}
                onClick={() => setAges([...ages, 5])}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          {ages.length > 0 && (
            <div className="j-kids-ages">
              {ages.map((age, i) => (
                <label key={i}>
                  Child {i + 1}’s age
                  <select
                    value={age}
                    onChange={(e) =>
                      setAges(ages.map((a, n) => (n === i ? Number(e.target.value) : a)))
                    }
                  >
                    {Array.from({ length: 18 }, (_, n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "year" : "years"}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}
          <label>
            When can we escape?
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </label>
          <label className="j-energy">
            Our holiday energy
            <input
              type="range"
              min="0"
              max="100"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
            />
            <span>
              <small>More chill</small>
              <small>More adventure</small>
            </span>
          </label>
          <p className="j-energy-caption" aria-live="polite">
            {caption}
          </p>
          <BriefButton>Let’s plan this family adventure</BriefButton>
        </form>
      </div>
    </section>
  );
}

const PRIVATE_WORLDS = [
  {
    name: "The Indian Ocean",
    place: "An Indian Ocean retreat",
    image: PHOTO.mauritius,
    tag: "01 / WATER",
    line: "An entirely different state of mind.",
    copy: "A villa by the water. A table set for two. Days shaped by the tide, rather than the clock. Tell us your ideal island and we’ll find the right way to experience it.",
  },
  {
    name: "The African wilderness",
    place: "A private African safari",
    image: PHOTO.safari,
    tag: "02 / EARTH",
    line: "Wildly beautiful. Quietly yours.",
    copy: "Early light on the savannah. A guide who knows when to stop. A small, carefully chosen lodge, with space to feel the wilderness around you.",
  },
  {
    name: "The slow journey",
    place: "A luxury rail journey",
    image: PHOTO.rail,
    tag: "03 / TIME",
    line: "The journey becomes the destination.",
    copy: "A beautifully made cabin. A landscape that changes with every mile. Let us explore the rail journeys, suites and thoughtful connections that suit your pace.",
  },
];
function PrivateCollection({ c, onBrief }: JourneyProps) {
  const [chosen, setChosen] = useState(0);
  const [pace, setPace] = useState("Unhurried & restorative");
  const [length, setLength] = useState("7–10 nights");
  const world = PRIVATE_WORLDS[chosen]!;
  function submit(e: FormEvent) {
    e.preventDefault();
    onBrief({
      destination: world.place,
      notes: `Private collection: ${world.name}. Preferred pace: ${pace}. Ideal duration: ${length}.`,
    });
  }
  return (
    <section className="j-section j-luxury" id="discover">
      <div className="j-heading">
        <Label>A COLLECTION. NEVER A CATALOGUE.</Label>
        <h2>
          Three worlds.
          <br />
          <em>Infinite possibilities.</em>
        </h2>
        <p>The starting point is a place. The rest is entirely personal.</p>
      </div>
      <div
        className="j-private-worlds"
        role="group"
        aria-label="Explore private travel collections"
      >
        {PRIVATE_WORLDS.map((w, i) => (
          <button key={w.name} onClick={() => setChosen(i)} aria-pressed={chosen === i}>
            <div>
              <img src={w.image} alt={w.name} loading="lazy" />
            </div>
            <span>{w.tag}</span>
            <h3>{w.name}</h3>
            <i>{chosen === i ? <Check size={17} /> : <ArrowUpRight size={17} />}</i>
          </button>
        ))}
      </div>
      <div className="j-private-detail">
        <div aria-live="polite">
          <Label>YOUR PRIVATE WORLD</Label>
          <h3>{world.line}</h3>
          <p>{world.copy}</p>
        </div>
        <form onSubmit={submit}>
          <label>
            The pace of your journey
            <select value={pace} onChange={(e) => setPace(e.target.value)}>
              <option>Unhurried & restorative</option>
              <option>Culturally immersive</option>
              <option>Adventure, beautifully considered</option>
            </select>
          </label>
          <label>
            A little time away
            <select value={length} onChange={(e) => setLength(e.target.value)}>
              <option>4–6 nights</option>
              <option>7–10 nights</option>
              <option>Two weeks or more</option>
              <option>Let’s discuss</option>
            </select>
          </label>
          <BriefButton>Arrange a private consultation</BriefButton>
        </form>
      </div>
    </section>
  );
}

const ROUTES = {
  Europe: [
    { city: "Lisbon", days: 3 },
    { city: "Barcelona", days: 3 },
    { city: "Rome", days: 3 },
    { city: "Athens", days: 3 },
  ],
  Asia: [
    { city: "Bangkok", days: 3 },
    { city: "Chiang Mai", days: 3 },
    { city: "Krabi", days: 4 },
    { city: "Singapore", days: 2 },
  ],
  Africa: [
    { city: "Cape Town", days: 4 },
    { city: "Victoria Falls", days: 3 },
    { city: "Chobe", days: 3 },
    { city: "Zanzibar", days: 4 },
  ],
} as const;
function YouthRoute({ c, onBrief }: JourneyProps) {
  const [region, setRegion] = useState<keyof typeof ROUTES>("Europe");
  const [stops, setStops] = useState<string[]>(ROUTES.Europe.map((s) => s.city));
  const [budget, setBudget] = useState("Good value, great experiences");
  const [crew, setCrew] = useState("With friends");
  const route = ROUTES[region];
  const selected = route.filter((s) => stops.includes(s.city));
  const days = selected.reduce((n, s) => n + s.days, 0);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!selected.length) return;
    onBrief({
      destination: selected.map((s) => s.city).join(" → "),
      travellers: crew,
      notes: `${region} route idea · approximately ${days} days before travel connections. Style: ${budget}. Please advise on the best order, transport and available tours.`,
    });
  }
  return (
    <section className="j-section j-youth" id="discover">
      <div className="j-heading">
        <Label>THE GROUP CHAT HAS ENTERED THE PLANNING STAGE</Label>
        <h2>
          Pick a place.
          <br />
          <em>Start a plot twist.</em>
        </h2>
        <p>Build a route idea. Your agent turns the good bits into a real trip.</p>
      </div>
      <div className="j-route-tabs" role="group" aria-label="Choose a route region">
        {Object.keys(ROUTES).map((r) => (
          <button
            key={r}
            aria-pressed={region === r}
            onClick={() => {
              setRegion(r as keyof typeof ROUTES);
              setStops(ROUTES[r as keyof typeof ROUTES].map((s) => s.city));
            }}
          >
            {r}
            <ArrowUpRight size={17} />
          </button>
        ))}
      </div>
      <div className="j-youth-board">
        <div className="j-youth-route">
          <span className="j-ticket-number">SQ / YOU ARE HERE</span>
          <div className="j-route-stops" role="group" aria-label="Choose route stops">
            {route.map((s, i) => (
              <button
                key={s.city}
                aria-pressed={stops.includes(s.city)}
                onClick={() =>
                  setStops(
                    stops.includes(s.city) ? stops.filter((x) => x !== s.city) : [...stops, s.city],
                  )
                }
              >
                <span>0{i + 1}</span>
                <i>{stops.includes(s.city) ? <Check size={17} /> : <Plus size={17} />}</i>
                <b>{s.city}</b>
                <small>{s.days} days to explore</small>
              </button>
            ))}
          </div>
          <div className="j-route-total" aria-live="polite">
            <strong>
              {days.toString().padStart(2, "0")}
              <small>DAYS, GIVE OR TAKE</small>
            </strong>
            <span>
              {selected.length
                ? selected.map((s) => s.city).join(" → ")
                : "Pick at least one stop to start your route."}
            </span>
          </div>
          <p className="j-route-caveat">
            An itinerary idea, not a scheduled tour. Your agent checks connections, dates and
            availability.
          </p>
        </div>
        <form onSubmit={submit}>
          <Label>MAKE IT YOUR KIND OF TRIP</Label>
          <h3>
            A good story
            <br />
            starts with you.
          </h3>
          <label>
            The crew
            <select value={crew} onChange={(e) => setCrew(e.target.value)}>
              <option>With friends</option>
              <option>Solo, ready to meet people</option>
              <option>As a couple</option>
            </select>
          </label>
          <label>
            Our travel style
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option>Good value, great experiences</option>
              <option>A little more comfort</option>
              <option>Save on stays, spend on experiences</option>
            </select>
          </label>
          <BriefButton disabled={!selected.length}>
            {selected.length ? "Take this route to my agent" : "Choose a stop first"}
          </BriefButton>
        </form>
      </div>
    </section>
  );
}

const SEASONS = [
  {
    name: "Summer",
    months: "December – February",
    destinations: [
      {
        name: "The Indian Ocean",
        place: "An Indian Ocean island holiday",
        image: PHOTO.mauritius,
        tag: "BEACH / SLOW DAYS",
      },
      { name: "Cape Town", place: "Cape Town", image: PHOTO.capetown, tag: "CITY / COAST" },
      {
        name: "Alpine rail",
        place: "A European winter rail holiday",
        image: PHOTO.rail,
        tag: "RAIL / SCENIC JOURNEYS",
      },
    ],
  },
  {
    name: "Autumn",
    months: "March – May",
    destinations: [
      {
        name: "Mediterranean moments",
        place: "A Mediterranean holiday",
        image: PHOTO.santorini,
        tag: "CULTURE / COAST",
      },
      {
        name: "Into the wild",
        place: "An African safari",
        image: PHOTO.safari,
        tag: "SAFARI / NATURE",
      },
      { name: "Island time", place: "Mauritius", image: PHOTO.mauritius, tag: "BEACH / SLOW DAYS" },
    ],
  },
  {
    name: "Winter",
    months: "June – August",
    destinations: [
      {
        name: "European summer",
        place: "A European summer holiday",
        image: PHOTO.santorini,
        tag: "CITIES / CULTURE",
      },
      {
        name: "Safari stories",
        place: "An African safari",
        image: PHOTO.safari,
        tag: "SAFARI / NATURE",
      },
      {
        name: "Mountain chapters",
        place: "An alpine journey",
        image: PHOTO.alpine,
        tag: "RAIL / MOUNTAINS",
      },
    ],
  },
  {
    name: "Spring",
    months: "September – November",
    destinations: [
      {
        name: "A different perspective",
        place: "An alpine holiday",
        image: PHOTO.alpine,
        tag: "NATURE / SLOW TRAVEL",
      },
      {
        name: "An island interlude",
        place: "An Indian Ocean island holiday",
        image: PHOTO.mauritius,
        tag: "BEACH / SLOW DAYS",
      },
      {
        name: "A journey by rail",
        place: "A scenic rail journey",
        image: PHOTO.rail,
        tag: "RAIL / DISCOVERY",
      },
    ],
  },
];
function SeasonalAtlas({ c, onBrief }: JourneyProps) {
  const [season, setSeason] = useState(0);
  const chosen = SEASONS[season]!;
  return (
    <section className="j-section j-classic" id="discover">
      <div className="j-heading">
        <Label>A GOOD TIME TO GET AWAY</Label>
        <h2>
          Every season.
          <br />
          <em>A different kind of wonderful.</em>
        </h2>
        <p>Choose when you’d like to leave. Discover a few places to begin.</p>
      </div>
      <div className="j-season-tabs" role="group" aria-label="Choose a travel season">
        {SEASONS.map((s, i) => (
          <button key={s.name} onClick={() => setSeason(i)} aria-pressed={season === i}>
            <Sun size={18} />
            <b>{s.name}</b>
            <span>{s.months}</span>
          </button>
        ))}
      </div>
      <div className="j-season-worlds" aria-live="polite">
        {chosen.destinations.map((d, i) => (
          <article key={d.name}>
            <button
              onClick={() =>
                onBrief({
                  destination: d.place,
                  dates: chosen.months,
                  notes: `Interested in ${d.name}. Travel window: South African ${chosen.name.toLowerCase()} (${chosen.months}); please advise on the best destination timing.`,
                })
              }
            >
              <div>
                <img src={d.image} alt={d.name} loading="lazy" />
              </div>
              <span>{d.tag}</span>
              <h3>
                {d.name}
                <ArrowUpRight size={22} />
              </h3>
              <small>Explore with your agent</small>
            </button>
          </article>
        ))}
      </div>
      <p className="j-season-note">
        Seasons follow the South African calendar. Your consultant will advise on local weather and
        the right time for each destination.
      </p>
    </section>
  );
}

export function AudienceJourney(props: JourneyProps) {
  return props.c.audience === "Corporate" ? (
    <CorporateDesk {...props} />
  ) : props.c.audience === "Family" ? (
    <FamilyPlanner {...props} />
  ) : props.c.audience === "Luxury" ? (
    <PrivateCollection {...props} />
  ) : props.c.audience === "Youth" ? (
    <YouthRoute {...props} />
  ) : (
    <SeasonalAtlas {...props} />
  );
}

type Story = {
  title: string;
  place: string;
  image: string;
  eyebrow: string;
  copy: string;
  moments: string[];
};
const STORIES: Record<string, Story[]> = {
  Corporate: [
    {
      title: "A meeting of fresh perspectives.",
      place: "A mountain team retreat",
      image: PHOTO.alpine,
      eyebrow: "THE OFFSITE EDIT",
      copy: "A change of scene can change a conversation. Start with what your team needs from the time away, then build a retreat around the right balance of working space, shared experiences and room to breathe.",
      moments: [
        "A workspace suited to your team",
        "Time outside, between the conversations",
        "Flights and transfers considered together",
      ],
    },
    {
      title: "A little beyond business.",
      place: "A Cape Town business trip with a weekend extension",
      image: PHOTO.capetown,
      eyebrow: "WORK / WANDER",
      copy: "The meeting ends on Friday. Your weekend doesn’t have to begin with a boarding call. Ask your consultant to explore an extension that makes the most of the place you’ve travelled to.",
      moments: [
        "Finish the working week well",
        "Explore at your own pace",
        "Return with a little more perspective",
      ],
    },
    {
      title: "A better way to arrive.",
      place: "An executive city journey",
      image: PHOTO.city,
      eyebrow: "THE CITY EDIT",
      copy: "The right stay, the right connection, and enough space in the schedule. We begin with your commitments and preferences, then bring the moving parts into one clear travel brief.",
      moments: [
        "A considered flight connection",
        "A stay near where you need to be",
        "Transfers that fit the schedule",
      ],
    },
  ],
  Family: [
    {
      title: "Remember the first time?",
      place: "A first family safari",
      image: PHOTO.safari,
      eyebrow: "SMALL EXPLORERS / BIG DISCOVERIES",
      copy: "That first elephant. The first sunrise from a game vehicle. The questions that keep coming on the way home. A first safari starts with a lodge and a pace that fit your children.",
      moments: [
        "Ask about minimum ages for activities",
        "Keep afternoons flexible",
        "Leave space for curiosity",
      ],
    },
    {
      title: "The fine art of doing less.",
      place: "A family island holiday",
      image: PHOTO.family,
      eyebrow: "SAND BETWEEN EVERY TOE",
      copy: "A holiday doesn’t need a timetable to become a favourite memory. Choose a place with room for play, easy meals, and something lovely for the grown-ups too.",
      moments: [
        "Family-friendly room arrangements",
        "Activities for different ages",
        "Long, wonderfully unhurried days",
      ],
    },
    {
      title: "A world outside the window.",
      place: "A family mountain adventure",
      image: PHOTO.mountain,
      eyebrow: "FRESH AIR / FULL HEARTS",
      copy: "Follow a trail, stop for a picnic, and see how far a little curiosity can take you. Your consultant can help match the adventure to your family’s energy and experience.",
      moments: [
        "Gentle walks and bigger views",
        "A base that suits your crew",
        "A little adventure, a lot of together",
      ],
    },
  ],
  Luxury: [
    {
      title: "A quieter kind of extraordinary.",
      place: "An Indian Ocean retreat",
      image: PHOTO.pool,
      eyebrow: "THE ART OF STILLNESS",
      copy: "There is a particular luxury in having nowhere else to be. A thoughtful stay, a beautifully slow day, and the feeling that every detail has been quietly considered.",
      moments: [
        "A stay selected around your preferences",
        "Room to slow down",
        "Thoughtful transfers and private arrangements on request",
      ],
    },
    {
      title: "Let the landscape lead.",
      place: "An African wilderness journey",
      image: PHOTO.safari,
      eyebrow: "THE WILDERNESS COLLECTION",
      copy: "A small camp. A remarkable setting. A guide who understands what makes a moment worth waiting for. Begin with the Africa you’ve imagined, and let your specialist shape the rest.",
      moments: [
        "A personally selected lodge",
        "Guiding and activities suited to you",
        "Time to be present in the landscape",
      ],
    },
    {
      title: "The beautifully long way.",
      place: "A luxury rail journey",
      image: PHOTO.rail,
      eyebrow: "A DIFFERENT MEASURE OF TIME",
      copy: "There are journeys where getting there is the point. Explore the routes, seasons and cabins that make a rail holiday feel less like a transfer and more like an occasion.",
      moments: [
        "A route worth taking slowly",
        "Cabin options explained clearly",
        "Stays before and after the journey",
      ],
    },
  ],
  Youth: [
    {
      title: "The best plans leave a little room.",
      place: "A Europe adventure",
      image: PHOTO.santorini,
      eyebrow: "SUNSET / SOMEWHERE NEW",
      copy: "One more island. One more late lunch. One more person you didn’t know you’d meet. Build a route with enough structure to get you there and enough space to make it yours.",
      moments: [
        "Choose your must-see stops",
        "Leave room for unexpected favourites",
        "Ask about group tours or independent travel",
      ],
    },
    {
      title: "Your people are out there.",
      place: "A social group adventure",
      image: PHOTO.friends,
      eyebrow: "GOOD COMPANY / GREAT STORIES",
      copy: "Going solo doesn’t have to mean travelling alone. Tell your agent about the people, pace and places you’re hoping for, and explore the group adventures that might fit.",
      moments: [
        "Meet people through shared experiences",
        "Choose a pace that fits",
        "Keep your budget focused on what matters",
      ],
    },
    {
      title: "Take the outside route.",
      place: "An active mountain escape",
      image: PHOTO.mountain,
      eyebrow: "LESS SCREEN TIME / MORE SKY",
      copy: "Trade the feed for a trail and see what happens. Whether it’s your first walking trip or a bigger challenge, the right advice helps you find an adventure that fits your experience.",
      moments: [
        "Be honest about your activity level",
        "Travel with the right kit and guidance",
        "Make space for the view",
      ],
    },
  ],
  Classic: [
    {
      title: "A slower way to see the world.",
      place: "A scenic European rail journey",
      image: PHOTO.rail,
      eyebrow: "THE TRAVEL JOURNAL / RAIL",
      copy: "Watch the landscape change without rushing past it. A well-planned rail journey brings together the pleasure of travelling and the places you’ve always wanted to see.",
      moments: [
        "A route with time to explore",
        "Comfortable connections",
        "Thoughtful stays along the way",
      ],
    },
    {
      title: "Some places ask you to stay.",
      place: "An Indian Ocean holiday",
      image: PHOTO.mauritius,
      eyebrow: "THE TRAVEL JOURNAL / ISLANDS",
      copy: "Warm water. A favourite corner of the beach. A day that stretches a little longer than you expected. Your consultant helps find the island and stay that feel right for you.",
      moments: [
        "Choose your ideal pace",
        "Match the stay to your preferences",
        "Make room for a little discovery",
      ],
    },
    {
      title: "Go a little further. Feel a little more.",
      place: "An alpine discovery holiday",
      image: PHOTO.alpine,
      eyebrow: "THE TRAVEL JOURNAL / DISCOVERY",
      copy: "A new view can be the start of a very good story. Take the time to explore somewhere you haven’t been, with a journey shaped around what you most enjoy.",
      moments: [
        "Landscapes worth lingering in",
        "Experiences that suit your interests",
        "A personal quote before you commit",
      ],
    },
  ],
};
const EDITORIAL_TITLES: Record<string, string> = {
  vector: "Room to think. Space to go.",
  altitude: "Beyond the boardroom.",
  "little-big": "The bits they’ll talk about forever.",
  wildlings: "A field guide to extraordinary.",
  maison: "Places with a particular kind of magic.",
  nocturne: "Places that keep their secrets.",
  offscript: "Proof that you were really there.",
  sidequest: "Routes worth missing home for.",
  meridian: "Notes from a wider world.",
  postcard: "Stories worth writing home about.",
};
export function TravelEditorial({
  c,
  onBrief,
  onChat,
  onFilm,
  showManifesto = true,
}: {
  c: Concept;
  onBrief: (brief: TravelBrief) => void;
  onChat: () => void;
  onFilm: () => void;
  showManifesto?: boolean;
}) {
  const [story, setStory] = useState<Story | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (story) dialog.current?.showModal?.();
  }, [story]);
  const stories = STORIES[c.audience]!;
  return (
    <>
      <section className="j-section j-editorial" id="approach">
        <div className="j-editorial-head">
          <div>
            <Label>COLLECT MOMENTS, NOT JUST DESTINATIONS</Label>
            <h2>{EDITORIAL_TITLES[c.id]}</h2>
          </div>
          <div className="j-editorial-arrows">
            <button
              onClick={() =>
                scroller.current?.scrollBy({
                  left: -450,
                  behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
                })
              }
              aria-label="Previous travel stories"
            >
              <ArrowLeft size={19} />
            </button>
            <button
              onClick={() =>
                scroller.current?.scrollBy({
                  left: 450,
                  behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
                })
              }
              aria-label="Next travel stories"
            >
              <ArrowRight size={19} />
            </button>
          </div>
        </div>
        <div className="j-story-grid" ref={scroller}>
          {stories.map((s, i) => (
            <article className={`j-story j-story-${i}`} key={s.title}>
              <button onClick={() => setStory(s)}>
                <div className="j-story-photo">
                  <img src={s.image} alt={s.place} loading="lazy" />
                  <span>0{i + 1}</span>
                  <i>
                    <ArrowUpRight size={21} />
                  </i>
                </div>
                <Label>{s.eyebrow}</Label>
                <h3>{s.title}</h3>
                <span className="j-read-story">
                  Read the story <ArrowUpRight size={14} />
                </span>
              </button>
            </article>
          ))}
        </div>
      </section>
      {showManifesto && (
        <section className="j-manifesto">
          <div className="j-manifesto-image">
            <img
              src={
                c.audience === "Corporate"
                  ? PHOTO.architecture
                  : c.audience === "Family"
                    ? PHOTO.family
                    : c.audience === "Luxury"
                      ? PHOTO.pool
                      : c.audience === "Youth"
                        ? PHOTO.friends
                        : PHOTO.alpine
              }
              alt="A little inspiration for your next journey"
              loading="lazy"
            />
            <button onClick={onFilm}>
              <PlayIcon /> A moment of escape
            </button>
          </div>
          <div>
            <Label>PERSONAL BY NATURE</Label>
            <h2>
              {c.audience === "Corporate"
                ? "Your next move deserves a human touch."
                : c.audience === "Family"
                  ? "For your whole, wonderfully different crew."
                  : c.audience === "Luxury"
                    ? "The most important detail is you."
                    : c.audience === "Youth"
                      ? "Big ideas. Real people. A way to get there."
                      : "A good journey begins with a conversation."}
            </h2>
            <p>
              {c.audience === "Corporate"
                ? "Your schedule isn’t a template. Neither is your journey. Tell us what the trip needs to do, and we’ll build a personal quote around the details that matter."
                : "We start by listening. To the places on your list, the way you like to travel, and the little things that make a holiday feel like yours. Then we bring it all together."}
            </p>
            <button className="j-conversation" onClick={onChat}>
              Talk to the AI travel assistant <Sparkles size={17} />
            </button>
            <small>A little help to begin. A real consultant to make it happen.</small>
          </div>
        </section>
      )}
      {story && (
        <dialog
          className="j-story-dialog"
          ref={dialog}
          onCancel={() => setStory(null)}
          aria-labelledby="story-title"
        >
          <button
            className="j-close-story"
            onClick={() => setStory(null)}
            aria-label="Close travel story"
          >
            <X />
          </button>
          <img src={story.image} alt={story.place} />
          <div>
            <Label>{story.eyebrow}</Label>
            <h2 id="story-title">{story.title}</h2>
            <p>{story.copy}</p>
            <h3>A few things to consider</h3>
            <ul>
              {story.moments.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <p className="j-story-footnote">
              An idea to explore with your consultant. Details, pricing and availability are
              confirmed in your personal quote.
            </p>
            <button
              className="j-submit"
              onClick={() => {
                onBrief({
                  destination: story.place,
                  notes: `Inspired by “${story.title}”. ${story.moments.join("; ")}.`,
                });
                setStory(null);
              }}
            >
              Use this as my starting point <ArrowUpRight size={18} />
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
function PlayIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" aria-hidden="true">
      <path d="m6 3 11 7-11 7Z" fill="currentColor" />
    </svg>
  );
}
