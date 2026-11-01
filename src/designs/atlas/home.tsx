// The home page's own sections: the globe of trips in progress, the three feeds arriving, where we go, group
// departures, the automation and dashboard teasers, and the assistant beside the quote form.
import { useEffect, useState } from "react";
import { ArrowRight, Plane, Sparkles } from "lucide-react";
import { rand } from "@/lib/packages";
import { CITIES, DEPARTURES, DESTINATIONS, PLACE, TRIPS, type Destination } from "@/designs/atlas/content";
import { openChat } from "@/designs/atlas/hooks";
import { DashboardFrame, Kpis } from "@/designs/atlas/dashboard";
import { FeedStream } from "@/designs/atlas/feeds";
import { FlowTeaser } from "@/designs/atlas/flow";
import { Globe } from "@/designs/atlas/globe";
import { Eyebrow, LiveDot } from "@/designs/atlas/parts";
import { QuoteForm } from "@/designs/atlas/quote";
import { BASE, FEEDS, btn, card, display, ghost, glass, glow, gutter, h2, label, mono, muted } from "@/designs/atlas/theme";

const coords = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(1)}°${lat < 0 ? "S" : "N"} ${Math.abs(lon).toFixed(1)}°${lon < 0 ? "W" : "E"}`;

export function Hero() {
  return (
    <section className={`relative grid items-center gap-4 ${gutter} pt-8 pb-16 lg:grid-cols-[1fr_1.05fr] lg:pt-12 lg:pb-24`}>
      <div className="relative z-10 flex flex-col gap-6">
        <Eyebrow className="d-rise"><LiveDot /> {TRIPS.length} trips in progress · sample</Eyebrow>
        <h1 className={`d-rise ${display} max-w-[12ch] text-[clamp(46px,7.4vw,108px)] leading-[0.92] [animation-delay:.08s]`}>
          The world is turning. <span className={glow}>Where to next?</span>
        </h1>
        <p className={`d-rise max-w-[50ch] text-lg leading-relaxed ${muted} [animation-delay:.18s] md:text-xl`}>
          Right now our travellers are on beaches, in the bush and out at sea. Tell us where you'd like to be: we plan the route with live prices from three suppliers, and a real person replies the same day.
        </p>
        <div className="d-rise flex flex-wrap gap-3 [animation-delay:.28s]">
          <a href={`${BASE}/contact#quote`} className={`${btn} min-h-14 px-8`}>Plan my trip <ArrowRight className="h-4 w-4" /></a>
          <a href={`${BASE}/suppliers`} className={`${ghost} min-h-14 px-7`}>See live packages</a>
        </div>
        <ul className="d-rise flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold [animation-delay:.38s]">
          {["3 live supplier feeds", "Quotes within 24 hours", "Group departures with seats you can see"].map((x) => (
            <li key={x} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FFB547]" aria-hidden="true" />{x}</li>
          ))}
        </ul>
      </div>
      <div className="relative mx-auto w-full max-w-[680px]">
        <Globe rings label={`A globe turning slowly, with an arc for each of the ${TRIPS.length} trips our travellers are on right now, and three coloured rings for our live supplier feeds.`} />
        <TripTicker />
        <RingLegend />
      </div>
    </section>
  );
}

/** One trip in progress at a time, in a glass card below the globe. Example travellers. */
function TripTicker() {
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => { if (!document.hidden) setAt((a) => (a + 1) % TRIPS.length); }, 3000);
    return () => clearInterval(id);
  }, []);
  const t = TRIPS[at]!;
  return (
    <div className={`absolute bottom-[3%] left-0 flex max-w-[78%] items-center gap-3 px-4 py-3 ${glass}`}>
      <Plane className="h-5 w-5 flex-none rotate-45 text-[#F08C2E]" aria-hidden="true" />
      <span key={at} className="atlas-pop flex min-w-0 flex-col">
        <b className={`${mono} text-sm`}>{t.from} → {t.to} <span className={`font-normal ${muted}`}>· {CITIES[t.to].name}</span></b>
        <span className={`truncate text-xs ${muted}`}>{t.who} · {t.day} · example</span>
      </span>
    </div>
  );
}

/** What the three orbit rings are. */
function RingLegend() {
  return (
    <ul aria-label="Supplier feeds" className={`absolute top-[2%] right-0 hidden flex-col gap-1.5 px-4 py-3 sm:flex ${glass}`}>
      {FEEDS.map((f) => (
        <li key={f.key} className="flex items-center gap-2 text-xs font-semibold">
          <span className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: f.colour }} aria-hidden="true" />{f.name}{f.example ? <span className={muted}> (example)</span> : ""}
        </li>
      ))}
    </ul>
  );
}

export function FeedsSection() {
  return (
    <section className={`relative grid items-start gap-12 ${gutter} py-20 lg:grid-cols-[.9fr_1.1fr] lg:py-28`}>
      <div className="flex flex-col gap-6 lg:sticky lg:top-28">
        <Eyebrow>Three supplier feeds · live</Eyebrow>
        <h2 className={h2}>Three suppliers. <span className={glow}>One page.</span></h2>
        <p className={`text-lg leading-relaxed ${muted}`}>
          Each ring around the globe is one of our suppliers, sending its latest packages straight to this page through TribeTravel. Real rooms, real prices, updated while you look.
        </p>
        <ul className="flex flex-col gap-2">
          {FEEDS.map((f) => (
            <li key={f.key} className={`flex items-center gap-3 p-3.5 ${card}`}>
              <span aria-hidden="true" className="relative flex h-8 w-8 flex-none items-center justify-center">
                <span className="atlas-orbit absolute inset-0 rounded-full border-2 border-t-transparent" style={{ borderColor: f.colour, borderTopColor: "transparent" }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.colour }} />
              </span>
              <span className="flex flex-col"><b className="text-[15px]">{f.name}</b><span className={`text-sm ${muted}`}>{f.line}</span></span>
            </li>
          ))}
        </ul>
        <a href={`${BASE}/suppliers`} className={`${ghost} self-start`}>All three feeds, side by side <ArrowRight className="h-4 w-4" /></a>
      </div>
      <FeedStream />
    </section>
  );
}

export function DestinationCard({ d }: { d: Destination }) {
  const c = CITIES[PLACE[d.slug] ?? "JNB"];
  return (
    <a href={`${BASE}/destinations/${d.slug}`} className={`d-zoom group flex flex-col overflow-hidden transition hover:-translate-y-1 ${card}`}>
      <span className="relative block aspect-[4/3] overflow-hidden">
        <img src={d.photos[0]} alt={d.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <span className={`absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1.5 ${label} text-[#0B2340] backdrop-blur`}>{coords(c.lat, c.lon)}</span>
      </span>
      <span className="flex flex-1 flex-col gap-1.5 p-5">
        <span className={`${label} ${muted}`}>{d.region} · {d.flight}</span>
        <span className={`${display} text-2xl leading-tight`}>{d.name}</span>
        <span className={`text-sm ${muted}`}>{d.tagline}</span>
        <span className="mt-auto flex items-center gap-1 pt-3 text-sm font-bold text-[#1D6FD8]">Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
      </span>
    </a>
  );
}

export function WhereWeGo() {
  return (
    <section className={`relative flex flex-col gap-10 ${gutter} py-20`}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[640px] flex-col gap-4">
          <Eyebrow>Destinations</Eyebrow>
          <h2 className={h2}>Six places we know <span className={glow}>by heart.</span></h2>
        </div>
        <a href={`${BASE}/destinations`} className={ghost}>All destinations <ArrowRight className="h-4 w-4" /></a>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{DESTINATIONS.map((d) => <DestinationCard key={d.slug} d={d} />)}</div>
    </section>
  );
}

export function DeparturesTeaser() {
  return (
    <section className={`relative flex flex-col gap-10 ${gutter} py-20`}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[640px] flex-col gap-4">
          <Eyebrow>Group departures · seats are limited</Eyebrow>
          <h2 className={h2}>Pick a date. <span className={glow}>Grab a seat.</span></h2>
          <p className={`text-lg leading-relaxed ${muted}`}>Small-group trips with a set number of seats. You see exactly how many are left before you ask.</p>
        </div>
        <a href={`${BASE}/book`} className={ghost}>All departures <ArrowRight className="h-4 w-4" /></a>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {DEPARTURES.slice(0, 3).map((d) => (
          <a key={d.id} href={`${BASE}/book`} className={`group flex items-center gap-4 p-3 pr-5 transition hover:-translate-y-0.5 ${card}`}>
            <img src={d.image} alt="" loading="lazy" className="h-20 w-20 flex-none rounded-2xl object-cover" />
            <span className="flex min-w-0 flex-col gap-1">
              <b className="truncate">{d.title}</b>
              <span className={`${mono} text-xs ${muted}`}>{d.when} · from {rand(d.from_pp)}</span>
              <span className={`flex items-center gap-1.5 text-sm font-bold ${d.left <= 3 ? "text-[#8A3F00]" : "text-[#1452A3]"}`}>
                <span className="h-2 w-2 rounded-full" style={{ background: d.left <= 3 ? "#F08C2E" : "#1D6FD8" }} aria-hidden="true" />{d.left} of {d.seats} seats left
              </span>
            </span>
          </a>
        ))}
      </div>
      <p className={`text-xs ${muted}`}>Example departures for this sample site.</p>
    </section>
  );
}

export function AutomationTeaser() {
  return (
    <section className={`relative flex flex-col gap-10 ${gutter} py-20`}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[680px] flex-col gap-4">
          <Eyebrow>How we work · automated</Eyebrow>
          <h2 className={h2}>Nothing falls <span className={glow}>through the cracks.</span></h2>
          <p className={`text-lg leading-relaxed ${muted}`}>Every enquiry runs the same route through our travel system: qualified, quoted, followed up and confirmed with the supplier, with WhatsApp and email updates for you along the way.</p>
        </div>
        <a href={`${BASE}/automation`} className={ghost}>See the whole flow <ArrowRight className="h-4 w-4" /></a>
      </div>
      <FlowTeaser />
    </section>
  );
}

export function DashboardTeaser() {
  return (
    <section className={`relative flex flex-col gap-10 ${gutter} py-20`}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[680px] flex-col gap-4">
          <Eyebrow>Behind the counter</Eyebrow>
          <h2 className={h2}>You see the trip. <span className={glow}>We see everything.</span></h2>
          <p className={`text-lg leading-relaxed ${muted}`}>Our own dashboard tracks every enquiry, quote and booking, so we know what's working and who needs a call back.</p>
        </div>
        <a href={`${BASE}/dashboard`} className={ghost}>Open the dashboard <ArrowRight className="h-4 w-4" /></a>
      </div>
      <DashboardFrame><Kpis /></DashboardFrame>
    </section>
  );
}

export function AskOrPlan() {
  return (
    <section className={`relative grid items-start gap-10 ${gutter} py-20 lg:grid-cols-[.8fr_1.2fr]`}>
      <div className="flex flex-col gap-6">
        <Eyebrow>Plan my trip</Eyebrow>
        <h2 className={h2}>Ask anything. <span className={glow}>Any time.</span></h2>
        <p className={`text-lg leading-relaxed ${muted}`}>Our AI assistant answers at midnight and puts your brief together. Or fill in the form and a consultant sends your quote within a day.</p>
        <button type="button" onClick={openChat} className={`group flex items-center gap-4 p-4 text-left transition hover:-translate-y-0.5 ${glass}`}>
          <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1D6FD8,#6A52E8)] text-white"><Sparkles className="h-6 w-6" /></span>
          <span className="flex flex-col"><b className={`${display} text-xl`}>Ask our assistant</b><span className={`text-sm ${muted}`}>AI · it says so, and a consultant prices every quote</span></span>
          <ArrowRight className="ml-auto h-5 w-5 text-[#1D6FD8] transition group-hover:translate-x-1" />
        </button>
      </div>
      <QuoteForm />
    </section>
  );
}
