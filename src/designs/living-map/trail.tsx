// The ink trail down every Living Map page: a wandering route through each `[data-pin]` section, inked in as the page
// scrolls, with a little plane (over land) or boat (over the sea stretches) riding its tip and an X at each stop it
// has reached. The tip stays level with a line a little below the middle of the screen. Decorative only: the page is
// complete without it, and with reduced motion the trail is drawn in full and nothing rides it.
import { useEffect, useRef } from "react";
import { useOnScroll } from "@/designs/flight-path";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function InkTrail() {
  const svg = useRef<SVGSVGElement>(null);
  const track = useRef<SVGPathElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const plane = useRef<SVGGElement>(null);
  const boat = useRef<SVGGElement>(null);
  const marks = useRef<SVGGElement>(null);
  const length = useRef(0);
  const stops = useRef<number[]>([]);

  function draw(_: number, reduced: boolean) {
    const path = trail.current, host = svg.current?.parentElement;
    if (!path || !host || !length.current) return;
    const L = length.current;
    const eye = window.innerHeight * 0.6 - host.getBoundingClientRect().top;
    let at = L;
    if (!reduced) {
      // The trail only ever heads down the page, so find where it reaches the eye line by halving.
      let lo = 0, hi = L;
      for (let i = 0; i < 22; i++) {
        const mid = (lo + hi) / 2;
        if (path.getPointAtLength(mid).y < eye) lo = mid; else hi = mid;
      }
      at = lo;
    }
    path.style.strokeDashoffset = String(L - at);
    const point = path.getPointAtLength(at);
    const back = path.getPointAtLength(Math.max(0, at - 3));
    const ahead = path.getPointAtLength(Math.min(L, at + 3));
    const angle = (Math.atan2(ahead.y - back.y, ahead.x - back.x) * 180) / Math.PI;
    // Every other leg is a sea crossing: the plane lands and a boat takes over.
    const leg = stops.current.filter((y) => y < point.y).length;
    const sea = leg % 2 === 1;
    const flip = Math.abs(angle) > 90 ? -1 : 1;
    plane.current?.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle + 90})`);
    boat.current?.setAttribute("transform", `translate(${point.x} ${point.y}) scale(${flip} 1)`);
    plane.current?.setAttribute("opacity", reduced || sea ? "0" : "1");
    boat.current?.setAttribute("opacity", reduced || !sea ? "0" : "1");
    marks.current?.querySelectorAll<SVGGElement>("g").forEach((m) => {
      m.setAttribute("opacity", reduced || Number(m.dataset["y"]) < point.y ? "1" : "0");
    });
  }

  useOnScroll(draw);

  useEffect(() => {
    const host = svg.current?.parentElement;
    if (!host) return;
    // Wander down one edge, swing across in the gap above each pinned section, and finish in the middle.
    function build() {
      if (!host || !svg.current || !track.current || !trail.current || !marks.current) return;
      const W = host.offsetWidth, H = host.offsetHeight, narrow = W < 860;
      svg.current.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const left = narrow ? 8 : W * 0.035, right = narrow ? W - 8 : W * 0.965;
      let x = narrow ? right : W * 0.92, y = 110;
      let d = `M ${x} ${y}`;
      const ys: number[] = [];
      const top = host.getBoundingClientRect().top;
      host.querySelectorAll<HTMLElement>("[data-pin]").forEach((s, i) => {
        // Measured from the page, not the parent: a pinned card can sit inside another section.
        const ny = s.getBoundingClientRect().top - top + 30, nx = i % 2 ? left : right;
        // A gentle wiggle on the long straight runs, like a hand-drawn line.
        const runEnd = Math.max(y, ny - 170);
        const w = narrow ? 3 : 10;
        d += ` C ${x + w} ${y + (runEnd - y) * 0.33}, ${x - w} ${y + (runEnd - y) * 0.66}, ${x} ${runEnd}`;
        d += ` C ${x} ${ny - 50}, ${nx} ${ny - 110}, ${nx} ${ny}`;
        ys.push(ny);
        x = nx; y = ny;
      });
      d += ` C ${x} ${H - 80}, ${W * 0.5} ${H - 240}, ${W * 0.5} ${H - 30}`;
      track.current.setAttribute("d", d);
      trail.current.setAttribute("d", d);
      length.current = trail.current.getTotalLength();
      trail.current.style.strokeDasharray = String(length.current);
      stops.current = ys;
      // An X at each stop, inked in when the trail reaches it.
      marks.current.innerHTML = "";
      ys.forEach((sy, i) => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const sx = i % 2 ? left : right;
        g.dataset["y"] = String(sy);
        g.setAttribute("opacity", "0");
        g.setAttribute("style", "transition: opacity .5s");
        g.innerHTML = `<path d="M${sx - 7} ${sy - 7} L${sx + 7} ${sy + 7} M${sx + 7} ${sy - 7} L${sx - 7} ${sy + 7}" stroke="var(--lm-route)" stroke-width="3" stroke-linecap="round"/>`;
        marks.current?.appendChild(g);
      });
      draw(window.scrollY, reducedMotion());
    }
    // Live rates, chat and seat maps change the sections' heights after load, so redraw whenever the page resizes.
    const ro = new ResizeObserver(build);
    ro.observe(host);
    document.fonts?.ready.then(build).catch(() => {});
    return () => ro.disconnect();
  }, []);

  return (
    <svg ref={svg} aria-hidden="true" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 z-[5] h-full w-full overflow-visible">
      <path ref={track} fill="none" stroke="var(--lm-route)" strokeOpacity=".28" strokeWidth="1.5" strokeDasharray="1 7" strokeLinecap="round" />
      <path ref={trail} fill="none" stroke="var(--lm-route)" strokeWidth="2.5" strokeLinecap="round" />
      <g ref={marks} />
      <g ref={plane} transform="translate(-100 -100)">
        <circle r="20" fill="var(--lm-route)" fillOpacity=".14" />
        <path fill="var(--lm-route)" transform="translate(-15 -15) scale(1.25)" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
      </g>
      <g ref={boat} transform="translate(-100 -100)" opacity="0">
        <circle r="20" fill="var(--lm-route)" fillOpacity=".14" />
        <g fill="var(--lm-route)">
          <path d="M-13 3 h26 l-5 7 h-16 z" />
          <path d="M-1 2 V-15 L10 1 z" />
          <path d="M-3 1 L-3 -10 L-10 1 z" />
        </g>
      </g>
    </svg>
  );
}
