import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  Check,
  Plus,
  Minus,
  Plane,
  Moon,
  Sun,
  Compass,
  Train,
  Users,
  Send,
} from "lucide-react";
import type { Concept } from "./concepts";
import type { TravelBrief } from "./journeys";
import { PHOTO } from "./experience-hero";

type Props = { c: Concept; onBrief: (brief: TravelBrief) => void };
function Submit({ children }: { children: ReactNode }) {
  return (
    <button className="s-submit" type="submit">
      {children}
      <ArrowUpRight size={20} />
    </button>
  );
}
function Options({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: string[];
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <div className="s-options" role="group" aria-label={label}>
      {values.map((v) => (
        <button type="button" key={v} aria-pressed={value === v} onClick={() => onChange(v)}>
          {value === v ? <Check size={15} /> : <Plus size={15} />} {v}
        </button>
      ))}
    </div>
  );
}
function Header({ number, title, copy }: { number: string; title: ReactNode; copy: string }) {
  return (
    <header className="s-intro">
      <span>{number} / YOUR TRIP STARTS TAKING SHAPE</span>
      <h2>{title}</h2>
      <p>{copy}</p>
    </header>
  );
}
const bounded = (value: string, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.trunc(Number(value) || min)));

function EventDesk({ c, onBrief }: Props) {
  const [purpose, setPurpose] = useState("A working trip"),
    [city, setCity] = useState(""),
    [from, setFrom] = useState("Johannesburg"),
    [people, setPeople] = useState(4),
    [rooms, setRooms] = useState(4),
    [dates, setDates] = useState(""),
    [pace, setPace] = useState("Close to the meeting"),
    [notes, setNotes] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    onBrief({
      destination: `${from} → ${city}`,
      dates,
      travellers: `${people} business travellers`,
      notes: `${purpose}. ${rooms} requested rooms, subject to rooming arrangements. Stay preference: ${pace}. Team requirements: ${notes || "Please discuss meeting space, transfers and approval process"}.`,
    });
  }
  return (
    <section className="signature-planner s-altitude" id="discover">
      <Header
        number={c.number}
        title={
          <>
            A shared destination.
            <br />
            <em>A coordinated arrival.</em>
          </>
        }
        copy="Bring the people, timings and priorities together. We’ll help your team arrive with a plan."
      />
      <div className="s-terminal">
        <div className="s-terminal-board">
          <div className="s-board-head">
            <Plane size={18} />
            <span>YOUR DEPARTURE BOARD</span>
            <span>BRIEF / 01</span>
          </div>
          <div className="s-airports">
            <span>{from || "Origin"}</span>
            <i>→</i>
            <span>{city || "Next destination"}</span>
          </div>
          <div className="s-board-stats">
            <div>
              <b>{String(people).padStart(2, "0")}</b>
              <span>people to bring together</span>
            </div>
            <div>
              <b>{String(rooms).padStart(2, "0")}</b>
              <span>rooms to discuss</span>
            </div>
          </div>
          <p>
            {purpose} · {dates || "Dates, to be decided"}
          </p>
          <img src={PHOTO.city} alt="City skyline at dusk" loading="lazy" />
          <small>
            A planning brief. Your consultant confirms the actual flight, room and transfer
            arrangements.
          </small>
        </div>
        <form onSubmit={submit}>
          <Options
            label="Purpose of your business trip"
            values={["A working trip", "A team offsite", "A conference or event"]}
            value={purpose}
            onChange={setPurpose}
          />
          <div className="s-fields">
            <label>
              Team departure city
              <input
                required
                maxLength={100}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label>
              Team destination
              <input
                required
                placeholder="City or event location"
                maxLength={100}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
            <label>
              Travellers in the team
              <input
                type="number"
                min="1"
                max="100"
                value={people}
                onChange={(e) => setPeople(bounded(e.target.value, 1, 100))}
              />
            </label>
            <label>
              Rooms to discuss
              <input
                type="number"
                min="1"
                max="100"
                value={rooms}
                onChange={(e) => setRooms(bounded(e.target.value, 1, 100))}
              />
            </label>
            <label className="s-wide">
              Travel and meeting dates
              <input
                maxLength={120}
                placeholder="Travel dates, meeting dates, or flexible"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
              />
            </label>
          </div>
          <label className="s-label">
            The right base
            <select value={pace} onChange={(e) => setPace(e.target.value)}>
              <option>Close to the meeting</option>
              <option>Space for the team to work together</option>
              <option>A setting for time away from work</option>
            </select>
          </label>
          <label className="s-label">
            What needs coordinating?
            <textarea
              maxLength={800}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Different departure cities, working space, group transfers, or company approval…"
            />
          </label>
          <Submit>Bring the team brief together</Submit>
        </form>
      </div>
    </section>
  );
}

function HolidayMixer({ c, onBrief }: Props) {
  const [experience, setExperience] = useState(c.experiences[0]),
    [adults, setAdults] = useState(2),
    [ages, setAges] = useState([5, 9]),
    [morning, setMorning] = useState("Splash about"),
    [afternoon, setAfternoon] = useState("A little exploring"),
    [room, setRoom] = useState("Help us choose"),
    [dates, setDates] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    onBrief({
      destination: experience,
      dates,
      travellers: `${adults} adults${ages.length ? `; children aged ${ages.join(", ")}` : "; no children"}`,
      notes: `${experience}. Our kind of family day: ${morning} in the morning; ${afternoon} in the afternoon. Room preference: ${room}. Please check age suitability, supervision, room layouts and transfer times for our actual dates.`,
    });
  }
  return (
    <section className="signature-planner s-little-big" id="discover">
      <Header
        number={c.number}
        title={
          <>
            Their big adventure.
            <br />
            <em>Your kind of holiday.</em>
          </>
        }
        copy="Let everyone have a say. Build a little picture of the days your family would love."
      />
      <div className="s-mixer">
        <form onSubmit={submit}>
          <Options
            label="Family holiday style"
            values={c.experiences}
            value={experience}
            onChange={setExperience}
          />
          <div className="s-fields">
            <label>
              Grown-ups
              <input
                type="number"
                min="1"
                max="12"
                value={adults}
                onChange={(e) => setAdults(bounded(e.target.value, 1, 12))}
              />
            </label>
            <label>
              Holiday window
              <input
                maxLength={120}
                placeholder="School holidays, month or dates"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
              />
            </label>
          </div>
          <div className="s-children">
            <div>
              <h3>The little people</h3>
              <button
                type="button"
                disabled={ages.length >= 6}
                onClick={() => setAges([...ages, 5])}
              >
                <Plus size={16} /> Add a child
              </button>
            </div>
            {ages.map((age, i) => (
              <div className="s-child" key={i}>
                <label htmlFor={`holiday-child-${i}`}>Child {i + 1}</label>
                <select
                  id={`holiday-child-${i}`}
                  aria-label={`Child ${i + 1} age`}
                  value={age}
                  onChange={(e) =>
                    setAges(ages.map((a, j) => (j === i ? Number(e.target.value) : a)))
                  }
                >
                  {Array.from({ length: 18 }, (_, n) => (
                    <option key={n} value={n}>
                      {n === 0 ? "Under 1" : `${n} years`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label={`Remove child ${i + 1}`}
                  onClick={() => setAges(ages.filter((_, j) => j !== i))}
                >
                  <Minus size={16} />
                </button>
              </div>
            ))}
          </div>
          <label className="s-label">
            Room arrangement
            <select value={room} onChange={(e) => setRoom(e.target.value)}>
              <option>Help us choose</option>
              <option>One family room or suite</option>
              <option>Connecting rooms</option>
              <option>Space for a larger family gathering</option>
            </select>
          </label>
          <Submit>Let’s plan this family adventure</Submit>
        </form>
        <aside className="s-daybook">
          <span className="s-sticker">
            MADE OF
            <br />
            GOOD DAYS ☀
          </span>
          <div className="s-day-photo">
            <img src={PHOTO.family} alt="A family together on the beach" loading="lazy" />
          </div>
          <h3>A day in our happy place</h3>
          <div className="s-day-row">
            <Sun />
            <div>
              <label>
                In the morning
                <select value={morning} onChange={(e) => setMorning(e.target.value)}>
                  <option>Splash about</option>
                  <option>Spot something wild</option>
                  <option>Wake up slowly</option>
                </select>
              </label>
            </div>
          </div>
          <div className="s-day-row">
            <Compass />
            <div>
              <label>
                In the afternoon
                <select value={afternoon} onChange={(e) => setAfternoon(e.target.value)}>
                  <option>A little exploring</option>
                  <option>More pool time</option>
                  <option>Ice cream and absolutely nothing</option>
                </select>
              </label>
            </div>
          </div>
          <p>
            A wish list, not a fixed itinerary. We’ll find the places and arrangements that suit
            your crew.
          </p>
        </aside>
      </div>
    </section>
  );
}

function PrivateCompass({ c, onBrief }: Props) {
  const [place, setPlace] = useState("A quiet wilderness"),
    [pace, setPace] = useState("One remarkable base"),
    [privacy, setPrivacy] = useState("Small, discreet properties"),
    [cabin, setCabin] = useState("First class where available"),
    [window, setWindow] = useState(""),
    [details, setDetails] = useState("");
  const places = [
    { name: "A quiet wilderness", image: PHOTO.safari },
    { name: "An ocean sanctuary", image: PHOTO.islands },
    { name: "A journey by rail", image: PHOTO.rail },
  ];
  function submit(e: FormEvent) {
    e.preventDefault();
    onBrief({
      destination: place,
      dates: window,
      notes: `Private travel preferences: ${pace}. ${privacy}. Flights: ${cabin}. Personal details to consider: ${details || "Discuss privately with the consultant"}. Please confirm specific properties, services and availability.`,
    });
  }
  return (
    <section className="signature-planner s-nocturne" id="discover">
      <Header
        number={c.number}
        title={
          <>
            The rarest luxury?
            <br />
            <em>Feeling understood.</em>
          </>
        }
        copy="A few quiet choices. A journey with your particular point of view."
      />
      <form onSubmit={submit}>
        <div className="s-private-scenes">
          {places.map((p, i) => (
            <button
              type="button"
              key={p.name}
              aria-pressed={place === p.name}
              onClick={() => setPlace(p.name)}
            >
              <img src={p.image} alt="" loading="lazy" />
              <span>0{i + 1}</span>
              <h3>{p.name}</h3>
              <i>{place === p.name ? <Check /> : <Plus />}</i>
            </button>
          ))}
        </div>
        <div className="s-private-bottom">
          <div className="s-compass-note">
            <Moon size={36} />
            <h3>
              Nothing rushed.
              <br />
              Nothing assumed.
            </h3>
            <p>
              Tell us what matters. Your consultant will translate these preferences into specific
              places and arrangements, then return with a written proposal.
            </p>
            <span>NOCTURNE / A PRIVATE CONVERSATION</span>
          </div>
          <div>
            <div className="s-fields">
              <label>
                The pace
                <select value={pace} onChange={(e) => setPace(e.target.value)}>
                  <option>One remarkable base</option>
                  <option>A journey in several chapters</option>
                  <option>Leave some days unplanned</option>
                </select>
              </label>
              <label>
                The feeling of the stay
                <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                  <option>Small, discreet properties</option>
                  <option>Villa or exclusive-use options to discuss</option>
                  <option>Landmark hotels and exceptional suites</option>
                </select>
              </label>
              <label>
                Cabin preference
                <select value={cabin} onChange={(e) => setCabin(e.target.value)}>
                  <option>First class where available</option>
                  <option>Business class</option>
                  <option>Discuss the best arrangements</option>
                </select>
              </label>
              <label>
                When the time is right
                <input
                  maxLength={120}
                  value={window}
                  onChange={(e) => setWindow(e.target.value)}
                  placeholder="A month, dates, or wonderfully flexible"
                />
              </label>
            </div>
            <label className="s-label">
              The details that make it yours
              <textarea
                maxLength={1000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="A special occasion, private guiding, dining preferences, a particular place…"
              />
            </label>
            <Submit>Begin a private conversation</Submit>
          </div>
        </div>
      </form>
    </section>
  );
}

export function budgetShares(total: number, style: string) {
  const weights =
    style === "Comfort first"
      ? [45, 25, 20, 10]
      : style === "Do more"
        ? [25, 25, 40, 10]
        : [35, 25, 30, 10];
  const first = weights.slice(0, 3).map((p) => Math.floor((total * p) / 100));
  return [...first, total - first.reduce((a, b) => a + b, 0)];
}
const money = (n: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
function BudgetLab({ c, onBrief }: Props) {
  const [total, setTotal] = useState(20000),
    [crew, setCrew] = useState(3),
    [style, setStyle] = useState("A bit of everything"),
    [destination, setDestination] = useState(""),
    [nights, setNights] = useState(10),
    [dates, setDates] = useState("");
  const shares = budgetShares(total, style),
    labels = [
      "A place to crash",
      "Getting around",
      "Food + experiences",
      "Room for the unexpected",
    ];
  function submit(e: FormEvent) {
    e.preventDefault();
    onBrief({
      destination,
      dates,
      travellers: `${crew} travellers`,
      notes: `Personal group budget brief: ${money(total)} per person; ${money(total * crew)} for ${crew} people. ${nights} nights. Style: ${style}. Illustrative allocation chosen by traveller (not supplier prices): ${labels.map((l, i) => `${l}: ${money(shares[i]!)}`).join("; ")}. Please discuss whether international flights can fit this overall target and explain actual inclusions.`,
    });
  }
  return (
    <section className="signature-planner s-sidequest" id="discover">
      <Header
        number={c.number}
        title={
          <>
            Big plans.
            <br />
            <em>Actual numbers.</em>
          </>
        }
        copy="Get the group chat onto the same page. Start with what you want to spend, then let your agent check what it can do."
      />
      <div className="s-budget-lab">
        <form onSubmit={submit}>
          <label className="s-budget-total">
            My trip budget per person
            <span>
              R{" "}
              <input
                aria-label="Budget per person in rand"
                type="number"
                min="0"
                max="1000000"
                step="100"
                value={total}
                onChange={(e) => setTotal(bounded(e.target.value, 0, 1000000))}
              />
            </span>
          </label>
          <Options
            label="Spending style"
            values={["A bit of everything", "Comfort first", "Do more"]}
            value={style}
            onChange={setStyle}
          />
          <div className="s-fields">
            <label>
              How many in the crew?
              <input
                type="number"
                min="1"
                max="30"
                value={crew}
                onChange={(e) => setCrew(bounded(e.target.value, 1, 30))}
              />
            </label>
            <label>
              Nights away
              <input
                type="number"
                min="1"
                max="90"
                value={nights}
                onChange={(e) => setNights(bounded(e.target.value, 1, 90))}
              />
            </label>
            <label>
              Where are we heading?
              <input
                required
                maxLength={120}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Europe, Thailand, somewhere sunny…"
              />
            </label>
            <label>
              Travel window
              <input
                maxLength={120}
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                placeholder="Dates, month, or flexible"
              />
            </label>
          </div>
          <Submit>Take our plan to an agent</Submit>
        </form>
        <aside className="s-budget-receipt">
          <span className="s-ticket-cut" />
          <p>THE GROUP CHAT / MADE REAL</p>
          <h3>
            MAKE IT
            <br />
            ADD UP.
          </h3>
          <div className="s-budget-bars" aria-hidden="true">
            {shares.map((n, i) => (
              <i key={i} style={{ flex: total ? n / total : 1 }} />
            ))}
          </div>
          {labels.map((l, i) => (
            <div className="s-receipt-line" key={l}>
              <span>{l}</span>
              <b>{money(shares[i]!)}</b>
            </div>
          ))}
          <div className="s-receipt-total">
            <span>Whole crew’s target</span>
            <b>{money(total * crew)}</b>
          </div>
          <small>
            This divides your own budget. It is not a quote or an estimate of actual travel costs.
            Flights, stays and experiences need supplier checks.
          </small>
          <div className="s-barcode" aria-hidden="true" />
        </aside>
      </div>
    </section>
  );
}

function PostcardWriter({ c, onBrief }: Props) {
  const [place, setPlace] = useState("Island time"),
    [pace, setPace] = useState("Slow mornings, open afternoons"),
    [people, setPeople] = useState(2),
    [window, setWindow] = useState(""),
    [message, setMessage] = useState("");
  const places = [
    { name: "Island time", image: PHOTO.beach },
    { name: "The scenic railway", image: PHOTO.rail },
    { name: "A little wilderness", image: PHOTO.safari },
  ];
  const selected = places.find((p) => p.name === place)!;
  function submit(e: FormEvent) {
    e.preventDefault();
    onBrief({
      destination: place,
      dates: window,
      travellers: `${people} travellers`,
      notes: `My travel postcard: ${pace}. ${message || "Please help us choose the right place and arrangements"}. Please confirm the actual destination, stays, transport and inclusions.`,
    });
  }
  return (
    <section className="signature-planner s-postcard" id="discover">
      <Header
        number={c.number}
        title={
          <>
            A note from
            <br />
            <em>your next holiday.</em>
          </>
        }
        copy="Picture the place. Tell us the feeling. We’ll help with the details that get you there."
      />
      <form onSubmit={submit}>
        <Options
          label="Choose your postcard"
          values={places.map((p) => p.name)}
          value={place}
          onChange={setPlace}
        />
        <div className="s-postcard-sheet">
          <div className="s-postcard-front" key={place}>
            <img
              src={selected.image}
              alt={`Travel inspiration for ${place.toLowerCase()}`}
              loading="lazy"
            />
            <span>Wish we were here.</span>
            <small>POSTCARD / {place.toUpperCase()}</small>
          </div>
          <div className="s-postcard-back">
            <div className="s-postal-stamp">
              <Compass />
              <span>
                GO
                <br />
                SOMEWHERE
              </span>
            </div>
            <p>Dear travel planner,</p>
            <label>
              The days should feel like
              <select value={pace} onChange={(e) => setPace(e.target.value)}>
                <option>Slow mornings, open afternoons</option>
                <option>Some discovery, some downtime</option>
                <option>A new experience every day</option>
              </select>
            </label>
            <div className="s-fields">
              <label>
                Travellers
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={people}
                  onChange={(e) => setPeople(bounded(e.target.value, 1, 12))}
                />
              </label>
              <label>
                When we could go
                <input
                  maxLength={120}
                  value={window}
                  onChange={(e) => setWindow(e.target.value)}
                  placeholder="A month or dates"
                />
              </label>
            </div>
            <label>
              And we would really love…
              <textarea
                maxLength={900}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="A room with a view, a train through the mountains, time with family…"
              />
            </label>
            <p className="s-postcard-sign">See you somewhere beautiful.</p>
          </div>
        </div>
        <Submit>Turn our postcard into a plan</Submit>
      </form>
    </section>
  );
}

export function SignaturePlanner(props: Props) {
  switch (props.c.id) {
    case "altitude":
      return <EventDesk {...props} />;
    case "little-big":
      return <HolidayMixer {...props} />;
    case "nocturne":
      return <PrivateCompass {...props} />;
    case "sidequest":
      return <BudgetLab {...props} />;
    case "postcard":
      return <PostcardWriter {...props} />;
    default:
      return null;
  }
}

const NOTES: Record<
  string,
  { title: string; copy: string; image: string; questions: [string, string][] }
> = {
  altitude: {
    title: "Good business travel works between the meetings, too.",
    copy: "The connections are part of the plan: airport to hotel, hotel to meeting, and a little time to reset.",
    image: PHOTO.architecture,
    questions: [
      [
        "Different cities, one team?",
        "Share each departure city and the point where everyone needs to meet. Your agent can compare practical arrival options.",
      ],
      [
        "A venue or a hotel?",
        "Tell us whether the meeting space is already arranged, and whether you need rooms, transfers or working space alongside it.",
      ],
      [
        "Who approves the journey?",
        "Include your approval process, fare flexibility and any company limits before your consultant prepares the options.",
      ],
    ],
  },
  "little-big": {
    title: "The little things make the big memories.",
    copy: "The first train ride. Another hour in the pool. The afternoon nobody wanted to end.",
    image: PHOTO.family,
    questions: [
      [
        "What works for their ages?",
        "Tell us each child’s age and interests. Your agent checks specific activity rules, supervision and room options with the provider.",
      ],
      [
        "How much moving around?",
        "Give us the transfer times and daily pace your family is comfortable with. Fewer changes of base can leave more time to enjoy being there.",
      ],
      [
        "Bringing the whole family?",
        "Share who needs to be together and who needs their own space. Room layouts matter more than a room count alone.",
      ],
    ],
  },
  nocturne: {
    title: "A sense of place. A sense of you.",
    copy: "The hotel is only part of the story. The view you wake to, the route you take and the time you keep for yourself matter just as much.",
    image: PHOTO.pool,
    questions: [
      [
        "What does privacy mean to you?",
        "A quiet room, a small lodge and exclusive-use arrangements are different requests. Tell your consultant which matters, so the actual offering can be confirmed.",
      ],
      [
        "A particular way of travelling?",
        "First class, business class, scenic rail or private transfers can shape the journey. Your consultant checks where those options are available.",
      ],
      [
        "An occasion to remember?",
        "Share the moment you are planning around and the details you want considered. A personal proposal should reflect those priorities.",
      ],
    ],
  },
  sidequest: {
    title: "Good stories. Sensible starting points.",
    copy: "Make the money conversation early. Leave the awkwardness at home.",
    image: PHOTO.friends,
    questions: [
      [
        "Does the budget include flights?",
        "Say what the overall target needs to cover. The budget planner divides your chosen amount; your agent checks actual prices and inclusions.",
      ],
      [
        "Are you all after the same trip?",
        "Compare pace, room-sharing and activity preferences before deciding. The best plan gives everyone a clear picture of what they are agreeing to.",
      ],
      [
        "Group tour or your own route?",
        "An organised social tour and an independent trip work differently. Ask your agent about the group style, age rules, schedule and flexibility.",
      ],
    ],
  },
  postcard: {
    title: "Somewhere you’ll be glad you went.",
    copy: "There is no single right way to travel. There is a way that feels right for you.",
    image: PHOTO.rail,
    questions: [
      [
        "A favourite place or somewhere new?",
        "Tell us what you loved about a previous trip. It can be a useful starting point even when you want a different destination.",
      ],
      [
        "Fixed dates or room to move?",
        "Give the dates that must work and the dates that can change. Your consultant can compare the available options with that flexibility in mind.",
      ],
      [
        "What happens after the enquiry?",
        "An agent reviews your brief and discusses the details. You can review a written quote and its conditions before choosing whether to book.",
      ],
    ],
  },
};
export function TravelNotes({ c }: { c: Concept }) {
  const n = NOTES[c.id];
  if (!n) return null;
  return (
    <section className={`travel-notes notes-${c.id}`}>
      <figure>
        <img src={n.image} alt="Illustrative travel photography" loading="lazy" />
        <figcaption>{c.name} / NOTES FOR A BETTER JOURNEY</figcaption>
      </figure>
      <div>
        <span>THE DETAILS THAT MAKE THE DIFFERENCE</span>
        <h2>{n.title}</h2>
        <p>{n.copy}</p>
        {n.questions.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <Plus size={18} />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
