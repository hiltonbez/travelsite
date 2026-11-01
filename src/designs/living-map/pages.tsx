// The Living Map site's other nine pages, each a different region of the map: destinations (and one page per
// destination), group departures, booking a seat, specials (the live supplier feed), about, reviews, contact and the
// POPIA privacy notice. Each is prerendered on its own (scripts/snapshot.mjs PAGES).
import { useState } from "react";
import { ArrowRight, Mail, MapPin, Phone, Plane, Star, Sun } from "lucide-react";
import { BRAND, WhatsAppIcon, contact, mailto, tel } from "@/designs/shared";
import { BookCall } from "@/designs/living-map/call";
import { DEPARTURES, DESTINATIONS, REVIEWS, TEAM, destination } from "@/designs/living-map/content";
import { DepartureCard, SeatBooking } from "@/designs/living-map/departures";
import { PLACES, viewAround } from "@/designs/living-map/geo";
import { LivingMapLayout, NextStop, PageTitle } from "@/designs/living-map/layout";
import { LivingMap } from "@/designs/living-map/map";
import { Notifications } from "@/designs/living-map/phone";
import { Example, SectionHead, Tape, WaxSeal } from "@/designs/living-map/parts";
import { PlaceCard } from "@/designs/living-map/places";
import { PlanForm } from "@/designs/living-map/plan";
import { RateTags } from "@/designs/living-map/rates";
import { BASE, accent, btn, caps, card, display, gutter, hand, soft } from "@/designs/living-map/theme";

const crumbLink = "hover:text-(--lm-accent)";

// ------------------------------------------------------------------ destinations
export function DestinationsPage() {
  return (
    <LivingMapLayout current={`${BASE}/destinations`}>
      <PageTitle crumb="Destinations" title={<>Where would you <em className={accent}>like to land?</em></>}
        intro="Six places our clients love, from a long weekend in the bush to the Greek islands. Every trip is tailor-made: tell us what you like and we'll build it around you."
        mapLabel="Map with routes from Johannesburg to all six destinations" />
      <section data-pin className={`relative z-10 grid gap-x-8 gap-y-14 ${gutter} pb-20 sm:grid-cols-2 lg:grid-cols-3`}>
        {DESTINATIONS.map((d, i) => <PlaceCard key={d.slug} d={d} i={i} />)}
      </section>
      <section data-pin className={`relative z-10 ${gutter} pb-24`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] border border-(--lm-line) md:aspect-[16/9]">
          <LivingMap draw="scroll" view="east" label="Map of East and Southern Africa: the routes ink themselves in as you scroll" />
          <p className={`absolute bottom-3 left-3 rounded-sm bg-(--lm-card) px-3 py-1.5 ${hand} text-xl shadow`}>Scroll, and watch the routes draw themselves</p>
        </div>
      </section>
      <NextStop title={<>Not sure where? <em className={accent}>Ask us.</em></>} line="Tell us what you like, and we'll suggest three places that fit." href={`${BASE}#plan`} cta="Plan my trip" />
    </LivingMapLayout>
  );
}

export function DestinationPage({ slug }: { slug: string }) {
  const d = destination(slug);
  if (!d) return null;
  const place = PLACES[d.slug];
  const trips = DEPARTURES.filter((x) => x.place === d.slug);
  const others = DESTINATIONS.filter((x) => x.slug !== d.slug).slice(0, 3);
  return (
    <LivingMapLayout current={`${BASE}/destinations`}>
      <PageTitle crumb={<><a href={`${BASE}/destinations`} className={crumbLink}>Destinations</a> <span className={accent}>›</span> {d.name}</>}
        title={<>{d.name}<span className={accent}>.</span></>} intro={d.intro}
        {...(place ? { viewBox: viewAround(place.at, d.slug === "santorini" ? 520 : 440, d.slug === "santorini" ? 380 : 330) } : {})}
        focus={d.slug} routes={[d.slug]} mapLabel={`Map of the route from Johannesburg to ${d.name}`}>
        <div className={`flex flex-wrap gap-x-6 gap-y-2 text-sm ${soft}`}>
          <span className="flex items-center gap-2"><Plane className={`h-4 w-4 ${accent}`} /> {d.flight}</span>
          <span className="flex items-center gap-2"><MapPin className={`h-4 w-4 ${accent}`} /> {d.region}</span>
        </div>
      </PageTitle>

      <section className={`relative z-10 grid gap-8 ${gutter} pb-16 md:grid-cols-3`}>
        {d.photos.map((src, i) => (
          <figure key={src} className="relative bg-[#FFFDF8] p-3 pb-10 shadow-[0_24px_40px_-24px_var(--lm-shadow)]" style={{ rotate: `${[-1.5, 1.2, -0.6][i]}deg` }}>
            <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
            <img src={src} alt={i === 0 ? d.name : ""} loading={i ? "lazy" : undefined} className="aspect-[4/3] w-full object-cover" />
            <figcaption className={`absolute bottom-2 left-4 ${hand} text-xl text-[#2A1C10]`}>{d.goodFor[i] ?? d.name}</figcaption>
          </figure>
        ))}
      </section>

      <section data-pin className={`relative z-10 grid gap-12 ${gutter} pb-20 lg:grid-cols-[1fr_1.2fr]`}>
        <div className="flex flex-col gap-5">
          <div className={`flex flex-col gap-2 p-6 ${card}`}>
            <span className={`flex items-center gap-2 ${caps} ${accent}`}><Sun className="h-4 w-4" /> Best time to go</span>
            <p className="text-lg">{d.bestTime}</p>
          </div>
          <div className={`flex flex-col gap-3 p-6 ${card}`}>
            <span className={`${caps} ${accent}`}>Good for</span>
            <div className="flex flex-wrap gap-2">{d.goodFor.map((g) => <span key={g} className="rounded-full border border-(--lm-line) px-3 py-1.5 text-sm">{g}</span>)}</div>
          </div>
          <a href="#plan-form" className={`${btn} min-h-14 self-start px-8`}>Plan my {d.name.split(" ")[0]} trip <ArrowRight className="h-4 w-4" /></a>
        </div>
        <div className="flex flex-col gap-5">
          <span className={`${caps} ${accent}`}>A sample itinerary</span>
          <ol className="flex flex-col gap-5 border-l-2 border-dashed border-(--lm-accent)/50 pl-7">
            {d.days.map(([title, text], i) => (
              <li key={title} className="relative">
                <span className={`absolute top-0 -left-[43px] flex h-7 w-7 items-center justify-center rounded-full bg-(--lm-accent) ${hand} text-lg font-bold text-(--lm-on-accent)`}>{i + 1}</span>
                <b className={`${display} text-2xl`}>{title}</b>
                <p className={soft}>{text}</p>
              </li>
            ))}
          </ol>
          <p className={`${hand} text-2xl ${accent}`}>Every trip is tailor-made: we change the days, the hotels and the pace to suit you.</p>
        </div>
      </section>

      {trips.length > 0 && (
        <section data-pin className={`relative z-10 flex flex-col gap-8 ${gutter} pb-20`}>
          <SectionHead kicker="Group departures" title={<>Go with <em>a small group.</em></>} />
          {trips.map((t, i) => <DepartureCard key={t.slug} d={t} i={i} />)}
        </section>
      )}

      {d.supplier === "beachcomber" && (
        <section data-pin className={`relative z-10 flex flex-col gap-6 ${gutter} pb-20`}>
          <SectionHead kicker="Live from Beachcomber" title={<>Today's rates <em>in {d.name}.</em></>} />
          <RateTags limit={4} />
        </section>
      )}

      <section data-pin className={`relative z-10 flex flex-col gap-8 ${gutter} pb-20`}>
        <SectionHead kicker={`Plan my ${d.name} trip`} title={<>Write to us <em>about {d.name.split(" ")[0]}.</em></>} />
        <PlanForm place={d.name} />
      </section>

      <section data-pin className={`relative z-10 flex flex-col gap-10 ${gutter} pb-24`}>
        <span className={`${caps} ${accent}`}>Further along the map</span>
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{others.map((x, i) => <PlaceCard key={x.slug} d={x} i={i + 2} />)}</div>
      </section>
    </LivingMapLayout>
  );
}

// ------------------------------------------------------------------ group departures
export function DeparturesPage() {
  return (
    <LivingMapLayout current={`${BASE}/departures`}>
      <PageTitle crumb="Group departures" title={<>Small groups, <em className={accent}>saved seats.</em></>}
        intro="Set dates, a set number of seats and one of our consultants along for the ride. Watch the seat maps: when a trip is full, it's full."
        view="east" routes={["zanzibar", "victoria-falls", "kruger", "mauritius"]} mapLabel="Map of East Africa and the Indian Ocean with this year's group departures">
        <p className={`flex flex-wrap items-center gap-2 text-sm ${soft}`}><Example>Example departures</Example> Seat requests from this page are real.</p>
      </PageTitle>
      <section className={`relative z-10 flex flex-col gap-10 ${gutter} pb-20`}>
        {DEPARTURES.map((d, i) => <div key={d.slug} data-pin><DepartureCard d={d} i={i} /></div>)}
      </section>
      <NextStop title={<>Got a group of your own? <em className={accent}>We'll charter it.</em></>}
        line="Weddings, birthdays, school tours and company trips: tell us the numbers and we'll plan the route." href={`${BASE}/contact`} cta="Talk to us" />
    </LivingMapLayout>
  );
}

export function BookPage() {
  return (
    <LivingMapLayout current={`${BASE}/book`}>
      <PageTitle crumb="Book a seat" title={<>Pick your <em className={accent}>seat.</em></>}
        intro="Choose a departure, tap the free seats you'd like, and send your request. We hold your seats while your consultant confirms and sends your quote."
        view="south" routes={["victoria-falls", "kruger", "cape-town"]} mapLabel="Map of Southern Africa with routes from Johannesburg" />
      <SeatBooking />
      <Notifications />
    </LivingMapLayout>
  );
}

// ------------------------------------------------------------------ specials
export function SpecialsPage() {
  return (
    <LivingMapLayout current={`${BASE}/specials`}>
      <PageTitle crumb="Specials" title={<>Today's rates, <em className={accent}>sealed in wax.</em></>}
        intro="Live prices from Beachcomber's resorts in Mauritius, straight from their system through TribeTravel. Tap a tag to check your dates and book."
        view="ocean" routes={["mauritius"]} focus="mauritius" mapLabel="Map of the Indian Ocean with the route to Mauritius" />
      <section data-pin className={`relative z-10 flex flex-col gap-6 ${gutter} pb-20`}>
        <RateTags />
        <p className={`text-sm ${soft}`}>Prices are per person sharing, from today's rate. Your consultant confirms flights, transfers and availability before you pay anything.</p>
      </section>
      <section data-pin className={`relative z-10 ${gutter} pb-24`}>
        <div className={`grid items-center gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:p-8 ${card}`}>
          <WaxSeal word="Pro" rim="ONE SUPPLIER · LIVE FEED ·" className="h-24 w-24" />
          <p className="text-lg">Want something that isn't on the tags? We quote every supplier we work with, not just the live ones.</p>
          <a href={`${BASE}#plan`} className={btn}>Ask for a quote</a>
        </div>
      </section>
    </LivingMapLayout>
  );
}

// ------------------------------------------------------------------ about
export function AboutPage() {
  return (
    <LivingMapLayout current={`${BASE}/about`}>
      <PageTitle crumb="About" title={<>Real people <em className={accent}>who've been there.</em></>}
        intro={`${BRAND.name} plans tailor-made holidays and small group trips from Johannesburg. Every quote is priced by a person who has walked the route, and we stay with you until you're home.`}
        view="south" routes={["kruger", "cape-town", "victoria-falls"]} mapLabel="Map of Southern Africa, home of the agency" />
      <section data-pin className={`relative z-10 grid gap-5 ${gutter} pb-16 md:grid-cols-3`}>
        {[["1 200+", "trips planned"], ["24h", "to your quote"], ["4.9 / 5", "from our clients"]].map(([n, t], i) => (
          <div key={t} className={`flex flex-col gap-1 p-6 ${card}`} style={{ rotate: `${(i - 1) * 0.8}deg` }}>
            <b className={`${display} text-6xl ${accent}`}>{n}</b>
            <span className={soft}>{t}</span>
          </div>
        ))}
        <p className={`text-xs ${soft} md:col-span-3`}>Example figures for this sample site.</p>
      </section>
      <section data-pin className={`relative z-10 flex flex-col gap-10 ${gutter} pb-16`}>
        <SectionHead kicker="The crew" title={<>Your guides <em>on paper and in person.</em></>} />
        <div className="grid gap-8 md:grid-cols-3">
          {TEAM.map(([name, role, line], i) => (
            <div key={name} className={`relative flex flex-col gap-3 p-6 pt-8 ${card}`} style={{ rotate: `${[-1, 0.6, -0.4][i]}deg` }}>
              <Tape className="-top-3 left-6 -rotate-6" />
              <span aria-hidden="true" className={`flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-(--lm-accent) ${hand} text-4xl font-bold ${accent}`}>
                {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <b className={`${display} text-2xl`}>{name}</b>
              <span className={`${caps} ${accent}`}>{role}</span>
              <p className={soft}>{line}</p>
            </div>
          ))}
        </div>
      </section>
      <section data-pin className={`relative z-10 ${gutter} pb-8`}>
        <div className={`grid gap-6 p-8 md:grid-cols-3 ${card}`}>
          {[["Accredited", "Your agency's ASATA and IATA numbers go here."], ["Protected", "Payments go through a registered trust account."], ["Always on", "A real person on WhatsApp while you travel."]].map(([t, x]) => (
            <div key={t} className="flex flex-col gap-2"><b className={`${display} text-2xl`}>{t}</b><span className={soft}>{x}</span></div>
          ))}
        </div>
      </section>
      <NextStop title={<>Come and <em className={accent}>say hello.</em></>} line="Pop in, phone, or send a WhatsApp. The kettle's always on." href={`${BASE}/contact`} cta="Contact us" />
    </LivingMapLayout>
  );
}

// ------------------------------------------------------------------ reviews
export function ReviewsPage() {
  const [on, setOn] = useState(REVIEWS[0]!.place);
  return (
    <LivingMapLayout current={`${BASE}/reviews`}>
      <PageTitle crumb="Reviews" title={<>Notes from <em className={accent}>the road.</em></>}
        intro="What our travellers said when they got home, pinned to the map where each trip went."
        mapLabel="Map with a route to every place our reviewers travelled">
        <p className={`flex flex-wrap items-center gap-2 text-sm ${soft}`}><Example>Example reviews</Example> A real agency's come from its own clients.</p>
      </PageTitle>
      <section data-pin className={`relative z-10 grid items-start gap-8 ${gutter} pb-24 lg:grid-cols-[1.1fr_.9fr]`}>
        {/* The map, with a pin per review: tap one to read it */}
        <div className="relative aspect-[106/100] overflow-hidden rounded-[6px] border border-(--lm-line) lg:sticky lg:top-24">
          <LivingMap focus={on} label="Map with a pin at each reviewed trip" />
          {REVIEWS.map((r) => {
            const p = PLACES[r.place];
            if (!p) return null;
            return (
              <button key={r.place} type="button" onClick={() => setOn(r.place)} aria-pressed={on === r.place} aria-label={`Read the review from ${p.label}`}
                className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-full items-start justify-center"
                style={{ left: `${(p.at[0] / 1060) * 100}%`, top: `${(p.at[1] / 1000) * 100}%` }}>
                <MapPin className={`h-9 w-9 drop-shadow transition ${on === r.place ? "scale-125 fill-(--lm-accent) text-(--lm-on-accent)" : "fill-(--lm-card) text-(--lm-accent)"}`} />
              </button>
            );
          })}
        </div>
        <ul className="flex flex-col gap-6">
          {REVIEWS.map((r, i) => {
            const place = destination(r.place);
            return (
              <li key={r.place}>
                <button type="button" onClick={() => setOn(r.place)} aria-pressed={on === r.place}
                  className={`relative flex w-full flex-col gap-3 p-6 text-left transition ${card} ${on === r.place ? "ring-2 ring-(--lm-accent)" : ""}`}
                  style={{ rotate: `${(i % 2 ? 0.6 : -0.6)}deg` }}>
                  <span className={`flex items-center justify-between gap-3 ${caps} ${accent}`}>
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {place?.name ?? r.place}</span>
                    <span className="flex" aria-label={`${r.stars} out of 5 stars`}>
                      {Array.from({ length: 5 }, (_, s) => <Star key={s} aria-hidden="true" className={`h-4 w-4 ${s < r.stars ? "fill-(--lm-accent)" : "opacity-30"}`} />)}
                    </span>
                  </span>
                  <span className={`${hand} text-[26px] leading-snug`}>“{r.text}”</span>
                  <span className={`text-sm ${soft}`}><b className="text-(--lm-ink)">{r.name}</b>, {r.from} · {r.trip}, {r.when}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <NextStop title={<>Your turn to <em className={accent}>write one.</em></>} line="Tell us where you'd like to go next." href={`${BASE}#plan`} cta="Plan my trip" />
    </LivingMapLayout>
  );
}

// ------------------------------------------------------------------ contact
export function ContactPage() {
  return (
    <LivingMapLayout current={`${BASE}/contact`}>
      <PageTitle crumb="Contact" title={<>Send word <em className={accent}>by any route.</em></>}
        intro="Write us a letter below, book a call at a time that suits you, or send a WhatsApp. We reply the same day."
        view="cape" routes={["cape-town"]} mapLabel="Map of the southern tip of Africa" />
      <section data-pin className={`relative z-10 grid gap-5 ${gutter} pb-16 md:grid-cols-3`}>
        {[
          [<WhatsAppIcon key="w" className="h-6 w-6" />, "WhatsApp", "Fastest for quick questions", contact.whatsapp, "Chat now"],
          [<Phone key="p" className="h-6 w-6" />, contact.phoneDisplay, "Mon to Fri 08:30 to 17:00, Sat 09:00 to 12:00", tel, "Call us"],
          [<Mail key="e" className="h-6 w-6" />, contact.email, "For documents and longer briefs", mailto, "Email us"],
        ].map(([icon, title, line, href, cta]) => (
          <a key={String(cta)} href={String(href)} target={String(href).startsWith("http") ? "_blank" : undefined} rel="noreferrer"
            className={`flex flex-col gap-3 p-6 transition hover:-translate-y-1 ${card}`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--lm-accent) text-(--lm-on-accent)">{icon}</span>
            <b className="text-lg break-all">{title}</b>
            <span className={soft}>{line}</span>
            <span className={`mt-auto ${hand} text-2xl ${accent}`}>{cta} →</span>
          </a>
        ))}
      </section>
      <section id="plan" data-pin className={`relative z-10 flex scroll-mt-24 flex-col gap-8 ${gutter} pb-8`}>
        <SectionHead kicker="Write to us" title={<>A letter <em>to your consultant.</em></>} />
        <PlanForm readQuery />
      </section>
      <BookCall />
    </LivingMapLayout>
  );
}

// ------------------------------------------------------------------ privacy
export function PrivacyPage() {
  const sections: [string, string][] = [
    ["Who we are", `${BRAND.name} is the responsible party for personal information collected on this website. Contact our information officer at ${contact.email}.`],
    ["What we collect", "Your name, email address, phone number and trip details when you ask for a quote, request seats on a group departure, book a call, chat with us or sign up for our newsletter. We also collect anonymous visit statistics."],
    ["Why we collect it", "To plan, quote and book your trip, to hold the seats you asked for, to send the WhatsApp and email updates about your booking, and, if you signed up, our newsletter. We only use your details with your consent, which you give with the tick box on each form."],
    ["Our AI chat", "The chat on this site is an AI assistant. It says so, it never confirms a price, and it asks before saving your details. A consultant reads every request it passes on."],
    ["Who we share it with", "Only the suppliers needed for your booking (airlines, hotels and tour operators), and our systems provider (TribeTravel). We never sell your details."],
    ["This website", "The look you choose (Parchment, Night Sky or Watercolour) is remembered in your own browser. It isn't sent to us."],
    ["Your rights", "You can ask to see, correct or delete your information, or unsubscribe from the newsletter at any time. You can also complain to the Information Regulator."],
  ];
  return (
    <LivingMapLayout current={`${BASE}/privacy`}>
      <PageTitle crumb="Privacy" title={<>Your privacy <em className={accent}>(POPIA).</em></>}
        intro="How we collect, use and protect your personal information under the Protection of Personal Information Act."
        view="atlantic" routes={[]} mapLabel="A quiet stretch of the Atlantic Ocean" />
      <section data-pin className={`relative z-10 flex max-w-[860px] flex-col gap-8 ${gutter} pb-24`}>
        <p className={`rounded-md border border-dashed border-(--lm-accent) p-4 text-sm ${soft}`}>Template wording for this sample site. Each agency's privacy page is checked against its own processes before going live.</p>
        {sections.map(([t, x], i) => (
          <div key={t} className="flex gap-5">
            <span className={`${hand} w-8 flex-none text-3xl leading-none ${accent}`}>{["i", "ii", "iii", "iv", "v", "vi", "vii"][i]}.</span>
            <div className="flex flex-col gap-2"><h2 className={`${display} text-2xl`}>{t}</h2><p className={`text-lg leading-relaxed ${soft}`}>{x}</p></div>
          </div>
        ))}
      </section>
    </LivingMapLayout>
  );
}
