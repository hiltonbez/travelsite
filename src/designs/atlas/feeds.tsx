// The agency's three supplier feeds, live: Beachcomber (bookable here, through the shared BookingDialog) and
// Thompsons Holidays (enquire) straight from TribeTravel, and an example third supplier. Shown as a stream of
// packages arriving on the home page (FeedStream), side by side on the Suppliers page (FeedColumns), or filtered to
// one place on a destination page.
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { ArrowRight, Loader2, Pause, Play } from "lucide-react";
import resort1 from "@/assets/resort-1.jpg";
import resort2 from "@/assets/resort-2.jpg";
import resort4 from "@/assets/resort-4.jpg";
import resort6 from "@/assets/resort-6.jpg";
import resort7 from "@/assets/resort-7.jpg";
import { BookingDialog } from "@/components/packages";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useEnquiry } from "@/lib/enquiry";
import { listPackages, rand, type Package } from "@/lib/packages";
import { getHoliday, listHolidays, type Holiday, type HolidayFull } from "@/lib/thompsons";
import { BotTrap, FormStatus, media } from "@/designs/shared";
import { EXAMPLE_PACKAGES, type ExamplePackage } from "@/designs/atlas/content";
import { Consent, ExampleTag, LiveDot } from "@/designs/atlas/parts";
import { FEEDS, btn, card, display, input, label, mono, muted, type FeedKey } from "@/designs/atlas/theme";

/** Resort photos (Unsplash) for packages that arrive without a photo of their own, or share one. */
const RESORTS = [resort1, resort2, resort4, resort6, resort7];
function variedPhotos(images: string[]) {
  let next = 0;
  return images.map((img, i) => (img && images.indexOf(img) === i ? img : RESORTS[next++ % RESORTS.length]!));
}

/** One package from any feed, in the shape the cards draw. */
type Item = { feed: FeedKey; id: string; name: string; where: string; detail: string; price: string; image: string; action: string };
type Ask = { item: Item; holiday?: Holiday | undefined; example?: ExamplePackage | undefined };
/** null while loading; "error" when TribeTravel couldn't be reached (not the same as nothing to show). */
type Load<T> = T[] | "error" | null;

const feed = (key: FeedKey) => FEEDS.find((f) => f.key === key)!;

/** Loads the two live feeds once, and keeps what the dialogs need. */
function useFeeds() {
  const [beach, setBeach] = useState<Load<Package>>(null);
  const [minDays, setMinDays] = useState(10);
  const [thompsons, setThompsons] = useState<Load<Holiday>>(null);
  useEffect(() => {
    listPackages().then((r) => { setBeach(r.packages); setMinDays(r.min_days_ahead || 10); }).catch(() => setBeach("error"));
    listHolidays().then(setThompsons).catch(() => setThompsons("error"));
  }, []);

  const items = useMemo(() => {
    const b = Array.isArray(beach) ? beach : [], t = Array.isArray(thompsons) ? thompsons : [];
    const photos = variedPhotos(b.map((p) => p.image));
    return {
      beachcomber: b.map((p, i): Item => ({
        feed: "beachcomber", id: p.id, name: p.hotel, where: `${p.star} · ${p.location}`, detail: `${p.nights} nights · ${p.board}`,
        price: `From ${rand(p.from_pp, p.currency)} pp`, image: photos[i]!, action: "Check dates",
      })),
      thompsons: t.map((h, i): Item => ({
        feed: "thompsons", id: h.id, name: h.name, where: h.destination, detail: `${h.nights} nights${h.board ? ` · ${h.board}` : ""}`,
        price: h.from_pp ? `From ${rand(h.from_pp, h.currency)} pp` : "Ask for a price", image: h.image || [media.safari, media.islands, media.cities, media.cruises][i % 4]!, action: "Ask",
      })),
      example: EXAMPLE_PACKAGES.map((x): Item => ({
        feed: "example", id: x.id, name: x.name, where: x.place, detail: `${x.nights} nights · ${x.line}`, price: `From ${rand(x.from_pp)} pp`, image: x.image, action: "Ask",
      })),
    };
  }, [beach, thompsons]);

  const state: Record<FeedKey, Load<unknown>> = { beachcomber: beach, thompsons, example: EXAMPLE_PACKAGES };
  return { beach, thompsons, minDays, items, state };
}

/** The feeds plus the dialog each package opens: book (Beachcomber) or ask (Thompsons, example). */
function useOpenable() {
  const f = useFeeds();
  const [book, setBook] = useState<Package | null>(null);
  const [ask, setAsk] = useState<Ask | null>(null);
  function open(item: Item) {
    if (item.feed === "beachcomber" && Array.isArray(f.beach)) setBook(f.beach.find((p) => p.id === item.id) ?? null);
    else if (item.feed === "thompsons" && Array.isArray(f.thompsons)) setAsk({ item, holiday: f.thompsons.find((h) => h.id === item.id) });
    else setAsk({ item, example: EXAMPLE_PACKAGES.find((x) => x.id === item.id) });
  }
  const dialogs = (
    <>
      <BookingDialog pkg={book} minDays={f.minDays} onClose={() => setBook(null)} className="atlas-dialog sm:rounded-[28px]" />
      <AskDialog ask={ask} onClose={() => setAsk(null)} />
    </>
  );
  return { ...f, open, dialogs };
}

/** A package as a compact row: photo, feed colour, name, price. */
function Row({ item, onOpen, arriving = false }: { item: Item; onOpen: () => void; arriving?: boolean }) {
  const f = feed(item.feed);
  return (
    <button type="button" onClick={onOpen} style={{ "--feed": f.colour } as CSSProperties}
      className={`group flex w-full items-center gap-3.5 rounded-[20px] border border-[#0B2340]/8 bg-white p-2.5 pr-4 text-left shadow-[0_10px_30px_-24px_rgba(11,35,64,.5)] transition hover:-translate-y-0.5 hover:border-[var(--feed)] ${arriving ? "atlas-arrive" : ""}`}>
      <img src={item.image} alt="" loading="lazy" className="h-16 w-16 flex-none rounded-2xl object-cover sm:h-[72px] sm:w-[72px]" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={`flex items-center gap-1.5 ${label} truncate`} style={{ color: "color-mix(in oklab, var(--feed) 70%, #0B2340)" }}>
          <span className="h-2 w-2 flex-none rounded-full bg-[var(--feed)]" aria-hidden="true" />{f.name}
        </span>
        <b className="truncate text-[15px] leading-snug">{item.name}</b>
        <span className={`truncate text-[13px] ${muted}`}>{item.where}</span>
      </span>
      <span className="flex flex-none flex-col items-end gap-1">
        <span className={`${mono} text-[13px] font-medium whitespace-nowrap`}>{item.price.replace("From ", "")}</span>
        <span className="flex items-center gap-1 text-xs font-bold text-[#1D6FD8]">{item.action} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
      </span>
    </button>
  );
}

/** Home: packages arriving from the three feeds, newest on top, one every few seconds. */
export function FeedStream() {
  const { items, open, dialogs, state } = useOpenable();
  const pool = useMemo(() => {
    // Interleave the feeds so the colours alternate.
    const lists = [items.beachcomber, items.thompsons, items.example];
    const out: Item[] = [];
    for (let i = 0; i < Math.max(...lists.map((l) => l.length)); i++) lists.forEach((l) => l[i] && out.push(l[i]!));
    return out;
  }, [items]);
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || pool.length < 5 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => { if (!document.hidden) setStart((s) => (s + 1) % pool.length); }, 3400);
    return () => clearInterval(id);
  }, [paused, pool.length]);
  // The newest arrives at the top; the list shows the four most recent.
  const shown = Array.from({ length: Math.min(4, pool.length) }, (_, k) => pool[(start - k + pool.length * 4) % pool.length]!);
  const loading = state.beachcomber === null || state.thompsons === null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className={`flex items-center gap-2 ${label} ${muted}`}><LiveDot /> Arriving now</span>
        {pool.length >= 5 && (
          <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused}
            className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-[#1D6FD8] hover:bg-[#EEF5FE]">
            {paused ? <><Play className="h-3.5 w-3.5" /> Play</> : <><Pause className="h-3.5 w-3.5" /> Pause</>}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2.5" aria-live="off">
        {shown.map((item, k) => <Row key={`${item.feed}-${item.id}`} item={item} onOpen={() => open(item)} arriving={k === 0 && start > 0} />)}
        {loading && <div className="flex h-[92px] items-center justify-center gap-2 rounded-[20px] border border-dashed border-[#0B2340]/15 text-sm text-[#4B6280]"><Loader2 className="h-4 w-4 animate-spin" /> Connecting to the live feeds…</div>}
      </div>
      {dialogs}
    </div>
  );
}

const EMPTY: Record<FeedKey, string> = {
  beachcomber: "Online booking isn't switched on for this site yet. In TribeTravel, turn on Website packages and your Beachcomber rates appear here, live.",
  thompsons: "Connect your Thompsons Holidays login in TribeTravel and your Thompsons packages appear here, live, with their per-person prices.",
  example: "",
};
const UNREACHABLE = "We couldn't load live rates just now. Please try again in a moment, or ask our assistant.";

/** Suppliers page: the three feeds side by side, each with its status and its packages. `match` keeps only the
 *  packages for one place (a destination page), and hides feeds with none. */
export function FeedColumns({ match }: { match?: string }) {
  const { items, open, dialogs, state } = useOpenable();
  const fits = (i: Item) => !match || `${i.name} ${i.where}`.toLowerCase().includes(match.toLowerCase());
  const shown = FEEDS.filter((f) => !match || items[f.key].some(fits));

  if (match && shown.length === 0) {
    const loading = state.beachcomber === null || state.thompsons === null;
    return (
      <p className={`flex flex-wrap items-center gap-2 rounded-[22px] border border-dashed border-[#0B2340]/15 bg-white/60 p-6 ${muted}`}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking today's live packages for {match}…</> : <>No live packages for {match} today: ask us, and we'll build one.{" "}
          <a href="/designs/atlas/suppliers" className="font-bold text-[#1D6FD8] underline underline-offset-4">See every live package</a></>}
      </p>
    );
  }
  return (
    <>
      <div className={`grid gap-5 ${shown.length > 2 ? "lg:grid-cols-3" : shown.length === 2 ? "lg:grid-cols-2" : ""}`}>
        {shown.map((f) => {
          const s = state[f.key], list = items[f.key].filter(fits);
          return (
            <section key={f.key} aria-label={f.name} className={`flex min-w-0 flex-col gap-4 p-4 sm:p-5 ${card}`} style={{ "--feed": f.colour } as CSSProperties}>
              <header className="flex items-start gap-3">
                <span aria-hidden="true" className="relative mt-1 flex h-9 w-9 flex-none items-center justify-center">
                  <span className="atlas-orbit absolute inset-0 rounded-full border-2 border-[var(--feed)] border-t-transparent" />
                  <span className="h-3 w-3 rounded-full bg-[var(--feed)]" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <b className={`${display} text-xl leading-tight`}>{f.name}</b>
                  <span className={`text-sm ${muted}`}>{f.line}</span>
                </span>
                {f.example ? <ExampleTag>Example</ExampleTag> : (
                  <span className={`flex items-center gap-1.5 rounded-full bg-[#16A34A]/10 px-2.5 py-1 ${label} text-[#15803D]`}>
                    {s === null ? <Loader2 className="h-3 w-3 animate-spin" /> : <LiveDot />} {s === "error" ? "Offline" : "Live"}
                  </span>
                )}
              </header>
              {s === null ? (
                <div className="flex flex-col gap-2.5" aria-label={`Loading ${f.name}`}>{[0, 1, 2].map((i) => <div key={i} className="h-[92px] animate-pulse rounded-[20px] bg-[#EEF5FE]" />)}</div>
              ) : s === "error" ? <Empty text={UNREACHABLE} /> : list.length === 0 ? <Empty text={EMPTY[f.key]} /> : (
                <div className="flex flex-col gap-2.5">
                  {list.slice(0, match ? 4 : 8).map((item) => <Row key={item.id} item={item} onOpen={() => open(item)} />)}
                </div>
              )}
              <p className={`mt-auto ${mono} text-[11px] ${muted}`}>
                {f.example ? "Example packages: how a third supplier's feed would look." : s === null ? "Connecting…" : Array.isArray(s) ? `${s.length} packages · straight from ${f.name} through TribeTravel` : "Will retry on your next visit"}
              </p>
            </section>
          );
        })}
      </div>
      {dialogs}
    </>
  );
}

function Empty({ text }: { text: string }) {
  return <p className={`rounded-[20px] border border-dashed border-[#0B2340]/15 bg-[#F5F8FC] p-5 text-sm leading-relaxed ${muted}`}>{text}</p>;
}

/** Ask about a Thompsons holiday or an example package: the details, and a form straight into Tribe's enquiries. */
function AskDialog({ ask, onClose }: { ask: Ask | null; onClose: () => void }) {
  const [full, setFull] = useState<HolidayFull | null>(null);
  const item = ask?.item;
  const { status, onSubmit, sending } = useEnquiry(() => ({
    destination: item ? `${item.name} (${item.detail.split(" · ")[0]}, ${item.where})${item.feed === "example" ? " [example supplier on the demo site]" : ""}` : "",
  }));
  const holiday = ask?.holiday;
  useEffect(() => {
    setFull(null);
    if (holiday) getHoliday(holiday.id).then(setFull).catch(() => setFull(null));
  }, [holiday]);

  return (
    <Dialog open={!!ask} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="atlas-dialog max-h-[100svh] max-w-2xl overflow-y-auto p-0 sm:max-h-[90vh] sm:rounded-[28px]">
        {item && (
          <div>
            <div className="relative h-52 overflow-hidden">
              <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(11,35,64,.85))]" />
              <div className="absolute inset-x-6 bottom-4 text-white">
                <span className={`${label} text-white/85`}>{feed(item.feed).name}{item.feed === "example" ? " · example" : ""}</span>
                <DialogTitle className={`${display} mt-1 text-3xl leading-none`}>{item.name}</DialogTitle>
                <DialogDescription className="mt-2 text-sm text-white/90">{item.where} · {item.detail} · {item.price.toLowerCase()}</DialogDescription>
              </div>
            </div>
            <div className="grid gap-5 p-6">
              {holiday?.strapline && <p className={`text-[15px] leading-relaxed ${muted}`}>{holiday.strapline}</p>}
              {holiday && holiday.inclusions.length > 0 && <p className={`text-sm ${muted}`}><b className="text-[#0B2340]">Includes:</b> {holiday.inclusions.join(" · ")}</p>}
              {full?.days?.length ? (
                <ol className="grid gap-2 border-l-2 border-[#1D6FD8] pl-4">
                  {full.days.slice(0, 8).map((d, i) => <li key={i} className="text-sm"><b className={mono}>Day {i + 1}</b> <span className={muted}>{d.items.join(" · ")}</span></li>)}
                </ol>
              ) : null}
              {item.feed === "example" && <p className={`text-sm ${muted}`}>An example supplier, to show how a third feed looks. Your question still reaches us: we'll suggest the closest real trip.</p>}
              <form onSubmit={(e: FormEvent<HTMLFormElement>) => onSubmit(e)} className="grid gap-3 rounded-[22px] bg-[#F5F8FC] p-5">
                <b className="text-lg">Ask about this trip</b>
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
