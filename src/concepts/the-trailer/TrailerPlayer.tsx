// The projector: plays a list of shots full screen. One clock (requestAnimationFrame), one video, three photos and a
// card, all stacked; a cut just changes which layer is on top and restarts its camera move.
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BRAND, type ConceptTrip } from "@/concepts/kit";
import type { Score } from "./score";
import {
  buildTrailer,
  castOf,
  starName,
  titleText,
  type CastId,
  type Genre,
  type Media,
  type Motion,
  type Shot,
} from "./script";

const DISSOLVE: Partial<Record<Genre, number>> = { romance: 1100, documentary: 380 };
const RATE: Record<Genre, number> = {
  romance: 0.6,
  action: 1.45,
  comedy: 1,
  documentary: 0.85,
  family: 1.05,
};

const CAMERA: Record<Motion, Keyframe[]> = {
  push: [{ transform: "scale(1.02)" }, { transform: "scale(1.14)" }],
  pull: [{ transform: "scale(1.18)" }, { transform: "scale(1.02)" }],
  panl: [{ transform: "scale(1.14) translateX(4%)" }, { transform: "scale(1.14) translateX(-4%)" }],
  panr: [{ transform: "scale(1.14) translateX(-4%)" }, { transform: "scale(1.14) translateX(4%)" }],
  punch: [
    { transform: "scale(1.5)", offset: 0 },
    { transform: "scale(1.06)", offset: 0.24 },
    { transform: "scale(1.12)", offset: 1 },
  ],
  shake: [
    { transform: "scale(1.2) translate(1.5%,-1%)" },
    { transform: "scale(1.2) translate(-1.5%,1%)" },
    { transform: "scale(1.2) translate(1%,1.5%)" },
    { transform: "scale(1.2) translate(-1%,-1.5%)" },
    { transform: "scale(1.2) translate(.5%,.5%)" },
    { transform: "scale(1.24)" },
  ],
  drift: [{ transform: "scale(1.03)" }, { transform: "scale(1.1)" }],
  still: [{ transform: "none" }, { transform: "none" }],
  freeze: [
    { transform: "scale(1) rotate(0deg)", offset: 0 },
    { transform: "scale(.74) rotate(-4deg)", offset: 0.1 },
    { transform: "scale(.8) rotate(-2.4deg)", offset: 0.16 },
    { transform: "scale(.78) rotate(-3deg)", offset: 1 },
  ],
};

const layerKey = (m: Media) => (typeof m === "number" ? `p${m}` : m);

function Chars({ text }: { text: string }) {
  return (
    <>
      {[...text].map((ch, i) => (
        <span className="tt-ch" style={{ "--i": i } as CSSProperties} key={i}>
          {ch}
        </span>
      ))}
    </>
  );
}

/** Big type, broken into lines that fit: fewer letters a line on a phone, and every line sized to the longest. */
function Kinetic({
  text,
  narrow,
  className,
}: {
  text: string;
  narrow: boolean;
  className?: string;
}) {
  const lines = useMemo(() => {
    const max = narrow ? 12 : 22;
    const out: string[] = [];
    for (const hard of text.split("\n")) {
      let line = "";
      for (const word of hard.split(" ")) {
        if (line && (line + " " + word).length > max) {
          out.push(line);
          line = word;
        } else line = line ? `${line} ${word}` : word;
      }
      out.push(line);
    }
    return out;
  }, [text, narrow]);
  const len = Math.max(4, ...lines.map((l) => l.length));
  let offset = 0;
  return (
    <span className={`tt-kinetic ${className ?? ""}`} style={{ "--len": len } as CSSProperties}>
      {lines.map((l, li) => {
        const start = offset;
        offset += l.length;
        return (
          <span className="tt-line" key={li}>
            {[...l].map((ch, i) => (
              <span className="tt-ch" style={{ "--i": start + i } as CSSProperties} key={i}>
                {ch === " " ? " " : ch}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

/** The studio's logo: the sun going down behind a horizon, with two searchlights. */
function StudioIdent() {
  return (
    <div className="tt-studio">
      <span className="tt-beam tt-beam-l" />
      <span className="tt-beam tt-beam-r" />
      <svg viewBox="0 0 200 110" className="tt-sun" aria-hidden="true">
        <g className="tt-rays">
          {Array.from({ length: 16 }, (_, i) => (
            <rect
              key={i}
              x="98.5"
              y="8"
              width="3"
              height="20"
              rx="1.5"
              fill="#f0b63c"
              transform={`rotate(${i * 22.5} 100 70)`}
            />
          ))}
        </g>
        <circle className="tt-sundisc" cx="100" cy="70" r="28" fill="#f0b63c" />
        <rect x="0" y="82" width="200" height="30" fill="#000" />
        <rect x="14" y="82" width="172" height="2.5" fill="#f4ead2" />
      </svg>
      <p className="tt-studio-name">{BRAND.name}</p>
      <p className="tt-studio-sub">Pictures</p>
    </div>
  );
}

function ShotText({ shot, narrow, duration }: { shot: Shot; narrow: boolean; duration: number }) {
  const vars = { "--ms": `${duration}ms` } as CSSProperties;
  switch (shot.kind) {
    case "band":
      return (
        <div className="tt-band" style={vars}>
          <p className="tt-band-top">The following preview has been approved for</p>
          <p className="tt-band-big">All annual leave</p>
          <p className="tt-band-small">by the board of people who really need a holiday</p>
        </div>
      );
    case "studio":
      return <StudioIdent />;
    case "slam":
      return (
        <div className="tt-pos tt-pos-c" style={vars}>
          <Kinetic text={shot.text ?? ""} narrow={narrow} />
        </div>
      );
    case "hush":
      return (
        <div className="tt-pos tt-pos-c tt-hush" style={vars}>
          <Kinetic text={shot.text ?? ""} narrow={narrow} />
        </div>
      );
    case "caption":
      return (
        <div className="tt-pos tt-pos-b" style={vars}>
          <p className="tt-caption">
            <Chars text={shot.text ?? ""} />
          </p>
        </div>
      );
    case "third":
      return (
        <div className="tt-pos tt-pos-third" style={vars}>
          <p className="tt-third-name">{shot.text}</p>
          <p className="tt-third-role">{shot.sub}</p>
        </div>
      );
    case "scene":
      return (
        <div className="tt-pos tt-pos-scene" style={vars}>
          {shot.label && <p className="tt-label">{shot.label}</p>}
          <Kinetic text={shot.text ?? ""} narrow={narrow} className="tt-scene-title" />
          {shot.sub && <p className="tt-scene-sub">{shot.sub}</p>}
        </div>
      );
    case "film":
      return (
        <div className="tt-pos tt-pos-c tt-film" style={vars}>
          <Kinetic text={shot.text ?? ""} narrow={narrow} />
        </div>
      );
    default:
      return null;
  }
}

export function TrailerPlayer({
  genre,
  cast,
  star,
  trip,
  reduced,
  sound,
  score,
  onSound,
  onDone,
}: {
  genre: Genre;
  cast: CastId;
  star: string;
  trip: ConceptTrip;
  reduced: boolean;
  sound: boolean;
  score: React.RefObject<Score | null>;
  onSound: () => void;
  onDone: () => void;
}) {
  const shots = useMemo(() => {
    const all = buildTrailer(genre, cast, star, trip);
    return reduced
      ? all.filter((s) => !s.fast).map((s) => ({ ...s, motion: "still" as Motion, flash: false }))
      : all;
  }, [genre, cast, star, trip, reduced]);
  const total = useMemo(() => shots.reduce((n, s) => n + s.ms, 0), [shots]);
  const starts = useMemo(() => {
    let n = 0;
    return shots.map((s) => {
      const at = n;
      n += s.ms;
      return at;
    });
  }, [shots]);

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const clock = useRef(0);
  const pausedRef = useRef(false);
  const stage = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const timecode = useRef<HTMLSpanElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const z = useRef(1);
  const prevKey = useRef<string | null>(null);
  const camera = useRef<Record<string, Animation | undefined>>({});
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  // The room goes dark: no page scroll behind the film, and Skip takes the focus so the keyboard works at once.
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    skip.current?.focus({ preventScroll: true });
    const fit = () => setNarrow(window.innerWidth < 700);
    fit();
    window.addEventListener("resize", fit);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("resize", fit);
    };
  }, []);

  // The clock. Capped per frame, so a hidden tab waits rather than jumping ahead.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let cur = 0;
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (!pausedRef.current) {
        clock.current += dt;
        const t = clock.current;
        if (t >= total) {
          done.current();
          return;
        }
        let i = cur;
        while (i < shots.length - 1 && t >= (starts[i + 1] ?? Infinity)) i++;
        if (i !== cur) {
          cur = i;
          setIdx(i);
        }
        if (progress.current) progress.current.style.transform = `scaleX(${t / total})`;
        if (timecode.current) {
          const sec = Math.floor(t / 1000);
          timecode.current.textContent = `00:00:${String(sec).padStart(2, "0")}:${String(Math.floor((t % 1000) / 41.67)).padStart(2, "0")}`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shots, starts, total]);

  // The cut.
  useEffect(() => {
    const shot = shots[idx] as Shot;
    const root = media.current;
    if (!root) return;
    const key = layerKey(shot.media);
    const el = root.querySelector<HTMLElement>(`[data-layer="${key}"]`);
    if (!el) return;
    const fresh = key !== prevKey.current;
    const dissolve = reduced ? 300 : (DISSOLVE[genre] ?? 0);
    const iris = genre === "family" && !reduced;

    root.querySelectorAll<HTMLElement>("[data-layer]").forEach((l) => {
      const k = l.dataset["layer"];
      const keep = k === key || (!shot.freeze && k === prevKey.current && (dissolve > 0 || iris));
      l.style.visibility = keep ? "visible" : "hidden";
    });
    el.classList.toggle("is-frozen", !!shot.freeze);
    el.style.zIndex = String(++z.current);

    camera.current[key]?.cancel();
    const look = shot.motion ?? "still";
    const ease =
      look === "punch"
        ? "cubic-bezier(.12,.8,.2,1)"
        : look === "shake"
          ? "steps(6)"
          : look === "freeze"
            ? "ease-out"
            : "linear";
    camera.current[key] = el.animate(CAMERA[look], {
      duration: shot.ms + dissolve + 200,
      fill: "forwards",
      easing: ease,
    });
    if (fresh && dissolve)
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dissolve, easing: "ease-in-out" });
    if (fresh && iris) {
      el.animate([{ clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(80% at 50% 50%)" }], {
        duration: 520,
        easing: "cubic-bezier(.5,0,.2,1)",
      });
    }
    prevKey.current = key;

    const v = video.current;
    if (v) {
      if (reduced || (shot.freeze && key === "clip")) v.pause();
      else if (!pausedRef.current) void v.play().catch(() => {});
    }

    if (shot.flash && flash.current)
      flash.current.animate([{ opacity: 0.9 }, { opacity: 0 }], {
        duration: 180,
        easing: "ease-out",
      });
    if (genre === "action" && shot.cue === "hit" && !reduced && stage.current) {
      stage.current.animate(
        [
          { transform: "translate(0,0)" },
          { transform: "translate(-6px,4px)" },
          { transform: "translate(5px,-3px)" },
          { transform: "translate(0,0)" },
        ],
        { duration: 170, easing: "linear" },
      );
    }
    if (sound && shot.cue) score.current?.cue(shot.cue);
    // The cue fires once per cut: `sound` changing mid-shot shouldn't replay it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, shots, genre, reduced]);

  // The score follows the sound switch, joining at whatever point the film has reached.
  useEffect(() => {
    const s = score.current;
    if (!s) return;
    if (sound) {
      s.resume();
      s.startBed(genre, clock.current / 1000, total / 1000);
    } else s.stopBed();
    return () => {
      s.stopBed();
    };
  }, [sound, genre, total, score]);

  useEffect(() => {
    const v = video.current;
    if (v) {
      v.defaultPlaybackRate = RATE[genre];
      v.playbackRate = RATE[genre];
    }
  }, [genre]);

  const togglePause = useCallback(() => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    const list = stage.current?.getAnimations({ subtree: true }) ?? [];
    // Only touch what is mid-flight: playing a finished animation again would restart it.
    for (const a of list) {
      if (next && a.playState === "running") a.pause();
      else if (!next && a.playState === "paused") a.play();
    }
    const v = video.current;
    if (v && !reduced) {
      if (next) v.pause();
      else void v.play().catch(() => {});
    }
    const s = score.current;
    if (s && sound) {
      if (next) s.suspend();
      else s.resume();
    }
  }, [reduced, score, sound]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onDone();
    }
    if (e.key === "k" || e.key === "p") {
      e.preventDefault();
      togglePause();
    }
  };

  const shot = shots[idx] as Shot;
  const onCard = shot.media === "card";
  const summary = `The trailer for ${titleText(genre, trip)}, starring ${starName(star, cast)} ${castOf(cast).bill}. ${trip.days.map((d) => d[0]).join(", ")}. Skip it at any time to see your poster and ticket form.`;

  return (
    <div
      ref={stage}
      className={`tt-stage g-${genre} ${reduced ? "is-calm" : ""} ${onCard ? "on-card" : "on-media"} ${shot.freeze ? "on-freeze" : ""} ${shot.kind === "studio" ? "on-studio" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Your trailer"
      onKeyDown={onKey}
    >
      <p className="tt-sr">{summary}</p>
      <div ref={media} className="tt-media" aria-hidden="true">
        <div className="tt-layer tt-layer-card" data-layer="card" />
        <div className="tt-layer" data-layer="clip">
          <video
            ref={video}
            src={trip.video}
            poster={trip.poster}
            autoPlay={!reduced}
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
        {trip.photos.map((p, i) => (
          <div className="tt-layer" data-layer={`p${i}`} key={p}>
            <img src={p} alt="" />
          </div>
        ))}
      </div>
      <div className="tt-scrim" aria-hidden="true" />
      <div className="tt-grain" aria-hidden="true" />
      <div ref={flash} className="tt-flash" aria-hidden="true" />
      <div className="tt-text" aria-hidden="true" key={idx}>
        <ShotText shot={shot} narrow={narrow} duration={shot.ms} />
      </div>
      <div className="tt-bar tt-bar-top" aria-hidden="true">
        {genre === "documentary" && (
          <span ref={timecode} className="tt-timecode">
            00:00:00:00
          </span>
        )}
      </div>
      <div className="tt-bar tt-bar-bottom">
        <span className="tt-progress" aria-hidden="true">
          <span ref={progress} />
        </span>
      </div>
      <div className="tt-controls">
        <button
          type="button"
          className="tt-ctl"
          onClick={togglePause}
          aria-label={paused ? "Play the trailer" : "Pause the trailer"}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            {paused ? (
              <path d="M5 3l12 7-12 7z" fill="currentColor" />
            ) : (
              <path d="M5 3h4v14H5zM11 3h4v14h-4z" fill="currentColor" />
            )}
          </svg>
        </button>
        <button
          type="button"
          className="tt-ctl"
          onClick={onSound}
          aria-pressed={sound}
          aria-label={sound ? "Turn the score off" : "Turn the score on"}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 8v4h3l4 4V4L6 8z" fill="currentColor" />
            {sound ? (
              <path
                d="M13 7a4 4 0 010 6M15 4.5a7.5 7.5 0 010 11"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
              />
            ) : (
              <path d="M13 8l4 4M17 8l-4 4" stroke="currentColor" strokeWidth="1.6" />
            )}
          </svg>
        </button>
        <button ref={skip} type="button" className="tt-ctl tt-skip" onClick={onDone}>
          Skip
        </button>
      </div>
    </div>
  );
}
