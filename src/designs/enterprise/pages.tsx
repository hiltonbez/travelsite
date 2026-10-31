// The Enterprise site's pages. Home is the route page with every stop; the rest are the pages a full agency site
// has: destinations (and one page per destination), gallery, about, travel news (and one page per post), contact
// and privacy. Each is prerendered on its own (scripts/snapshot.mjs PAGES).
import { useState } from "react";
import { ArrowRight, Clock, Mail, MapPin, Phone, Plane, Sun } from "lucide-react";
import { FlightPath } from "@/designs/flight-path";
import { BRAND, WhatsAppIcon, contact, mailto, tel } from "@/designs/shared";
import { BehindTheScenes } from "@/designs/enterprise/agency";
import { InstallApp } from "@/designs/enterprise/app";
import { Automation } from "@/designs/enterprise/automation";
import { BookCall } from "@/designs/enterprise/call";
import { Concierge } from "@/designs/enterprise/concierge";
import { ARTICLES, DESTINATIONS, GALLERY, article, destination, type Article, type Destination } from "@/designs/enterprise/content";
import { Contact, Departure } from "@/designs/enterprise/home-parts";
import { EnterpriseLayout, PageTitle } from "@/designs/enterprise/layout";
import { LiveSuppliers } from "@/designs/enterprise/live";
import { StopLabel } from "@/designs/enterprise/parts";
import { AcceptAndPay } from "@/designs/enterprise/pay";
import { BASE, btn, display, ghost, gutter, h2, label, mono, orange, panel, soft } from "@/designs/enterprise/theme";

const date = (iso: string) => new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

// ------------------------------------------------------------------ home
export function EnterpriseHome() {
  return (
    <EnterpriseLayout current={BASE}>
      <FlightPath />
      <Departure />
      <WhereWeFly />
      <LiveSuppliers />
      <Concierge />
      <BookCall />
      <Automation />
      <AcceptAndPay />
      <BehindTheScenes />
      <InstallApp />
      <LatestNews />
      <Contact />
    </EnterpriseLayout>
  );
}

/** A destination as a departure-board card: airport code, flight time, photo. */
function DestinationCard({ d, big = false }: { d: Destination; big?: boolean }) {
  return (
    <a href={`${BASE}/destinations/${d.slug}`} className={`d-zoom group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:border-[#FF6A2E]/60 ${panel}`}>
      <span className={`relative block overflow-hidden ${big ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <img src={d.photos[0]} alt={d.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <span className={`absolute top-3 left-3 rounded-full bg-[#0B1424]/75 px-3 py-1.5 ${label} backdrop-blur`}>JNB → {d.code}</span>
      </span>
      <span className="flex flex-1 flex-col gap-1.5 border-t-2 border-dashed border-[#EDE6D8]/15 p-5">
        <span className={`${label} ${orange}`}>{d.region} · {d.flight}</span>
        <span className="text-xl leading-tight font-semibold">{d.name}</span>
        <span className={`text-sm ${soft}`}>{d.tagline}</span>
        <span className={`mt-auto flex items-center gap-1 pt-3 text-sm font-semibold ${orange}`}>Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
      </span>
    </a>
  );
}

function WhereWeFly() {
  return (
    <section className={`relative z-10 flex flex-col gap-10 ${gutter} pb-8`}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[640px] flex-col gap-4">
          <StopLabel><Plane className="h-4 w-4" /> Departures</StopLabel>
          <h2 className={h2}>Where we fly <span className={orange}>most often.</span></h2>
        </div>
        <a href={`${BASE}/destinations`} className={ghost}>All destinations <ArrowRight className="h-4 w-4" /></a>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DESTINATIONS.slice(0, 3).map((d) => <DestinationCard key={d.slug} d={d} />)}
      </div>
    </section>
  );
}

function ArticleCard({ a }: { a: Article }) {
  return (
    <a href={`${BASE}/news/${a.slug}`} className={`d-zoom group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:border-[#FF6A2E]/60 ${panel}`}>
      <span className="relative block aspect-[16/10] overflow-hidden"><img src={a.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /></span>
      <span className="flex flex-1 flex-col gap-2 p-5">
        <span className={`${label} ${orange}`}>{a.tag} · {a.minutes} min read</span>
        <span className="text-xl leading-snug font-semibold">{a.title}</span>
        <span className={`text-sm leading-relaxed ${soft}`}>{a.summary}</span>
        <span className={`mt-auto pt-2 ${mono} text-xs ${soft}`}>{date(a.date)}</span>
      </span>
    </a>
  );
}

function LatestNews() {
  return (
    <section className={`relative z-10 flex flex-col gap-10 ${gutter} py-24`}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[640px] flex-col gap-4">
          <StopLabel>In-flight reading · Travel news</StopLabel>
          <h2 className={h2}>Ideas for <span className={orange}>your next trip.</span></h2>
        </div>
        <a href={`${BASE}/news`} className={ghost}>All travel news <ArrowRight className="h-4 w-4" /></a>
      </div>
      <div className="grid gap-5 md:grid-cols-3">{ARTICLES.map((a) => <ArticleCard key={a.slug} a={a} />)}</div>
    </section>
  );
}

// ------------------------------------------------------------------ destinations
export function DestinationsPage() {
  return (
    <EnterpriseLayout current={`${BASE}/destinations`}>
      <PageTitle crumb="Destinations" title={<>Where would you <span className={orange}>like to land?</span></>}
        intro="Six places our clients love, from a long weekend in the bush to the Greek islands. Every trip is tailor-made: tell us what you like and we'll build it around you." />
      <section className={`relative z-10 grid gap-5 ${gutter} pb-16 sm:grid-cols-2 lg:grid-cols-3`}>
        {DESTINATIONS.map((d) => <DestinationCard key={d.slug} d={d} big />)}
      </section>
      <section className={`relative z-10 flex flex-col gap-4 ${gutter} pb-24`}>
        <StopLabel>Specials · Live from our suppliers</StopLabel>
        <p className={`max-w-[60ch] ${soft}`}>Today's deals come straight from Beachcomber and Thompsons through TribeTravel, so prices are always current.</p>
      </section>
      <LiveSuppliers />
    </EnterpriseLayout>
  );
}

export function DestinationPage({ slug }: { slug: string }) {
  const d = destination(slug);
  if (!d) return null;
  const others = DESTINATIONS.filter((x) => x.slug !== d.slug).slice(0, 3);
  return (
    <EnterpriseLayout current={`${BASE}/destinations`}>
      <PageTitle crumb={<><a href={`${BASE}/destinations`} className="hover:text-[#FF6A2E]">Destinations</a> <span className={orange}>→</span> {d.name}</>}
        title={<>{d.name}<span className={orange}>.</span></>} intro={d.intro}>
        <div className={`flex flex-wrap gap-x-8 gap-y-3 ${label} ${soft}`}>
          <span className="flex items-center gap-2"><Plane className={`h-4 w-4 ${orange}`} /> JNB → {d.code} · {d.flight}</span>
          <span className="flex items-center gap-2"><MapPin className={`h-4 w-4 ${orange}`} /> {d.region}</span>
        </div>
      </PageTitle>

      <section className={`relative z-10 grid gap-4 ${gutter} pb-16 md:grid-cols-[1.4fr_1fr]`}>
        <img src={d.photos[0]} alt={d.name} className="h-full max-h-[560px] w-full rounded-[22px] object-cover" />
        <div className="grid gap-4">
          <img src={d.photos[1]} alt="" loading="lazy" className="h-full max-h-[272px] w-full rounded-[22px] object-cover" />
          <img src={d.photos[2]} alt="" loading="lazy" className="h-full max-h-[272px] w-full rounded-[22px] object-cover" />
        </div>
      </section>

      <section className={`relative z-10 grid gap-12 ${gutter} pb-20 lg:grid-cols-[1fr_1.2fr]`}>
        <div className="flex flex-col gap-6">
          <div className={`flex flex-col gap-3 p-6 ${panel}`}>
            <span className={`flex items-center gap-2 ${label} ${orange}`}><Sun className="h-4 w-4" /> Best time to go</span>
            <p className="text-lg">{d.bestTime}</p>
          </div>
          <div className={`flex flex-col gap-3 p-6 ${panel}`}>
            <span className={`${label} ${orange}`}>Good for</span>
            <div className="flex flex-wrap gap-2">{d.goodFor.map((g) => <span key={g} className="rounded-full border border-[#EDE6D8]/20 px-3 py-1.5 text-sm">{g}</span>)}</div>
          </div>
          <a href={`${BASE}#quote`} className={`${btn} min-h-14 self-start px-8`}>Plan my {d.name} trip <ArrowRight className="h-4 w-4" /></a>
        </div>
        <div className="flex flex-col gap-5">
          <StopLabel>A sample itinerary</StopLabel>
          <ol className="flex flex-col gap-4 border-l-2 border-dashed border-[#EDE6D8]/15 pl-6">
            {d.days.map(([title, text], i) => (
              <li key={title} className="relative">
                <span className="absolute top-0.5 -left-[35px] flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6A2E] text-[10px] font-bold text-[#0B1424]">{i + 1}</span>
                <b className="text-lg">{title}</b>
                <p className={`${soft}`}>{text}</p>
              </li>
            ))}
          </ol>
          <p className={`text-sm ${soft}`}>Every trip is tailor-made: we change the days, the hotels and the pace to suit you.</p>
        </div>
      </section>

      {d.supplier === "beachcomber" ? <LiveSuppliers /> : (
        <section className={`relative z-10 ${gutter} pb-20`}>
          <div className={`flex flex-wrap items-center justify-between gap-6 p-8 ${panel}`}>
            <div className="flex max-w-[56ch] flex-col gap-2">
              <span className={`${label} ${orange}`}>Live packages</span>
              <p className="text-lg">Our {d.name} packages come live from Thompsons Holidays. See today's deals, or ask our concierge to build one for you.</p>
            </div>
            <a href={`${BASE}/destinations#live`} className={btn}>See live deals <ArrowRight className="h-4 w-4" /></a>
          </div>
        </section>
      )}

      <section className={`relative z-10 flex flex-col gap-8 ${gutter} pb-24`}>
        <StopLabel>Connecting flights · More destinations</StopLabel>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{others.map((x) => <DestinationCard key={x.slug} d={x} />)}</div>
      </section>
    </EnterpriseLayout>
  );
}

// ------------------------------------------------------------------ gallery
export function GalleryPage() {
  const [place, setPlace] = useState("All");
  const shown = GALLERY.filter((g) => place === "All" || g.place === place);
  return (
    <EnterpriseLayout current={`${BASE}/gallery`}>
      <PageTitle crumb="Gallery" title={<>Postcards <span className={orange}>from the road.</span></>}
        intro="Places our clients have been this year. Tap a place to see it, then ask us to take you there." />
      <section className={`relative z-10 flex flex-col gap-8 ${gutter} pb-24`}>
        <div role="group" aria-label="Filter by place" className="flex flex-wrap gap-2">
          {["All", ...DESTINATIONS.map((d) => d.name)].map((p) => (
            <button key={p} type="button" aria-pressed={place === p} onClick={() => setPlace(p)}
              className={`min-h-10 rounded-full border px-4 text-sm transition ${place === p ? "border-[#FF6A2E] bg-[#FF6A2E] text-[#0B1424]" : "border-[#EDE6D8]/25 hover:border-[#FF6A2E]"}`}>
              {p}
            </button>
          ))}
        </div>
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {shown.map((g) => (
            <a key={g.src} href={`${BASE}/destinations/${g.slug}`} className="d-zoom group relative mb-4 block break-inside-avoid overflow-hidden rounded-[18px]">
              <img src={g.src} alt={g.place} loading="lazy" className="w-full" />
              <span className={`absolute bottom-3 left-3 rounded-full bg-[#0B1424]/75 px-3 py-1.5 ${label} backdrop-blur`}>{g.place}</span>
            </a>
          ))}
        </div>
        <p className={`text-xs ${soft}`}>Photos: Unsplash.</p>
      </section>
    </EnterpriseLayout>
  );
}

// ------------------------------------------------------------------ about
const TEAM: [string, string, string][] = [
  ["Thandi Mokoena", "Islands & honeymoons", "Has stayed at nine of Mauritius's resorts, so you don't have to guess."],
  ["Pieter van der Berg", "Safari & self-drive", "Fifteen years planning trips into the Kruger and Botswana."],
  ["Aisha Khan", "Europe & cruises", "Knows the Schengen visa process inside out."],
];

export function AboutPage() {
  return (
    <EnterpriseLayout current={`${BASE}/about`}>
      <PageTitle crumb="About" title={<>Real people, <span className={orange}>flying with you.</span></>}
        intro={`${BRAND.name} plans tailor-made holidays from South Africa. Every quote is priced by a person who has been there, and we stay with you until you're home.`} />
      <section className={`relative z-10 grid gap-5 ${gutter} pb-16 md:grid-cols-3`}>
        {[["1,200+", "trips planned"], ["24h", "to your quote"], ["4.9 / 5", "from our clients"]].map(([n, t]) => (
          <div key={t} className={`flex flex-col gap-1 p-6 ${panel}`}>
            <b className={`${display} text-5xl ${orange}`}>{n}</b>
            <span className={soft}>{t}</span>
          </div>
        ))}
        <p className={`text-xs ${soft} md:col-span-3`}>Example figures for this sample site.</p>
      </section>
      <section className={`relative z-10 flex flex-col gap-8 ${gutter} pb-16`}>
        <StopLabel>Your crew</StopLabel>
        <div className="grid gap-5 md:grid-cols-3">
          {TEAM.map(([name, role, line]) => (
            <div key={name} className={`flex flex-col gap-3 p-6 ${panel}`}>
              <span aria-hidden="true" className={`flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6A2E] ${display} text-xl text-[#0B1424]`}>
                {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <b className="text-xl">{name}</b>
              <span className={`${label} ${orange}`}>{role}</span>
              <p className={soft}>{line}</p>
            </div>
          ))}
        </div>
      </section>
      <section className={`relative z-10 ${gutter} pb-24`}>
        <div className={`grid gap-6 p-8 md:grid-cols-3 ${panel}`}>
          {[["Accredited", "Your agency's ASATA and IATA numbers go here."], ["Protected", "Payments go through a registered trust account."], ["Always on", "A real person on WhatsApp while you travel."]].map(([t, x]) => (
            <div key={t} className="flex flex-col gap-2"><b className={`${display} text-lg`}>{t}</b><span className={soft}>{x}</span></div>
          ))}
        </div>
      </section>
    </EnterpriseLayout>
  );
}

// ------------------------------------------------------------------ travel news
export function NewsPage() {
  return (
    <EnterpriseLayout current={`${BASE}/news`}>
      <PageTitle crumb="Travel news" title={<>Travel news <span className={orange}>&amp; ideas.</span></>}
        intro="Where to go, when to go and what to pack, from the people who plan it every day. New posts go out in our monthly trip letter too." />
      <section className={`relative z-10 grid gap-5 ${gutter} pb-24 md:grid-cols-3`}>
        {ARTICLES.map((a) => <ArticleCard key={a.slug} a={a} />)}
      </section>
    </EnterpriseLayout>
  );
}

export function ArticlePage({ slug }: { slug: string }) {
  const a = article(slug);
  if (!a) return null;
  return (
    <EnterpriseLayout current={`${BASE}/news`}>
      <article className={`relative z-10 mx-auto flex max-w-[760px] flex-col gap-6 ${gutter} pt-14 pb-16 md:pt-20`}>
        <p className={`${label} ${soft}`}><a href={`${BASE}/news`} className="hover:text-[#FF6A2E]">Travel news</a> <span className={orange}>→</span> {a.tag}</p>
        <h1 className={`d-rise ${display} text-[clamp(32px,5vw,60px)] leading-[0.95]`}>{a.title}</h1>
        <p className={`flex flex-wrap items-center gap-4 ${mono} text-xs ${soft}`}>
          <span>{date(a.date)}</span><span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {a.minutes} min read</span><span>By the {BRAND.name} team</span>
        </p>
        <img src={a.image} alt="" className="aspect-[16/9] w-full rounded-[22px] object-cover" />
        <p className="text-xl leading-relaxed">{a.summary}</p>
        {a.body.map((p, i) => <p key={i} className={`text-lg leading-relaxed ${soft}`}>{p}</p>)}
        <div className={`mt-6 flex flex-wrap items-center justify-between gap-4 p-6 ${panel}`}>
          <span className="text-lg">Want to go? We'll plan it for you.</span>
          <a href={`${BASE}#quote`} className={btn}>Get my quote <ArrowRight className="h-4 w-4" /></a>
        </div>
      </article>
      <section className={`relative z-10 flex flex-col gap-8 ${gutter} pb-24`}>
        <StopLabel>Keep reading</StopLabel>
        <div className="grid gap-5 md:grid-cols-2">{ARTICLES.filter((x) => x.slug !== a.slug).map((x) => <ArticleCard key={x.slug} a={x} />)}</div>
      </section>
    </EnterpriseLayout>
  );
}

// ------------------------------------------------------------------ contact
export function ContactPage() {
  return (
    <EnterpriseLayout current={`${BASE}/contact`}>
      <PageTitle crumb="Contact" title={<>Talk to <span className={orange}>a real person.</span></>}
        intro="Ask for a quote, book a call at a time that suits you, or send us a WhatsApp. We reply the same day." />
      <section className={`relative z-10 grid gap-5 ${gutter} md:grid-cols-3`}>
        {[
          [<WhatsAppIcon key="w" className="h-6 w-6" />, "WhatsApp", "Fastest for quick questions", contact.whatsapp, "Chat now"],
          [<Phone key="p" className="h-6 w-6" />, contact.phoneDisplay, "Mon to Fri 08:30 to 17:00, Sat 09:00 to 12:00", tel, "Call us"],
          [<Mail key="e" className="h-6 w-6" />, contact.email, "For documents and longer briefs", mailto, "Email us"],
        ].map(([icon, title, line, href, cta]) => (
          <a key={String(cta)} href={String(href)} target={String(href).startsWith("http") ? "_blank" : undefined} rel="noreferrer"
            className={`flex flex-col gap-3 p-6 transition hover:border-[#FF6A2E]/60 ${panel}`}>
            <span className={`flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6A2E] text-[#0B1424]`}>{icon}</span>
            <b className="text-lg break-all">{title}</b>
            <span className={soft}>{line}</span>
            <span className={`mt-auto text-sm font-semibold ${orange}`}>{cta} →</span>
          </a>
        ))}
      </section>
      <BookCall />
    </EnterpriseLayout>
  );
}

// ------------------------------------------------------------------ privacy
export function PrivacyPage() {
  const sections: [string, string][] = [
    ["Who we are", `${BRAND.name} is the responsible party for personal information collected on this website. Contact our information officer at ${contact.email}.`],
    ["What we collect", "Your name, email address, phone number and trip details when you ask for a quote, book a call, chat with our concierge or sign up for our newsletter. We also collect anonymous visit statistics (Google Analytics and the Meta Pixel)."],
    ["Why we collect it", "To plan, quote and book your trip, to send the updates you asked for, and, if you signed up, our newsletter. We only use your details with your consent, which you give with the tick box on each form."],
    ["Our AI concierge", "The chat on this site is an AI assistant. It says so, it never quotes a price, and it asks before saving your details. A consultant reads every request it passes on."],
    ["Who we share it with", "Only the suppliers needed for your booking (airlines, hotels and tour operators), and our systems providers (TribeTravel). We never sell your details."],
    ["Your rights", "You can ask to see, correct or delete your information, or unsubscribe from the newsletter at any time. You can also complain to the Information Regulator."],
  ];
  return (
    <EnterpriseLayout current={`${BASE}/privacy`}>
      <PageTitle crumb="Privacy" title={<>Your privacy <span className={orange}>(POPIA).</span></>}
        intro="How we collect, use and protect your personal information under the Protection of Personal Information Act." />
      <section className={`relative z-10 flex max-w-[820px] flex-col gap-8 ${gutter} pb-24`}>
        <p className={`rounded-2xl border border-dashed border-[#FF6A2E]/50 p-4 text-sm ${soft}`}>Template wording for this sample site. Each agency's privacy page is checked against its own processes before going live.</p>
        {sections.map(([t, x]) => (
          <div key={t} className="flex flex-col gap-2"><h2 className={`${display} text-xl`}>{t}</h2><p className={`text-lg leading-relaxed ${soft}`}>{x}</p></div>
        ))}
      </section>
    </EnterpriseLayout>
  );
}
