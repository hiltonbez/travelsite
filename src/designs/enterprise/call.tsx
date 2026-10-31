// Stop 3: booking a call with a consultant, with live seats from TribeTravel.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarClock, Check, Loader2 } from "lucide-react";
import { bookCall, callIcs, listSlots, type CallBooked, type Slots } from "@/lib/agency-extras";
import { useOnScroll } from "@/designs/flight-path";
import { BRAND, BotTrap, contact, tel } from "@/designs/shared";
import { Consent, StopLabel } from "@/designs/enterprise/parts";
import { btn, display, ghost, gutter, h2, input, label, mono, orange, panel, soft } from "@/designs/enterprise/theme";

/** A clock face whose hands turn as the page scrolls. */
function ScrollClock() {
  const hour = useRef<SVGLineElement>(null);
  const minute = useRef<SVGLineElement>(null);
  useOnScroll((y, reduced) => {
    const t = reduced ? 0 : y / 18;
    minute.current?.setAttribute("transform", `rotate(${t * 6} 100 100)`);
    hour.current?.setAttribute("transform", `rotate(${300 + t / 2} 100 100)`);
  });
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className="w-full max-w-[260px]">
      <circle cx="100" cy="100" r="92" fill="#111D33" stroke="#EDE6D8" strokeOpacity=".5" strokeWidth="1.5" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="100" y1="14" x2="100" y2={i % 3 ? 22 : 30} stroke="#EDE6D8" strokeWidth={i % 3 ? 1.5 : 3} transform={`rotate(${i * 30} 100 100)`} />
      ))}
      <line ref={hour} x1="100" y1="100" x2="100" y2="54" stroke="#EDE6D8" strokeWidth="5" strokeLinecap="round" transform="rotate(300 100 100)" />
      <line ref={minute} x1="100" y1="100" x2="100" y2="26" stroke="#FF6A2E" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="100" r="5" fill="#FF6A2E" />
    </svg>
  );
}

export function BookCall() {
  // null while loading; a string when TribeTravel couldn't give times (switched off, or unreachable)
  const [slots, setSlots] = useState<Slots | string | null>(null);
  const [day, setDay] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [booked, setBooked] = useState<CallBooked | null>(null);

  const load = () => listSlots().then(setSlots).catch((e: Error) => setSlots(e.message));
  useEffect(() => { load(); }, []);

  const days = typeof slots === "object" && slots ? slots.days : [];
  const today = days[day];
  const dayFull = !!today && today.slots.every((s) => s.left === 0);
  const nextFree = typeof slots === "object" && slots ? slots.next_free : null;

  function goTo(start: string) {
    const i = days.findIndex((d) => d.date === start.slice(0, 10));
    if (i >= 0) setDay(i);
    setPick(start);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pick) return;
    const fd = new FormData(e.currentTarget);
    const text = (k: string) => String(fd.get(k) || "").trim();
    setBusy(true);
    setError("");
    try {
      setBooked(await bookCall({ start: pick, name: text("name"), email: text("email"), phone: text("phone"),
        topic: text("topic"), website: fd.get("botcheck") ? "bot" : "" }));
    } catch (err) {
      setError((err as Error).message);
      setPick(null);
      load();                                 // someone else may have just taken that time
    } finally {
      setBusy(false);
    }
  }

  function calendarLink(c: CallBooked) {
    const blob = new Blob([callIcs(c, `Call with ${BRAND.name}`)], { type: "text/calendar" });
    return URL.createObjectURL(blob);
  }

  const slotBtn = "flex min-h-12 flex-col items-center justify-center rounded-xl border text-sm font-semibold transition";
  const on = "border-[#FF6A2E] bg-[#FF6A2E] text-[#0B1424]";
  const off = "border-[#EDE6D8]/20 bg-[#0B1424] hover:border-[#FF6A2E]";
  return (
    <section id="call" data-stop className={`relative z-10 grid scroll-mt-20 items-start gap-12 ${gutter} py-24 md:py-28 lg:grid-cols-[.8fr_1.2fr]`}>
      <div className="flex flex-col gap-5 lg:sticky lg:top-28">
        <StopLabel><CalendarClock className="h-4 w-4" /> Stop 3 · Talk to a consultant</StopLabel>
        <h2 className={h2}>Your time, <span className={orange}>not ours.</span></h2>
        <p className={`text-lg leading-relaxed ${soft}`}>
          Pick a time and one of our consultants calls you to plan your trip. Times are live: when one fills up, we show you the next free one.
        </p>
        <div className="hidden pt-4 lg:block"><ScrollClock /></div>
      </div>
      <div className={`min-w-0 p-6 md:p-8 ${panel}`}>
        {booked ? (
          <div className="d-slide flex flex-col items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF6A2E] text-[#0B1424]"><Check className="h-7 w-7" /></span>
            <h3 className={`${display} text-3xl leading-tight`}>You're booked for {booked.label}.</h3>
            <p className={soft}>A {booked.minutes}-minute call. Your consultant has been told and will call you then.</p>
            <a href={calendarLink(booked)} download="call.ics" className={btn}>
              <CalendarClock className="h-4 w-4" /> Add to my calendar
            </a>
          </div>
        ) : slots === null ? (
          <div className={`flex items-center gap-3 ${soft}`}><Loader2 className="h-5 w-5 animate-spin" /> Loading times…</div>
        ) : typeof slots === "string" || days.length === 0 ? (
          <p className={soft}>
            {typeof slots === "string" ? slots : "There are no times open in the next two weeks."} Our number is{" "}
            <a href={tel} className={`font-semibold ${orange}`}>{contact.phoneDisplay}</a>.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]" role="tablist" aria-label="Day">
              {days.map((d, i) => {
                const full = d.slots.every((s) => s.left === 0);
                return (
                  <button key={d.date} type="button" role="tab" aria-selected={i === day} onClick={() => { setDay(i); setPick(null); }}
                    className={`flex min-h-14 flex-none flex-col items-center justify-center rounded-2xl border px-4 text-sm transition ${i === day ? on : off} ${full && i !== day ? "opacity-45" : ""}`}>
                    <b>{d.label.split(" ")[0]}</b>
                    <span className={`${mono} text-xs`}>{d.label.split(" ").slice(1).join(" ")}</span>
                  </button>
                );
              })}
            </div>
            {dayFull && nextFree && (
              <p className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#FF6A2E]/40 bg-[#FF6A2E]/10 px-4 py-3 text-sm">
                This day is fully booked. Next free time: <b>{nextFree.slice(11)} on {days.find((d) => d.date === nextFree.slice(0, 10))?.label}</b>
                <button type="button" onClick={() => goTo(nextFree)} className={`font-semibold underline underline-offset-4 ${orange}`}>Pick it</button>
              </p>
            )}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Time">
              {today?.slots.map((s) => (
                <button key={s.start} type="button" role="radio" aria-checked={pick === s.start} disabled={s.left === 0} onClick={() => setPick(s.start)}
                  className={`${slotBtn} ${mono} disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${pick === s.start ? on : off}`}>
                  {s.time}
                  {s.left === 0 && <span className="text-[10px] font-normal uppercase tracking-wider no-underline">Full</span>}
                </button>
              ))}
            </div>
            {error && <p role="alert" className="text-sm font-semibold text-[#F87171]">{error}</p>}
            {pick && (
              <form onSubmit={onSubmit} className="d-slide grid gap-3 border-t border-[#EDE6D8]/10 pt-6">
                <p className={`text-sm ${soft}`}>Your call: <b className="text-[#EDE6D8]">{today?.label} at {pick.slice(11)}</b> ({typeof slots === "object" ? slots.minutes : 30} minutes)</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="name" required autoComplete="name" placeholder="Your name" aria-label="Your name" className={input} />
                  <input name="phone" type="tel" required autoComplete="tel" placeholder="Mobile number" aria-label="Mobile number" className={input} />
                </div>
                <input name="email" type="email" required autoComplete="email" placeholder="Email" aria-label="Email" className={input} />
                <input name="topic" placeholder="What would you like to talk about? (optional)" aria-label="What would you like to talk about?" className={input} />
                <BotTrap />
                <Consent />
                <button type="submit" disabled={busy} className={`${btn} min-h-14`}>
                  {busy ? "Booking…" : "Book my call"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
