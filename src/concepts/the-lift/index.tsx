// The Lift: the traveller stands in a grand old hotel lift. Each floor is a trip. Keep the floors you like (brass keys
// on a ring), then ride to the Rooftop, where the concierge totals your keys and the registration card asks for a price.
// Only one floor's world is mounted at a time, so there is never more than one clip playing.
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent,
  type WheelEvent,
} from "react";
import {
  BRAND,
  Clip,
  QuoteForm,
  TRIPS,
  bestTrip,
  contact,
  rand,
  useReducedMotion,
  type ConceptTrip,
  type Mood,
} from "@/concepts/kit";
import {
  ArtDefs,
  Cameo,
  Chandelier,
  Dial,
  DoorLeaf,
  FLOOR_LABELS,
  Festoon,
  Key,
  Operator,
  Skyline,
} from "./art";
import * as line from "./lines";
import * as sound from "./sound";

export const FONTS =
  "family=Limelight&family=Poiret+One&family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500;1,700";

const LOBBY = 0;
const ROOF = 7;
const NAMES = [
  "Lobby",
  "Mauritius",
  "Zanzibar",
  "Vic Falls",
  "Kruger",
  "Cape Town",
  "Santorini",
  "Rooftop",
];
const tripAt = (floor: number): ConceptTrip | null => TRIPS[floor - 1] ?? null;
/** The trip on a floor already known to hold one. */
const tripOf = (floor: number) => TRIPS[floor - 1] as ConceptTrip;
const nameAt = (floor: number) => NAMES[floor] ?? "";
const labelAt = (floor: number) => FLOOR_LABELS[floor] ?? "";
const fullName = (floor: number) => tripAt(floor)?.name ?? nameAt(floor);
/** R floor down to the lobby, the way a lift panel reads. */
const PANEL_ORDER = [ROOF, 6, 5, 4, 3, 2, 1, LOBBY];
/** The Mauritius clip is generic tropical footage, so the line over it names no landmark. */
const taglineOf = (t: ConceptTrip) =>
  t.slug === "mauritius" ? "Lagoons and long lunches." : t.tagline;

type Phase = "closed" | "opening" | "open" | "closing" | "riding";
type Line = { id: number; text: string };

const TIMES = {
  normal: { close: 1850, open: 1400, ride: (n: number) => 1250 + 280 * n },
  calm: { close: 250, open: 250, ride: () => 450 },
};

function Words({ text, className }: { text: string; className: string }) {
  return (
    <span className={className} aria-hidden="true">
      {text.split(" ").map((w, i) => (
        <span key={`${w}${i}`} className="tl-word-o">
          <span className="tl-word" style={{ "--i": i } as CSSProperties}>
            {w}
          </span>{" "}
        </span>
      ))}
    </span>
  );
}

/** The operator's words, on a slip of hotel notepaper. Screen readers hear them from the one live region on the page. */
function Slip({ said }: { said: Line }) {
  return (
    <p key={said.id} className="tl-slip" aria-hidden="true">
      {said.text.split(" ").map((w, i) => (
        <span key={`${w}${i}`} className="tl-sw" style={{ "--i": i } as CSSProperties}>
          {w}{" "}
        </span>
      ))}
    </p>
  );
}

function OpLine({ said, talkKey, tipKey }: { said: Line; talkKey: number; tipKey: number }) {
  return (
    <div className="tl-opline">
      <Cameo talkKey={talkKey} tipKey={tipKey} />
      <Slip said={said} />
    </div>
  );
}

type WorldProps = {
  phase: Phase;
  said: Line;
  talkKey: number;
  tipKey: number;
  keys: number[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  headRef: React.RefObject<HTMLHeadingElement | null>;
};

/** Sample price with its small print, wherever a price appears. */
function Price({ trip }: { trip: ConceptTrip }) {
  return (
    <p className="tl-price">
      {trip.nights} nights from <b>{rand(trip.price)}</b>{" "}
      <small>sample price, per person sharing</small>
    </p>
  );
}

function TripWorld({
  floor,
  trip,
  onKeep,
  onRoom,
  ...w
}: WorldProps & {
  floor: number;
  trip: ConceptTrip;
  onKeep: () => void;
  onRoom: (count: number, title: string) => void;
}) {
  const [room, setRoom] = useState<number | null>(null);
  const [seen, setSeen] = useState<number[]>([]);
  const kept = w.keys.includes(floor);
  const open = (i: number) => {
    sound.click();
    setRoom((r) => (r === i ? null : i));
    if (room !== i) onRoom(seen.length, trip.days[i]?.[0] ?? "");
    setSeen((s) => (s.includes(i) ? s : [...s, i]));
  };
  return (
    <section
      className="tl-w tl-trip"
      data-slug={trip.slug}
      aria-label={`Floor ${floor}: ${trip.name}`}
    >
      <Clip
        src={trip.video}
        poster={trip.poster}
        className="tl-foot"
        paused={w.phase === "riding" || w.phase === "closed"}
      />
      <div className="tl-scrim" />
      <div className="tl-scroll" ref={w.scrollRef}>
        <div className="tl-trip-in">
          <div className="tl-up">
            <div className="tl-plaque">
              <span className="tl-plaque-n">Floor {floor}</span>
              <h2 ref={w.headRef} tabIndex={-1}>
                {trip.name}
              </h2>
              <p className="tl-plaque-s">
                {trip.region} · {trip.flight}
              </p>
              <Price trip={trip} />
            </div>
            <OpLine said={w.said} talkKey={w.talkKey} tipKey={w.tipKey} />
          </div>
          <p className="tl-kin" aria-label={taglineOf(trip)}>
            <Words text={taglineOf(trip)} className="tl-kin-in" />
          </p>
          <div className="tl-corr">
            <div
              className="tl-rooms"
              role="group"
              aria-label="Rooms on this floor, one for each part of the trip"
            >
              {trip.days.map(([title], i) => {
                const no = floor * 100 + i + 1;
                return (
                  <button
                    key={no}
                    type="button"
                    className="tl-room"
                    data-state={room === i ? "open" : seen.includes(i) ? "ajar" : "shut"}
                    aria-expanded={room === i}
                    aria-label={`Room ${no}: ${title}`}
                    onClick={() => open(i)}
                  >
                    <span className="tl-room-in">
                      {seen.includes(i) && <img src={trip.photos[i % 3]} alt="" loading="lazy" />}
                    </span>
                    <span className="tl-room-door">
                      <span className="tl-room-no">{no}</span>
                      <span className="tl-room-knob" />
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="tl-note" role="status">
              {room === null ? (
                <div key="intro" className="tl-note-in">
                  <h3>A note from the floor manager</h3>
                  <p>
                    {trip.intro}{" "}
                    <em>
                      Try a door: {trip.days.length} rooms, {trip.nights} nights.
                    </em>
                  </p>
                </div>
              ) : (
                <div key={room} className="tl-note-in">
                  <h3>
                    Room {floor * 100 + room + 1}: {trip.days[room]?.[0]}
                  </h3>
                  <p>{trip.days[room]?.[1]}</p>
                </div>
              )}
            </div>
            <button
              type="button"
              className={`tl-keep${kept ? " kept" : ""}`}
              aria-pressed={kept}
              onClick={onKeep}
            >
              {kept ? "Hand the key back" : "Keep this floor"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function LobbyWorld({ go, ...w }: WorldProps & { go: (floor: number) => void }) {
  return (
    <section className="tl-w tl-lobby" aria-label="The lobby">
      <div className="tl-lobby-burst" />
      <div className="tl-lobby-floor" />
      <Chandelier />
      <div className="tl-scroll" ref={w.scrollRef}>
        <div className="tl-lobby-in">
          <div className="tl-lobby-a">
            <p className="tl-lobby-sign">{BRAND.name}</p>
            <h2
              ref={w.headRef}
              tabIndex={-1}
              className="tl-kin"
              aria-label="Every floor, a different holiday."
            >
              <Words text="Every floor, a different holiday." className="tl-kin-in" />
            </h2>
            <OpLine said={w.said} talkKey={w.talkKey} tipKey={w.tipKey} />
          </div>
          <div className="tl-lobby-b">
            <nav className="tl-board" aria-label="Directory of floors">
              <h3>Directory</h3>
              <ul>
                <li>
                  <button type="button" onClick={() => go(ROOF)}>
                    <span className="tl-b-n">R</span>
                    <span className="tl-b-t">Rooftop bar &amp; concierge</span>
                    <span className="tl-b-p">
                      {w.keys.length} {w.keys.length === 1 ? "key" : "keys"}
                    </span>
                  </button>
                </li>
                {TRIPS.map((t, i) => ({ t, floor: i + 1 }))
                  .reverse()
                  .map(({ t, floor }) => (
                    <li key={t.slug}>
                      <button type="button" onClick={() => go(floor)}>
                        <span className="tl-b-n">{floor}</span>
                        <span className="tl-b-t">{t.name}</span>
                        <span className="tl-b-p">
                          {t.nights} nts · {rand(t.price)}
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
              <p className="tl-board-s">Sample prices, per person sharing.</p>
            </nav>
            <div className="tl-desk">
              <h3>Front desk</h3>
              <p>People, not a chatbot. Ask us anything, even about the wallpaper.</p>
              <a href={`tel:${contact.phoneE164}`}>{contact.phoneDisplay}</a>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
              <a href={contact.whatsapp} target="_blank" rel="noreferrer">
                WhatsApp the desk
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoofWorld({
  visited,
  onKeep,
  ...w
}: WorldProps & { visited: number[]; onKeep: (floor: number) => void }) {
  const kept = useMemo(() => w.keys.map(tripOf), [w.keys]);
  // With no keys, the house suggests whatever best fits the floors they stopped at.
  const suggestion = useMemo(() => {
    const weights: Partial<Record<Mood, number>> = {};
    for (const f of visited) {
      const t = tripAt(f);
      if (!t) continue;
      for (const [m, v] of Object.entries(t.moods))
        weights[m as Mood] = (weights[m as Mood] ?? 0) + v;
    }
    return visited.some((f) => tripAt(f)) ? bestTrip(weights) : tripOf(5);
  }, [visited]);
  const [picked, setPicked] = useState<number | null>(null);
  const lastKept = w.keys[w.keys.length - 1];
  const deskFloor = picked ?? lastKept ?? TRIPS.indexOf(suggestion) + 1;
  const trip = tripOf(deskFloor);
  const isKept = w.keys.includes(deskFloor);
  const nights = kept.reduce((n, t) => n + t.nights, 0);
  const total = kept.reduce((n, t) => n + t.price, 0);
  const names = kept.map((t) => t.name);
  const roomList = names.length ? names.join(", ") : `${trip.name} (the house's suggestion)`;
  const summary = names.length
    ? `${names.join(" + ")}, ${nights} nights`
    : `${trip.name}, ${trip.nights} nights`;
  return (
    <section className="tl-w tl-roof" aria-label="The rooftop">
      <div className="tl-dusk" />
      <div className="tl-sun" />
      <Skyline />
      <Festoon />
      <div className="tl-scroll" ref={w.scrollRef}>
        <div className="tl-roof-in">
          <div className="tl-roof-head">
            <p className="tl-neon">Rooftop Bar</p>
            <h2 ref={w.headRef} tabIndex={-1} className="tl-kin" aria-label="Last stop. Best view.">
              <Words text="Last stop. Best view." className="tl-kin-in" />
            </h2>
            <OpLine said={w.said} talkKey={w.talkKey} tipKey={w.tipKey} />
          </div>
          <div className="tl-cdesk">
            <h3 className="tl-cdesk-h">
              The concierge's desk{" "}
              <small>
                {kept.length
                  ? `Your file: ${line.suiteFor(kept)}`
                  : "Your file: undecided, but promising"}
              </small>
            </h3>
            <div
              className="tl-holes"
              role="group"
              aria-label="Key board. Choose a floor to look at it"
            >
              {TRIPS.map((t, i) => {
                const fl = i + 1;
                const has = w.keys.includes(fl);
                return (
                  <button
                    key={t.slug}
                    type="button"
                    className={`tl-hole${deskFloor === fl ? " sel" : ""}`}
                    aria-pressed={deskFloor === fl}
                    aria-label={`${t.name}${has ? ", key kept" : ""}`}
                    onClick={() => {
                      sound.click();
                      setPicked(fl);
                    }}
                  >
                    <span className="tl-hole-n">{fl}</span>
                    {has && <Key label={String(fl)} />}
                  </button>
                );
              })}
            </div>
            <div className="tl-view">
              <div className="tl-arch">
                <Clip
                  src={trip.video}
                  poster={trip.poster}
                  className="tl-arch-v"
                  paused={w.phase === "riding" || w.phase === "closed"}
                />
              </div>
              <div className="tl-view-t" key={trip.slug}>
                <span className="tl-view-s">
                  {isKept ? "Your key" : w.keys.length ? "On the board" : "The house suggests"}
                </span>
                <h3>{trip.name}</h3>
                <Price trip={trip} />
                <ol>
                  {trip.days.map(([t, d], i) => (
                    <li key={t}>
                      <b>
                        {deskFloor * 100 + i + 1} {t}.
                      </b>{" "}
                      {d}
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  className={`tl-keep${isKept ? " kept" : ""}`}
                  aria-pressed={isKept}
                  onClick={() => onKeep(deskFloor)}
                >
                  {isKept ? "Hand the key back" : "Take this key"}
                </button>
              </div>
            </div>
            <div className="tl-ledger" aria-live="polite">
              <span>
                <b>{kept.length}</b> {kept.length === 1 ? "key" : "keys"}
              </span>
              <span>
                <b>{nights}</b> {nights === 1 ? "night" : "nights"}
              </span>
              <span>
                <b>{rand(total)}</b> <small>sample total, per person sharing</small>
              </span>
            </div>
          </div>
          <div className="tl-card">
            <div className="tl-card-head">
              <span>{BRAND.name}</span>
              <h3>Registration card</h3>
            </div>
            <QuoteForm
              summary={summary}
              button="Ring for my price"
              classes={{
                form: "tl-form",
                field: "tl-field",
                label: "tl-lab",
                input: "tl-in",
                button: "tl-submit",
                done: "tl-done",
                note: "tl-done-n",
              }}
            >
              <dl className="tl-reg">
                <div>
                  <dt>Filed under</dt>
                  <dd>{kept.length ? line.suiteFor(kept) : "Undecided, but promising"}</dd>
                </div>
                <div>
                  <dt>Rooms</dt>
                  <dd>{roomList}</dd>
                </div>
                {kept.length > 0 && (
                  <div>
                    <dt>Nights</dt>
                    <dd>{nights}</dd>
                  </div>
                )}
              </dl>
              <div className="tl-two">
                <label className="tl-field">
                  <span className="tl-lab">Guests</span>
                  <select name="guests" className="tl-in" defaultValue="2">
                    {["1", "2", "3", "4", "5", "6 or more"].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label className="tl-field">
                  <span className="tl-lab">Arriving around</span>
                  <input name="when" className="tl-in" placeholder="December, flexible" />
                </label>
              </div>
            </QuoteForm>
            <p className="tl-card-s">
              Prices here are samples, per person sharing. Or skip the paperwork:{" "}
              <a href={`tel:${contact.phoneE164}`}>{contact.phoneDisplay}</a> ·{" "}
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Concept() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");
  const [at, setAt] = useState(LOBBY); // where the needle is headed
  const [shown, setShown] = useState(LOBBY); // the world mounted behind the doors
  const [passing, setPassing] = useState<number | null>(null);
  const [dir, setDir] = useState<"up" | "down">("up");
  const [rideMs, setRideMs] = useState(1800);
  const [keys, setKeys] = useState<number[]>([]);
  const [fresh, setFresh] = useState<number | null>(null);
  const [visited, setVisited] = useState<number[]>([]);
  const [said, setSaid] = useState<Line>({ id: 0, text: line.OPENING });
  const [tipKey, setTipKey] = useState(0);
  const [bell, setBell] = useState(true);
  const [touched, setTouched] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const apRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const live = useRef({
    phase: "closed" as Phase,
    at: LOBBY,
    keys: [] as number[],
    bell: true,
    reduced: false,
  });
  const timers = useRef<number[]>([]);
  const stopRumble = useRef<(() => void) | null>(null);
  const wheel = useRef({ acc: 0, locked: false, idle: 0 });
  const touch = useRef<{ x: number; y: number; ok: boolean } | null>(null);

  useEffect(() => {
    live.current.reduced = reduced;
  }, [reduced]);

  const say = useCallback((text: string) => setSaid((s) => ({ id: s.id + 1, text })), []);
  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const toPhase = useCallback((p: Phase) => {
    live.current.phase = p;
    setPhase(p);
  }, []);
  const noise = useCallback((fn: () => void) => {
    if (live.current.bell) fn();
  }, []);

  useEffect(() => {
    const t = timers;
    return () => {
      t.current.forEach(clearTimeout);
      stopRumble.current?.();
    };
  }, []);

  // How far the whole car must move and grow so that the door opening fills the page: the step out of the lift.
  useEffect(() => {
    const measure = () => {
      const r = rootRef.current;
      const a = apRef.current;
      if (!r || !a) return;
      const s = Math.max(r.clientWidth / a.offsetWidth, r.clientHeight / a.offsetHeight) * 1.05;
      r.style.setProperty("--ds", s.toFixed(4));
      r.style.setProperty(
        "--dx",
        `${(r.clientWidth / 2 - s * (a.offsetLeft + a.offsetWidth / 2)).toFixed(1)}px`,
      );
      r.style.setProperty(
        "--dy",
        `${(r.clientHeight / 2 - s * (a.offsetTop + a.offsetHeight / 2)).toFixed(1)}px`,
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // A nudge for anyone who just stands there.
  useEffect(() => {
    if (touched) return;
    const t = window.setTimeout(() => say(line.IDLE), 9000);
    return () => clearTimeout(t);
  }, [touched, say]);

  // Keyboard users arrive on the floor's heading when they step out.
  useEffect(() => {
    if (phase === "open") headRef.current?.focus({ preventScroll: true });
  }, [phase, shown]);

  const arrivalLine = useCallback((floor: number) => {
    if (floor === LOBBY) return line.LOBBY;
    if (floor === ROOF) return line.roofLine(live.current.keys.length);
    return line.ARRIVE[tripOf(floor).slug] ?? "";
  }, []);

  const openDoors = useCallback(
    (floor: number) => {
      const t = live.current.reduced ? TIMES.calm : TIMES.normal;
      noise(sound.ding);
      say(arrivalLine(floor));
      setVisited((v) => (v.includes(floor) ? v : [...v, floor]));
      toPhase("opening");
      after(t.open, () => toPhase("open"));
    },
    [after, arrivalLine, noise, say, toPhase],
  );

  const go = useCallback(
    (target: number) => {
      const { phase: p, at: from, reduced: calm } = live.current;
      setTouched(true);
      noise(sound.click);
      if (p === "riding" || p === "closing") {
        say(line.PATIENCE);
        return;
      }
      if (target === from) {
        if (p === "closed") openDoors(target);
        else say(line.ALREADY);
        return;
      }
      timers.current.forEach(clearTimeout);
      timers.current = [];
      const t = calm ? TIMES.calm : TIMES.normal;
      const startRide = () => {
        const n = Math.abs(target - from);
        const ride = t.ride(n);
        noise(sound.thud);
        setShown(target);
        setDir(target > from ? "up" : "down");
        setRideMs(ride);
        live.current.at = target;
        setAt(target);
        toPhase("riding");
        say(line.ridingLine(from, target, nameAt(target)));
        if (live.current.bell) stopRumble.current = sound.rumble(ride / 1000);
        const step = target > from ? 1 : -1;
        for (let k = 0; k <= n; k++) {
          after(ride * (0.1 + (0.8 * k) / Math.max(n, 1)), () => setPassing(from + step * k));
        }
        after(ride, () => {
          stopRumble.current?.();
          stopRumble.current = null;
          setPassing(null);
          openDoors(target);
        });
      };
      if (p === "open" || p === "opening") {
        toPhase("closing");
        after(t.close, startRide);
      } else {
        startRide();
      }
    },
    [after, noise, openDoors, say, toPhase],
  );

  const toggleKey = useCallback(
    (floor: number) => {
      const has = live.current.keys.includes(floor);
      const next = has
        ? live.current.keys.filter((k) => k !== floor)
        : [...live.current.keys, floor];
      live.current.keys = next;
      setKeys(next);
      noise(sound.click);
      if (has) {
        setFresh(null);
        say(line.HANDED_BACK);
      } else {
        setFresh(floor);
        setTipKey((k) => k + 1);
        after(620, () => noise(sound.thud));
        say(line.keptLine(next, tripOf(floor)));
      }
    },
    [after, noise, say],
  );

  /** A step up or down the building, from a wheel, an arrow key or a swipe. */
  const nudge = useCallback(
    (step: 1 | -1) => {
      const { phase: p, at: here } = live.current;
      if (p !== "open" && p !== "closed") return;
      const target = here + step;
      if (target > ROOF) say(line.TOP_OF_HOUSE);
      else if (target < LOBBY) say(line.BOTTOM_OF_HOUSE);
      else go(target);
    },
    [go, say],
  );

  /** True when the floor's own content still has room to scroll that way, which comes before riding. */
  const canScroll = useCallback((down: boolean) => {
    const el = scrollRef.current;
    if (!el || live.current.phase !== "open") return false;
    return down ? el.scrollTop + el.clientHeight < el.scrollHeight - 3 : el.scrollTop > 3;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
      const up = e.key === "ArrowUp" || e.key === "PageUp";
      const down = e.key === "ArrowDown" || e.key === "PageDown";
      if (!up && !down) return;
      if (canScroll(down)) return; // the browser scrolls the floor
      e.preventDefault();
      nudge(up ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canScroll, nudge]);

  // Scrolling is a page gesture, not a compass: wheel down means "on to the next floor", so it carries you upward
  // from the lobby towards the Rooftop, the way scrolling carries you on through any other page.
  const onWheel = (e: WheelEvent) => {
    const w = wheel.current;
    window.clearTimeout(w.idle);
    w.idle = window.setTimeout(() => {
      w.acc = 0;
      w.locked = false;
    }, 260);
    if (w.locked || canScroll(e.deltaY > 0)) return;
    w.acc += e.deltaY;
    if (Math.abs(w.acc) > 50) {
      w.locked = true;
      nudge(w.acc > 0 ? 1 : -1);
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    const el = e.target as HTMLElement;
    if (e.touches.length !== 1 || /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) {
      touch.current = null;
      return;
    }
    const p = e.touches[0];
    if (!p) return;
    touch.current = { x: p.clientX, y: p.clientY, ok: true };
    const s = scrollRef.current;
    if (s && live.current.phase === "open" && s.scrollHeight > s.clientHeight + 3)
      touch.current.ok =
        !s.contains(el) || s.scrollTop <= 3 || s.scrollTop + s.clientHeight >= s.scrollHeight - 3;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const t = touch.current;
    touch.current = null;
    const p = e.changedTouches[0];
    if (!t || !t.ok || !p) return;
    const dy = t.y - p.clientY;
    const dx = t.x - p.clientX;
    if (Math.abs(dy) < 70 || Math.abs(dy) < Math.abs(dx) * 1.5 || canScroll(dy > 0)) return;
    nudge(dy > 0 ? 1 : -1);
  };

  const toggleBell = () => {
    live.current.bell = !bell;
    setBell(!bell);
    if (!bell) sound.ding();
  };

  const world: WorldProps = { phase, said, talkKey: said.id, tipKey, keys, scrollRef, headRef };
  const trip = tripAt(shown);
  const here = passing ?? at;
  const stepped = phase === "open";

  return (
    <div
      ref={rootRef}
      className="c-the-lift"
      data-phase={phase}
      data-dir={dir}
      style={{ "--ride": `${rideMs}ms` } as CSSProperties}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <ArtDefs />
      <p className="tl-sr" aria-live="polite">
        {said.text}
      </p>

      <div className="tl-world" inert={!stepped}>
        {trip ? (
          <TripWorld
            key={shown}
            floor={shown}
            trip={trip}
            onKeep={() => toggleKey(shown)}
            onRoom={(n, title) => say(line.roomLine(n, title))}
            {...world}
          />
        ) : shown === ROOF ? (
          <RoofWorld key="roof" visited={visited} onKeep={toggleKey} {...world} />
        ) : (
          <LobbyWorld key="lobby" go={go} {...world} />
        )}
      </div>

      <nav className="tl-strip" aria-label="Back in the lift" inert={!stepped}>
        <span className="tl-strip-brand">{BRAND.name}</span>
        <div className="tl-strip-b">
          {[LOBBY, 1, 2, 3, 4, 5, 6, ROOF].map((fl) => (
            <button
              key={fl}
              type="button"
              title={fullName(fl)}
              aria-label={`Ride to ${fl === LOBBY || fl === ROOF ? "the " : "floor " + fl + ", "}${fullName(fl)}`}
              aria-current={fl === at ? "true" : undefined}
              data-kept={keys.includes(fl) || undefined}
              onClick={() => go(fl)}
            >
              {labelAt(fl)}
            </button>
          ))}
        </div>
      </nav>

      <div className="tl-car" inert={stepped}>
        <div className="tl-rock">
          <div className="tl-p-top">
            <div className="tl-brand">
              <h1>{BRAND.name}</h1>
              <span>Holidays by the floor</span>
            </div>
            <div className="tl-dialwrap">
              <span className={`tl-arrow up${phase === "riding" && dir === "up" ? " on" : ""}`} />
              <Dial at={at} passing={passing} />
              <span
                className={`tl-arrow down${phase === "riding" && dir === "down" ? " on" : ""}`}
              />
              <p className="tl-flap" aria-hidden="true">
                <span key={here}>
                  {phase === "riding" ? "Passing " : ""}
                  {here === LOBBY || here === ROOF ? "" : `${labelAt(here)} · `}
                  {nameAt(here)}
                </span>
              </p>
            </div>
          </div>
          <div className="tl-p-left" />
          <div className="tl-ap" ref={apRef}>
            <div className="tl-leaf l">
              <DoorLeaf side="left" />
            </div>
            <div className="tl-leaf r">
              <DoorLeaf side="right" />
            </div>
            <div className="tl-slit">
              <i />
            </div>
          </div>
          <div className="tl-ap-frame" />
          <div className="tl-p-right" />
          <div className="tl-p-bot" />
          <div className="tl-opstand">
            <Slip said={said} />
            <Operator talkKey={said.id} tipKey={tipKey} />
          </div>
          <div className="tl-panel">
            <p className="tl-panel-h">
              Press a floor. Keep the ones you like, then take your keys up to the Rooftop.
            </p>
            <div className="tl-btns">
              {PANEL_ORDER.map((fl) => (
                <button
                  key={fl}
                  type="button"
                  className="tl-btn"
                  data-lit={fl === at || undefined}
                  data-hint={(!touched && fl === 3) || undefined}
                  aria-label={`${fl === LOBBY || fl === ROOF ? "" : `Floor ${fl}, `}${fullName(fl)}${tripAt(fl) ? `, ${tripAt(fl)?.nights} nights` : ""}`}
                  aria-current={fl === at ? "true" : undefined}
                  onClick={() => go(fl)}
                >
                  <span className="tl-ball">
                    {labelAt(fl)}
                    {keys.includes(fl) && <i />}
                  </span>
                  <span className="tl-btn-l">{nameAt(fl)}</span>
                </button>
              ))}
            </div>
            <div className="tl-plate">
              <a href={`tel:${contact.phoneE164}`}>
                <small>In an emergency, or a holiday</small>
                {contact.phoneDisplay}
              </a>
              <button
                type="button"
                className="tl-bell"
                aria-pressed={bell}
                aria-label={bell ? "Turn the lift's sounds off" : "Turn the lift's sounds on"}
                onClick={toggleBell}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 3a6 6 0 0 0-6 6v4l-2 4h16l-2-4V9a6 6 0 0 0-6-6zM9.6 19a2.5 2.5 0 0 0 4.8 0z"
                    fill="currentColor"
                  />
                  {!bell && <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" />}
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="tl-sweep">
          <i />
          <i />
        </div>
      </div>

      <button
        type="button"
        className={`tl-ring${shown === ROOF && phase !== "riding" ? " gone" : ""}`}
        aria-label={`Your key ring: ${keys.length} ${keys.length === 1 ? "key" : "keys"}. Ride to the Rooftop`}
        onClick={() => go(ROOF)}
      >
        <svg className="tl-hoop" viewBox="0 0 60 44" aria-hidden="true">
          <path d="M30 0V8" stroke="url(#tl-brass-v)" strokeWidth="3" />
          <ellipse
            cx="30"
            cy="24"
            rx="23"
            ry="15"
            fill="none"
            stroke="url(#tl-brass)"
            strokeWidth="3.5"
          />
        </svg>
        <span className="tl-keys">
          {keys.map((k, i) => (
            <span
              key={k}
              className={`tl-k${fresh === k ? " fresh" : ""}`}
              style={
                {
                  "--r": `${(i - (keys.length - 1) / 2) * 22}deg`,
                  "--o": `${(i - (keys.length - 1) / 2) * 9}px`,
                } as CSSProperties
              }
            >
              <span className="tl-k-swing">
                <Key label={String(k)} />
              </span>
            </span>
          ))}
        </span>
      </button>
    </div>
  );
}
