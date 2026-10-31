// Enterprise: Horizon with everything TribeTravel can do behind a website, for the top package ("Enterprise / App").
// Live supplier packages (Beachcomber, bookable; Thompsons, enquire), an AI concierge talking to Tribe's chat API,
// booking a call with a consultant (live seats), what Tribe automates after an enquiry, integrations (HubSpot built in),
// the website's own live figures, and the site as an installable app with "your quote is ready" alerts.
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight, BarChart3, Bell, Bot, CalendarClock, Check, CreditCard, Download, Eye, FileText, Loader2, MessageCircle,
  Plug, Send, ShieldCheck, Smartphone, Sparkles, UserPlus, Webhook, X,
} from "lucide-react";
import { BookingDialog } from "@/components/packages";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  alertsSupported, bookCall, callIcs, getFigures, listSlots, turnOnAlerts, type CallBooked, type Figures, type Slots,
} from "@/lib/agency-extras";
import { sendChat, startChat } from "@/lib/chat";
import { useEnquiry } from "@/lib/enquiry";
import { listPackages, rand, type Package } from "@/lib/packages";
import { getHoliday, listHolidays, type Holiday, type HolidayFull } from "@/lib/thompsons";
import { Horizon } from "@/designs/horizon";
import { BRAND, BotTrap, FormStatus, contact, media, tel } from "@/designs/shared";

export { HORIZON_FONTS as ENTERPRISE_FONTS } from "@/designs/horizon";

const serif = "font-['Cormorant_Garamond',serif]";
const gold = "text-[#E8C79A]";
const eyebrow = `text-xs uppercase tracking-[0.4em] ${gold}`;
const h2 = `${serif} text-5xl leading-none font-medium md:text-[64px]`;

const NAV: [string, string][] = [["#live", "Book online"], ["#concierge", "AI concierge"], ["#call", "Book a call"], ["#app", "Get the app"], ["#contact", "Contact"]];

/** The concierge panel opens from its section and from the floating button; this keeps them in step. */
const OPEN_EVENT = "tt-concierge-open";

export function Enterprise() {
  useEffect(() => {
    // The installable app (public/designs/enterprise.webmanifest): the service worker keeps this page for offline use.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/designs/enterprise-sw.js", { scope: "/designs/enterprise" }).catch(() => {});
    }
  }, []);

  return (
    <Horizon nav={NAV}>
      <LiveSuppliers />
      <Concierge />
      <BookCall />
      <Automation />
      <Integrations />
      <Analytics />
      <InstallApp />
      <ConciergeLauncher />
    </Horizon>
  );
}

function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ADE80] opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#4ADE80]" />
    </span>
  );
}

// ------------------------------------------------------------------ live supplier packages
function LiveSuppliers() {
  const [tab, setTab] = useState<"beachcomber" | "thompsons">("beachcomber");
  // null while loading; "error" when TribeTravel couldn't be reached (not the same as nothing to show)
  const [packages, setPackages] = useState<Package[] | "error" | null>(null);
  const [minDays, setMinDays] = useState(10);
  const [holidays, setHolidays] = useState<Holiday[] | "error" | null>(null);
  const [book, setBook] = useState<Package | null>(null);
  const [holiday, setHoliday] = useState<Holiday | null>(null);

  useEffect(() => {
    listPackages().then((r) => { setPackages(r.packages); setMinDays(r.min_days_ahead || 10); }).catch(() => setPackages("error"));
    listHolidays().then(setHolidays).catch(() => setHolidays("error"));
  }, []);
  const unreachable = "We couldn't load live rates just now. Please try again in a moment, or ask our concierge.";

  const tabs: [typeof tab, string, string][] = [
    ["beachcomber", "Beachcomber", "Live rates · book online"],
    ["thompsons", "Thompsons Holidays", "Live packages · enquire"],
  ];

  return (
    <section id="live" className="flex scroll-mt-6 flex-col gap-10 border-t border-[#F4F1EC]/10 px-[5vw] py-24">
      <div className="reveal flex flex-wrap items-end justify-between gap-8">
        <div className="flex max-w-[680px] flex-col gap-4">
          <span className={`${eyebrow} flex items-center gap-3`}><LiveDot /> Live from our suppliers</span>
          <h2 className={h2}>Real rooms, real prices, <em className={gold}>right now.</em></h2>
          <p className="text-lg leading-relaxed text-[#F4F1EC]/75">
            Packages come straight from our suppliers' systems through TribeTravel. Check availability for your dates and request your holiday in a few clicks.
          </p>
        </div>
        <div role="tablist" aria-label="Supplier" className="flex flex-wrap gap-2">
          {tabs.map(([key, name, line]) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
              className={`flex min-h-14 flex-col items-start justify-center rounded-2xl border px-5 py-2 text-left transition ${tab === key ? "border-[#E8C79A] bg-[#E8C79A] text-[#0B0D10]" : "border-[#F4F1EC]/25 hover:border-[#E8C79A]"}`}>
              <span className="text-sm font-bold">{name}</span>
              <span className={`text-xs ${tab === key ? "text-[#0B0D10]/70" : "text-[#F4F1EC]/60"}`}>{line}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === "beachcomber" && (
        packages === null ? <CardSkeletons /> : packages === "error" ? <Empty text={unreachable} /> : packages.length === 0 ? (
          <Empty text="Online booking isn't switched on for this site yet. In TribeTravel, turn on Website packages and your Beachcomber rates appear here, live." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((p, i) => (
              <button key={p.id} type="button" onClick={() => setBook(p)} className="d-zoom group relative flex aspect-[3/4] items-end overflow-hidden rounded-3xl text-left">
                <img src={p.image || [media.islands, media.cruises, media.safari, media.cities][i % 4]} alt={p.hotel} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,.85))]" />
                <span className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-[#0B0D10]/60 px-3 py-1.5 text-xs font-semibold backdrop-blur"><LiveDot /> Live rate</span>
                <span className="relative flex flex-col gap-1.5 p-6">
                  <span className={`text-[11px] uppercase tracking-[0.3em] ${gold}`}>{p.star} · {p.location}</span>
                  <span className={`${serif} text-3xl leading-none`}>{p.hotel}</span>
                  <span className="text-sm text-[#F4F1EC]/80">{p.nights} nights · {p.board}</span>
                  <span className="mt-2 flex items-center justify-between gap-2 text-sm font-semibold">
                    <span>From {rand(p.from_pp, p.currency)} pp</span>
                    <span className={`flex items-center gap-1 ${gold}`}>Check dates <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        )
      )}

      {tab === "thompsons" && (
        holidays === null ? <CardSkeletons /> : holidays === "error" ? <Empty text={unreachable} /> : holidays.length === 0 ? (
          <Empty text="Connect your Thompsons Holidays login in TribeTravel and your Thompsons packages appear here, live, with their per-person prices." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {holidays.map((h, i) => (
              <button key={h.id} type="button" onClick={() => setHoliday(h)} className="d-zoom group relative flex aspect-[3/4] items-end overflow-hidden rounded-3xl text-left">
                <img src={h.image || [media.safari, media.islands, media.cities, media.cruises][i % 4]} alt={h.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,.85))]" />
                {h.hot_deal && <span className="absolute top-4 left-4 rounded-full bg-[#E8C79A] px-3 py-1.5 text-xs font-bold text-[#0B0D10]">Hot deal</span>}
                <span className="relative flex flex-col gap-1.5 p-6">
                  <span className={`text-[11px] uppercase tracking-[0.3em] ${gold}`}>{h.destination}</span>
                  <span className={`${serif} text-3xl leading-none`}>{h.name}</span>
                  <span className="text-sm text-[#F4F1EC]/80">{h.nights} nights{h.board ? ` · ${h.board}` : ""}</span>
                  <span className="mt-2 text-sm font-semibold">{h.from_pp ? `From ${rand(h.from_pp, h.currency)} pp` : "Ask for a price"}</span>
                </span>
              </button>
            ))}
          </div>
        )
      )}

      <BookingDialog pkg={book} minDays={minDays} onClose={() => setBook(null)} className="d-horizon-dialog sm:rounded-3xl" />
      <HolidayDialog holiday={holiday} onClose={() => setHoliday(null)} />
    </section>
  );
}

function CardSkeletons() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading live packages">
      {[0, 1, 2, 3].map((i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-[#F4F1EC]/8" />)}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-3xl border border-dashed border-[#F4F1EC]/25 p-8 text-center text-[#F4F1EC]/70">{text}</p>;
}

/** One Thompsons holiday in full, and "ask about it" straight into Tribe's enquiries. */
function HolidayDialog({ holiday, onClose }: { holiday: Holiday | null; onClose: () => void }) {
  const [full, setFull] = useState<HolidayFull | null>(null);
  const { status, onSubmit, sending } = useEnquiry(() => ({ destination: holiday ? `${holiday.name} (${holiday.nights} nights, ${holiday.destination})` : "" }));

  useEffect(() => {
    setFull(null);
    if (holiday) getHoliday(holiday.id).then(setFull).catch(() => setFull(null));
  }, [holiday]);

  const input = "min-h-12 w-full rounded-xl border border-border px-3.5 outline-none focus:border-[#8A6A3C]";
  return (
    <Dialog open={!!holiday} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[100svh] max-w-2xl overflow-y-auto p-0 sm:max-h-[90vh] sm:rounded-2xl">
        {holiday && (
          <div>
            <div className="relative h-48 overflow-hidden">
              <img src={holiday.image || media.safari} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.75))]" />
              <div className="absolute inset-x-6 bottom-4 text-white">
                <DialogTitle className={`${serif} text-4xl leading-none`}>{holiday.name}</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-white/85">{holiday.destination} · {holiday.nights} nights{holiday.from_pp ? ` · from ${rand(holiday.from_pp, holiday.currency)} pp` : ""}</DialogDescription>
              </div>
            </div>
            <div className="grid gap-5 p-6 text-[#14161A]">
              {holiday.strapline && <p className="text-[15px] leading-relaxed text-[#4A4D55]">{holiday.strapline}</p>}
              {holiday.inclusions.length > 0 && <p className="text-sm text-[#4A4D55]"><b className="text-[#14161A]">Includes:</b> {holiday.inclusions.join(" · ")}</p>}
              {full?.days?.length ? (
                <ol className="grid gap-2 border-l-2 border-[#E8C79A] pl-4">
                  {full.days.slice(0, 8).map((d, i) => (
                    <li key={i} className="text-sm"><b>Day {i + 1}</b> <span className="text-[#4A4D55]">{d.items.join(" · ")}</span></li>
                  ))}
                </ol>
              ) : null}
              <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl bg-[#F4F1EC] p-5">
                <b className="text-lg">Ask about this holiday</b>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold">Name<input name="name" required autoComplete="name" className={input} /></label>
                  <label className="grid gap-1 text-sm font-semibold">Email<input type="email" name="email" required autoComplete="email" className={input} /></label>
                </div>
                <label className="grid gap-1 text-sm font-semibold">When would you like to go?<input name="travel_dates" placeholder="e.g. April 2027, 2 adults" className={input} /></label>
                <Consent />
                <BotTrap />
                <button type="submit" disabled={sending} className="min-h-12 rounded-full bg-[#0B0D10] font-bold text-[#E8C79A] disabled:opacity-60">{sending ? "Sending…" : "Send to my consultant"}</button>
                <FormStatus status={status} className="text-center font-semibold" />
              </form>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** POPIA: consent before details are saved. */
function Consent({ dark = false }: { dark?: boolean }) {
  return (
    <label className={`flex items-start gap-2.5 text-xs leading-relaxed ${dark ? "text-[#F4F1EC]/70" : "text-[#4A4D55]"}`}>
      <input type="checkbox" required className="mt-0.5 h-4 w-4 flex-none accent-[#8A6A3C]" />
      I agree that {BRAND.name} may use my details to plan and quote my trip (POPIA). We never share them with anyone else.
    </label>
  );
}

// ------------------------------------------------------------------ book a call
function BookCall() {
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

  const input = "min-h-12 w-full rounded-xl border border-[#F4F1EC]/15 bg-transparent px-4 text-[15px] outline-none placeholder:text-[#F4F1EC]/40 focus:border-[#E8C79A]";
  return (
    <section id="call" className="grid scroll-mt-6 items-start gap-12 border-t border-[#F4F1EC]/10 px-[5vw] py-24 lg:grid-cols-[.8fr_1.2fr]">
      <div className="reveal flex flex-col gap-5 lg:sticky lg:top-10">
        <span className={`${eyebrow} flex items-center gap-3`}><CalendarClock className="h-4 w-4" /> Talk to a consultant</span>
        <h2 className={h2}>Book a call, <em className={gold}>when it suits you.</em></h2>
        <p className="text-lg leading-relaxed text-[#F4F1EC]/75">
          Pick a time and one of our consultants calls you to plan your trip. Times are live: when one fills up, we show you the next free one.
        </p>
      </div>
      <div className="reveal min-w-0 rounded-[28px] border border-[#F4F1EC]/12 bg-[#111419] p-6 md:p-8">
        {booked ? (
          <div className="d-slide flex flex-col items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8C79A] text-[#0B0D10]"><Check className="h-7 w-7" /></span>
            <h3 className={`${serif} text-4xl leading-tight`}>You're booked for {booked.label}.</h3>
            <p className="text-[#F4F1EC]/75">A {booked.minutes}-minute call. Your consultant has been told and will call you then.</p>
            <a href={calendarLink(booked)} download="call.ics" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#E8C79A] px-6 text-sm font-bold uppercase tracking-[0.12em] text-[#0B0D10]">
              <CalendarClock className="h-4 w-4" /> Add to my calendar
            </a>
          </div>
        ) : slots === null ? (
          <div className="flex items-center gap-3 text-[#F4F1EC]/70"><Loader2 className="h-5 w-5 animate-spin" /> Loading times…</div>
        ) : typeof slots === "string" || days.length === 0 ? (
          <p className="text-[#F4F1EC]/80">
            {typeof slots === "string" ? slots : "There are no times open in the next two weeks."} Our number is{" "}
            <a href={tel} className={`font-semibold ${gold}`}>{contact.phoneDisplay}</a>.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]" role="tablist" aria-label="Day">
              {days.map((d, i) => {
                const full = d.slots.every((s) => s.left === 0);
                return (
                  <button key={d.date} type="button" role="tab" aria-selected={i === day} onClick={() => { setDay(i); setPick(null); }}
                    className={`flex min-h-14 flex-none flex-col items-center justify-center rounded-2xl border px-4 text-sm transition ${i === day ? "border-[#E8C79A] bg-[#E8C79A] text-[#0B0D10]" : "border-[#F4F1EC]/20 hover:border-[#E8C79A]"} ${full && i !== day ? "opacity-45" : ""}`}>
                    <b>{d.label.split(" ")[0]}</b>
                    <span className="text-xs">{d.label.split(" ").slice(1).join(" ")}</span>
                  </button>
                );
              })}
            </div>
            {dayFull && nextFree && (
              <p className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E8C79A]/40 bg-[#E8C79A]/10 px-4 py-3 text-sm">
                This day is fully booked. Next free time: <b>{nextFree.slice(11)} on {days.find((d) => d.date === nextFree.slice(0, 10))?.label}</b>
                <button type="button" onClick={() => goTo(nextFree)} className={`font-semibold underline underline-offset-4 ${gold}`}>Pick it</button>
              </p>
            )}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Time">
              {today?.slots.map((s) => (
                <button key={s.start} type="button" role="radio" aria-checked={pick === s.start} disabled={s.left === 0} onClick={() => setPick(s.start)}
                  className={`flex min-h-12 flex-col items-center justify-center rounded-xl border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${pick === s.start ? "border-[#E8C79A] bg-[#E8C79A] text-[#0B0D10]" : "border-[#F4F1EC]/20 hover:border-[#E8C79A]"}`}>
                  {s.time}
                  {s.left === 0 && <span className="text-[10px] font-normal uppercase tracking-wider">Full</span>}
                </button>
              ))}
            </div>
            {error && <p role="alert" className="text-sm font-semibold text-[#F87171]">{error}</p>}
            {pick && (
              <form onSubmit={onSubmit} className="d-slide grid gap-3 border-t border-[#F4F1EC]/10 pt-6">
                <p className="text-sm text-[#F4F1EC]/75">Your call: <b className="text-[#F4F1EC]">{today?.label} at {pick.slice(11)}</b> ({typeof slots === "object" ? slots.minutes : 30} minutes)</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="name" required autoComplete="name" placeholder="Your name" className={input} />
                  <input name="phone" type="tel" required autoComplete="tel" placeholder="Mobile number" className={input} />
                </div>
                <input name="email" type="email" required autoComplete="email" placeholder="Email" className={input} />
                <input name="topic" placeholder="What would you like to talk about? (optional)" className={input} />
                <BotTrap />
                <Consent dark />
                <button type="submit" disabled={busy} className="min-h-14 rounded-full bg-[#E8C79A] text-sm font-bold uppercase tracking-[0.14em] text-[#0B0D10] disabled:opacity-60">
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

// ------------------------------------------------------------------ AI concierge
type Msg = { from: "ai" | "me"; text: string };

const STARTERS = ["A honeymoon in Mauritius", "A family safari in the school holidays", "Somewhere warm for 2 in December"];

function useConcierge() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function begin() {
    if (token || busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await startChat();
      setToken(r.token);
      setMsgs([{ from: "ai", text: r.reply }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function say(text: string) {
    const t = text.trim();
    if (!t || busy || done || !token) return;
    setMsgs((m) => [...m, { from: "me", text: t }]);
    setBusy(true);
    setError("");
    try {
      const r = await sendChat(token, t);
      setMsgs((m) => [...m, { from: "ai", text: r.reply }]);
      setDone(r.done);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return { msgs, busy, done, error, ready: !!token, begin, say };
}

function ChatWindow({ compact = false, onClose }: { compact?: boolean; onClose?: () => void }) {
  const chat = useConcierge();
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => { chat.begin(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [chat.msgs, chat.busy]);

  function submit(e: FormEvent) {
    e.preventDefault();
    chat.say(text);
    setText("");
  }

  return (
    <div className={`flex flex-col overflow-hidden rounded-[28px] border border-[#F4F1EC]/15 bg-[#111419] shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)] ${compact ? "h-[min(560px,75vh)]" : "h-[560px]"}`}>
      <div className="flex items-center gap-3 border-b border-[#F4F1EC]/10 px-5 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8C79A] text-[#0B0D10]"><Bot className="h-5 w-5" /></span>
        <div className="flex flex-col">
          <b className="text-[15px]">{BRAND.name} concierge</b>
          <span className="flex items-center gap-1.5 text-xs text-[#F4F1EC]/60"><LiveDot /> AI assistant · a consultant prices every quote</span>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close the chat" className="ml-auto flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#F4F1EC]/10"><X className="h-5 w-5" /></button>
        )}
      </div>
      <div ref={scroller} className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5" aria-live="polite">
        {chat.msgs.map((m, i) => (
          <p key={i} className={`d-slide max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line ${m.from === "ai" ? "self-start rounded-tl-sm bg-[#F4F1EC]/8" : "self-end rounded-tr-sm bg-[#E8C79A] text-[#0B0D10]"}`}>
            {m.text}
          </p>
        ))}
        {chat.busy && (
          <span className="flex items-center gap-2 self-start rounded-2xl bg-[#F4F1EC]/8 px-4 py-3 text-sm text-[#F4F1EC]/60"><Loader2 className="h-4 w-4 animate-spin" /> Typing…</span>
        )}
        {chat.done && (
          <div className="d-slide flex items-start gap-3 rounded-2xl border border-[#4ADE80]/40 bg-[#4ADE80]/10 px-4 py-3 text-sm">
            <Check className="mt-0.5 h-4 w-4 flex-none text-[#4ADE80]" />
            <span>Your request is in TribeTravel: a new client, an enquiry and a draft quote for your consultant to price and send.</span>
          </div>
        )}
        {chat.error && <p role="alert" className="rounded-2xl bg-[#B42318]/20 px-4 py-3 text-sm">{chat.error}</p>}
        {chat.ready && chat.msgs.length === 1 && !chat.busy && (
          <div className="flex flex-wrap gap-2 pt-1">
            {STARTERS.map((s) => (
              <button key={s} type="button" onClick={() => chat.say(s)} className="min-h-10 rounded-full border border-[#E8C79A]/50 px-4 text-sm text-[#E8C79A] transition hover:bg-[#E8C79A]/10">{s}</button>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-[#F4F1EC]/10 p-3">
        <label className="sr-only" htmlFor={compact ? "chat-text-pop" : "chat-text"}>Your message</label>
        <input id={compact ? "chat-text-pop" : "chat-text"} value={text} onChange={(e) => setText(e.target.value)} disabled={!chat.ready || chat.done} maxLength={1000}
          placeholder={chat.done ? "Your request has been sent" : "Tell me about your dream trip…"}
          className="min-h-12 flex-1 rounded-full border border-[#F4F1EC]/15 bg-transparent px-5 text-[15px] outline-none placeholder:text-[#F4F1EC]/40 focus:border-[#E8C79A]" />
        <button type="submit" aria-label="Send" disabled={!chat.ready || chat.busy || chat.done || !text.trim()} className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#E8C79A] text-[#0B0D10] disabled:opacity-40">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

function Concierge() {
  const [on, setOn] = useState(false);
  return (
    <section id="concierge" className="grid scroll-mt-6 items-center gap-12 bg-[#0F1216] px-[5vw] py-24 lg:grid-cols-[.9fr_1.1fr]">
      <div className="reveal flex flex-col gap-6">
        <span className={`${eyebrow} flex items-center gap-3`}><Sparkles className="h-4 w-4" /> AI concierge, 24/7</span>
        <h2 className={h2}>Plan your trip <em className={gold}>in a conversation.</em></h2>
        <p className="text-lg leading-relaxed text-[#F4F1EC]/75">
          Our AI concierge asks the right questions, suggests ideas from our packages and passes your complete brief to a consultant, who prices it and sends your quote. Day or night.
        </p>
        <ul className="flex flex-col gap-3 text-[15px] text-[#F4F1EC]/85">
          {["Answers in seconds, any time", "Never guesses a price: your consultant quotes", "Says it's an AI, and asks before saving your details (POPIA)"].map((x) => (
            <li key={x} className="flex items-center gap-3"><Check className={`h-4 w-4 ${gold}`} />{x}</li>
          ))}
        </ul>
      </div>
      <div className="reveal">
        {on ? <ChatWindow /> : (
          <button type="button" onClick={() => setOn(true)} className="group flex h-[560px] w-full flex-col items-center justify-center gap-5 rounded-[28px] border border-dashed border-[#E8C79A]/40 bg-[#111419] text-center transition hover:border-[#E8C79A]">
            <span className="d-float flex h-20 w-20 items-center justify-center rounded-full bg-[#E8C79A] text-[#0B0D10]"><Bot className="h-9 w-9" /></span>
            <span className={`${serif} text-4xl`}>Start a conversation</span>
            <span className="text-[#F4F1EC]/60">Tap to chat with our AI concierge</span>
          </button>
        )}
      </div>
    </section>
  );
}

/** The floating "Ask our concierge" button, above Horizon's WhatsApp button. Hidden while the concierge section
 *  itself is on screen, where it would cover the chat. */
function ConciergeLauncher() {
  const [open, setOpen] = useState(false);
  const [sectionShowing, setSectionShowing] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, show);
    const section = document.getElementById("concierge");
    const io = new IntersectionObserver(([e]) => setSectionShowing(!!e?.isIntersecting), { threshold: 0.2 });
    if (section) io.observe(section);
    return () => { window.removeEventListener(OPEN_EVENT, show); io.disconnect(); };
  }, []);
  if (sectionShowing && !open) return null;
  return (
    <>
      {open && (
        <div className="fixed right-4 bottom-24 z-30 w-[min(400px,calc(100vw-2rem))] md:right-6 md:bottom-28">
          <ChatWindow compact onClose={() => setOpen(false)} />
        </div>
      )}
      {!open && (
        <button type="button" onClick={() => setOpen(true)} className="d-rise fixed right-4 bottom-24 z-30 flex min-h-12 items-center gap-2 rounded-full bg-[#E8C79A] px-5 font-bold text-[#0B0D10] shadow-[0_12px_30px_rgba(0,0,0,.45)] md:right-6 md:bottom-28">
          <Bot className="h-5 w-5" /> Ask our concierge
        </button>
      )}
    </>
  );
}

// ------------------------------------------------------------------ automation
const FLOW = [
  { icon: MessageCircle, title: "You enquire", text: "On the website, in the AI chat, or on WhatsApp." },
  { icon: UserPlus, title: "Client created", text: "TribeTravel files you as a client with your trip brief. No retyping." },
  { icon: FileText, title: "Draft quote", text: "A complete brief becomes a draft quote, built from live supplier rates." },
  { icon: Bell, title: "Consultant alerted", text: "Your consultant checks it, prices it and sends it, usually the same day." },
  { icon: Eye, title: "Quote tracked", text: "Tribe sees when you open it, and reminds your consultant if it goes quiet." },
  { icon: CreditCard, title: "Accept and pay", text: "Accept online, then pay the invoice by card or EFT. It's posted to the books." },
  { icon: CalendarClock, title: "Ready to go", text: "Documents, reminders before you fly, and help while you travel." },
];

function Automation() {
  return (
    <section className="flex flex-col gap-14 px-[5vw] py-24">
      <div className="reveal flex max-w-[760px] flex-col gap-4">
        <span className={eyebrow}>What happens next</span>
        <h2 className={h2}>One message. <em className={gold}>Everything else is automatic.</em></h2>
        <p className="text-lg leading-relaxed text-[#F4F1EC]/75">Every enquiry runs through TribeTravel, our travel system, so nothing gets lost between your first message and your flight home.</p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {FLOW.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="reveal relative flex flex-col gap-3 rounded-3xl border border-[#F4F1EC]/10 bg-[#F4F1EC]/[.03] p-5" style={{ transitionDelay: `${i * 90}ms` }}>
            <span className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8C79A]/15 text-[#E8C79A]"><Icon className="h-5 w-5" /></span>
              <span className={`${serif} text-3xl text-[#F4F1EC]/25`}>{i + 1}</span>
            </span>
            <b className="text-[15px]">{title}</b>
            <span className="text-sm leading-relaxed text-[#F4F1EC]/65">{text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ------------------------------------------------------------------ integrations
const TOOLS = [
  { icon: Plug, name: "Supplier connections", text: "Beachcomber, Thompsons, MSC, TBO and more, connected in TribeTravel." },
  { icon: UserPlus, name: "HubSpot, built in", text: "Every website enquiry, chat, booking and call becomes a HubSpot lead with a note of what they asked." },
  { icon: Webhook, name: "Your own CRM and tools", text: "Zoho, Salesforce or anything else through the TribeTravel API and signed webhooks." },
  { icon: CreditCard, name: "Paystack payments", text: "Card payments on every invoice, matched to the booking automatically." },
  { icon: MessageCircle, name: "WhatsApp Business", text: "Client messages land on their timeline; consultants reply from Tribe." },
  { icon: BarChart3, name: "Google Analytics & Meta", text: "GA4 and Meta Pixel, to see which campaigns bring bookings." },
  { icon: ShieldCheck, name: "POPIA by design", text: "Consent before saving, AI disclosure, encrypted passport details." },
];

function Integrations() {
  return (
    <section className="grid items-start gap-12 border-t border-[#F4F1EC]/10 px-[5vw] py-24 lg:grid-cols-[.8fr_1.2fr]">
      <div className="reveal flex flex-col gap-5 lg:sticky lg:top-10">
        <span className={eyebrow}>Connected</span>
        <h2 className={h2}>Works with the tools <em className={gold}>you already use.</em></h2>
        <p className="text-lg leading-relaxed text-[#F4F1EC]/75">Your website, suppliers, payments, messages and reports, all in one connected system.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map(({ icon: Icon, name, text }) => (
          <div key={name} className="reveal flex gap-4 rounded-3xl border border-[#F4F1EC]/10 p-6 transition hover:border-[#E8C79A]/50">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[#F4F1EC] text-[#0B0D10]"><Icon className="h-6 w-6" /></span>
            <span className="flex flex-col gap-1.5"><b>{name}</b><span className="text-sm leading-relaxed text-[#F4F1EC]/65">{text}</span></span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ analytics
const SAMPLE: Figures = { days: 30, chats: 612, enquiries: 246, quotes: 158, bookings: 47, calls: 38, value: 1200000, currency: "ZAR", as_of: "" };

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "-");

function Analytics() {
  // The agency's real figures from TribeTravel (last 30 days) when it shares them; the sample until then.
  const [live, setLive] = useState<Figures | null>(null);
  useEffect(() => { getFigures().then(setLive).catch(() => setLive(null)); }, []);
  const f = live ?? SAMPLE;
  const funnel: [string, number][] = [["AI chats", f.chats], ["Enquiries", f.enquiries], ["Calls booked", f.calls], ["Quotes", f.quotes], ["Bookings", f.bookings]];
  const max = Math.max(1, ...funnel.map(([, n]) => n));
  return (
    <section className="grid items-center gap-12 bg-[#F4F1EC] px-[5vw] py-24 text-[#14161A] lg:grid-cols-[.85fr_1.15fr]">
      <div className="reveal flex flex-col gap-5">
        <span className="text-xs uppercase tracking-[0.4em] text-[#8A6A3C]">For the agency</span>
        <h2 className={`${serif} text-5xl leading-none font-medium md:text-[64px]`}>See what your website earns.</h2>
        <p className="text-lg leading-relaxed text-[#4A4D55]">
          TribeTravel follows every website visitor from first chat to paid booking.{" "}
          {live ? `This is this website's own record for the last ${live.days} days, straight from TribeTravel.` : "Switched on, this shows the website's own record for the last 30 days, straight from TribeTravel."}
        </p>
      </div>
      <div className="reveal rounded-[28px] bg-white p-6 shadow-[0_40px_80px_-40px_rgba(20,22,26,.35)] md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <b className="flex items-center gap-2 text-lg"><BarChart3 className="h-5 w-5 text-[#8A6A3C]" /> Website dashboard</b>
          {live ? (
            <span className="flex items-center gap-2 rounded-full bg-[#ECFDF3] px-3 py-1 text-xs font-semibold text-[#15803D]"><LiveDot /> Live, last {live.days} days</span>
          ) : (
            <span className="rounded-full bg-[#F4F1EC] px-3 py-1 text-xs font-semibold text-[#8A6A3C]">Sample figures</span>
          )}
        </div>
        <ol className="mt-6 flex flex-col gap-3.5">
          {funnel.map(([label, n], i) => (
            <li key={label} className="grid grid-cols-[110px_1fr_64px] items-center gap-3 text-sm">
              <span className="font-semibold">{label}</span>
              <span className="h-3 overflow-hidden rounded-full bg-[#F4F1EC]">
                <span className="d-grow block h-full rounded-full bg-[linear-gradient(90deg,#8A6A3C,#E8C79A)]" style={{ width: `${Math.max(4, (n / max) * 100)}%`, animationDelay: `${i * 120}ms` }} />
              </span>
              <span className="text-right font-bold tabular-nums">{n.toLocaleString("en-ZA")}</span>
            </li>
          ))}
        </ol>
        <div className="mt-7 grid grid-cols-3 gap-3 border-t border-[#EDE7DD] pt-6 text-center">
          {[["Booked from the website", rand(f.value, f.currency)], ["Enquiry to quote", pct(f.quotes, f.enquiries)], ["Quote to booking", pct(f.bookings, f.quotes)]].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1"><b className={`${serif} text-2xl md:text-3xl`}>{v}</b><span className="text-xs text-[#4A4D55]">{k}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ installable app
type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function useInstall() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const keep = (e: Event) => { e.preventDefault(); setPrompt(e as InstallPrompt); };
    const done = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener("beforeinstallprompt", keep);
    window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("beforeinstallprompt", keep); window.removeEventListener("appinstalled", done); };
  }, []);

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const r = await prompt.userChoice;
    if (r.outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  return { canInstall: !!prompt, installed, ios, install };
}

/** "Your quote is ready" alerts: the browser subscribes through the app's service worker, matched to quotes by email. */
function TripAlerts() {
  const [state, setState] = useState<"idle" | "busy" | "on" | "unsupported">("idle");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!alertsSupported()) setState("unsupported");
    else if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((r) => r.pushManager.getSubscription()).then((sub) => sub && setState("on")).catch(() => {});
    }
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("busy");
    setError("");
    try {
      await turnOnAlerts(String(new FormData(e.currentTarget).get("email") || "").trim());
      setState("on");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  if (state === "unsupported") {
    return <p className="text-sm text-[#F4F1EC]/60">Trip alerts work once the app is on your home screen (on iPhone, iOS 16.4 or later).</p>;
  }
  if (state === "on") {
    return <span className="flex items-center gap-2 font-semibold text-[#4ADE80]"><Bell className="h-5 w-5" /> Trip alerts are on for this device</span>;
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-2xl border border-[#F4F1EC]/15 p-5">
      <b className="flex items-center gap-2"><Bell className={`h-5 w-5 ${gold}`} /> Get an alert when your quote is ready</b>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input name="email" type="email" required autoComplete="email" placeholder="The email you enquired with"
          className="min-h-12 flex-1 rounded-full border border-[#F4F1EC]/15 bg-transparent px-5 text-[15px] outline-none placeholder:text-[#F4F1EC]/40 focus:border-[#E8C79A]" />
        <button type="submit" disabled={state === "busy"} className="min-h-12 rounded-full bg-[#E8C79A] px-6 text-sm whitespace-nowrap font-bold uppercase tracking-[0.12em] text-[#0B0D10] disabled:opacity-60">
          {state === "busy" ? "Turning on..." : "Turn on alerts"}
        </button>
      </div>
      {error && <p role="alert" className="text-sm font-semibold text-[#F87171]">{error}</p>}
    </form>
  );
}

function InstallApp() {
  const app = useInstall();
  return (
    <section id="app" className="grid scroll-mt-6 items-center gap-14 px-[5vw] py-24 lg:grid-cols-2">
      <div className="reveal flex flex-col gap-6">
        <span className={`${eyebrow} flex items-center gap-3`}><Smartphone className="h-4 w-4" /> The {BRAND.short} app</span>
        <h2 className={h2}>Your trip, <em className={gold}>in your pocket.</em></h2>
        <p className="text-lg leading-relaxed text-[#F4F1EC]/75">
          Add {BRAND.name} to your home screen: it opens like an app, works on a weak signal, and keeps your concierge, quotes and our contact details one tap away.
        </p>
        {app.installed ? (
          <span className="flex items-center gap-2 font-semibold text-[#4ADE80]"><Check className="h-5 w-5" /> Installed on this device</span>
        ) : app.canInstall ? (
          <button type="button" onClick={app.install} className="inline-flex min-h-14 items-center gap-2 self-start rounded-full bg-[#E8C79A] px-8 text-sm font-bold uppercase tracking-[0.12em] text-[#0B0D10] transition hover:-translate-y-0.5">
            <Download className="h-5 w-5" /> Install the app
          </button>
        ) : (
          <p className="rounded-2xl border border-[#F4F1EC]/15 p-5 text-[15px] leading-relaxed text-[#F4F1EC]/80">
            {app.ios
              ? <>On iPhone: tap <b>Share</b>, then <b>Add to Home Screen</b>.</>
              : <>On your phone: open the browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.</>}
          </p>
        )}
        <TripAlerts />
        <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className={`self-start text-sm font-semibold underline-offset-4 hover:underline ${gold}`}>
          Or ask the concierge now →
        </button>
      </div>
      <div className="reveal flex justify-center">
        <div className="d-float relative h-[560px] w-[280px] rounded-[44px] border-[10px] border-[#22262D] bg-[#0B0D10] shadow-[0_50px_100px_-30px_rgba(0,0,0,.9)]">
          <div className="absolute top-2 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full bg-[#22262D]" aria-hidden="true" />
          <div className="flex h-full flex-col overflow-hidden rounded-[34px]">
            <div className="relative h-[46%]">
              <img src={media.islands} alt="" aria-hidden="true" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,#0B0D10)]" />
              <span className={`absolute bottom-4 left-5 ${serif} text-3xl leading-none`}>Your trip to<br /><em className={gold}>Mauritius</em></span>
            </div>
            <div className="flex flex-1 flex-col gap-2.5 p-4 text-sm">
              {[["Quote Q-1042", "Ready to view"], ["Flights", "Johannesburg to Mauritius"], ["Concierge", "Ask me anything"]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-2xl bg-[#F4F1EC]/8 px-4 py-3">
                  <span className="flex flex-col"><b>{k}</b><span className="text-xs text-[#F4F1EC]/60">{v}</span></span>
                  <ArrowRight className={`h-4 w-4 ${gold}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
