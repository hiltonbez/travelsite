// Pack Your Bag: an open suitcase on a linen bed, seen from above. Sixteen things are thrown into it with real physics
// (physics.ts); what's in the case decides the trip, shown live on the luggage tag and through the plane window in the
// lid. Dragging the zip shut stamps the result. Tapping an item, or pressing Enter on it, packs it without throwing.
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as RPE,
} from "react";
import {
  BRAND,
  Clip,
  contact,
  EXTRA_CLIPS,
  QuoteForm,
  rand,
  TRIPS,
  bestTrip,
  useReducedMotion,
  type ConceptTrip,
  type Mood,
} from "@/concepts/kit";
import { ITEM, ITEMS, type Item } from "./items";
import {
  advance,
  GRAVITY,
  lob,
  makeBody,
  sizeBody,
  type Body,
  type Rect,
  type World,
} from "./physics";
import { sound } from "./sound";

export const FONTS =
  "family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,900;1,9..144,400;1,9..144,600&family=Special+Elite&family=Covered+By+Your+Grace";

type Layout = {
  W: number;
  H: number;
  portrait: boolean;
  s: number;
  lid: Rect;
  shell: Rect;
  base: Rect;
  whole: Rect;
  zip: Rect;
  head: number;
  homes: [number, number][];
};

/** Where things sit on the bed. The order is mixed by hand so no side of the bed gets all the beach things. */
const SPREAD = [0, 7, 3, 12, 5, 9, 14, 1, 10, 4, 15, 2, 8, 13, 6, 11];
const TILT = [-0.4, 0.5, 0.2, -0.7, 0.9, -0.2, 0.3, -1, 0.6, -0.5, 0.1, 0.8, -0.3, 0.4, -0.8, 0.7];
const JITTER: [number, number][] = [
  [6, -8],
  [-10, 6],
  [8, 10],
  [-6, -4],
  [12, 2],
  [-4, 12],
  [2, -10],
  [-12, -6],
];
/** These arrays are all fixed and the same length as ITEMS, so an index is always there. */
const nth = <T,>(list: readonly T[], i: number) => list[i] as T;

function layoutFor(W: number, H: number): Layout {
  // The same test as the media queries in style.css, so the prerendered page and the game agree.
  const portrait = window.matchMedia("(max-width: 859px)").matches;
  const homes: [number, number][] = [];
  if (portrait) {
    const head = 112;
    const caseW = Math.min(W - 20, 640);
    const lidH = Math.round(caseW * 0.36);
    const baseH = Math.round(caseW * 0.62);
    const zipH = 58;
    const rem = Math.max(160, H - head - lidH - baseH - zipH - 40);
    const x = (W - caseW) / 2;
    const y = head + rem * 0.5;
    const lid = { x, y, w: caseW, h: lidH };
    const shell = { x, y: y + lidH, w: caseW, h: baseH };
    const zip = { x, y: y + lidH + baseH, w: caseW, h: zipH };
    const s = Math.min(0.95, Math.max(0.56, W / 640));
    const band = (top: number, height: number) => {
      const out: [number, number][] = [];
      for (let r = 0; r < 2; r++)
        for (let c = 0; c < 4; c++) {
          out.push([((c + 0.5 + (r % 2 ? 0.12 : -0.12)) * W) / 4, top + ((r + 0.5) * height) / 2]);
        }
      return out;
    };
    homes.push(
      ...band(head - 4, rem * 0.5 + 2),
      ...band(zip.y + zipH + 2, Math.max(120, H - zip.y - zipH - 40)),
    );
    return finish({ W, H, portrait, s, lid, shell, zip, head, homes });
  }
  const head = 88;
  const zipH = 60;
  let caseW = Math.max(540, Math.min(860, W * 0.54));
  const caseH = Math.max(320, Math.min(520, H - head - zipH - 44));
  caseW = Math.min(caseW, caseH * 1.85);
  const half = Math.round(caseW / 2);
  const x = (W - half * 2) / 2;
  const y = head + Math.max(0, (H - head - caseH - zipH - 26) / 2);
  const lid = { x, y, w: half, h: caseH };
  const shell = { x: x + half, y, w: half, h: caseH };
  const zip = { x, y: y + caseH, w: half * 2, h: zipH };
  const s = Math.min(1, Math.max(0.64, Math.min(x / 300, (H - 90) / 470)));
  const rows = 4;
  const side = (x0: number, width: number, floor: number) => {
    const out: [number, number][] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < 2; c++) {
        out.push([
          x0 + ((c + 0.5 + (r % 2 ? 0.08 : -0.08)) * width) / 2,
          92 + ((r + 0.5) * (H - floor)) / rows,
        ]);
      }
    return out;
  };
  // The left side stops short so nothing starts under the gallery's pill.
  homes.push(...side(4, x - 14, 178), ...side(x + half * 2 + 10, W - x - half * 2 - 14, 130));
  return finish({ W, H, portrait, s, lid, shell, zip, head, homes });
}

function finish(l: Omit<Layout, "base" | "whole">): Layout {
  const rim = l.portrait ? 9 : 12;
  const base = {
    x: l.shell.x + rim,
    y: l.shell.y + rim,
    w: l.shell.w - rim * 2,
    h: l.shell.h - rim * 2,
  };
  const left = Math.min(l.lid.x, l.shell.x);
  const top = l.lid.y;
  const right = l.shell.x + l.shell.w;
  const whole = { x: left, y: top, w: right - left, h: l.zip.y + l.zip.h - top };
  const homes = SPREAD.map((i, n) => {
    const [jx, jy] = nth(JITTER, n % JITTER.length);
    const [hx, hy] = nth(l.homes, i);
    return [hx + jx * l.s, hy + jy * l.s] as [number, number];
  });
  return { ...l, base, whole, homes };
}

const MOOD_WORDS: Record<Mood, string> = {
  beach: "salt water",
  adventure: "getting muddy",
  luxury: "being spoilt",
  culture: "poking around old streets",
  wildlife: "large animals",
  romance: "someone special",
  family: "keeping the kids happy",
  food: "long lunches",
};

function weightsOf(ids: string[]) {
  const w: Partial<Record<Mood, number>> = {};
  for (const id of ids)
    for (const [m, v] of Object.entries(ITEM(id).moods))
      w[m as Mood] = (w[m as Mood] ?? 0) + (v ?? 0);
  return w;
}

const fit = (item: Item, t: ConceptTrip) => {
  let s = 0,
    total = 0;
  for (const [m, v] of Object.entries(item.moods)) {
    s += t.moods[m as Mood] * (v ?? 0);
    total += v ?? 0;
  }
  return total ? s / total : 0;
};

/** What we'd add to a bag bound for this trip: the items that suit it best and aren't in the bag yet. */
const goodFor = (t: ConceptTrip, not: string[], n: number) =>
  ITEMS.filter((i) => !not.includes(i.id))
    .sort((a, b) => fit(b, t) - fit(a, t))
    .slice(0, n);

const shortName = (t: ConceptTrip) => (t.name.split(" &")[0] ?? t.name).toUpperCase();

function Letters({ text, className }: { text: string; className?: string }) {
  let i = 0;
  return (
    <span className={className}>
      <span className="pyb-sr">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, w) => (
          <span className="pyb-word" key={w}>
            {word.split("").map((ch, c) => (
              <span className="pyb-ch" key={c} style={{ "--i": i++ } as React.CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}

function Stamp({
  id,
  top,
  middle,
  bottom,
  className,
}: {
  id: string;
  top: string;
  middle: string;
  bottom: string;
  className?: string;
}) {
  const size = middle.length > 10 ? 25 : middle.length > 7 ? 30 : 36;
  return (
    <svg className={`pyb-stamp ${className ?? ""}`} viewBox="0 0 220 220" aria-hidden="true">
      <defs>
        <path id={`${id}-t`} d="M28 110 a82 82 0 0 1 164 0" />
        <path id={`${id}-b`} d="M18 110 a92 92 0 0 0 184 0" />
      </defs>
      <circle cx="110" cy="110" r="104" fill="none" stroke="currentColor" strokeWidth="6" />
      <circle cx="110" cy="110" r="66" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text
        fontFamily="'Special Elite', monospace"
        fontSize="21"
        fill="currentColor"
        letterSpacing="3"
        textAnchor="middle"
      >
        <textPath href={`#${id}-t`} startOffset="50%">
          {top}
        </textPath>
      </text>
      <text
        fontFamily="'Special Elite', monospace"
        fontSize="19"
        fill="currentColor"
        letterSpacing="3"
        textAnchor="middle"
      >
        <textPath href={`#${id}-b`} startOffset="50%">
          {bottom}
        </textPath>
      </text>
      <rect x="-6" y="88" width="232" height="44" fill="var(--pyb-paper, #efe3c9)" opacity="0" />
      <text
        x="110"
        y={110 + size * 0.34}
        fontFamily="Fraunces, Georgia, serif"
        fontWeight="900"
        fontSize={size}
        fill="currentColor"
        textAnchor="middle"
      >
        {middle}
      </text>
    </svg>
  );
}

/** Keep getting the pointer even if it leaves the thing. Harmless if the pointer has already gone. */
function capture(e: RPE<HTMLButtonElement>) {
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    /* the drag still works while the pointer stays on it */
  }
}

type ItemRefs = {
  el: HTMLElement | null;
  shadow: HTMLElement | null;
  cap: HTMLElement | null;
  order: number;
  drawn: boolean;
};

const ItemsLayer = memo(function ItemsLayer({
  packed,
  shut,
  register,
  onDown,
  onMove,
  onUp,
  onTap,
}: {
  packed: string[];
  shut: boolean;
  register: (id: string, part: "el" | "shadow" | "cap", el: HTMLElement | null) => void;
  onDown: (id: string, e: RPE<HTMLButtonElement>) => void;
  onMove: (id: string, e: RPE<HTMLButtonElement>) => void;
  onUp: (id: string, e: RPE<HTMLButtonElement>) => void;
  onTap: (id: string) => void;
}) {
  return (
    <div className="pyb-items">
      {ITEMS.map((it) => {
        const isIn = packed.includes(it.id);
        const box = { width: it.w, height: it.h, marginLeft: -it.w / 2, marginTop: -it.h / 2 };
        return (
          <div key={it.id} className={isIn ? "pyb-thing is-in" : "pyb-thing"}>
            <div
              className="pyb-shadow"
              style={box}
              ref={(el) => register(it.id, "shadow", el)}
              aria-hidden="true"
            >
              <svg viewBox={`0 0 ${it.w} ${it.h}`} width={it.w} height={it.h}>
                {it.art}
              </svg>
            </div>
            <button
              type="button"
              className="pyb-item"
              style={box}
              ref={(el) => register(it.id, "el", el)}
              disabled={shut}
              aria-pressed={isIn}
              aria-label={
                isIn
                  ? `${it.label}, packed. Press to take it out.`
                  : `${it.label}. Press to pack it.`
              }
              onPointerDown={(e) => onDown(it.id, e)}
              onPointerMove={(e) => onMove(it.id, e)}
              onPointerUp={(e) => onUp(it.id, e)}
              onPointerCancel={(e) => onUp(it.id, e)}
              onClick={() => onTap(it.id)}
            >
              <svg viewBox={`0 0 ${it.w} ${it.h}`} width={it.w} height={it.h} aria-hidden="true">
                {it.art}
              </svg>
            </button>
            <span className="pyb-cap" ref={(el) => register(it.id, "cap", el)} aria-hidden="true">
              {it.label}
            </span>
          </div>
        );
      })}
    </div>
  );
});

/** A throw whose path crosses the open case comes down in it, rather than sailing over: forgiving, not a free pass. */
function aimForCase(b: Body, w: World | null) {
  if (!w || b.inside) return;
  const t = (b.vz + Math.sqrt(b.vz * b.vz + 2 * GRAVITY * b.z)) / GRAVITY;
  const r = w.base;
  const m = 18;
  let hit = -1;
  for (let i = 24; i >= 1; i--) {
    const k = i / 24;
    const x = b.x + b.vx * t * k,
      y = b.y + b.vy * t * k;
    if (x > r.x + m && x < r.x + r.w - m && y > r.y + m && y < r.y + r.h - m) {
      hit = k;
      break;
    }
  }
  if (hit > 0 && hit < 1) {
    b.vx *= hit;
    b.vy *= hit;
  }
}

type Result = { trip: ConceptTrip; packed: string[]; ready: boolean };

export function Concept() {
  const reduced = useReducedMotion();
  const reducedRef = useRef(false);
  reducedRef.current = reduced;

  const stageRef = useRef<HTMLDivElement>(null);
  const worldEl = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const zipRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const puffs = useRef<HTMLDivElement>(null);
  const docketRef = useRef<HTMLElement>(null);

  const world = useRef<World | null>(null);
  const layoutRef = useRef<Layout | null>(null);
  const refs = useRef(new Map<string, ItemRefs>());
  const orderCount = useRef(20);
  const packedRef = useRef<string[]>([]);
  const phaseRef = useRef<"pack" | "zipping" | "shut">("pack");
  const timers = useRef<number[]>([]);
  const grab = useRef({ moved: false, x: 0, y: 0, dragged: false });
  const zipP = useRef(0);
  const zipDrag = useRef<{ off: number; moved: boolean; x: number; lastTooth: number } | null>(
    null,
  );
  const zipAnim = useRef(0);

  const [layout, setLayout] = useState<Layout | null>(null);
  const [packed, setPacked] = useState<string[]>([]);
  const [shut, setShut] = useState(false);
  const [stamped, setStamped] = useState(false);
  const [quip, setQuip] = useState("Throw things in the case. Or just tap them.");
  const [quipKey, setQuipKey] = useState(0);
  const [muted, setMuted] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const say = useCallback((text: string) => {
    setQuip(text);
    setQuipKey((k) => k + 1);
  }, []);

  const weights = useMemo(() => weightsOf(packed), [packed]);
  const leader = packed.length ? bestTrip(weights) : null;

  // The footage in the plane window follows the leading trip. Two clips at most, and only while they cross-fade.
  const wanted = leader ?? { slug: "coast", ...EXTRA_CLIPS.coast };
  const [clips, setClips] = useState([
    { slug: "coast", video: EXTRA_CLIPS.coast.video, poster: EXTRA_CLIPS.coast.poster },
  ]);
  useEffect(() => {
    setClips((c) =>
      nth(c, c.length - 1).slug === wanted.slug
        ? c
        : [nth(c, c.length - 1), { slug: wanted.slug, video: wanted.video, poster: wanted.poster }],
    );
    const t = window.setTimeout(() => setClips((c) => c.slice(-1)), 800);
    return () => window.clearTimeout(t);
  }, [wanted.slug, wanted.video, wanted.poster]);

  const applyTransforms = useCallback((all: boolean) => {
    const w = world.current;
    const l = layoutRef.current;
    if (!w || !l) return;
    for (const b of w.bodies) {
      const r = refs.current.get(b.id);
      if (!r?.el || !r.shadow || !r.cap) continue;
      if (b.asleep && r.drawn && !all) continue;
      r.drawn = b.asleep;
      const k = l.s * (1 + b.z / 420);
      r.el.style.transform = `translate3d(${b.x.toFixed(1)}px,${b.y.toFixed(1)}px,0) rotate(${b.a.toFixed(3)}rad) scale(${k.toFixed(3)})`;
      const lift = b.z;
      r.shadow.style.transform = `translate3d(${(b.x + 2.5 + lift * 0.5).toFixed(1)}px,${(b.y + 4 + lift * 0.75).toFixed(1)}px,0) rotate(${b.a.toFixed(3)}rad) scale(${(l.s * (1 + lift / 900)).toFixed(3)})`;
      r.shadow.style.opacity = String(Math.max(0.12, 0.34 - lift / 700));
      const reach = Math.abs(Math.cos(b.a)) * b.hh + Math.abs(Math.sin(b.a)) * b.hw;
      r.cap.style.transform = `translate3d(${b.x.toFixed(1)}px,${(b.y + reach + 3).toFixed(1)}px,0) translateX(-50%)`;
    }
  }, []);

  const putOnBed = useCallback((l: Layout, entrance: boolean) => {
    const w = world.current;
    if (!w) return;
    ITEMS.forEach((it, i) => {
      const b = nth(w.bodies, i);
      const [x, y] = nth(l.homes, i);
      b.x = x;
      b.y = y;
      b.a = nth(TILT, i);
      b.vx = 0;
      b.vy = 0;
      b.w = 0;
      b.held = false;
      b.inside = false;
      b.asleep = false;
      b.lobbed = false;
      b.z = entrance ? 240 + i * 42 : 0;
      b.vz = 0;
      b.above = entrance;
      if (entrance) b.w = nth(TILT, (i + 3) % TILT.length) * 7;
    });
  }, []);

  // Set up the world once, then run it for as long as the page is open. It idles when everything has come to rest.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => layoutFor(stage.clientWidth, stage.clientHeight);
    const first = measure();
    layoutRef.current = first;
    setLayout(first);
    const bodies: Body[] = ITEMS.map((it, i) =>
      makeBody(
        it.id,
        nth(first.homes, i)[0],
        nth(first.homes, i)[1],
        it.w * first.s * 0.92,
        it.h * first.s * 0.92,
        it.mass,
      ),
    );
    const w: World = {
      W: first.W,
      H: first.H,
      base: first.base,
      whole: first.whole,
      bodies,
      hits: [],
    };
    world.current = w;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    putOnBed(first, !still);

    const ro = new ResizeObserver(() => {
      const prev = layoutRef.current;
      if (!prev) return;
      const W = stage.clientWidth,
        H = stage.clientHeight;
      // A phone's address bar sliding away changes the height a little. Leave the bed alone for that.
      if (W === prev.W && Math.abs(H - prev.H) < 120) return;
      const next = layoutFor(W, H);
      for (let i = 0; i < ITEMS.length; i++) {
        const b = nth(w.bodies, i),
          it = nth(ITEMS, i);
        if (b.inside) {
          b.x = next.base.x + ((b.x - prev.base.x) / prev.base.w) * next.base.w;
          b.y = next.base.y + ((b.y - prev.base.y) / prev.base.h) * next.base.h;
        } else {
          [b.x, b.y] = nth(next.homes, i);
        }
        sizeBody(b, it.w * next.s * 0.92, it.h * next.s * 0.92);
        b.asleep = false;
      }
      w.W = W;
      w.H = H;
      w.base = next.base;
      w.whole = next.whole;
      layoutRef.current = next;
      setLayout(next);
    });
    ro.observe(stage);

    let raf = 0;
    let last = performance.now();
    const carry = { t: 0 };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (w.bodies.every((b) => b.asleep)) {
        applyTransforms(false);
        return;
      }
      advance(w, dt, carry);
      if (w.hits.length) {
        for (const h of w.hits) onHit(h);
        w.hits.length = 0;
        const now2 = w.bodies.filter((b) => b.inside).map((b) => b.id);
        const cur = packedRef.current;
        if (now2.length !== cur.length || now2.some((id) => !cur.includes(id))) {
          const next = [
            ...cur.filter((id) => now2.includes(id)),
            ...now2.filter((id) => !cur.includes(id)),
          ];
          packedRef.current = next;
          setPacked(next);
        }
      }
      applyTransforms(false);
    };
    const onHit = (h: World["hits"][number]) => {
      const r = refs.current.get(h.id);
      if (h.kind === "in") {
        if (phaseRef.current === "pack") sound.plop();
        if (h.power >= 200) {
          say(ITEM(h.id).quip);
          if (r?.el) {
            r.order = ++orderCount.current;
            r.el.style.zIndex = String(r.order);
            if (r.shadow) r.shadow.style.zIndex = String(r.order);
          }
        }
        if (!reducedRef.current)
          shellRef.current?.animate(
            [{ transform: "scale(1)" }, { transform: "scale(1.012)" }, { transform: "scale(1)" }],
            { duration: 170 },
          );
      } else if (h.kind === "out") {
        say(`Out goes the ${ITEM(h.id).label.replace(/^(the|a) /, "")}. Changed your mind?`);
      } else if (h.kind === "land") {
        sound.thud(h.power);
        if (h.power > 420) puff(h.x, h.y);
      } else if (h.kind === "wall" || h.kind === "bump") {
        sound.knock(h.power);
      } else if (h.kind === "hop") {
        sound.knock(240);
      }
    };
    const puff = (x: number, y: number) => {
      const host = puffs.current;
      if (!host || reducedRef.current) return;
      const p = host.children[Math.floor(Math.random() * host.children.length)] as HTMLElement;
      p.getAnimations().forEach((a) => a.cancel());
      p.animate(
        [
          { transform: `translate(${x}px,${y}px) scale(.25)`, opacity: 0.55 },
          { transform: `translate(${x}px,${y}px) scale(1.5)`, opacity: 0 },
        ],
        { duration: 420, easing: "cubic-bezier(.2,.7,.3,1)" },
      );
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [applyTransforms, putOnBed, say]);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(zipAnim.current);
    };
  }, []);

  const register = useCallback(
    (id: string, part: "el" | "shadow" | "cap", el: HTMLElement | null) => {
      let r = refs.current.get(id);
      if (!r) {
        r = { el: null, shadow: null, cap: null, order: 1, drawn: false };
        refs.current.set(id, r);
      }
      r[part] = el;
      r.drawn = false;
    },
    [],
  );

  const toTop = (id: string) => {
    const r = refs.current.get(id);
    if (!r?.el || !r.shadow) return;
    r.order = ++orderCount.current;
    r.el.style.zIndex = String(r.order);
    r.shadow.style.zIndex = String(r.order);
  };
  const toTopRef = useRef(toTop);
  toTopRef.current = toTop;

  const bodyOf = (id: string) => world.current?.bodies.find((b) => b.id === id);

  const onDown = useCallback((id: string, e: RPE<HTMLButtonElement>) => {
    if (phaseRef.current !== "pack") return;
    const b = bodyOf(id);
    const stage = stageRef.current;
    if (!b || !stage) return;
    capture(e);
    const rect = stage.getBoundingClientRect();
    const px = e.clientX - rect.left,
      py = e.clientY - rect.top;
    const dx = px - b.x,
      dy = py - b.y;
    const c = Math.cos(-b.a),
      s = Math.sin(-b.a);
    b.rx = dx * c - dy * s;
    b.ry = dx * s + dy * c;
    b.tx = px;
    b.ty = py;
    b.held = true;
    b.asleep = false;
    grab.current = { moved: false, x: e.clientX, y: e.clientY, dragged: false };
    toTopRef.current(id);
    refs.current.get(id)?.cap?.classList.add("is-held");
  }, []);

  const onMove = useCallback((id: string, e: RPE<HTMLButtonElement>) => {
    const b = bodyOf(id);
    const stage = stageRef.current;
    if (!b?.held || !stage) return;
    const rect = stage.getBoundingClientRect();
    b.tx = e.clientX - rect.left;
    b.ty = e.clientY - rect.top;
    if (Math.hypot(e.clientX - grab.current.x, e.clientY - grab.current.y) > 7)
      grab.current.moved = true;
  }, []);

  const onUp = useCallback((id: string) => {
    const b = bodyOf(id);
    refs.current.get(id)?.cap?.classList.remove("is-held");
    if (!b?.held) return;
    b.held = false;
    grab.current.dragged = grab.current.moved;
    const speed = Math.hypot(b.vx, b.vy);
    if (grab.current.moved && speed > 70) {
      b.vz = Math.min(470, Math.max(90, speed * 0.2));
      aimForCase(b, world.current);
    } else if (!grab.current.moved) {
      b.vx = 0;
      b.vy = 0;
      b.w = 0;
    }
  }, []);

  /** A tap or the Enter key: a neat lob into the emptiest part of the case, or back onto the bed. */
  const onTap = useCallback((id: string) => {
    if (grab.current.dragged) {
      grab.current.dragged = false;
      return;
    }
    if (phaseRef.current !== "pack") return;
    const w = world.current;
    const l = layoutRef.current;
    const b = bodyOf(id);
    if (!w || !l || !b) return;
    toTopRef.current(id);
    let tx: number, ty: number;
    if (b.inside) {
      const i = ITEMS.findIndex((it) => it.id === id);
      [tx, ty] = nth(l.homes, i);
    } else {
      let best = -1;
      tx = l.base.x + l.base.w / 2;
      ty = l.base.y + l.base.h / 2;
      // Things still in the air count at the spot they're heading for, so quick taps spread out.
      const others = w.bodies
        .filter((o) => (o.inside || o.lobbed) && o !== b)
        .map((o) => (o.lobbed ? { x: o.tx, y: o.ty } : { x: o.x, y: o.y }));
      for (let c = 0; c < 5; c++)
        for (let r = 0; r < 4; r++) {
          const x = l.base.x + ((c + 0.5) / 5) * l.base.w;
          const y = l.base.y + ((r + 0.5) / 4) * l.base.h;
          const near =
            others.reduce((m, o) => Math.min(m, Math.hypot(o.x - x, o.y - y)), 1e4) +
            Math.random() * 18;
          if (near > best) {
            best = near;
            tx = x;
            ty = y;
          }
        }
    }
    if (reducedRef.current) {
      const goingIn = !b.inside;
      b.x = tx;
      b.y = ty;
      b.z = 0;
      b.vz = 0;
      b.vx = 0;
      b.vy = 0;
      b.w = 0;
      b.inside = goingIn;
      b.above = false;
      b.asleep = false;
      w.hits.push({ kind: goingIn ? "in" : "out", x: tx, y: ty, power: 200, id });
    } else {
      b.tx = tx;
      b.ty = ty;
      lob(b, tx, ty, (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 5));
    }
  }, []);

  /** Throw everything in the air and start over. */
  const reset = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    phaseRef.current = "pack";
    packedRef.current = [];
    setPacked([]);
    setShut(false);
    setStamped(false);
    setResult(null);
    zipP.current = 0;
    zipRef.current?.style.setProperty("--p", "0");
    say("Right, again. Throw things in the case.");
    const l = layoutRef.current;
    if (l) putOnBed(l, !reducedRef.current);
    stageRef.current?.scrollIntoView({
      behavior: reducedRef.current ? "auto" : "smooth",
      block: "start",
    });
  }, [putOnBed, say]);

  // --- The zip ---
  const setZip = (p: number) => {
    zipP.current = p;
    zipRef.current?.style.setProperty("--p", p.toFixed(4));
  };

  const shake = () => {
    const w = world.current;
    if (!w || reducedRef.current) return;
    for (const b of w.bodies) {
      if (!b.inside) continue;
      b.asleep = false;
      b.vx += (Math.random() - 0.5) * 70;
      b.vy += (Math.random() - 0.5) * 70;
      b.w += (Math.random() - 0.5) * 1.8;
    }
  };

  const finishZip = useCallback(() => {
    if (phaseRef.current === "shut") return;
    phaseRef.current = "shut";
    setZip(1);
    const ids = packedRef.current;
    const trip = bestTrip(weightsOf(ids));
    const quick = reducedRef.current;
    setShut(true);
    say("Zipped. No more changes. Well, one or two.");
    const later = (ms: number, fn: () => void) =>
      timers.current.push(window.setTimeout(fn, quick ? Math.min(ms, 200) : ms));
    later(780, () => {
      sound.slam();
      if (!quick)
        worldEl.current?.animate(
          [
            { transform: "translate(0,0)" },
            { transform: "translate(0,5px)" },
            { transform: "translate(0,-2px)" },
            { transform: "translate(0,0)" },
          ],
          { duration: 240 },
        );
      if (navigator.vibrate) navigator.vibrate(24);
    });
    later(1120, () => {
      setStamped(true);
      sound.stamp();
    });
    later(2200, () => setResult({ trip, packed: ids, ready: false }));
  }, [say]);

  const zipBlocked = () => {
    if (packedRef.current.length) return false;
    say("Nothing in it yet. Very zen, but pack something first.");
    const p = zipRef.current?.querySelector(".pyb-pull");
    if (p && !reducedRef.current)
      p.animate(
        [
          { translate: "0 0" },
          { translate: "9px 0" },
          { translate: "-6px 0" },
          { translate: "3px 0" },
          { translate: "0 0" },
        ],
        { duration: 300 },
      );
    return true;
  };

  const animateZip = (to: number, ms: number, done?: () => void) => {
    cancelAnimationFrame(zipAnim.current);
    const from = zipP.current;
    const t0 = performance.now();
    let tooth = Math.floor(from * 40);
    const run = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      const eased = to > from ? k * k * (3 - 2 * k) : 1 - Math.pow(1 - k, 3) * Math.cos(k * 7);
      setZip(from + (to - from) * eased);
      const t = Math.floor(zipP.current * 40);
      if (t !== tooth && to > from) {
        tooth = t;
        sound.tooth();
        shake();
      }
      if (k < 1) zipAnim.current = requestAnimationFrame(run);
      else done?.();
    };
    zipAnim.current = requestAnimationFrame(run);
  };

  const zipDown = (e: RPE<HTMLButtonElement>) => {
    if (phaseRef.current !== "pack" || !trackRef.current) return;
    cancelAnimationFrame(zipAnim.current);
    capture(e);
    const r = trackRef.current.getBoundingClientRect();
    zipDrag.current = {
      off: e.clientX - (r.left + zipP.current * r.width),
      moved: false,
      x: e.clientX,
      lastTooth: Math.floor(zipP.current * 40),
    };
  };
  const zipMove = (e: RPE<HTMLButtonElement>) => {
    const d = zipDrag.current;
    if (!d || !trackRef.current) return;
    if (Math.abs(e.clientX - d.x) > 5) d.moved = true;
    if (!d.moved) return;
    if (!packedRef.current.length) {
      zipDrag.current = null;
      zipBlocked();
      return;
    }
    const r = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - d.off - r.left) / r.width));
    setZip(p);
    const t = Math.floor(p * 40);
    if (t !== d.lastTooth) {
      d.lastTooth = t;
      sound.tooth();
      shake();
      if (navigator.vibrate) navigator.vibrate(3);
    }
    if (p >= 0.975) {
      zipDrag.current = null;
      finishZip();
    }
  };
  const zipUp = () => {
    const d = zipDrag.current;
    zipDrag.current = null;
    if (!d || phaseRef.current !== "pack") return;
    if (d.moved) {
      // Let go early and the zip creeps back open, because of course it does.
      if (zipP.current > 0.86) animateZip(1, 180, finishZip);
      else animateZip(0, 520);
    }
    grab.current.dragged = d.moved;
  };
  const zipClick = () => {
    if (grab.current.dragged) {
      grab.current.dragged = false;
      return;
    }
    if (phaseRef.current !== "pack" || zipBlocked()) return;
    if (reducedRef.current) finishZip();
    else animateZip(1, 1100, finishZip);
  };

  useEffect(() => {
    if (!result) return;
    const el = docketRef.current;
    el?.scrollIntoView({ behavior: reducedRef.current ? "auto" : "smooth", block: "start" });
    el?.focus({ preventScroll: true });
  }, [result]);

  const openReady = (t: ConceptTrip) =>
    setResult({ trip: t, packed: goodFor(t, [], 5).map((i) => i.id), ready: true });

  const toggleSound = () => {
    setMuted((m) => {
      sound.set(m);
      return !m;
    });
  };

  const vars = layout
    ? ({
        "--lx": `${layout.lid.x}px`,
        "--ly": `${layout.lid.y}px`,
        "--lw": `${layout.lid.w}px`,
        "--lh": `${layout.lid.h}px`,
        "--sx": `${layout.shell.x}px`,
        "--sy": `${layout.shell.y}px`,
        "--sw": `${layout.shell.w}px`,
        "--sh": `${layout.shell.h}px`,
        "--zx": `${layout.zip.x}px`,
        "--zy": `${layout.zip.y}px`,
        "--zw": `${layout.zip.w}px`,
        "--zh": `${layout.zip.h}px`,
        "--s": layout.s,
      } as React.CSSProperties)
    : undefined;

  return (
    <main className={`c-pack-your-bag${layout?.portrait ? " is-portrait" : ""}`}>
      <section
        className="pyb-stage"
        ref={stageRef}
        aria-label="Pack your bag: a suitcase and sixteen things to put in it"
      >
        <div className="pyb-sun" aria-hidden="true">
          <svg viewBox="0 0 600 600" className="pyb-palm pyb-palm-a">
            {[...Array(9).keys()].map((i) => (
              <path
                key={i}
                d="M0 0 C70 -26 170 -28 300 12 C180 24 70 26 0 0Z"
                transform={`translate(70 70) rotate(${i * 12 - 8}) scale(${1 - (i % 3) * 0.1})`}
              />
            ))}
          </svg>
          <svg viewBox="0 0 600 600" className="pyb-palm pyb-palm-b">
            {[...Array(7).keys()].map((i) => (
              <path
                key={i}
                d="M0 0 C70 -26 170 -28 300 12 C180 24 70 26 0 0Z"
                transform={`translate(520 530) rotate(${180 + i * 14}) scale(${1 - (i % 3) * 0.12})`}
              />
            ))}
          </svg>
        </div>

        <header className="pyb-head">
          <a className="pyb-brand" href="#pyb-return">
            <span>{BRAND.name}</span>
          </a>
          <div className="pyb-title">
            <h1>
              <Letters text="Pack your bag." />
            </h1>
            <p className="pyb-quip" key={quipKey} role="status">
              {quip}
            </p>
          </div>
          <div className="pyb-tools">
            <a href="#pyb-rail" className="pyb-link">
              All six trips
            </a>
            <a href={`tel:${contact.phoneE164}`} className="pyb-link pyb-phone">
              {contact.phoneDisplay}
            </a>
            <button
              type="button"
              className="pyb-sound"
              onClick={toggleSound}
              aria-pressed={!muted}
              aria-label={muted ? "Turn sound on" : "Turn sound off"}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5Z" fill="currentColor" />
                {muted ? (
                  <path
                    d="M16 9.5l5 5m0-5l-5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </header>

        <div
          className={`pyb-world${layout ? " is-ready" : ""}${shut ? " is-shut" : ""}`}
          ref={worldEl}
          style={vars}
        >
          <div className="pyb-shell" ref={shellRef}>
            <div className="pyb-lining">
              <span className="pyb-strap pyb-strap-a">
                <i />
              </span>
              <span className="pyb-strap pyb-strap-b">
                <i />
              </span>
              {!packed.length && <span className="pyb-drop">in here</span>}
            </div>
            <i className="pyb-corner a" />
            <i className="pyb-corner b" />
            <i className="pyb-corner c" />
            <i className="pyb-corner d" />
          </div>

          <div className="pyb-lid">
            <div className="pyb-lid-in">
              <div className="pyb-lining pyb-lining-lid">
                <div className={`pyb-window${packed.length ? " is-open" : ""}`}>
                  <div className="pyb-glass">
                    {clips.map((c) => (
                      <Clip
                        key={c.slug}
                        src={c.video}
                        poster={c.poster}
                        className="pyb-footage"
                        paused={!!result || shut}
                      />
                    ))}
                    <div className="pyb-shade" aria-hidden="true">
                      <i />
                    </div>
                  </div>
                </div>

                <div className="pyb-tagwrap">
                  <svg className="pyb-string" viewBox="0 0 60 60" aria-hidden="true">
                    <path
                      d="M50 2 C40 10 30 16 24 28 C20 36 24 44 30 50"
                      fill="none"
                      stroke="#6b5233"
                      strokeWidth="1.6"
                    />
                  </svg>
                  <div className="pyb-tag" key={leader?.slug ?? "none"} aria-live="polite">
                    <i className="pyb-eyelet" />
                    <p className="pyb-tag-kicker">Looks like you&apos;re off to...</p>
                    {leader ? (
                      <>
                        <p
                          className="pyb-tag-name"
                          style={{
                            fontSize: `calc(var(--tagname) * ${leader.name.length > 20 ? 0.58 : leader.name.length > 11 ? 0.74 : leader.name.length > 8 ? 0.86 : 1})`,
                          }}
                        >
                          <Letters text={leader.name} />
                        </p>
                        <p className="pyb-tag-meta">
                          {leader.nights} nights. {leader.flight}.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="pyb-tag-name pyb-tag-none">nowhere yet</p>
                        <p className="pyb-tag-meta">Pack something and we&apos;ll see.</p>
                      </>
                    )}
                  </div>
                </div>
                <span className="pyb-woven">{BRAND.name}</span>
              </div>
              <i className="pyb-corner a" />
              <i className="pyb-corner b" />
              <i className="pyb-corner c" />
              <i className="pyb-corner d" />
            </div>
            <div className="pyb-lid-out" aria-hidden="true">
              <i className="pyb-outstrap a" />
              <i className="pyb-outstrap b" />
              <i className="pyb-handle" />
              <i className="pyb-corner a" />
              <i className="pyb-corner b" />
              <i className="pyb-corner c" />
              <i className="pyb-corner d" />
            </div>
          </div>

          <div className="pyb-puffs" ref={puffs} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>

          <ItemsLayer
            packed={packed}
            shut={shut}
            register={register}
            onDown={onDown}
            onMove={onMove}
            onUp={(id) => onUp(id)}
            onTap={onTap}
          />

          {stamped && leader && (
            <div className="pyb-casestamp">
              <Stamp
                id="pyb-s1"
                top="ZIPPED &amp; READY"
                middle={shortName(leader)}
                bottom={`${leader.nights} NIGHTS`}
              />
            </div>
          )}

          <div className="pyb-zip" ref={zipRef} style={{ "--p": 0 } as React.CSSProperties}>
            <div className="pyb-tape">
              <div className="pyb-track" ref={trackRef}>
                <div className="pyb-teeth pyb-teeth-open" />
                <div className="pyb-teeth pyb-teeth-shut" />
                {!shut && (
                  <span
                    className={`pyb-ziphint${packed.length ? " is-on" : ""}`}
                    aria-hidden="true"
                  >
                    {packed.length
                      ? `${packed.length} packed. Happy? Drag the zip shut`
                      : "Pack first. Then drag the zip shut"}
                  </span>
                )}
              </div>
              {shut ? (
                <button type="button" className="pyb-again" onClick={reset}>
                  Unzip it, I&apos;ve changed my mind
                </button>
              ) : (
                <button
                  type="button"
                  className={`pyb-pull${packed.length ? " is-ready" : ""}`}
                  aria-label={`Zip the case shut and see the trip. ${packed.length} packed.`}
                  onPointerDown={zipDown}
                  onPointerMove={zipMove}
                  onPointerUp={zipUp}
                  onPointerCancel={zipUp}
                  onClick={zipClick}
                >
                  <svg viewBox="0 0 44 64" width="44" height="64" aria-hidden="true">
                    <rect
                      x="10"
                      y="2"
                      width="24"
                      height="20"
                      rx="4"
                      fill="url(#pyb-brass)"
                      stroke="#6d4f18"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M18 20 h8 l4 34 a8 8 0 0 1 -16 0Z"
                      fill="url(#pyb-brass)"
                      stroke="#6d4f18"
                      strokeWidth="1.4"
                    />
                    <ellipse cx="22" cy="51" rx="3.2" ry="4.4" fill="#5e4314" />
                    <path d="M15 8 h14" stroke="#fff2c6" strokeWidth="1.6" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="pyb-brass" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#f2dd9e" />
                        <stop offset=".5" stopColor="#b98c35" />
                        <stop offset="1" stopColor="#ecd088" />
                      </linearGradient>
                    </defs>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {result && (
        <Docket
          key={`${result.trip.slug}-${result.ready}`}
          result={result}
          sectionRef={docketRef}
          onPick={(t) => setResult({ trip: t, packed: result.packed, ready: result.ready })}
          onReset={reset}
        />
      )}

      <section className="pyb-rail" id="pyb-rail" aria-labelledby="pyb-rail-h">
        <div className="pyb-rail-head">
          <h2 id="pyb-rail-h">Or skip the packing.</h2>
          <p>
            Six bags, already by the door. Pull a tag and we&apos;ll show you what&apos;s in it.
          </p>
        </div>
        <div className="pyb-tags">
          {TRIPS.map((t, i) => (
            <button
              type="button"
              key={t.slug}
              className="pyb-railtag"
              style={{ "--n": i } as React.CSSProperties}
              onClick={() => openReady(t)}
            >
              <i className="pyb-railstring" />
              <span className="pyb-railcard">
                <i className="pyb-eyelet" />
                <img src={t.photos[0]} alt="" loading="lazy" width="320" height="200" />
                <strong>{t.name}</strong>
                <em>{t.tagline}</em>
                <span className="pyb-railmeta">
                  {t.nights} nights / {rand(t.price)}
                </span>
              </span>
            </button>
          ))}
        </div>
        <p className="pyb-fine">
          Sample prices, per person sharing. Your agent will quote you the real one.
        </p>
      </section>

      <footer className="pyb-return" id="pyb-return">
        <div className="pyb-sewn">
          <p className="pyb-sewn-k">If found, please return to</p>
          <p className="pyb-sewn-n">{BRAND.name}</p>
          <p className="pyb-sewn-t">{BRAND.tagline}</p>
          <p className="pyb-sewn-c">
            <a href={`tel:${contact.phoneE164}`}>{contact.phoneDisplay}</a>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <a href={contact.whatsapp} rel="noreferrer">
              WhatsApp
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}

function Docket({
  result,
  sectionRef,
  onPick,
  onReset,
}: {
  result: Result;
  sectionRef: React.RefObject<HTMLElement | null>;
  onPick: (t: ConceptTrip) => void;
  onReset: () => void;
}) {
  const { trip, packed, ready } = result;
  const w = weightsOf(packed);
  const moods = (Object.entries(w) as [Mood, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([m]) => MOOD_WORDS[m]);
  const score = (t: ConceptTrip) =>
    (Object.entries(w) as [Mood, number][]).reduce((s, [m, v]) => s + t.moods[m] * v, 0);
  const next = nth(
    TRIPS.filter((t) => t.slug !== trip.slug).sort((a, b) => score(b) - score(a)),
    0,
  );
  const extras = goodFor(trip, packed, ready ? 2 : 3);

  return (
    <section
      className="pyb-docket"
      ref={sectionRef}
      tabIndex={-1}
      aria-label={`Your trip: ${trip.name}`}
    >
      <div className="pyb-hero">
        <div className="pyb-bigwindow">
          <Clip src={trip.video} poster={trip.poster} className="pyb-bigclip" />
          <i className="pyb-bigglare" />
        </div>
        <div className="pyb-hero-words">
          <p className="pyb-kick">
            {ready
              ? "This one's packed already. You're off to"
              : "Well, that settles it. You're off to"}
          </p>
          <h2 className={trip.name.length > 20 ? "is-long" : trip.name.length > 12 ? "is-mid" : ""}>
            <Letters text={trip.name} />
          </h2>
          <p className="pyb-tagline">{trip.tagline}</p>
        </div>
        <Stamp
          id="pyb-s2"
          className="pyb-heel"
          top="ZIPPED &amp; READY"
          middle={shortName(trip)}
          bottom={`${trip.nights} NIGHTS`}
        />
      </div>

      <div className="pyb-papers">
        <div className="pyb-price">
          <i className="pyb-eyelet" />
          <p className="pyb-price-n">{trip.nights} nights</p>
          <p className="pyb-price-r">{rand(trip.price)}</p>
          <p className="pyb-price-f">Sample price, per person sharing</p>
          <p className="pyb-price-m">
            {trip.region}. {trip.flight}.
          </p>
        </div>

        <div className="pyb-list">
          <h3>{ready ? "What we packed" : "What's in the bag"}</h3>
          {!ready && moods.length > 0 && (
            <p className="pyb-says">Your bag says you&apos;re after {moods.join(" and ")}.</p>
          )}
          <ul>
            {packed.map((id, i) => (
              <li key={id} style={{ "--n": i } as React.CSSProperties}>
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
                  <path
                    d="M3 11 L8 16 L17 4"
                    fill="none"
                    stroke="#b8452f"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {ITEM(id).list}
              </li>
            ))}
          </ul>
          {extras.length > 0 && (
            <>
              <h4>And we&apos;d throw in</h4>
              <ul className="pyb-extras">
                {extras.map((it) => (
                  <li key={it.id}>{it.list}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="pyb-itin">
          <h3>How the days go</h3>
          <p className="pyb-intro">{trip.intro}</p>
          <ol>
            {trip.days.map(([title, text], i) => (
              <li key={title}>
                <span className="pyb-dayn">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="pyb-snaps" aria-hidden="true">
            {trip.photos.slice(1).map((p, i) => (
              <img
                key={p}
                src={p}
                alt=""
                loading="lazy"
                width="220"
                height="160"
                className={i ? "b" : "a"}
              />
            ))}
          </div>
        </div>

        <div className="pyb-claim">
          <div className="pyb-claim-top">
            <span>Baggage label</span>
            <span aria-hidden="true" className="pyb-bars" />
          </div>
          <h3>Send this bag to {BRAND.name}</h3>
          <p className="pyb-claim-to">
            {trip.nights} nights, {trip.name}. {packed.length}{" "}
            {packed.length === 1 ? "thing" : "things"} in the bag. We&apos;ll come back with dates
            and a real price.
          </p>
          <QuoteForm
            summary={`${trip.nights} nights in ${trip.name}`}
            classes={{
              form: "pyb-form",
              field: "pyb-field",
              label: "pyb-flabel",
              input: "pyb-input",
              button: "pyb-send",
              done: "pyb-done",
              note: "pyb-note",
            }}
          />
        </div>
      </div>

      <div className="pyb-after">
        <p>Not feeling it?</p>
        <button type="button" onClick={() => onPick(next)}>
          {ready ? "Try" : "Your bag nearly went to"} {next.name}
        </button>
        <button type="button" onClick={onReset}>
          Tip it all out and start again
        </button>
      </div>
    </section>
  );
}
