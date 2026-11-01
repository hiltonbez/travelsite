// The supplier feed (Tribe Site Pro: 1 supplier feed): today's Beachcomber rates, live from TribeTravel, as paper tags
// with a wax seal, pinned to the Indian Ocean. A tag opens the shared booking pop-up to check dates and book. If the
// feed can't be read, clearly marked example rates stand in, and those lead to an enquiry instead.
import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import resort1 from "@/assets/resort-1.jpg";
import resort2 from "@/assets/resort-2.jpg";
import resort3 from "@/assets/resort-3.jpg";
import resort4 from "@/assets/resort-4.jpg";
import resort5 from "@/assets/resort-5.jpg";
import resort6 from "@/assets/resort-6.jpg";
import resort7 from "@/assets/resort-7.jpg";
import { BookingDialog } from "@/components/packages";
import { listPackages, rand, type Package } from "@/lib/packages";
import { EXAMPLE_RATES } from "@/designs/living-map/content";
import { LivingMap } from "@/designs/living-map/map";
import { Example, SectionHead, WaxSeal, useLook } from "@/designs/living-map/parts";
import { BASE, accent, caps, display, ghost, gutter, hand, soft } from "@/designs/living-map/theme";

/** Resort photos for hotels that come without one, or share one with another hotel. */
const RESORTS = [resort1, resort2, resort3, resort4, resort5, resort6, resort7];
function variedPhotos(images: string[]) {
  let next = 0;
  return images.map((img, i) => (img && images.indexOf(img) === i ? img : RESORTS[next++ % RESORTS.length]!));
}

/** The live feed: null while loading, "error" when TribeTravel couldn't be reached. */
function useRates() {
  const [packages, setPackages] = useState<Package[] | "error" | null>(null);
  const [minDays, setMinDays] = useState(10);
  useEffect(() => {
    listPackages().then((r) => { setPackages(r.packages); setMinDays(r.min_days_ahead || 10); }).catch(() => setPackages("error"));
  }, []);
  return { packages, minDays };
}

/** A luggage tag on a string: the hotel, the stay, and a wax seal with today's price. */
function RateTag({ i, image, name, where, stay, price, live, onClick, href }: {
  i: number; image: string; name: string; where: string; stay: string; price: string; live: boolean; onClick?: () => void; href?: string;
}) {
  const body = (
    <>
      <span aria-hidden="true" className="absolute -top-9 left-1/2 h-10 w-px bg-(--lm-ink)/50" />
      <span aria-hidden="true" className="absolute -top-11 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-(--lm-accent) shadow" />
      <span className="relative flex flex-col overflow-hidden rounded-[6px_6px_10px_10px] border border-(--lm-line) bg-(--lm-card) shadow-[0_20px_36px_-24px_var(--lm-shadow)] [clip-path:polygon(18%_0,82%_0,100%_9%,100%_100%,0_100%,0_9%)]">
        <span aria-hidden="true" className="mx-auto mt-3 h-3.5 w-3.5 rounded-full border-2 border-(--lm-ink)/40 bg-(--lm-paper)" />
        <span className="flex flex-col gap-1 px-4 pt-2 pb-3">
          <span className={`${caps} text-[11px] ${accent}`}>{where}</span>
          <span className={`${display} text-[22px] leading-tight`}>{name}</span>
          <span className={`text-sm ${soft}`}>{stay}</span>
        </span>
        <img src={image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover sepia-[.2]" />
        <span className="flex items-center justify-between gap-2 border-t border-dashed border-(--lm-line) px-4 py-3">
          <span className="flex flex-col leading-tight">
            <span className={`${hand} text-lg ${soft}`}>{live ? "today's rate, from" : "example rate, from"}</span>
            <b className="text-lg">{price} <span className={`text-xs font-normal ${soft}`}>pp</span></b>
          </span>
          <span className={`flex items-center gap-1 text-sm font-semibold ${accent}`}>{live ? "Check dates" : "Ask us"} <ArrowRight className="h-4 w-4" /></span>
        </span>
      </span>
      <WaxSeal word={live ? "Live" : "e.g."} rim={live ? "TODAY'S RATE · TODAY'S RATE ·" : "EXAMPLE · EXAMPLE · EXAMPLE ·"}
        className={`${live ? "lm-stamp" : "-rotate-10"} absolute top-14 -right-4 h-20 w-20 drop-shadow-md`} />
    </>
  );
  const cls = `lm-sway group relative mt-12 block text-left transition hover:-translate-y-1`;
  const style = { animationDelay: `${-i * 1.3}s`, animationDuration: `${5 + (i % 3)}s` };
  return onClick
    ? <button type="button" onClick={onClick} className={cls} style={style} aria-label={`${name}, ${stay}, ${price} per person. Check dates`}>{body}</button>
    : <a href={href} className={cls} style={style}>{body}</a>;
}

/** Today's rates as tags. `limit` shows only the first few (the home page). */
export function RateTags({ limit }: { limit?: number }) {
  const { packages, minDays } = useRates();
  const [book, setBook] = useState<Package | null>(null);
  const { look } = useLook();
  const grid = "grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4";

  if (packages === null) {
    return <p className={`flex items-center gap-3 py-10 ${soft}`}><Loader2 className="h-5 w-5 animate-spin" /> Fetching today's rates from Beachcomber…</p>;
  }
  if (packages === "error" || packages.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-(--lm-accent) bg-(--lm-card) px-4 py-3 text-sm">
          <Example>Example rates</Example>
          {packages === "error"
            ? "We couldn't load today's live rates just now, so these are examples. Ask us for today's price."
            : "Live Beachcomber rates aren't switched on for this site yet (TribeTravel: Website packages). Until then, these are examples."}
        </p>
        <div className={grid}>
          {EXAMPLE_RATES.slice(0, limit).map((r, i) => (
            <RateTag key={r.hotel} i={i} live={false} image={RESORTS[i % RESORTS.length]!} name={r.hotel} where={`${r.star} · Mauritius`}
              stay={`${r.nights} nights · ${r.board}`} price={r.from} href={`${BASE}/contact?about=${encodeURIComponent(r.hotel)}`} />
          ))}
        </div>
      </div>
    );
  }
  const photos = variedPhotos(packages.map((p) => p.image));
  return (
    <>
      <div className={grid}>
        {packages.slice(0, limit).map((p, i) => (
          <RateTag key={p.id} i={i} live image={photos[i]!} name={p.hotel} where={`${p.star} · ${p.location}`}
            stay={`${p.nights} nights · ${p.board}`} price={rand(p.from_pp, p.currency)} onClick={() => setBook(p)} />
        ))}
      </div>
      <BookingDialog pkg={book} minDays={minDays} onClose={() => setBook(null)} className={`lm-dialog lm-look-${look} sm:rounded-[8px]`} />
    </>
  );
}

/** The home page's rates: a stretch of the Indian Ocean with the tags pinned along it. */
export function RatesSection() {
  return (
    <section id="rates" data-pin className={`relative z-10 flex scroll-mt-24 flex-col gap-10 ${gutter} py-24`}>
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_.8fr]">
        <SectionHead kicker={<><span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--lm-accent) opacity-70" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-(--lm-accent)" /></span> Live from Beachcomber</>}
          title={<>Today's rates, <em>sealed in wax.</em></>}
          intro="Prices come straight from Beachcomber's system through TribeTravel, so what you see is today's rate. Tap a tag to check your dates and book."
          note="Updated every time you open the page" />
        <div className="relative hidden aspect-[16/10] overflow-hidden rounded-[4px] border border-(--lm-line) lg:block">
          <LivingMap view="ocean" routes={["mauritius"]} focus="mauritius" draw="scroll" label="Map of the Indian Ocean with the route from Johannesburg to Mauritius" />
        </div>
      </div>
      <RateTags limit={4} />
      <a href={`${BASE}/specials`} className={`${ghost} self-start`}>All specials <ArrowRight className="h-4 w-4" /></a>
    </section>
  );
}
