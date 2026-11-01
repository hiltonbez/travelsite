// The Atlas site's ten pages: home, destinations (and one page per destination), book, the three supplier feeds,
// how we work (automation), behind the counter (dashboard), about, contact and privacy. Each is prerendered on its
// own (scripts/snapshot.mjs PAGES).
import { useMemo } from "react";
import { ArrowRight, Mail, MapPin, Phone, Plane, Sparkles, Sun } from "lucide-react";
import { BRAND, WhatsAppIcon, contact, mailto, tel } from "@/designs/shared";
import { CallSlots, Departures } from "@/designs/atlas/book";
import { openChat } from "@/designs/atlas/hooks";
import { CITIES, DESTINATIONS, PLACE, TRIPS, destination, type Trip } from "@/designs/atlas/content";
import { ClientList, DashboardFrame, Kpis, Reports, SupplierList } from "@/designs/atlas/dashboard";
import { FeedColumns } from "@/designs/atlas/feeds";
import { FlowRun, Rules } from "@/designs/atlas/flow";
import { Globe } from "@/designs/atlas/globe";
import { AskOrPlan, AutomationTeaser, DashboardTeaser, DeparturesTeaser, DestinationCard, FeedsSection, Hero, WhereWeGo } from "@/designs/atlas/home";
import { AtlasLayout, PageTitle } from "@/designs/atlas/layout";
import { CountUp, Eyebrow, ExampleTag } from "@/designs/atlas/parts";
import { QuoteForm } from "@/designs/atlas/quote";
import { BASE, FEEDS, btn, card, display, ghost, glass, glow, gutter, h2, label, mono, muted } from "@/designs/atlas/theme";

// ------------------------------------------------------------------ home
export function AtlasHome() {
  return (
    <AtlasLayout current={BASE} toasts>
      <Hero />
      <FeedsSection />
      <WhereWeGo />
      <DeparturesTeaser />
      <AutomationTeaser />
      <DashboardTeaser />
      <AskOrPlan />
    </AtlasLayout>
  );
}

// ------------------------------------------------------------------ destinations
/** The six destinations' arcs from Johannesburg, for the destinations globe. */
/** A few trips in progress for the suppliers globe. */
const SOME_TRIPS = TRIPS.slice(0, 6);

const TO_PLACES: Trip[] = DESTINATIONS.map((d) => ({ from: "JNB", to: PLACE[d.slug]!, who: d.name, day: "" }));

export function DestinationsPage() {
  return (
    <AtlasLayout current={`${BASE}/destinations`}>
      <PageTitle crumb="Destinations" title={<>Where would you <span className={glow}>like to land?</span></>}
        intro="Six places our clients love, from a long weekend in the bush to the Greek islands. Every trip is tailor-made: tell us what you like and we'll build it around you."
        aside={<Globe trips={TO_PLACES} className="mx-auto w-full max-w-[520px]" label="A globe with arcs from Johannesburg to each of our six destinations." />} />
      <section className={`relative grid gap-5 ${gutter} pb-20 sm:grid-cols-2 lg:grid-cols-3`}>
        {DESTINATIONS.map((d) => <DestinationCard key={d.slug} d={d} />)}
      </section>
      <section className={`relative flex flex-col gap-8 ${gutter} pb-24`}>
        <div className="flex max-w-[680px] flex-col gap-4">
          <Eyebrow>Specials · live from our suppliers</Eyebrow>
          <h2 className={h2}>Today's packages, <span className={glow}>straight from the source.</span></h2>
        </div>
        <FeedColumns />
      </section>
    </AtlasLayout>
  );
}

export function DestinationPage({ slug }: { slug: string }) {
  const d = destination(slug);
  const code = PLACE[slug];
  const trips = useMemo<Trip[]>(() => (code ? [{ from: "JNB", to: code, who: "", day: "" }, ...TRIPS.filter((t) => t.to !== code).slice(0, 5)] : TRIPS), [code]);
  if (!d || !code) return null;
  const c = CITIES[code];
  const others = DESTINATIONS.filter((x) => x.slug !== d.slug).slice(0, 3);
  const short = d.name.split(" & ")[0]!;
  return (
    <AtlasLayout current={`${BASE}/destinations`}>
      <PageTitle crumb={<><a href={`${BASE}/destinations`} className="hover:text-[#1D6FD8]">Destinations</a> <span className="text-[#1D6FD8]">/</span> {d.name}</>}
        title={<>{d.name}<span className="text-[#FFB547]">.</span></>} intro={d.intro}
        aside={<Globe focus={code} trips={trips} className="mx-auto w-full max-w-[540px]" label={`A globe turned to ${d.name}, with the route from Johannesburg drawn in blue.`} />}>
        <div className="flex flex-wrap gap-2">
          {[[Plane, `JNB → ${d.code} · ${d.flight}`], [MapPin, `${d.region} · ${Math.abs(c.lat).toFixed(1)}°${c.lat < 0 ? "S" : "N"} ${c.lon.toFixed(1)}°E`]].map(([Icon, text]) => {
            const I = Icon as typeof Plane;
            return <span key={String(text)} className={`flex min-h-10 items-center gap-2 rounded-full border border-[#0B2340]/10 bg-white/80 px-4 ${mono} text-xs`}><I className="h-4 w-4 text-[#1D6FD8]" /> {String(text)}</span>;
          })}
        </div>
        <a href="#quote" className={`${btn} self-start`}>Plan my {short} trip <ArrowRight className="h-4 w-4" /></a>
      </PageTitle>

      <section className={`relative grid gap-4 ${gutter} pb-16 md:grid-cols-[1.4fr_1fr]`}>
        <img src={d.photos[0]} alt={d.name} className="h-full max-h-[540px] w-full rounded-[28px] object-cover" />
        <div className="grid gap-4">
          <img src={d.photos[1]} alt="" loading="lazy" className="h-full max-h-[262px] w-full rounded-[28px] object-cover" />
          <img src={d.photos[2]} alt="" loading="lazy" className="h-full max-h-[262px] w-full rounded-[28px] object-cover" />
        </div>
      </section>

      <section className={`relative grid gap-10 ${gutter} pb-20 lg:grid-cols-[1fr_1.2fr]`}>
        <div className="flex flex-col gap-4">
          <div className={`flex flex-col gap-3 p-6 ${glass}`}>
            <span className={`flex items-center gap-2 ${label} text-[#A84A06]`}><Sun className="h-4 w-4" /> Best time to go</span>
            <p className="text-lg">{d.bestTime}</p>
          </div>
          <div className={`flex flex-col gap-3 p-6 ${glass}`}>
            <span className={`${label} text-[#1D6FD8]`}>Good for</span>
            <div className="flex flex-wrap gap-2">{d.goodFor.map((g) => <span key={g} className="rounded-full bg-[#EEF5FE] px-3 py-1.5 text-sm font-semibold">{g}</span>)}</div>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <Eyebrow>A sample itinerary</Eyebrow>
          <ol className="flex flex-col gap-4 border-l-2 border-dashed border-[#1D6FD8]/30 pl-6">
            {d.days.map(([title, text], i) => (
              <li key={title} className="relative">
                <span className="absolute top-0.5 -left-[37px] flex h-6 w-6 items-center justify-center rounded-full bg-[#1D6FD8] text-[11px] font-bold text-white">{i + 1}</span>
                <b className="text-lg">{title}</b>
                <p className={muted}>{text}</p>
              </li>
            ))}
          </ol>
          <p className={`text-sm ${muted}`}>Every trip is tailor-made: we change the days, the hotels and the pace to suit you.</p>
        </div>
      </section>

      <section className={`relative flex flex-col gap-6 ${gutter} pb-20`}>
        <Eyebrow>Live packages for {short}</Eyebrow>
        <FeedColumns match={short} />
      </section>

      <section className={`relative grid gap-8 ${gutter} pb-20 lg:grid-cols-[.7fr_1.3fr]`}>
        <div className="flex flex-col gap-4">
          <Eyebrow>Plan my trip</Eyebrow>
          <h2 className={h2}>Your {short}, <span className={glow}>your way.</span></h2>
          <p className={`text-lg ${muted}`}>Tell us when and who's going. A consultant who's been there sends your quote within a day.</p>
        </div>
        <QuoteForm place={d.name} />
      </section>

      <section className={`relative flex flex-col gap-8 ${gutter} pb-24`}>
        <Eyebrow>More destinations</Eyebrow>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{others.map((x) => <DestinationCard key={x.slug} d={x} />)}</div>
      </section>
    </AtlasLayout>
  );
}

// ------------------------------------------------------------------ book
export function BookPage() {
  return (
    <AtlasLayout current={`${BASE}/book`}>
      <PageTitle crumb="Book" title={<>Pick a date. <span className={glow}>Take a seat.</span></>}
        intro="Group departures with a set number of seats, and calls with a consultant at a time that suits you. You always see what's left before you ask." />
      <section className={`relative flex flex-col gap-6 ${gutter} pb-20`}>
        <h2 className={`${display} text-3xl`}>Group departures</h2>
        <Departures />
      </section>
      <section className={`relative grid items-start gap-10 ${gutter} pb-20 lg:grid-cols-[.8fr_1.2fr]`}>
        <div className="flex flex-col gap-4 lg:sticky lg:top-28">
          <Eyebrow>Live times · talk to a consultant</Eyebrow>
          <h2 className={h2}>Your time, <span className={glow}>not ours.</span></h2>
          <p className={`text-lg leading-relaxed ${muted}`}>Pick a time and a consultant calls you to plan your trip. Times and seats are live: when one fills up, we show you the next free one.</p>
        </div>
        <CallSlots />
      </section>
      <section className={`relative ${gutter} pb-24`}>
        <div className={`flex flex-wrap items-center justify-between gap-6 p-7 ${glass}`}>
          <div className="flex max-w-[56ch] flex-col gap-2">
            <span className={`${label} text-[#0B6F7A]`}>Book a resort online</span>
            <p className="text-lg">Beachcomber's Mauritius resorts are bookable right here: check live rates for your dates and pick your room.</p>
          </div>
          <a href={`${BASE}/suppliers`} className={btn}>See live rates <ArrowRight className="h-4 w-4" /></a>
        </div>
      </section>
    </AtlasLayout>
  );
}

// ------------------------------------------------------------------ suppliers
export function SuppliersPage() {
  return (
    <AtlasLayout current={`${BASE}/suppliers`}>
      <PageTitle crumb="Live packages" title={<>Three feeds, <span className={glow}>always live.</span></>}
        intro="We work with three suppliers whose systems talk straight to ours. Their packages and prices arrive here as they change, so what you see is what's available today."
        aside={<Globe rings trips={SOME_TRIPS} className="mx-auto w-full max-w-[560px]" label="A globe with three coloured rings orbiting it, one for each supplier feed." />}>
        <ul className="flex flex-wrap gap-2">
          {FEEDS.map((f) => (
            <li key={f.key} className="flex min-h-10 items-center gap-2 rounded-full border border-[#0B2340]/10 bg-white/80 px-4 text-sm font-semibold">
              <span className="h-3 w-3 rounded-full border-[3px]" style={{ borderColor: f.colour }} aria-hidden="true" />{f.name}{f.example && <span className={muted}>· example</span>}
            </li>
          ))}
        </ul>
      </PageTitle>
      <section className={`relative ${gutter} pb-20`}><FeedColumns /></section>
      <section className={`relative grid gap-5 ${gutter} pb-24 md:grid-cols-3`}>
        {[
          ["1", "The supplier updates", "A rate changes or a new package goes on sale in the supplier's own system."],
          ["2", "TribeTravel picks it up", "Our travel system reads the feed, matches it to our destinations and adds our service."],
          ["3", "It's on this page", "You see it with today's price. Book it online, or ask and we'll hold it for you."],
        ].map(([n, t, x]) => (
          <div key={n} className={`flex flex-col gap-2 p-6 ${card}`}>
            <span className={`${display} text-5xl text-[#1D6FD8]/25`}>{n}</span>
            <b className={`${display} text-xl`}>{t}</b>
            <p className={muted}>{x}</p>
          </div>
        ))}
      </section>
    </AtlasLayout>
  );
}

// ------------------------------------------------------------------ automation
export function AutomationPage() {
  return (
    <AtlasLayout current={`${BASE}/automation`} toasts>
      <PageTitle crumb="How we work" title={<>One message. <span className={glow}>The rest runs itself.</span></>}
        intro="Every enquiry follows the same route through our travel system, so it's answered fast, followed up on time and confirmed with the supplier without anyone retyping a thing." />
      <section className={`relative ${gutter} pb-20`}><FlowRun /></section>
      <section className={`relative grid items-start gap-10 ${gutter} pb-24 lg:grid-cols-[.8fr_1.2fr]`}>
        <div className="flex flex-col gap-4">
          <Eyebrow>The rules behind it</Eyebrow>
          <h2 className={h2}>Written once. <span className={glow}>Run every time.</span></h2>
          <p className={`text-lg leading-relaxed ${muted}`}>Lead reminders, WhatsApp and email notifications and supplier messages are rules in TribeTravel. These are some of ours.</p>
          <ExampleTag>Example rules</ExampleTag>
        </div>
        <Rules />
      </section>
    </AtlasLayout>
  );
}

// ------------------------------------------------------------------ dashboard
export function DashboardPage() {
  return (
    <AtlasLayout current={`${BASE}/dashboard`}>
      <PageTitle crumb="Behind the counter" title={<>Behind <span className={glow}>the counter.</span></>}
        intro="This is our side of the screen: the dashboard and reports we run the agency on, and the clients and suppliers we look after. The figures here are examples." />
      <section className={`relative ${gutter} pb-12`}>
        <DashboardFrame>
          <Kpis />
          <Reports />
        </DashboardFrame>
      </section>
      <section className={`relative flex flex-col gap-8 ${gutter} pb-24`}>
        <div className="flex max-w-[700px] flex-col gap-4">
          <Eyebrow>Customer and supplier management</Eyebrow>
          <h2 className={h2}>Every client. <span className={glow}>Every supplier.</span></h2>
          <p className={`text-lg leading-relaxed ${muted}`}>Each client's trips, quotes, messages and preferences in one place, and each supplier's feed, contracts and bookings beside them.</p>
          <ExampleTag />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <ClientList />
          <SupplierList />
        </div>
      </section>
    </AtlasLayout>
  );
}

// ------------------------------------------------------------------ about
const TEAM: [string, string, string][] = [
  ["Thandi Mokoena", "Islands & honeymoons", "Has stayed at nine of Mauritius's resorts, so you don't have to guess."],
  ["Pieter van der Berg", "Safari & self-drive", "Fifteen years planning trips into the Kruger and Botswana."],
  ["Aisha Khan", "Europe & group tours", "Hosts our Greek islands departure and knows the Schengen visa process inside out."],
];

export function AboutPage() {
  return (
    <AtlasLayout current={`${BASE}/about`}>
      <PageTitle crumb="About" title={<>Real people, <span className={glow}>with a very good system.</span></>}
        intro={`${BRAND.name} plans tailor-made holidays and group trips from South Africa. Every quote is priced by a person who has been there, and our travel system makes sure nothing is forgotten.`} />
      <section className={`relative grid grid-cols-2 gap-4 ${gutter} pb-16 md:grid-cols-4`}>
        {([[1200, "+", "trips planned"], [24, "h", "to your quote"], [3, "", "live supplier feeds"], [4.9, " / 5", "from our clients"]] as [number, string, string][]).map(([n, suffix, t]) => (
          <div key={t} className={`flex flex-col gap-1 p-6 ${card}`}>
            <b className={`${display} text-[clamp(34px,4vw,52px)] leading-none text-[#1D6FD8]`}><CountUp value={n} suffix={suffix} decimals={n % 1 ? 1 : 0} /></b>
            <span className={muted}>{t}</span>
          </div>
        ))}
        <p className={`col-span-2 text-xs ${muted} md:col-span-4`}>Example figures for this sample site.</p>
      </section>
      <section className={`relative flex flex-col gap-8 ${gutter} pb-16`}>
        <Eyebrow>Your consultants</Eyebrow>
        <div className="grid gap-5 md:grid-cols-3">
          {TEAM.map(([name, role, line], i) => (
            <div key={name} className={`flex flex-col gap-3 p-6 ${card}`}>
              <span aria-hidden="true" className={`flex h-16 w-16 items-center justify-center rounded-full ${display} text-xl text-white`}
                style={{ background: ["linear-gradient(135deg,#1D6FD8,#4BA3F5)", "linear-gradient(135deg,#0E9FAE,#5AB06B)", "linear-gradient(135deg,#6A52E8,#C2570C)"][i] }}>
                {name.split(" ").map((w) => w[0]).filter((x) => x === x?.toUpperCase()).slice(0, 2).join("")}
              </span>
              <b className={`${display} text-2xl`}>{name}</b>
              <span className={`${label} text-[#1D6FD8]`}>{role}</span>
              <p className={muted}>{line}</p>
            </div>
          ))}
        </div>
      </section>
      <section className={`relative ${gutter} pb-24`}>
        <div className={`grid gap-6 p-8 md:grid-cols-3 ${glass}`}>
          {[["Accredited", "Your agency's ASATA and IATA numbers go here."], ["Protected", "Payments go through a registered trust account."], ["Always on", "A real person on WhatsApp while you travel."]].map(([t, x]) => (
            <div key={t} className="flex flex-col gap-2"><b className={`${display} text-xl`}>{t}</b><span className={muted}>{x}</span></div>
          ))}
        </div>
      </section>
    </AtlasLayout>
  );
}

// ------------------------------------------------------------------ contact
export function ContactPage() {
  return (
    <AtlasLayout current={`${BASE}/contact`}>
      <PageTitle crumb="Contact" title={<>Talk to <span className={glow}>a real person.</span></>}
        intro="Ask for a quote, chat to our assistant, or send us a WhatsApp. We reply the same day." />
      <section className={`relative grid gap-4 ${gutter} pb-16 sm:grid-cols-2 lg:grid-cols-4`}>
        {[
          [<WhatsAppIcon key="w" className="h-6 w-6" />, "WhatsApp", "Fastest for quick questions", contact.whatsapp, "Chat now", "#16A34A"],
          [<Phone key="p" className="h-6 w-6" />, contact.phoneDisplay, "Mon to Fri 08:30 to 17:00, Sat 09:00 to 12:00", tel, "Call us", "#1D6FD8"],
          [<Mail key="e" className="h-6 w-6" />, contact.email, "For documents and longer briefs", mailto, "Email us", "#6A52E8"],
        ].map(([icon, title, line, href, cta, colour]) => (
          <a key={String(cta)} href={String(href)} target={String(href).startsWith("http") ? "_blank" : undefined} rel="noreferrer"
            className={`flex flex-col gap-3 p-6 transition hover:-translate-y-0.5 ${card}`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: String(colour) }}>{icon}</span>
            <b className="text-lg break-all">{title}</b>
            <span className={muted}>{line}</span>
            <span className="mt-auto text-sm font-bold text-[#1D6FD8]">{cta} →</span>
          </a>
        ))}
        <button type="button" onClick={openChat} className={`flex flex-col gap-3 p-6 text-left transition hover:-translate-y-0.5 ${card}`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1D6FD8,#FFB547)] text-white"><Sparkles className="h-6 w-6" /></span>
          <b className="text-lg">AI assistant</b>
          <span className={muted}>Day or night. It builds your brief for a consultant.</span>
          <span className="mt-auto text-sm font-bold text-[#1D6FD8]">Ask now →</span>
        </button>
      </section>
      <section className={`relative grid items-start gap-10 ${gutter} pb-20 lg:grid-cols-[.7fr_1.3fr]`}>
        <div className="flex flex-col gap-4">
          <Eyebrow>Get a quote</Eyebrow>
          <h2 className={h2}>Tell us <span className={glow}>where.</span></h2>
          <p className={`text-lg leading-relaxed ${muted}`}>Your request goes straight to our consultants. Prefer to talk? <a href={`${BASE}/book`} className="font-bold text-[#1D6FD8] underline underline-offset-4">Book a call</a>.</p>
        </div>
        <QuoteForm />
      </section>
    </AtlasLayout>
  );
}

// ------------------------------------------------------------------ privacy
export function PrivacyPage() {
  const sections: [string, string][] = [
    ["Who we are", `${BRAND.name} is the responsible party for personal information collected on this website. Contact our information officer at ${contact.email}.`],
    ["What we collect", "Your name, email address, phone number and trip details when you ask for a quote, request seats on a departure, book a call, chat with our assistant or sign up for our newsletter. We also collect anonymous visit statistics."],
    ["Why we collect it", "To plan, quote and book your trip, to send the WhatsApp and email updates you asked for, and, if you signed up, our newsletter. We only use your details with your consent, which you give with the tick box on each form."],
    ["Our AI assistant", "The chat on this site is an AI assistant. It says so, it never confirms a price, and it asks before saving your details. A consultant reads every request it passes on."],
    ["Who we share it with", "Only the suppliers needed for your booking (airlines, hotels, cruise lines and tour operators), and our systems provider (TribeTravel). We never sell your details."],
    ["Your rights", "You can ask to see, correct or delete your information, or unsubscribe from the newsletter at any time. You can also complain to the Information Regulator."],
  ];
  return (
    <AtlasLayout current={`${BASE}/privacy`}>
      <PageTitle crumb="Privacy" title={<>Your privacy <span className={glow}>(POPIA).</span></>}
        intro="How we collect, use and protect your personal information under the Protection of Personal Information Act." />
      <section className={`relative flex max-w-[860px] flex-col gap-8 ${gutter} pb-24`}>
        <p className={`rounded-[20px] border border-dashed border-[#F08C2E]/50 bg-[#FFF3E0] p-4 text-sm text-[#5C2B00]`}>Template wording for this sample site. Each agency's privacy page is checked against its own processes before going live.</p>
        {sections.map(([t, x]) => (
          <div key={t} className="flex flex-col gap-2"><h2 className={`${display} text-2xl`}>{t}</h2><p className={`text-lg leading-relaxed ${muted}`}>{x}</p></div>
        ))}
        <a href={`${BASE}/contact`} className={`${ghost} self-start`}>Ask us about your information</a>
      </section>
    </AtlasLayout>
  );
}
