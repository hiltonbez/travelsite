// Bookings with seat limits: group departures with live seat counters (example trips; a request reaches the agency as
// a real enquiry), and calls with a consultant whose times and seats come live from TribeTravel.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarClock, Check, Loader2, Users } from "lucide-react";
import { bookCall, callIcs, listSlots, type CallBooked, type Slots } from "@/lib/agency-extras";
import { useEnquiry } from "@/lib/enquiry";
import { rand } from "@/lib/packages";
import { BRAND, BotTrap, FormStatus, contact, tel } from "@/designs/shared";
import { DEPARTURES, type Departure } from "@/designs/atlas/content";
import { Consent, ExampleTag, LiveDot} from "@/designs/atlas/parts";
import { useInView } from "@/designs/atlas/hooks";
import { btn, card, display, input, label, mono, muted } from "@/designs/atlas/theme";

/** A row of seats: taken ones filled, free ones open. */
function SeatMeter({ d, left }: { d: Departure; left: number }) {
  const taken = d.seats - left;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1" aria-hidden="true">
        {Array.from({ length: d.seats }, (_, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-[4px] transition-colors duration-700 ${i < taken ? (left <= 3 ? "bg-[#F08C2E]" : "bg-[#1D6FD8]") : "border border-[#0B2340]/20 bg-white"}`} />
        ))}
      </div>
      <span className={`text-sm font-bold ${left === 0 ? "text-[#B42318]" : left <= 3 ? "text-[#8A3F00]" : "text-[#0B2340]"}`}>
        {left === 0 ? "Full · waiting list open" : `${left} of ${d.seats} seats left${left <= 3 ? " · almost full" : ""}`}
      </span>
    </div>
  );
}

/** Seats taken elsewhere while you look (example activity): now and then one goes on a departure with several left. */
function useSeats() {
  const [left, setLeft] = useState(() => Object.fromEntries(DEPARTURES.map((d) => [d.id, d.left])) as Record<string, number>);
  const [just, setJust] = useState("");
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  useEffect(() => {
    if (!seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let n = 0;
    const id = window.setInterval(() => {
      if (document.hidden || n >= 3) return;
      const d = DEPARTURES.filter((x) => x.left > 6)[n % 2];
      if (!d) return;
      n++;
      setLeft((l) => ({ ...l, [d.id]: Math.max(4, l[d.id]! - 1) }));
      setJust(d.id);
      window.setTimeout(() => setJust(""), 3000);
    }, 11000);
    return () => clearInterval(id);
  }, [seen]);
  return { ref, left, just };
}

export function Departures() {
  const { ref, left, just } = useSeats();
  const [pick, setPick] = useState<Departure | null>(null);
  const form = useRef<HTMLDivElement>(null);
  const choose = (d: Departure) => {
    setPick(d);
    requestAnimationFrame(() => form.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  return (
    <div ref={ref} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`flex items-center gap-2 ${label} ${muted}`}><LiveDot /> Seats update as people book</span>
        <ExampleTag>Example departures</ExampleTag>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {DEPARTURES.map((d) => {
          const l = left[d.id]!;
          return (
            <article key={d.id} className={`flex flex-col overflow-hidden transition ${card} ${pick?.id === d.id ? "ring-3 ring-[#1D6FD8]" : ""}`}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={d.image} alt={d.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <span className={`absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1.5 ${label} text-[#0B2340] backdrop-blur`}>{d.when}</span>
                {just === d.id && <span className="atlas-pop absolute top-3 right-3 rounded-full bg-[#F08C2E] px-3 py-1.5 text-xs font-bold text-[#0B2340]">A seat was just booked</span>}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-col gap-0.5">
                  <h3 className={`${display} text-[22px] leading-tight`}>{d.title}</h3>
                  <span className={`text-sm ${muted}`}>{d.nights} nights · {d.host}</span>
                </div>
                <SeatMeter d={d} left={l} />
                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                  <span className={`${mono} text-sm`}>From <b>{rand(d.from_pp)}</b> pp</span>
                  <button type="button" onClick={() => choose(d)} className={`${btn} min-h-11 px-5 text-sm`}>{l === 0 ? "Join waiting list" : "Request seats"}</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div ref={form}>{pick && <SeatRequest d={pick} left={left[pick.id]!} onClose={() => setPick(null)} />}</div>
    </div>
  );
}

/** Asking for seats on a departure: a real enquiry into TribeTravel, held for 24 hours by the consultant. */
function SeatRequest({ d, left, onClose }: { d: Departure; left: number; onClose: () => void }) {
  const [seats, setSeats] = useState(2);
  const { status, onSubmit, sending } = useEnquiry(() => ({
    destination: `${d.title} (group departure, ${d.when}, ${d.nights} nights)${left === 0 ? " — waiting list" : ""}`,
    travel_dates: d.when,
    travellers: `${seats} ${seats === 1 ? "seat" : "seats"}`,
  }));
  if (status.kind === "sent") {
    return (
      <div role="status" className={`atlas-pop flex flex-col items-start gap-3 p-6 ${card}`}>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16A34A] text-white"><Check className="h-6 w-6" /></span>
        <b className={`${display} text-2xl`}>{left === 0 ? "You're on the waiting list." : `We're holding ${seats} ${seats === 1 ? "seat" : "seats"} for you.`}</b>
        <p className={muted}>Your consultant confirms on WhatsApp and email within a day, with the full itinerary and price.</p>
        <button type="button" onClick={onClose} className="text-sm font-bold text-[#1D6FD8] underline underline-offset-4">Look at other departures</button>
      </div>
    );
  }
  const most = Math.max(1, Math.min(left || 6, 8));
  return (
    <form onSubmit={onSubmit} className={`atlas-pop grid gap-4 p-5 sm:p-7 ${card}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className={`${label} text-[#1D6FD8]`}>{left === 0 ? "Waiting list" : "Request seats"}</span>
          <b className={`${display} text-2xl`}>{d.title} · {d.when}</b>
        </div>
        <button type="button" onClick={onClose} className={`min-h-11 rounded-full px-4 text-sm font-bold ${muted} hover:bg-[#EEF5FE]`}>Cancel</button>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">How many seats?</legend>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: most }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" aria-pressed={seats === n} onClick={() => setSeats(n)}
              className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold transition ${seats === n ? "border-[#1D6FD8] bg-[#1D6FD8] text-white" : "border-[#0B2340]/12 bg-white hover:border-[#1D6FD8]"}`}>{n}</button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold">Name<input name="name" required autoComplete="name" className={input} /></label>
        <label className="grid gap-1 text-sm font-semibold">Email<input name="email" type="email" required autoComplete="email" className={input} /></label>
        <label className="grid gap-1 text-sm font-semibold">Mobile<input name="phone" type="tel" autoComplete="tel" className={input} /></label>
      </div>
      <Consent />
      <BotTrap />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={sending} className={btn}><Users className="h-4 w-4" /> {sending ? "Sending…" : left === 0 ? "Join the waiting list" : `Hold ${seats} ${seats === 1 ? "seat" : "seats"}`}</button>
        <span className={`text-sm ${muted}`}>{rand(d.from_pp * seats)} for {seats}, from. No payment now.</span>
      </div>
      <FormStatus status={status} className="font-semibold" />
    </form>
  );
}

/** Calls with a consultant, with live times and seats from TribeTravel. */
export function CallSlots() {
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
      setBooked(await bookCall({ start: pick, name: text("name"), email: text("email"), phone: text("phone"), topic: text("topic"), website: fd.get("botcheck") ? "bot" : "" }));
    } catch (err) {
      setError((err as Error).message);
      setPick(null);
      load();                                 // someone else may have just taken that time
    } finally {
      setBusy(false);
    }
  }

  function calendarLink(c: CallBooked) {
    return URL.createObjectURL(new Blob([callIcs(c, `Call with ${BRAND.name}`)], { type: "text/calendar" }));
  }

  const on = "border-[#1D6FD8] bg-[#1D6FD8] text-white";
  const off = "border-[#0B2340]/12 bg-white hover:border-[#1D6FD8]";
  return (
    <div className={`min-w-0 p-5 sm:p-7 ${card}`}>
      {booked ? (
        <div className="atlas-pop flex flex-col items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#16A34A] text-white"><Check className="h-7 w-7" /></span>
          <h3 className={`${display} text-3xl leading-tight`}>You're booked for {booked.label}.</h3>
          <p className={muted}>A {booked.minutes}-minute call. Your consultant has been told and will call you then.</p>
          <a href={calendarLink(booked)} download="call.ics" className={btn}><CalendarClock className="h-4 w-4" /> Add to my calendar</a>
        </div>
      ) : slots === null ? (
        <div className={`flex items-center gap-3 ${muted}`}><Loader2 className="h-5 w-5 animate-spin" /> Loading times…</div>
      ) : typeof slots === "string" || days.length === 0 ? (
        <p className={muted}>
          {typeof slots === "string" ? slots : "There are no times open in the next two weeks."} Our number is{" "}
          <a href={tel} className="font-bold text-[#1D6FD8]">{contact.phoneDisplay}</a>.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]" role="tablist" aria-label="Day">
            {days.map((d, i) => {
              const full = d.slots.every((s) => s.left === 0);
              return (
                <button key={d.date} type="button" role="tab" aria-selected={i === day} onClick={() => { setDay(i); setPick(null); }}
                  className={`flex min-h-14 flex-none flex-col items-center justify-center rounded-2xl border px-4 text-sm transition ${i === day ? on : off} ${full && i !== day ? "opacity-50" : ""}`}>
                  <b>{d.label.split(" ")[0]}</b>
                  <span className={`${mono} text-xs`}>{d.label.split(" ").slice(1).join(" ")}</span>
                </button>
              );
            })}
          </div>
          {dayFull && nextFree && (
            <p className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#FFF3E0] px-4 py-3 text-sm">
              This day is fully booked. Next free time: <b>{nextFree.slice(11)} on {days.find((d) => d.date === nextFree.slice(0, 10))?.label}</b>
              <button type="button" onClick={() => goTo(nextFree)} className="min-h-11 font-bold text-[#1D6FD8] underline underline-offset-4">Pick it</button>
            </p>
          )}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Time">
            {today?.slots.map((s) => (
              <button key={s.start} type="button" role="radio" aria-checked={pick === s.start} disabled={s.left === 0} onClick={() => setPick(s.start)}
                className={`flex min-h-14 flex-col items-center justify-center rounded-2xl border ${mono} text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${pick === s.start ? on : off}`}>
                {s.time}
                <span className="text-[10px] font-normal tracking-wide">{s.left === 0 ? "Full" : `${s.left} ${s.left === 1 ? "seat" : "seats"}`}</span>
              </button>
            ))}
          </div>
          {error && <p role="alert" className="text-sm font-semibold text-[#B42318]">{error}</p>}
          {pick && (
            <form onSubmit={onSubmit} className="atlas-pop grid gap-3 border-t border-[#0B2340]/8 pt-6">
              <p className={`text-sm ${muted}`}>Your call: <b className="text-[#0B2340]">{today?.label} at {pick.slice(11)}</b> ({typeof slots === "object" ? slots.minutes : 30} minutes)</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="name" required autoComplete="name" placeholder="Your name" aria-label="Your name" className={input} />
                <input name="phone" type="tel" required autoComplete="tel" placeholder="Mobile number" aria-label="Mobile number" className={input} />
              </div>
              <input name="email" type="email" required autoComplete="email" placeholder="Email" aria-label="Email" className={input} />
              <input name="topic" placeholder="What would you like to talk about? (optional)" aria-label="What would you like to talk about?" className={input} />
              <BotTrap />
              <Consent />
              <button type="submit" disabled={busy} className={`${btn} min-h-14`}>{busy ? "Booking…" : "Book my call"}</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
