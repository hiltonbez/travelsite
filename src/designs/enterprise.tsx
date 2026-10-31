// Enterprise, "Night flight": everything TribeTravel can do behind a website, for the top package ("Enterprise / App").
// The page is a night-time navigation chart: one flight path (flight-path.tsx) runs down it and each feature is a
// stop on the route. Live supplier packages (Beachcomber, bookable; Thompsons, enquire), an AI concierge talking to
// Tribe's chat API, booking a call with a consultant (live seats), what happens after an enquiry, and the site as an
// installable app with "your quote is ready" alerts. Customer view only: the agency's figures and tools live in TribeTravel.
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight, Bell, Bot, CalendarClock, Check, CreditCard, Download, Eye, FileText, Loader2, MessageCircle, Send,
  Smartphone, Sparkles, UserPlus, X,
} from "lucide-react";
import { BookingDialog } from "@/components/packages";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  alertsSupported, bookCall, callIcs, listSlots, turnOnAlerts, type CallBooked, type Slots,
} from "@/lib/agency-extras";
import { sendChat, startChat } from "@/lib/chat";
import { useEnquiry } from "@/lib/enquiry";
import { listPackages, rand, type Package } from "@/lib/packages";
import { getHoliday, listHolidays, type Holiday, type HolidayFull } from "@/lib/thompsons";
import { FlightPath, useOnScroll } from "@/designs/flight-path";
import { BRAND, BotTrap, FormStatus, WhatsAppIcon, contact, mailto, media, monthWords, tel } from "@/designs/shared";

export const ENTERPRISE_FONTS = "family=Archivo:wdth,wght@125,500;125,800&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600";

// Night chart: navy page, ivory ink, runway orange as the one accent (text on orange is navy).
const display = "font-['Archivo','Arial_Black',sans-serif] [font-stretch:125%] font-extrabold uppercase [text-wrap:balance]";
const mono = "font-['JetBrains_Mono',ui-monospace,monospace]";
const label = `${mono} text-[11px] uppercase tracking-[0.14em]`;
const orange = "text-[#FF6A2E]";
const soft = "text-[#B9B3A6]";
const h2 = `${display} text-[clamp(32px,4.4vw,64px)] leading-[0.94]`;
const panel = "rounded-[22px] border border-[#EDE6D8]/12 bg-[#111D33]";
const btn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF6A2E] px-6 text-[15px] font-semibold text-[#0B1424] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0";
const ghost = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#EDE6D8]/60 px-6 text-[15px] font-semibold transition hover:border-[#FF6A2E] hover:text-[#FF6A2E]";
const input = "min-h-12 w-full rounded-xl border border-[#EDE6D8]/15 bg-[#0B1424] px-4 text-[15px] text-[#EDE6D8] outline-none placeholder:text-[#B9B3A6]/70 focus:border-[#FF6A2E]";
const gutter = "px-[max(16px,5vw)]";

const NAV: [string, string][] = [["#live", "Book online"], ["#concierge", "Concierge"], ["#call", "Book a call"], ["#app", "The app"], ["#contact", "Contact"]];

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
    <div className="relative min-h-screen bg-[#0B1424] font-['Instrument_Sans',system-ui,sans-serif] text-[#EDE6D8] [color-scheme:dark]">
      {/* The chart grid */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0" style={{
        backgroundImage: "linear-gradient(rgb(237 230 216 / .045) 1px, transparent 1px), linear-gradient(90deg, rgb(237 230 216 / .045) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />
      <Header />
      <main id="top" className="relative overflow-x-clip">
        <FlightPath />
        <Departure />
        <LiveSuppliers />
        <Concierge />
        <BookCall />
        <Automation />
        <InstallApp />
        <Contact />
      </main>
      <footer className={`relative flex flex-wrap justify-between gap-4 border-t border-[#EDE6D8]/10 ${gutter} py-10 pb-28 text-[13px] ${soft} md:pb-10`}>
        <span className={`${display} text-sm text-[#EDE6D8]`}>{BRAND.short}<span className={orange}>/</span></span>
        <span className={label}>{BRAND.name} · {BRAND.tagline}</span>
      </footer>
      <ConciergeLauncher />
      <a href={contact.whatsapp} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fixed right-6 bottom-6 z-20 hidden h-15 w-15 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_rgba(0,0,0,.45)] md:flex">
        <WhatsAppIcon className="h-7 w-7" />
      </a>
      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2.5 border-t border-[#EDE6D8]/15 bg-[#0B1424] p-3 md:hidden">
        <a href="#quote" className="flex-1 rounded-xl bg-[#FF6A2E] py-3.5 text-center font-bold text-[#0B1424]">Get a quote</a>
        <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#EDE6D8]/40 py-3.5 font-bold">
          <WhatsAppIcon className="h-5 w-5" /> WhatsApp
        </a>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className={`sticky top-0 z-20 flex items-center justify-between gap-6 border-b border-[#EDE6D8]/10 bg-[#0B1424]/85 ${gutter} py-4 backdrop-blur-md`}>
      <a href="#top" className={`${display} text-lg leading-none`}>{BRAND.short}<span className={orange}>/</span></a>
      <nav aria-label="Sections" className={`hidden gap-8 ${label} lg:flex`}>
        {NAV.map(([href, text]) => <a key={href} href={href} className="hover:text-[#FF6A2E]">{text}</a>)}
      </nav>
      <a href="#quote" className={`${btn} min-h-11 px-5 text-sm`}>Plan my trip</a>
    </header>
  );
}

/** "Stop 2 · AI concierge": the label every section opens with, naming where it sits on the route. */
function StopLabel({ children }: { children: ReactNode }) {
  return <span className={`${label} ${orange} flex items-center gap-3`}>{children}</span>;
}

function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF6A2E] opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FF6A2E]" />
    </span>
  );
}

// ------------------------------------------------------------------ departure: the quote form as a boarding pass
function Departure() {
  const [more, setMore] = useState(false);
  const { status, onSubmit, sending } = useEnquiry((fd) => ({ travel_dates: monthWords(String(fd.get("travel_dates") ?? "")) }));

  const field = "flex min-w-0 flex-col gap-1.5";
  const fieldLabel = `${label} text-[#0B1424]/60`;
  const fieldInput = "min-h-9 w-full border-0 border-b-2 border-[#0B1424]/15 bg-transparent p-0 text-[17px] font-semibold text-[#0B1424] outline-none [color-scheme:light] focus:border-[#FF6A2E]";

  return (
    <section className={`relative z-10 flex flex-col gap-8 ${gutter} pt-16 pb-28 md:pt-24`}>
      <p className={`d-rise flex flex-wrap gap-x-7 gap-y-2 ${label} ${soft}`}>
        <span>JNB → MRU · ZNZ · VFA</span><span>26°12′S 28°02′E</span><span className={`flex items-center gap-2 ${orange}`}><LiveDot /> Live rates on</span>
      </p>
      <h1 className={`d-rise ${display} max-w-[13ch] text-[clamp(42px,8vw,120px)] leading-[0.9] [animation-delay:.12s]`}>
        Every trip is a <em className={`not-italic ${orange}`}>route.</em> We fly it with you.
      </h1>
      <p className={`d-rise max-w-[54ch] text-lg leading-relaxed ${soft} [animation-delay:.25s] md:text-xl`}>
        Live prices from our suppliers, a concierge that answers at midnight and a consultant on your schedule. Tell us where you're headed and your quote follows within 24 hours.
      </p>

      <form id="quote" onSubmit={onSubmit} className="d-rise relative grid max-w-[1080px] scroll-mt-24 rounded-[22px] bg-[#EDE6D8] text-[#0B1424] shadow-[0_40px_80px_-40px_rgba(0,0,0,.9)] [animation-delay:.4s] md:grid-cols-[1fr_250px]">
        <div className="flex flex-col gap-6 p-6 md:p-8">
          <div className={`flex flex-wrap items-center justify-between gap-3 ${label} text-[#0B1424]/60`}>
            <span>Boarding pass · {BRAND.name}</span>
            <span className="font-semibold text-[#0B1424]">JNB → <span className="text-[#C2410C]">anywhere</span></span>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <label className={field}>
              <span className={fieldLabel}>Where to</span>
              <select name="destination" className={fieldInput}>
                <option>Mauritius &amp; islands</option>
                <option>An African safari</option>
                <option>A cruise</option>
                <option>Europe &amp; cities</option>
                <option>Not sure yet, surprise me</option>
              </select>
            </label>
            <label className={field}>
              <span className={fieldLabel}>When</span>
              <input type="month" name="travel_dates" className={fieldInput} />
            </label>
            <label className={field}>
              <span className={fieldLabel}>Travellers</span>
              <select name="travellers" className={fieldInput}>
                <option>2 adults</option>
                <option>A family</option>
                <option>Just me</option>
                <option>A group (6+)</option>
              </select>
            </label>
          </div>
          {more && (
            <div className="d-slide grid gap-6 sm:grid-cols-3">
              <label className={field}>
                <span className={fieldLabel}>Your name</span>
                <input name="name" required autoComplete="name" autoFocus className={fieldInput} />
              </label>
              <label className={field}>
                <span className={fieldLabel}>Email</span>
                <input type="email" name="email" required autoComplete="email" className={fieldInput} />
              </label>
              <label className={field}>
                <span className={fieldLabel}>Phone (optional)</span>
                <input type="tel" name="phone" autoComplete="tel" className={fieldInput} />
              </label>
            </div>
          )}
          <BotTrap />
        </div>
        {/* The stub, torn off along the perforation */}
        <div className="relative flex flex-col justify-between gap-5 border-t-2 border-dashed border-[#0B1424]/20 p-6 md:border-t-0 md:border-l-2 md:p-8">
          <span aria-hidden="true" className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-[#0B1424] md:-top-3 md:-left-3" />
          <span aria-hidden="true" className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-[#0B1424] md:top-auto md:-bottom-3 md:-left-3 md:right-auto" />
          <div className={`flex flex-col gap-1 ${label} text-[#0B1424]/60`}>
            <span>Gate</span>
            <span className={`${display} text-4xl leading-none text-[#0B1424]`}>24H</span>
            <span>Quote within a day</span>
          </div>
          {more ? (
            <button type="submit" disabled={sending} className={btn}>{sending ? "Sending…" : "Send my request"}</button>
          ) : (
            <button type="button" onClick={() => setMore(true)} className={btn}>Get my quote <ArrowRight className="h-4 w-4" /></button>
          )}
        </div>
      </form>
      <FormStatus status={status} className={orange} />
      {!status.message && <p className={`text-[13px] ${soft}`}>Free, no obligation. A real person prices every quote.</p>}
    </section>
  );
}

// ------------------------------------------------------------------ stop 1: live supplier packages
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
    <section id="live" data-stop className={`relative z-10 flex scroll-mt-20 flex-col gap-10 ${gutter} py-24 md:py-28`}>
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="flex max-w-[680px] flex-col gap-4">
          <StopLabel><LiveDot /> Stop 1 · Live from our suppliers</StopLabel>
          <h2 className={h2}>Real rooms. Real prices. <span className={orange}>Right now.</span></h2>
          <p className={`text-lg leading-relaxed ${soft}`}>
            Packages come straight from our suppliers' systems through TribeTravel. Check availability for your dates and request your holiday in a few taps.
          </p>
        </div>
        <div role="tablist" aria-label="Supplier" className="flex flex-wrap gap-2 rounded-[20px] border border-[#EDE6D8]/12 bg-[#0B1424] p-1.5">
          {tabs.map(([key, name, line]) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
              className={`flex min-h-14 flex-col items-start justify-center rounded-2xl px-5 py-2 text-left transition ${tab === key ? "bg-[#FF6A2E] text-[#0B1424]" : "hover:bg-[#EDE6D8]/8"}`}>
              <span className="text-sm font-bold">{name}</span>
              <span className={`${mono} text-[11px] ${tab === key ? "text-[#0B1424]/75" : soft}`}>{line}</span>
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
              <TicketCard key={p.id} onClick={() => setBook(p)} image={p.image || [media.islands, media.cruises, media.safari, media.cities][i % 4]} alt={p.hotel}
                badge={<><LiveDot /> Live rate</>} where={`${p.star} · ${p.location}`} name={p.hotel} detail={`${p.nights} nights · ${p.board}`}
                price={`From ${rand(p.from_pp, p.currency)} pp`} action="Check dates" />
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
              <TicketCard key={h.id} onClick={() => setHoliday(h)} image={h.image || [media.safari, media.islands, media.cities, media.cruises][i % 4]} alt={h.name}
                badge={h.hot_deal ? "Hot deal" : null} where={h.destination} name={h.name} detail={`${h.nights} nights${h.board ? ` · ${h.board}` : ""}`}
                price={h.from_pp ? `From ${rand(h.from_pp, h.currency)} pp` : "Ask for a price"} action="Ask" />
            ))}
          </div>
        )
      )}

      <BookingDialog pkg={book} minDays={minDays} onClose={() => setBook(null)} className="d-route-dialog sm:rounded-3xl" />
      <HolidayDialog holiday={holiday} onClose={() => setHoliday(null)} />
    </section>
  );
}

/** A package as a ticket: the photo on top, the details and price below a perforation. */
function TicketCard({ onClick, image, alt, badge, where, name, detail, price, action }: {
  onClick: () => void; image: string | undefined; alt: string; badge: ReactNode; where: string; name: string; detail: string; price: string; action: string;
}) {
  return (
    <button type="button" onClick={onClick} className={`d-zoom group flex flex-col overflow-hidden text-left transition hover:-translate-y-1 hover:border-[#FF6A2E]/60 ${panel}`}>
      <span className="relative block aspect-[4/3] overflow-hidden">
        <img src={image} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        {badge && <span className={`absolute top-3 left-3 flex items-center gap-2 rounded-full bg-[#0B1424]/75 px-3 py-1.5 ${label} text-[#EDE6D8] backdrop-blur`}>{badge}</span>}
      </span>
      <span className="flex flex-1 flex-col gap-1.5 border-t-2 border-dashed border-[#EDE6D8]/15 p-5">
        <span className={`${label} ${orange}`}>{where}</span>
        <span className="text-xl leading-tight font-semibold">{name}</span>
        <span className={`text-sm ${soft}`}>{detail}</span>
        <span className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className={`${mono} text-sm font-semibold`}>{price}</span>
          <span className={`flex items-center gap-1 text-sm font-semibold ${orange}`}>{action} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
        </span>
      </span>
    </button>
  );
}

function CardSkeletons() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading live packages">
      {[0, 1, 2, 3].map((i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-[22px] bg-[#EDE6D8]/8" />)}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className={`rounded-[22px] border border-dashed border-[#EDE6D8]/25 bg-[#0B1424] p-8 text-center ${soft}`}>{text}</p>;
}

/** One Thompsons holiday in full, and "ask about it" straight into Tribe's enquiries. */
function HolidayDialog({ holiday, onClose }: { holiday: Holiday | null; onClose: () => void }) {
  const [full, setFull] = useState<HolidayFull | null>(null);
  const { status, onSubmit, sending } = useEnquiry(() => ({ destination: holiday ? `${holiday.name} (${holiday.nights} nights, ${holiday.destination})` : "" }));

  useEffect(() => {
    setFull(null);
    if (holiday) getHoliday(holiday.id).then(setFull).catch(() => setFull(null));
  }, [holiday]);

  return (
    <Dialog open={!!holiday} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="d-route-dialog max-h-[100svh] max-w-2xl overflow-y-auto p-0 sm:max-h-[90vh] sm:rounded-3xl">
        {holiday && (
          <div>
            <div className="relative h-48 overflow-hidden">
              <img src={holiday.image || media.safari} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(11,20,36,.9))]" />
              <div className="absolute inset-x-6 bottom-4">
                <DialogTitle className={`${display} text-3xl leading-none`}>{holiday.name}</DialogTitle>
                <DialogDescription className={`mt-2 ${label} text-[#EDE6D8]/85`}>{holiday.destination} · {holiday.nights} nights{holiday.from_pp ? ` · from ${rand(holiday.from_pp, holiday.currency)} pp` : ""}</DialogDescription>
              </div>
            </div>
            <div className="grid gap-5 p-6">
              {holiday.strapline && <p className={`text-[15px] leading-relaxed ${soft}`}>{holiday.strapline}</p>}
              {holiday.inclusions.length > 0 && <p className={`text-sm ${soft}`}><b className="text-[#EDE6D8]">Includes:</b> {holiday.inclusions.join(" · ")}</p>}
              {full?.days?.length ? (
                <ol className="grid gap-2 border-l-2 border-[#FF6A2E] pl-4">
                  {full.days.slice(0, 8).map((d, i) => (
                    <li key={i} className="text-sm"><b className={mono}>Day {i + 1}</b> <span className={soft}>{d.items.join(" · ")}</span></li>
                  ))}
                </ol>
              ) : null}
              <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-[#EDE6D8]/12 bg-[#0B1424] p-5">
                <b className="text-lg">Ask about this holiday</b>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold">Name<input name="name" required autoComplete="name" className={input} /></label>
                  <label className="grid gap-1 text-sm font-semibold">Email<input type="email" name="email" required autoComplete="email" className={input} /></label>
                </div>
                <label className="grid gap-1 text-sm font-semibold">When would you like to go?<input name="travel_dates" placeholder="April 2027, 2 adults" className={input} /></label>
                <Consent />
                <BotTrap />
                <button type="submit" disabled={sending} className={btn}>{sending ? "Sending…" : "Send to my consultant"}</button>
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
function Consent() {
  return (
    <label className={`flex items-start gap-2.5 text-xs leading-relaxed ${soft}`}>
      <input type="checkbox" required className="mt-0.5 h-4 w-4 flex-none accent-[#FF6A2E]" />
      I agree that {BRAND.name} may use my details to plan and quote my trip (POPIA). We never share them with anyone else.
    </label>
  );
}

// ------------------------------------------------------------------ stop 2: AI concierge
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
    <div className={`flex flex-col overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,.85)] ${panel} ${compact ? "h-[min(560px,75vh)]" : "h-[560px]"}`}>
      <div className="flex items-center gap-3 border-b border-[#EDE6D8]/10 px-5 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6A2E] text-[#0B1424]"><Bot className="h-5 w-5" /></span>
        <div className="flex flex-col">
          <b className="text-[15px]">{BRAND.name} concierge</b>
          <span className={`flex items-center gap-1.5 ${label} ${soft}`}><LiveDot /> AI · a consultant prices every quote</span>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close the chat" className="ml-auto flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#EDE6D8]/10"><X className="h-5 w-5" /></button>
        )}
      </div>
      <div ref={scroller} className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5" aria-live="polite">
        {chat.msgs.map((m, i) => (
          <p key={i} className={`d-slide max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line ${m.from === "ai" ? "self-start rounded-tl-sm bg-[#EDE6D8]/8" : "self-end rounded-tr-sm bg-[#EDE6D8] text-[#0B1424]"}`}>
            {m.text}
          </p>
        ))}
        {chat.busy && (
          <span className={`flex items-center gap-2 self-start rounded-2xl bg-[#EDE6D8]/8 px-4 py-3 text-sm ${soft}`}><Loader2 className="h-4 w-4 animate-spin" /> Typing…</span>
        )}
        {chat.done && (
          <div className="d-slide flex items-start gap-3 rounded-2xl border border-[#4ADE80]/40 bg-[#4ADE80]/10 px-4 py-3 text-sm">
            <Check className="mt-0.5 h-4 w-4 flex-none text-[#4ADE80]" />
            <span>Your request is in TribeTravel: a new client, an enquiry and a draft quote for your consultant to price and send.</span>
          </div>
        )}
        {chat.error && <p role="alert" className="rounded-2xl bg-[#B42318]/25 px-4 py-3 text-sm">{chat.error}</p>}
        {chat.ready && chat.msgs.length === 1 && !chat.busy && (
          <div className="flex flex-wrap gap-2 pt-1">
            {STARTERS.map((s) => (
              <button key={s} type="button" onClick={() => chat.say(s)} className={`min-h-10 rounded-full border border-[#FF6A2E]/50 px-4 text-sm ${orange} transition hover:bg-[#FF6A2E]/10`}>{s}</button>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-[#EDE6D8]/10 p-3">
        <label className="sr-only" htmlFor={compact ? "chat-text-pop" : "chat-text"}>Your message</label>
        <input id={compact ? "chat-text-pop" : "chat-text"} value={text} onChange={(e) => setText(e.target.value)} disabled={!chat.ready || chat.done} maxLength={1000}
          placeholder={chat.done ? "Your request has been sent" : "Tell me about your dream trip…"}
          className={`${input} flex-1 rounded-full px-5`} />
        <button type="submit" aria-label="Send" disabled={!chat.ready || chat.busy || chat.done || !text.trim()} className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#FF6A2E] text-[#0B1424] disabled:opacity-40">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

function Concierge() {
  const [on, setOn] = useState(false);
  return (
    <section id="concierge" data-stop className={`relative z-10 grid scroll-mt-20 items-center gap-12 ${gutter} py-24 md:py-28 lg:grid-cols-[1.1fr_.9fr]`}>
      <div className="lg:order-2 flex flex-col gap-6">
        <StopLabel><Sparkles className="h-4 w-4" /> Stop 2 · AI concierge, 24/7</StopLabel>
        <h2 className={h2}>Plan it <span className={orange}>mid-air.</span></h2>
        <p className={`text-lg leading-relaxed ${soft}`}>
          Our AI concierge asks the right questions, suggests ideas from our packages and passes your complete brief to a consultant, who prices it and sends your quote. Day or night.
        </p>
        <ul className="flex flex-col gap-3 text-[15px]">
          {["Answers in seconds, any time", "Never guesses a price: your consultant quotes", "Says it's an AI, and asks before saving your details (POPIA)"].map((x) => (
            <li key={x} className="flex items-center gap-3"><Check className={`h-4 w-4 flex-none ${orange}`} />{x}</li>
          ))}
        </ul>
      </div>
      <div className="lg:order-1">
        {on ? <ChatWindow /> : (
          <button type="button" onClick={() => setOn(true)} className={`group flex h-[560px] w-full flex-col items-center justify-center gap-5 border-dashed text-center transition hover:border-[#FF6A2E] ${panel}`}>
            <span className="d-float flex h-20 w-20 items-center justify-center rounded-full bg-[#FF6A2E] text-[#0B1424]"><Bot className="h-9 w-9" /></span>
            <span className={`${display} text-3xl`}>Start a conversation</span>
            <span className={soft}>Chat with our AI concierge</span>
          </button>
        )}
      </div>
    </section>
  );
}

/** The floating "Ask our concierge" button, above the WhatsApp button. Hidden while the concierge section
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
        <button type="button" onClick={() => setOpen(true)} className="d-rise fixed right-4 bottom-24 z-30 flex min-h-12 items-center gap-2 rounded-full bg-[#FF6A2E] px-5 font-bold text-[#0B1424] shadow-[0_12px_30px_rgba(0,0,0,.5)] md:right-6 md:bottom-28">
          <Bot className="h-5 w-5" /> Ask our concierge
        </button>
      )}
    </>
  );
}

// ------------------------------------------------------------------ stop 3: book a call
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

// ------------------------------------------------------------------ stop 4: what happens next
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
  // Each waypoint lights up as it passes the lower part of the screen, one after the other.
  const list = useRef<HTMLOListElement>(null);
  useOnScroll((_, reduced) => {
    list.current?.querySelectorAll<HTMLElement>("li").forEach((li, i) => {
      const lit = reduced || li.getBoundingClientRect().top < window.innerHeight * (0.9 - i * 0.04);
      li.dataset["lit"] = String(lit);
    });
  });

  return (
    <section data-stop className={`relative z-10 flex flex-col gap-14 ${gutter} py-24 md:py-28`}>
      <div className="flex max-w-[760px] flex-col gap-4">
        <StopLabel>Stop 4 · What happens next</StopLabel>
        <h2 className={h2}>One message. <span className={orange}>The rest flies itself.</span></h2>
        <p className={`text-lg leading-relaxed ${soft}`}>Every enquiry runs through TribeTravel, our travel system, so nothing gets lost between your first message and your flight home.</p>
      </div>
      <ol ref={list} className="relative grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-7">
        <span aria-hidden="true" className="absolute top-7 right-0 left-0 hidden border-t-2 border-dashed border-[#EDE6D8]/15 lg:block" />
        {FLOW.map(({ icon: Icon, title, text }, i) => (
          <li key={title} data-lit="false" className="group relative flex flex-col gap-3">
            <span className="flex items-center gap-3">
              <span className={`flex h-14 w-14 flex-none items-center justify-center rounded-full border-2 border-[#EDE6D8]/30 bg-[#0B1424] transition duration-500 group-data-[lit=true]:border-[#FF6A2E] group-data-[lit=true]:bg-[#FF6A2E] group-data-[lit=true]:text-[#0B1424]`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className={`${mono} text-sm ${soft} transition group-data-[lit=true]:text-[#FF6A2E]`}>WP{i + 1}</span>
            </span>
            <b className="text-[15px]">{title}</b>
            <span className={`text-sm leading-relaxed ${soft}`}>{text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ------------------------------------------------------------------ arrival: the installable app
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
    return <p className={`text-sm ${soft}`}>Trip alerts work once the app is on your home screen (on iPhone, iOS 16.4 or later).</p>;
  }
  if (state === "on") {
    return <span className="flex items-center gap-2 font-semibold text-[#4ADE80]"><Bell className="h-5 w-5" /> Trip alerts are on for this device</span>;
  }
  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-3 p-5 ${panel}`}>
      <b className="flex items-center gap-2"><Bell className={`h-5 w-5 ${orange}`} /> Get an alert when your quote is ready</b>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input name="email" type="email" required autoComplete="email" placeholder="The email you enquired with" aria-label="Email"
          className={`${input} flex-1 rounded-full px-5`} />
        <button type="submit" disabled={state === "busy"} className={`${btn} whitespace-nowrap`}>
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
    <section id="app" data-stop className={`relative z-10 grid scroll-mt-20 items-center gap-14 ${gutter} py-24 md:py-28 lg:grid-cols-2`}>
      <div className="flex flex-col gap-6">
        <StopLabel><Smartphone className="h-4 w-4" /> Arrival · The {BRAND.short} app</StopLabel>
        <h2 className={h2}>Land in <span className={orange}>your pocket.</span></h2>
        <p className={`text-lg leading-relaxed ${soft}`}>
          Add {BRAND.name} to your home screen: it opens like an app, works on a weak signal, and keeps your concierge, quotes and our contact details one tap away.
        </p>
        {app.installed ? (
          <span className="flex items-center gap-2 font-semibold text-[#4ADE80]"><Check className="h-5 w-5" /> Installed on this device</span>
        ) : app.canInstall ? (
          <button type="button" onClick={app.install} className={`${btn} min-h-14 self-start px-8`}>
            <Download className="h-5 w-5" /> Install the app
          </button>
        ) : (
          <p className={`p-5 text-[15px] leading-relaxed ${panel}`}>
            {app.ios
              ? <>On iPhone: tap <b>Share</b>, then <b>Add to Home Screen</b>.</>
              : <>On your phone: open the browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.</>}
          </p>
        )}
        <TripAlerts />
        <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className={`self-start text-sm font-semibold underline-offset-4 hover:underline ${orange}`}>
          Or ask the concierge now →
        </button>
      </div>
      <div className="flex justify-center">
        <div className="d-float relative h-[560px] w-[280px] rounded-[44px] border-[10px] border-[#22314F] bg-[#0B1424] shadow-[0_50px_100px_-30px_rgba(0,0,0,.9)]">
          <div className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#22314F]" aria-hidden="true" />
          <div className="flex h-full flex-col overflow-hidden rounded-[34px]">
            <div className="relative h-[46%]">
              <img src={media.islands} alt="" aria-hidden="true" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,#0B1424)]" />
              <span className={`absolute bottom-4 left-5 ${display} text-2xl leading-none`}>Your trip to<br /><span className={orange}>Mauritius</span></span>
            </div>
            <div className="flex flex-1 flex-col gap-2.5 p-4 text-sm">
              <span className={`flex items-center gap-2 ${label} ${orange}`}><LiveDot /> Quote Q-1042 ready</span>
              {[["Flights", "JNB → MRU"], ["Villa", "7 nights"], ["Concierge", "Ask me anything"]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-2xl border border-[#EDE6D8]/12 px-4 py-3">
                  <span className="flex flex-col"><b>{k}</b><span className={`${mono} text-xs ${soft}`}>{v}</span></span>
                  <ArrowRight className={`h-4 w-4 ${orange}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ contact: where the route lands
function Contact() {
  return (
    <section id="contact" data-stop className={`relative z-10 flex scroll-mt-20 flex-col items-center gap-7 ${gutter} pt-28 pb-40 text-center`}>
      <StopLabel>Final approach</StopLabel>
      <h2 className={`${h2} max-w-[16ch]`}>Ready when <span className={orange}>you are.</span></h2>
      <p className={`max-w-[48ch] text-lg leading-relaxed ${soft}`}>Tell us where you dream of going. A real person replies, usually the same day.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <a href="#quote" className={`${btn} min-h-14 px-8`}>Get my quote</a>
        <a href={contact.whatsapp} target="_blank" rel="noreferrer" className={`${ghost} min-h-14 px-8`}>
          <WhatsAppIcon className="h-5 w-5" /> WhatsApp us
        </a>
      </div>
      <p className={`${mono} text-sm ${soft}`}>
        <a href={tel} className="hover:text-[#FF6A2E]">{contact.phoneDisplay}</a> · <a href={mailto} className="hover:text-[#FF6A2E]">{contact.email}</a>
      </p>
    </section>
  );
}
