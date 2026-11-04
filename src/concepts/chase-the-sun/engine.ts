// The one loop that runs the sky. It writes straight to the DOM and to CSS variables, so a drag never re-renders React:
// the sun moves every frame, the expensive colour work only when the hour has really changed.
import { useEffect, useRef, type RefObject } from "react";
import { clamp, clockAt, lightsAt, paletteAt, slotAt, smooth, SLOTS, starsAt } from "./sky";

export const MARGIN = 0.05;
export const SPAN = 0.88;
const SUNRISE = 5.7;
const SUNSET = 18.7;
const MOONRISE = 18.6;

export type SkyControl = {
  cur: number;
  target: number;
  vel: number;
  /** Still drifting by itself: nobody has touched the sun yet. */
  drifting: boolean;
  /** Slow, settling spring, for the trip view. */
  gentle: boolean;
};

export const xToHour = (x: number, width: number) =>
  clamp(5 + (18 * (x / width - MARGIN)) / SPAN, 5, 23);

type Star = { x: number; y: number; r: number; a: number; sp: number; ph: number };

function seededStars(n: number): Star[] {
  let s = 20240;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  return Array.from({ length: n }, () => ({
    x: rnd(),
    y: rnd() ** 1.5 * 0.8,
    r: 0.35 + rnd() ** 3 * 1.35,
    a: 0.35 + rnd() * 0.65,
    sp: 0.5 + rnd() * 2.2,
    ph: rnd() * 6.28,
  }));
}

export function useSky(
  rootRef: RefObject<HTMLElement | null>,
  onSlot: (slot: number) => void,
  reduced: boolean,
) {
  const control = useRef<SkyControl>({
    cur: 17.4,
    target: 17.4,
    vel: 0,
    drifting: false,
    gentle: false,
  });
  const reducedRef = useRef(reduced);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);
  const onSlotRef = useRef(onSlot);
  useEffect(() => {
    onSlotRef.current = onSlot;
  }, [onSlot]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const c = control.current;
    const q = <T extends Element>(s: string) => root.querySelector<T>(s);
    const skyCanvas = q<HTMLCanvasElement>("[data-sky]");
    const starCanvas = q<HTMLCanvasElement>("[data-stars]");
    const sunEl = q<HTMLElement>("[data-sun]");
    const moonEl = q<HTMLElement>("[data-moon]");
    const sunArc = q<SVGPathElement>("[data-sun-arc]");
    const moonArc = q<SVGPathElement>("[data-moon-arc]");
    if (!skyCanvas || !starCanvas || !sunEl || !moonEl) return;
    const skyCtx = skyCanvas.getContext("2d");
    const starCtx = starCanvas.getContext("2d");
    if (!skyCtx || !starCtx) return;
    skyCanvas.width = 2;
    skyCanvas.height = 160;

    // The sun starts at the traveller's own hour. Before 05:00 it's still the night before.
    const now = new Date();
    let local = now.getHours() + now.getMinutes() / 60;
    if (local < 5) local += 24;
    c.cur = c.target = local;
    c.vel = 0;
    c.drifting = true;

    let W = 0,
      H = 0,
      horizon = 0,
      top = 0,
      dpr = 1;
    let stars: Star[] = [];

    const sunXY = (h: number): [number, number] => {
      const x = W * (MARGIN + SPAN * clamp((h - 5) / 18, 0, 1));
      const s = (h - SUNRISE) / (SUNSET - SUNRISE);
      return [x, horizon - (horizon - top) * Math.sin(Math.PI * s)];
    };
    const moonXY = (h: number): [number, number] => {
      const x =
        W * (MARGIN + SPAN * clamp((h - 5) / 18, 0, 1)) + (h > 23 ? W * 0.008 * (h - 23) : 0);
      const s = clamp((h - MOONRISE) / (23 - MOONRISE), 0, 1);
      return [x, horizon - (horizon - top) * Math.sin((s * Math.PI) / 2)];
    };

    const measure = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const foot = root.querySelector<HTMLElement>("[data-foot]");
      const footH = foot ? foot.offsetHeight : H * 0.72;
      horizon = footH * 0.7;
      const disc = root.querySelector<HTMLElement>(".sun-disc");
      // The top of the arc leaves room for the clock, however big the sun is on this screen.
      top = 66 + (disc ? disc.offsetWidth / 2 : 60);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      starCanvas.width = Math.round(W * dpr);
      starCanvas.height = Math.round(H * dpr);
      stars = seededStars(W < 700 ? 130 : 260);
      if (sunArc && moonArc) {
        const path = (from: number, to: number, xy: (h: number) => [number, number]) => {
          let d = "";
          for (let i = 0; i <= 48; i++) {
            const [x, y] = xy(from + ((to - from) * i) / 48);
            d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
          }
          return d;
        };
        sunArc.setAttribute("d", path(SUNRISE, SUNSET, sunXY));
        moonArc.setAttribute("d", path(MOONRISE, 23, moonXY));
      }
      lastPlace = -1;
      lastPaint = -1;
    };

    let lastPlace = -1,
      lastPaint = -1,
      lastClock = "",
      lastSlot = slotAt(local);
    let slotTimer = 0,
      starNow = 0,
      frame = 0,
      raf = 0,
      last = performance.now();
    let meteor: { x: number; y: number; t: number } | null = null,
      nextMeteor = 6;

    const drawStars = (t: number, dt: number) => {
      starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
      starCtx.fillStyle = "#eef2ff";
      for (const s of stars) {
        const tw = reducedRef.current ? 1 : 0.62 + 0.38 * Math.sin(t * s.sp + s.ph);
        starCtx.globalAlpha = s.a * tw;
        starCtx.beginPath();
        starCtx.arc(s.x * starCanvas.width, s.y * starCanvas.height, s.r * dpr, 0, 6.283);
        starCtx.fill();
      }
      // Now and then, a shooting star. Nobody will mention it, everybody will see it.
      if (!reducedRef.current) {
        nextMeteor -= dt;
        if (nextMeteor < 0 && !meteor) {
          meteor = { x: 0.25 + ((t * 37) % 1) * 0.5, y: 0.06 + ((t * 13) % 1) * 0.22, t: 0 };
          nextMeteor = 7 + ((t * 11) % 1) * 8;
        }
        if (meteor) {
          meteor.t += dt;
          const p = meteor.t / 0.8;
          if (p >= 1) meteor = null;
          else {
            const x = (meteor.x + p * 0.22) * starCanvas.width;
            const y = (meteor.y + p * 0.12) * starCanvas.height;
            const g = starCtx.createLinearGradient(x, y, x - 90 * dpr, y - 49 * dpr);
            g.addColorStop(0, "rgba(255,255,255,.9)");
            g.addColorStop(1, "rgba(255,255,255,0)");
            starCtx.globalAlpha = Math.sin(p * Math.PI);
            starCtx.strokeStyle = g;
            starCtx.lineWidth = 1.3 * dpr;
            starCtx.beginPath();
            starCtx.moveTo(x, y);
            starCtx.lineTo(x - 90 * dpr, y - 49 * dpr);
            starCtx.stroke();
          }
        }
      }
      starCtx.globalAlpha = 1;
    };

    const paint = (h: number) => {
      const p = paletteAt(h);
      const grad = skyCtx.createLinearGradient(0, 0, 0, 160);
      p.sky.forEach((col, i) => grad.addColorStop(i / 6, col));
      skyCtx.fillStyle = grad;
      skyCtx.fillRect(0, 0, 2, 160);
      const st = root.style;
      st.setProperty("--ink", p.ink);
      st.setProperty("--glow", p.glow);
      st.setProperty("--shade", p.shade);
      st.setProperty("--light", p.sun);
      st.setProperty("--ground", p.ground);
      st.setProperty("--grade", p.grade);
      st.setProperty("--mul", p.mul);
      st.setProperty("--soft", p.soft);
      st.setProperty("--lights", lightsAt(h).toFixed(3));
      // Only the arc, which reads brighter against a dark sky.
      starNow = starsAt(h);
      starCanvas.style.opacity = starNow.toFixed(3);
    };

    const place = (h: number) => {
      const [sx, sy] = sunXY(h);
      const [mx, my] = moonXY(h);
      sunEl.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0)`;
      moonEl.style.transform = `translate3d(${mx.toFixed(1)}px,${my.toFixed(1)}px,0)`;
      sunEl.style.opacity = h > 19.4 ? "0" : "1";
      moonEl.style.opacity = (smooth(18.6, 19.5, h) * (1 - smooth(25.5, 27.5, h))).toFixed(3);
    };

    const tick = (nowMs: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (nowMs - last) / 1000);
      last = nowMs;
      frame++;
      const still = reducedRef.current;
      if (c.drifting && !still) {
        c.target += dt / (c.target >= 23 ? 2.5 : 10);
        if (c.target >= 29) {
          c.target -= 24;
          c.cur -= 24;
        }
      }
      if (still) {
        c.cur = c.target;
        c.vel = 0;
      } else {
        const k = c.gentle ? 12 : 90;
        const d = c.gentle ? 7 : 15;
        c.vel += (k * (c.target - c.cur) - d * c.vel) * dt;
        c.cur += c.vel * dt;
      }
      const h = clamp(c.cur, 5, 29);

      if (Math.abs(h - lastPlace) > 0.0005) {
        place(h);
        lastPlace = h;
      }
      if (Math.abs(h - lastPaint) >= 0.012) {
        paint(h);
        lastPaint = h;
      }

      const txt = clockAt(h);
      if (txt !== lastClock) {
        lastClock = txt;
        root.querySelectorAll("[data-clock]").forEach((el) => {
          el.textContent = txt;
        });
        sunEl.setAttribute("aria-valuenow", clamp(h, 5, 23).toFixed(1));
        sunEl.setAttribute("aria-valuetext", `${txt}, ${SLOTS[slotAt(h)]!.name.toLowerCase()}`);
      }
      const sl = slotAt(h);
      if (sl !== lastSlot) {
        lastSlot = sl;
        clearTimeout(slotTimer);
        // A short wait, so a fast drag doesn't flicker through every line on the way past.
        slotTimer = window.setTimeout(() => onSlotRef.current(sl), still ? 0 : 90);
      }
      if (starNow > 0.02 && (still ? frame === 1 || frame % 60 === 0 : frame % 3 === 0))
        drawStars(nowMs / 1000, dt * 3);
    };

    measure();
    paint(local);
    place(local);
    lastPaint = lastPlace = local;
    drawStars(0, 0);
    root.setAttribute("data-ready", "true");
    onSlotRef.current(lastSlot);
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(slotTimer);
      window.removeEventListener("resize", measure);
    };
  }, [rootRef]);

  return control;
}
