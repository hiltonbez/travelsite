// Stop 1: live supplier packages (Beachcomber, bookable; Thompsons, enquire), straight from TribeTravel.
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import resort1 from "@/assets/resort-1.jpg";
import resort2 from "@/assets/resort-2.jpg";
import resort3 from "@/assets/resort-3.jpg";
import resort4 from "@/assets/resort-4.jpg";
import resort5 from "@/assets/resort-5.jpg";
import resort6 from "@/assets/resort-6.jpg";
import resort7 from "@/assets/resort-7.jpg";
import { BookingDialog } from "@/components/packages";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useEnquiry } from "@/lib/enquiry";
import { listPackages, rand, type Package } from "@/lib/packages";
import { getHoliday, listHolidays, type Holiday, type HolidayFull } from "@/lib/thompsons";
import { BotTrap, FormStatus, media } from "@/designs/shared";
import { Consent, LiveDot, StopLabel } from "@/designs/enterprise/parts";
import { btn, display, ghost, gutter, h2, input, label, mono, orange, panel, soft } from "@/designs/enterprise/theme";

/** Beach and resort photos (Unsplash) for Beachcomber hotels that come without a photo of their own. */
const RESORTS = [resort1, resort2, resort3, resort4, resort5, resort6, resort7];

/** Each package's photo. When suppliers send one photo for several hotels, the first keeps it and the rest get a
 *  resort photo each, so the cards don't all look alike. */
function variedPhotos(images: string[]) {
  let next = 0;
  return images.map((img, i) => (img && images.indexOf(img) === i ? img : RESORTS[next++ % RESORTS.length]));
}

export function LiveSuppliers() {
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
  const photos = variedPhotos(Array.isArray(packages) ? packages.map((p) => p.image) : []);
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
              <TicketCard key={p.id} onClick={() => setBook(p)} image={photos[i]} alt={p.hotel}
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
export function TicketCard({ onClick, image, alt, badge, where, name, detail, price, action }: {
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
