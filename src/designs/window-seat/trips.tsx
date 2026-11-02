// A page for every special (/trips/<slug>) and every destination of the specials (/destinations/<slug>) on the agency's
// own site (2 Nov 2026, TribeTravel's SEO Agent phase 2): each gives Google one more page to rank. The words and
// pictures are the agency's specials in TribeTravel; scripts/snapshot.mjs prerenders one page for each.
import { ArrowRight, CalendarDays, Check, Moon, X } from "lucide-react";
import type { Destination, SiteContent, Trip } from "@/lib/site-content";
import { PageTitle, WindowSeatLayout } from "@/designs/window-seat/layout";
import { SectionLabel } from "@/designs/window-seat/parts";
import { Porthole, Scene } from "@/designs/window-seat/sky";
import { QUOTE, btn, card, coral, display, ghost, gutter, h2, openChat, quoteTo, soft, sunBtn } from "@/designs/window-seat/theme";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2027-03-12" -> "12 Mar 2027". */
const dayWords = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : "";
};

const paragraphs = (text: string) => text.split(/\n\s*\n|\r?\n/).map((p) => p.trim()).filter(Boolean);

// ------------------------------------------------------------------ a special
export function TripPage({ content, trip }: { content: SiteContent; trip: Trip }) {
  const dest = content.destinations.find((d) => d.slug === trip.destinationSlug);
  const more = dest ? content.trips.filter((t) => dest.trips.includes(t.slug) && t.slug !== trip.slug) : [];
  const when = trip.travelFrom && trip.travelTo ? `${dayWords(trip.travelFrom)} to ${dayWords(trip.travelTo)}`
    : trip.travelFrom ? `From ${dayWords(trip.travelFrom)}` : "";
  return (
    <WindowSeatLayout current="/trips" chat={content.chat}>
      <PageTitle crumb={trip.destination || "Trips"} photo={trip.img} alt={trip.name}
        title={trip.name} intro={trip.price}>
        <div className="ws-rise flex flex-wrap gap-3 [animation-delay:.2s]">
          <a href={quoteTo(trip.name)} className={sunBtn}>Get a quote <ArrowRight className="h-4 w-4" /></a>
          {content.chat && <button type="button" onClick={openChat} className={ghost}>Ask us a question</button>}
        </div>
      </PageTitle>
      <section className={`grid gap-10 ${gutter} pb-20 md:grid-cols-[1.25fr_.75fr]`}>
        <div className="ws-reveal flex flex-col gap-5">
          {paragraphs(trip.summary).map((p, i) => <p key={i} className={`max-w-[62ch] text-lg leading-relaxed ${soft}`}>{p}</p>)}
          {!trip.summary && <p className={`max-w-[62ch] text-lg leading-relaxed ${soft}`}>
            Tell us your dates and who is travelling, and we'll put this trip together for you, with flights and transfers.</p>}
          {trip.inclusions.length > 0 && <List title="What's included" items={trip.inclusions} yes />}
          {trip.exclusions.length > 0 && <List title="Not included" items={trip.exclusions} />}
        </div>
        <aside className={`ws-reveal flex h-fit flex-col gap-4 p-7 ${card}`}>
          <SectionLabel>The trip</SectionLabel>
          <p className={`${display} text-3xl leading-tight`}>{trip.price}</p>
          <ul className="flex flex-col gap-3 text-[15px]">
            {trip.nights && <li className="flex items-center gap-2"><Moon className={`h-4 w-4 ${coral}`} aria-hidden="true" /> {trip.nights} nights</li>}
            {when && <li className="flex items-center gap-2"><CalendarDays className={`h-4 w-4 ${coral}`} aria-hidden="true" /> Travel {when}</li>}
            {trip.validUntil && <li className={soft}>Book by {dayWords(trip.validUntil)}</li>}
          </ul>
          <a href={quoteTo(trip.name)} className={`${btn} mt-2`}>Plan this trip <ArrowRight className="h-4 w-4" /></a>
        </aside>
      </section>
      {trip.gallery.length > 0 && (
        <section className={`flex flex-wrap justify-center gap-6 ${gutter} pb-20`} aria-label="Photos">
          {trip.gallery.slice(0, 6).map((src, i) => (
            <Porthole key={src} clouds={false} className="ws-reveal aspect-[3/4] w-[min(42vw,200px)]">
              <img src={src} alt={`${trip.name}, photo ${i + 2}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </Porthole>
          ))}
        </section>
      )}
      {dest && (
        <section className={`flex flex-col gap-8 ${gutter} pb-24`}>
          <div className="ws-reveal flex flex-wrap items-end justify-between gap-4">
            <h2 className={`${display} text-[clamp(28px,3.4vw,44px)] leading-tight`}>More in {dest.name}</h2>
            <a href={`/destinations/${dest.slug}`} className={ghost}>{dest.name} holidays <ArrowRight className="h-4 w-4" /></a>
          </div>
          {more.length > 0 && <TripCards trips={more} />}
        </section>
      )}
    </WindowSeatLayout>
  );
}

function List({ title, items, yes = false }: { title: string; items: string[]; yes?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className={`${display} text-2xl`}>{title}</h2>
      <ul className="flex flex-col gap-2 text-[16px]">
        {items.map((x) => (
          <li key={x} className="flex items-start gap-2">
            {yes ? <Check className={`mt-1 h-4 w-4 flex-none ${coral}`} aria-hidden="true" /> : <X className={`mt-1 h-4 w-4 flex-none ${soft}`} aria-hidden="true" />}
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The specials as windows, each linking to its page (as on the home page). */
function TripCards({ trips }: { trips: Trip[] }) {
  return (
    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {trips.map((t, i) => (
        <a key={t.slug} href={`/trips/${t.slug}`} className="ws-reveal group flex flex-col items-center gap-5 text-center" style={{ transitionDelay: `${(i % 4) * 110}ms` }}>
          <Porthole shade="reveal" className="aspect-[3/4] w-[min(70vw,260px)] transition duration-500 group-hover:-translate-y-2">
            <Scene img={t.img} alt={t.name} className="h-full" />
          </Porthole>
          <span className="flex flex-col items-center gap-1.5">
            <h3 className={`${display} text-2xl leading-tight`}>{t.name}</h3>
            <span className="mt-1 flex items-center gap-1 text-[15px] font-semibold">{t.price} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
          </span>
        </a>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ a destination
export function DestinationTripsPage({ content, dest }: { content: SiteContent; dest: Destination }) {
  const trips = content.trips.filter((t) => dest.trips.includes(t.slug));
  const intro = dest.blurb || `Holidays to ${dest.name}, planned personally for you: tell us when you can travel and what you love, and we'll build the trip around you.`;
  return (
    <WindowSeatLayout current="/destinations" chat={content.chat}>
      <PageTitle crumb="Destinations" photo={trips[0]?.img ?? ""} alt={dest.name}
        title={<>{dest.name} <em className={`font-medium italic ${coral}`}>holidays</em></>} intro={intro} />
      <section className={`flex flex-col gap-10 ${gutter} pb-20`}>
        <div className="ws-reveal flex flex-col gap-3">
          <SectionLabel>Our specials</SectionLabel>
          <h2 className={`${h2} max-w-[18ch]`}>{trips.length === 1 ? `Our ${dest.name} special` : `${trips.length} ways to see ${dest.name}`}</h2>
        </div>
        <TripCards trips={trips} />
      </section>
      <section className={`${gutter} pb-24`}>
        <div className={`ws-reveal flex flex-col items-start gap-5 p-8 md:flex-row md:items-center md:justify-between md:p-10 ${card}`}>
          <div className="flex flex-col gap-2">
            <h2 className={`${display} text-[clamp(28px,3.4vw,40px)] leading-tight`}>Something else in {dest.name}?</h2>
            <p className={`max-w-[52ch] ${soft}`}>Every trip is tailor-made. Tell us your dates and budget and we'll quote it in rand.</p>
          </div>
          <a href={quoteTo(dest.name) || QUOTE} className={`${sunBtn} min-h-14 px-7`}>Get a quote <ArrowRight className="h-4 w-4" /></a>
        </div>
      </section>
    </WindowSeatLayout>
  );
}
