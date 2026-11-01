// The flight: the sky outside, tied to the page's scroll. At the top of a page it is dawn; by the middle it is
// midday and at the bottom the sun sets. useSky writes the sky's colours and the scroll position into CSS variables
// on the layout (window-seat.css reads them), so the windows, the clouds and the page's wash all move together
// without React redrawing anything. The prerendered page shows dawn, and with reduced motion nothing drifts.
import type { CSSProperties, ReactNode, RefObject } from "react";
import { useOnScroll } from "@/designs/flight-path";
import { cn } from "@/lib/utils";

type Stop = { at: number; sky: [string, string, string]; sun: string; sunY: number; name: string };

/** The day, from take-off to landing: sky top, middle and horizon, the sun's colour and height in the window (%). */
const DAY: Stop[] = [
  { at: 0, sky: ["#7F8FD8", "#F4A99B", "#FFDDB0"], sun: "#FFD08A", sunY: 66, name: "Dawn" },
  { at: 0.28, sky: ["#6FA8E8", "#B9D6F0", "#FCE8CF"], sun: "#FFE6A8", sunY: 30, name: "Morning" },
  { at: 0.5, sky: ["#3F8EE0", "#86C1F0", "#DDF0FB"], sun: "#FFF6D6", sunY: 12, name: "Midday" },
  { at: 0.75, sky: ["#5A86C9", "#F2B783", "#FFD7A1"], sun: "#FFC069", sunY: 36, name: "Afternoon" },
  { at: 1, sky: ["#3A2C6B", "#C9577A", "#FFA766"], sun: "#FF7A45", sunY: 70, name: "Dusk" },
];

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function mix(a: string, b: string, t: number) {
  const x = rgb(a), y = rgb(b);
  return `rgb(${x.map((v, i) => Math.round(v + ((y[i] ?? v) - v) * t)).join(" ")})`;
}

/** The sky at `p` (0 = top of the page, 1 = the bottom). */
function skyAt(p: number) {
  const i = Math.max(0, DAY.findIndex((s) => s.at >= p) - 1);
  const a = DAY[i]!, b = DAY[Math.min(i + 1, DAY.length - 1)]!;
  const t = b.at === a.at ? 0 : Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at)));
  return {
    sky: [0, 1, 2].map((k) => mix(a.sky[k]!, b.sky[k]!, t)),
    sun: mix(a.sun, b.sun, t),
    sunY: a.sunY + (b.sunY - a.sunY) * t,
    name: t < 0.5 ? a.name : b.name,
  };
}

/** Local time on board, 05:50 at the top of the page to 19:20 at the bottom. */
const clock = (p: number) => {
  const m = Math.round(350 + p * 810);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** Cloud layers: how fast each drifts up the page as you scroll. */
const LAYERS = [0.1, 0.25, 0.5];

/** Moves the sky with the scroll. `root` is the layout element that carries the CSS variables. */
export function useSky(root: RefObject<HTMLElement | null>) {
  useOnScroll((y, reduced) => {
    const el = root.current;
    if (!el) return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, y / max));
    const s = skyAt(p);
    const set = (k: string, v: string) => el.style.setProperty(k, v);
    s.sky.forEach((c, i) => set(`--ws-sky-${i + 1}`, c));
    set("--ws-sun", s.sun);
    set("--ws-sun-y", `${s.sunY.toFixed(1)}%`);
    set("--ws-p", p.toFixed(4));
    set("--ws-y", reduced ? "0" : String(Math.round(y)));
    // Each cloud layer is drawn twice, one screen-and-a-bit apart, so it can wrap round for ever.
    const wrap = window.innerHeight * 1.2;
    LAYERS.forEach((f, i) => set(`--ws-c${i}`, reduced ? "0" : (-((y * f) % wrap)).toFixed(1)));
    // The in-flight screen: local time, height and distance to go.
    const wobble = reduced ? 0 : Math.sin(y / 260);
    el.querySelectorAll("[data-ws-clock]").forEach((n) => (n.textContent = `${clock(p)} · ${s.name}`));
    el.querySelectorAll("[data-ws-alt]").forEach((n) => (n.textContent = `${(11280 + Math.round(wobble * 40)).toLocaleString("en-ZA")} m`));
    el.querySelectorAll("[data-ws-speed]").forEach((n) => (n.textContent = `${862 + Math.round(wobble * 9)} km/h`));
    el.querySelectorAll("[data-ws-togo]").forEach((n) => (n.textContent = `${Math.round((1 - p) * 4120).toLocaleString("en-ZA")} km`));
  });
}

/** A puffy cloud. */
export function Puff({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 90" className={className} style={style}>
      <path fill="currentColor" d="M30 82c-16 0-27-10-27-23 0-12 10-22 23-23 2-17 17-29 34-27 8-12 22-19 38-17 19 3 33 18 34 36 4-2 9-3 14-3 19 0 34 14 34 31 0 15-12 26-28 26z" />
    </svg>
  );
}

/** Where the clouds sit on a screen of sky: left %, top %, width (px), opacity. */
const CLOUDS: [number, number, number, number][] = [
  [-6, 8, 260, 0.75], [62, 18, 200, 0.6], [24, 44, 320, 0.5], [78, 60, 240, 0.7], [4, 78, 180, 0.55], [48, 90, 280, 0.45],
];

/** The clouds the page drifts through, behind the content, in three layers that move at different speeds. */
export function SkyLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="ws-wash absolute inset-0" />
      {LAYERS.map((_, layer) => (
        <div key={layer} className="ws-cloud-layer absolute inset-x-0 top-0 h-[240vh]" style={{ "--ws-layer": `var(--ws-c${layer})` } as CSSProperties}>
          {[0, 1].map((copy) =>
            CLOUDS.filter((_, i) => i % 3 === layer).map(([left, top, w, o]) => (
              <Puff key={`${copy}-${left}-${top}`} className="absolute text-white"
                style={{ left: `${left}%`, top: `${copy * 50 + top / 2}%`, width: w * (0.7 + layer * 0.3), opacity: o * (0.55 + layer * 0.2), filter: layer === 0 ? "blur(2px)" : undefined }} />
            )),
          )}
        </div>
      ))}
    </div>
  );
}

/** Clouds drifting past inside a window, from right to left as the plane flies on. */
export function WindowClouds({ dense = false }: { dense?: boolean }) {
  const puffs: [number, number, number, number][] = [
    [12, 46, 26, -4], [30, 34, 34, -19], [52, 58, 22, -9], [68, 40, 30, -27],
    ...(dense ? ([[80, 70, 18, -13], [20, 64, 40, -31]] as [number, number, number, number][]) : []),
  ];
  return (
    <>
      {puffs.map(([top, width, secs, delay], i) => (
        <div key={i} className="ws-drift absolute left-0 w-full"
          style={{ top: `${top}%`, animationDuration: `${secs}s`, animationDelay: `${delay}s`, "--ws-x": `${((i * 37) % 70) - 10}%` } as CSSProperties}>
          <Puff className="text-white/85" style={{ width: `${width}%` }} />
        </div>
      ))}
    </>
  );
}

/**
 * An aeroplane window: the plastic frame, the sky with its sun, whatever scene is passed in, a little reflection on
 * the glass and the window shade. `shade` "load" slides the shade up when the page opens, "reveal" when the window
 * scrolls into view (inside a .ws-reveal), "none" leaves it up.
 */
export function Porthole({ children, className, shade = "none", clouds = true }: {
  children?: ReactNode; className?: string; shade?: "load" | "reveal" | "none"; clouds?: boolean;
}) {
  return (
    <div className={cn("ws-frame relative", className)}>
      <div className="ws-pane relative h-full w-full overflow-hidden">
        <div className="ws-sky absolute inset-0" />
        <span className="ws-sun absolute left-[64%] aspect-square w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        {clouds && <WindowClouds />}
        {children}
        <div className="ws-glass pointer-events-none absolute inset-0" />
        {shade !== "none" && <div className={shade === "load" ? "ws-shade" : "ws-card-shade"} aria-hidden="true"><span /></div>}
        <div className="ws-rim pointer-events-none absolute inset-0" />
      </div>
    </div>
  );
}

/** A photo or video as the land below the window, fading into the sky at the top and moving with the scroll. */
export function Scene({ img, video, alt = "", className }: { img?: string; video?: string; alt?: string; className?: string }) {
  return (
    <div className={cn("ws-scene absolute inset-x-0 bottom-0 h-[64%]", className)}>
      {video ? (
        <video src={video} poster={img || undefined} autoPlay muted loop playsInline aria-hidden="true" className="h-full w-full object-cover" />
      ) : img ? (
        <img src={img} alt={alt} className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}
