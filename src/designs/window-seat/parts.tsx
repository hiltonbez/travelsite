// Small pieces every Window Seat page shares: the seatbelt sign (POPIA consent on the forms), the section label, a
// boarding-pass barcode and the hook that lifts sections into view as they scroll in.
import { useEffect, type ReactNode } from "react";
import { BRAND } from "@/designs/shared";
import { coral, label, soft } from "@/designs/window-seat/theme";

/** The overhead "fasten seatbelt" sign, as a small glyph. */
export function SeatbeltIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="4.5" r="2" />
      <path d="M8 21v-6.5a4 4 0 0 1 8 0V21" />
      <path d="M7.5 15.5 16.5 12" />
      <rect x="10.6" y="12.6" width="2.8" height="2" rx=".5" transform="rotate(-21 12 13.6)" />
    </svg>
  );
}

/** POPIA: consent before details are saved. Styled as the seatbelt sign, which lights up when ticked. */
export function Seatbelt({ dark = false }: { dark?: boolean }) {
  return (
    <label className={`group flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed ${dark ? "text-[#E9E4F5]" : soft}`}>
      <input type="checkbox" required className="peer sr-only" />
      <span aria-hidden="true"
        className={`ws-belt flex h-9 w-12 flex-none items-center justify-center rounded-lg border-2 transition peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#C2410C] ${dark ? "border-white/25 bg-white/5 text-white/45" : "border-[#1C2340]/20 bg-[#1C2340]/5 text-[#1C2340]/40"} peer-checked:border-[#F59E0B] peer-checked:bg-[#FFC857] peer-checked:text-[#1C2340] peer-checked:shadow-[0_0_18px_rgba(255,200,87,.85)]`}>
        <SeatbeltIcon className="h-6 w-6" />
      </span>
      <span>
        <span className="sr-only">Required: </span>
        I agree that {BRAND.name} may use my details to plan and quote my trip (POPIA). We never share them with anyone else.{" "}
        <a href="/designs/window-seat/privacy" className="underline underline-offset-2">Privacy</a>
      </span>
    </label>
  );
}

/** "Seat 12A · Destinations": the small label each section opens with. */
export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`${label} ${coral} flex items-center gap-2.5 ${className}`}>{children}</span>;
}

/** The barcode's bars as [x, width], from a fixed pattern (the same on the server and in the browser). */
const BARS = "3121412213311242113214123121132241".split("").map(Number)
  .reduce<{ at: number; bars: [number, number][] }>((acc, w, i) => {
    if (i % 2 === 0) acc.bars.push([acc.at, w]);
    acc.at += w + 1;
    return acc;
  }, { at: 0, bars: [] });

/** A barcode for the boarding pass stub. */
export function Barcode({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${BARS.at} 30`} preserveAspectRatio="none" className={className}>
      {BARS.bars.map(([x, w]) => <rect key={x} x={x} y="0" width={w} height="30" fill="currentColor" />)}
    </svg>
  );
}

/** Lifts `.ws-reveal` elements (and their window shades) as they scroll into view; runs again when `key` changes. */
export function useWsReveal(key?: unknown) {
  useEffect(() => {
    const els = document.querySelectorAll(".ws-reveal:not(.in)");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
}
