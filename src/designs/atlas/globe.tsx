// The Atlas globe: a sunlit sphere drawn on a 2D canvas in orthographic projection, with a dotted landmass, a soft
// graticule and atmosphere, and a glowing arc for every trip in progress, each with a pulse travelling along it.
// With `rings`, the agency's three supplier feeds orbit it as coloured rings, sending packets round.
// It turns slowly, turns further as the page scrolls, and can be dragged sideways. Decorative: the prerendered page
// shows a gradient sphere in its place, it pauses off-screen and in a hidden tab, and with reduced motion it is
// drawn once and holds still. Nothing touches `window` until the effect runs.
import { useEffect, useRef } from "react";
import { landDots } from "@/designs/atlas/land";
import { CITIES, TRIPS, type CityCode, type Trip } from "@/designs/atlas/content";
import { FEEDS } from "@/designs/atlas/theme";

const RAD = Math.PI / 180;
let DOTS: Float32Array | null = null;
const dots = () => (DOTS ??= landDots());

/** A city as a point on the unit sphere. */
function vec(code: CityCode): [number, number, number] {
  const { lat, lon } = CITIES[code];
  return [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
}

/** The great circle between two cities, lifted off the surface in the middle (longer trips fly higher). */
function arcPoints(from: CityCode, to: CityCode, n = 56) {
  const a = vec(from), b = vec(to);
  const w = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  const s = Math.sin(w) || 1, lift = 0.05 + w * 0.17;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), k1 = Math.sin((1 - t) * w) / s, k2 = Math.sin(t * w) / s, h = 1 + lift * Math.sin(Math.PI * t);
    for (let j = 0; j < 3; j++) out[i * 3 + j] = (k1 * a[j]! + k2 * b[j]!) * h;
  }
  return out;
}

/** The three supplier orbits: radius (in globe radii), tilt towards the viewer, turn on screen and packet speed. */
const RINGS = FEEDS.map((f, i) => ({
  colour: f.colour, r: 1.17 + i * 0.13, tilt: [74, 67, 79][i]! * RAD, rot: [-20, 15, 36][i]! * RAD, speed: [0.32, -0.25, 0.2][i]!,
}));

type Props = {
  /** Screen-reader description of what the globe shows. */
  label: string;
  trips?: Trip[];
  /** Turn to this place and hold there, with its arc from Johannesburg highlighted. */
  focus?: CityCode;
  rings?: boolean;
  className?: string;
};

export function Globe({ label, trips = TRIPS, focus, rings = false, className = "" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = wrap.current, el = canvas.current, ctx = el?.getContext("2d");
    if (!host || !el || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const land = dots();
    const arcs = trips.map((t) => ({ trip: t, pts: arcPoints(t.from, t.to), lit: t.to === focus }));
    const size = { w: 0, h: 0, dpr: 1 };
    const view = { lon: focus ? CITIES[focus].lon : 40, lat: focus ? CITIES[focus].lat * 0.6 : 12 };
    let drag = 0, frame = 0, onScreen = true, elapsed = 0, last = 0, tick = 0;

    function draw(time: number) {
      const { w, h, dpr } = size;
      if (!w || !ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const R = (Math.min(w, h) / 2) * (rings ? 0.64 : 0.86), cx = w / 2, cy = h / 2;

      // Where the globe faces: swaying and turning with the scroll, or held on the focus place.
      const scroll = reduced ? 0 : window.scrollY;
      const goLon = focus ? CITIES[focus].lon - 8 + (reduced ? 0 : 7 * Math.sin(time * 0.35)) + drag
        : 42 + (reduced ? 0 : 48 * Math.sin(time * 0.05)) + scroll * 0.05 + drag;
      const goLat = focus ? Math.max(-35, Math.min(35, CITIES[focus].lat * 0.7)) : 14 - Math.min(scroll * 0.006, 16);
      const ease = reduced ? 1 : 0.06;
      view.lon += (goLon - view.lon) * ease;
      view.lat += (goLat - view.lat) * ease;
      const cl = Math.cos(view.lon * RAD), sl = Math.sin(view.lon * RAD), cp = Math.cos(view.lat * RAD), sp = Math.sin(view.lat * RAD);
      // Project a point (unit sphere, or lifted above it): screen x, y in globe radii and depth z (> 0 faces us).
      let px = 0, py = 0, pz = 0;
      const project = (X: number, Y: number, Z: number) => {
        const e = X * cl + Y * sl;
        px = Y * cl - X * sl; py = cp * Z - sp * e; pz = sp * Z + cp * e;
      };
      const hidden = () => pz < 0 && px * px + py * py < 1;

      // Atmosphere
      const glow = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.32);
      glow.addColorStop(0, "rgba(120,180,250,.45)");
      glow.addColorStop(0.45, "rgba(150,200,255,.16)");
      glow.addColorStop(1, "rgba(150,200,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.32, 0, Math.PI * 2); ctx.fill();

      if (rings) drawRings(false);

      // The sphere, lit from the upper left
      const sea = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, R * 0.05, cx, cy, R);
      sea.addColorStop(0, "#FFFFFF");
      sea.addColorStop(0.45, "#EEF5FE");
      sea.addColorStop(1, "#C6DBF4");
      ctx.fillStyle = sea;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

      // Graticule every 30°
      ctx.strokeStyle = "rgba(29,111,216,.13)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const line = (fn: (k: number) => [number, number]) => {
        let pen = false;
        for (let k = 0; k <= 90; k++) {
          const [lat, lon] = fn(k);
          project(Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD));
          if (pz <= 0) { pen = false; continue; }
          if (pen) ctx.lineTo(cx + px * R, cy - py * R); else ctx.moveTo(cx + px * R, cy - py * R);
          pen = true;
        }
      };
      for (let lat = -60; lat <= 60; lat += 30) line((k) => [lat, -180 + k * 4]);
      for (let lon = -180; lon < 180; lon += 30) line((k) => [-90 + k * 2, lon]);
      ctx.stroke();

      // Land, in four shades by depth so the edge falls away
      const dot = Math.max(0.8, Math.min(2.1, R / 190));
      ctx.fillStyle = "#1E4F86";
      for (let band = 0; band < 4; band++) {
        ctx.globalAlpha = 0.42 + band * 0.19;
        ctx.beginPath();
        for (let i = 0; i < land.length; i += 3) {
          project(land[i]!, land[i + 1]!, land[i + 2]!);
          if (pz <= 0 || Math.min(3, Math.floor(pz * 4)) !== band) continue;
          const x = cx + px * R, y = cy - py * R, r = dot * (0.65 + pz * 0.35);
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Trips in progress
      const labelled = new Set<string>();
      ctx.lineCap = "round";
      arcs.forEach(({ trip, pts, lit }, i) => {
        const n = pts.length / 3;
        const reveal = reduced ? 1 : Math.min(1, Math.max(0, (time - 0.5 - i * 0.16) / 1.3));
        const upto = Math.floor(reveal * (n - 1));
        const colour = lit ? "29,111,216" : "240,120,36";
        // the route
        ctx.strokeStyle = `rgba(${colour},${lit ? 0.85 : 0.5})`;
        ctx.lineWidth = lit ? 2.4 : 1.5;
        ctx.beginPath();
        let pen = false;
        for (let k = 0; k <= upto; k++) {
          project(pts[k * 3]!, pts[k * 3 + 1]!, pts[k * 3 + 2]!);
          if (hidden()) { pen = false; continue; }
          if (pen) ctx.lineTo(cx + px * R, cy - py * R); else ctx.moveTo(cx + px * R, cy - py * R);
          pen = true;
        }
        ctx.stroke();
        // the pulse riding it
        if (!reduced && reveal === 1) {
          const head = ((time * 0.24 + i * 0.37) % 1.5);
          if (head <= 1) {
            const a = Math.max(0, Math.floor((head - 0.2) * (n - 1))), b = Math.floor(head * (n - 1));
            ctx.strokeStyle = lit ? "#1D6FD8" : "#FF7A1A";
            ctx.lineWidth = lit ? 3.4 : 2.6;
            ctx.beginPath();
            pen = false;
            for (let k = a; k <= b; k++) {
              project(pts[k * 3]!, pts[k * 3 + 1]!, pts[k * 3 + 2]!);
              if (hidden()) { pen = false; continue; }
              if (pen) ctx.lineTo(cx + px * R, cy - py * R); else ctx.moveTo(cx + px * R, cy - py * R);
              pen = true;
            }
            ctx.stroke();
            project(pts[b * 3]!, pts[b * 3 + 1]!, pts[b * 3 + 2]!);
            if (!hidden()) {
              ctx.fillStyle = "#FFFFFF";
              ctx.beginPath(); ctx.arc(cx + px * R, cy - py * R, 2.6, 0, Math.PI * 2); ctx.fill();
            }
          }
        }
        // the two ends
        if (reveal < 1) return;
        const ends: [CityCode, boolean][] = [[trip.from, false], [trip.to, true]];
        for (const [code, isDest] of ends) {
          const v = vec(code);
          project(v[0], v[1], v[2]);
          if (pz <= 0.05) continue;
          const x = cx + px * R, y = cy - py * R;
          if (isDest && !reduced) {
            const p = (time * 0.55 + i * 0.29) % 1;
            ctx.strokeStyle = `rgba(${colour},${(1 - p) * 0.7})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(x, y, 3 + p * (lit ? 18 : 11), 0, Math.PI * 2); ctx.stroke();
          }
          ctx.fillStyle = isDest ? `rgb(${colour})` : "#0B2340";
          ctx.beginPath(); ctx.arc(x, y, isDest ? (lit ? 4.5 : 3.2) : 2.4, 0, Math.PI * 2); ctx.fill();
          if (!labelled.has(code) && pz > 0.3 && R > 120) {
            labelled.add(code);
            ctx.font = lit && isDest ? "600 13px 'DM Mono', monospace" : "500 10px 'DM Mono', monospace";
            ctx.fillStyle = lit && isDest ? "#0B2340" : "rgba(11,35,64,.7)";
            ctx.fillText(lit && isDest ? CITIES[code].name.toUpperCase() : code, x + 7, y - 6);
          }
        }
      });

      if (rings) drawRings(true);

      // Sunlight on the rim
      const rim = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      rim.addColorStop(0, "rgba(255,190,90,.7)");
      rim.addColorStop(0.5, "rgba(255,255,255,0)");
      ctx.strokeStyle = rim;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R - 1, 0, Math.PI * 2); ctx.stroke();

      /** One pass over the orbit rings: the halves behind the globe, or the halves in front of it, with the packets
       *  each feed is sending round. */
      function drawRings(front: boolean) {
        if (!ctx) return;
        for (const ring of RINGS) {
          const at = (t: number) => {
            const rx = ring.r * Math.cos(t), ry = ring.r * Math.sin(t) * Math.cos(ring.tilt);
            const depth = Math.sin(t) * Math.sin(ring.tilt);
            const c = Math.cos(ring.rot), s = Math.sin(ring.rot);
            return [cx + (rx * c - ry * s) * R, cy + (rx * s + ry * c) * R, depth] as const;
          };
          ctx.strokeStyle = ring.colour;
          ctx.globalAlpha = front ? 0.85 : 0.4;
          ctx.lineWidth = front ? 2 : 1.5;
          ctx.beginPath();
          let pen = false;
          for (let k = 0; k <= 120; k++) {
            const [x, y, d] = at((k / 120) * Math.PI * 2);
            if (d > 0 !== front) { pen = false; continue; }
            if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y);
            pen = true;
          }
          ctx.stroke();
          for (let p = 0; p < 3; p++) {
            const [x, y, d] = at(time * ring.speed + (p * Math.PI * 2) / 3);
            if (d > 0 !== front) continue;
            ctx.globalAlpha = front ? 0.25 : 0.12;
            ctx.fillStyle = ring.colour;
            ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = front ? 1 : 0.5;
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }
    }

    function resize() {
      if (!host || !el) return;
      const r = host.getBoundingClientRect();
      size.dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.w = r.width; size.h = r.height;
      el.width = Math.round(r.width * size.dpr);
      el.height = Math.round(r.height * size.dpr);
      draw(reduced ? 4 : elapsed);
    }

    // The animation runs only while the globe is on screen and the tab is showing. Phones draw every other frame.
    function loop(now: number) {
      frame = requestAnimationFrame(loop);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      elapsed += dt;
      if (size.w < 640 && tick++ % 2) return;
      draw(elapsed);
    }
    function sync() {
      const run = !reduced && onScreen && !document.hidden;
      if (run && !frame) { last = 0; frame = requestAnimationFrame(loop); }
      if (!run && frame) { cancelAnimationFrame(frame); frame = 0; }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => { onScreen = !!e?.isIntersecting; sync(); });
    io.observe(host);
    document.addEventListener("visibilitychange", sync);
    document.fonts?.ready.then(() => draw(reduced ? 4 : elapsed)).catch(() => {});

    // Drag sideways to turn it (vertical drags still scroll the page).
    let startX: number | null = null;
    const down = (e: PointerEvent) => { startX = e.clientX; };
    const move = (e: PointerEvent) => {
      if (startX === null) return;
      drag -= (e.clientX - startX) * 0.3;
      startX = e.clientX;
      if (reduced) draw(4);
    };
    const up = () => { startX = null; };
    host.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    sync();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      host.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [trips, focus, rings]);

  return (
    <div ref={wrap} role="img" aria-label={label} className={`relative aspect-square touch-pan-y select-none ${className}`}>
      {/* What shows before the script runs (and without it): the same sunlit sphere, without the motion. */}
      <div aria-hidden="true" className={`absolute rounded-full bg-[radial-gradient(circle_at_31%_29%,#FFFFFF,#EEF5FE_45%,#C6DBF4)] shadow-[0_0_60px_10px_rgba(120,180,250,.35)] ${rings ? "inset-[18%]" : "inset-[7%]"}`} />
      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
