// Workflow automation as an animated flow: a lead arrives, the AI chat qualifies it, a quote goes out, WhatsApp and
// email fire, a reminder follows if it goes quiet, the booking is confirmed and the supplier is told. The nodes light
// up in turn with a pulse running along each connector, and the messages each step sends appear beside it.
// Example data (one sample enquiry), labelled as such. With reduced motion every step shows lit.
import { useEffect, useState, type ReactNode } from "react";
import { Bell, Building2, CheckCircle2, FileText, Inbox, Mail, MessageCircle, RotateCcw, Sparkles } from "lucide-react";
import { BRAND } from "@/designs/shared";
import { ExampleTag} from "@/designs/atlas/parts";
import { useInView } from "@/designs/atlas/hooks";
import { card, display, label, mono, muted } from "@/designs/atlas/theme";

export const STEPS = [
  { icon: Inbox, title: "Lead arrives", text: "Website quote form: Zanzibar, 2 adults, June", time: "09:14", colour: "#1D6FD8" },
  { icon: Sparkles, title: "AI chat qualifies", text: "Budget, dates and who's travelling, in 4 messages", time: "09:16", colour: "#6A52E8" },
  { icon: FileText, title: "Quote goes out", text: "Q-1061 built from live Thompsons rates, checked by Thandi", time: "11:02", colour: "#0E9FAE" },
  { icon: MessageCircle, title: "WhatsApp + email", text: "The client gets both, with a link to view and accept", time: "11:02", colour: "#16A34A" },
  { icon: Bell, title: "Reminder if quiet", text: "Not opened in 3 days? Thandi gets a nudge", time: "Day 3", colour: "#F08C2E", branch: true },
  { icon: CheckCircle2, title: "Booking confirmed", text: "Accepted online; 2 seats held on the 3 July departure", time: "Day 4", colour: "#15803D" },
  { icon: Building2, title: "Supplier notified", text: "Thompsons gets the booking and the travellers' names", time: "Day 4", colour: "#C2570C" },
] as const;

/** Which step the flow has reached: it starts when scrolled into view and loops, pausing on the finished run. */
function useSteps() {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  const [step, setStep] = useState<number>(STEPS.length);           // prerendered and reduced motion: all lit
  useEffect(() => {
    if (!seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let at = 0;
    setStep(0);
    const id = window.setInterval(() => {
      if (document.hidden) return;
      at = at >= STEPS.length + 2 ? 0 : at + 1;           // hold the finished run for two beats, then start again
      setStep(Math.min(at, STEPS.length));
    }, 1500);
    return () => clearInterval(id);
  }, [seen]);
  return [ref, step] as const;
}

export function FlowDiagram({ step }: { step: number }) {
  return (
    <ol className="flex flex-col xl:flex-row xl:items-stretch">
      {STEPS.map((s, i) => {
        const Icon = s.icon, lit = i <= step, active = i === step;
        return (
          <li key={s.title} className="flex flex-col xl:min-w-0 xl:flex-1 xl:flex-row xl:items-center">
            {i > 0 && (
              <span aria-hidden="true" data-lit={lit} className="atlas-link">
                <span className="fill" style={{ background: `linear-gradient(90deg, ${STEPS[i - 1]!.colour}, ${s.colour})` }} />
                {active && <span className="pulse" style={{ background: s.colour }} />}
              </span>
            )}
            <div data-lit={lit} className={`group relative flex flex-1 items-start gap-3.5 rounded-[22px] border p-3.5 transition duration-500 xl:flex-col xl:items-center xl:gap-3 xl:p-3 xl:text-center ${"branch" in s ? "border-dashed" : ""} ${lit ? "border-[#0B2340]/10 bg-white shadow-[0_16px_40px_-28px_rgba(11,35,64,.55)]" : "border-[#0B2340]/8 bg-white/50"}`}>
              <span className="relative flex h-12 w-12 flex-none items-center justify-center rounded-2xl text-white transition duration-500"
                style={{ background: lit ? s.colour : "#C9D6E6" }}>
                <Icon className="h-5 w-5" />
                {active && <span className="atlas-ring absolute inset-0 rounded-2xl" style={{ color: s.colour }} />}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className={`${mono} text-[11px] ${muted}`}>{s.time}{"branch" in s ? " · only if quiet" : ""}</span>
                <b className="text-[15px] leading-tight">{s.title}</b>
                <span className={`text-[13px] leading-snug ${muted}`}>{s.text}</span>
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** The flow on its own (home teaser), with its label. */
export function FlowTeaser() {
  const [ref, step] = useSteps();
  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`${label} ${muted}`}>One enquiry, start to finish</span>
        <ExampleTag>Example run</ExampleTag>
      </div>
      <FlowDiagram step={step} />
    </div>
  );
}

/** The Automation page's run: the flow, and beside it what each step sent, appearing as the steps light up. */
export function FlowRun() {
  const [ref, step] = useSteps();
  const sent = (i: number) => step >= i;
  return (
    <div ref={ref} className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`flex items-center gap-2 ${label} ${muted}`}><RotateCcw className="h-3.5 w-3.5" /> Runs for every enquiry, every day</span>
        <ExampleTag>Example run</ExampleTag>
      </div>
      <FlowDiagram step={step} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="What the flow sent">
        <Sent on={sent(3)} icon={MessageCircle} channel="WhatsApp to Naledi · 11:02" tone="green">
          Hi Naledi! It's Thandi from {BRAND.name}. Your Zanzibar quote <b>Q-1061</b> is ready: 8 nights, flights and transfers. Tap to view and accept.
        </Sent>
        <Sent on={sent(3)} icon={Mail} channel="Email to Naledi · 11:02">
          <b>Your quote is ready: Zanzibar, July 2027</b><br />Day by day, with prices and photos, and a button to accept.
        </Sent>
        <Sent on={sent(4)} icon={Bell} channel="Reminder to Thandi · day 3" tone="warm">
          Naledi hasn't opened Q-1061 in 3 days. Her last message: “Can we add Stone Town?”
        </Sent>
        <Sent on={sent(6)} icon={Building2} channel="Email to Thompsons · day 4">
          <b>New booking:</b> Zanzibar & Stone Town, 3 July 2027, 2 adults. Names and passport details attached.
        </Sent>
      </div>
    </div>
  );
}

function Sent({ on, icon: Icon, channel, tone, children }: { on: boolean; icon: typeof Bell; channel: string; tone?: "green" | "warm"; children: ReactNode }) {
  const bg = tone === "green" ? "bg-[#E7F8EE] border-[#16A34A]/20" : tone === "warm" ? "bg-[#FFF3E0] border-[#F08C2E]/30" : "bg-white border-[#0B2340]/8";
  return (
    <div className={`flex flex-col gap-2 rounded-[22px] border p-4 text-sm leading-relaxed transition duration-700 ${bg} ${on ? "translate-y-0 opacity-100" : "translate-y-3 opacity-35"}`}>
      <span className={`flex items-center gap-2 ${mono} text-[11px] ${muted}`}><Icon className="h-4 w-4" /> {channel}</span>
      <p>{children}</p>
    </div>
  );
}

/** The rules behind the flow, as the agency writes them in TribeTravel. Example rules. */
export function Rules() {
  const rules: [string, string][] = [
    ["When a quote isn't opened in 3 days", "remind the consultant on WhatsApp, with a suggested follow-up"],
    ["When a quote isn't sent in 4 hours", "alert a second consultant"],
    ["When a group departure has 3 seats left", "show “Almost full” on the website and tell the waiting list"],
    ["When a booking is confirmed", "email the supplier the booking and the travellers' names"],
    ["Seven days before departure", "send documents, transfer times and the WhatsApp number for help"],
  ];
  return (
    <ul className={`flex flex-col divide-y divide-[#0B2340]/8 ${card}`}>
      {rules.map(([when, then]) => (
        <li key={when} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-3">
          <b className={`${display} flex-none text-[17px] sm:w-[44%]`}>{when}</b>
          <span className={muted}>→ {then}</span>
        </li>
      ))}
    </ul>
  );
}
