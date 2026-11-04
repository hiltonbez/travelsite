// The Pop-Up Book: a cloth-bound storybook that opens with the traveller's name on the cover. Every spread turns in 3D,
// a paper scene stands up from the fold, and the choices write the last page: a real trip, as story chapters, with a
// price and a note to slip into the book's pocket. The art is in scenes.tsx, the words in story.ts.
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
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
import { PaperFilters, SCENES } from "./scenes";
import {
  cap,
  CHAPTERS,
  END,
  recap,
  storyTrip,
  type Chapter,
  type Choice,
  type Picks,
} from "./story";

export const FONTS = "family=Gloock&family=Young+Serif&family=Gaegu:wght@400;700";

type Phase = "closed" | "opening" | "idle" | "folding" | "turning";
type Turn = { from: number; to: number };

const FOLD_MS = 380;
const TURN_MS = 1050;
const STRIPS = 5;

const tripOf = (slug: string) => TRIPS.find((t) => t.slug === slug) ?? (TRIPS[0] as ConceptTrip);
const sceneOf = (slug: string) => SCENES[slug] as NonNullable<(typeof SCENES)[string]>;

/* ------------------------------------------------------------------ small pieces */

/** Words that ink themselves onto the page one after another. */
function Ink({ text, live, start = 0 }: { text: string; live: boolean; start?: number }) {
  if (!live) return <>{text}</>;
  return (
    <>
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          <span className="pb-w" style={{ "--d": `${start + i * 26}ms` } as CSSProperties}>
            {w}
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

/** The round magic window: the real footage, behind a paper ring. Tap it to lean in. */
function Porthole({
  trip,
  x,
  y,
  d,
  playing,
}: {
  trip: ConceptTrip;
  x: number;
  y: number;
  d: number;
  playing: boolean;
}) {
  const [near, setNear] = useState(false);
  const style = {
    left: `calc(var(--u) * ${x})`,
    top: `calc(var(--u) * ${y})`,
    width: `calc(var(--u) * ${d})`,
    height: `calc(var(--u) * ${d})`,
  };
  return (
    <button
      type="button"
      className="pb-port"
      style={style}
      aria-pressed={near}
      aria-label={
        near
          ? `Lean back from the window onto ${trip.name}`
          : `Look closer through the window onto ${trip.name}`
      }
      onClick={() => setNear((n) => !n)}
    >
      <span className="pb-port-glass">
        <img src={trip.poster} alt="" />
        {playing && <Clip src={trip.video} poster={trip.poster} className="pb-port-clip" />}
      </span>
      <svg viewBox="0 0 200 200" className="pb-port-ring" aria-hidden="true" focusable="false">
        <g filter="url(#pb-grain)">
          <g filter="url(#pb-drop)">
            <path
              fillRule="evenodd"
              fill="#27306b"
              d="M100 2A98 98 0 1 0 100 198A98 98 0 1 0 100 2ZM100 20A80 80 0 1 1 100 180A80 80 0 1 1 100 20Z"
            />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
              <circle
                key={r}
                cx="100"
                cy="11"
                r="4"
                fill="#e3a32f"
                transform={`rotate(${r} 100 100)`}
              />
            ))}
          </g>
        </g>
      </svg>
    </button>
  );
}

/** A pull-tab at the page edge. It's a real range input, so arrow keys and screen readers work. It springs back when let go. */
function PullTab({
  label,
  stage,
  reduced,
}: {
  label: string;
  stage: RefObject<HTMLDivElement | null>;
  reduced: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const raf = useRef(0);
  const [touched, setTouched] = useState(false);

  const put = useCallback(
    (v: number) => {
      stage.current?.style.setProperty("--p", v.toFixed(3));
      stage.current?.style.setProperty("--w", Math.sin(v * Math.PI * 6).toFixed(3));
    },
    [stage],
  );

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const letGo = () => {
    const el = input.current;
    if (!el || reduced) return;
    let x = Number(el.value) / 100;
    let v = 0;
    let last = performance.now();
    cancelAnimationFrame(raf.current);
    const step = (now: number) => {
      const dt = Math.min(0.03, (now - last) / 1000);
      last = now;
      v += (-46 * x - 6.5 * v) * dt;
      x += v * dt;
      put(x);
      el.value = String(Math.max(0, x * 100));
      if (Math.abs(x) > 0.002 || Math.abs(v) > 0.01) raf.current = requestAnimationFrame(step);
      else {
        put(0);
        el.value = "0";
      }
    };
    raf.current = requestAnimationFrame(step);
  };

  return (
    <label className={`pb-pull${touched ? "" : " is-new"}`}>
      <span className="pb-pull-say">{label}</span>
      <input
        ref={input}
        type="range"
        min={0}
        max={100}
        defaultValue={0}
        aria-label={label}
        onInput={(e) => {
          cancelAnimationFrame(raf.current);
          setTouched(true);
          put(Number(e.currentTarget.value) / 100);
        }}
        onPointerUp={letGo}
        onPointerCancel={letGo}
      />
    </label>
  );
}

/** The curling leaf of a page turn: strips hinged to each other so the paper bends as it goes over. */
function Strips({ i, front, back }: { i: number; front: React.ReactNode; back: React.ReactNode }) {
  const inner = (at: number) => ({ left: `${-at * 100}%`, width: `${STRIPS * 100}%` });
  return (
    <div className={i ? "pb-strip pb-strip-n" : "pb-strip"}>
      <div className="pb-face pb-face-f">
        <div className="pb-face-in" style={inner(i)}>
          {front}
        </div>
        <i className="pb-shade" />
      </div>
      <div className="pb-face pb-face-b">
        <div className="pb-face-in" style={inner(STRIPS - 1 - i)}>
          {back}
        </div>
        <i className="pb-shade" />
      </div>
      {i < STRIPS - 1 && <Strips i={i + 1} front={front} back={back} />}
    </div>
  );
}

/* ------------------------------------------------------------------ the page */

export function Concept() {
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("closed");
  const [spread, setSpread] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [picks, setPicks] = useState<Picks>(() => CHAPTERS.map(() => null));
  const [ending, setEnding] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(false);
  const [askTilt, setAskTilt] = useState(false);
  const [tiltOn, setTiltOn] = useState(false);
  const [noted, setNoted] = useState(false);

  const coverRect = useRef<DOMRect | null>(null);
  const coverEl = useRef<HTMLDivElement>(null);
  const perspEl = useRef<HTMLDivElement>(null);
  const bookEl = useRef<HTMLDivElement>(null);
  const stageEl = useRef<HTMLDivElement>(null);
  const leafEl = useRef<HTMLDivElement>(null);
  const rootEl = useRef<HTMLElement>(null);
  const timer = useRef(0);

  const name = typed.trim();
  const shown = name ? cap(name) : "";
  const hero = shown || "our hero";
  const Hero = cap(hero);
  const closed = phase === "closed" || phase === "opening";

  const trip = ending ? tripOf(ending) : storyTrip(picks);
  const lean = picks.some(Boolean) ? storyTrip(picks) : null;
  const sceneSlug = spread === END ? trip.slug : (CHAPTERS[spread] as Chapter).slug;
  const bookTitle = `The Great Adventure of ${shown || "You"}`;

  useEffect(() => {
    const q = window.matchMedia("(max-width: 759px)");
    const on = () => setNarrow(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* The book moves a little with the pointer or the tilt of the phone; the layers' depth does the rest. */
  useEffect(() => {
    if (closed || reduced) return;
    const dor = window.DeviceOrientationEvent as unknown as
      { requestPermission?: () => Promise<string> } | undefined;
    if (dor?.requestPermission && !tiltOn && navigator.maxTouchPoints > 0) setAskTilt(true);
    const tilt = narrow ? 10 : 16;
    let tx = 0,
      ty = 0,
      x = 0,
      y = 0,
      raf = 0;
    const paint = () => {
      x += (tx - x) * 0.09;
      y += (ty - y) * 0.09;
      if (bookEl.current)
        bookEl.current.style.transform = `rotateX(${(tilt - y * 3).toFixed(3)}deg) rotateY(${(x * 5).toFixed(3)}deg)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(paint) : 0;
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      wake();
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 25));
      ty = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
      wake();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onTilt);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [closed, reduced, narrow, tiltOn]);

  /* Opening: the cover lifts off where it lay and swings over onto the left of the book. */
  const open = (start: number) => {
    window.scrollTo({ top: 0 });
    coverRect.current = coverEl.current?.getBoundingClientRect() ?? null;
    setSpread(start);
    setPhase(reduced ? "idle" : "opening");
  };

  useLayoutEffect(() => {
    if (phase !== "opening") return;
    const el = coverEl.current;
    const from = coverRect.current;
    const to = perspEl.current?.getBoundingClientRect();
    if (!el || !from || !to) {
      setPhase("idle");
      return;
    }
    el.style.left = `${from.left}px`;
    el.style.top = `${from.top}px`;
    el.style.width = `${from.width}px`;
    el.style.height = `${from.height}px`;
    const tx = to.left + to.width / 2 - from.left;
    const ty = to.top + to.height / 2 - (from.top + from.height / 2);
    const a = el.animate(
      [
        { transform: "perspective(2000px) translate(0px, 0px) rotateY(0deg) scale(1, 1)" },
        {
          transform: `perspective(2000px) translate(${tx}px, ${ty}px) rotateY(-180deg) scale(${to.width / 2 / from.width}, ${to.height / from.height})`,
        },
      ],
      { duration: 1250, easing: "cubic-bezier(.45,.05,.3,1)", fill: "forwards" },
    );
    a.onfinish = () => setPhase("idle");
    return () => {
      a.onfinish = null;
    };
  }, [phase]);

  /* When a page lands, take the reader's place to the new heading. */
  const landed = useRef(false);
  useEffect(() => {
    if (phase !== "idle") return;
    if (landed.current)
      rootEl.current?.querySelector<HTMLElement>(".pb-title-live")?.focus({ preventScroll: true });
    landed.current = true;
  }, [phase, spread]);

  /* Turning: fold the pop-up flat, swing the leaf over, and let the next scene rise. */
  const go = (to: number) => {
    if (phase !== "idle" || to === spread) return;
    if (narrow) window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    if (reduced) {
      setSpread(to);
      return;
    }
    setPhase("folding");
    timer.current = window.setTimeout(() => {
      setTurn({ from: spread, to });
      setPhase("turning");
    }, FOLD_MS);
  };

  useEffect(() => {
    if (!turn) return;
    const fwd = turn.to > turn.from;
    const start = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / TURN_MS);
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      const leaf = leafEl.current;
      if (leaf) {
        const lift = Math.sin(Math.PI * t);
        leaf.style.transform = `rotateY(${(fwd ? -180 * e : -180 * (1 - e)).toFixed(2)}deg)`;
        leaf.style.setProperty("--bend", `${((fwd ? 1 : -1) * lift * 15).toFixed(2)}deg`);
        leaf.style.setProperty("--shade", lift.toFixed(3));
      }
      if (t < 1) raf = requestAnimationFrame(frame);
      else {
        setSpread(turn.to);
        setTurn(null);
        setPhase("idle");
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [turn]);

  const choose = (i: number, c: Choice) => {
    setPicks((p) => p.map((x, n) => (n === i ? c : x)));
    setEnding(null);
    go(i + 1);
  };

  const again = () => {
    setPicks(CHAPTERS.map(() => null));
    setEnding(null);
    setNoted(false);
    go(0);
  };

  /* ---------------------------------------------------------------- what's printed on a page */

  const leftCopy = (n: number, live: boolean) => {
    if (n === END) {
      return (
        <div className="pb-copy">
          <p className="pb-kicker">The last page</p>
          <h2
            className={live ? "pb-title pb-title-live" : "pb-title"}
            tabIndex={live ? -1 : undefined}
          >
            The End&hellip; or is it?
          </h2>
          <p className="pb-body">
            <Ink
              live={live}
              text={`Of all the places in this book, ${trip.name} is the one ${hero} can't stop thinking about. That was only the story. The real one takes ${trip.nights} nights, and it starts with a note.`}
            />
          </p>
          {live && (
            <button type="button" className="pb-back" onClick={() => go(END - 1)}>
              Back a page
            </button>
          )}
        </div>
      );
    }
    const ch = CHAPTERS[n] as Chapter;
    const opener = n > 0 ? picks[n - 1]?.after : "";
    const line = opener ? `${opener} ${ch.line(hero)}` : ch.line(Hero);
    const t = tripOf(ch.slug);
    return (
      <div className="pb-copy">
        <p className="pb-kicker">{ch.no}</p>
        <h2
          className={live ? "pb-title pb-title-live" : "pb-title"}
          tabIndex={live ? -1 : undefined}
        >
          {ch.title}
        </h2>
        <p className="pb-body">
          <Ink live={live} text={line} />
        </p>
        <div className="pb-foot">
          {live && n > 0 && (
            <button type="button" className="pb-back" onClick={() => go(n - 1)}>
              Back a page
            </button>
          )}
          <p className="pb-tiny">
            This chapter is {t.name}: {t.nights} nights, {rand(t.price)} per person sharing (sample
            price).
          </p>
        </div>
      </div>
    );
  };

  const rightCopy = (n: number, live: boolean) => {
    if (n === END) {
      return (
        <div className="pb-copy pb-copy-r pb-price-page">
          <p className="pb-kicker">Book Two stars {hero} in</p>
          <p className="pb-tripname">{trip.name}</p>
          <p className="pb-tiny">
            {trip.nights} nights. {trip.flight}.
          </p>
          <p className="pb-price">{rand(trip.price)}</p>
          <p className="pb-tiny">Sample price, per person sharing.</p>
          {live && (
            <a className="pb-tag pb-tag-a" href="#pb-chapters">
              <b>Unfold</b> the chapters below
            </a>
          )}
        </div>
      );
    }
    const ch = CHAPTERS[n] as Chapter;
    const chosen = picks[n];
    return (
      <div className="pb-copy pb-copy-r">
        <h3 className="pb-ask">
          <Ink live={live} text={ch.ask(hero)} start={500} />
        </h3>
        <div className="pb-tags">
          {ch.choices.map((c, k) => (
            <button
              type="button"
              key={c.verb}
              className={`pb-tag ${k ? "pb-tag-b" : "pb-tag-a"}${chosen === c ? " is-chosen" : ""}`}
              style={{ "--k": k } as CSSProperties}
              aria-pressed={chosen === c}
              disabled={!live}
              onClick={() => choose(n, c)}
            >
              <b>{c.verb}</b> {c.rest}
            </button>
          ))}
        </div>
        <p className="pb-margin">
          {lean && n > 0 ? <>So far this is turning into a {lean.name} story. </> : null}
          {live ? (
            <button
              type="button"
              className="pb-endhere"
              onClick={() => {
                setEnding(ch.slug);
                go(END);
              }}
            >
              Or end the story here, in {tripOf(ch.slug).name}
            </button>
          ) : null}
        </p>
      </div>
    );
  };

  /** One page: its half of the spread's printed backdrop, and its words. copy: none while a page is still landing. */
  const page = (n: number, side: "l" | "r", copy: "none" | "static" | "live") => {
    const slug = n === END ? trip.slug : (CHAPTERS[n] as Chapter).slug;
    const Print = sceneOf(slug).Print;
    const showCopy = copy !== "none" && !narrow;
    return (
      <div className={`pb-flat pb-flat-${side}`}>
        <div className="pb-print">
          <Print />
        </div>
        {showCopy && (side === "l" ? leftCopy(n, copy === "live") : rightCopy(n, copy === "live"))}
      </div>
    );
  };

  const fwd = turn ? turn.to > turn.from : true;
  const leftN = turn ? (fwd ? turn.from : turn.to) : spread;
  const rightN = turn ? (fwd ? turn.to : turn.from) : spread;
  const leftCopyMode = turn ? (fwd ? "static" : "none") : phase === "idle" ? "live" : "static";
  const rightCopyMode = turn ? (fwd ? "none" : "static") : phase === "idle" ? "live" : "static";
  const Layers = sceneOf(sceneSlug).Layers;
  const showStage = phase === "idle" || phase === "folding";
  const portAt = (x: number, y: number, d: number) => (
    <Porthole
      key={sceneSlug}
      trip={tripOf(sceneSlug)}
      x={x}
      y={y}
      d={d}
      playing={phase === "idle"}
    />
  );
  const pullLabel = CHAPTERS.find((c) => c.slug === sceneSlug)?.pull ?? "";
  const summary = `${bookTitle}: ${trip.name}, ${trip.nights} nights`;

  const contents = (
    <section className="pb-contents" aria-label="Contents: all six holidays">
      <h2>Contents</h2>
      <ol>
        {CHAPTERS.map((c, i) => {
          const t = tripOf(c.slug);
          return (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => (closed ? open(i) : go(i))}
                disabled={phase === "opening"}
              >
                <span className="pb-c-name">{t.name}</span>
                <span className="pb-c-dots" aria-hidden="true" />
                <span className="pb-c-price">{rand(t.price)}</span>
                <span className="pb-c-sub">
                  {c.title}, {t.nights} nights
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="pb-tiny">Sample prices, per person sharing.</p>
    </section>
  );

  const bookplate = (
    <section className="pb-plate" aria-label={`About ${BRAND.name}`}>
      <p className="pb-plate-exl">This book belongs to</p>
      <p className="pb-plate-who">{shown || "whoever opens it"}</p>
      <p className="pb-plate-pub">
        Written, bound and booked by <b>{BRAND.name}</b>
      </p>
      <ul>
        <li>
          <a href={`tel:${contact.phoneE164}`}>Call {contact.phoneDisplay}</a>
        </li>
        <li>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp us
          </a>
        </li>
        <li>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </li>
      </ul>
    </section>
  );

  return (
    <main
      ref={rootEl}
      className={`c-pop-up-book is-${phase}${closed ? " is-shut" : ""}${spread === END ? " is-end" : ""}`}
    >
      <PaperFilters />

      {closed && (
        <div className="pb-cover-spot">
          <div ref={coverEl} className={phase === "opening" ? "pb-cover is-flying" : "pb-cover"}>
            <div className="pb-cover-front">
              <svg className="pb-foil" viewBox="0 0 300 120" aria-hidden="true" focusable="false">
                <circle cx="150" cy="84" r="34" />
                {[-72, -48, -24, 0, 24, 48, 72].map((r) => (
                  <path key={r} d="M147 42L150 14L153 42Z" transform={`rotate(${r} 150 84)`} />
                ))}
                <path d="M0 112q19-14 38 0t38 0t38 0t38 0t38 0t38 0t38 0t36 0V120H0Z" />
              </svg>
              <h1 className="pb-book-title">
                <span className="pb-t1">The Great</span>
                <span className="pb-t2">Adventure of</span>
                <span className={`pb-t3${shown.length > 12 ? " is-long" : ""}`} aria-live="off">
                  {shown ? (
                    shown.split("").map((c, i) => (
                      <span key={i} className="pb-letter">
                        {c === " " ? " " : c}
                      </span>
                    ))
                  ) : (
                    <span className="pb-blank">Your Name</span>
                  )}
                </span>
              </h1>
              <form
                className="pb-name"
                onSubmit={(e) => {
                  e.preventDefault();
                  open(0);
                }}
              >
                <label htmlFor="pb-hero">Who is the hero of this story?</label>
                <input
                  id="pb-hero"
                  value={typed}
                  maxLength={22}
                  autoComplete="given-name"
                  placeholder="Type your name"
                  onChange={(e) => setTyped(e.target.value)}
                />
                <button type="submit" disabled={phase !== "closed"}>
                  Open the book
                </button>
              </form>
              <p className="pb-cover-note">
                Your choices write the ending, and the ending is a real holiday.
              </p>
              <p className="pb-imprint">{BRAND.name}</p>
            </div>
            <div className="pb-cover-back" />
          </div>
        </div>
      )}

      <div className="pb-table">
        <div ref={perspEl} className="pb-persp">
          <div ref={bookEl} className="pb-book">
            <div className="pb-board" />
            <div className="pb-edge" />
            <div className="pb-page pb-page-l" inert={phase !== "idle"}>
              {page(leftN, "l", leftCopyMode)}
            </div>
            <div className="pb-page pb-page-r" inert={phase !== "idle"}>
              {page(rightN, "r", rightCopyMode)}
            </div>
            <i className="pb-gutter" />

            {turn && (
              <div
                ref={leafEl}
                className="pb-leaf"
                inert
                aria-hidden="true"
                style={{ transform: fwd ? "rotateY(0deg)" : "rotateY(-180deg)" }}
              >
                <Strips
                  i={0}
                  front={page(fwd ? turn.from : turn.to, "r", fwd ? "static" : "none")}
                  back={page(fwd ? turn.to : turn.from, "l", fwd ? "none" : "static")}
                />
              </div>
            )}

            {showStage && (
              <div
                ref={stageEl}
                key={sceneSlug + spread}
                className={
                  phase === "folding"
                    ? "pb-stage is-down"
                    : reduced
                      ? "pb-stage is-still"
                      : "pb-stage"
                }
                aria-label={`A pop-up paper scene of ${tripOf(sceneSlug).name}`}
                role="group"
              >
                <Layers port={portAt} />
              </div>
            )}
          </div>
        </div>

        {!closed && (
          <div className="pb-under">
            {phase === "idle" && pullLabel && (
              <PullTab
                key={sceneSlug + spread}
                label={pullLabel}
                stage={stageEl}
                reduced={reduced}
              />
            )}
            {askTilt && !tiltOn && (
              <button
                type="button"
                className="pb-tiltask"
                onClick={() => {
                  const dor = window.DeviceOrientationEvent as unknown as {
                    requestPermission?: () => Promise<string>;
                  };
                  void dor
                    .requestPermission?.()
                    .then((r) => {
                      if (r === "granted") setTiltOn(true);
                      setAskTilt(false);
                    })
                    .catch(() => setAskTilt(false));
                }}
              >
                Tilt the book with my phone
              </button>
            )}
          </div>
        )}

        {!closed && narrow && (
          <div
            className={`pb-slip${phase === "idle" ? "" : " is-away"}`}
            key={spread}
            inert={phase !== "idle"}
          >
            {leftCopy(spread, phase === "idle")}
            {rightCopy(spread, phase === "idle")}
          </div>
        )}

        {!closed && spread === END && phase !== "turning" && (
          <section
            className="pb-gate"
            id="pb-chapters"
            aria-label={`Your holiday in ${trip.name}, as story chapters`}
            key={trip.slug}
          >
            <div className="pb-gate-flap">
              <div className="pb-gate-story">
                <p className="pb-kicker">The story so far</p>
                <p className="pb-recap">{recap(hero, picks)}</p>
                <h2 className="pb-gate-title">
                  Book Two: {cap(hero)} in {trip.name}
                </h2>
                <p className="pb-gate-intro">{trip.intro}</p>
                <ol className="pb-days">
                  {trip.days.map(([title, what], i) => (
                    <li key={title} style={{ "--i": i } as CSSProperties}>
                      <span className="pb-day-no">Chapter {i + 1}</span>
                      <b>{title}</b>
                      <span>{what}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pb-gate-side">
                <div
                  className={`pb-pocket-wrap${noted ? " is-noted" : ""}`}
                  onSubmit={() => setNoted(true)}
                >
                  <div className="pb-note">
                    <QuoteForm
                      key={summary}
                      summary={summary}
                      button="Slip it in the pocket"
                      classes={{
                        form: "pb-form",
                        field: "pb-field",
                        label: "pb-label",
                        input: "pb-input",
                        button: "pb-send",
                        done: "pb-done",
                        note: "pb-tiny",
                      }}
                    >
                      <p className="pb-dear">
                        Dear {BRAND.name}, what would {trip.name} cost for {shown || "me"}?{" "}
                        {trip.nights} nights, from {rand(trip.price)} per person sharing (a sample
                        price).
                      </p>
                    </QuoteForm>
                  </div>
                  <div className="pb-pocket" aria-hidden="true">
                    <span>{noted ? "In the pocket" : "Pocket"}</span>
                  </div>
                </div>

                <div className="pb-endings">
                  <p className="pb-kicker">Other endings</p>
                  <div>
                    {TRIPS.map((t) => (
                      <button
                        type="button"
                        key={t.slug}
                        aria-pressed={t.slug === trip.slug}
                        onClick={() => {
                          setEnding(t.slug);
                          setNoted(false);
                          window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
                        }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="pb-again" onClick={again}>
                    Read it again and choose differently
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="pb-shelf">
          {contents}
          {bookplate}
        </div>
      </div>
    </main>
  );
}
