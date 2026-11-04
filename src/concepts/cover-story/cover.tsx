// The magazine cover. Four genuinely different layouts, one per issue, all sized in container units so the same cover
// works as the giant one in the book and as a small one on the shelf.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Clip, type ConceptTrip } from "@/concepts/kit";
import { barcode, type Story, type Theme } from "./copy";

/** One line of type, sized to fill its box exactly. Each letter arrives by itself. */
export function Fit({
  text,
  className = "",
  maxH = 1,
  caret,
  animate = true,
}: {
  text: string;
  className?: string;
  /** Tallest the type may be, as a share of the nearest cover or page's height. */
  maxH?: number;
  caret?: boolean;
  animate?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  // Letters there when this line first appears cascade in together; ones typed afterwards land straight away.
  const [mounted] = useState(() => [...text].length);

  useLayoutEffect(() => {
    const el = box.current;
    const m = measure.current;
    if (!el || !m) return;
    const fit = () => {
      const w = el.clientWidth;
      const mw = m.offsetWidth;
      const page = el.closest<HTMLElement>(".cv, .face");
      if (!w || !mw) return;
      const px = Math.min((w / mw) * 100 * 0.99, (page?.clientHeight ?? 1e4) * maxH);
      el.style.setProperty("--fit", `${px.toFixed(2)}px`);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    let live = true;
    void document.fonts?.ready.then(() => {
      if (live) fit();
    });
    return () => {
      live = false;
      ro.disconnect();
    };
  }, [text, maxH]);

  const chars = [...text];
  const guess = {
    "--guess": `${(90 / Math.max(chars.length * 0.62, 1)).toFixed(2)}cqw`,
  } as CSSProperties;
  return (
    <div ref={box} className={`fit ${className}`} style={guess}>
      <span ref={measure} className="fit-m" aria-hidden="true">
        {chars.map((c, i) => (
          <span key={i} className="ltr-m">
            {c === " " ? " " : c}
          </span>
        ))}
      </span>
      <span className="fit-l" aria-hidden="true">
        {chars.map((c, i) => (
          <span
            key={i}
            className={animate ? "ltr" : "ltr ltr--still"}
            style={{ "--i": i < mounted ? i : 0 } as CSSProperties}
          >
            {c === " " ? " " : c}
          </span>
        ))}
        {caret && <span className="cv-caret" />}
      </span>
    </div>
  );
}

export function Barcode({ seed }: { seed: string }) {
  let x = 0;
  const bars = barcode(seed).map((w, i) => {
    const rect = i % 2 === 0 ? <rect key={i} x={x} y="0" width={w} height="30" /> : null;
    x += w;
    return rect;
  });
  return (
    <svg className="bar" viewBox={`0 0 ${x} 38`} preserveAspectRatio="none" aria-hidden="true">
      <g fill="currentColor">{bars}</g>
    </svg>
  );
}

function Furniture({ story }: { story: Story }) {
  return (
    <div className="cv-furn">
      <div className="cv-bar">
        <Barcode seed={story.name + story.place} />
      </div>
      <p>
        No. {story.issueNo} <span>of 6</span>
        <br />
        {story.price}*
      </p>
    </div>
  );
}

/** Food issue: the name cut up into stacked lines so the letters can be enormous. */
function chunks(text: string) {
  const s = text.replace(/\s+/g, "");
  const per = s.length <= 4 ? 4 : s.length <= 8 ? Math.ceil(s.length / 2) : Math.ceil(s.length / 3);
  const out: string[] = [];
  for (let i = 0; i < s.length; i += per) out.push(s.slice(i, i + per));
  return out;
}

function Media({ trip, live }: { trip: ConceptTrip; live: boolean }) {
  return live ? (
    <Clip src={trip.video} poster={trip.poster} className="cv-video" />
  ) : (
    <img src={trip.poster} alt="" className="cv-video" loading="lazy" />
  );
}

export function Cover({
  story,
  trip,
  theme,
  live,
  hero,
  animate = true,
  onCycle,
}: {
  story: Story;
  trip: ConceptTrip;
  theme: Theme;
  live: boolean;
  hero?: boolean;
  animate?: boolean;
  onCycle?: () => void;
}) {
  const caret = !!hero && !story.typed;
  const issue = hero ? (
    <button
      type="button"
      className="cv-issue"
      onClick={onCycle}
      aria-label={`${story.title}. Change to the next issue`}
    >
      {story.title}
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path
          d="M2 6a4 4 0 0 1 7-2.6M10 6a4 4 0 0 1-7 2.6M9.4 1v2.6H6.8M2.6 11V8.4h2.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    </button>
  ) : (
    <span className="cv-issue">{story.title}</span>
  );
  const note = <p className="cv-note">* Sample price, per person sharing</p>;

  if (theme === "romance") {
    return (
      <div className={`cv cv--romance ${animate ? "" : "cv--still"}`}>
        <Media trip={trip} live={live} />
        <div className="cv-veil" />
        <Fit className="cv-mast" text="LEAVE" animate={animate} />
        <div className="cv-mid a2">{issue}</div>
        <p className="cv-l1 a3">{story.lines[0]}</p>
        <p className="cv-on a3">is on leave</p>
        <Fit className="cv-name" text={story.name} maxH={0.34} caret={caret} animate={animate} />
        <p className="cv-l2 a4">{story.lines[1]}</p>
        <Furniture story={story} />
        {note}
      </div>
    );
  }
  if (theme === "wild") {
    return (
      <div className={`cv cv--wild ${animate ? "" : "cv--still"}`}>
        <Media trip={trip} live={live} />
        <div className="cv-veil" />
        <div className="cv-mast">LEAVE</div>
        <div className="cv-tag a1">{issue}</div>
        <p className="cv-l1 a2">
          <span>{story.lines[1]}</span>
        </p>
        <p className="cv-l2 a3">
          <span>{story.lines[0]}</span>
        </p>
        <Fit className="cv-name" text={story.name} maxH={0.42} caret={caret} animate={animate} />
        <Furniture story={story} />
        {note}
      </div>
    );
  }
  if (theme === "family") {
    return (
      <div className={`cv cv--family ${animate ? "" : "cv--still"}`}>
        <div className="cv-round a1">
          <Media trip={trip} live={live} />
        </div>
        <div className="cv-top">
          <span className="cv-mast">Leave</span>
          <div className="cv-side a2">
            {issue}
            <p>{story.lines[1]}</p>
          </div>
        </div>
        <p className="cv-l1 a3">{story.lines[0]}</p>
        <Fit className="cv-name" text={story.name} maxH={0.34} caret={caret} animate={animate} />
        <Furniture story={story} />
        {note}
      </div>
    );
  }
  const lines = chunks(story.name.toUpperCase());
  return (
    <div className={`cv cv--food ${animate ? "" : "cv--still"}`}>
      <Media trip={trip} live={live} />
      <div className="cv-knock">
        {lines.map((l, i) => (
          <Fit
            key={i}
            className="cv-name"
            text={l}
            maxH={0.74 / lines.length}
            caret={caret && i === lines.length - 1}
            animate={animate}
          />
        ))}
      </div>
      <div className="cv-top">
        <span className="cv-mast">Leave</span>
        <div className="a2">{issue}</div>
      </div>
      <div className="cv-seal a4" aria-hidden="true">
        <span>Seconds?</span>
      </div>
      <div className="cv-foot">
        <p className="cv-l1 a3">{story.lines[0]}</p>
        <p className="cv-l2 a3">{story.lines[1]}</p>
      </div>
      <Furniture story={story} />
      {note}
    </div>
  );
}

/** A little punch-in on the footage every time a letter lands. */
export function useCoverPunch(
  el: HTMLElement | null,
  text: string,
  theme: Theme,
  reduced: boolean,
) {
  const last = useRef(text);
  useEffect(() => {
    if (last.current === text) return;
    last.current = text;
    if (!el || reduced || !el.animate) return;
    const video = el.querySelector<HTMLElement>(".cv-video");
    video?.animate([{ transform: "scale(1.07)" }, { transform: "scale(1)" }], {
      duration: 380,
      easing: "cubic-bezier(.16,1,.3,1)",
    });
    if (theme === "wild") {
      el.animate(
        [
          { transform: "translate(-1.2%,.8%) rotate(-.5deg)" },
          { transform: "translate(.7%,-.5%) rotate(.3deg)" },
          { transform: "none" },
        ],
        { duration: 190, easing: "steps(3)" },
      );
    }
  }, [el, text, theme, reduced]);
}
