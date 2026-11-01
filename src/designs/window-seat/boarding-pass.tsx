// The quote request as a boarding pass: from, to, dates, passengers and who's flying. It sends a real enquiry to the
// agency's TribeTravel inbox (lib/enquiry.ts). Once it's sent, the stub tears off along the perforation and the pass
// says "You're checked in".
import { useEffect, useState } from "react";
import { Minus, Plane, Plus, RotateCcw } from "lucide-react";
import { useEnquiry } from "@/lib/enquiry";
import { DESTINATIONS } from "@/designs/enterprise/content";
import { BRAND, BotTrap, FormStatus } from "@/designs/shared";
import { Barcode, Seatbelt } from "@/designs/window-seat/parts";
import { display, label, mono, soft } from "@/designs/window-seat/theme";

const FROM: [string, string][] = [["JNB", "Johannesburg"], ["CPT", "Cape Town"], ["DUR", "Durban"]];
const ELSEWHERE = "Somewhere else (tell us below)";

/** The airport code for a place on the pass, or "ANY" when we don't know it. */
const codeFor = (place: string) => DESTINATIONS.find((d) => d.name === place)?.code ?? "ANY";

/** "2027-03-12" -> "12 March 2027". */
function day(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return value;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

type CheckedIn = { name: string; to: string; code: string; ref: string };

/** Reads `?to=` (a destination's name or slug, or any place) so a "Plan this trip" link fills in the pass. */
function askedFor() {
  const to = new URLSearchParams(window.location.search).get("to")?.trim() ?? "";
  const d = DESTINATIONS.find((x) => x.slug === to.toLowerCase() || x.name.toLowerCase() === to.toLowerCase());
  return d ? d.name : to.slice(0, 60);
}

export function BoardingPass({ place, id }: { place?: string; id?: string }) {
  const [to, setTo] = useState(place ?? "");
  const [from, setFrom] = useState("JNB");
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [checkedIn, setCheckedIn] = useState<CheckedIn | null>(null);
  const [stubGone, setStubGone] = useState(false);

  useEffect(() => {
    if (place) return;
    const asked = askedFor();
    if (asked) setTo(asked);
  }, [place]);

  const places = DESTINATIONS.map((d) => d.name);
  const extra = to && !places.includes(to) && to !== ELSEWHERE ? to : "";

  const { status, onSubmit, sending, reset } = useEnquiry((fd) => {
    const depart = String(fd.get("depart") ?? ""), back = String(fd.get("return") ?? "");
    const note = String(fd.get("note") ?? "").trim();
    const name = String(fd.get("name") ?? "").trim();
    const fromName = FROM.find(([c]) => c === from)?.[1] ?? from;
    const dest = to && to !== ELSEWHERE ? to : "Not sure yet";
    setCheckedIn({ name: name.split(/\s+/)[0] || name, to: dest, code: codeFor(to), ref: `SS${String(Date.now()).slice(-4)}` });
    return {
      destination: dest,
      travel_dates: [depart && `${day(depart)}`, back && `back ${day(back)}`].filter(Boolean).join(", ") || "Flexible",
      travellers: [plural(adults, "adult", "adults"), kids ? plural(kids, "child", "children") : ""].filter(Boolean).join(", "),
      message: [`Flying from ${fromName} (${from}).`, note].filter(Boolean).join("\n"),
    };
  });

  function again() {
    reset();
    setCheckedIn(null);
    setStubGone(false);
  }

  const torn = status.kind === "sent";
  const fieldLabel = `${label} text-[#1C2340]/65`;
  const line = "min-h-11 w-full border-0 border-b-2 border-[#1C2340]/15 bg-transparent p-0 text-[17px] font-semibold text-[#1C2340] outline-none [color-scheme:light] focus:border-[#C2410C]";
  const step = "flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#1C2340]/15 transition hover:border-[#1C2340] disabled:opacity-35";
  const code = to && to !== ELSEWHERE ? codeFor(to) : "ANY";

  return (
    <div className="flex flex-col gap-4">
      <form id={id} onSubmit={onSubmit} aria-label="Quote request boarding pass"
        className="ws-pass relative grid scroll-mt-28 overflow-visible text-[#1C2340] md:grid-cols-[1fr_250px]">
        {/* The pass itself */}
        <div className="relative flex min-w-0 flex-col overflow-hidden rounded-t-[26px] bg-[#FFFDF8] shadow-[0_40px_70px_-40px_rgba(28,35,64,.6)] md:rounded-l-[26px] md:rounded-tr-none">
          <div className="ws-sky flex items-center justify-between gap-3 px-5 py-3.5 md:px-7">
            <span className={`${label} font-medium text-[#1C2340]`}>{BRAND.name} · Boarding pass</span>
            <Plane className="h-5 w-5 flex-none" aria-hidden="true" />
          </div>

          {torn && checkedIn ? (
            <div role="status" className="ws-pop flex flex-1 flex-col items-start justify-center gap-4 p-6 md:p-8">
              <span className={`${label} text-[#15803D]`}>Request sent · Ref {checkedIn.ref}</span>
              <p className={`${display} text-[clamp(32px,4.4vw,52px)] leading-none`}>You're checked in{checkedIn.name ? `, ${checkedIn.name}` : ""}.</p>
              <p className={`max-w-[46ch] text-[16px] leading-relaxed ${soft}`}>
                Your request for <b className="text-[#1C2340]">{checkedIn.to}</b> is with our team. A real person will come back to you within a day with ideas and a quote in rand.
              </p>
              <button type="button" onClick={again} className="flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4">
                <RotateCcw className="h-4 w-4" /> Request another trip
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 p-5 md:p-7">
              {/* FROM → TO, with the plane hopping across when the destination changes */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                <label className="flex min-w-0 flex-col gap-1">
                  <span className={fieldLabel}>From</span>
                  <span className={`${display} text-[clamp(40px,7vw,64px)] leading-none`} aria-hidden="true">{from}</span>
                  <select name="from" value={from} onChange={(e) => setFrom(e.target.value)} className={`${line} text-[15px] font-medium`}>
                    {FROM.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                  </select>
                </label>
                <span aria-hidden="true" className="relative mb-14 flex w-[clamp(48px,12vw,120px)] items-center">
                  <span className="h-0 w-full border-t-2 border-dashed border-[#1C2340]/25" />
                  <Plane key={code} className="ws-hop absolute h-5 w-5 rotate-45 text-[#C2410C]" />
                </span>
                <label className="flex min-w-0 flex-col gap-1 text-right">
                  <span className={fieldLabel}>To</span>
                  <span key={code} className={`ws-flap ${display} text-[clamp(40px,7vw,64px)] leading-none text-[#C2410C]`} aria-hidden="true">{code}</span>
                  <select name="destination" value={to} onChange={(e) => setTo(e.target.value)} className={`${line} text-right text-[15px] font-medium`}>
                    <option value="">Choose a place</option>
                    {places.map((p) => <option key={p} value={p}>{p}</option>)}
                    {extra && <option value={extra}>{extra}</option>}
                    <option value={ELSEWHERE}>{ELSEWHERE}</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Depart</span>
                  <input type="date" name="depart" className={line} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Return</span>
                  <input type="date" name="return" className={line} />
                </label>
              </div>

              <fieldset className="flex flex-wrap gap-x-8 gap-y-3">
                <legend className={`${fieldLabel} mb-2`}>Passengers</legend>
                {([["Adults", adults, setAdults, 1], ["Children", kids, setKids, 0]] as const).map(([name, n, set, min]) => (
                  <div key={name} className="flex items-center gap-3">
                    <button type="button" className={step} aria-label={`One fewer ${name.toLowerCase()}`} disabled={n <= min} onClick={() => set(Math.max(min, n - 1))}><Minus className="h-4 w-4" /></button>
                    <span className="min-w-[78px] text-center text-[17px] font-semibold" aria-live="polite">{n} {name.toLowerCase()}</span>
                    <button type="button" className={step} aria-label={`One more ${name.toLowerCase()}`} disabled={n >= 9} onClick={() => set(Math.min(9, n + 1))}><Plus className="h-4 w-4" /></button>
                  </div>
                ))}
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Passenger name</span>
                  <input name="name" required autoComplete="name" className={line} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Email</span>
                  <input type="email" name="email" required autoComplete="email" className={line} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Phone (optional)</span>
                  <input type="tel" name="phone" autoComplete="tel" className={line} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={fieldLabel}>Anything else? (optional)</span>
                  <input name="note" maxLength={600} placeholder="A honeymoon, a budget, a birthday…" className={`${line} placeholder:font-normal placeholder:text-[#4A5068]/60`} />
                </label>
              </div>
              <Seatbelt />
              <BotTrap />
            </div>
          )}
        </div>

        {/* The stub, joined along the perforation; it tears away once the request is sent */}
        <div className={`ws-stub relative flex flex-col justify-between gap-5 rounded-b-[26px] bg-[#FFFDF8] p-5 shadow-[0_40px_70px_-40px_rgba(28,35,64,.6)] md:rounded-r-[26px] md:rounded-bl-none md:p-7 ${torn ? "ws-tear" : ""} ${stubGone ? "hidden" : ""}`}
          aria-hidden={torn || undefined} onAnimationEnd={(e) => { if (torn && e.target === e.currentTarget) setStubGone(true); }}>
          <span aria-hidden="true" className="ws-perf absolute" />
          <div className={`grid grid-cols-2 gap-4 ${label} text-[#1C2340]/65 md:grid-cols-1`}>
            <span className="flex flex-col gap-1">Flight<b className={`${mono} text-lg font-medium tracking-normal text-[#1C2340] normal-case`}>{from} → {code}</b></span>
            <span className="flex flex-col gap-1">Seat<b className={`${mono} text-lg font-medium tracking-normal text-[#1C2340]`}>12A · Window</b></span>
            <span className="flex flex-col gap-1">Gate<b className={`${mono} text-lg font-medium tracking-normal text-[#1C2340]`}>Quote within 24h</b></span>
            <span className="flex flex-col gap-1">Pax<b className={`${mono} text-lg font-medium tracking-normal text-[#1C2340]`}>{adults + kids}</b></span>
          </div>
          <Barcode className="h-12 w-full text-[#1C2340]" />
          {!torn && (
            <button type="submit" disabled={sending} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#1C2340] px-6 text-[16px] font-semibold text-[#FFF7EC] transition hover:bg-[#2B3560] disabled:cursor-wait disabled:opacity-60">
              {sending ? "Checking you in…" : "Check in"} <Plane className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>
      {status.kind === "error" && <FormStatus status={status} className="text-[#B42318]" />}
      {!torn && <p className={`text-[13px] ${soft}`}>Free, with no obligation. A real person prices every quote.</p>}
    </div>
  );
}
