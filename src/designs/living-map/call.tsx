// "Pencil in a call": book a call with a consultant at a real time from TribeTravel, each time with a limited number
// of places (lib/agency-extras.ts). If the agency hasn't switched call times on, or TribeTravel can't be reached, it
// says so and gives the phone number instead.
import { useEffect, useState, type FormEvent } from "react";
import { CalendarClock, Check, Loader2 } from "lucide-react";
import { bookCall, listSlots, type CallBooked, type Slots } from "@/lib/agency-extras";
import { BotTrap, contact, tel } from "@/designs/shared";
import { Consent, SectionHead } from "@/designs/living-map/parts";
import { accent, btn, card, display, gutter, hand, input, soft } from "@/designs/living-map/theme";

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

  const chip = "flex min-h-12 flex-none flex-col items-center justify-center rounded-md border px-3 text-sm transition";
  const on = "border-(--lm-accent) bg-(--lm-accent) text-(--lm-on-accent)";
  const off = "border-(--lm-line) bg-(--lm-field) hover:border-(--lm-accent)";
  return (
    <section id="call" data-pin className={`relative z-10 grid scroll-mt-24 items-start gap-10 ${gutter} py-20 lg:grid-cols-[.8fr_1.2fr]`}>
      <SectionHead kicker={<><CalendarClock className="h-4 w-4" /> Talk to a consultant</>} title={<>Pencil in <em>a call.</em></>}
        intro="Pick a time and one of our consultants phones you to plan your trip. Each time has a few places; when it fills up, it's crossed off." />
      <div className={`min-w-0 p-5 md:p-7 ${card}`}>
        {booked ? (
          <div role="status" className="lm-rise flex flex-col items-start gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--lm-accent) text-(--lm-on-accent)"><Check className="h-7 w-7" /></span>
            <h3 className={`${display} text-3xl leading-tight`}>See you {booked.label}.</h3>
            <p className={soft}>A {booked.minutes}-minute call. Your consultant has it in their calendar and will phone you then.</p>
          </div>
        ) : slots === null ? (
          <p className={`flex items-center gap-3 ${soft}`}><Loader2 className="h-5 w-5 animate-spin" /> Loading times…</p>
        ) : typeof slots === "string" || days.length === 0 ? (
          <p className={soft}>
            {typeof slots === "string" ? slots : "There are no call times open in the next two weeks."} Phone us on{" "}
            <a href={tel} className={`font-semibold underline ${accent}`}>{contact.phoneDisplay}</a> instead.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Day">
              {days.map((d, i) => (
                <button key={d.date} type="button" role="tab" aria-selected={i === day} onClick={() => { setDay(i); setPick(null); }} className={`${chip} ${i === day ? on : off}`}>
                  <b>{d.label.split(" ")[0]}</b><span className="text-xs">{d.label.split(" ").slice(1).join(" ")}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Time">
              {today?.slots.map((s) => (
                <button key={s.start} type="button" role="radio" aria-checked={pick === s.start} disabled={s.left === 0} onClick={() => setPick(s.start)}
                  className={`${chip} disabled:cursor-not-allowed disabled:line-through disabled:opacity-45 ${pick === s.start ? on : off}`}>
                  <b className="tabular-nums">{s.time}</b>
                  <span className="text-[11px]">{s.left === 0 ? "full" : `${s.left} left`}</span>
                </button>
              ))}
            </div>
            {error && <p role="alert" className="text-sm font-semibold">{error}</p>}
            {pick && (
              <form onSubmit={onSubmit} className="lm-rise grid gap-3 border-t border-dashed border-(--lm-line) pt-5">
                <p className={`${hand} text-2xl ${accent}`}>{today?.label} at {pick.slice(11)}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold">Your name<input name="name" required autoComplete="name" className={input} /></label>
                  <label className="grid gap-1 text-sm font-semibold">Mobile<input name="phone" type="tel" required autoComplete="tel" className={input} /></label>
                </div>
                <label className="grid gap-1 text-sm font-semibold">Email<input name="email" type="email" required autoComplete="email" className={input} /></label>
                <label className="grid gap-1 text-sm font-semibold">What would you like to talk about? (optional)<input name="topic" className={input} /></label>
                <BotTrap />
                <Consent />
                <button type="submit" disabled={busy} className={`${btn} min-h-14`}>{busy ? "Booking…" : "Book my call"}</button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
