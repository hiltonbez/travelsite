// The Holiday Bar: pour holiday moods into a tall glass, shake it, and the barman names the drink and slides the trip
// down the bar. The liquid itself lives in sim.ts; this file is the bar around it.
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import {
  BRAND,
  Clip,
  QuoteForm,
  TRIPS,
  contact,
  rand,
  useReducedMotion,
  type ConceptTrip,
} from "@/concepts/kit";
import { Barman, BottleArt, Garnish, Mark } from "./art";
import {
  INGREDIENTS,
  SIGNATURES,
  ingredient,
  leadingTrip,
  nameCocktail,
  ranked,
  rgbCss,
  tripBySlug,
  whyLine,
  type Ingredient,
  type IngredientId,
  type Signature,
  type Vols,
} from "./data";
import { BarSim, type Geometry } from "./sim";
import { BarSound } from "./sound";

export const FONTS =
  "family=Yeseva+One&family=Yellowtail&family=Spectral:ital,wght@0,400;0,600;1,400&family=Courier+Prime:wght@400;700";

type Phase = "pouring" | "shaking" | "served";
type Result = {
  key: number;
  trip: ConceptTrip;
  name: string;
  why: string;
  vols: Vols;
  total: number;
  house: boolean;
};

const WELCOME =
  "Evening. Press and hold a bottle to pour. The longer you hold, the stronger it gets.";
const SHELVES: IngredientId[][] = [
  ["sun", "sea", "wildlife", "oldtowns"],
  ["luxury", "adrenaline", "romance", "food"],
];
const tel = `tel:${contact.phoneE164}`;

/** The footage behind the liquid. Hidden: the canvas draws its frames into the glass. */
const GlassFootage = memo(function GlassFootage({
  trip,
  videoRef,
  paused,
}: {
  trip: ConceptTrip;
  videoRef: RefObject<HTMLVideoElement | null>;
  paused: boolean;
}) {
  return (
    <Clip
      src={trip.video}
      poster={trip.poster}
      videoRef={videoRef}
      paused={paused}
      className="hb-hidden-video"
    />
  );
});

function pct(v: number, total: number) {
  return total > 0 ? Math.round((v / total) * 100) : 0;
}

function MiniGlass({ recipe }: { recipe: Vols }) {
  const r = ranked(recipe);
  const total = r.reduce((s, [, v]) => s + v, 0);
  return (
    <span className="hb-mini" aria-hidden="true">
      {r.map(([id, v]) => (
        <span key={id} style={{ flexGrow: v / total, background: rgbCss(ingredient(id).rgb) }} />
      ))}
    </span>
  );
}

function MenuCard({
  result,
  onBill,
  billOpen,
  onAgain,
  reduced,
}: {
  result: Result;
  onBill: () => void;
  billOpen: boolean;
  onAgain: () => void;
  reduced: boolean;
}) {
  const { trip, name, why, vols, total } = result;
  const recipe = ranked(vols);
  return (
    <article className="hb-card" aria-label={`Menu card for ${name}`}>
      <div className="hb-card-film">
        <Clip src={trip.video} poster={trip.poster} className="hb-card-video" paused={reduced} />
        <span className="hb-card-stamp">{trip.region}</span>
      </div>
      <div className="hb-card-body">
        <p className="hb-card-kicker">
          {result.house ? "From the cocktail list" : "Tonight's pour, made by you"}
        </p>
        <h2 className="hb-card-name">{name}</h2>
        <p className="hb-card-trip">
          {trip.name}. {trip.nights} nights. {trip.flight}.
        </p>
        <ul className="hb-card-recipe">
          {recipe.map(([id, v]) => (
            <li key={id}>
              <i style={{ background: rgbCss(ingredient(id).rgb) }} />
              {pct(v, total)}% {ingredient(id).label}
            </li>
          ))}
        </ul>
        <p className="hb-card-why">{why}</p>
        <h3 className="hb-card-h">Tasting notes</h3>
        <ol className="hb-notes">
          {trip.days.map(([title, text]) => (
            <li key={title}>
              <b>{title}</b>
              <span>{text}</span>
            </li>
          ))}
        </ol>
        <div className="hb-card-foot">
          <p className="hb-price">
            <b>{rand(trip.price)}</b>
            <span>sample price, per person sharing</span>
          </p>
          <div className="hb-card-actions">
            <button
              type="button"
              className="hb-btn hb-btn-neon"
              onClick={onBill}
              aria-expanded={billOpen}
            >
              Ask for the bill
            </button>
            <button type="button" className="hb-btn hb-btn-ink" onClick={onAgain}>
              Pour another
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function BarTab({ result }: { result: Result }) {
  const { trip, name } = result;
  const [glasses, setGlasses] = useState(2);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLSelectElement>("select")?.focus({ preventScroll: true });
    ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);
  return (
    <div className="hb-tab" ref={ref}>
      <div className="hb-tab-paper">
        <p className="hb-tab-head">{BRAND.name}</p>
        <p className="hb-tab-sub">The Holiday Bar: your tab</p>
        <div className="hb-tab-lines">
          <p>
            <span>
              {glasses} x {name}
            </span>
          </p>
          <p>
            <span>
              {trip.name}, {trip.nights} nights
            </span>
            <span>{rand(trip.price)} ea</span>
          </p>
          <p className="hb-tab-total">
            <span>Sample total</span>
            <span>{rand(trip.price * glasses)}</span>
          </p>
          <p className="hb-tab-small">
            Sample prices, per person sharing. The real bill comes from {BRAND.name}, with
            today&apos;s rates.
          </p>
        </div>
        <QuoteForm
          summary={`${name}: ${trip.name}, ${trip.nights} nights, for ${glasses}`}
          button="Send me the bill"
          classes={{
            form: "hb-tab-form",
            field: "hb-tab-field",
            label: "hb-tab-label",
            input: "hb-tab-input",
            button: "hb-btn hb-btn-tab",
            done: "hb-tab-done",
            note: "hb-tab-note",
          }}
        >
          <label className="hb-tab-field">
            <span className="hb-tab-label">Glasses (that&apos;s travellers)</span>
            <select
              className="hb-tab-input"
              value={glasses}
              onChange={(e) => setGlasses(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="hb-tab-field">
            <span className="hb-tab-label">When are you thirsty? (month)</span>
            <input className="hb-tab-input" name="when" placeholder="June, maybe" />
          </label>
        </QuoteForm>
      </div>
    </div>
  );
}

export function Concept() {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const garnishRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const menuRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const simRef = useRef<BarSim | null>(null);
  const soundRef = useRef<BarSound | null>(null);
  const bottleEls = useRef(new Map<IngredientId, HTMLElement>());
  const held = useRef<{ id: IngredientId; x: number; y: number } | null>(null);
  const keyHeld = useRef(false);
  const timers = useRef<number[]>([]);
  const volsRef = useRef<Vols>({});
  const nextKey = useRef(1);
  const shakeRef = useRef<() => void>(() => {});

  const [phase, setPhase] = useState<Phase>("pouring");
  const phaseRef = useRef<Phase>("pouring");
  const [vols, setVols] = useState<Vols>({});
  const [total, setTotal] = useState(0);
  const [speech, setSpeech] = useState(WELCOME);
  const [pouringId, setPouringId] = useState<IngredientId | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [billOpen, setBillOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [announce, setAnnounce] = useState("");
  const [neonOn, setNeonOn] = useState(false);

  const trip = useMemo(() => leadingTrip(vols), [vols]);
  const canShake = phase === "pouring" && total >= 0.08;
  const name = result?.name ?? "";

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const scrollToMenu = useCallback((instant: boolean) => {
    const el = menuRef.current;
    if (!el) return;
    const y =
      el.getBoundingClientRect().top + window.scrollY - Math.min(window.innerHeight * 0.14, 90);
    window.scrollTo({ top: y, behavior: instant ? "auto" : "smooth" });
  }, []);

  // The bar opens: the canvas, its geometry, and the things it can tell us. Runs once; callbacks read state from refs.
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const anchor = anchorRef.current;
    if (!canvas || !stage || !anchor) return;
    const sound = new BarSound();
    soundRef.current = sound;

    const finish = () => {
      const s = simRef.current;
      if (!s) return;
      const v = s.vols();
      const sum = ranked(v).reduce((acc, [, x]) => acc + x, 0);
      const t = leadingTrip(v);
      const n = nameCocktail(v);
      const key = nextKey.current++;
      setResult({ key, trip: t, name: n, why: whyLine(v, t), vols: v, total: sum, house: false });
      setPhaseBoth("served");
      setBillOpen(false);
      setSpeech("That, my friend, is");
      setAnnounce(
        `The barman names your drink ${n}. It matches ${t.name}. The menu card is below.`,
      );
      soundRef.current?.bell();
      const wait = matchMedia("(prefers-reduced-motion: reduce)").matches;
      later(
        () => {
          setCardKey(key);
          soundRef.current?.slide();
        },
        wait ? 200 : 1900,
      );
      later(() => scrollToMenu(wait), wait ? 400 : 3300);
    };

    const sim = new BarSim(canvas, {
      onChange: (v, t) => {
        volsRef.current = v;
        setVols(v);
        setTotal(t);
      },
      onFull: () => setSpeech("Whoa, that's a full glass. Give it a shake."),
      onFirstPour: (id) => setSpeech(ingredient(id).line),
      onHardPour: () => setSpeech("Easy! It's a bottle, not a fire hose."),
      onPourEnd: (id) => {
        setPouringId(null);
        const v = simRef.current?.vols() ?? {};
        setAnnounce(
          `${ingredient(id).label} added. The glass is leaning towards ${leadingTrip(v).name}.`,
        );
      },
      onStream: (on, hard) => soundRef.current?.pour(on, hard),
      onClink: (s) => soundRef.current?.clink(s),
      onShakeGesture: () => {
        if (
          phaseRef.current === "pouring" &&
          simRef.current?.vols() &&
          ranked(simRef.current.vols()).length
        )
          startShake();
      },
      onShaken: finish,
      onAutoDone: () => startShake(),
      bottleEl: (id) => bottleEls.current.get(id) ?? null,
      onGlassMove: (x, y, rot) => {
        if (garnishRef.current)
          garnishRef.current.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rot.toFixed(3)}rad)`;
      },
    });
    simRef.current = sim;

    const startShake = () => {
      setPhaseBoth("shaking");
      setSpeech("Ice in. Tin on. Stand back.");
      setAnnounce("The barman is shaking your drink.");
      simRef.current?.shake();
    };
    shakeRef.current = startShake;

    const measure = () => {
      const s = stage.getBoundingClientRect();
      const a = anchor.getBoundingClientRect();
      const g: Geometry = {
        w: s.width,
        h: s.height,
        gx: a.left + a.width / 2 - s.left,
        gt: a.top - s.top,
        gb: a.bottom - s.top,
        gw: a.width,
      };
      sim.resize(g);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(anchor);
    const io = new IntersectionObserver(
      (es) => {
        const visible = es.some((e) => e.isIntersecting);
        setOnScreen(visible);
        if (visible) sim.start();
        else sim.stop();
      },
      { threshold: 0 },
    );
    io.observe(stage);
    sim.start();
    const neon = window.setTimeout(() => setNeonOn(true), 250);
    const allTimers = timers.current;
    return () => {
      window.clearTimeout(neon);
      allTimers.forEach((t) => window.clearTimeout(t));
      ro.disconnect();
      io.disconnect();
      sim.stop();
      sound.dispose();
      simRef.current = null;
    };
  }, [later, scrollToMenu]);

  useEffect(() => {
    if (simRef.current) simRef.current.reduced = reduced;
  }, [reduced]);

  // The poster stands in until the footage for the leading trip has a frame to draw.
  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    const img = new Image();
    img.src = trip.poster;
    sim.poster = img;
    sim.footageChanged();
  }, [trip.poster]);

  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    const tick = window.setInterval(() => {
      sim.video = videoRef.current;
    }, 200);
    sim.video = videoRef.current;
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.classList.add("is-armed");
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    el.querySelectorAll(".hb-row").forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  // ---- pouring ----

  const begin = (id: IngredientId) => {
    const sim = simRef.current;
    const el = bottleEls.current.get(id);
    if (!sim || !el) return false;
    soundRef.current?.wake();
    if (phaseRef.current !== "pouring") {
      setSpeech(
        phaseRef.current === "shaking"
          ? "One thing at a time."
          : "Finish that one first. Or tip it out and start again.",
      );
      return false;
    }
    if (total >= 0.995) {
      setSpeech("Whoa, that's a full glass. Give it a shake.");
      return false;
    }
    if (!sim.canPour) return false;
    sim.startPour(id, el);
    setPouringId(id);
    return true;
  };
  const end = (id: IngredientId) => simRef.current?.stopPour(id);

  const onBottleDown = (e: ReactPointerEvent<HTMLButtonElement>, id: IngredientId) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (begin(id)) held.current = { id, x: e.clientX, y: e.clientY };
  };
  const onBottleMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const h = held.current;
    if (h) simRef.current?.setDrive(h.id, Math.hypot(e.clientX - h.x, e.clientY - h.y) / 130);
  };
  const onBottleUp = () => {
    if (held.current) end(held.current.id);
    held.current = null;
  };
  const onBottleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: IngredientId) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    if (e.repeat || keyHeld.current) return;
    keyHeld.current = true;
    begin(id);
  };
  const onBottleKeyUp = (e: KeyboardEvent<HTMLButtonElement>, id: IngredientId) => {
    if (e.key !== " " && e.key !== "Enter") return;
    keyHeld.current = false;
    end(id);
  };
  // A click with no pointer behind it is a screen reader or switch: pour one good measure.
  const onBottleClick = (e: React.MouseEvent, id: IngredientId) => {
    if (e.detail !== 0 || keyHeld.current) return;
    if (begin(id)) later(() => end(id), 1000);
  };

  const onShake = () => {
    soundRef.current?.wake();
    if (!canShake) {
      setSpeech(
        total > 0
          ? "A bit more first. I can't shake a teaspoon."
          : "Shake what? Pour something first.",
      );
      return;
    }
    shakeRef.current();
  };

  const barmanChoice = () => {
    const sim = simRef.current;
    if (!sim) return;
    soundRef.current?.wake();
    if (phaseRef.current !== "pouring") return;
    const shuffled = [...INGREDIENTS].sort(() => Math.random() - 0.5);
    const a = shuffled[0] as Ingredient;
    const b = shuffled[1] as Ingredient;
    const room = 1 - total;
    const big = (1.8 + Math.random() * 1.6) * Math.min(1, room * 1.3);
    const small = (0.6 + Math.random() * 1) * Math.min(1, room * 1.3);
    setSpeech(`Leave it to me. A heavy hand of ${a.label}, a touch of ${b.label}.`);
    setPhaseBoth("shaking");
    // Hand the phase back for the moment of pouring; the shake takes it again when the last bottle is back on the shelf.
    phaseRef.current = "pouring";
    sim.autoPour([
      { id: a.id, dur: big },
      { id: b.id, dur: small },
    ]);
  };

  const again = useCallback(() => {
    simRef.current?.tipOut();
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current.length = 0;
    setPhaseBoth("pouring");
    setResult(null);
    setCardKey(0);
    setBillOpen(false);
    setPouringId(null);
    setSpeech("Fresh glass. What'll it be?");
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  const orderHouse = (sig: Signature) => {
    const sim = simRef.current;
    if (!sim) return;
    soundRef.current?.wake();
    sim.fill(sig.recipe);
    const t = tripBySlug(sig.slug);
    const sum = ranked(sig.recipe).reduce((s, [, v]) => s + v, 0);
    const key = nextKey.current++;
    setResult({
      key,
      trip: t,
      name: sig.name,
      why: sig.blurb + " " + whyLine(sig.recipe, t).split(". ").slice(1).join(". "),
      vols: sig.recipe,
      total: sum,
      house: true,
    });
    setPhaseBoth("served");
    setBillOpen(false);
    setCardKey(key);
    setSpeech("Good choice. One of the house favourites:");
    setAnnounce(`${sig.name}: ${t.name}. The menu card is above the cocktail list.`);
    soundRef.current?.slide();
    later(() => scrollToMenu(reduced), 80);
  };

  const toggleMute = () => {
    const s = soundRef.current;
    if (!s) return;
    s.wake();
    s.muted = !muted;
    if (s.muted) s.pour(false);
    setMuted(!muted);
  };

  const onGlassDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    soundRef.current?.wake();
    simRef.current?.grab(e.clientX);
  };

  const inGlass = ranked(vols);
  const shown = result && cardKey === result.key ? result : null;
  const leadId = result ? ranked(result.vols)[0]?.[0] : null;

  return (
    <main className={`c-holiday-bar${reduced ? " is-calm" : ""}`}>
      <section ref={stageRef} className={`hb-stage is-${phase}`} aria-label="The bar">
        <div className="hb-wall" aria-hidden="true">
          <div className="hb-beams" />
          <svg className="hb-palm" viewBox="0 0 400 400">
            <g fill="#04130e">
              <path d="M396 4C310 26 220 80 170 170c70-34 150-60 226-70z" />
              <path d="M396 90c-80 8-180 50-230 130 80-30 160-40 230-30z" />
              <path d="M396 190c-70-6-170 20-220 90 70-20 150-26 220-8z" />
              <path d="M396 280c-50-14-130 0-180 50 60-10 130-10 180 6z" />
            </g>
          </svg>
          <svg className="hb-lamp hb-lamp-l" viewBox="0 0 120 220">
            <path d="M60 0v70" stroke="#2c1a0b" strokeWidth="3" />
            <path d="M18 150C18 100 38 70 60 70s42 30 42 80z" fill="#a8702c" />
            <path
              d="M18 150C18 100 38 70 60 70M102 150C102 100 82 70 60 70M38 148c0-40 8-66 22-78M82 148c0-40-8-66-22-78M26 118h68M36 94h48"
              stroke="#5c3a14"
              strokeWidth="2"
              fill="none"
            />
            <ellipse cx="60" cy="150" rx="42" ry="9" fill="#ffd27a" />
          </svg>
          <svg className="hb-lamp hb-lamp-r" viewBox="0 0 120 220">
            <path d="M60 0v70" stroke="#2c1a0b" strokeWidth="3" />
            <path d="M18 150C18 100 38 70 60 70s42 30 42 80z" fill="#a8702c" />
            <path
              d="M18 150C18 100 38 70 60 70M102 150C102 100 82 70 60 70M38 148c0-40 8-66 22-78M82 148c0-40-8-66-22-78M26 118h68M36 94h48"
              stroke="#5c3a14"
              strokeWidth="2"
              fill="none"
            />
            <ellipse cx="60" cy="150" rx="42" ry="9" fill="#ffd27a" />
          </svg>
        </div>

        <header className="hb-top">
          <a href="#hb-list" className="hb-toplink">
            The cocktail list
          </a>
          <div className="hb-sign">
            <h1 className={`hb-neon${neonOn ? " is-on" : ""}`}>The Holiday Bar</h1>
            <p className="hb-plaque">A {BRAND.name} establishment</p>
          </div>
          <div className="hb-topright">
            <a href={tel} className="hb-toplink">
              Call the bar
            </a>
            <button
              type="button"
              className="hb-sound"
              onClick={toggleMute}
              aria-pressed={!muted}
              aria-label={muted ? "Turn the bar's sound on" : "Turn the bar's sound off"}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
                {muted ? (
                  <path
                    d="M16 9l5 6M21 9l-5 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M16 8.500a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </header>

        <div
          className="hb-shelves"
          role="group"
          aria-label="Bottles. Press and hold, or hold space, to pour."
        >
          {SHELVES.map((row, r) => (
            <div className="hb-shelf" key={r}>
              {row.map((id) => {
                const ing = ingredient(id);
                return (
                  <div className="hb-slot" key={id}>
                    <button
                      type="button"
                      className={`hb-bottle${pouringId === id ? " is-pouring" : ""}`}
                      aria-label={`Pour ${ing.label}. Hold to pour longer.`}
                      onPointerDown={(e) => onBottleDown(e, id)}
                      onPointerMove={onBottleMove}
                      onPointerUp={onBottleUp}
                      onPointerCancel={onBottleUp}
                      onKeyDown={(e) => onBottleKeyDown(e, id)}
                      onKeyUp={(e) => onBottleKeyUp(e, id)}
                      onBlur={() => {
                        if (keyHeld.current) {
                          keyHeld.current = false;
                          end(id);
                        }
                      }}
                      onClick={(e) => onBottleClick(e, id)}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <span
                        className="hb-bottle-art"
                        ref={(el) => {
                          if (el) bottleEls.current.set(id, el);
                        }}
                      >
                        <BottleArt id={id} rgb={ing.rgb} />
                      </span>
                    </button>
                    <span className="hb-tag">{ing.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="hb-speech">
          <p className="hb-speech-line" key={speech}>
            {speech}
          </p>
          {phase === "served" && name && (
            <p className="hb-namesign" key={name}>
              {name.split(" ").map((word, w, words) => {
                const start = words.slice(0, w).join(" ").length + (w ? 1 : 0);
                return (
                  <span key={w}>
                    <span className="hb-word">
                      {word.split("").map((ch, i) => (
                        <span
                          className="hb-letter"
                          key={i}
                          style={{ animationDelay: `${(start + i) * 34}ms` }}
                        >
                          {ch}
                        </span>
                      ))}
                    </span>{" "}
                  </span>
                );
              })}
            </p>
          )}
        </div>
        <p className="hb-sr" role="status">
          {announce}
        </p>

        <div className="hb-well">
          <aside className="hb-chalk" aria-label="What's in your glass">
            <p className="hb-chalk-h">In your glass</p>
            {inGlass.length === 0 && <p className="hb-chalk-empty">Nothing yet. Hold a bottle.</p>}
            <ul>
              {inGlass.slice(0, 5).map(([id, v]) => (
                <li key={id}>
                  <span className="hb-chalk-mark">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <Mark id={id} color={rgbCss(ingredient(id).rgb)} />
                    </svg>
                  </span>
                  <span className="hb-chalk-label">{ingredient(id).label}</span>
                  <span className="hb-chalk-pct">{pct(v, total)}%</span>
                </li>
              ))}
            </ul>
            {inGlass.length > 0 && (
              <p className="hb-chalk-trip">
                <span>Tastes like</span>
                <b key={trip.slug}>{trip.name}</b>
              </p>
            )}
          </aside>

          <div className="hb-glass" ref={anchorRef}>
            <div
              className="hb-glass-hit"
              aria-hidden="true"
              onPointerDown={onGlassDown}
              onPointerMove={(e) => simRef.current?.move(e.clientX)}
              onPointerUp={() => simRef.current?.release()}
              onPointerCancel={() => simRef.current?.release()}
            />
            <div className="hb-garnish-mount" ref={garnishRef} aria-hidden="true">
              {phase === "served" && leadId && (
                <div className="hb-garnish" key={result?.key}>
                  <span className="hb-straw" />
                  <Garnish id={leadId} />
                </div>
              )}
            </div>
          </div>

          <div
            className={`hb-barman is-${phase}${pouringId ? " is-watching" : ""}`}
            aria-hidden="true"
          >
            <Barman />
          </div>
        </div>

        <canvas ref={canvasRef} className="hb-canvas" aria-hidden="true" />

        <div className="hb-counter" aria-hidden="true" />
        <div className="hb-controls">
          {phase === "served" ? (
            <>
              {result && (
                <button
                  type="button"
                  className="hb-btn hb-btn-neon"
                  onClick={() => scrollToMenu(reduced)}
                >
                  Read the menu card
                </button>
              )}
              <button type="button" className="hb-btn hb-btn-brass" onClick={again}>
                Tip it out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`hb-btn hb-btn-neon${canShake ? " is-ready" : ""}`}
                onClick={onShake}
                disabled={phase === "shaking"}
              >
                Shake it
              </button>
              <button
                type="button"
                className="hb-btn hb-btn-brass"
                onClick={barmanChoice}
                disabled={phase === "shaking"}
              >
                Barman&apos;s choice
              </button>
              {total > 0 && phase === "pouring" && (
                <button type="button" className="hb-btn hb-btn-ghost" onClick={again}>
                  Tip it out
                </button>
              )}
            </>
          )}
        </div>
        <GlassFootage trip={trip} videoRef={videoRef} paused={!onScreen} />
      </section>

      <section
        ref={menuRef}
        className={`hb-bartop${shown ? " has-card" : ""}`}
        aria-label="Your menu card"
      >
        {shown && (
          <div className={`hb-served${billOpen ? " has-tab" : ""}`} key={shown.key}>
            <div className="hb-slide">
              <MenuCard
                result={shown}
                billOpen={billOpen}
                onBill={() => setBillOpen((o) => !o)}
                onAgain={again}
                reduced={reduced}
              />
            </div>
            {billOpen && <BarTab result={shown} key={shown.key} />}
          </div>
        )}
      </section>

      <section ref={listRef} id="hb-list" className="hb-list" aria-labelledby="hb-list-h">
        <h2 id="hb-list-h" className="hb-list-h">
          The Cocktail List
        </h2>
        <p className="hb-list-sub">
          Six house favourites, one for each trip we pour. Sample prices, per person sharing.
        </p>
        <ol className="hb-rows">
          {SIGNATURES.map((sig, i) => {
            const t = tripBySlug(sig.slug);
            return (
              <li
                className="hb-row"
                key={sig.slug}
                style={{ transitionDelay: `${(i % 2) * 70}ms` }}
              >
                <span className="hb-coaster">
                  <img src={t.photos[0]} alt={`${t.name}`} loading="lazy" />
                </span>
                <div className="hb-row-text">
                  <h3>{sig.name}</h3>
                  <p className="hb-row-trip">
                    {t.name}, {t.nights} nights
                  </p>
                  <p className="hb-row-blurb">{sig.blurb}</p>
                  <div className="hb-row-recipe">
                    <MiniGlass recipe={sig.recipe} />
                  </div>
                </div>
                <div className="hb-row-end">
                  <span className="hb-row-price">{rand(t.price)}</span>
                  <button
                    type="button"
                    className="hb-btn hb-btn-brass hb-btn-sm"
                    onClick={() => orderHouse(sig)}
                    aria-label={`Order ${sig.name}: ${t.name}`}
                  >
                    Pour me this
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="hb-list-count" aria-hidden="true">
          {TRIPS.length} trips. No hangovers. Some sunburn.
        </p>
      </section>

      <footer className="hb-foot">
        <p className="hb-foot-neon">Last orders?</p>
        <p className="hb-foot-text">
          Would rather talk to a person than a bottle? {BRAND.name} is behind the bar.
        </p>
        <ul className="hb-foot-links">
          <li>
            <a href={tel}>
              <span>Phone</span>
              {contact.phoneDisplay}
            </a>
          </li>
          <li>
            <a href={`mailto:${contact.email}`}>
              <span>Email</span>
              {contact.email}
            </a>
          </li>
          <li>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer">
              <span>WhatsApp</span>Send a message
            </a>
          </li>
        </ul>
      </footer>
    </main>
  );
}
