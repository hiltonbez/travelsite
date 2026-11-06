import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Compass,
} from "lucide-react";
import type { Concept } from "./concepts";
import safari from "@/assets/safari.jpg";
import islands from "@/assets/islands.jpg";
import mauritius from "@/assets/places/mauritius-2.jpg";
import santorini from "@/assets/cities.jpg";
import capetown from "@/assets/places/capetown-1.jpg";

export const PHOTO = {
  family: "/images/studio/family.jpg",
  pool: "/images/studio/private-pool.jpg",
  rail: "/images/studio/rail.jpg",
  mountain: "/images/studio/mountain-adventure.jpg",
  alpine: "/images/studio/alpine.jpg",
  city: "/images/studio/city-night.jpg",
  architecture: "/images/studio/architecture.jpg",
  friends: "/images/studio/friends.jpg",
  beach: "/images/studio/coast.jpg",
  safari,
  islands,
  mauritius,
  santorini,
  capetown,
};

/** Video is never downloaded by the gallery miniatures. Offscreen and reduced-motion media stays still. */
export function AmbientFilm({
  src,
  poster,
  enabled = true,
  className = "",
}: {
  src: string;
  poster: string;
  enabled?: boolean;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = video.current;
    if (!el || !enabled) {
      el?.pause();
      return;
    }
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const observer = new IntersectionObserver(([entry]) => setActive(!!entry?.isIntersecting), {
      rootMargin: "0px",
      threshold: 0.05,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (enabled && active) void el.play().catch(() => {});
    else el.pause();
  }, [enabled, active, src]);
  return (
    <div className={`x-film ${className}`}>
      <img src={poster} alt="" aria-hidden="true" fetchPriority="high" decoding="async" />
      <video
        ref={video}
        src={enabled && active ? src : undefined}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

export function RouteDrawing({ variant = "globe" }: { variant?: "globe" | "trail" }) {
  return (
    <svg
      className={`x-route-art x-route-${variant}`}
      viewBox="0 0 700 560"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`globe-${variant}`}>
          <stop stopColor="currentColor" stopOpacity=".12" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        cx="350"
        cy="280"
        r="240"
        fill={`url(#globe-${variant})`}
        stroke="currentColor"
        strokeOpacity=".2"
      />
      <ellipse cx="350" cy="280" rx="130" ry="240" stroke="currentColor" strokeOpacity=".18" />
      <ellipse cx="350" cy="280" rx="210" ry="240" stroke="currentColor" strokeOpacity=".12" />
      <ellipse cx="350" cy="280" rx="240" ry="75" stroke="currentColor" strokeOpacity=".18" />
      <ellipse cx="350" cy="280" rx="240" ry="165" stroke="currentColor" strokeOpacity=".18" />
      <path d="M110 280h480M350 40v480" stroke="currentColor" strokeOpacity=".15" />
      <path
        className="x-flight-path"
        d="M250 415Q110 120 475 160Q600 220 415 360"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="5 7"
      />
      <circle className="x-route-pulse" cx="250" cy="415" r="8" stroke="currentColor" />
      <circle cx="250" cy="415" r="3" fill="currentColor" />
      <circle cx="475" cy="160" r="4" fill="currentColor" />
      <circle cx="415" cy="360" r="4" fill="currentColor" />
      <text x="222" y="445" fill="currentColor" fontSize="11" letterSpacing="3">
        JNB
      </text>
      <text x="490" y="153" fill="currentColor" fontSize="11" letterSpacing="3">
        LHR
      </text>
      <text x="435" y="382" fill="currentColor" fontSize="11" letterSpacing="3">
        MRU
      </text>
      <g className="x-route-traveller">
        <circle r="5" fill="currentColor" />
        <animateMotion
          dur="14s"
          repeatCount="indefinite"
          path="M250 415Q110 120 475 160Q600 220 415 360"
        />
      </g>
    </svg>
  );
}
export function SunDrawing({ className = "" }: { className?: string }) {
  return (
    <svg className={`x-sun-art ${className}`} viewBox="0 0 150 150" fill="none" aria-hidden="true">
      <circle cx="75" cy="75" r="27" stroke="currentColor" strokeWidth="2" />
      {Array.from({ length: 16 }, (_, i) => (
        <path
          key={i}
          d="M75 6v24"
          stroke="currentColor"
          strokeWidth="2"
          transform={`rotate(${i * 22.5} 75 75)`}
        />
      ))}
    </svg>
  );
}

export function HeroNav({ c }: { c: Concept }) {
  return (
    <header className="x-nav">
      <a className="x-brand" href={`/designs/${c.id}`}>
        {c.name}
        <span>{c.audience === "Luxury" ? "PRIVATE JOURNEYS" : "TRAVEL, PERSONALLY"}</span>
      </a>
      <nav aria-label={`${c.name} navigation`}>
        <a href="#discover">{c.audience === "Corporate" ? "The travel desk" : "Our worlds"}</a>
        <a href="#approach">The way we travel</a>
        <a className="x-nav-cta" href="#plan">
          {c.audience === "Luxury" ? "A private enquiry" : "Plan something extraordinary"}{" "}
          <ArrowUpRight size={15} />
        </a>
      </nav>
    </header>
  );
}
function Action({
  children = "Make it yours",
  href = "#discover",
}: {
  children?: React.ReactNode;
  href?: string;
}) {
  return (
    <a className="x-action" href={href}>
      {children}
      <ArrowUpRight size={19} />
    </a>
  );
}
function ScrollNote() {
  return (
    <span className="x-scroll-note">
      <span /> SCROLL TO DISCOVER <ArrowDown size={13} />
    </span>
  );
}

export function ExperienceHero({
  c,
  still = false,
  onMotionChange,
}: {
  c: Concept;
  still?: boolean;
  onMotionChange?: (enabled: boolean) => void;
}) {
  const [motion, setMotion] = useState(true);
  const [scene, setScene] = useState(c.id === "wildlings" ? 1 : 0);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setMotion(!media.matches);
    change();
    media.addEventListener?.("change", change);
    return () => media.removeEventListener?.("change", change);
  }, []);
  const moving = motion && !still;
  useEffect(() => {
    onMotionChange?.(moving);
  }, [moving, onMotionChange]);
  const scenes =
    c.audience === "Luxury"
      ? [
          { label: "Indian Ocean", image: PHOTO.mauritius, note: "An ocean to yourself." },
          {
            label: "African wilderness",
            image: PHOTO.safari,
            note: "Where the world falls quiet.",
          },
          { label: "Alpine journeys", image: PHOTO.alpine, note: "Take the beautifully slow way." },
        ]
      : c.audience === "Corporate"
        ? [
            { label: "Dubai", image: PHOTO.city, note: "JNB → DXB" },
            { label: "Cape Town", image: PHOTO.capetown, note: "JNB → CPT" },
            { label: "London", image: PHOTO.architecture, note: "JNB → LHR" },
          ]
        : [
            { label: "Ocean days", image: PHOTO.beach, note: "A little closer to paradise." },
            { label: "Wild places", image: PHOTO.safari, note: "Follow your curiosity." },
            { label: "Mountain air", image: PHOTO.alpine, note: "A different kind of high." },
          ];
  const current = scenes[scene]!;
  const sceneControl = (
    <div className="x-scene-control">
      <span>
        0{scene + 1} <i>/ 03</i>
      </span>
      <p>{current.label}</p>
      <button aria-label="Previous destination" onClick={() => setScene((scene + 2) % 3)}>
        <ChevronLeft size={17} />
      </button>
      <button aria-label="Next destination" onClick={() => setScene((scene + 1) % 3)}>
        <ChevronRight size={17} />
      </button>
    </div>
  );
  const film = (src: string, poster: string) =>
    still ? (
      <img className="x-image" src={poster} alt="" loading="lazy" decoding="async" />
    ) : (
      <AmbientFilm src={src} poster={poster} enabled={moving} />
    );
  return (
    <div
      className={`concept-shell x-shell theme-${c.id}`}
      style={{ "--x-paper": c.palette[1], "--x-accent": c.palette[2] } as CSSProperties}
    >
      <section className={`x-hero x-${c.id}`} data-motion={moving ? "on" : "off"}>
        <HeroNav c={c} />
        {c.id === "vector" && (
          <>
            <div className="x-vector-photo">
              {film("/videos/studio/city.mp4", PHOTO.architecture)}
              <span className="x-photo-grid" />
            </div>
            <div className="x-vector-copy">
              <p className="x-eyebrow">PRECISION IN EVERY DEPARTURE</p>
              <h1>
                Business has
                <br />
                <em>no borders.</em>
              </h1>
              <p>
                Neither should your ambition.
                <br />A personal travel desk for your next big move.
              </p>
              <Action>Set your next destination</Action>
            </div>
            <div className="x-vector-globe">
              <RouteDrawing />
            </div>
            <div className="x-agenda">
              <span>ON YOUR AGENDA</span>
              <b>{current.note}</b>
              <p>
                {current.label}
                <br />
                One journey. Every detail considered.
              </p>
              <a href="#discover">
                Build your travel brief <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="x-vector-rail">
              <ScrollNote />
              {sceneControl}
              <span>BUSINESS / BEYOND THE USUAL</span>
            </div>
          </>
        )}
        {c.id === "altitude" && (
          <>
            <div className="x-altitude-back">{film("/videos/studio/city.mp4", PHOTO.city)}</div>
            <div className="x-altitude-overlay" />
            <div className="x-altitude-coordinate">
              25°12′ N<br />
              55°16′ E
            </div>
            <div className="x-altitude-copy">
              <p className="x-eyebrow">GOOD BUSINESS STARTS BEFORE YOU ARRIVE</p>
              <h1>
                Arrive
                <br />
                <em>ahead.</em>
              </h1>
              <div>
                <p>
                  Clear schedules. Considered connections.
                  <br />
                  Your world, running beautifully.
                </p>
                <Action>Build your flight plan</Action>
              </div>
            </div>
            <div className="x-terminal-board">
              <span>YOUR NEXT MOVE</span>
              {scenes.map((s, i) => (
                <button key={s.label} onClick={() => setScene(i)} aria-pressed={scene === i}>
                  <small>0{i + 1}</small>
                  <strong>{s.note}</strong>
                  <span>{s.label}</span>
                  <ArrowUpRight size={18} />
                </button>
              ))}
            </div>
            <div className="x-bottom-line">
              <ScrollNote />
              <span>PERSONAL SERVICE / GLOBAL PERSPECTIVE</span>
            </div>
          </>
        )}
        {c.id === "little-big" && (
          <>
            <div className="x-family-doodle">
              <SunDrawing />
            </div>
            <div className="x-little-copy">
              <p className="x-eyebrow">A LITTLE LESS ROUTINE. A LOT MORE WONDER.</p>
              <h1>
                Small people.
                <br />
                <em>Huge stories.</em>
              </h1>
              <p>
                The sandy, splashy, still-talking-about-it
                <br />
                kind of family holiday.
              </p>
              <Action>Let the little ones choose</Action>
              <span className="x-handwritten">grown-ups get a holiday, too.</span>
            </div>
            <div className="x-family-photo">
              <img
                className="x-image"
                src={PHOTO.family}
                alt="Family spending time together at sunset on the beach"
              />
              <svg className="x-family-path" viewBox="0 0 500 500" aria-hidden="true">
                <path
                  d="M30 390Q-20 80 260 65Q440 60 445 310Q455 460 280 430"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="5 8"
                />
              </svg>
              <span className="x-family-badge">
                THE BEST
                <br />
                KIND OF
                <br />
                <b>together.</b>
              </span>
            </div>
            <div className="x-family-film">
              {film("/videos/studio/islands.mp4", PHOTO.beach)}
              <span>
                Just add
                <br />a little sunshine.
              </span>
            </div>
            <div className="x-family-footer">
              <span>01 — MORE TIME TOGETHER</span>
              <span>Beach days / Wild discoveries / Big memories</span>
            </div>
          </>
        )}
        {c.id === "wildlings" && (
          <>
            <div className="x-wild-background" key={scene}>
              <img
                className="x-image"
                src={current.image}
                alt={
                  scene === 0
                    ? "Sunlit tropical shoreline"
                    : scene === 1
                      ? "Elephants in an African safari landscape"
                      : "Mountain lake and forest"
                }
              />
            </div>
            <div className="x-wild-shade" />
            <div className="x-wild-rule">
              <span>FIELD GUIDE № 004</span>
              <span>FOR SMALL EXPLORERS & BIG DREAMERS</span>
            </div>
            <div className="x-wild-copy">
              <p className="x-eyebrow">SOME CLASSROOMS DON’T HAVE WALLS.</p>
              <h1>
                Let them
                <br />
                <em>go wild.</em>
              </h1>
              <p>
                First footprints. Wide eyes. Wild stories.
                <br />
                The world is waiting to meet your family.
              </p>
              <Action>Find our next adventure</Action>
            </div>
            <span className="x-wild-compass">
              <Compass />
              <small>LET CURIOSITY LEAD</small>
            </span>
            <div className="x-wild-track">
              <svg viewBox="0 0 300 150" aria-hidden="true">
                <path
                  d="M10 120C100-10 200 170 290 20"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="4 8"
                />
                <circle cx="290" cy="20" r="7" fill="currentColor" />
              </svg>
              <span>
                Leave only footprints.
                <br />
                Bring home everything else.
              </span>
            </div>
            <div className="x-bottom-line">
              <ScrollNote />
              {sceneControl}
            </div>
          </>
        )}
        {c.id === "maison" && (
          <>
            <div className="x-maison-heading">
              <p className="x-eyebrow">THE PRIVATE TRAVEL ATELIER</p>
              <span>
                INDIVIDUALLY COMPOSED.
                <br />
                IMPOSSIBLE TO REPEAT.
              </span>
            </div>
            <div className="x-maison-image" key={scene}>
              {scene === 0 ? (
                film("/videos/studio/islands.mp4", PHOTO.mauritius)
              ) : (
                <img className="x-image" src={current.image} alt={current.label} />
              )}
              <span className="x-image-corner">M.</span>
            </div>
            <div className="x-maison-copy">
              <h1>
                The art of
                <br />
                <em>being elsewhere.</em>
              </h1>
              <div>
                <p>
                  A place that stays with you.
                  <br />A journey that could only be yours.
                </p>
                <Action href="#discover">Discover the collection</Action>
              </div>
            </div>
            <div className="x-maison-edition">
              <span>COLLECTION 2026 — 27</span>
              <span>01 / PRIVATE WORLDS</span>
            </div>
            <div className="x-maison-control">{sceneControl}</div>
          </>
        )}
        {c.id === "nocturne" && (
          <>
            <div className="x-nocturne-back" key={scene}>
              {scene === 0 ? (
                <img
                  className="x-image"
                  src={PHOTO.safari}
                  alt="Elephants in the African wilderness"
                />
              ) : scene === 1 ? (
                film("/videos/studio/islands.mp4", PHOTO.islands)
              ) : (
                <img className="x-image" src={PHOTO.alpine} alt="A secluded alpine lake" />
              )}
            </div>
            <div className="x-nocturne-shade" />
            <div className="x-private-mark">
              N
              <span>
                PRIVATE
                <br />
                COLLECTION
              </span>
            </div>
            <div className="x-nocturne-copy">
              <p className="x-eyebrow">SOME PLACES CHANGE EVERYTHING.</p>
              <h1>
                Somewhere
                <br />
                <em>beyond.</em>
              </h1>
              <p>Far from the familiar. Entirely your own.</p>
              <Action>Enter the private collection</Action>
            </div>
            <div className="x-nocturne-index">
              {["The wilderness", "The ocean", "The mountains"].map((s, i) => (
                <button key={s} aria-pressed={scene === i} onClick={() => setScene(i)}>
                  <span>0{i + 1}</span>
                  <b>{s}</b>
                  <ArrowUpRight size={16} />
                </button>
              ))}
            </div>
            <div className="x-bottom-line">
              <span>PERSONALLY CURATED. QUIETLY EXCEPTIONAL.</span>
              <ScrollNote />
            </div>
          </>
        )}
        {c.id === "offscript" && (
          <>
            <div className="x-offscript-photo">
              <img
                className="x-image"
                src={PHOTO.friends}
                alt="Friends sharing an adventure together"
              />
              <span className="x-offscript-photo-label">
                REAL LIFE IS
                <br />
                OUT THERE.
              </span>
            </div>
            <div className="x-offscript-copy">
              <p className="x-eyebrow">YOUR GROUP CHAT NEEDS A PLOT TWIST.</p>
              <h1>
                TAKE
                <br />
                THE
                <br />
                <em>DETOUR.</em>
              </h1>
            </div>
            <div className="x-offscript-note">
              <span className="x-asterisk" aria-hidden="true">
                ✳
              </span>
              <p>
                Less someday.
                <br />
                More “remember when”.
              </p>
              <Action>Build your escape route</Action>
            </div>
            <div className="x-offscript-marquee" aria-hidden="true">
              <span>
                GOOD PEOPLE. GREAT PLACES. BAD WIFI. ↗ GOOD PEOPLE. GREAT PLACES. BAD WIFI. ↗{" "}
              </span>
            </div>
          </>
        )}
        {c.id === "sidequest" && (
          <>
            <div className="x-sidequest-coords">
              36.4618° N<br />
              25.3753° E<br />
              <span>LOCATION: ELSEWHERE</span>
            </div>
            <div className="x-sidequest-copy">
              <p className="x-eyebrow">FOR THE PLOT. FOR THE PEOPLE. FOR YOU.</p>
              <h1>
                OUT OF
                <br />
                <em>THE ORDINARY.</em>
              </h1>
              <p>
                Catch a train. Miss a turn. Find your people.
                <br />
                The best parts were never in the plan.
              </p>
              <Action>Choose your sidequest</Action>
            </div>
            <div className="x-sidequest-collage">
              <figure>
                <img className="x-image" src={PHOTO.santorini} alt="Santorini at sunset" />
                <figcaption>01 / CHASE THE SUN</figcaption>
              </figure>
              <figure>
                {film("/videos/studio/coast.mp4", PHOTO.beach)}
                <figcaption>02 / FOLLOW THE COAST</figcaption>
              </figure>
              <figure>
                <img
                  className="x-image"
                  src={PHOTO.friends}
                  alt="Friends enjoying a trip together"
                />
                <figcaption>03 / FIND YOUR PEOPLE</figcaption>
              </figure>
            </div>
            <div className="x-sidequest-ticket">
              <span>ONE WAY TO A GOOD STORY</span>
              <b>YOU → EVERYWHERE</b>
              <span>NO SCRIPT REQUIRED ↗</span>
            </div>
          </>
        )}
        {c.id === "meridian" && (
          <>
            <div className="x-meridian-copy">
              <p className="x-eyebrow">THE WORLD, AT A MORE HUMAN PACE.</p>
              <h1>
                A world
                <br />
                <em>well travelled.</em>
              </h1>
              <div>
                <p>
                  Extraordinary places.
                  <br />
                  Thoughtful journeys.
                  <br />
                  The simple pleasure of going.
                </p>
                <Action>Find your next chapter</Action>
              </div>
            </div>
            <div className="x-meridian-panorama">
              <img
                className="x-image"
                src={PHOTO.alpine}
                alt="A wooden boat on a still alpine lake beneath mountains"
              />
              <span className="x-meridian-caption">
                There’s more to see
                <br />
                <em>when you slow down.</em>
              </span>
              <SunDrawing />
            </div>
            <div className="x-meridian-footer">
              <span>PERSONAL TRAVEL / WIDE OPEN POSSIBILITIES</span>
              <ScrollNote />
            </div>
          </>
        )}
        {c.id === "postcard" && (
          <>
            <div className="x-postcard-film">
              {film("/videos/studio/islands.mp4", PHOTO.islands)}
            </div>
            <div className="x-postcard-shade" />
            <div className="x-postcard-copy">
              <p className="x-eyebrow">YOUR NEXT GREAT STORY IS OUT THERE.</p>
              <h1>
                Hello,
                <br />
                <em>somewhere.</em>
              </h1>
              <p>
                That feeling when the world opens up.
                <br />
                Let’s find it again.
              </p>
              <Action>Find a place to fall for</Action>
            </div>
            <div className="x-postal-mark">
              <SunDrawing />
              <span>
                WISH YOU
                <br />
                WERE HERE.
              </span>
            </div>
            <div className="x-postcard-bottom">
              <span>FROM OUR WORLD, TO YOURS.</span>
              <a href="#discover">
                Islands <ArrowUpRight size={14} />
              </a>
              <a href="#discover">
                Wild places <ArrowUpRight size={14} />
              </a>
              <a href="#discover">
                Slow journeys <ArrowUpRight size={14} />
              </a>
              <ScrollNote />
            </div>
          </>
        )}
        {!still && (
          <button
            className="x-motion-toggle"
            onClick={() => setMotion(!motion)}
            aria-label={motion ? "Pause ambient motion" : "Play ambient motion"}
            aria-pressed={!motion}
          >
            {motion ? <Pause size={12} /> : <Play size={12} />}
            <span>{motion ? "Pause motion" : "Play motion"}</span>
          </button>
        )}
      </section>
    </div>
  );
}
