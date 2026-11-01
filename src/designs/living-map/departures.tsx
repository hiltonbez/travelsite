// Group departures with seat limits (Tribe Site Pro: bookings with seat limits). Each departure has a little plane or
// coach seat map that fills up as it scrolls into view; on the booking page the visitor picks free seats, which light
// up, and sends the request as a real enquiry into TribeTravel with the departure and seats in the message. The
// departures themselves are examples for this sample site.
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Bus, Check, Plane } from "lucide-react";
import { useEnquiry } from "@/lib/enquiry";
import { BotTrap, FormStatus } from "@/designs/shared";
import { DEPARTURES, destination, seatsIn, seatsLeft, type Departure } from "@/designs/living-map/content";
import { Consent, Example, SectionHead } from "@/designs/living-map/parts";
import { BASE, accent, btn, caps, card, display, ghost, gutter, hand, input, soft } from "@/designs/living-map/theme";

const LETTERS = ["A", "B", "C", "D"] as const;

/** How many of the taken seats are inked in: all of them on the server and with reduced motion; otherwise they fill
 *  one by one once the map is on screen. */
function useFill(total: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(total);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setFilled(0);
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      let n = 0;
      timer = window.setInterval(() => {
        n += 1;
        setFilled(n);
        if (n >= total) window.clearInterval(timer);
      }, 140);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); window.clearInterval(timer); };
  }, [total]);
  return { ref, filled };
}

/** The seats left, said plainly. */
export function SeatsLeft({ d, left = seatsLeft(d) }: { d: Departure; left?: number }) {
  const low = left <= 4;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${low ? "bg-(--lm-accent) text-(--lm-on-accent)" : "border border-(--lm-line)"}`}>
      {left === 0 ? "Full" : `${left} of ${seatsIn(d)} seats left`}
    </span>
  );
}

/** A plane or coach, seen from above, with its seats. Taken seats are inked in; with `onToggle` the free ones can be
 *  picked. */
export function SeatMap({ d, picked = [], onToggle, onLeft }: {
  d: Departure; picked?: string[]; onToggle?: (seat: string) => void; onLeft?: (left: number) => void;
}) {
  const { ref, filled } = useFill(d.taken.length);
  const shown = new Set(d.taken.slice(0, filled));
  const left = seatsIn(d) - shown.size;
  useEffect(() => { onLeft?.(left); }, [left, onLeft]);
  const plane = d.vehicle === "plane";

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div role="group" aria-label={`Seat map: ${d.name}, ${seatsLeft(d)} of ${seatsIn(d)} seats free`}
        className={`relative flex flex-col gap-1.5 border-2 border-(--lm-ink)/70 bg-(--lm-field) px-4 pb-5 ${plane ? "rounded-t-[120px] rounded-b-[28px] pt-20" : "rounded-[22px] pt-14"}`}>
        {/* The front: a cockpit window, or the driver's wheel and the door */}
        {plane ? (
          <svg aria-hidden="true" viewBox="0 0 80 30" className="absolute top-5 left-1/2 w-16 -translate-x-1/2">
            <path d="M8 26 Q40 -6 72 26" fill="none" stroke="var(--lm-ink)" strokeOpacity=".5" strokeWidth="2" />
            <path d="M22 24 Q40 8 58 24" fill="none" stroke="var(--lm-ink)" strokeOpacity=".3" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
        ) : (
          <>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute top-3 left-5 h-8 w-8 text-(--lm-ink)/60">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 12h18M12 12v9" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span aria-hidden="true" className={`absolute top-4 right-0 h-8 w-1.5 rounded-l bg-(--lm-ink)/40`} />
          </>
        )}
        {Array.from({ length: d.rows }, (_, r) => (
          <div key={r} className="flex items-center gap-1.5">
            {LETTERS.map((l, i) => {
              const seat = `${r + 1}${l}`;
              const taken = d.taken.includes(seat);
              const inked = shown.has(seat);
              const mine = picked.includes(seat);
              const cls = `lm-seat-fill flex h-11 w-11 items-center justify-center rounded-t-[12px] rounded-b-[5px] border-[1.5px] text-xs font-semibold ${
                mine ? "scale-105 border-(--lm-accent) bg-(--lm-accent) text-(--lm-on-accent)"
                  : inked ? "border-(--lm-ink)/60 bg-(--lm-ink)/70 text-(--lm-paper)"
                  : "border-(--lm-ink)/45 bg-transparent"}`;
              const seatEl = onToggle ? (
                <button key={l} type="button" disabled={taken} aria-pressed={mine} onClick={() => onToggle(seat)}
                  aria-label={`Seat ${seat}, ${taken ? "taken" : mine ? "picked" : "free"}`}
                  className={`${cls} ${taken ? "cursor-not-allowed" : "hover:border-(--lm-accent)"}`}>
                  {mine ? <Check className="h-4 w-4" /> : taken ? "×" : seat}
                </button>
              ) : (
                <span key={l} aria-hidden="true" className={cls}>{inked ? "×" : seat}</span>
              );
              return i === 2 ? [<span key="aisle" aria-hidden="true" className={`w-6 text-center ${hand} text-base ${soft}`}>{r + 1}</span>, seatEl] : seatEl;
            })}
          </div>
        ))}
      </div>
      <p className={`flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs ${soft}`} aria-hidden="true">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-(--lm-ink)/45" /> Free</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-(--lm-ink)/70" /> Taken</span>
        {onToggle && <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-(--lm-accent)" /> Yours</span>}
      </p>
    </div>
  );
}

/** One departure as a page from the journal: photo, details, the seat map filling up, and a link to pick seats. */
export function DepartureCard({ d, i = 0 }: { d: Departure; i?: number }) {
  const place = destination(d.place);
  const [left, setLeft] = useState(seatsLeft(d));
  const Icon = d.vehicle === "plane" ? Plane : Bus;
  return (
    <article className={`grid gap-6 p-5 md:p-7 lg:grid-cols-[1fr_auto] ${card}`} style={{ transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)` }}>
      <div className="flex min-w-0 flex-col gap-4">
        {place && (
          <img src={place.photos[1]} alt={place.name} loading="lazy" className="aspect-[16/9] w-full rounded-[4px] object-cover sepia-[.15]" />
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`flex items-center gap-1.5 ${caps} ${accent}`}><Icon className="h-4 w-4" /> {d.dates}</span>
          <Example>Example departure</Example>
        </div>
        <h3 className={`${display} text-3xl leading-tight`}>{d.name}</h3>
        <p className={soft}>{d.includes}</p>
        <div className="mt-auto flex flex-wrap items-center gap-3">
          <span className="text-lg"><b>{d.price}</b> <span className={`text-sm ${soft}`}>pp sharing · {d.nights} nights</span></span>
          <SeatsLeft d={d} left={left} />
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={`${BASE}/book?trip=${d.slug}`} className={btn}>Choose my seats <ArrowRight className="h-4 w-4" /></a>
          {place && <a href={`${BASE}/destinations/${place.slug}`} className={ghost}>About {place.name.split(" ")[0]}</a>}
        </div>
      </div>
      <SeatMap d={d} onLeft={setLeft} />
    </article>
  );
}

/** The home page's departures: the next two, with their seat maps. */
export function DeparturesStrip() {
  return (
    <section data-pin className={`relative z-10 flex flex-col gap-10 ${gutter} py-24`}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead kicker="Group departures · limited seats" title={<>Save me <em>a seat.</em></>}
          intro="Small group trips with a set number of seats. Watch them fill up, pick yours on the seat map, and we hold it while we confirm."
          note="When it's full, it's full!" />
        <a href={`${BASE}/departures`} className={ghost}>All departures <ArrowRight className="h-4 w-4" /></a>
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        {DEPARTURES.slice(0, 2).map((d, i) => <DepartureCard key={d.slug} d={d} i={i} />)}
      </div>
    </section>
  );
}

/** The booking page's heart: pick a departure, pick seats, send the request. */
export function SeatBooking() {
  const [slug, setSlug] = useState(DEPARTURES[0]!.slug);
  const [picked, setPicked] = useState<string[]>([]);
  const d = DEPARTURES.find((x) => x.slug === slug) ?? DEPARTURES[0]!;
  const left = seatsLeft(d);
  const { status, onSubmit, sending } = useEnquiry((fd) => ({
    destination: `${d.name} (group departure)`,
    travel_dates: d.dates,
    travellers: `${picked.length} ${picked.length === 1 ? "seat" : "seats"}`,
    message: `Seat request: ${d.name}, ${d.dates}. Seats ${picked.join(", ")} (${picked.length} of the ${left} left). ${d.price} pp sharing.\n${String(fd.get("extra") ?? "").trim()}`.trim(),
  }));

  // A link from a departure card (?trip=…) opens that departure.
  useEffect(() => {
    const trip = new URLSearchParams(window.location.search).get("trip");
    if (trip && DEPARTURES.some((x) => x.slug === trip)) setSlug(trip);
  }, []);

  function choose(s: string) { setSlug(s); setPicked([]); }
  function toggle(seat: string) {
    setPicked((p) => (p.includes(seat) ? p.filter((x) => x !== seat) : p.length >= 8 ? p : [...p, seat]));
  }

  return (
    <section id="seats" data-pin className={`relative z-10 grid scroll-mt-24 items-start gap-8 ${gutter} pb-24 lg:grid-cols-[.8fr_1.2fr]`}>
      <div className="flex flex-col gap-3" role="radiogroup" aria-label="Departure">
        <span className={`${caps} ${accent}`}>1 · Choose a departure</span>
        {DEPARTURES.map((x) => (
          <button key={x.slug} type="button" role="radio" aria-checked={x.slug === slug} onClick={() => choose(x.slug)}
            className={`flex min-h-16 items-center justify-between gap-3 rounded-md border px-4 py-3 text-left transition ${x.slug === slug ? "border-(--lm-accent) bg-(--lm-accent)/10" : "border-(--lm-line) bg-(--lm-card) hover:border-(--lm-accent)"}`}>
            <span className="flex flex-col">
              <b>{x.name}</b>
              <span className={`text-sm ${soft}`}>{x.dates} · {x.price} pp</span>
            </span>
            <SeatsLeft d={x} />
          </button>
        ))}
        <p className={`text-xs ${soft}`}>Example departures for this sample site. Seat requests are real and go to the agency.</p>
      </div>

      <div className={`grid gap-8 p-5 md:grid-cols-[auto_1fr] md:p-8 ${card}`}>
        <div className="flex flex-col items-center gap-3">
          <span className={`${caps} ${accent} self-start`}>2 · Tap your seats</span>
          <SeatMap key={d.slug} d={d} picked={picked} onToggle={toggle} />
        </div>
        {status.kind === "sent" ? (
          <div role="status" className="lm-rise flex flex-col items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--lm-accent) text-(--lm-on-accent)"><Check className="h-7 w-7" /></span>
            <h3 className={`${display} text-3xl leading-tight`}>Seats requested.</h3>
            <p className={soft}>{d.name}, {d.dates}: seats <b className="text-(--lm-ink)">{picked.join(", ")}</b>. Your consultant has been told on WhatsApp and by email, and will confirm your seats and send the quote.</p>
            <p className={`${hand} text-2xl ${accent}`}>We'll hold them for 48 hours.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-3">
            <span className={`${caps} ${accent}`}>3 · Send the request</span>
            <p className="text-[15px]" aria-live="polite">
              {picked.length ? <>You've picked <b>{picked.join(", ")}</b> on the {d.name}, {d.dates}.</> : <span className={soft}>Tap a free seat on the map to pick it (up to 8).</span>}
            </p>
            <label className="grid gap-1 text-sm font-semibold">Your name<input name="name" required autoComplete="name" className={input} /></label>
            <label className="grid gap-1 text-sm font-semibold">Email<input type="email" name="email" required autoComplete="email" className={input} /></label>
            <label className="grid gap-1 text-sm font-semibold">Mobile (for WhatsApp updates)<input type="tel" name="phone" autoComplete="tel" className={input} /></label>
            <label className="grid gap-1 text-sm font-semibold">Anything we should know? (optional)
              <textarea name="extra" rows={2} className={`${input} py-3`} placeholder="Names of travellers, a cot, dietary needs…" />
            </label>
            <Consent />
            <BotTrap />
            <button type="submit" disabled={sending || picked.length === 0} className={`${btn} min-h-14 disabled:cursor-not-allowed`}>
              {sending ? "Sending…" : picked.length ? `Request ${picked.length} ${picked.length === 1 ? "seat" : "seats"}` : "Pick a seat first"}
            </button>
            <FormStatus status={status} className="font-semibold" />
          </form>
        )}
      </div>
    </section>
  );
}
