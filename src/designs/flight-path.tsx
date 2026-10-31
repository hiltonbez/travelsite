// The Enterprise design's flight path: an SVG route drawn through every `[data-stop]` section of its parent, whose
// orange trail grows as the page scrolls with a plane riding the tip. Decorative only: the prerendered page is
// complete without it, and with reduced motion the route is drawn in full and nothing moves.
import { useEffect, useRef } from "react";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Calls `fn` with the page's scroll position on load and on every animation frame the page scrolls. */
export function useOnScroll(fn: (y: number, reduced: boolean) => void) {
  const latest = useRef(fn);
  latest.current = fn;
  useEffect(() => {
    let frame = 0;
    const run = () => { frame = 0; latest.current(window.scrollY, reducedMotion()); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(run); };
    run();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);
}

export function FlightPath() {
  const svg = useRef<SVGSVGElement>(null);
  const track = useRef<SVGPathElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const plane = useRef<SVGGElement>(null);
  const length = useRef(0);

  function draw(y: number, reduced: boolean) {
    const path = trail.current;
    if (!path || !length.current) return;
    const L = length.current;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const p = reduced ? 1 : Math.min(1, Math.max(0, y / max));
    path.style.strokeDashoffset = String(L * (1 - p));
    const at = path.getPointAtLength(L * p);
    const back = path.getPointAtLength(Math.max(0, L * p - 2));
    const ahead = path.getPointAtLength(Math.min(L, L * p + 2));
    const angle = (Math.atan2(ahead.y - back.y, ahead.x - back.x) * 180) / Math.PI + 90;
    plane.current?.setAttribute("transform", `translate(${at.x} ${at.y}) rotate(${angle})`);
  }

  useOnScroll(draw);

  useEffect(() => {
    const host = svg.current?.parentElement;
    if (!host) return;
    // Run down one edge of the page, swing across in the gap above each stop (so the line never cuts through its
    // text) and land in the middle at the bottom.
    function build() {
      if (!host || !svg.current || !track.current || !trail.current) return;
      const W = host.offsetWidth, H = host.offsetHeight, narrow = W < 860;
      svg.current.setAttribute("viewBox", `0 0 ${W} ${H}`);
      // On a phone the 16px gutter is the only free space, so hug the screen edges there.
      const left = narrow ? 7 : W * 0.04, right = narrow ? W - 7 : W * 0.96;
      let x = narrow ? right : W * 0.9, y = 140;
      let d = `M ${x} ${y}`;
      host.querySelectorAll<HTMLElement>("[data-stop]").forEach((s, i) => {
        const ny = s.offsetTop + 40, nx = i % 2 ? left : right;
        d += ` L ${x} ${Math.max(y, ny - 170)} C ${x} ${ny - 50}, ${nx} ${ny - 110}, ${nx} ${ny}`;
        x = nx; y = ny;
      });
      d += ` C ${x} ${H - 60}, ${W * 0.5} ${H - 220}, ${W * 0.5} ${H - 20}`;
      track.current.setAttribute("d", d);
      trail.current.setAttribute("d", d);
      length.current = trail.current.getTotalLength();
      trail.current.style.strokeDasharray = String(length.current);
      draw(window.scrollY, reducedMotion());
    }
    // Live packages, chat and times change the stops' heights after load, so redraw whenever the page resizes.
    const ro = new ResizeObserver(build);
    ro.observe(host);
    document.fonts?.ready.then(build).catch(() => {});
    return () => ro.disconnect();
  }, []);

  return (
    <svg ref={svg} aria-hidden="true" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible">
      <path ref={track} fill="none" stroke="#B9B3A6" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="2 9" />
      <path ref={trail} fill="none" stroke="#FF6A2E" strokeWidth="2.5" strokeLinecap="round" />
      <g ref={plane} transform="translate(-100 -100)">
        <circle r="22" fill="#FF6A2E" fillOpacity=".14" />
        <path fill="#FF6A2E" transform="translate(-17 -17) scale(1.42)" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
      </g>
    </svg>
  );
}
