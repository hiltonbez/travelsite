import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Check,
  Plus,
  Minus,
  X,
  Save,
  RotateCcw,
  Plane,
  Compass,
  Train,
  Sun,
  Bookmark,
  Phone,
  Mail,
} from "lucide-react";
import type { Concept } from "./concepts";
import type { TravelBrief } from "./journeys";
import { PHOTO } from "./experience-hero";
import {
  familyMatches,
  atlasMatches,
  ATLAS_IDEAS,
  FAMILY_IDEAS,
  moveStop,
  routeTotals,
  validRouteDraft,
  type RouteStop,
} from "./planning";
import { contact } from "@/lib/contact";

export const FLAGSHIPS = new Set(["vector", "wildlings", "maison", "offscript", "meridian"]);
type Props = { c: Concept; onBrief: (brief: TravelBrief) => void };
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const short = (v: unknown, max = 200): v is string => typeof v === "string" && v["length"] <= max;
const texts = (v: unknown, max = 12): v is string[] =>
  Array.isArray(v) && v["length"] <= max && v["every"]((x) => short(x, 80));
function Intro({ number, title, copy }: { number: string; title: React.ReactNode; copy: string }) {
  return (
    <div className="f-intro">
      <p className="x-eyebrow">{number} / A JOURNEY THAT STARTS WITH YOU</p>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}
function Submit({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="submit" className="f-submit" disabled={disabled}>
      {children}
      <ArrowUpRight size={18} />
    </button>
  );
}
function Chips({
  label,
  values,
  selected,
  onChange,
}: {
  label: string;
  values: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="f-chips" role="group" aria-label={label}>
      {values.map((x) => (
        <button
          type="button"
          key={x}
          aria-pressed={selected.includes(x)}
          onClick={() =>
            onChange(selected.includes(x) ? selected.filter((v) => v !== x) : [...selected, x])
          }
        >
          {selected.includes(x) ? <Check size={13} /> : <Plus size={13} />} {x}
        </button>
      ))}
    </div>
  );
}

/** A saved draft contains planning preferences only; contact details are never persisted. */
function Draft<T>({
  id,
  value,
  valid,
  restore,
}: {
  id: string;
  value: T;
  valid: (v: unknown) => v is T;
  restore: (v: T) => void;
}) {
  const [saved, setSaved] = useState<T | null>(null);
  const [status, setStatus] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`tribe-planner-v3-${id}`);
      if (raw && raw.length < 15000) {
        const parsed: unknown = JSON.parse(raw);
        if (record(parsed) && parsed["version"] === 1 && valid(parsed["data"]))
          setSaved(parsed["data"]);
      }
    } catch {
      /* A browser draft is optional. */
    }
  }, [id]); // validators are fixed per planner
  function save() {
    try {
      localStorage.setItem(`tribe-planner-v3-${id}`, JSON.stringify({ version: 1, data: value }));
      setSaved(value);
      setStatus("Planning draft saved in this browser.");
    } catch {
      setStatus(
        "This browser cannot save drafts. You can still request a quote or download the finished brief.",
      );
    }
  }
  function remove() {
    try {
      localStorage.removeItem(`tribe-planner-v3-${id}`);
      setSaved(null);
      setStatus("Saved draft removed.");
    } catch {
      setStatus("Could not remove the saved draft. Please use your browser’s site-data controls.");
    }
  }
  return (
    <div className="f-draft">
      <div>
        <button type="button" onClick={save}>
          <Save size={13} />
          Save planning draft
        </button>
        {saved && (
          <>
            <button
              type="button"
              onClick={() => {
                restore(saved);
                setStatus("Saved planning draft restored.");
              }}
            >
              <RotateCcw size={13} />
              Resume saved draft
            </button>
            <button type="button" onClick={remove} aria-label="Delete saved planning draft">
              <X size={13} />
            </button>
          </>
        )}
      </div>
      <span role="status">
        {status || "Your contact details are never saved with a planning draft."}
      </span>
    </div>
  );
}

type Leg = {
  id: number;
  from: string;
  to: string;
  departure: string;
  meeting: string;
  venue: string;
};
type BusinessDraft = {
  legs: Leg[];
  cabin: string;
  buffer: number;
  people: number;
  priorities: string[];
  policy: string;
};
const validBusiness = (v: unknown): v is BusinessDraft =>
  record(v) &&
  Array.isArray(v["legs"]) &&
  v["legs"].length > 0 &&
  v["legs"].length <= 4 &&
  new Set(v["legs"].map((l) => l?.id)).size === v["legs"].length &&
  v["legs"].every(
    (l) =>
      record(l) &&
      Number.isInteger(l["id"]) &&
      short(l["from"], 80) &&
      short(l["to"], 80) &&
      short(l["departure"], 20) &&
      short(l["meeting"], 30) &&
      short(l["venue"], 120),
  ) &&
  short(v["cabin"], 40) &&
  Number.isInteger(v["buffer"]) &&
  Number(v["buffer"]) >= 2 &&
  Number(v["buffer"]) <= 48 &&
  Number.isInteger(v["people"]) &&
  Number(v["people"]) >= 1 &&
  Number(v["people"]) <= 20 &&
  texts(v["priorities"]) &&
  short(v["policy"], 300);
function BusinessJourney({ c, onBrief }: Props) {
  const [legs, setLegs] = useState<Leg[]>([
    { id: 1, from: "Johannesburg", to: "Dubai", departure: "", meeting: "", venue: "" },
  ]);
  const nextId = useRef(2);
  const [cabin, setCabin] = useState("Business");
  const [buffer, setBuffer] = useState(12);
  const [people, setPeople] = useState(1);
  const [priorities, setPriorities] = useState(["Flexible fares"]);
  const [policy, setPolicy] = useState("");
  const [error, setError] = useState("");
  function update(id: number, key: Exclude<keyof Leg, "id">, value: string) {
    setLegs((all) => all.map((l) => (l["id"] === id ? { ...l, [key]: value } : l)));
    setError("");
  }
  const value = { legs, cabin, buffer, people, priorities, policy };
  function restore(d: BusinessDraft) {
    setLegs(d.legs);
    nextId.current = Math.max(...d.legs.map((l) => l["id"])) + 1;
    setCabin(d.cabin);
    setBuffer(d.buffer);
    setPeople(d.people);
    setPriorities(d.priorities);
    setPolicy(d.policy);
    setError("");
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (
      legs.some(
        (l) =>
          !l["from"].trim() ||
          !l["to"].trim() ||
          l["from"].trim().toLowerCase() === l["to"].trim().toLowerCase(),
      )
    ) {
      setError("Each leg needs a different departure and destination city.");
      return;
    }
    onBrief({
      destination: legs
        .map((l, i) => `${i ? `${i + 1}. ` : ""}${l["from"].trim()} → ${l["to"].trim()}`)
        .join("; "),
      dates: legs.map((l) => l["departure"] || "Flexible departure").join("; "),
      travellers: `${people} business ${people === 1 ? "traveller" : "travellers"}`,
      notes: `Meeting-led journey · ${cabin} cabin. Prefer arrival at least ${buffer} hours before each meeting.\n${legs.map((l, i) => `Leg ${i + 1}: ${l["from"]} → ${l["to"]}. Depart ${l["departure"] || "flexible"}. Meeting ${l["meeting"] ? `${l["meeting"].replace("T", " ")} (destination local time)` : "to be confirmed"}. Stay near: ${l["venue"] || "please advise"}.`).join("\n")}\nPreferences: ${priorities.join(", ") || "Please advise"}. Company policy / approval: ${policy || "Discuss with traveller"}.`,
    });
  }
  return (
    <section id="discover" className="f-planner f-business">
      <Intro
        number="01"
        title={
          <>
            The meeting comes first.
            <br />
            <em>We build the journey around it.</em>
          </>
        }
        copy="One city or several. Plan the working commitments, the time to arrive, and the details that make business travel run smoothly."
      />
      <div className="f-business-grid">
        <form onSubmit={submit}>
          <div className="f-section-heading">
            <Plane size={19} />
            <h3>Your working itinerary</h3>
            <span>{legs.length} / 4 legs</span>
          </div>
          <div className="f-legs">
            {legs.map((l, i) => (
              <fieldset key={l["id"]}>
                <legend>
                  <span>0{i + 1}</span> {i ? "The next connection" : "The first departure"}
                </legend>
                {legs.length > 1 && (
                  <button
                    type="button"
                    className="f-remove-leg"
                    aria-label={`Remove leg ${i + 1}`}
                    onClick={() => setLegs(legs.filter((x) => x.id !== l["id"]))}
                  >
                    <X size={14} />
                  </button>
                )}
                <div className="f-fields">
                  <label>
                    {i ? `Leg ${i + 1} departure city` : "Departing from"}
                    <input
                      value={l["from"]}
                      onChange={(e) => update(l["id"], "from", e.target.value)}
                      required
                      maxLength={80}
                    />
                  </label>
                  <label>
                    {i ? `Leg ${i + 1} destination` : "Travelling to"}
                    <input
                      value={l["to"]}
                      onChange={(e) => update(l["id"], "to", e.target.value)}
                      required
                      maxLength={80}
                    />
                  </label>
                  <label>
                    Leg {i + 1} departure date
                    <input
                      type="date"
                      value={l["departure"]}
                      onChange={(e) => update(l["id"], "departure", e.target.value)}
                    />
                  </label>
                  <label>
                    Leg {i + 1} meeting, local time
                    <input
                      type="datetime-local"
                      value={l["meeting"]}
                      onChange={(e) => update(l["id"], "meeting", e.target.value)}
                    />
                  </label>
                </div>
                <label className="f-wide-label">
                  Leg {i + 1} meeting venue / preferred hotel area
                  <input
                    value={l["venue"]}
                    onChange={(e) => update(l["id"], "venue", e.target.value)}
                    maxLength={120}
                    placeholder="An office, conference venue or neighbourhood"
                  />
                </label>
              </fieldset>
            ))}
          </div>
          <button
            className="f-add"
            type="button"
            disabled={legs.length >= 4}
            onClick={() =>
              setLegs([
                ...legs,
                {
                  id: nextId.current++,
                  from: legs.at(-1)!.to,
                  to: "",
                  departure: "",
                  meeting: "",
                  venue: "",
                },
              ])
            }
          >
            <Plus size={14} />
            Add another city
          </button>
          <div className="f-fields f-trip-settings">
            <label>
              Cabin preference
              <select value={cabin} onChange={(e) => setCabin(e.target.value)}>
                <option>Business</option>
                <option>Premium economy</option>
                <option>Economy</option>
                <option>First class</option>
              </select>
            </label>
            <label>
              Business travellers
              <input
                type="number"
                value={people}
                min={1}
                max={20}
                onChange={(e) =>
                  setPeople(Math.max(1, Math.min(20, Math.trunc(Number(e.target.value)))))
                }
              />
            </label>
            <label>
              Preferred arrival buffer
              <select value={buffer} onChange={(e) => setBuffer(Number(e.target.value))}>
                {[2, 4, 8, 12, 24, 48].map((n) => (
                  <option value={n} key={n}>
                    {n} hours before the meeting
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="f-field-title">What matters most?</p>
          <Chips
            label="Business travel priorities"
            values={["Flexible fares", "Direct flights", "Stay near the meeting", "Add a weekend"]}
            selected={priorities}
            onChange={setPriorities}
          />
          <label className="f-wide-label">
            Company policy / approval needs
            <textarea
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Preferred suppliers, approval requirements, invoicing…"
            />
          </label>
          {error && (
            <p role="alert" className="f-error">
              {error}
            </p>
          )}
          <Submit>Prepare my travel brief</Submit>
          <Draft id={c.id} value={value} valid={validBusiness} restore={restore} />
        </form>
        <aside className="f-business-summary">
          <p className="x-eyebrow">THE JOURNEY, IN CONTEXT</p>
          <div className="f-timeline">
            {legs.map((l, i) => (
              <div key={l["id"]}>
                <i>{i + 1}</i>
                <small>{l["departure"] || "DATE TO BE AGREED"}</small>
                <h4>
                  {l["from"] || "Departure"}
                  <ArrowRight size={16} />
                  {l["to"] || "Next city"}
                </h4>
                <p>
                  {l["meeting"]
                    ? `Meeting: ${l["meeting"].replace("T", " ")} local time`
                    : "Meeting details to follow"}
                </p>
                {l["venue"] && <span>Stay near {l["venue"]}</span>}
              </div>
            ))}
          </div>
          <div className="f-buffer">
            <b>
              {buffer}
              <small>HOURS</small>
            </b>
            <p>Your preferred breathing room before business begins.</p>
          </div>
          <p className="f-note">
            Your consultant checks flight schedules, time zones and connections against this brief
            before quoting.
          </p>
        </aside>
      </div>
    </section>
  );
}

type FamilyDraft = {
  adults: number;
  ages: number[];
  interests: string[];
  pace: string;
  rooms: string;
  when: string;
  nights: number;
  school: boolean;
  compared: string[];
};
const validFamily = (v: unknown): v is FamilyDraft =>
  record(v) &&
  Number.isInteger(v["adults"]) &&
  Number(v["adults"]) >= 1 &&
  Number(v["adults"]) <= 8 &&
  Array.isArray(v["ages"]) &&
  v["ages"].length <= 6 &&
  v["ages"].every((a) => Number.isInteger(a) && a >= 0 && a <= 17) &&
  texts(v["interests"]) &&
  short(v["pace"], 30) &&
  short(v["rooms"], 40) &&
  short(v["when"], 120) &&
  Number.isInteger(v["nights"]) &&
  Number(v["nights"]) >= 3 &&
  Number(v["nights"]) <= 21 &&
  typeof v["school"] === "boolean" &&
  texts(v["compared"], 2) &&
  v["compared"].every((id) => FAMILY_IDEAS.some((i) => i.id === id));
const familyPhoto: Record<string, string> = {
  island: PHOTO.beach,
  safari: PHOTO.safari,
  rail: PHOTO.rail,
  together: PHOTO.family,
};
function FamilyExpedition({ c, onBrief }: Props) {
  const [adults, setAdults] = useState(2);
  const [ages, setAges] = useState([5, 9]);
  const [interests, setInterests] = useState(["Wildlife", "Discovery"]);
  const [pace, setPace] = useState("Balanced");
  const [rooms, setRooms] = useState("Connecting rooms");
  const [when, setWhen] = useState("");
  const [nights, setNights] = useState(7);
  const [school, setSchool] = useState(false);
  const [compared, setCompared] = useState(["safari", "island"]);
  const [notice, setNotice] = useState("");
  const ranked = familyMatches({ ages, interests, pace, rooms });
  const selected = ranked.filter((i) => compared.includes(i.id));
  const value = { adults, ages, interests, pace, rooms, when, nights, school, compared };
  function restore(d: FamilyDraft) {
    setAdults(d.adults);
    setAges(d.ages);
    setInterests(d.interests);
    setPace(d.pace);
    setRooms(d.rooms);
    setWhen(d.when);
    setNights(d.nights);
    setSchool(d.school);
    setCompared(d.compared);
    setNotice("");
  }
  function toggle(id: string) {
    if (compared.includes(id)) setCompared(compared.filter((x) => x !== id));
    else if (compared.length < 2) setCompared([...compared, id]);
    else setNotice("Compare two ideas at a time. Remove one to add another.");
  }
  function choose(id?: string) {
    const options = id ? ranked.filter((i) => i.id === id) : selected;
    if (!options.length) return;
    onBrief({
      destination: options.map((i) => i.name).join(" / "),
      dates: when,
      travellers: `${adults} adults${ages.length ? `, children aged ${ages.join(", ")}` : ", adults only"}`,
      notes: `Family expedition: ${options.map((i) => i.name).join(" versus ")}. ${nights} nights; ${pace.toLowerCase()} pace. Interests: ${interests.join(", ") || "Please advise"}. Rooms: ${rooms}. ${school ? "School-holiday timing is important; please check our school’s dates." : ""}\nPlease compare: ${[...new Set(options.flatMap((i) => i.checks))].join("; ")}.`,
    });
  }
  return (
    <section className="f-planner f-family" id="discover">
      <Intro
        number="02"
        title={
          <>
            A little crew.
            <br />
            <em>A world of possibilities.</em>
          </>
        }
        copy="Let their ages, curiosities and your kind of downtime shape the adventure. Compare two ideas before you decide."
      />
      <div className="f-family-workbench">
        <div className="f-family-inputs">
          <h3>First, meet the explorers.</h3>
          <div className="f-fields">
            <label>
              Grown-ups
              <input
                type="number"
                min={1}
                max={8}
                value={adults}
                onChange={(e) =>
                  setAdults(Math.max(1, Math.min(8, Math.trunc(Number(e.target.value)))))
                }
              />
            </label>
            <label>
              Time away
              <select value={nights} onChange={(e) => setNights(Number(e.target.value))}>
                {[3, 5, 7, 10, 14, 21].map((n) => (
                  <option key={n} value={n}>
                    {n} nights
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="f-kid-heading">
            <b>Little explorers</b>
            <button type="button" disabled={ages.length >= 6} onClick={() => setAges([...ages, 5])}>
              <Plus size={13} />
              Add a child
            </button>
          </div>
          <div className="f-kids">
            {ages.map((age, i) => (
              <div key={i}>
                <span>Explorer {i + 1}</span>
                <label>
                  Child {i + 1}’s age
                  <select
                    value={age}
                    onChange={(e) =>
                      setAges(ages.map((a, j) => (i === j ? Number(e.target.value) : a)))
                    }
                  >
                    {Array.from({ length: 18 }, (_, n) => (
                      <option key={n} value={n}>
                        {n} years
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  aria-label={`Remove child ${i + 1}`}
                  onClick={() => setAges(ages.filter((_, j) => i !== j))}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
          <p className="f-field-title">What sparks their curiosity?</p>
          <Chips
            label="Family interests"
            values={[
              "Wildlife",
              "Water play",
              "Discovery",
              "Gentle walks",
              "Trains",
              "Slow days",
              "Together time",
            ]}
            selected={interests}
            onChange={setInterests}
          />
          <div className="f-fields">
            <label>
              Our pace
              <select value={pace} onChange={(e) => setPace(e.target.value)}>
                <option>Easy</option>
                <option>Balanced</option>
                <option>Active</option>
              </select>
            </label>
            <label>
              Room preference
              <select value={rooms} onChange={(e) => setRooms(e.target.value)}>
                <option>Connecting rooms</option>
                <option>Family suite</option>
                <option>Shared villa</option>
                <option>Please advise</option>
              </select>
            </label>
          </div>
          <label className="f-wide-label">
            Our travel window
            <input
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              placeholder="Dates, month, or a flexible school break"
              maxLength={120}
            />
          </label>
          <label className="f-check">
            <input type="checkbox" checked={school} onChange={(e) => setSchool(e.target.checked)} />
            Work around our school holidays
          </label>
          <Draft id={c.id} value={value} valid={validFamily} restore={restore} />
        </div>
        <div className="f-family-matches">
          <div className="f-section-heading">
            <Compass size={20} />
            <h3>Ideas for your crew</h3>
          </div>
          <p className="f-note">
            Ordered by your selected interests and pace. These are planning ideas for your agent to
            check, not live packages.
          </p>
          <div className="f-family-idea-grid">
            {ranked.map((idea, i) => (
              <article key={idea.id}>
                <img src={familyPhoto[idea.id]} alt={idea.setting} loading="lazy" />
                <div>
                  <small>
                    {i === 0 && interests.length ? "START HERE / " : ""}
                    {idea.setting}
                  </small>
                  <h4>{idea.name}</h4>
                  <p>
                    {idea.reasons.length
                      ? idea.reasons.join(" · ")
                      : "A different direction to explore together."}
                  </p>
                  <button
                    type="button"
                    aria-pressed={compared.includes(idea.id)}
                    onClick={() => {
                      setNotice("");
                      toggle(idea.id);
                    }}
                  >
                    {compared.includes(idea.id) ? <Check size={13} /> : <Plus size={13} />}{" "}
                    {compared.includes(idea.id) ? "In comparison" : "Compare this idea"}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <p role="status" className="f-notice">
            {notice}
          </p>
        </div>
      </div>
      <div className="f-family-compare">
        <div className="f-section-heading">
          <span>FIELD NOTES</span>
          <h3>Two ideas. A clearer decision.</h3>
        </div>
        {selected.length ? (
          <>
            <div className="f-comparison-grid">
              {selected.map((idea) => (
                <article key={idea.id}>
                  <small>YOUR {nights}-NIGHT STARTING POINT</small>
                  <h4>{idea.name}</h4>
                  <p>{idea.ageNote}</p>
                  <h5>What your agent should check</h5>
                  <ul>
                    {idea.checks.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  <h5>Three moments to imagine</h5>
                  <ol>
                    {idea.days.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ol>
                  <button type="button" className="f-text-action" onClick={() => choose(idea.id)}>
                    Plan this direction
                    <ArrowUpRight size={15} />
                  </button>
                </article>
              ))}
            </div>
            <button className="f-submit" onClick={() => choose()}>
              Ask my agent to compare {selected.length === 2 ? "both ideas" : "this idea"}
              <ArrowUpRight size={18} />
            </button>
          </>
        ) : (
          <p>Select one or two ideas above to build your comparison.</p>
        )}
      </div>
    </section>
  );
}

const COLLECTION = [
  {
    id: "island",
    title: "A room by the ocean",
    type: "Stay",
    image: PHOTO.mauritius,
    notes: "An island stay selected around our preferred room and privacy needs.",
  },
  {
    id: "lodge",
    title: "A small wilderness lodge",
    type: "Stay",
    image: PHOTO.safari,
    notes: "A carefully chosen lodge and guiding suited to our interests.",
  },
  {
    id: "rail",
    title: "The beautifully long way",
    type: "Rail",
    image: PHOTO.rail,
    notes: "A scenic rail journey with suitable cabin and connection options.",
  },
  {
    id: "mountain",
    title: "A little alpine seclusion",
    type: "Stay",
    image: PHOTO.alpine,
    notes: "A comfortable mountain base, with our preferred level of activity.",
  },
  {
    id: "table",
    title: "Time around a remarkable table",
    type: "Experience",
    image: PHOTO.pool,
    notes: "A considered dining experience, with dietary preferences discussed.",
  },
  {
    id: "city",
    title: "A city through different eyes",
    type: "Experience",
    image: PHOTO.capetown,
    notes: "A privately arranged city discovery, subject to local options.",
  },
];
type LuxuryDraft = {
  items: string[];
  pace: string;
  duration: string;
  flight: string;
  privacy: string;
  when: string;
  priorities: string[];
  notes: string;
};
const validLuxury = (v: unknown): v is LuxuryDraft =>
  record(v) &&
  texts(v["items"], 6) &&
  new Set(v["items"]).size === v["items"].length &&
  v["items"].every((id) => COLLECTION.some((x) => x.id === id)) &&
  short(v["pace"], 60) &&
  short(v["duration"], 50) &&
  short(v["flight"], 50) &&
  short(v["privacy"], 60) &&
  short(v["when"], 120) &&
  texts(v["priorities"]) &&
  short(v["notes"], 500);
function PersonalCollection({ c, onBrief }: Props) {
  const [items, setItems] = useState(["island"]);
  const [filter, setFilter] = useState("All");
  const [pace, setPace] = useState("Unhurried & restorative");
  const [duration, setDuration] = useState("7–10 nights");
  const [flight, setFlight] = useState("Business class");
  const [privacy, setPrivacy] = useState("Quiet, small-scale stays");
  const [when, setWhen] = useState("");
  const [priorities, setPriorities] = useState(["Privacy"]);
  const [notes, setNotes] = useState("");
  const value = { items, pace, duration, flight, privacy, when, priorities, notes };
  const selected = items.map((id) => COLLECTION.find((x) => x.id === id)!);
  function restore(d: LuxuryDraft) {
    setItems(d.items);
    setPace(d.pace);
    setDuration(d.duration);
    setFlight(d.flight);
    setPrivacy(d.privacy);
    setWhen(d.when);
    setPriorities(d.priorities);
    setNotes(d.notes);
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!selected.length) return;
    onBrief({
      destination: selected.map((x) => x.title).join(" + "),
      dates: when,
      notes: `Personal collection, in preferred order:\n${selected.map((x, i) => `${i + 1}. ${x.title}: ${x.notes}`).join("\n")}\nPace: ${pace}. Duration: ${duration}. Flights: ${flight}. Stay style: ${privacy}. Priorities: ${priorities.join(", ") || "Discuss privately"}. Personal details to consider: ${notes || "Discuss privately"}. Please advise on a coherent route and the confirmed options.`,
    });
  }
  return (
    <section id="discover" className="f-planner f-maison">
      <Intro
        number="03"
        title={
          <>
            Collect what moves you.
            <br />
            <em>We’ll compose the journey.</em>
          </>
        }
        copy="Begin with a stay, a slower journey, a moment you would love to make yours. Your collection is the start of a private conversation."
      />
      <div className="f-maison-layout">
        <div>
          <div className="f-collection-tabs" role="group" aria-label="Filter private collection">
            {["All", "Stay", "Rail", "Experience"].map((t) => (
              <button key={t} aria-pressed={filter === t} onClick={() => setFilter(t)}>
                {t === "Stay" ? "Stays" : t === "Experience" ? "Experiences" : t}
              </button>
            ))}
          </div>
          <a className="f-collection-current" href="#personal-dossier">
            View your collection <span>{selected.length}</span>
            <ArrowDown size={14} />
          </a>
          <div className="f-collection-gallery">
            {COLLECTION.filter((x) => filter === "All" || x.type === filter).map((x, i) => (
              <article key={x.id}>
                <button
                  aria-pressed={items.includes(x.id)}
                  onClick={() =>
                    setItems(
                      items.includes(x.id) ? items.filter((id) => id !== x.id) : [...items, x.id],
                    )
                  }
                >
                  <div>
                    <img
                      src={x.image}
                      alt={`Inspiration for ${x.title.toLowerCase()}`}
                      loading="lazy"
                    />
                    <i>{items.includes(x.id) ? <Check size={19} /> : <Plus size={19} />}</i>
                  </div>
                  <small>
                    {x.type} / COLLECTION NOTE 0{COLLECTION.indexOf(x) + 1}
                  </small>
                  <h3>{x.title}</h3>
                  <span>
                    {items.includes(x.id) ? "In your collection" : "Add to your collection"}
                  </span>
                </button>
              </article>
            ))}
          </div>
        </div>
        <aside className="f-collection-dossier" id="personal-dossier">
          <form onSubmit={submit}>
            <p className="x-eyebrow">YOUR PRIVATE DOSSIER</p>
            <h3>
              A journey,
              <br />
              <em>entirely yours.</em>
            </h3>
            <ol>
              {selected.map((x, i) => (
                <li key={x.id}>
                  <span>0{i + 1}</span>
                  <b>{x.title}</b>
                  <div>
                    <button
                      type="button"
                      disabled={i === 0}
                      aria-label={`Move ${x.title} earlier`}
                      onClick={() => {
                        const next = [...items];
                        [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
                        setItems(next);
                      }}
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${x.title}`}
                      onClick={() => setItems(items.filter((id) => id !== x.id))}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
            {!selected.length && <p>Add a place or experience to begin your collection.</p>}
            <label>
              The pace
              <select value={pace} onChange={(e) => setPace(e.target.value)}>
                <option>Unhurried & restorative</option>
                <option>Culturally immersive</option>
                <option>Adventure, beautifully considered</option>
              </select>
            </label>
            <div className="f-fields">
              <label>
                Time away
                <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option>4–6 nights</option>
                  <option>7–10 nights</option>
                  <option>Two weeks or more</option>
                  <option>Let’s discuss</option>
                </select>
              </label>
              <label>
                Flights
                <select value={flight} onChange={(e) => setFlight(e.target.value)}>
                  <option>Business class</option>
                  <option>First class</option>
                  <option>Premium economy</option>
                  <option>Discuss privately</option>
                </select>
              </label>
            </div>
            <label>
              The feeling of your stay
              <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                <option>Quiet, small-scale stays</option>
                <option>Private villa or suite options</option>
                <option>Landmark hotels with a sense of occasion</option>
                <option>Please advise</option>
              </select>
            </label>
            <label>
              Your preferred travel window
              <input
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                maxLength={120}
                placeholder="Dates, month or wonderfully flexible"
              />
            </label>
            <p className="f-field-title">The details that matter</p>
            <Chips
              label="Private travel priorities"
              values={[
                "Privacy",
                "Exceptional dining",
                "Private guiding",
                "Rail journeys",
                "Time to do less",
              ]}
              selected={priorities}
              onChange={setPriorities}
            />
            <label>
              Anything only you would think to ask?
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Room preferences, an occasion, a favourite kind of day…"
              />
            </label>
            <Submit disabled={!selected.length}>Arrange a private consultation</Submit>
            <Draft id={c.id} value={value} valid={validLuxury} restore={restore} />
            <p className="f-note">
              Collection images are inspiration. Your consultant confirms the specific stays,
              experiences and arrangements.
            </p>
          </form>
        </aside>
      </div>
    </section>
  );
}

const ROUTE_STARTERS: Record<string, RouteStop[]> = {
  Europe: [
    { id: "lisbon", city: "Lisbon", nights: 3 },
    { id: "barcelona", city: "Barcelona", nights: 3 },
    { id: "rome", city: "Rome", nights: 3 },
    { id: "athens", city: "Athens", nights: 3 },
  ],
  Asia: [
    { id: "bangkok", city: "Bangkok", nights: 3 },
    { id: "chiangmai", city: "Chiang Mai", nights: 3 },
    { id: "krabi", city: "Krabi", nights: 4 },
    { id: "singapore", city: "Singapore", nights: 2 },
  ],
  Africa: [
    { id: "capetown", city: "Cape Town", nights: 4 },
    { id: "falls", city: "Victoria Falls", nights: 3 },
    { id: "chobe", city: "Chobe", nights: 3 },
    { id: "zanzibar", city: "Zanzibar", nights: 4 },
  ],
};
type RouteDraft = {
  region: string;
  stops: RouteStop[];
  transport: string;
  crew: number;
  budget: string;
  priorities: string[];
};
function EscapeRoute({ c, onBrief }: Props) {
  const [region, setRegion] = useState("Europe");
  const [stops, setStops] = useState<RouteStop[]>(ROUTE_STARTERS["Europe"]!);
  const [transport, setTransport] = useState("Mix it up — advise me");
  const [crew, setCrew] = useState(2);
  const [budget, setBudget] = useState("");
  const [priorities, setPriorities] = useState(["Local experiences"]);
  const [newCity, setNewCity] = useState("");
  const [error, setError] = useState("");
  const nextId = useRef(1);
  const value = { region, stops, transport, crew, budget, priorities };
  const total = routeTotals(stops);
  function restore(d: RouteDraft) {
    setRegion(d.region);
    setStops(d.stops);
    setTransport(d.transport);
    setCrew(d.crew);
    setBudget(d.budget);
    setPriorities(d.priorities);
    setError("");
  }
  function add() {
    const city = newCity.trim();
    if (!city || stops.length >= 6) return;
    if (stops.some((s) => s.city.toLowerCase() === city.toLowerCase())) {
      setError("That city is already on your route. Adjust its nights instead.");
      return;
    }
    setStops([...stops, { id: `custom-${Date.now()}-${nextId.current++}`, city, nights: 2 }]);
    setNewCity("");
    setError("");
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!stops.length) return;
    onBrief({
      destination: stops.map((s) => s.city).join(" → "),
      travellers: `${crew} ${crew === 1 ? "traveller" : "friends travelling together"}`,
      notes: `Custom ${region} escape route, in this order: ${stops.map((s, i) => `${i + 1}. ${s.city}, ${s.nights} nights`).join("; ")}. ${total.nights} nights / ${total.days} calendar days before extra travel connections. Transport preference: ${transport}. ${budget ? `Target budget: R${budget} per person for the trip; please discuss what it includes.` : "Budget: please advise on options."} Priorities: ${priorities.join(", ") || "Discuss with us"}. Please check a practical route, transfers and available tours; this is our own planning idea.`,
    });
  }
  return (
    <section id="discover" className="f-planner f-offscript">
      <Intro
        number="04"
        title={
          <>
            Your route.
            <br />
            <em>Your rules. Your story.</em>
          </>
        }
        copy="Reorder the stops. Stay longer somewhere good. Build the trip your group chat keeps talking about."
      />
      <div className="f-route-regions" role="group" aria-label="Choose a route region">
        {Object.keys(ROUTE_STARTERS).map((r) => (
          <button
            key={r}
            aria-pressed={region === r}
            onClick={() => {
              setRegion(r);
              setStops(ROUTE_STARTERS[r]!);
              setError("");
            }}
          >
            {r}
            <ArrowUpRight size={16} />
          </button>
        ))}
      </div>
      <div className="f-escape-grid">
        <div>
          <div className="f-route-card-head">
            <span>THE PLAN, SO FAR</span>
            <b>{stops.length} STOPS</b>
          </div>
          <ol className="f-editable-route">
            {stops.map((s, i) => (
              <li key={s.id}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{s.city}</h3>
                  <label>
                    {s.city} nights
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={s.nights}
                      onChange={(e) =>
                        setStops(
                          stops.map((x) =>
                            x.id === s.id
                              ? {
                                  ...x,
                                  nights: Math.max(
                                    1,
                                    Math.min(14, Math.trunc(Number(e.target.value))),
                                  ),
                                }
                              : x,
                          ),
                        )
                      }
                    />
                  </label>
                </div>
                <div className="f-route-order">
                  <button
                    type="button"
                    aria-label={`Move ${s.city} earlier`}
                    disabled={i === 0}
                    onClick={() => setStops(moveStop(stops, i, -1))}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${s.city} later`}
                    disabled={i === stops.length - 1}
                    onClick={() => setStops(moveStop(stops, i, 1))}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${s.city}`}
                    onClick={() => setStops(stops.filter((x) => x.id !== s.id))}
                  >
                    <X size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
          {!stops.length && (
            <p className="f-route-empty">A good story starts somewhere. Add a city below.</p>
          )}
          <div className="f-add-city">
            <label>
              Add your own stop
              <input
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                maxLength={80}
                placeholder="The city you keep thinking about"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    add();
                  }
                }}
              />
            </label>
            <button
              type="button"
              aria-label="Add city to route"
              disabled={!newCity.trim() || stops.length >= 6}
              onClick={add}
            >
              <Plus size={19} />
            </button>
          </div>
          {error && <p role="alert">{error}</p>}
          <p className="f-note">
            Up to six stops. Nights are your preferences; the travel connections still need
            checking.
          </p>
        </div>
        <aside className="f-escape-ticket">
          <form onSubmit={submit}>
            <p className="x-eyebrow">ONE TICKET TO A BETTER STORY</p>
            <div className="f-trip-total" aria-live="polite">
              <b>
                {total.nights.toString().padStart(2, "0")}
                <span>NIGHTS</span>
              </b>
              <p>
                {total.days} calendar days
                <br />
                before extra travel connections
              </p>
            </div>
            <div className="f-fields">
              <label>
                The crew
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={crew}
                  onChange={(e) =>
                    setCrew(Math.max(1, Math.min(8, Math.trunc(Number(e.target.value)))))
                  }
                />
              </label>
              <label>
                Budget per person, ZAR
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={1000000}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Optional"
                />
              </label>
            </div>
            <label>
              How do you want to move?
              <select value={transport} onChange={(e) => setTransport(e.target.value)}>
                <option>Mix it up — advise me</option>
                <option>Mostly trains</option>
                <option>Small-group coach tour</option>
                <option>Flights between the big stops</option>
              </select>
            </label>
            <p className="f-field-title">Spend the good bits on…</p>
            <Chips
              label="Route spending priorities"
              values={[
                "Local experiences",
                "Comfortable stays",
                "Meeting people",
                "Food discoveries",
                "Outdoor adventures",
              ]}
              selected={priorities}
              onChange={setPriorities}
            />
            <Submit disabled={!stops.length}>Take this route to my agent</Submit>
            <Draft id={c.id} value={value} valid={validRouteDraft} restore={restore} />
            <p className="f-note">
              A traveller-built brief, not a priced departure. Your agent helps turn the route into
              a workable trip.
            </p>
          </form>
        </aside>
      </div>
    </section>
  );
}

type AtlasDraft = {
  theme: string;
  pace: string;
  maximum: number;
  window: string;
  compared: string[];
};
const validAtlas = (v: unknown): v is AtlasDraft =>
  record(v) &&
  short(v["theme"], 30) &&
  short(v["pace"], 30) &&
  Number.isInteger(v["maximum"]) &&
  Number(v["maximum"]) >= 5 &&
  Number(v["maximum"]) <= 21 &&
  short(v["window"], 120) &&
  texts(v["compared"], 3) &&
  v["compared"].every((id) => ATLAS_IDEAS.some((i) => i.id === id));
const atlasPhoto = (key: string) => PHOTO[key as keyof typeof PHOTO] || PHOTO.alpine;
function PersonalAtlas({ c, onBrief }: Props) {
  const [theme, setTheme] = useState("All");
  const [pace, setPace] = useState("Easy");
  const [maximum, setMaximum] = useState(14);
  const [window, setWindow] = useState("");
  const [compared, setCompared] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const matches = atlasMatches(theme, pace, maximum);
  const selected = compared.map((id) => ATLAS_IDEAS.find((i) => i.id === id)!);
  const value = { theme, pace, maximum, window, compared };
  function restore(d: AtlasDraft) {
    setTheme(d.theme);
    setPace(d.pace);
    setMaximum(d.maximum);
    setWindow(d.window);
    setCompared(d.compared);
    setNotice("");
  }
  function compare(id: string) {
    setNotice("");
    if (compared.includes(id)) setCompared(compared.filter((x) => x !== id));
    else if (compared.length < 3) setCompared([...compared, id]);
    else setNotice("Your comparison has three ideas. Remove one to add another.");
  }
  function choose(ids: string[]) {
    const ideas = ids.map((id) => ATLAS_IDEAS.find((i) => i.id === id)!);
    onBrief({
      destination: ideas.map((i) => i.name).join(" / "),
      dates: window,
      notes: `Personal atlas: ${ideas.map((i) => `${i.name} (${i.theme.toLowerCase()}, ${i.pace.toLowerCase()} pace; ${i.nights}-night starting idea)`).join(" versus ")}. Our preferred pace is ${pace.toLowerCase()}, with up to ${maximum} nights away. Please advise on the right destination for our travel window, confirmed inclusions, connections and conditions.`,
    });
  }
  return (
    <section id="discover" className="f-planner f-meridian">
      <Intro
        number="05"
        title={
          <>
            A wider world.
            <br />
            <em>A clearer way to choose.</em>
          </>
        }
        copy="Think about how you like to travel. Compare a few directions, then let a personal conversation take you further."
      />
      <div className="f-atlas-layout">
        <aside className="f-atlas-index">
          <p className="x-eyebrow">YOUR TRAVEL INDEX</p>
          <div className="f-atlas-themes" role="group" aria-label="Filter destination styles">
            {["All", "Islands", "Rail", "Wildlife", "Cities", "Mountains"].map((t, i) => (
              <button key={t} aria-pressed={theme === t} onClick={() => setTheme(t)}>
                <span>0{i + 1}</span>
                {t}
                <ArrowRight size={13} />
              </button>
            ))}
          </div>
          <label>
            Our preferred pace
            <select value={pace} onChange={(e) => setPace(e.target.value)}>
              <option>Easy</option>
              <option>Balanced</option>
              <option>Active</option>
            </select>
          </label>
          <label>
            Up to how many nights?
            <select value={maximum} onChange={(e) => setMaximum(Number(e.target.value))}>
              {[5, 7, 10, 14, 21].map((n) => (
                <option key={n} value={n}>
                  {n} nights
                </option>
              ))}
            </select>
          </label>
          <label>
            Our travel window
            <input
              value={window}
              onChange={(e) => setWindow(e.target.value)}
              placeholder="Dates, a month, or flexible"
              maxLength={120}
            />
          </label>
          <Draft id={c.id} value={value} valid={validAtlas} restore={restore} />
        </aside>
        <div>
          <div className="f-atlas-results">
            <span>{matches.length} DIRECTIONS TO EXPLORE</span>
            <p>Ideas matching your pace appear first.</p>
          </div>
          <div className="f-atlas-grid">
            {matches.map((i) => (
              <article key={i.id}>
                <div className="f-atlas-photo">
                  <img
                    src={atlasPhoto(i.image)}
                    alt={`Inspiration for ${i.name.toLowerCase()}`}
                    loading="lazy"
                  />
                  <span>{i.theme}</span>
                </div>
                <div>
                  <small>
                    {i.pace} PACE / {i.nights}-NIGHT STARTING IDEA
                  </small>
                  <h3>{i.name}</h3>
                  <p>{i.line}</p>
                  <button
                    type="button"
                    aria-pressed={compared.includes(i.id)}
                    onClick={() => compare(i.id)}
                  >
                    {compared.includes(i.id) ? <Check size={14} /> : <Plus size={14} />}{" "}
                    {compared.includes(i.id) ? "In your comparison" : "Add to comparison"}
                  </button>
                  <button className="f-text-action" onClick={() => choose([i.id])}>
                    Explore this direction
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!matches.length && (
            <div className="f-empty">
              <h3>A little more room to explore?</h3>
              <p>
                There are no ideas for that combination. Try another style or a longer time away.
              </p>
              <button
                onClick={() => {
                  setTheme("All");
                  setMaximum(14);
                }}
              >
                Show more directions
                <ArrowRight size={15} />
              </button>
            </div>
          )}
          <p className="f-note">
            Durations are suggested starting points. Your consultant checks destination conditions
            and availability for your dates.
          </p>
        </div>
      </div>
      <p className="f-notice" role="status">
        {notice}
      </p>
      {selected.length > 0 && (
        <div className="f-atlas-comparison">
          <div className="f-section-heading">
            <Bookmark size={18} />
            <h3>Your places, side by side.</h3>
            <span>{selected.length}/3 ideas</span>
          </div>
          <div className="f-table-wrap" tabIndex={0} aria-label="Scroll the destination comparison">
            <table>
              <caption>A comparison of your selected travel ideas</caption>
              <thead>
                <tr>
                  <th scope="col">Consider</th>
                  {selected.map((i) => (
                    <th scope="col" key={i.id}>
                      {i.name}
                      <button
                        aria-label={`Remove ${i.name} from comparison`}
                        onClick={() => compare(i.id)}
                      >
                        <X size={13} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">The experience</th>
                  {selected.map((i) => (
                    <td key={i.id}>{i.theme}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Suggested starting pace</th>
                  {selected.map((i) => (
                    <td key={i.id}>{i.pace}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Time to begin with</th>
                  {selected.map((i) => (
                    <td key={i.id}>{i.nights} nights</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Questions for your agent</th>
                  {selected.map((i) => (
                    <td key={i.id}>
                      <ul>
                        {i.details.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <button className="f-submit" onClick={() => choose(compared)}>
            Discuss my selected directions
            <ArrowUpRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}

export function FlagshipJourney(props: Props) {
  switch (props.c.id) {
    case "vector":
      return <BusinessJourney {...props} />;
    case "wildlings":
      return <FamilyExpedition {...props} />;
    case "maison":
      return <PersonalCollection {...props} />;
    case "offscript":
      return <EscapeRoute {...props} />;
    case "meridian":
      return <PersonalAtlas {...props} />;
    default:
      return null;
  }
}

const CHAPTERS: Record<
  string,
  { label: string; title: string; image: string; copy: string; notes: [string, string][] }
> = {
  vector: {
    label: "THE WORKING JOURNEY / THREE DECISIONS THAT MATTER",
    title: "Build around the work. Leave room for the world.",
    image: PHOTO.architecture,
    copy: "A business trip is a sequence of commitments, not just a flight and a room. The right brief helps your consultant see the whole picture.",
    notes: [
      [
        "The meeting",
        "Give local meeting times, the venue and the time you want to arrive beforehand. Your agent checks the practical flight and transfer options.",
      ],
      [
        "The stay",
        "A hotel’s address matters as much as its room. Share the meeting location, working needs and the kind of downtime you value.",
      ],
      [
        "The approval",
        "Include fare flexibility, cabin preferences and company approval requirements so the quote can be reviewed with the right context.",
      ],
    ],
  },
  wildlings: {
    label: "THE FAMILY FIELD GUIDE / BEFORE YOU PACK",
    title: "The best family itinerary leaves room for being a family.",
    image: PHOTO.family,
    copy: "A good family plan makes space for different ages, different energy levels and the little things that help everyone settle in.",
    notes: [
      [
        "Their ages, their interests",
        "An age is a starting point. Tell your consultant what each child enjoys, how they handle transfers and the pace that works for your family.",
      ],
      [
        "A room that works",
        "Connecting rooms, a suite or a shared base each solve different needs. Ask about the actual layout, supervision needs and provider rules before choosing.",
      ],
      [
        "A day with breathing room",
        "One planned highlight and some open time can be a better starting point than a packed timetable. Your family’s preferences should set the pace.",
      ],
    ],
  },
  maison: {
    label: "THE ATELIER NOTES / A MORE PERSONAL KIND OF LUXURY",
    title: "The most valuable detail is the one that matters to you.",
    image: PHOTO.pool,
    copy: "A meaningful private journey begins with particular preferences, not a long list of luxury labels.",
    notes: [
      [
        "A sense of place",
        "Tell us whether you imagine a celebrated hotel, a small lodge or a quiet villa. Your consultant can discuss specific options and what each actually offers.",
      ],
      [
        "The space between",
        "A rail journey, a long lunch or a day with no plans may be the moment that makes the trip. Leave time for the things you value.",
      ],
      [
        "The personal details",
        "Room configuration, dietary preferences, access needs and special occasions deserve a private conversation. Share only what you want your consultant to consider.",
      ],
    ],
  },
  offscript: {
    label: "THE DETOUR GUIDE / LESS GUESSWORK, MORE GOING",
    title: "Leave room for the unexpected. Plan the bits that get you there.",
    image: PHOTO.friends,
    copy: "A route becomes more useful when the group agrees on nights, priorities and the budget you actually want to work with.",
    notes: [
      [
        "More places isn’t always more trip",
        "Every connection takes time. Use the route builder to give your favourites enough nights; your agent can help check a practical order.",
      ],
      [
        "Make the budget a conversation",
        "Say whether your target should include flights, stays, transport or activities. A clear brief helps your agent explain the options and trade-offs.",
      ],
      [
        "Find your kind of company",
        "Independent travel, a social group tour and a private group feel different. Tell your agent the pace and type of company you’re looking for.",
      ],
    ],
  },
  meridian: {
    label: "NOTES FROM THE TRAVEL JOURNAL / THE PLEASURE OF CHOOSING WELL",
    title: "A good holiday begins with the way you want to feel.",
    image: PHOTO.alpine,
    copy: "Use a few considered questions to turn a broad destination list into a journey that feels right for you.",
    notes: [
      [
        "Choose a pace",
        "Think about how often you want to move, how active you like your days and the time you want simply to enjoy your surroundings.",
      ],
      [
        "Give your dates some context",
        "Share fixed commitments, flexible weeks and the time you can spend away. Your consultant can advise on destination conditions and current options.",
      ],
      [
        "Know what you are comparing",
        "A starting idea is not a quote. Compare confirmed inclusions, room details, transport arrangements and the written conditions before deciding.",
      ],
    ],
  },
};
export function SignatureChapter({ c }: { c: Concept }) {
  const chapter = CHAPTERS[c.id];
  if (!chapter) return null;
  return (
    <section className={`f-chapter f-chapter-${c.id}`} aria-labelledby="chapter-title">
      <div className="f-chapter-photo">
        <img src={chapter.image} alt="Illustrative travel photography" loading="lazy" />
        <span>
          {c.name}
          <i>THE PERSONAL EDIT</i>
        </span>
      </div>
      <div>
        <p className="x-eyebrow">{chapter.label}</p>
        <h2 id="chapter-title">{chapter.title}</h2>
        <p>{chapter.copy}</p>
        <div className="f-field-notes">
          {chapter.notes.map(([title, copy], i) => (
            <details key={title} open={i === 0}>
              <summary>
                <span>0{i + 1}</span>
                {title}
                <Plus size={14} />
              </summary>
              <p>{copy}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HumanHandoff() {
  return (
    <section className="f-handoff" aria-labelledby="handoff-title">
      <div>
        <p className="x-eyebrow">A REAL CONVERSATION, BEFORE YOU COMMIT</p>
        <h2 id="handoff-title">
          Good ideas deserve
          <br />
          <em>thoughtful advice.</em>
        </h2>
        <p>
          This preview’s enquiries go to the Sun-Set Travel demo agency through TribeTravel. Talk
          through your plans, ask questions, and review a personal written quote before deciding.
        </p>
        <div className="f-contact-links">
          <a href={`tel:${contact.phoneE164}`}>
            <Phone size={15} />
            {contact.phoneDisplay}
          </a>
          <a href={`mailto:${contact.email}`}>
            <Mail size={15} />
            {contact.email}
          </a>
        </div>
      </div>
      <ol>
        <li>
          <span>01</span>
          <div>
            <h3>Your brief</h3>
            <p>Places, dates, travellers and the details that matter to you.</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>The agent’s check</h3>
            <p>Specific supplier options, availability, inclusions and arrangements.</p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>Your decision</h3>
            <p>A written quote and the relevant booking and cancellation conditions to review.</p>
          </div>
        </li>
      </ol>
    </section>
  );
}
