// Small pieces every Atlas page shares: the section eyebrow, the live dot, the "example data" tag, the POPIA consent
// line, numbers that count up when they come into view, and the toast notifications from the agency's machinery.
import { useEffect, useState, type ReactNode } from "react";
import { Bell, Mail, MessageCircle } from "lucide-react";
import { BRAND } from "@/designs/shared";
import { useInView } from "@/designs/atlas/hooks";
import { label, mono, muted } from "@/designs/atlas/theme";

/** "Live · Three supplier feeds": the small label every section opens with. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`${label} flex items-center gap-2.5 text-[#1D6FD8] ${className}`}>{children}</span>;
}

export function LiveDot({ colour = "#16A34A" }: { colour?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5 flex-none" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: colour }} />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: colour }} />
    </span>
  );
}

/** Marks a mock-up of the agency's side: the figures are examples, not read from TribeTravel. */
export function ExampleTag({ children = "Example data" }: { children?: ReactNode }) {
  return <span className={`${label} inline-flex items-center rounded-full bg-[#FFB547]/25 px-3 py-1 text-[#7A3A00]`}>{children}</span>;
}

/** POPIA: consent before details are saved. */
export function Consent() {
  return (
    <label className={`flex items-start gap-2.5 text-xs leading-relaxed ${muted}`}>
      <input type="checkbox" required className="mt-0.5 h-4 w-4 flex-none accent-[#1D6FD8]" />
      <span>
        I agree that {BRAND.name} may use my details to plan and quote my trip (POPIA). We never share them with anyone else.
        {" "}<a href="/designs/atlas/privacy" className="font-semibold text-[#1D6FD8] underline underline-offset-2">Privacy</a>
      </span>
    </label>
  );
}

/** A figure that counts up from zero when it scrolls into view. The prerendered page shows the final figure. */
export function CountUp({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string | undefined; suffix?: string | undefined; decimals?: number | undefined }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.4);
  const [shown, setShown] = useState<number | null>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(value); return; }
    if (!seen) { setShown(0); return; }
    let frame = 0;
    const start = performance.now();
    const run = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      setShown(value * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(run);
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [seen, value]);
  const n = shown ?? value;
  // South African style: a space between thousands and a point for decimals (R2.36m, 1 200).
  const [whole, part] = n.toFixed(decimals).split(".");
  const text = whole!.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (part ? `.${part}` : "");
  return <span ref={ref} className="tabular-nums">{prefix}{text}{suffix}</span>;
}

/** What the agency's automation sends, shown as toasts that slide in one at a time. Example messages. */
const TOASTS: { icon: typeof Bell; channel: string; text: string; colour: string }[] = [
  { icon: MessageCircle, channel: "WhatsApp to Priya", text: "Your Seychelles quote Q-1061 is ready to view.", colour: "#16A34A" },
  { icon: Bell, channel: "Reminder to Thandi", text: "Naledi hasn't opened her Zanzibar quote in 5 days.", colour: "#F08C2E" },
  { icon: Mail, channel: "Email to Beachcomber", text: "New booking: Paradis, 7 nights, 2 adults.", colour: "#0E9FAE" },
  { icon: MessageCircle, channel: "WhatsApp to the Mokoenas", text: "Your transfer to the airport is at 07:30 tomorrow.", colour: "#16A34A" },
];

export function Toasts() {
  const [at, setAt] = useState(-1);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0, hide = 0;
    const show = () => {
      if (document.hidden) return;
      setAt(i++ % TOASTS.length);
      hide = window.setTimeout(() => setAt(-1), 5200);
    };
    const first = window.setTimeout(show, 6000);
    const every = window.setInterval(show, 14000);
    return () => { clearTimeout(first); clearTimeout(hide); clearInterval(every); };
  }, []);
  const t = TOASTS[at];
  if (!t) return null;
  const Icon = t.icon;
  // Decorative: the same messages are listed on the How we work page.
  return (
    <div aria-hidden="true" key={at} className="atlas-toast pointer-events-none fixed bottom-40 left-4 z-30 flex w-[min(330px,calc(100vw-2rem))] items-start gap-3 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-[0_20px_50px_-20px_rgba(11,35,64,.5)] backdrop-blur-xl md:bottom-6 md:left-6">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-white" style={{ background: t.colour }}><Icon className="h-4 w-4" /></span>
      <span className="flex min-w-0 flex-col gap-0.5 text-sm">
        <span className={`${mono} text-[11px] ${muted}`}>{t.channel} · example</span>
        <span className="leading-snug text-[#0B2340]">{t.text}</span>
      </span>
    </div>
  );
}
