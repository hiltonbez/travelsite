// The Holiday Mix: a DJ desk where the mood faders pick the trip. The two best-matching trips sit on the decks and
// crossfade live; the waveform's peaks are the days of the leading trip; "Drop the track" turns the mix into a named
// track whose tracklist is the itinerary. Per-frame work (caps, meters, canvas, crossfade) writes straight to the DOM
// from one requestAnimationFrame loop, so React only re-renders when a level or a deck actually changes.
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
  contact,
  QuoteForm,
  rand,
  TRIPS,
  useReducedMotion,
  type ConceptTrip,
  type Mood,
} from "@/concepts/kit";
import { startBeat, type Beat } from "./audio";

export const FONTS = "family=Anton&family=JetBrains+Mono:wght@400;500;700";

const CHANNELS: { mood: Mood; label: string; adj: string; mix: string; icon: string }[] = [
  {
    mood: "beach",
    label: "Beach",
    adj: "Barefoot",
    mix: "Sunburn",
    icon: "M2 10c2-2.6 4-2.6 6 0s4 2.6 6 0 4-2.6 6 0M2 15c2-2.6 4-2.6 6 0s4 2.6 6 0 4-2.6 6 0",
  },
  {
    mood: "adventure",
    label: "Adventure",
    adj: "Full Throttle",
    mix: "Adrenaline",
    icon: "M2 18 9 6l4 7 2-3 5 8z",
  },
  {
    mood: "luxury",
    label: "Luxury",
    adj: "Velvet",
    mix: "Room Service",
    icon: "M6 4h10l4 5-9 11L2 9zM2 9h18M8 9l3 11 3-11",
  },
  {
    mood: "culture",
    label: "Culture",
    adj: "Old Town",
    mix: "Spice Market",
    icon: "M3 20V10a8 8 0 0 1 16 0v10M7 20v-9a4 4 0 0 1 8 0v9M1 20h20",
  },
  {
    mood: "wildlife",
    label: "Wildlife",
    adj: "Long Grass",
    mix: "Dawn Chorus",
    icon: "M11 20c-3 0-5-1.5-5-3.6C6 14 8.4 12 11 12s5 2 5 4.4c0 2.1-2 3.6-5 3.6zM4 11a2 2.5 0 1 0 0-.01zM8.5 7a2 2.5 0 1 0 0-.01zM13.5 7a2 2.5 0 1 0 0-.01zM18 11a2 2.5 0 1 0 0-.01z",
  },
];

const TRIP_WORD: Record<string, string> = {
  mauritius: "Lagoon",
  zanzibar: "Dhow",
  "victoria-falls": "Thunder",
  kruger: "Bushveld",
  "cape-town": "Cape Doctor",
  santorini: "Caldera",
};

// Our own lines, so nothing names a landmark over footage that wasn't filmed there.
const BLURB: Record<string, string> = {
  mauritius: "Warm water, long lunches, nowhere to be.",
  zanzibar: "Spice, white sand and slow dhows at sunset.",
  "victoria-falls": "The smoke that thunders, a short hop from Joburg.",
  kruger: "Dawn drives and very large neighbours.",
  "cape-town": "Mountain, wine, and a wind with its own name.",
  santorini: "White walls, blue water, sunsets on purpose.",
};

// What the faders do when a trip is loaded from the crate. Each of these makes that trip the leader.
const LOAD: Record<string, number[]> = {
  mauritius: [1, 0.33, 1, 0.33, 0],
  zanzibar: [1, 0.33, 0.33, 1, 0.33],
  "victoria-falls": [0, 1, 0.33, 0.33, 0.66],
  kruger: [0, 0.66, 0.66, 0, 1],
  "cape-town": [0, 0.66, 0.66, 0.66, 0.33],
  santorini: [0.33, 0, 1, 1, 0],
};

const START = [0.68, 0.1, 0.22, 0.56, 0.08];
const BINS = 160;
const SILENT = 0.02;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const seeded = (x: number) => {
  const s = Math.sin(x * 12.9898 + 4.1) * 43758.5453;
  return s - Math.floor(s);
};
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const hashOf = (text: string) => {
  let h = 7;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 9973;
  return h;
};

function rankTrips(levels: number[]) {
  const scored = TRIPS.map((t, i) => ({
    i,
    s: CHANNELS.reduce((n, c, k) => n + t.moods[c.mood] * levels[k]!, 0),
  }));
  scored.sort((a, b) => b.s - a.s || a.i - b.i);
  return scored;
}

/** How much of the picture belongs to the leader: 50% on a tie, most of it once it's clearly ahead, with the other trip still ghosting through. */
const leaderShare = (a: number, b: number) =>
  a + b <= 0 ? 0.5 : 0.5 + Math.min(0.4, ((a - b) / (a + b)) * 2.6);
const bpmOf = (levels: number[]) => Math.round(96 + levels[1]! * 40 + levels[0]! * 8);

function trackName(trip: ConceptTrip, levels: number[]) {
  const order = CHANNELS.map((c, i) => ({ c, v: levels[i]! })).sort((a, b) => b.v - a.v);
  const edit = trip.nights <= 4 ? "Radio Edit" : trip.nights === 5 ? "Club Edit" : "Extended Mix";
  const title = `${order[0]!.c.adj} ${TRIP_WORD[trip.slug] ?? trip.name}`;
  const version = order[1]!.v >= 0.15 ? `${order[1]!.c.mix} ${edit}` : edit;
  return { title, version };
}

/** One minute of runtime per night, shared across the tracks by how much happens in each. */
function trackTimes(trip: ConceptTrip) {
  const total = trip.nights * 60;
  const weight = trip.days.map(([, d]) => d.length + 30);
  const all = sum(weight);
  let used = 0;
  return trip.days.map((_, i) => {
    const secs = i === trip.days.length - 1 ? total - used : Math.round((weight[i]! / all) * total);
    used += secs;
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  });
}

/** Where each day's peak stands: how tall depends on which mood that day belongs to and how far its fader is up. */
function shapeWave(out: Float32Array, trip: ConceptTrip, levels: number[]) {
  const n = trip.days.length;
  const seed = hashOf(trip.slug);
  const master = 0.25 + 0.75 * clamp(sum(levels) / 2.2);
  const amps = trip.days.map((_, i) => {
    const pick = Math.floor(seeded(seed + i * 3) * CHANNELS.length);
    const liked = [...CHANNELS.keys()].sort(
      (a, b) => trip.moods[CHANNELS[b]!.mood] - trip.moods[CHANNELS[a]!.mood],
    )[pick % 3]!;
    return 0.42 + 0.18 * seeded(seed + i) + 0.5 * levels[liked]!;
  });
  for (let j = 0; j < BINS; j++) {
    const u = (j + 0.5) / BINS;
    let env = 0.05;
    for (let i = 0; i < n; i++) {
      const d = (u - (i + 0.5) / n) / (0.28 / n);
      env = Math.max(env, amps[i]! * Math.exp(-d * d));
    }
    out[j] = clamp(env * (0.68 + 0.32 * seeded(seed + j * 1.7)) * master);
  }
  if (sum(levels) < SILENT) out.fill(0.012);
}

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 22 22"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d={d} />
    </svg>
  );
}

/** A name that rolls up letter by letter each time it changes. */
function RollName({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text} key={text}>
      {text.split(" ").map((word, w) => (
        <span className="hm-word" aria-hidden="true" key={w}>
          {[...word].map((ch, i) => (
            <span className="hm-roll" style={{ animationDelay: `${(w * 3 + i) * 28}ms` }} key={i}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

const DeckClip = memo(function DeckClip({ trip }: { trip: ConceptTrip }) {
  return <Clip src={trip.video} poster={trip.poster} className="hm-clip" />;
});

function BeatButton({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`hm-beat${on ? " is-on" : ""}`}
      aria-pressed={on}
      onClick={onToggle}
    >
      <span className="hm-beat-led" aria-hidden="true" />
      <span>Beat {on ? "on" : "off"}</span>
    </button>
  );
}

type DeskProps = {
  levels: number[];
  setLevel: (i: number, v: number) => void;
  manual: number | null;
  setManual: (v: number | null) => void;
  motorUp: boolean;
  dropping: boolean;
  beatOn: boolean;
  toggleBeat: () => void;
  beat: RefObject<Beat | null>;
  onDrop: (main: number, other: number) => void;
};

function Desk({
  levels,
  setLevel,
  manual,
  setManual,
  motorUp,
  dropping,
  beatOn,
  toggleBeat,
  beat,
  onDrop,
}: DeskProps) {
  const reduced = useReducedMotion();
  const ranked = useMemo(() => rankTrips(levels), [levels]);
  const silent = sum(levels) < SILENT;
  const [decks, setDecks] = useState<[number, number]>(() => {
    return [ranked[0]!.i, ranked[1]!.i];
  });
  const [xSide, setXSide] = useState<0 | 1>(0);
  const [day, setDay] = useState(0);

  const mainIdx = manual === null ? ranked[0]!.i : decks[manual >= 0.5 ? 1 : 0]!;
  const otherIdx = manual === null ? ranked[1]!.i : decks[manual >= 0.5 ? 0 : 1]!;
  const main = TRIPS[mainIdx]!;
  const other = TRIPS[otherIdx]!;
  const bpm = bpmOf(levels);

  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const deckA = useRef<HTMLDivElement>(null);
  const deckB = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const xKnob = useRef<HTMLDivElement>(null);
  const pctA = useRef<HTMLSpanElement>(null);
  const pctB = useRef<HTMLSpanElement>(null);
  const withPct = useRef<HTMLSpanElement>(null);
  const dropGlow = useRef<HTMLSpanElement>(null);
  const jogA = useRef<HTMLDivElement>(null);
  const jogB = useRef<HTMLDivElement>(null);
  const riders = useRef<(HTMLDivElement | null)[]>([]);
  const meters = useRef<(HTMLDivElement | null)[]>([]);
  const masters = useRef<(HTMLDivElement | null)[]>([]);
  const clock = useRef(0);

  const topTarget = useRef(new Float32Array(BINS));
  const botTarget = useRef(new Float32Array(BINS));
  const dragging = useRef<number | null>(null);
  const seek = useRef(0);
  const spin = useRef([0, 0]);
  const jogHeld = useRef<{ i: number; a: number } | null>(null);
  const notch = useRef<number[]>([]);

  const live = useRef({
    levels,
    manual,
    mainIdx,
    otherIdx,
    rank: ranked,
    decks,
    days: main.days.length,
    bpm,
    silent,
    reduced,
  });
  useEffect(() => {
    live.current = {
      levels,
      manual,
      mainIdx,
      otherIdx,
      rank: ranked,
      decks,
      days: main.days.length,
      bpm,
      silent,
      reduced,
    };
  });

  useEffect(() => {
    shapeWave(topTarget.current, main, levels);
    shapeWave(botTarget.current, other, levels);
  }, [main, other, levels]);

  // The one animation loop.
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const shown =
      motorUp && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? [0, 0, 0, 0, 0]
        : [...live.current.levels];
    const top = new Float32Array(BINS);
    const bot = new Float32Array(BINS);
    const meterNow = [0, 0, 0, 0, 0, 0, 0];
    const deckNow = [...live.current.decks] as [number, number];
    let xf = 0;
    let pos = 0;
    let last = performance.now();
    let raf = 0;
    let onScreen = true;
    let lastPct = -1;
    let lastDay = -1;
    let dimNow = 0;
    let lastLeader = live.current.mainIdx;
    let flashNow = 0;
    let W = 0;
    let H = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = el.clientWidth;
      H = el.clientHeight;
      el.width = Math.round(W * dpr);
      el.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver((entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
    });
    if (root.current) io.observe(root.current);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.25, (now - last) / 1000);
      const ease = (rate: number) => 1 - Math.exp(-dt * rate);
      last = now;
      if (!onScreen) return;
      const L = live.current;
      const still = L.reduced;

      // The clock: the real beat's when it's on, otherwise our own.
      if (beat.current) pos = beat.current.pos();
      else if (!still) pos += (dt * L.bpm) / 60;
      clock.current = pos;
      const phase = pos - Math.floor(pos);
      const kick = still ? 0.5 : Math.exp(-phase * 3.6);

      // Decks: the leader is always on a deck; the runner-up only loads onto a deck nobody can see.
      let target = xf;
      if (L.manual !== null) {
        target = L.manual;
      } else {
        const lead = L.rank[0]!.i;
        const second = L.rank[1]!.i;
        let side = deckNow.indexOf(lead);
        if (side < 0) {
          side = xf < 0.5 ? 1 : 0;
          deckNow[side] = lead;
          setDecks([deckNow[0]!, deckNow[1]!]);
        }
        const away = 1 - side;
        let share = 1;
        if (deckNow[away]! === second) {
          share = leaderShare(L.rank[0]!.s, L.rank[1]!.s);
        } else if ((away === 1 ? xf : 1 - xf) < 0.04) {
          deckNow[away] = second;
          setDecks([deckNow[0]!, deckNow[1]!]);
        }
        target = side === 1 ? share : 1 - share;
      }
      xf = still ? target : xf + (target - xf) * ease(4.2);
      if (deckA.current) deckA.current.style.opacity = (1 - xf).toFixed(3);
      if (deckB.current) deckB.current.style.opacity = xf.toFixed(3);
      if (xKnob.current) xKnob.current.style.transform = `translateX(${(xf * 100).toFixed(2)}%)`;
      const pct = Math.round(xf * 100);
      if (pct !== lastPct) {
        lastPct = pct;
        if (pctA.current) pctA.current.textContent = String(100 - pct).padStart(3, "0");
        if (pctB.current) pctB.current.textContent = String(pct).padStart(3, "0");
        setXSide(pct >= 50 ? 1 : 0);
      }
      const mainSide = deckNow.indexOf(L.mainIdx);
      const otherPct = mainSide === 1 ? 100 - pct : mainSide === 0 ? pct : 0;
      if (withPct.current) withPct.current.textContent = String(otherPct);

      dimNow += ((L.silent ? 0.82 : 0) - dimNow) * (still ? 1 : ease(3.7));
      if (dim.current) dim.current.style.opacity = dimNow.toFixed(3);
      if (L.mainIdx !== lastLeader) {
        lastLeader = L.mainIdx;
        flashNow = still ? 0 : 0.55;
      }
      flashNow *= 1 - ease(9);
      if (flash.current) flash.current.style.opacity = flashNow.toFixed(3);

      // Fader caps and channel meters.
      let total = 0;
      for (let i = 0; i < 5; i++) {
        const want = L.levels[i]!;
        shown[i]! += (want - shown[i]!) * (still ? 1 : dragging.current === i ? ease(55) : ease(6));
        const r = riders.current[i]!;
        if (r) r.style.transform = `translateY(${((1 - shown[i]!) * 100).toFixed(2)}%)`;
        total += shown[i]!;
        const groove = still ? 0.8 : 0.6 + 0.4 * Math.exp(-(((pos + i * 0.37) % 1) * 3.2));
        const flutter = still ? 0 : 0.05 * Math.sin(now * 0.021 + i * 2.1);
        const reach = clamp(shown[i]! * (groove + flutter));
        meterNow[i] =
          reach > meterNow[i]! ? reach : meterNow[i]! + (reach - meterNow[i]!) * ease(9);
        const lit = Math.ceil(meterNow[i]! * 14) / 14;
        const m = meters.current[i]!;
        if (m) m.style.transform = `scaleY(${(1 - lit).toFixed(3)})`;
      }
      const loud = clamp(total / 2.4);
      for (let i = 0; i < 2; i++) {
        const reach = clamp(
          loud * (still ? 0.8 : 0.58 + 0.42 * kick + 0.05 * Math.sin(now * 0.03 + i * 3)),
        );
        meterNow[5 + i] =
          reach > meterNow[5 + i]!
            ? reach
            : meterNow[5 + i]! + (reach - meterNow[5 + i]!) * ease(9);
        const m = masters.current[i]!;
        if (m)
          m.style.transform = `scaleY(${(1 - Math.ceil(meterNow[5 + i]! * 20) / 20).toFixed(3)})`;
      }
      if (dropGlow.current)
        dropGlow.current.style.opacity = (L.silent ? 0 : 0.2 + 0.8 * kick).toFixed(3);

      // Jog wheels.
      for (let i = 0; i < 2; i++) {
        if (!still && jogHeld.current?.i !== i) spin.current[i]! += dt * (40 + 170 * loud);
        const j = i === 0 ? jogA.current : jogB.current;
        if (j) j.style.transform = `rotate(${spin.current[i]!.toFixed(1)}deg)`;
      }

      // The waveform: leader upward in coral, the other deck downward in yellow, playhead sweeping across the days.
      const u = (((pos / 64 + seek.current) % 1) + 1) % 1;
      const n = L.days;
      const dayNow = Math.min(n - 1, Math.floor(u * n));
      if (dayNow !== lastDay) {
        lastDay = dayNow;
        setDay(dayNow);
      }
      for (let j = 0; j < BINS; j++) {
        top[j]! += (topTarget.current[j]! - top[j]!) * (still ? 1 : ease(6.3));
        bot[j]! += (botTarget.current[j]! - bot[j]!) * (still ? 1 : ease(6.3));
      }
      if (W > 0) {
        ctx.clearRect(0, 0, W, H);
        const mid = H * 0.62;
        const up = mid - 4;
        const down = H - mid - 4;
        const step = W < 700 ? 4 : 5;
        const bars = Math.floor(W / step);
        const otherAmount = 0.2 + 1.6 * Math.min(xf, 1 - xf);
        const pulse = 0.88 + 0.12 * kick;
        for (let k = 0; k < bars; k++) {
          const f = (k + 0.5) / bars;
          const j = Math.min(BINS - 1, Math.floor(f * BINS));
          const played = f < u;
          const a = Math.max(1, top[j]! * up * pulse);
          const b = Math.max(1, bot[j]! * down * otherAmount * pulse);
          ctx.fillStyle = played ? "#ff4b33" : "rgba(255,75,51,.55)";
          ctx.fillRect(k * step, mid - a, step - 1.5, a);
          ctx.fillStyle = played ? "#dcff1e" : "rgba(220,255,30,.4)";
          ctx.fillRect(k * step, mid + 1, step - 1.5, b);
        }
        ctx.fillStyle = "#fff";
        ctx.fillRect(Math.round(u * W), 0, 1.5, H);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
    // The loop reads everything that changes through `live`, so it runs once per desk.
  }, [beat, motorUp]);

  // Faders.
  const faderDrag = useRef<{ grab: number; range: number; top: number } | null>(null);
  const moveFader = (i: number, v: number) => {
    const next = clamp(v);
    const stop = Math.round(next * 10);
    if (notch.current[i]! !== stop) {
      notch.current[i] = stop;
      if (dragging.current === i) navigator.vibrate?.(4);
    }
    setLevel(i, next);
  };
  const faderDown = (i: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
    const t = e.currentTarget;
    t.setPointerCapture(e.pointerId);
    const box = t.getBoundingClientRect();
    const capH = t.querySelector<HTMLElement>(".hm-cap")?.offsetHeight ?? 38;
    const range = box.height - capH;
    const y = e.clientY - box.top;
    const capTop = (1 - levels[i]!) * range;
    const grab = y >= capTop && y <= capTop + capH ? y - capTop : capH / 2;
    faderDrag.current = { grab, range, top: box.top };
    dragging.current = i;
    moveFader(i, 1 - (y - grab) / range);
  };
  const faderMove = (i: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = faderDrag.current;
    if (!d || dragging.current !== i) return;
    moveFader(i, 1 - (e.clientY - d.top - d.grab) / d.range);
  };
  const faderUp = () => {
    dragging.current = null;
    faderDrag.current = null;
  };
  const faderKey = (i: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowUp: 0.05,
      ArrowRight: 0.05,
      ArrowDown: -0.05,
      ArrowLeft: -0.05,
      PageUp: 0.2,
      PageDown: -0.2,
      Home: -1,
      End: 1,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    moveFader(i, levels[i]! + moves[e.key]!);
  };

  // Crossfader: grab it and you overrule the desk, until the next mood fader moves.
  const xDrag = useRef(false);
  const xAt = (e: ReactPointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const knob = 56;
    setManual(clamp((e.clientX - box.left - knob / 2) / (box.width - knob)));
  };
  const xKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: 0.05,
      ArrowUp: 0.05,
      ArrowLeft: -0.05,
      ArrowDown: -0.05,
      PageUp: 0.2,
      PageDown: -0.2,
    };
    const from = manual ?? xSide;
    if (e.key === "Home") setManual(0);
    else if (e.key === "End") setManual(1);
    else if (e.key in moves) setManual(clamp(from + moves[e.key]!));
    else return;
    e.preventDefault();
  };

  // Jog wheels: give the platter a spin to scrub through the days.
  const jogDown = (i: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
    const t = e.currentTarget;
    t.setPointerCapture(e.pointerId);
    const box = t.getBoundingClientRect();
    jogHeld.current = {
      i,
      a: Math.atan2(e.clientY - box.top - box.height / 2, e.clientX - box.left - box.width / 2),
    };
  };
  const jogMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const h = jogHeld.current;
    if (!h) return;
    const box = e.currentTarget.getBoundingClientRect();
    const a = Math.atan2(
      e.clientY - box.top - box.height / 2,
      e.clientX - box.left - box.width / 2,
    );
    let d = a - h.a;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    h.a = a;
    spin.current[h.i]! += (d * 180) / Math.PI;
    seek.current += d / (Math.PI * 4);
  };
  const jogUp = () => {
    jogHeld.current = null;
  };

  const pickDay = (i: number) => {
    const n = main.days.length;
    const u = (i + 0.5) / n;
    seek.current = u - clock.current / 64;
    setDay(i);
  };

  const dayShown = main.days[Math.min(day, main.days.length - 1)]!;
  const autoX =
    decks[1]! === mainIdx
      ? leaderShare(ranked[0]!.s, ranked[1]!.s)
      : 1 - leaderShare(ranked[0]!.s, ranked[1]!.s);
  const xNow = Math.round((manual ?? autoX) * 100);

  return (
    <section
      ref={root}
      className={`hm-desk${dropping ? " is-dropping" : ""}`}
      aria-label="The mixing desk"
    >
      <div className="hm-stage">
        <div className="hm-decks" aria-hidden="true">
          <div className="hm-deck" ref={deckA}>
            <DeckClip trip={TRIPS[decks[0]!]!} />
          </div>
          <div className="hm-deck hm-deck-b" ref={deckB} style={{ opacity: 0 }}>
            <DeckClip trip={TRIPS[decks[1]!]!} />
          </div>
        </div>
        <div className="hm-shade" aria-hidden="true" />
        <div className="hm-dim" ref={dim} style={{ opacity: 0 }} aria-hidden="true" />
        <div className="hm-flash" ref={flash} style={{ opacity: 0 }} aria-hidden="true" />

        <div className="hm-over">
          <div className="hm-intro">
            <h1>Mix your holiday.</h1>
            <p>
              Push the faders. The footage, the waveform and the trip all follow. Drop the track
              when it sounds like you.
            </p>
          </div>
          <div className="hm-onair">
            <p className="hm-chip">
              <span className={`hm-chip-led${silent ? " is-off" : ""}`} aria-hidden="true" />
              {silent ? "Off air" : "On air"}
            </p>
            {silent ? (
              <RollName text="Dead air" className="hm-name" />
            ) : (
              <RollName text={main.name.split(" & ")[0]!} className="hm-name" />
            )}
            {!silent && main.name.includes(" & ") && (
              <p className="hm-name-more" key={main.name}>
                &amp; {main.name.split(" & ")[1]}
              </p>
            )}
            <p className="hm-blurb" key={main.slug}>
              {silent ? "Nothing on the decks. Push a fader up." : BLURB[main.slug]!}
            </p>
            {!silent && (
              <p className="hm-with">
                Mixed with <b>{other.name}</b> at <span ref={withPct}>0</span>%
              </p>
            )}
            <p className="hm-sr" aria-live="polite">
              {silent
                ? "Nothing playing. Push a fader up."
                : `On air: ${main.name}, mixed with ${other.name}.`}
            </p>
          </div>
        </div>

        <div className="hm-wave">
          <div className="hm-wave-screen">
            <canvas ref={canvas} className="hm-canvas" aria-hidden="true" />
            <div className="hm-peaks" role="group" aria-label={`The days of ${main.name}`}>
              {main.days.map(([name], i) => (
                <button
                  type="button"
                  key={`${main.slug}-${name}`}
                  className={`hm-peak${i === day ? " is-on" : ""}`}
                  style={{ left: `${((i + 0.5) / main.days.length) * 100}%` }}
                  aria-label={`Day stop ${i + 1}: ${name}`}
                  aria-pressed={i === day}
                  onClick={() => pickDay(i)}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>
          <p className="hm-lcd" key={`${main.slug}-${day}`}>
            <b>
              {String(day + 1).padStart(2, "0")} {dayShown[0]!}
            </b>{" "}
            <span>{dayShown[1]!}</span>
          </p>
        </div>
      </div>

      <div className="hm-console">
        <i className="hm-screw hm-s1" />
        <i className="hm-screw hm-s2" />
        <i className="hm-screw hm-s3" />
        <i className="hm-screw hm-s4" />
        <Jog
          side="A"
          trip={TRIPS[decks[0]!]!}
          platter={jogA}
          live={xSide === 0}
          onDown={jogDown(0)}
          onMove={jogMove}
          onUp={jogUp}
        />

        <div className="hm-mixer">
          <div className="hm-channels">
            {CHANNELS.map((c, i) => (
              <div className={`hm-ch${levels[i]! > 0.04 ? " is-hot" : ""}`} key={c.mood}>
                <span className="hm-ch-icon">
                  <Icon d={c.icon} />
                </span>
                <div className="hm-strip">
                  <div className="hm-meter" aria-hidden="true">
                    <div
                      className="hm-meter-off"
                      ref={(el) => {
                        meters.current[i] = el;
                      }}
                      style={{ transform: `scaleY(${1 - levels[i]!})` }}
                    />
                  </div>
                  <div
                    className="hm-fader"
                    role="slider"
                    tabIndex={0}
                    aria-label={`${c.label} fader`}
                    aria-orientation="vertical"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(levels[i]! * 100)}
                    aria-valuetext={`${c.label} ${Math.round(levels[i]! * 100)}%`}
                    onPointerDown={faderDown(i)}
                    onPointerMove={faderMove(i)}
                    onPointerUp={faderUp}
                    onPointerCancel={faderUp}
                    onKeyDown={faderKey(i)}
                  >
                    <span className="hm-slot" aria-hidden="true" />
                    <div
                      className="hm-rider"
                      ref={(el) => {
                        riders.current[i] = el;
                      }}
                      style={{ transform: `translateY(${(1 - levels[i]!) * 100}%)` }}
                    >
                      <div className="hm-cap" />
                    </div>
                  </div>
                </div>
                <span className="hm-ch-label">{c.label}</span>
                <span className="hm-ch-val" aria-hidden="true">
                  {String(Math.round(levels[i]! * 100)).padStart(3, "0")}
                </span>
              </div>
            ))}
          </div>

          <div className="hm-master" aria-hidden="true">
            <div className="hm-master-meters">
              {[0, 1].map((i) => (
                <div className="hm-meter hm-meter-big" key={i}>
                  <div
                    className="hm-meter-off"
                    ref={(el) => {
                      masters.current[i] = el;
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="hm-readout">
              <span>BPM</span>
              <b>{bpm}</b>
              <span>Runtime</span>
              <b>{main.nights}:00</b>
              <span>From</span>
              <b className="hm-readout-price">{rand(main.price)}</b>
            </div>
          </div>

          <div className="hm-xfade">
            <span className="hm-x-end">
              A <span ref={pctA}>050</span>
            </span>
            <div
              className="hm-x"
              role="slider"
              tabIndex={0}
              aria-label={`Crossfader between deck A, ${TRIPS[decks[0]!]!.name}, and deck B, ${TRIPS[decks[1]!]!.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={xNow}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                xDrag.current = true;
                xAt(e);
              }}
              onPointerMove={(e) => {
                if (xDrag.current) xAt(e);
              }}
              onPointerUp={() => {
                xDrag.current = false;
              }}
              onPointerCancel={() => {
                xDrag.current = false;
              }}
              onKeyDown={xKey}
            >
              <span className="hm-x-slot" aria-hidden="true" />
              <div className="hm-x-rider" ref={xKnob} style={{ transform: "translateX(50%)" }}>
                <div className="hm-cap hm-cap-x" />
              </div>
            </div>
            <span className="hm-x-end">
              B <span ref={pctB}>050</span>
            </span>
          </div>

          <div className="hm-actions">
            <BeatButton on={beatOn} onToggle={toggleBeat} />
            <button type="button" className="hm-drop" onClick={() => onDrop(mainIdx, otherIdx)}>
              <span className="hm-drop-glow" ref={dropGlow} aria-hidden="true" />
              <span className="hm-drop-text">Drop the track</span>
            </button>
          </div>
        </div>

        <Jog
          side="B"
          trip={TRIPS[decks[1]!]!}
          platter={jogB}
          live={xSide === 1}
          onDown={jogDown(1)}
          onMove={jogMove}
          onUp={jogUp}
        />
      </div>

      {dropping && !reduced && (
        <div className="hm-count" aria-hidden="true">
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>
      )}
    </section>
  );
}

function Jog({
  side,
  trip,
  platter,
  live,
  onDown,
  onMove,
  onUp,
}: {
  side: string;
  trip: ConceptTrip;
  platter: RefObject<HTMLDivElement | null>;
  live: boolean;
  onDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onUp: () => void;
}) {
  return (
    <div className={`hm-jogbox${live ? " is-live" : ""}`}>
      <p className="hm-jog-label">
        <b>Deck {side}</b> <span>{trip.name.split(" & ")[0]}</span>
      </p>
      <div
        className="hm-jog"
        aria-hidden="true"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="hm-platter" ref={platter}>
          <img src={trip.poster} alt="" draggable={false} />
          <span className="hm-jog-mark" />
        </div>
        <span className="hm-jog-hub" />
      </div>
    </div>
  );
}

type Dropped = { a: number; b: number; levels: number[]; flip: boolean };

function Track({
  result,
  setResult,
  onRemix,
  beatOn,
  toggleBeat,
}: {
  result: Dropped;
  setResult: (r: Dropped) => void;
  onRemix: () => void;
  beatOn: boolean;
  toggleBeat: () => void;
}) {
  const trip = TRIPS[result.flip ? result.b : result.a]!;
  const bSide = TRIPS[result.flip ? result.a : result.b]!;
  const { title, version } = trackName(trip, result.levels);
  const times = trackTimes(trip);
  const heading = useRef<HTMLHeadingElement>(null);
  const [shared, setShared] = useState("");

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [title]);

  const share = async () => {
    const code = result.levels.map((v) => Math.round(v * 100)).join("-");
    const url = `${window.location.origin}${window.location.pathname}#mix=${code}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${title} (${version})`,
          text: `My holiday, mixed: ${title}.`,
          url,
        });
        setShared("Shared.");
      } else {
        await navigator.clipboard.writeText(url);
        setShared("Link copied. It opens the desk on your mix.");
      }
    } catch {
      setShared(url);
    }
  };

  return (
    <section className="hm-track" aria-label="Your track">
      <div className="hm-track-hero">
        <Clip src={trip.video} poster={trip.poster} className="hm-clip" />
        <div className="hm-track-shade" aria-hidden="true" />
        <div className="hm-track-head">
          <p className="hm-chip">
            <span className="hm-chip-led" aria-hidden="true" />
            Mixed by you, pressed by {BRAND.name}
          </p>
          <h2 ref={heading} tabIndex={-1} className="hm-title" key={title}>
            <span className="hm-sr">{title}</span>
            <span aria-hidden="true">
              {title.split(" ").map((word, w) => (
                <span className="hm-word" key={w}>
                  {[...word].map((ch, i) => (
                    <span
                      className="hm-slam"
                      style={{ animationDelay: `${(w * 4 + i) * 45}ms` }}
                      key={i}
                    >
                      {ch}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </h2>
          <p className="hm-version">({version})</p>
        </div>
      </div>

      <div className="hm-sleeve">
        <div className="hm-side">
          <dl className="hm-specs">
            <div>
              <dt>Where</dt>
              <dd>{trip.name}</dd>
            </div>
            <div>
              <dt>Runtime</dt>
              <dd>{trip.nights}:00</dd>
            </div>
            <div>
              <dt>Nights</dt>
              <dd>{trip.nights}</dd>
            </div>
            <div>
              <dt>BPM</dt>
              <dd>{bpmOf(result.levels)}</dd>
            </div>
            <div>
              <dt>Flight</dt>
              <dd>{trip.flight}</dd>
            </div>
          </dl>
          <div className="hm-print" aria-label="Your mix">
            {CHANNELS.map((c, i) => (
              <div key={c.mood}>
                <span className="hm-print-bar">
                  <span style={{ transform: `scaleY(${Math.max(0.02, result.levels[i]!)})` }} />
                </span>
                <span className="hm-print-label">{c.label}</span>
                <span className="hm-sr">{Math.round(result.levels[i]! * 100)}%</span>
              </div>
            ))}
          </div>
          <h3 className="hm-tl-head">
            Tracklist <small>one minute of runtime per night</small>
          </h3>
          <ol className="hm-tracklist" key={trip.slug}>
            {trip.days.map(([name, text], i) => (
              <li key={name} style={{ animationDelay: `${0.5 + i * 0.11}s` }}>
                <span className="hm-tl-n">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <b>{name}</b>
                  <p>{text}</p>
                </div>
                <span className="hm-tl-t">{times[i]!}</span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="hm-press">
          <p className="hm-press-label">Sample price, per person sharing</p>
          <p className="hm-price" key={trip.price}>
            {rand(trip.price)}
          </p>
          <p className="hm-press-note">
            {trip.nights} nights in {trip.name}. Your real price comes back from {BRAND.name}, for
            your dates.
          </p>
          <QuoteForm
            key={trip.slug}
            summary={`${title} (${version}): ${trip.nights} nights in ${trip.name}`}
            classes={{
              form: "hm-form",
              field: "hm-field",
              label: "hm-field-label",
              input: "hm-input",
              button: "hm-submit",
              done: "hm-done",
              note: "hm-done-note",
            }}
          />
          <div className="hm-press-actions">
            <button
              type="button"
              className="hm-btn"
              onClick={() => setResult({ ...result, flip: !result.flip })}
            >
              Flip to the B-side: {bSide.name}
            </button>
            <button type="button" className="hm-btn" onClick={onRemix}>
              Back to the desk to remix
            </button>
            <button type="button" className="hm-btn" onClick={() => void share()}>
              Send my mix to a friend
            </button>
            <BeatButton on={beatOn} onToggle={toggleBeat} />
          </div>
          <p className="hm-shared" role="status">
            {shared}
          </p>
        </aside>
      </div>
    </section>
  );
}

function Crate({ onLoad }: { onLoad: (slug: string) => void }) {
  return (
    <section className="hm-crate" id="hm-crate" aria-labelledby="hm-crate-head">
      <div className="hm-ticker" aria-hidden="true">
        <div>
          {[0, 1, 2, 3].map((k) => (
            <span key={k}>The crate / Six trips / Load one, the faders move themselves / </span>
          ))}
        </div>
      </div>
      <div className="hm-crate-top">
        <h2 id="hm-crate-head">The crate</h2>
        <p>
          Everything on {BRAND.name}'s shelf. Load a trip and the faders move by themselves. Sample
          prices, per person sharing.
        </p>
      </div>
      <ol className="hm-rows">
        {TRIPS.map((t, i) => (
          <li key={t.slug}>
            <button
              type="button"
              className="hm-row"
              onClick={() => onLoad(t.slug)}
              aria-label={`Load ${t.name} onto the desk: ${t.nights} nights, sample price ${rand(t.price)} per person sharing`}
            >
              <span className="hm-row-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="hm-row-disc" aria-hidden="true">
                <img src={t.poster} alt="" loading="lazy" />
              </span>
              <span className="hm-row-name">{t.name}</span>
              <span className="hm-row-blurb">{BLURB[t.slug]!}</span>
              <span className="hm-row-time">{t.nights}:00</span>
              <span className="hm-row-price">{rand(t.price)}</span>
              <span className="hm-row-load">Load</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Requests() {
  return (
    <section className="hm-requests" id="hm-requests" aria-labelledby="hm-req-head">
      <h2 id="hm-req-head">The request line is open.</h2>
      <p>
        Can't quite hear it on the desk? Tell {BRAND.name} what you're after and we'll mix it for
        you.
      </p>
      <ul>
        <li>
          <a href={`tel:${contact.phoneE164}`}>
            <span>Call</span>
            {contact.phoneDisplay}
          </a>
        </li>
        <li>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer">
            <span>WhatsApp</span>
            {contact.phoneDisplay}
          </a>
        </li>
        <li>
          <a href={`mailto:${contact.email}`}>
            <span>Email</span>
            {contact.email}
          </a>
        </li>
      </ul>
      <p className="hm-small">
        {BRAND.name}. Design sample: prices are examples and nothing on this page is sent anywhere.
      </p>
    </section>
  );
}

export function Concept() {
  const [levels, setLevels] = useState<number[]>(START);
  const [manual, setManual] = useState<number | null>(null);
  const [phase, setPhase] = useState<"mix" | "drop" | "track">("mix");
  const [result, setResult] = useState<Dropped | null>(null);
  const [beatOn, setBeatOn] = useState(false);
  const [motorUp, setMotorUp] = useState(true);
  const reduced = useReducedMotion();

  const beat = useRef<Beat | null>(null);
  const levelsRef = useRef(levels);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    levelsRef.current = levels;
  }, [levels]);

  // A shared link opens the desk on the friend's mix.
  useEffect(() => {
    const m = /^#mix=(\d+)-(\d+)-(\d+)-(\d+)-(\d+)$/.exec(window.location.hash);
    if (m) setLevels(m.slice(1).map((x) => clamp(Number(x) / 100)));
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      beat.current?.stop();
      beat.current = null;
    },
    [],
  );

  const setLevel = useCallback((i: number, v: number) => {
    setManual(null);
    setLevels((prev) => prev.map((x, k) => (k === i ? v : x)));
  }, []);

  const toggleBeat = () => {
    if (beat.current) {
      beat.current.stop();
      beat.current = null;
      setBeatOn(false);
    } else {
      beat.current = startBeat(
        () => levelsRef.current,
        () => bpmOf(levelsRef.current),
      );
      setBeatOn(Boolean(beat.current));
    }
  };

  const drop = (a: number, b: number) => {
    if (sum(levels) < SILENT) {
      document.querySelector<HTMLElement>(".c-holiday-mix .hm-fader")?.focus();
      return;
    }
    setResult({ a, b, levels, flip: false });
    const land = () => {
      beat.current?.hit();
      setPhase("track");
      window.scrollTo({ top: 0 });
    };
    if (reduced) {
      land();
      return;
    }
    beat.current?.riser();
    setPhase("drop");
    timer.current = window.setTimeout(land, 1400);
  };

  const back = () => {
    setMotorUp(false);
    setPhase("mix");
    window.scrollTo({ top: 0 });
  };

  const load = (slug: string) => {
    setMotorUp(false);
    setManual(null);
    setLevels(LOAD[slug]!);
    setPhase("mix");
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <main className="c-holiday-mix">
      <header className="hm-top">
        <a
          className="hm-brand"
          href="/concepts/holiday-mix"
          onClick={(e) => {
            e.preventDefault();
            if (phase === "track") back();
            else window.scrollTo({ top: 0 });
          }}
        >
          <span className="hm-brand-name">{BRAND.name}</span>
          <span className="hm-brand-model">HM-6 Holiday Mixer</span>
        </a>
        <nav className="hm-links" aria-label="On this page">
          <a href="#hm-crate">The crate</a>
          <a href="#hm-requests">Requests</a>
          <a className="hm-tel" href={`tel:${contact.phoneE164}`}>
            {contact.phoneDisplay}
          </a>
        </nav>
      </header>

      {phase === "track" && result ? (
        <Track
          result={result}
          setResult={setResult}
          onRemix={back}
          beatOn={beatOn}
          toggleBeat={toggleBeat}
        />
      ) : (
        <Desk
          levels={levels}
          setLevel={setLevel}
          manual={manual}
          setManual={setManual}
          motorUp={motorUp}
          dropping={phase === "drop"}
          beatOn={beatOn}
          toggleBeat={toggleBeat}
          beat={beat}
          onDrop={drop}
        />
      )}

      <Crate onLoad={load} />
      <Requests />
    </main>
  );
}
