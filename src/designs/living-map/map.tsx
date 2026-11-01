// The hand-drawn map every page is a region of: sea hatching, a graticule, coastlines with contour lines, sea names in
// map lettering, and ink routes from home (Johannesburg) to each destination with little planes and boats riding
// them. Routes either ink themselves in on load or draw as the map scrolls through the screen. The prerendered map is
// complete (every route drawn); with reduced motion nothing moves.
import { useId, useRef } from "react";
import { useOnScroll } from "@/designs/flight-path";
import { HOME, ISLETS, LAND, MAP_W, PEAKS, PLACES, VIEWS, arc, contour, proj, type View } from "@/designs/living-map/geo";
import { hand } from "@/designs/living-map/theme";

/** Little plane and boat, drawn around 0,0 pointing right (animateMotion turns them along the route). */
function Plane({ s }: { s: number }) {
  return (
    <path transform={`scale(${s}) rotate(90) translate(-12 -12)`} fill="var(--lm-route)" stroke="var(--lm-paper)" strokeWidth=".8"
      d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
  );
}
function Boat({ s }: { s: number }) {
  return (
    <g transform={`scale(${s})`} fill="var(--lm-route)" stroke="var(--lm-paper)" strokeWidth=".6">
      <path d="M-11 2 h22 l-4 6 h-14 z" />
      <path d="M-1 1 V-13 L8 0 z" />
      <path d="M-3 0 L-3 -9 L-9 0 z" />
    </g>
  );
}

/** Sea routes a boat sails back and forth on: a cruise round Mauritius and Réunion, and a dhow off Zanzibar. */
const SEA = [
  `M${proj([57.6, -19.9]).join(" ")} Q${proj([56.5, -23]).join(" ")} ${proj([55.2, -21.3]).join(" ")}`,
  `M${proj([39.6, -5.6]).join(" ")} Q${proj([42, -8]).join(" ")} ${proj([43.4, -11.4]).join(" ")}`,
  `M${proj([18.2, -34.6]).join(" ")} Q${proj([22, -36.4]).join(" ")} ${proj([25.8, -34.6]).join(" ")}`,
];

/** How far each route bows, so they fan out from home instead of overlapping. */
const BEND: Record<string, number> = { mauritius: -0.18, zanzibar: -0.16, "victoria-falls": 0.25, kruger: -0.4, "cape-town": 0.22, santorini: 0.1 };

/** Inks in a map's `[data-scroll-draw]` routes as it scrolls up through the screen, one after another. */
export function useScrollDraw<T extends Element>() {
  const ref = useRef<T>(null);
  useOnScroll((_, reduced) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = reduced ? 1 : Math.min(Math.max((window.innerHeight * 0.95 - r.top) / (r.height * 0.9 + window.innerHeight * 0.3), 0), 1);
    el.querySelectorAll<SVGPathElement>("[data-scroll-draw]").forEach((path, i, all) => {
      const share = Math.min(Math.max(p * (1 + all.length * 0.25) - i * 0.25, 0), 1);
      path.style.strokeDashoffset = String(1 - share);
    });
  });
  return ref;
}

export function LivingMap({
  view = "world", viewBox, routes = Object.keys(PLACES), draw = "load", focus, label, className = "",
}: {
  view?: View; viewBox?: string; routes?: string[]; draw?: "load" | "scroll"; focus?: string; label: string; className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const box = viewBox ?? VIEWS[view];
  const [bx, by, bw, bh] = box.split(" ").map(Number) as [number, number, number, number];
  const k = bw / MAP_W;                          // so lines and letters look the same size in every view
  const scrollRef = useScrollDraw<SVGSVGElement>();
  const lats = [40, 30, 20, 10, 0, -10, -20, -30];
  const lons = [-10, 0, 10, 20, 30, 40, 50, 60];
  const seaName = (text: string, lonlat: [number, number], size = 1) => {
    const [x, y] = proj(lonlat);
    return (
      <text x={x} y={y} textAnchor="middle" fill="var(--lm-coast)" fillOpacity=".55" fontSize={22 * k * size}
        letterSpacing={9 * k * size} fontStyle="italic" fontFamily="'IM Fell English SC', Georgia, serif">{text}</text>
    );
  };

  return (
    <svg ref={draw === "scroll" ? scrollRef : undefined} viewBox={box} role="img" aria-label={label}
      preserveAspectRatio="xMidYMid slice" className={`block h-full w-full ${className}`}>
      <defs>
        <pattern id={`${id}h`} width={14 * k} height={14 * k} patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <line x1="0" y1="0" x2={14 * k} y2="0" className="lm-hatch" strokeWidth={1.2 * k} />
        </pattern>
      </defs>
      <rect x={bx - 50} y={by - 50} width={bw + 100} height={bh + 100} fill="var(--lm-sea)" />
      <rect x={bx - 50} y={by - 50} width={bw + 100} height={bh + 100} fill={`url(#${id}h)`} />

      {/* The graticule */}
      <g stroke="var(--lm-coast)" strokeOpacity=".22" strokeWidth={1.2 * k} strokeDasharray={`${6 * k} ${8 * k}`}>
        {lats.map((lat) => <line key={lat} x1="0" x2={MAP_W} y1={(42 - lat) * 12.5} y2={(42 - lat) * 12.5} />)}
        {lons.map((lon) => <line key={lon} y1="0" y2={1000} x1={(lon + 20) * 12.5} x2={(lon + 20) * 12.5} />)}
      </g>
      <g fill="var(--lm-coast)" fillOpacity=".45" fontSize={13 * k} fontFamily="'IM Fell English', Georgia, serif" fontStyle="italic">
        {lats.map((lat) => <text key={lat} x={bx + 8 * k} y={(42 - lat) * 12.5 - 5 * k}>{Math.abs(lat)}°{lat > 0 ? "N" : lat < 0 ? "S" : ""}</text>)}
      </g>

      {/* Land: a wide soft stroke under the coast, like ink bleeding into paper */}
      <g filter="url(#lm-rough)">
        {LAND.map((d, i) => <path key={i} d={d} fill="none" stroke="var(--lm-coast)" strokeOpacity=".13" strokeWidth={9 * k} />)}
        {LAND.map((d, i) => <path key={`l${i}`} d={d} fill="var(--lm-land)" stroke="var(--lm-coast)" strokeWidth={1.7 * k} strokeLinejoin="round" />)}
      </g>
      <g fill="none" stroke="var(--lm-coast)" strokeOpacity=".3" strokeWidth={1 * k}>
        {PEAKS.flatMap((p, i) => Array.from({ length: p.rings }, (_, r) => <path key={`${i}-${r}`} d={contour(p.at, (r + 1) * 9, i * 10 + r + 1)} />))}
      </g>
      <g fill="var(--lm-land)" stroke="var(--lm-coast)" strokeWidth={1.2 * k}>
        {ISLETS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.5} />)}
        <ellipse cx={PLACES["mauritius"]!.at[0]} cy={PLACES["mauritius"]!.at[1]} rx={5} ry={6.5} />
      </g>

      {seaName("INDIAN OCEAN", [62, -30], 1.2)}
      {seaName("ATLANTIC OCEAN", [-8, -14], 1.2)}
      {seaName("Mozambique Channel", [41.5, -19], 0.55)}
      {seaName("Mediterranean Sea", [18, 34.3], 0.7)}
      {seaName("A F R I C A", [18, 8], 1.6)}

      {/* Routes: a faint dotted track under each ink line */}
      {routes.map((slug) => {
        const p = PLACES[slug];
        if (!p) return null;
        const d = arc(HOME, p.at, BEND[slug] ?? 0.2);
        const i = routes.indexOf(slug);
        return (
          <g key={slug}>
            <path d={d} fill="none" stroke="var(--lm-route)" strokeOpacity=".35" strokeWidth={1.6 * k} strokeDasharray={`${2 * k} ${7 * k}`} strokeLinecap="round" />
            <path id={`${id}r${i}`} d={d} fill="none" stroke="var(--lm-route)" strokeWidth={(focus === slug ? 3.6 : 2.4) * k} strokeLinecap="round" pathLength={1}
              data-scroll-draw={draw === "scroll" ? "" : undefined}
              className={draw === "load" ? "lm-draw" : undefined}
              style={draw === "load" ? { animationDelay: `${0.4 + i * 0.35}s` } : { strokeDasharray: 1 }} />
            <g className="lm-vehicle">
              <Plane s={1.05 * k} />
              <animateMotion dur={`${7 + i * 1.3}s`} begin={`${2 + i * 0.6}s`} repeatCount="indefinite" rotate="auto">
                <mpath href={`#${id}r${i}`} />
              </animateMotion>
            </g>
          </g>
        );
      })}
      {SEA.map((d, i) => (
        <g key={i}>
          <path id={`${id}s${i}`} d={d} fill="none" stroke="var(--lm-route)" strokeOpacity=".45" strokeWidth={1.4 * k} strokeDasharray={`${8 * k} ${6 * k}`} />
          <g className="lm-vehicle">
            <Boat s={0.9 * k} />
            <animateMotion dur={`${14 + i * 3}s`} repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear">
              <mpath href={`#${id}s${i}`} />
            </animateMotion>
          </g>
        </g>
      ))}

      {/* Places */}
      {Object.entries(PLACES).map(([slug, p]) => {
        const on = !focus || focus === slug;
        const [x, y] = p.at;
        return (
          <g key={slug} opacity={on ? 1 : 0.55}>
            {focus === slug && <circle cx={x} cy={y} r={6} fill="none" stroke="var(--lm-route)" strokeWidth={2 * k} className="lm-pulse" />}
            <circle cx={x} cy={y} r={5.5 * k + 1.5} fill="var(--lm-route)" stroke="var(--lm-paper)" strokeWidth={1.5 * k} />
            <text x={x + (p.side === "right" ? 12 : -12) * k} y={y + 6 * k} textAnchor={p.side === "right" ? "start" : "end"}
              fontSize={(focus === slug ? 34 : 26) * k} fontWeight="700" fill="var(--lm-ink)" stroke="var(--lm-paper)" strokeWidth={4 * k}
              paintOrder="stroke" className={hand}>{p.label}</text>
          </g>
        );
      })}
      <g>
        <rect x={HOME[0] - 6 * k} y={HOME[1] - 6 * k} width={12 * k} height={12 * k} fill="var(--lm-ink)" transform={`rotate(45 ${HOME[0]} ${HOME[1]})`} />
        <text x={HOME[0] + 12 * k} y={HOME[1] + 22 * k} fontSize={24 * k} fontWeight="700" fill="var(--lm-ink)" stroke="var(--lm-paper)"
          strokeWidth={4 * k} paintOrder="stroke" className={hand}>Home · Johannesburg</text>
      </g>
    </svg>
  );
}

/** A compass rose. It turns slowly on its own, and its needle swings as the page scrolls. */
export function Compass({ className = "" }: { className?: string }) {
  const needle = useRef<SVGGElement>(null);
  useOnScroll((y, reduced) => {
    needle.current?.setAttribute("transform", `rotate(${reduced ? 0 : Math.sin(y / 260) * 22} 60 60)`);
  });
  const points = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className}>
      <g className="lm-spin">
        <circle cx="60" cy="60" r="56" fill="var(--lm-card)" fillOpacity=".7" stroke="var(--lm-ink)" strokeWidth="1.2" />
        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--lm-ink)" strokeWidth=".6" strokeDasharray="1 3" />
        {points.map((a) => (
          <path key={a} d={a % 90 === 0 ? "M60 10 L64 56 L60 60 L56 56 Z" : a % 45 === 0 ? "M60 22 L62.5 57 L60 60 L57.5 57 Z" : "M60 32 L61.5 58 L60 60 L58.5 58 Z"}
            transform={`rotate(${a} 60 60)`} fill={a % 90 === 0 ? "var(--lm-ink)" : "none"} stroke="var(--lm-ink)" strokeWidth=".8" />
        ))}
      </g>
      <g ref={needle}>
        <path d="M60 18 L64 60 L60 64 L56 60 Z" fill="var(--lm-accent)" />
        <circle cx="60" cy="60" r="4" fill="var(--lm-ink)" />
      </g>
      <text x="60" y="9" textAnchor="middle" fontSize="9" fill="var(--lm-ink)" fontFamily="'IM Fell English SC', Georgia, serif">N</text>
    </svg>
  );
}
