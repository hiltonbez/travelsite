import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { bookRoom, checkDates, listPackages, rand, type Booked, type CheckRequest, type Package, type Room } from "@/lib/packages";
import type { PackagesHead } from "@/lib/site-content";
import islands from "@/assets/islands.jpg";
import cities from "@/assets/cities.jpg";
import cruises from "@/assets/cruises.jpg";
import safari from "@/assets/safari.jpg";

const fallbackImages = [islands, cruises, cities, safari];
const field = "w-full border-0 border-b border-border bg-transparent px-0 py-2 text-base outline-none transition focus:border-primary";

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function Label({ text, children, className }: { text: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="eyebrow text-muted-foreground">{text}</span>
      {children}
    </label>
  );
}

/** "Mauritius packages": the agency's Beachcomber packages, bookable here. Hidden when there are none.
 *  The headings are the agency's own (TribeTravel's visual editor). */
export function PackagesSection({ head }: { head: PackagesHead }) {
  const [packages, setPackages] = useState<Package[] | null>(null);
  const [minDays, setMinDays] = useState(10);
  const [open, setOpen] = useState<Package | null>(null);

  useEffect(() => {
    listPackages()
      .then((r) => {
        setPackages(r.packages);
        setMinDays(r.min_days_ahead || 10);
      })
      .catch(() => setPackages([]));
  }, []);

  if (packages !== null && packages.length === 0) return null;

  return (
    <section id="packages" className="bg-secondary px-5 py-24 md:px-24">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-primary">{head.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl tracking-[-0.03em] md:text-6xl">{head.title}</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">{head.intro}</p>
        </div>
      </div>
      {packages === null ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="aspect-[4/5] animate-pulse bg-border/60" />)}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((p, i) => (
            <button key={p.id} type="button" onClick={() => setOpen(p)} className="group relative aspect-[4/5] overflow-hidden text-left">
              <img src={p.image || fallbackImages[i % fallbackImages.length]} alt={p.hotel} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-[1.4s] group-hover:scale-110" />
              <div className="media-fade absolute inset-0" />
              <span className="eyebrow absolute left-5 top-5 text-on-media">{p.star || "Mauritius"}</span>
              <div className="absolute inset-x-5 bottom-5 text-on-media">
                <h3 className="font-display text-2xl tracking-tight">{p.hotel}</h3>
                <p className="text-sm opacity-90">{p.nights} nights · {p.board}</p>
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
                  From {rand(p.from_pp, p.currency)} pp <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      <BookingDialog pkg={open} minDays={minDays} onClose={() => setOpen(null)} />
    </section>
  );
}

type Step = "dates" | "rooms" | "details" | "done";

/** Book one package: dates, room, details, then the quote Tribe made. Also used by the Enterprise design. */
export function BookingDialog({ pkg, minDays, onClose }: { pkg: Package | null; minDays: number; onClose: () => void }) {
  const [step, setStep] = useState<Step>("dates");
  const [req, setReq] = useState<CheckRequest | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [token, setToken] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [booked, setBooked] = useState<Booked | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // The AI chat's floating button sits over the dialog's buttons on small screens: hide it while booking.
    document.documentElement.classList.toggle("tt-dialog-open", !!pkg);
    if (pkg) {
      setStep("dates");
      setReq(null);
      setRooms([]);
      setRoom(null);
      setBooked(null);
      setError("");
    }
  }, [pkg]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!pkg} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[100svh] max-w-2xl overflow-y-auto rounded-none p-0 sm:max-h-[90vh]">
        {pkg && (
          <div>
            <div className="relative h-44 overflow-hidden">
              <img src={pkg.image || islands} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="media-fade absolute inset-0" />
              <div className="absolute inset-x-6 bottom-4 text-on-media">
                <DialogTitle className="font-display text-3xl tracking-tight">{pkg.hotel}</DialogTitle>
                <DialogDescription className="text-sm text-on-media/90">{pkg.star} · {pkg.board} · from {rand(pkg.from_pp, pkg.currency)} pp</DialogDescription>
              </div>
            </div>
            <div className="p-6">
              <Steps step={step} />
              {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
              {step === "dates" && (
                <DatesForm pkg={pkg} minDays={minDays} busy={busy} initial={req}
                  onSubmit={(r) => run(async () => {
                    const out = await checkDates(r);
                    setReq(r);
                    setRooms(out.rooms);
                    setToken(out.token);
                    setRoom(out.rooms[0] ?? null);
                    setStep("rooms");
                  })} />
              )}
              {step === "rooms" && req && (
                <div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Available for {req.nights} nights from {new Date(req.check_in).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}, {req.adults + req.children} traveller{req.adults + req.children !== 1 ? "s" : ""}. Prices are for everyone, including flights from {({ JNB: "Johannesburg", CPT: "Cape Town", DUR: "Durban" } as const)[req.depart_city]} where the package includes them.
                  </p>
                  <div className="grid gap-3" role="radiogroup" aria-label="Rooms">
                    {rooms.map((r) => (
                      <button key={r.room_id} type="button" role="radio" aria-checked={room?.room_id === r.room_id} onClick={() => setRoom(r)}
                        className={cn("flex items-center justify-between gap-4 border p-4 text-left transition", room?.room_id === r.room_id ? "border-primary bg-primary/5" : "border-border hover:border-primary/60")}>
                        <span>
                          <span className="block font-semibold">{r.name}</span>
                          <span className="text-sm text-muted-foreground">{r.board}</span>
                        </span>
                        <span className="text-right">
                          <span className="block font-display text-xl text-primary">{rand(r.total, r.currency)}</span>
                          <span className="text-xs text-muted-foreground">{rand(r.pp, r.currency)} pp</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap justify-between gap-3">
                    <button type="button" className="eyebrow underline-offset-4 hover:underline" onClick={() => setStep("dates")}>Change dates</button>
                    <button type="button" disabled={!room} onClick={() => setStep("details")} className="eyebrow inline-flex items-center gap-2 bg-primary px-6 py-3 text-primary-foreground hover:brightness-110 disabled:opacity-50">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              {step === "details" && req && room && (
                <DetailsForm req={req} room={room} busy={busy} onBack={() => setStep("rooms")}
                  onSubmit={(t) => run(async () => {
                    setBooked(await bookRoom(token, room.room_id, t));
                    setStep("done");
                  })} />
              )}
              {step === "done" && booked && (
                <div className="text-center">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-7 w-7" /></div>
                  <h3 className="font-display text-3xl tracking-tight">Your quote {booked.quote_number} is ready</h3>
                  <p className="mx-auto mt-3 max-w-md text-muted-foreground">Your consultant is confirming availability and will call you to add flights, transfers and anything else you need. We've also emailed the agency your details.</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <a href={booked.quote_url} target="_blank" rel="noreferrer" className="eyebrow inline-flex items-center gap-2 bg-primary px-6 py-3 text-primary-foreground hover:brightness-110">View your quote <ArrowUpRight className="h-4 w-4" /></a>
                    <a href={booked.story_url} target="_blank" rel="noreferrer" className="eyebrow inline-flex items-center gap-2 border border-primary px-6 py-3 text-primary hover:bg-primary/5">See your itinerary <ArrowUpRight className="h-4 w-4" /></a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Steps({ step }: { step: Step }) {
  const all: [Step, string][] = [["dates", "Dates"], ["rooms", "Room"], ["details", "Your details"], ["done", "Quote"]];
  const at = all.findIndex(([s]) => s === step);
  return (
    <ol className="mb-6 flex gap-2 text-xs">
      {all.map(([s, label], i) => (
        <li key={s} className={cn("eyebrow flex-1 border-t-2 pt-2", i <= at ? "border-primary text-foreground" : "border-border text-muted-foreground")}>{label}</li>
      ))}
    </ol>
  );
}

function DatesForm({ pkg, minDays, busy, initial, onSubmit }: { pkg: Package; minDays: number; busy: boolean; initial: CheckRequest | null; onSubmit: (r: CheckRequest) => void }) {
  const earliest = useMemo(() => addDays(minDays), [minDays]);
  const [checkIn, setCheckIn] = useState(initial?.check_in ?? addDays(Math.max(minDays, 45)));
  const [nights, setNights] = useState(initial?.nights ?? pkg.nights);
  const [adults, setAdults] = useState(initial?.adults ?? 2);
  const [ages, setAges] = useState<number[]>(initial?.child_ages ?? []);
  const [city, setCity] = useState<CheckRequest["depart_city"]>(initial?.depart_city ?? "JNB");

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ package_id: pkg.id, check_in: checkIn, nights, adults, children: ages.length, child_ages: ages, depart_city: city });
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Label text="Arrival date"><input type="date" required min={earliest} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={field} /></Label>
        <Label text="Nights"><input type="number" required min={3} max={21} value={nights} onChange={(e) => setNights(Number(e.target.value))} className={field} /></Label>
        <Label text="Adults">
          <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={field}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Label>
        <Label text="Children (2-17)">
          <select value={ages.length} onChange={(e) => { const n = Number(e.target.value); setAges((a) => Array.from({ length: n }, (_, i) => a[i] ?? 8)); }} className={field}>
            {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Label>
        {ages.map((age, i) => (
          <Label key={i} text={`Child ${i + 1} age`}>
            <select value={age} onChange={(e) => setAges((a) => a.map((x, j) => (j === i ? Number(e.target.value) : x)))} className={field}>
              {Array.from({ length: 16 }, (_, k) => k + 2).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Label>
        ))}
        <Label text="Flying from">
          <select value={city} onChange={(e) => setCity(e.target.value as CheckRequest["depart_city"])} className={field}>
            <option value="JNB">Johannesburg</option>
            <option value="CPT">Cape Town</option>
            <option value="DUR">Durban</option>
          </select>
        </Label>
      </div>
      {pkg.inclusions.length > 0 && <p className="text-sm text-muted-foreground">Includes: {pkg.inclusions.join(" · ")}</p>}
      <button type="submit" disabled={busy} className="eyebrow inline-flex items-center justify-center gap-2 bg-primary px-6 py-4 text-primary-foreground hover:brightness-110 disabled:opacity-60">
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking availability…</> : <>Check availability <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  );
}

function DetailsForm({ req, room, busy, onBack, onSubmit }: { req: CheckRequest; room: Room; busy: boolean; onBack: () => void; onSubmit: (t: { name: string; email: string; phone: string; travellers: string[]; notes: string; whatsapp_ok: boolean }) => void }) {
  const others = req.adults + req.children - 1;
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const travellers = [name, ...Array.from({ length: others }, (_, i) => String(fd.get(`t${i}`) || "").trim())].filter(Boolean);
    onSubmit({ name, email: String(fd.get("email") || "").trim(), phone: String(fd.get("phone") || "").trim(), travellers,
      notes: String(fd.get("notes") || "").trim(), whatsapp_ok: fd.get("whatsapp_ok") === "on" });
  }
  return (
    <form onSubmit={submit} className="grid gap-5">
      <p className="text-sm text-muted-foreground">{room.name} · {rand(room.total, room.currency)} for {req.adults + req.children}</p>
      <Label text="Your full name"><input name="name" required autoComplete="name" className={field} /></Label>
      <div className="grid gap-5 sm:grid-cols-2">
        <Label text="Email"><input name="email" type="email" required autoComplete="email" className={field} /></Label>
        <Label text="Mobile"><input name="phone" type="tel" required autoComplete="tel" placeholder="+27" className={field} /></Label>
      </div>
      {others > 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: others }, (_, i) => (
            <Label key={i} text={`Traveller ${i + 2} (optional)`}><input name={`t${i}`} className={field} /></Label>
          ))}
        </div>
      )}
      <Label text="Anything we should know?"><textarea name="notes" rows={2} className={cn(field, "resize-none")} placeholder="An anniversary, special requests…" /></Label>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="whatsapp_ok" className="h-4 w-4 accent-[var(--primary)]" /> You may send my quote on WhatsApp</label>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="eyebrow underline-offset-4 hover:underline" onClick={onBack}>Back</button>
        <button type="submit" disabled={busy} className="eyebrow inline-flex items-center gap-2 bg-primary px-6 py-4 text-primary-foreground hover:brightness-110 disabled:opacity-60">
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating your quote…</> : <>Request this holiday <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </form>
  );
}
