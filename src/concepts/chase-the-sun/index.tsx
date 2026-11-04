import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKey,
  type PointerEvent as ReactPointer,
} from "react";
import {
  BRAND,
  Clip,
  contact,
  QuoteForm,
  rand,
  TRIPS,
  useReducedMotion,
  type ConceptTrip,
} from "@/concepts/kit";
import { clockAt, lightAt, SLOTS } from "./sky";
import { useSky, xToHour, type SkyControl } from "./engine";
import { momentOf, ORDER, slotName, tripOf, workOut, type Pin, type Plan } from "./moments";
import { Silhouette } from "./horizon";

export const FONTS =
  "family=Fraunces:ital,opsz,wght@0,9..144,100..400;1,9..144,100..400&family=DM+Mono:wght@300;400";

const SAMPLE = "Sample price, per person sharing";
const pad = (n: number) => String(n).padStart(2, "0");
const price = (n: number) => rand(n).replace(/ /g, "\u00a0");

/** A line of big type that arrives word by word. */
function Words({
  text,
  as: Tag = "p",
  className,
}: {
  text: string;
  as?: "p" | "h1" | "h2";
  className?: string;
}) {
  return (
    <Tag className={className}>
      {text.split(" ").map((w, i) => (
        <span key={`${w}-${i}`} className="w" style={{ animationDelay: `${i * 34}ms` }}>
          {w}{" "}
        </span>
      ))}
    </Tag>
  );
}

/** The footage for a place, rising out of the horizon and graded by the hour. Crossfades: at most two clips at once. */
function Footage({ trip, faded }: { trip: ConceptTrip; faded?: boolean }) {
  const [cur, setCur] = useState(trip);
  const [prev, setPrev] = useState<ConceptTrip | null>(null);
  if (trip !== cur) {
    setPrev(cur);
    setCur(trip);
  }
  useEffect(() => {
    if (!prev) return;
    const t = setTimeout(() => setPrev(null), 950);
    return () => clearTimeout(t);
  }, [prev]);
  return (
    <div className={`foot${faded ? " foot-faded" : ""}`} data-foot aria-hidden="true">
      <div className="foot-grade">
        {prev && (
          <div key={prev.slug} className="foot-clip">
            <Clip src={prev.video} poster={prev.poster} className="foot-video" />
          </div>
        )}
        <div key={cur.slug} className="foot-clip foot-in">
          <Clip src={cur.video} poster={cur.poster} className="foot-video" />
        </div>
      </div>
      <div className="foot-mul" />
      <div className="foot-soft" />
    </div>
  );
}

/** Plays only while on screen, so the page never runs more than two clips. */
function LazyClip({ trip }: { trip: ConceptTrip }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(!!e?.isIntersecting), {
      rootMargin: "60px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="band">
      {on ? (
        <Clip src={trip.video} poster={trip.poster} className="band-video" />
      ) : (
        <img src={trip.poster} alt="" className="band-video" loading="lazy" />
      )}
    </div>
  );
}

function chipStyle(hour: number) {
  const c = lightAt(hour);
  return {
    background: `radial-gradient(120% 160% at 18% 0%, #fff8, transparent 60%), ${c}`,
    boxShadow: `0 0 26px -4px ${c}`,
  };
}

/** The strip at the bottom: six slots of a day. Empty, a slot is a button that moves the sun there. Pinned, it's a chip. */
function Timeline({
  pins,
  slot,
  go,
}: {
  pins: Pin[];
  slot: number;
  go: (slotIndex: number, pin?: Pin) => void;
}) {
  return (
    <ol className="line" aria-label="Your perfect day">
      {SLOTS.map((s, i) => {
        const pin = pins.find((p) => p.slot === i);
        return (
          <li key={s.key} className={`line-col${pin ? " has-pin" : ""}`} data-col={i}>
            {pin ? (
              <button
                key={`${pin.place}-${pin.seq}`}
                type="button"
                className="chip"
                style={chipStyle(pin.hour)}
                onClick={() => go(i, pin)}
                aria-label={`${s.name}, ${tripOf(pin.place).name}: ${momentOf(pin.place, i).chip}. Go back to this moment.`}
              >
                <span className="chip-time">{clockAt(pin.hour)}</span>
                <span className="chip-name">{momentOf(pin.place, i).chip}</span>
              </button>
            ) : (
              <button
                type="button"
                className={`slot${slot === i ? " slot-on" : ""}`}
                onClick={() => go(i)}
                aria-current={slot === i ? "time" : undefined}
              >
                <i className="slot-dot" />
                {s.name}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Hero(props: {
  place: string;
  slot: number;
  pins: Pin[];
  noted: boolean;
  touched: boolean;
  setPlace: (slug: string) => void;
  pin: (from: HTMLElement) => void;
  goSlot: (i: number, pin?: Pin) => void;
  makeReal: () => void;
  grab: {
    onPointerDown: (e: ReactPointer<HTMLElement>) => void;
    onPointerMove: (e: ReactPointer<HTMLElement>) => void;
    onPointerUp: (e: ReactPointer<HTMLElement>) => void;
    onPointerCancel: (e: ReactPointer<HTMLElement>) => void;
  };
}) {
  const { place, slot, pins, noted, touched, setPlace, pin, goSlot, makeReal, grab } = props;
  const trip = tripOf(place);
  const here = pins.find((p) => p.slot === slot);
  const isPinned = here?.place === place;
  const moment = momentOf(place, slot);
  const hint = touched
    ? "Tap a silhouette to change places."
    : noted
      ? "That's your actual time of day. Now drag the sun."
      : "Drag the sun across the sky.";
  return (
    <section className="hero" {...grab} aria-label="Plan a day by moving the sun">
      <Footage trip={trip} />
      <header className="top">
        <span className="brand">{BRAND.name}</span>
        <span className="clock" data-clock aria-hidden="true">
          17:24
        </span>
        <a className="top-link" href={`tel:${contact.phoneE164}`}>
          {contact.phoneDisplay}
        </a>
      </header>
      <div className="say">
        <p className="kicker">
          <em>{trip.name}</em>, {slotName(slot).toLowerCase()}
        </p>
        <div aria-live={touched ? "polite" : "off"} className="say-line">
          <Words key={`${place}-${slot}`} as="h1" text={moment.line} className="big" />
        </div>
        <div className="say-do">
          <button
            type="button"
            className={`want${isPinned ? " want-on" : ""}`}
            aria-pressed={isPinned}
            onClick={(e) => pin(e.currentTarget)}
          >
            <i className="want-sun" />
            {isPinned ? "On your day. Take it off?" : here ? "I'd rather do that" : "I'd do that"}
          </button>
          <p className="hint" key={hint}>
            {hint}
          </p>
        </div>
      </div>
      <div className="horizon">
        <svg className="hills" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 40V26Q120 12 260 22T560 18T860 24T1200 16V40Z" fill="currentColor" />
        </svg>
        <ul className="places" aria-label="Six places, east to west">
          {ORDER.map(({ slug, short }) => {
            const n = pins.filter((p) => p.place === slug).length;
            return (
              <li key={slug}>
                <button
                  type="button"
                  className={`place${place === slug ? " place-on" : ""}`}
                  aria-pressed={place === slug}
                  onClick={() => setPlace(slug)}
                >
                  <span className="place-dots" aria-hidden="true">
                    {Array.from({ length: n }, (_, i) => (
                      <i key={i} />
                    ))}
                  </span>
                  <Silhouette slug={slug} className="place-sil" />
                  <span className="place-name">{short}</span>
                  {n > 0 && <span className="sr">, {n} pinned</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="ground">
        <Timeline pins={pins} slot={slot} go={goSlot} />
        <div className="ground-end">
          {pins.length > 0 ? (
            <button
              key={pins.length === 1 ? "one" : "more"}
              type="button"
              className="real"
              onClick={makeReal}
            >
              Make it a real trip
            </button>
          ) : (
            <p className="ground-note">Pin a moment and it lands on the line above.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function TripView({
  plan,
  fav,
  setFav,
  back,
  formRef,
}: {
  plan: Plan;
  fav: Pin;
  setFav: (p: Pin) => void;
  back: () => void;
  formRef: React.RefObject<HTMLElement | null>;
}) {
  const two = plan.trips.length > 1;
  const summary = `${plan.title}, ${plan.nights} nights, built from my perfect day`;
  return (
    <>
      <section className="open">
        <Footage trip={tripOf(fav.place)} />
        <header className="top">
          <span className="brand">{BRAND.name}</span>
          <span className="clock" data-clock aria-hidden="true">
            17:24
          </span>
          <button type="button" className="top-link top-back" onClick={back}>
            Back to the sky
          </button>
        </header>
        <div className="open-in">
          <p className="kicker">{plan.reason}</p>
          <Words as="h1" text={plan.title} className="huge" />
          <p className="facts">
            <span>
              <b>{plan.nights}</b> nights
            </span>
            <span>
              <b>{price(plan.price)}</b>
            </span>
            <small>
              {SAMPLE}.{two ? " The hop between the two gets worked out in your quote." : ""}
            </small>
          </p>
          <div key={`${fav.place}-${fav.slot}`} className="fav">
            <span className="fav-time">{clockAt(fav.hour)}</span>
            <p>{momentOf(fav.place, fav.slot).line}</p>
          </div>
          <ul className="chips" aria-label="Your moments. Tap one and the sky goes there.">
            {plan.kept.map((p) => (
              <li key={p.slot}>
                <button
                  type="button"
                  className={`chip chip-flat${p === fav ? " chip-now" : ""}`}
                  style={chipStyle(p.hour)}
                  aria-pressed={p === fav}
                  onClick={() => setFav(p)}
                >
                  <span className="chip-time">{clockAt(p.hour)}</span>
                  <span className="chip-name">{momentOf(p.place, p.slot).chip}</span>
                </button>
              </li>
            ))}
          </ul>
          {plan.left.length > 0 && (
            <p className="left">
              Saved for next time:{" "}
              {plan.left.map((p) => momentOf(p.place, p.slot).chip.toLowerCase()).join(", ")}.
            </p>
          )}
        </div>
      </section>

      <section className="days" aria-label="Itinerary">
        <p className="dusk-note">
          {fav.hour >= 18.9
            ? "Already dark, and no rush. Keep scrolling and we'll talk price."
            : "Keep scrolling. The sun goes down, and then we talk price."}
        </p>
        {plan.trips.map((t, ti) => {
          const days = two && ti === 0 ? t.days.slice(0, -1) : t.days;
          return (
            <div key={t.slug} className="trip">
              {ti > 0 && t.slug !== "mauritius" && <LazyClip trip={t} />}
              <Silhouette slug={t.slug} className="trip-sil" />
              <Words as="h2" text={t.tagline} className="trip-tag" />
              <p className="trip-intro">{t.intro}</p>
              <p className="trip-data">
                {t.nights} nights · {price(t.price)} sample, per person sharing · {t.flight}
              </p>
              <ol className="day-list">
                {days.map(([head, body], i) => (
                  <li key={head} className="day">
                    <span className="day-n">{pad(i + 1)}</span>
                    <h3>{head}</h3>
                    <p>{body}</p>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </section>

      <section className="night" ref={formRef} aria-label="Ask for your price">
        <div className="night-in">
          <Words
            as="h2"
            text="It's dark now. Good time to talk price."
            className="huge night-head"
          />
          <p className="night-sum">
            {plan.title}: {plan.nights} nights, {price(plan.price)}. <small>{SAMPLE}.</small>
          </p>
          <QuoteForm
            summary={summary}
            button="Ask for my price"
            classes={{
              form: "form",
              field: "field",
              label: "field-label",
              input: "field-input",
              button: "real form-go",
              done: "done",
              note: "done-note",
            }}
          />
        </div>
        <div className="night-land" aria-hidden="true">
          {plan.trips.map((t) => (
            <Silhouette key={t.slug} slug={t.slug} className="night-sil" />
          ))}
        </div>
      </section>
    </>
  );
}

/** Under the horizon: every trip at this very hour, and how to reach a person. */
function Below({ slot, open }: { slot: number; open: (slug: string) => void }) {
  return (
    <section className="below" aria-label="All six trips">
      <div className="below-head">
        <h2 className="below-title">
          At <span data-clock>17:24</span>, you could also be doing this.
        </h2>
        <p className="below-note">Six holidays, east to west. {SAMPLE}.</p>
      </div>
      <ul className="rows">
        {ORDER.map(({ slug }) => {
          const t = TRIPS.find((x) => x.slug === slug) as ConceptTrip;
          return (
            <li key={slug}>
              <button type="button" className="row" onClick={() => open(slug)}>
                <span className="row-pic">
                  <img src={t.poster} alt="" loading="lazy" />
                </span>
                <span className="row-name">{t.name}</span>
                <span key={slot} className="row-line">
                  {momentOf(slug, slot).line}
                </span>
                <span className="row-data">
                  {t.nights} nights · {price(t.price)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <footer className="foot-er">
        <p className="foot-name">{BRAND.name}</p>
        <p className="foot-say">Whatever the hour, tell a real person what you'd do.</p>
        <p className="foot-links">
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <a href={`tel:${contact.phoneE164}`}>{contact.phoneDisplay}</a>
          <a href={contact.whatsapp}>WhatsApp</a>
        </p>
      </footer>
    </section>
  );
}

export function Concept() {
  const rootRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [slot, setSlot] = useState(4);
  const [place, setPlace] = useState("zanzibar");
  const [pins, setPins] = useState<Pin[]>([]);
  const [touched, setTouched] = useState(false);
  const [noted, setNoted] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [fav, setFav] = useState<Pin | null>(null);
  const seq = useRef(0);

  const onSlot = useCallback((s: number) => {
    setSlot(s);
    setNoted(true);
  }, []);
  const sky = useSky(rootRef, onSlot, reduced);
  const skyOf = (): SkyControl => sky.current;

  const touch = useCallback(() => {
    sky.current.drifting = false;
    setTouched(true);
  }, [sky]);

  // Arrow keys move the sun from anywhere on the page, unless somebody's typing.
  useEffect(() => {
    if (plan) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      e.preventDefault();
      touch();
      const c = sky.current;
      c.target = Math.min(
        23,
        Math.max(5, Math.min(c.target, 23) + (e.key === "ArrowLeft" ? -0.5 : 0.5)),
      );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [plan, sky, touch]);

  // In the trip view, scrolling is the clock: from the favourite moment down into the night, where the form waits.
  useEffect(() => {
    if (!plan || !fav) return;
    const c = sky.current;
    c.drifting = false;
    c.gentle = true;
    const onScroll = () => {
      const form = formRef.current;
      const end = form ? Math.max(1, form.offsetTop - window.innerHeight * 0.55) : 1;
      const p = Math.min(
        1,
        Math.max(0, window.scrollY - window.innerHeight * 0.25) /
          Math.max(1, end - window.innerHeight * 0.25),
      );
      c.target = fav.hour + (Math.max(22, fav.hour) - fav.hour) * p ** 1.2;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      c.gentle = false;
    };
  }, [plan, fav, sky]);

  const toTop = () => window.scrollTo({ top: 0, behavior: "auto" });

  const pinHere = (from: HTMLElement) => {
    const c = skyOf();
    const existing = pins.find((p) => p.slot === slot);
    if (existing?.place === place) {
      setPins(pins.filter((p) => p !== existing));
      return;
    }
    const hour = Math.min(23, Math.max(5, c.cur >= 23 ? 23 : c.cur));
    const pin: Pin = { slot, place, hour, seq: ++seq.current };
    setPins([...pins.filter((p) => p.slot !== slot), pin]);
    touch();
    flyDot(from, slot, hour);
  };

  const flyDot = (from: HTMLElement, s: number, hour: number) => {
    const root = rootRef.current;
    const col = root?.querySelector<HTMLElement>(`[data-col="${s}"]`);
    if (!root || !col) return;
    col.parentElement?.scrollTo({
      left: col.offsetLeft - 40,
      behavior: reduced ? "auto" : "smooth",
    });
    if (reduced) return;
    const a = from.getBoundingClientRect();
    const b = col.getBoundingClientRect();
    const dot = document.createElement("i");
    dot.className = "fly";
    dot.style.background = lightAt(hour);
    dot.style.boxShadow = `0 0 30px 8px ${lightAt(hour)}`;
    root.appendChild(dot);
    const x0 = a.left + 18,
      y0 = a.top + a.height / 2,
      x1 = b.left + b.width / 2,
      y1 = b.top + b.height / 2;
    const anim = dot.animate(
      [
        { transform: `translate(${x0}px,${y0}px) scale(.6)`, opacity: 1 },
        {
          transform: `translate(${(x0 + x1) / 2}px,${Math.min(y0, y1) - 70}px) scale(1.3)`,
          opacity: 1,
          offset: 0.45,
        },
        { transform: `translate(${x1}px,${y1}px) scale(.3)`, opacity: 0.2 },
      ],
      { duration: 620, easing: "cubic-bezier(.3,.1,.3,1)" },
    );
    anim.onfinish = () => dot.remove();
  };

  const goSlot = (i: number, pin?: Pin) => {
    touch();
    if (pin) setPlace(pin.place);
    skyOf().target = pin ? pin.hour : SLOTS[i]!.at;
  };

  const makeReal = () => {
    const p = workOut(pins);
    setPlan(p);
    setFav(p.favourite);
    setPlace(p.favourite.place);
    toTop();
  };

  const back = () => {
    setPlan(null);
    setFav(null);
    toTop();
  };

  const openPlace = (slug: string) => {
    setPlace(slug);
    setPlan(null);
    setFav(null);
    touch();
    toTop();
  };

  const drag = useRef<{ id: number; x: number; live: boolean } | null>(null);
  const grab = useMemo(() => {
    const setX = (x: number) => {
      sky.current.target = xToHour(x, window.innerWidth);
    };
    const end = () => {
      drag.current = null;
      rootRef.current?.removeAttribute("data-held");
    };
    return {
      onPointerDown: (e: ReactPointer<HTMLElement>) => {
        if ((e.target as HTMLElement).closest("button, a, input, label")) return;
        if (e.button !== 0) return;
        const mouse = e.pointerType === "mouse";
        drag.current = { id: e.pointerId, x: e.clientX, live: mouse };
        if (mouse) {
          e.currentTarget.setPointerCapture(e.pointerId);
          touch();
          setX(e.clientX);
          rootRef.current?.setAttribute("data-held", "true");
        }
      },
      onPointerMove: (e: ReactPointer<HTMLElement>) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        // On a touch screen, only a sideways move grabs the sun, so scrolling the page never throws it across the sky.
        if (!d.live && Math.abs(e.clientX - d.x) > 6) {
          d.live = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          touch();
          rootRef.current?.setAttribute("data-held", "true");
        }
        if (d.live) setX(e.clientX);
      },
      onPointerUp: (e: ReactPointer<HTMLElement>) => {
        const d = drag.current;
        if (d && !d.live) {
          touch();
          setX(e.clientX);
        }
        end();
      },
      onPointerCancel: end,
    };
  }, [sky, touch]);

  const sliderKey = (e: ReactKey<HTMLElement>) => {
    if (e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    touch();
    skyOf().target = e.key === "Home" ? 5 : 23;
  };

  return (
    <main ref={rootRef} className={`c-chase-the-sun${plan ? " is-trip" : ""}`}>
      <div className="sky" aria-hidden="true">
        <canvas data-sky className="sky-canvas" />
        <canvas data-stars className="sky-stars" />
        <svg className="arc">
          <path data-sun-arc />
          <path data-moon-arc />
        </svg>
      </div>
      <div className="bodies">
        <div
          data-sun
          className="sun"
          role="slider"
          tabIndex={plan ? -1 : 0}
          aria-label="Time of day. Left and right arrow keys move the sun."
          aria-valuemin={5}
          aria-valuemax={23}
          aria-valuenow={17.4}
          aria-valuetext="17:24, golden"
          onKeyDown={sliderKey}
        >
          <i className="sun-halo" />
          <i className="sun-disc" />
          {!touched && !plan && <i className="sun-ring" />}
        </div>
        <div data-moon className="moon" aria-hidden="true">
          <i className="moon-halo" />
          <i className="moon-disc" />
        </div>
      </div>
      <div className="page">
        {plan && fav ? (
          <TripView plan={plan} fav={fav} setFav={setFav} back={back} formRef={formRef} />
        ) : (
          <Hero
            place={place}
            slot={slot}
            pins={pins}
            noted={noted}
            touched={touched}
            setPlace={setPlace}
            pin={pinHere}
            goSlot={goSlot}
            makeReal={makeReal}
            grab={grab}
          />
        )}
        <Below slot={slot} open={openPlace} />
      </div>
    </main>
  );
}
