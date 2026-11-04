// Cover Story: a high-fashion magazine being made about the traveller, live. The cover is the first leaf of a real
// 3D book, so the game and the result are one object: set the cover, then turn the pages.
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as RPointerEvent,
  type ReactNode,
} from "react";
import {
  BRAND,
  bestTrip,
  contact,
  rand,
  TRIPS,
  useReducedMotion,
  type ConceptTrip,
} from "@/concepts/kit";
import { Cover, useCoverPunch } from "./cover";
import { makeStory, SHELF_THEME, shortName, THEMES, WHO, type Theme, type Who } from "./copy";
import {
  AdPerfume,
  AdReef,
  BackPage,
  Classifieds,
  Contents,
  FeatureLeft,
  FeaturePull,
  FeatureRight,
  FeatureStory,
  Horoscope,
  MovingPage,
} from "./pages";

export const FONTS =
  "family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Schibsted+Grotesk:wght@400;500;700;900";

const FACE_COUNT = 12;
const tripAt = (i: number) =>
  TRIPS[((i % TRIPS.length) + TRIPS.length) % TRIPS.length] as ConceptTrip;
const INK: Record<Theme, { ink: string; on: string }> = {
  romance: { ink: "#e0112b", on: "#fff" },
  wild: { ink: "#c8ff00", on: "#000" },
  family: { ink: "#1a3cff", on: "#fff" },
  food: { ink: "#f5b700", on: "#000" },
};

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 900px)");
    setNarrow(q.matches);
    const on = () => setNarrow(q.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return narrow;
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

/** Drives the leaves directly, outside React, so a page follows the finger at full speed. */
function useLeaves(reduced: boolean) {
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const ts = useRef<number[]>([]);
  const anims = useRef(new Map<number, { from: number; to: number; start: number; dur: number }>());
  const raf = useRef(0);

  const place = useCallback((i: number, t: number) => {
    const el = els.current[i];
    ts.current[i] = t;
    if (!el) return;
    const curve = Math.sin(Math.PI * t);
    const p = Math.max(el.offsetWidth * 3, 1200);
    el.style.transform =
      t === 0
        ? "none"
        : `perspective(${p}px) rotateY(${(-180 * t).toFixed(2)}deg) skewY(${(curve * -1.4).toFixed(2)}deg)`;
    el.style.zIndex = String(t < 0.5 ? 100 - i : 100 + i);
    el.style.setProperty("--shade", (curve * 0.42).toFixed(3));
    el.classList.toggle("is-moving", t > 0 && t < 1);
  }, []);

  const tick = useCallback(
    (now: number) => {
      anims.current.forEach((a, i) => {
        const x = Math.min(1, Math.max(0, (now - a.start) / a.dur));
        place(i, a.from + (a.to - a.from) * ease(x));
        if (x >= 1) anims.current.delete(i);
      });
      raf.current = anims.current.size ? requestAnimationFrame(tick) : 0;
    },
    [place],
  );

  const animate = useCallback(
    (i: number, to: number, delay = 0, dur = 950) => {
      if (reduced) {
        anims.current.delete(i);
        place(i, to);
        return;
      }
      const from = ts.current[i] ?? 0;
      anims.current.set(i, { from, to, start: performance.now() + delay, dur });
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    },
    [place, reduced, tick],
  );

  const stop = useCallback((i: number) => {
    anims.current.delete(i);
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { els, ts, place, animate, stop };
}

const faceOf = (at: number, narrow: boolean) => (narrow ? at : Math.max(0, at * 2 - 1));
const atOf = (face: number, narrow: boolean) => (narrow ? face : Math.ceil(face / 2));

type Drag = {
  id: number;
  x0: number;
  y0: number;
  t0: number;
  lastX: number;
  lastT: number;
  vx: number;
  mode: null | "next" | "prev" | "cover";
  dog: boolean;
  soft: boolean;
  spine: number;
  pw: number;
  grab: number;
};

export function Concept() {
  const reduced = useReducedMotion();
  const narrow = useNarrow();
  const [name, setName] = useState("");
  const [tripIdx, setTripIdx] = useState(5);
  const [theme, setTheme] = useState<Theme>("romance");
  const [who, setWho] = useState<Who>("two");
  const [pickedPlace, setPickedPlace] = useState(false);
  const [at, setAt] = useState(0);
  const [cut, setCut] = useState(0);

  const trip = tripAt(tripIdx);
  const story = useMemo(() => makeStory(name, trip, theme, who), [name, trip, theme, who]);
  const leaves = useLeaves(reduced);
  const { place, animate, stop, ts } = leaves;

  const leafCount = narrow ? FACE_COUNT : FACE_COUNT / 2;
  const maxAt = narrow ? FACE_COUNT - 1 : FACE_COUNT / 2;
  const nameInput = useRef<HTMLInputElement>(null);
  const bookEl = useRef<HTMLDivElement>(null);
  const atRef = useRef(at);
  useEffect(() => {
    atRef.current = at;
  }, [at]);

  /* ---- turning pages ---- */
  const goTo = useCallback(
    (target: number) => {
      const cur = atRef.current;
      const to = Math.max(0, Math.min(narrow ? FACE_COUNT - 1 : FACE_COUNT / 2, target));
      if (to === cur) return;
      const riffle = Math.abs(to - cur) > 1;
      const dur = riffle ? 620 : 950;
      if (to > cur) for (let i = cur; i < to; i++) animate(i, 1, (i - cur) * 85, dur);
      else for (let i = cur - 1; i >= to; i--) animate(i, 0, (cur - 1 - i) * 85, dur);
      atRef.current = to;
      setAt(to);
    },
    [animate, narrow],
  );

  const goToFace = useCallback((face: number) => goTo(atOf(face, narrow)), [goTo, narrow]);

  // Going between one-page (phone) and two-page layouts: keep the same page open.
  const prevNarrow = useRef(narrow);
  useEffect(() => {
    const was = prevNarrow.current;
    prevNarrow.current = narrow;
    const next = was === narrow ? atRef.current : atOf(faceOf(atRef.current, was), narrow);
    atRef.current = next;
    setAt(next);
    for (let i = 0; i < leafCount; i++) place(i, i < next ? 1 : 0);
  }, [narrow, leafCount, place]);

  /* ---- the cover: name, issue, place ---- */
  const cutTo = useCallback(() => setCut((c) => c + 1), []);
  const choosePlace = (i: number) => {
    setPickedPlace(true);
    setTripIdx((i + TRIPS.length) % TRIPS.length);
    cutTo();
  };
  const chooseTheme = (id: Theme) => {
    setTheme(id);
    if (!pickedPlace) {
      const best = bestTrip(THEMES.find((x) => x.id === id)?.weights ?? {});
      setTripIdx(TRIPS.findIndex((x) => x.slug === best.slug));
    }
    cutTo();
  };
  const cycleTheme = () => {
    const i = THEMES.findIndex((x) => x.id === theme);
    chooseTheme(THEMES[(i + 1) % THEMES.length]?.id ?? "romance");
  };
  const fromShelf = (i: number) => {
    setTripIdx(i);
    setTheme(SHELF_THEME[tripAt(i).slug] ?? "romance");
    setPickedPlace(true);
    cutTo();
    goTo(0);
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const inner = useRef<HTMLDivElement | null>(null);
  const [innerEl, setInnerEl] = useState<HTMLDivElement | null>(null);
  const setInner = useCallback((el: HTMLDivElement | null) => {
    inner.current = el;
    setInnerEl(el);
  }, []);
  useCoverPunch(innerEl, story.name, theme, reduced);

  // On a computer the cursor starts in the name field: typing is the game. On phones, wait for a tap.
  useEffect(() => {
    if (!window.matchMedia("(max-width: 900px)").matches)
      nameInput.current?.focus({ preventScroll: true });
  }, []);

  /* ---- pointer: turn pages, or drag between covers while the book is shut ---- */
  const drag = useRef<Drag | null>(null);
  const fingerT = (d: Drag, x: number) => {
    const raw = Math.max(-1, Math.min(1, (x - d.spine) / d.pw));
    return Math.acos(raw) / Math.PI;
  };

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    const hit = target.closest("a,button,input,label,select,textarea,form");
    // Big targets you can also start a drag from; a plain tap still clicks them.
    const soft = !!target.closest(".cv-arrow,.ct-list button");
    const dog = !!target.closest(".dog");
    if (hit && !dog && !soft) return;
    const rect = bookEl.current?.getBoundingClientRect();
    if (!rect) return;
    drag.current = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      t0: e.timeStamp,
      lastX: e.clientX,
      lastT: e.timeStamp,
      vx: 0,
      mode: null,
      soft,
      dog,
      spine: rect.left,
      pw: rect.width,
      grab: 0,
    };
  };

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.mode) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      const cur = atRef.current;
      const onRight = d.x0 >= d.spine;
      if (cur === 0 && !d.dog) d.mode = "cover";
      else if (dx < 0 && cur < maxAt && (narrow || onRight)) d.mode = "next";
      else if (dx > 0 && cur > 0 && (narrow || !onRight)) d.mode = "prev";
      else {
        drag.current = null;
        return;
      }
      if ((e.target as HTMLElement).closest(".no-turn") && d.mode !== "cover") {
        drag.current = null;
        return;
      }
      if (d.mode !== "cover") {
        const i = d.mode === "next" ? cur : cur - 1;
        stop(i);
        d.grab = narrow ? 0 : fingerT(d, d.x0);
      }
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    d.vx = (e.clientX - d.lastX) / Math.max(1, e.timeStamp - d.lastT);
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    if (d.mode === "cover") {
      const el = inner.current;
      if (el) el.style.transform = `translateX(${dx}px)`;
      return;
    }
    const cur = atRef.current;
    if (d.mode === "next") {
      const t = narrow
        ? (-dx / d.pw) * 0.72
        : (fingerT(d, e.clientX) - d.grab) / Math.max(0.05, 1 - d.grab);
      place(cur, Math.max(0.001, Math.min(0.999, t)));
    } else {
      const t = narrow ? 1 - (dx / d.pw) * 0.72 : fingerT(d, e.clientX) / Math.max(0.05, d.grab);
      place(cur - 1, Math.max(0.001, Math.min(0.999, t)));
    }
  };

  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const cur = atRef.current;
    const dx = e.clientX - d.x0;
    const cancelled = e.type === "pointercancel";
    if (d.mode === "cover") {
      const el = inner.current;
      if (el) {
        const far = Math.abs(dx) > d.pw * 0.2 || Math.abs(d.vx) > 0.5;
        if (far && !cancelled) {
          el.style.transform = "";
          choosePlace(tripIdx + (dx < 0 ? 1 : -1));
        } else {
          el.style.transition = "transform .45s cubic-bezier(.16,1,.3,1)";
          el.style.transform = "";
          window.setTimeout(() => {
            el.style.transition = "";
          }, 460);
        }
      }
      return;
    }
    if (d.mode === "next") {
      const t = ts.current[cur] ?? 0;
      if (!cancelled && (t > 0.28 || d.vx < -0.45)) {
        animate(cur, 1, 0, 620);
        atRef.current = cur + 1;
        setAt(cur + 1);
      } else animate(cur, 0, 0, 480);
      return;
    }
    if (d.mode === "prev") {
      const t = ts.current[cur - 1] ?? 1;
      if (!cancelled && (t < 0.72 || d.vx > 0.45)) {
        animate(cur - 1, 0, 0, 620);
        atRef.current = cur - 1;
        setAt(cur - 1);
      } else animate(cur - 1, 1, 0, 480);
      return;
    }
    // A plain tap.
    if (cancelled || d.dog || d.soft) return;
    if (Math.abs(dx) > 8 || Math.abs(e.clientY - d.y0) > 8 || e.timeStamp - d.t0 > 400) return;
    if (cur === 0) {
      nameInput.current?.focus();
      return;
    }
    if ((e.target as HTMLElement).closest(".no-turn")) return;
    const onLeft = narrow ? e.clientX < d.spine + d.pw * 0.3 : e.clientX < d.spine;
    goTo(onLeft ? cur - 1 : cur + 1);
  };

  const lift = (e: RPointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const cur = atRef.current;
    if (cur < maxAt && (ts.current[cur] ?? 0) < 0.1) animate(cur, 0.05, 0, 260);
  };
  const unlift = (e: RPointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const cur = atRef.current;
    const t = ts.current[cur] ?? 0;
    if (t > 0 && t < 0.1) animate(cur, 0, 0, 260);
  };

  // Arrow keys turn pages, unless the traveller is typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest?.("input,textarea,select")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(atRef.current + 1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(atRef.current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  /* ---- what's on each face ---- */
  const visible = narrow ? [at] : [at * 2 - 1, at * 2];
  const props = { story, trip, goToFace };
  const faceBody = (f: number): ReactNode => {
    const live = visible.includes(f);
    const p = { ...props, live };
    switch (f) {
      case 0:
        return (
          <div className="cv-frame">
            <div className="cv-slide" ref={setInner}>
              <div className="cv-peek cv-peek--prev" aria-hidden="true">
                <img src={tripAt(tripIdx - 1).poster} alt="" loading="lazy" />
                <span>{shortName(tripAt(tripIdx - 1))}</span>
              </div>
              <div className="cv-cut" key={`${theme}-${trip.slug}`}>
                <Cover
                  story={story}
                  trip={trip}
                  theme={theme}
                  live={live}
                  hero
                  onCycle={cycleTheme}
                />
              </div>
              <div className="cv-peek cv-peek--next" aria-hidden="true">
                <img src={tripAt(tripIdx + 1).poster} alt="" loading="lazy" />
                <span>{shortName(tripAt(tripIdx + 1))}</span>
              </div>
            </div>
            {cut > 0 && !reduced && <div key={cut} className="cv-flash" aria-hidden="true" />}
            <button
              type="button"
              className="cv-arrow cv-arrow--p"
              onClick={() => choosePlace(tripIdx - 1)}
              aria-label={`Previous cover: ${shortName(tripAt(tripIdx - 1))}`}
            >
              <Arrow />
            </button>
            <button
              type="button"
              className="cv-arrow cv-arrow--n"
              onClick={() => choosePlace(tripIdx + 1)}
              aria-label={`Next cover: ${shortName(tripAt(tripIdx + 1))}`}
            >
              <Arrow />
            </button>
          </div>
        );
      case 1:
        return <AdPerfume {...p} />;
      case 2:
        return <Contents {...p} />;
      case 3:
        return <FeatureLeft {...p} />;
      case 4:
        return <FeatureRight {...p} />;
      case 5:
        return <FeatureStory {...p} />;
      case 6:
        return <FeaturePull {...p} />;
      case 7:
        return <MovingPage {...p} />;
      case 8:
        return <Horoscope {...p} />;
      case 9:
        return <Classifieds {...p} />;
      case 10:
        return <AdReef {...p} />;
      default:
        return <BackPage {...p} />;
    }
  };

  const leafFaces: [number, number | null][] = narrow
    ? Array.from({ length: FACE_COUNT }, (_, i) => [i, null])
    : Array.from({ length: FACE_COUNT / 2 }, (_, i) => [i * 2, i * 2 + 1]);

  const face = (f: number, side: "front" | "back") => {
    const on = visible.includes(f);
    return (
      <div className={`face face--${side} ${on ? "is-on" : ""}`} inert={!on}>
        {faceBody(f)}
        <div className="shade" />
        <div className="gutter" />
      </div>
    );
  };

  const open = at > 0;
  const atEnd = at === maxAt;
  const ink = INK[theme];
  const pageLabel =
    at === 0
      ? "Cover"
      : atEnd
        ? "Back page"
        : narrow
          ? `Page ${at} of 11`
          : `Pages ${at * 2 - 1} and ${at * 2}`;

  return (
    <main
      className={`c-cover-story ${open ? "is-open" : ""} ${atEnd ? "is-end" : ""} ${reduced ? "is-calm" : ""}`}
      style={{ "--ink": ink.ink, "--on": ink.on } as CSSProperties}
    >
      <header className="top">
        <p className="top-brand">
          <b>LEAVE</b> <span>A magazine by {BRAND.name}</span>
        </p>
        <p className="top-links">
          <a href={`tel:${contact.phoneE164}`}>{contact.phoneDisplay}</a>
          <a href={`mailto:${contact.email}`} className="top-mail">
            {contact.email}
          </a>
          <a href="#back-issues">Back issues</a>
        </p>
      </header>

      <section className="stage" aria-label="Your magazine">
        <div className="desk desk--a" inert={open}>
          <h1 className="desk-h">
            This issue is about <em>you.</em>
          </h1>
          <label className="desk-name">
            <span className="desk-k">Type your name for the cover</span>
            <input
              ref={nameInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={16}
              placeholder="Your name"
              autoComplete="given-name"
              spellCheck={false}
            />
          </label>
        </div>

        <div
          className="book"
          ref={bookEl}
          role="group"
          aria-label="The magazine. Use the page buttons or the left and right arrow keys to turn pages."
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {leafFaces.map(([front, back], i) => (
            <div
              key={i}
              className="leaf"
              style={{ zIndex: 100 - i }}
              ref={(el) => {
                leaves.els.current[i] = el;
              }}
            >
              {face(front, "front")}
              {back !== null ? (
                face(back, "back")
              ) : (
                <div className="face face--back face--blank">
                  <div className="shade" />
                </div>
              )}
            </div>
          ))}
          {!atEnd && (
            <button
              type="button"
              className={`dog dog--next ${open ? "" : "dog--first"}`}
              onClick={() => goTo(atRef.current + 1)}
              onPointerEnter={lift}
              onPointerLeave={unlift}
              aria-label={open ? "Turn to the next page" : "Open the magazine"}
            >
              <i />
            </button>
          )}
          {open && !narrow && (
            <button
              type="button"
              className="dog dog--prev"
              onClick={() => goTo(atRef.current - 1)}
              aria-label="Turn back a page"
            >
              <i />
            </button>
          )}
        </div>

        <div className="desk desk--b" inert={open}>
          <div className="desk-group">
            <span className="desk-k">Pick the issue</span>
            <div className="desk-themes" role="radiogroup" aria-label="Which issue">
              {THEMES.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={theme === x.id}
                  className={`th th--${x.id} ${theme === x.id ? "is-sel" : ""}`}
                  onClick={() => chooseTheme(x.id)}
                >
                  {x.word}
                </button>
              ))}
            </div>
          </div>
          <div className="desk-group">
            <span className="desk-k">Who's in the shot</span>
            <div className="desk-who" role="radiogroup" aria-label="Who's going">
              {WHO.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  role="radio"
                  aria-checked={who === w.id}
                  className={who === w.id ? "is-sel" : ""}
                  onClick={() => setWho(w.id)}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
          <div className="desk-group">
            <span className="desk-k">
              Where it's shot <small>or drag the cover</small>
            </span>
            <div className="desk-places" role="radiogroup" aria-label="Which place">
              {TRIPS.map((t, i) => (
                <button
                  key={t.slug}
                  type="button"
                  role="radio"
                  aria-checked={tripIdx === i}
                  className={tripIdx === i ? "is-sel" : ""}
                  onClick={() => choosePlace(i)}
                >
                  {shortName(t).replace(/^the /, "")}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="desk-go"
            onClick={() => {
              goTo(1);
              if (narrow) window.scrollTo({ top: 0 });
            }}
          >
            <span>Open {story.typed ? `${story.first}'s` : "your"} issue</span>
            <Arrow />
          </button>
        </div>

        <div className="endnote" inert={!atEnd || narrow}>
          <p className="endnote-big">That's the issue{story.typed ? `, ${story.first}` : ""}.</p>
          <p>Fill in the card and {BRAND.name} prices it properly. Or just talk to a person.</p>
          <p className="endnote-links">
            <a href={`tel:${contact.phoneE164}`}>{contact.phoneDisplay}</a>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>
          <button type="button" className="endnote-again" onClick={() => goTo(0)}>
            Back to the cover
          </button>
        </div>

        <div className="pager" inert={!open}>
          <button
            type="button"
            onClick={() => goTo(at - 1)}
            disabled={!open}
            aria-label="Previous page"
          >
            <Arrow left />
          </button>
          <span aria-live="polite">{pageLabel}</span>
          <button
            type="button"
            onClick={() => goTo(at + 1)}
            disabled={atEnd}
            aria-label="Next page"
          >
            <Arrow />
          </button>
          <button type="button" className="pager-c" onClick={() => goTo(0)}>
            Cover
          </button>
          <button type="button" className="pager-c" onClick={() => goToFace(11)} disabled={atEnd}>
            The price
          </button>
        </div>
      </section>

      <section className="shelf" id="back-issues" aria-labelledby="cs-shelf">
        <h2 id="cs-shelf" className="shelf-h">
          Back <em>issues</em>
        </h2>
        <p className="shelf-sub">
          Six places, six covers, all with {story.typed ? story.first : "you"} on the front. Pull
          one out to read it. Sample prices, per person sharing.
        </p>
        <ul className="shelf-row">
          {TRIPS.map((t, i) => {
            const th = SHELF_THEME[t.slug] ?? "romance";
            const s = makeStory(name, t, th, who);
            return (
              <li
                key={t.slug}
                className="shelf-item"
                style={
                  {
                    "--ink": INK[th].ink,
                    "--on": INK[th].on,
                    "--tilt": `${[-2.4, 1.4, -1, 2.2, -1.8, 1][i]}deg`,
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  onClick={() => fromShelf(i)}
                  aria-label={`Read issue ${i + 1}: ${t.name}, ${t.nights} nights, sample price ${rand(t.price)} per person sharing`}
                >
                  <span className="shelf-mag" aria-hidden="true">
                    <Cover story={s} trip={t} theme={th} live={false} animate={false} />
                  </span>
                  <span className="shelf-cap">
                    <b>{t.name}</b>
                    <span>
                      {t.nights} nights, {rand(t.price)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="colophon">
        <p className="colophon-big">LEAVE</p>
        <div className="colophon-r">
          <p>Published by {BRAND.name}, a travel agency that would rather you went.</p>
          <p className="cl-links">
            <a href={`tel:${contact.phoneE164}`}>{contact.phoneDisplay}</a>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}

function Arrow({ left }: { left?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 12"
      className="arrow"
      style={left ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      <path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
