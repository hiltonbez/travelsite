// Live quotes and bookings for a Tribe Site: the agency's supplier feed (Beachcomber packages), a date check, and
// online booking through the shared booking dialog. The packages load as soon as the section appears, in the
// visitor's browser, and no price is ever invented: if the feed is down, the section says so.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Compass } from "lucide-react";
import { BookingDialog } from "@/components/packages";
import { checkDates, listPackages, rand, type Package, type Room } from "@/lib/packages";

export function LivePackages({ onChoose }: { onChoose: (destination: string) => void }) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [minDays, setMinDays] = useState(10);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Package | null>(null);
  const [booking, setBooking] = useState<Package | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [checked, setChecked] = useState(false);
  const request = useRef(0);
  async function load() {
    setState("loading");
    setError("");
    try {
      const r = await listPackages();
      setPackages(Array.isArray(r.packages) ? r.packages : []);
      setMinDays(r.min_days_ahead || 10);
      setState("loaded");
    } catch {
      setError(
        "Live packages are unavailable for this preview. Request a quote and your agent will check the options.",
      );
      setState("error");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function check(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const generation = ++request.current;
    const fd = new FormData(e.currentTarget);
    setState("checking");
    setError("");
    setRooms([]);
    setChecked(false);
    const ages = String(fd.get("child_ages") || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .map(Number);
    if (ages.some((x) => !Number.isInteger(x) || x < 0 || x > 17)) {
      setError("Enter each child’s age as a number from 0 to 17, separated by commas.");
      setState("loaded");
      return;
    }
    try {
      const r = await checkDates({
        package_id: selected.id,
        check_in: String(fd.get("check_in")),
        nights: Number(fd.get("nights")),
        adults: Number(fd.get("adults")),
        children: ages.length,
        child_ages: ages,
        depart_city: String(fd.get("depart_city")) as "JNB" | "CPT" | "DUR",
      });
      if (generation !== request.current) return;
      setRooms(r.rooms);
      setChecked(true);
    } catch {
      if (generation === request.current)
        setError("We couldn’t confirm these dates. Please ask your agent to check availability.");
    } finally {
      if (generation === request.current) setState("loaded");
    }
  }
  return (
    <section className="concept-live" id="live">
      <div>
        <p className="concept-eyebrow">LIVE BEACHCOMBER PRICING</p>
        <h2>
          A real journey starts
          <br />
          with real possibilities.
        </h2>
        <p>
          Real Beachcomber packages with today’s prices. Pick one, check your dates for a live room
          quote, and book it online; your agent confirms the final details.
        </p>
        {state === "error" && (
          <button className="concept-cta" onClick={load}>
            Try again <ArrowUpRight size={18} />
          </button>
        )}
        <p className="supplier-fine">
          Other supplier feeds depend on each agency’s approved accounts and integrations.
        </p>
      </div>
      <div className="live-results" aria-live="polite">
        {state === "loading" && (
          <div className="live-idle">
            <Compass size={35} />
            <p>Checking today’s Beachcomber packages…</p>
            <span>No sample prices. No invented availability.</span>
          </div>
        )}
        {error && <p role="alert">{error}</p>}
        {state === "loaded" && packages.length === 0 && (
          <p>
            No packages are currently available from this agency’s feed. Tell us what you have in
            mind below.
          </p>
        )}
        {packages.slice(0, 6).map((p) => (
          <button
            key={p.id}
            className={`live-package ${selected?.id === p.id ? "selected" : ""}`}
            onClick={() => {
              request.current++;
              setSelected(p);
              setRooms([]);
              setChecked(false);
              setError("");
              setState("loaded");
            }}
          >
            <span>
              <b>{p.hotel}</b>
              <small>
                {p.location} · {p.nights} nights
              </small>
            </span>
            <span>
              From {rand(p.from_pp, p.currency)}
              <small>per person · select to check dates</small>
            </span>
          </button>
        ))}
        {selected && (
          <>
            <button type="button" className="concept-cta" onClick={() => setBooking(selected)}>
              Book this package online <ArrowUpRight size={16} />
            </button>
            <form className="live-check-form" onSubmit={check}>
              <h3>Check {selected.hotel}</h3>
              <div className="plan-fields">
                <label>
                  Arrival
                  <input
                    type="date"
                    name="check_in"
                    required
                    min={new Date().toLocaleDateString("en-CA", {
                      timeZone: "Africa/Johannesburg",
                    })}
                  />
                </label>
                <label>
                  Nights
                  <input
                    type="number"
                    name="nights"
                    min="1"
                    max="30"
                    defaultValue={selected.nights}
                    required
                  />
                </label>
                <label>
                  Adults
                  <input type="number" name="adults" min="1" max="8" defaultValue="2" required />
                </label>
                <label>
                  Departure
                  <select name="depart_city">
                    <option value="JNB">Johannesburg</option>
                    <option value="CPT">Cape Town</option>
                    <option value="DUR">Durban</option>
                  </select>
                </label>
              </div>
              <label>
                Children’s ages, if travelling
                <input name="child_ages" placeholder="e.g. 5, 9" aria-describedby="age-help" />
              </label>
              <small id="age-help">Separate ages with commas. Leave blank for adults only.</small>
              <button className="concept-cta" disabled={state === "checking"}>
                {state === "checking" ? "Checking…" : "Check these dates"}
                <ArrowRight size={17} />
              </button>
              {checked && !rooms.length && (
                <p>No rooms returned for those dates. Ask your agent about alternatives.</p>
              )}
              {rooms.map((r) => (
                <div className="live-room" key={r.room_id}>
                  <b>{r.name}</b>
                  <p>
                    {r.board} · {r.nights} nights · {rand(r.total, r.currency)} total
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onChoose(`${selected.hotel} — ${r.name}`);
                      document.getElementById("plan")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Request a quote for this room <ArrowUpRight size={16} />
                  </button>
                </div>
              ))}
            </form>
          </>
        )}
      </div>
      <BookingDialog
        pkg={booking}
        minDays={minDays}
        onClose={() => setBooking(null)}
        className="tk-booking"
      />
    </section>
  );
}
