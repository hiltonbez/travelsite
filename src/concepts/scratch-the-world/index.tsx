// Scratch the World: the whole first screen is foil over moving footage. Where the first scratch lands picks the place,
// six stubs hide the other trips, and a three-panel ticket ends in claiming the deal. Nobody ever loses: every panel hides
// a real trip. The scratching itself lives in foil.ts, what's printed on the foil in ink.ts.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BRAND, Clip, QuoteForm, TRIPS, contact, rand, type ConceptTrip } from "@/concepts/kit";
import { Foil, flecks, sound, type FoilOptions, type Tone } from "./foil";
import { heroInk, panelInk, windowInk, zoneGrid } from "./ink";

export const FONTS = "family=Rubik+Mono+One&family=Barlow+Condensed:wght@500;600;700";

/** Each trip's ticket details. Perks are invented for the sample and marked as such wherever they're shown. */
type Extra = { code: string; big: string; serial: string; perk: string; tagline?: string };
const EXTRA: Record<string, Extra> = {
  mauritius: {
    code: "MRU",
    big: "MAURITIUS",
    serial: "004 2117",
    perk: "Airport transfers included",
    tagline: "Warm lagoons and long lunches.",
  },
  zanzibar: {
    code: "ZNZ",
    big: "ZANZIBAR",
    serial: "004 2118",
    perk: "A spice farm morning on us",
  },
  "victoria-falls": {
    code: "VFA",
    big: "VIC FALLS",
    serial: "004 2119",
    perk: "Sunset river cruise thrown in",
  },
  kruger: { code: "MQP", big: "KRUGER", serial: "004 2120", perk: "One extra game drive" },
  "cape-town": {
    code: "CPT",
    big: "CAPE TOWN",
    serial: "004 2121",
    perk: "Winelands tasting for two",
  },
  santorini: { code: "JTR", big: "SANTORINI", serial: "004 2122", perk: "A caldera sunset sail" },
};
const info = (t: ConceptTrip) => EXTRA[t.slug] as Extra;
const CODES = TRIPS.map((t) => info(t).code);
const tagline = (t: ConceptTrip) => info(t).tagline ?? t.tagline;
const MARQUEE =
  "EVERY TICKET IS A REAL HOLIDAY • NOBODY LOSES • SCRATCH ANYWHERE • NO DRAW, NO ODDS, JUST TRIPS • ";
const reachOut = { tel: `tel:${contact.phoneE164}`, mail: `mailto:${contact.email}` };

function scrollToId(id: string) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => setInView(es.at(-1)?.isIntersecting ?? false));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

/** One foil surface. Remount it with a new key for a fresh coat. */
function FoilCanvas({
  peel,
  className,
  ...options
}: Omit<FoilOptions, "ink"> & {
  ink: FoilOptions["ink"];
  peel?: boolean | undefined;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Foil | null>(null);
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });
  useEffect(() => {
    if (!canvas.current) return;
    const o = latest.current;
    const f = new Foil(canvas.current, {
      ...o,
      onReady: () => latest.current.onReady?.(),
      onStart: (x, y) => latest.current.onStart?.(x, y),
      onProgress: (p) => latest.current.onProgress?.(p),
      onClear: () => latest.current.onClear?.(),
      onGone: () => latest.current.onGone?.(),
    });
    engine.current = f;
    return () => {
      f.destroy();
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    if (peel) engine.current?.peel();
  }, [peel]);
  return <canvas ref={canvas} aria-hidden="true" className={className} />;
}

/** A rubber stamp, set on a circle. */
function Stamp({
  top,
  bottom,
  middle,
  className,
}: {
  top: string;
  bottom: string;
  middle: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 160 160" className={`stw-stamp ${className ?? ""}`} aria-hidden="true">
      <defs>
        <path id="stw-arc-top" d="M24 80a56 56 0 0 1 112 0" />
        <path id="stw-arc-bottom" d="M16 80a64 64 0 0 0 128 0" />
      </defs>
      <circle cx="80" cy="80" r="74" fill="none" stroke="currentColor" strokeWidth="5" />
      <circle cx="80" cy="80" r="44" fill="none" stroke="currentColor" strokeWidth="2" />
      <text className="stw-stamp-arc">
        <textPath href="#stw-arc-top" startOffset="50%" textAnchor="middle">
          {top}
        </textPath>
      </text>
      <text className="stw-stamp-arc">
        <textPath href="#stw-arc-bottom" startOffset="50%" textAnchor="middle">
          {bottom}
        </textPath>
      </text>
      <text x="80" y="90" textAnchor="middle" className="stw-stamp-mid">
        {middle}
      </text>
    </svg>
  );
}

/** Interlaced lines drawn once, with coordinates rounded so server and browser print the same thing. */
function guilloche(width: number, height: number, lines: number, cycles: number) {
  const paths: string[] = [];
  for (let k = 0; k < lines; k++) {
    let d = "";
    for (let x = 0; x <= width; x += 8) {
      const y =
        height / 2 +
        Math.sin((x / width) * Math.PI * 2 * cycles + (k * Math.PI) / lines) *
          (height / 2 - 2) *
          Math.sin((x / width) * Math.PI * 3 + k * 0.4 + 0.7);
      d += `${x ? "L" : "M"}${x} ${y.toFixed(1)}`;
    }
    paths.push(d);
  }
  return paths;
}
const BAND = guilloche(1200, 60, 9, 14);

function Band({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 60"
      preserveAspectRatio="none"
      className={`stw-band ${className ?? ""}`}
      aria-hidden="true"
    >
      {BAND.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

function Marquee() {
  return (
    <div className="stw-marquee" aria-hidden="true">
      <div className="stw-marquee-run">
        <span>
          {MARQUEE}
          {MARQUEE}
        </span>
        <span>
          {MARQUEE}
          {MARQUEE}
        </span>
      </div>
    </div>
  );
}

function Hero({ onLand, onBrowse }: { onLand: (t: ConceptTrip) => void; onBrowse: () => void }) {
  const [coat, setCoat] = useState(0);
  const [trip, setTrip] = useState<ConceptTrip | null>(null);
  const [ready, setReady] = useState(false);
  const [peel, setPeel] = useState(false);
  const [clear, setClear] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [ref, inView] = useInView<HTMLElement>();
  const tripRef = useRef<ConceptTrip | null>(null);
  const lastPlace = useRef(-1);

  const pick = (t: ConceptTrip) => {
    tripRef.current = t;
    setTrip(t);
  };
  const peelNow = (t?: ConceptTrip) => {
    if (t) pick(t);
    else if (!tripRef.current) {
      // A different place from last time, whenever the button is the route.
      let n = Math.floor(Math.random() * TRIPS.length);
      if (n === lastPlace.current) n = (n + 1) % TRIPS.length;
      pick(TRIPS[n] as ConceptTrip);
    }
    setPeel(true);
  };
  const newCoat = () => {
    if (tripRef.current) lastPlace.current = TRIPS.indexOf(tripRef.current);
    tripRef.current = null;
    setTrip(null);
    setPeel(false);
    setClear(false);
    setCoat((c) => c + 1);
    window.scrollTo({ top: 0 });
  };
  const toggleSound = () => {
    const next = !soundOn;
    sound.setOn(next);
    setSoundOn(next);
  };

  return (
    <section ref={ref} className={`stw-hero ${ready ? "is-ready" : ""} ${clear ? "is-clear" : ""}`}>
      <div className="stw-hero-under">
        {trip && (
          <>
            <Clip
              src={trip.video}
              poster={trip.poster}
              className="stw-hero-clip"
              paused={!inView}
            />
            <div className="stw-hero-shade" />
            <p
              className="stw-land"
              style={{ "--n": info(trip).big.length } as React.CSSProperties}
              aria-hidden="true"
            >
              {[...info(trip).big].map((ch, i) => (
                <span key={i} style={{ "--i": i } as React.CSSProperties}>
                  {ch === " " ? " " : ch}
                </span>
              ))}
            </p>
          </>
        )}
      </div>

      <FoilCanvas
        key={coat}
        className="stw-foil stw-foil-hero"
        ink={heroInk(CODES, "TICKET No. 004 2117")}
        brush={
          typeof window === "undefined" ? 44 : Math.max(42, Math.min(84, window.innerWidth * 0.06))
        }
        cols={36}
        dprCap={1.5}
        threshold={0.55}
        peel={peel}
        onReady={() => setReady(true)}
        onStart={(fx, fy) => {
          if (tripRef.current) return;
          const { cols, rows } = zoneGrid(window.innerWidth, window.innerHeight);
          const zone =
            Math.min(rows - 1, Math.floor(fy * rows)) * cols +
            Math.min(cols - 1, Math.floor(fx * cols));
          pick(TRIPS[zone] as ConceptTrip);
        }}
        onClear={() => {
          setClear(true);
          if (tripRef.current) onLand(tripRef.current);
        }}
      />

      {/* Before the canvas paints, and for anyone without one. */}
      <div className="stw-hero-print">
        <h1>Scratch anywhere</h1>
        <p>
          Drag across the foil. Where you start decides where you land. Every ticket is a real
          holiday, and nobody loses.
        </p>
      </div>

      <header className="stw-mast">
        <p className="stw-brand">
          <b>{BRAND.name}</b> <span>{BRAND.tagline}</span>
        </p>
        <div className="stw-mast-right">
          <button type="button" className="stw-chip" aria-pressed={soundOn} onClick={toggleSound}>
            Sound {soundOn ? "on" : "off"}
          </button>
          <a className="stw-chip" href={reachOut.tel}>
            {contact.phoneDisplay}
          </a>
        </div>
      </header>

      {!trip && (
        <div
          className="stw-zones"
          role="group"
          aria-label="Pick a zone to peel. Each hides a different holiday."
        >
          {CODES.map((code, i) => (
            <button
              key={code}
              type="button"
              onClick={() => peelNow(TRIPS[i])}
              aria-label={`Peel zone ${code}`}
            >
              {code}
            </button>
          ))}
        </div>
      )}

      {!clear && (
        <div className="stw-hero-actions">
          <button
            type="button"
            className="stw-btn stw-btn-red"
            onClick={() => peelNow()}
            aria-label="Peel it all: take the whole foil off and show my place"
          >
            Peel it all
          </button>
          <button type="button" className="stw-btn stw-btn-paper" onClick={onBrowse}>
            See all six trips
          </button>
        </div>
      )}

      {clear && trip && (
        <aside className="stw-result" aria-live="polite">
          <Band className="stw-result-band" />
          <p className="stw-kicker">
            You landed on <span>Zone {info(trip).code}</span>
          </p>
          <h2>{trip.name}</h2>
          <p className="stw-result-line">{tagline(trip)}</p>
          <dl className="stw-facts">
            <div>
              <dt>Nights</dt>
              <dd>{trip.nights}</dd>
            </div>
            <div>
              <dt>Flight</dt>
              <dd>{trip.flight}</dd>
            </div>
            <div className="stw-facts-price">
              <dt>From</dt>
              <dd>{rand(trip.price)}</dd>
            </div>
          </dl>
          <p className="stw-small">Sample price, per person sharing.</p>
          <div className="stw-result-actions">
            <button
              type="button"
              className="stw-btn stw-btn-red"
              onClick={() => scrollToId("stw-ticket")}
            >
              Claim this one
            </button>
            <button type="button" className="stw-btn stw-btn-line" onClick={newCoat}>
              New foil, new place
            </button>
          </div>
          <Stamp
            className="stw-result-stamp"
            top="REAL HOLIDAY"
            bottom="NOBODY LOSES"
            middle={info(trip).code}
          />
        </aside>
      )}
    </section>
  );
}

function Stub({
  trip,
  index,
  peel,
  done,
  active,
  chosen,
  playing,
  onActive,
  onDone,
  onPeel,
  onChoose,
}: {
  trip: ConceptTrip;
  index: number;
  peel: boolean;
  done: boolean;
  active: boolean;
  chosen: boolean;
  playing: boolean;
  onActive: () => void;
  onDone: () => void;
  onPeel: () => void;
  onChoose: () => void;
}) {
  const x = info(trip);
  const tone: Tone = index % 2 ? "silver" : "gold";
  return (
    <li className={`stw-stub ${chosen ? "is-chosen" : ""} ${done ? "is-done" : ""}`}>
      <p className="stw-stub-serial">
        <span>No. {x.serial}</span>
        <span>{x.code}</span>
      </p>
      <div
        className="stw-window"
        onPointerEnter={() => {
          if (done) onActive();
        }}
        onClick={() => {
          if (done) onActive();
        }}
      >
        <img src={trip.poster} alt="" loading="lazy" className="stw-window-media" />
        {active && (
          <Clip
            src={trip.video}
            poster={trip.poster}
            className="stw-window-media"
            paused={!playing}
          />
        )}
        <div className="stw-window-price">
          <b>{rand(trip.price)}</b>
          <span>sample, per person sharing</span>
        </div>
        <FoilCanvas
          className="stw-foil"
          tone={tone}
          ink={panelInk(x.code, `No. ${x.serial}`)}
          brush={24}
          cols={14}
          threshold={0.5}
          peel={peel}
          onStart={onActive}
          onClear={onDone}
        />
      </div>
      <h3>{trip.name}</h3>
      <p className="stw-stub-line">{tagline(trip)}</p>
      <p className="stw-stub-meta">
        {trip.nights} nights &middot; {trip.flight}
      </p>
      {done ? (
        <button
          type="button"
          className="stw-btn stw-btn-small stw-btn-red"
          onFocus={onActive}
          onClick={onChoose}
          aria-pressed={chosen}
        >
          {chosen ? "On your ticket" : "Put on my ticket"}
        </button>
      ) : (
        <button
          type="button"
          className="stw-btn stw-btn-small stw-btn-line"
          onClick={onPeel}
          aria-label={`Peel the foil off ${trip.name}`}
        >
          Peel
        </button>
      )}
    </li>
  );
}

function Strip({ chosen, onChoose }: { chosen: ConceptTrip; onChoose: (t: ConceptTrip) => void }) {
  const [peel, setPeel] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<string | null>(null);
  const [ref, inView] = useInView<HTMLElement>();
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const peelAll = () => {
    TRIPS.forEach((t, i) => {
      timers.current.push(
        window.setTimeout(() => setPeel((p) => ({ ...p, [t.slug]: true })), i * 130),
      );
    });
  };
  const left = TRIPS.filter((t) => !done[t.slug]).length;

  return (
    <section ref={ref} id="stw-trips" className="stw-strip">
      <div className="stw-strip-head">
        <h2>
          <span>Six more</span> <span>under the foil</span>
        </h2>
        <div className="stw-strip-side">
          <p>
            One stub for each trip we'd send you on. Scratch for the footage and the price. On a
            phone, scratch side to side so the page can still scroll.
          </p>
          {left > 0 ? (
            <button
              type="button"
              className="stw-btn stw-btn-paper"
              onClick={peelAll}
              aria-label="Peel it all: take the foil off all six trips"
            >
              Peel it all
            </button>
          ) : (
            <p className="stw-strip-all">All six showing. Pick one for your ticket.</p>
          )}
        </div>
      </div>
      <ol className="stw-stubs">
        {TRIPS.map((t, i) => (
          <Stub
            key={t.slug}
            trip={t}
            index={i}
            peel={!!peel[t.slug]}
            done={!!done[t.slug]}
            active={active === t.slug}
            chosen={chosen.slug === t.slug}
            playing={inView}
            onActive={() => setActive(t.slug)}
            onDone={() => {
              setDone((d) => ({ ...d, [t.slug]: true }));
              setActive(t.slug);
            }}
            onPeel={() => setPeel((p) => ({ ...p, [t.slug]: true }))}
            onChoose={() => {
              onChoose(t);
              scrollToId("stw-ticket");
            }}
          />
        ))}
      </ol>
    </section>
  );
}

function Pane({
  word,
  tone,
  peel,
  onDone,
  code,
  className,
  children,
}: {
  word: string;
  tone: Tone;
  peel?: boolean | undefined;
  onDone: () => void;
  code: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className={`stw-pane ${className}`}>
      <div className="stw-pane-under">
        <span className="stw-pane-code">{code}</span>
        {children}
      </div>
      <FoilCanvas
        className="stw-foil"
        tone={tone}
        ink={windowInk(word)}
        brush={28}
        cols={16}
        threshold={0.5}
        peel={peel}
        onClear={onDone}
      />
    </div>
  );
}

function Ticket({ trip, onSwap }: { trip: ConceptTrip; onSwap: (t: ConceptTrip) => void }) {
  const [peel, setPeel] = useState([false, false, false]);
  const [done, setDone] = useState([false, false, false]);
  const [ref, inView] = useInView<HTMLElement>();
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const x = info(trip);
  const count = done.filter(Boolean).length;
  const matched = count === 3;
  const mark = (n: number) => setDone((d) => d.map((v, i) => (i === n ? true : v)));
  const peelAll = () => {
    [0, 1, 2].forEach((n) => {
      timers.current.push(
        window.setTimeout(() => setPeel((p) => p.map((v, i) => (i === n ? true : v))), n * 200),
      );
    });
  };

  return (
    <section ref={ref} id="stw-ticket" className="stw-claim">
      <Clip src={trip.video} poster={trip.poster} className="stw-claim-clip" paused={!inView} />
      <div className="stw-claim-shade" />
      <div className="stw-claim-head">
        <p className="stw-kicker stw-kicker-light">Your ticket</p>
        <h2 className="stw-claim-name" key={trip.slug}>
          {[...trip.name].map((ch, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties}>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </h2>
        <div className="stw-swap" role="group" aria-label="Change the trip on this ticket">
          {TRIPS.map((t) => (
            <button
              key={t.slug}
              type="button"
              aria-pressed={t.slug === trip.slug}
              aria-label={`Put ${t.name} on this ticket`}
              onClick={() => onSwap(t)}
            >
              {info(t).code}
            </button>
          ))}
        </div>
      </div>

      <div className={`stw-ticket ${matched ? "is-matched" : ""}`}>
        <div className="stw-ticket-top">
          <div>
            <h3>Match three, claim one</h3>
            <p>
              Scratch all three. They'll all say {x.code}, because this ticket only goes one way: on
              holiday.
            </p>
          </div>
          <p className="stw-ticket-serial">
            No. {x.code} {x.serial}
          </p>
        </div>
        <Band className="stw-ticket-band" />

        <div className="stw-panes">
          <Pane
            word="NIGHTS"
            tone="gold"
            code={x.code}
            peel={peel[0]}
            onDone={() => mark(0)}
            className={`stw-pane-a ${done[0] ? "is-done" : ""}`}
          >
            <b className="stw-pane-big">{trip.nights}</b>
            <span>nights in {trip.name}</span>
          </Pane>
          <Pane
            word="BONUS"
            tone="silver"
            code={x.code}
            peel={peel[1]}
            onDone={() => mark(1)}
            className={`stw-pane-b ${done[1] ? "is-done" : ""}`}
          >
            <b className="stw-pane-perk">{x.perk}</b>
            <span>sample perk, for show only</span>
          </Pane>
          <Pane
            word="PRICE"
            tone="gold"
            code={x.code}
            peel={peel[2]}
            onDone={() => mark(2)}
            className={`stw-pane-c ${done[2] ? "is-done" : ""}`}
          >
            <b className="stw-pane-price">{rand(trip.price)}</b>
            <span>sample price, per person sharing</span>
          </Pane>
        </div>

        <div className="stw-ticket-status" aria-live="polite">
          {matched ? (
            <p>
              <b>Three for three.</b> It was always going to be. Claim it below and a real person
              prices it.
            </p>
          ) : (
            <>
              <p>
                <b>{count} of 3</b> scratched. There's no losing panel on this ticket.
              </p>
              <button
                type="button"
                className="stw-btn stw-btn-small stw-btn-line"
                onClick={peelAll}
                aria-label="Peel it all: take the foil off all three panels"
              >
                Peel it all
              </button>
            </>
          )}
        </div>

        <div className="stw-perf" aria-hidden="true" />

        <div className="stw-ticket-back">
          <div className="stw-days">
            <h3>What the ticket gets you</h3>
            <ol>
              {trip.days.map(([title, text], i) => (
                <li key={title + i} style={{ "--i": i } as React.CSSProperties}>
                  <b>{title}</b>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="stw-form-wrap">
            <h3>Claim it</h3>
            <p className="stw-form-lead">
              {trip.nights} nights, {trip.name}. From {rand(trip.price)}, a sample price per person
              sharing. Tell us who to send the real one to.
            </p>
            <QuoteForm
              summary={`${trip.nights} nights in ${trip.name}, with the bonus perk`}
              button="Claim my price"
              classes={{
                form: "stw-form",
                field: "stw-field",
                label: "stw-label",
                input: "stw-input",
                button: "stw-btn stw-btn-red stw-btn-claim",
                done: "stw-done",
                note: "stw-small",
              }}
            >
              <label className="stw-field">
                <span className="stw-label">Roughly when? (optional)</span>
                <input name="when" className="stw-input" />
              </label>
            </QuoteForm>
          </div>
          <Stamp
            className="stw-ticket-stamp"
            top="THREE FOR THREE"
            bottom="READY TO CLAIM"
            middle={x.code}
          />
        </div>
      </div>
    </section>
  );
}

function Conditions() {
  return (
    <footer className="stw-foot">
      <Band className="stw-foot-band" />
      <div className="stw-foot-grid">
        <div>
          <p className="stw-foot-brand">{BRAND.name}</p>
          <p className="stw-foot-tag">{BRAND.tagline}. Real people, real trips, foil optional.</p>
          <ul className="stw-reach">
            <li>
              <a href={reachOut.tel}>{contact.phoneDisplay}</a>
            </li>
            <li>
              <a href={contact.whatsapp}>WhatsApp us</a>
            </li>
            <li>
              <a href={reachOut.mail}>{contact.email}</a>
            </li>
          </ul>
        </div>
        <div>
          <h2>Conditions of this ticket</h2>
          <ol className="stw-terms">
            <li>There's no losing panel. Every foil hides a real holiday.</li>
            <li>This isn't a draw, a lottery or a competition. You pick, we price.</li>
            <li>
              Prices are samples, per person sharing. Bonus perks are samples too. Your consultant
              confirms the real ones.
            </li>
            <li>Fingernails, fingers, mice and coins are all accepted.</li>
          </ol>
          <button
            type="button"
            className="stw-btn stw-btn-paper"
            onClick={() => scrollToId("stw-trips")}
          >
            Back to the six trips
          </button>
        </div>
      </div>
    </footer>
  );
}

export function Concept() {
  const [chosen, setChosen] = useState<ConceptTrip>(TRIPS[1] as ConceptTrip);
  const flecksRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!flecksRef.current) return;
    flecks.attach(flecksRef.current);
    return () => {
      flecks.detach();
      sound.setOn(false);
    };
  }, []);
  return (
    <main className="c-scratch-the-world">
      <canvas ref={flecksRef} className="stw-flecks" aria-hidden="true" />
      <Hero onLand={setChosen} onBrowse={() => scrollToId("stw-trips")} />
      <Marquee />
      <Strip chosen={chosen} onChoose={setChosen} />
      <Marquee />
      <Ticket key={chosen.slug} trip={chosen} onSwap={setChosen} />
      <Conditions />
    </main>
  );
}
