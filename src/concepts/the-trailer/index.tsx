// The Trailer: an old cinema whose box office is the trip planner. Three quick choices, a trailer made from them,
// then a poster for the holiday with "Get tickets" as the price request. The screenplay is in script.ts, the
// projector in TrailerPlayer.tsx and the optional score in score.ts.
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
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
import { Score } from "./score";
import {
  CASTS,
  castOf,
  filmTitle,
  GENRES,
  HOUSE_GENRE,
  RATING_GAG,
  shortName,
  starName,
  surprise,
  TAGLINE,
  titleText,
  tripBySlug,
  type CastId,
  type Genre,
} from "./script";
import { TrailerPlayer } from "./TrailerPlayer";

export const FONTS =
  "family=Bebas+Neue&family=Playfair+Display:ital,wght@0,600;0,800;1,500;1,800&family=Bowlby+One&family=Courier+Prime:wght@400;700&family=Fredoka:wght@500;700&family=Barlow+Condensed:wght@400;500;600";

const SURPRISE = "surprise";
type Film = { genre: Genre; cast: CastId; star: string; trip: ConceptTrip };
const tel = `tel:${contact.phoneE164}`;
const mailto = `mailto:${contact.email}`;

/** A row of real bulbs: dim glass, with a lit layer the chase animates. Three phases, so the light appears to run. */
function Bulbs({ n, className }: { n: number; className: string }) {
  return (
    <span className={`b-row ${className}`} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`b b${i % 3}`} />
      ))}
    </span>
  );
}

/** Changeable marquee letters on a backlit board. Only the letters that changed get flipped on by the usher. */
function Letters({ text, lit }: { text: string; lit: boolean }) {
  return (
    <span className={`lb-row ${lit ? "is-lit" : ""}`} aria-hidden="true">
      {[...text].map((ch, i) => (
        <span
          key={`${i}-${ch}`}
          className="lb-ch"
          style={{ "--r": `${(((i * 37) % 7) - 3) * 0.55}deg`, "--i": i } as CSSProperties}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

function Seats({ n }: { n: number }) {
  return (
    <svg className="seats" viewBox="0 0 96 22" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <path
          key={i}
          d={`M${i * 16 + 2} 8a5 5 0 015-5h2a5 5 0 015 5v7h-12zM${i * 16 + 1} 16h14v4h-14z`}
          fill="currentColor"
          opacity={i < n ? 1 : 0.18}
        />
      ))}
    </svg>
  );
}

function Stub({
  n,
  label,
  value,
  active,
  onClick,
}: {
  n: number;
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`stub ${active ? "is-on" : ""} ${value ? "is-done" : ""}`}
      onClick={onClick}
      aria-current={active ? "step" : undefined}
    >
      <span className="stub-n">{n}</span>
      <span className="stub-l">{label}</span>
      <span className="stub-v">{value || " "}</span>
    </button>
  );
}

/** The poster. Moving footage behind, the name in lights above the title, and the rating gag doing the sample price. */
function Poster({ film }: { film: Film }) {
  const { genre, trip } = film;
  const title = filmTitle(genre, trip);
  const star = starName(film.star, film.cast);
  const cast = castOf(film.cast);
  const len = Math.max(5, ...title.map((l) => l.length));
  return (
    <article className={`poster g-${genre}`} aria-label={`Film poster: ${titleText(genre, trip)}`}>
      <Clip src={trip.video} poster={trip.poster} className="poster-clip" />
      <div className="poster-shade" />
      <div className="poster-in">
        <p className="poster-pre">{BRAND.name} Pictures presents</p>
        <p className="poster-star">{star}</p>
        <div className="poster-mid">
          <h2 className="poster-title" style={{ "--len": len } as CSSProperties}>
            {title.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h2>
          <p className="poster-tag">{TAGLINE[genre]}</p>
        </div>
        <div className="poster-foot">
          <div className="poster-rating">
            <strong>Rated {rand(trip.price)}</strong>
            <span>{RATING_GAG[genre]} Sample price, per person sharing.</span>
          </div>
          <p className="poster-bill">
            Starring {star} {cast.bill}. Directed by you. Screenplay by {BRAND.name}. Filmed on
            location in {trip.region}. Luggage by whoever’s turn it is.
          </p>
          <p className="poster-soon">Now booking</p>
        </div>
      </div>
    </article>
  );
}

export function Concept() {
  const reduced = useReducedMotion();
  const [genre, setGenre] = useState<Genre | null>(null);
  const [cast, setCast] = useState<CastId | null>(null);
  const [star, setStar] = useState("");
  const [loc, setLoc] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [view, setView] = useState<"box" | "trailer" | "poster">("box");
  const [film, setFilm] = useState<Film | null>(null);
  const [sound, setSound] = useState(false);
  const [buzz, setBuzz] = useState(0);
  const [nudge, setNudge] = useState(0);
  const [copied, setCopied] = useState(false);
  const [featured, setFeatured] = useState(0);
  const [nsSeen, setNsSeen] = useState(false);
  const score = useRef<Score | null>(null);
  const stepHead = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const playBtn = useRef<HTMLButtonElement>(null);
  const posterHead = useRef<HTMLDivElement>(null);
  const nsScreen = useRef<HTMLDivElement>(null);

  // A link from a friend sets up the same film, ready to roll.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const g = q.get("g") as Genre | null;
    const c = q.get("c") as CastId | null;
    const t = q.get("t");
    if (!g || !GENRES.some((x) => x.id === g)) return;
    setGenre(g);
    if (c && CASTS.some((x) => x.id === c)) setCast(c);
    if (t && TRIPS.some((x) => x.slug === t)) setLoc(t);
    setStar((q.get("s") ?? "").slice(0, 16));
    setStep(2);
  }, []);

  useEffect(() => {
    if (moved.current) stepHead.current?.focus({ preventScroll: true });
    moved.current = false;
  }, [step]);

  // The bulbs run faster for a moment after every choice.
  useEffect(() => {
    if (!buzz) return;
    const id = window.setTimeout(() => setBuzz(0), 900);
    return () => window.clearTimeout(id);
  }, [buzz]);

  // The second screen only starts its footage once someone scrolls down to it.
  useEffect(() => {
    const el = nsScreen.current;
    if (!el || nsSeen) return;
    const io = new IntersectionObserver(
      (seen) => {
        if (seen.some((e) => e.isIntersecting)) setNsSeen(true);
      },
      { rootMargin: "100px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [nsSeen, view]);

  useEffect(() => () => score.current?.close(), []);

  const goTo = (n: number) => {
    moved.current = true;
    setStep(n);
  };
  const showPlay = () =>
    window.requestAnimationFrame(() =>
      playBtn.current?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" }),
    );
  const blip = () => {
    setBuzz((b) => b + 1);
    if (sound) score.current?.cue("tick");
  };

  const toggleSound = useCallback(() => {
    if (!score.current) score.current = new Score();
    score.current.resume();
    setSound((s) => {
      if (!s) score.current?.cue("chime");
      return !s;
    });
  }, []);

  const roll = (f: Film) => {
    score.current?.resume();
    setFilm(f);
    setView("trailer");
  };

  const ready = genre && cast && loc;
  const play = () => {
    if (!genre) {
      goTo(0);
      setNudge((n) => n + 1);
      return;
    }
    if (!cast) {
      goTo(1);
      setNudge((n) => n + 1);
      return;
    }
    if (!loc) {
      goTo(2);
      setNudge((n) => n + 1);
      return;
    }
    roll({ genre, cast, star, trip: loc === SURPRISE ? surprise(genre, cast) : tripBySlug(loc) });
  };

  const finish = useCallback(() => {
    score.current?.stopBed();
    setView("poster");
    window.scrollTo({ top: 0 });
    window.requestAnimationFrame(() => posterHead.current?.focus({ preventScroll: true }));
  }, []);

  const backToBox = () => {
    setView("box");
    setStep(0);
    window.scrollTo({ top: 0 });
  };

  const share = async () => {
    if (!film) return;
    const q = new URLSearchParams({ g: film.genre, c: film.cast, t: film.trip.slug });
    if (film.star.trim()) q.set("s", film.star.trim());
    const url = `${window.location.origin}${window.location.pathname}?${q}`;
    const text = `${starName(film.star, film.cast)} is starring in ${titleText(film.genre, film.trip)}. Watch the trailer.`;
    try {
      if (navigator.share) await navigator.share({ title: "My holiday trailer", text, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2400);
      }
    } catch {
      // They cancelled the share sheet, or the clipboard said no. Nothing to do.
    }
  };

  const genreInfo = GENRES.find((g) => g.id === genre);
  const castInfo = cast ? castOf(cast) : null;
  const chosenTrip = loc && loc !== SURPRISE ? tripBySlug(loc) : null;
  const typed = star.trim().toUpperCase();
  const board = [
    genreInfo
      ? `${genre === "action" ? "AN" : "A"} ${genreInfo.label.toUpperCase()}${genre === "family" ? " FILM" : ""}`
      : "PICK A GENRE",
    cast
      ? `STARRING ${typed || starName("", cast).toUpperCase()}`
      : typed
        ? `STARRING ${typed}`
        : "PICK YOUR CAST",
    loc === SURPRISE
      ? "LOCATION: TOP SECRET"
      : chosenTrip
        ? `IN ${shortName(chosenTrip).toUpperCase()}`
        : "PICK A LOCATION",
  ];
  const boardLen = Math.max(20, ...board.map((l) => l.length));
  const feat = TRIPS[featured] as ConceptTrip;
  const title = film ? titleText(film.genre, film.trip) : "";

  return (
    <main className={`c-the-trailer ${buzz ? "is-buzzing" : ""}`}>
      <div className="grain" aria-hidden="true" />

      <header className="house">
        <p className="house-name">
          {BRAND.name} <em>Picture House</em>
        </p>
        <a className="house-tel" href={tel}>
          Box office: {contact.phoneDisplay}
        </a>
      </header>

      {view !== "poster" && (
        <section className="canopy" aria-label="The cinema marquee">
          <div className="canopy-frame">
            <Bulbs n={36} className="b-top" />
            <Bulbs n={4} className="b-left" />
            <div
              className="board"
              style={{ "--blen": boardLen } as CSSProperties}
              key={nudge}
              data-nudge={nudge > 0 ? "1" : undefined}
            >
              <p className="tt-sr" aria-live="polite">
                {board.join(". ")}
              </p>
              {board.map((line, i) => (
                <Letters key={i} text={line} lit={i === 0 ? !!genre : i === 1 ? !!cast : !!loc} />
              ))}
            </div>
            <Bulbs n={4} className="b-right" />
            <Bulbs n={36} className="b-bottom" />
          </div>
        </section>
      )}

      {view === "poster" && film ? (
        <section className="premiere" aria-label="Your film">
          <div className="premiere-poster canopy-frame">
            <Bulbs n={16} className="b-top" />
            <Bulbs n={22} className="b-left" />
            <Poster film={film} />
            <Bulbs n={22} className="b-right" />
            <Bulbs n={16} className="b-bottom" />
          </div>
          <div className="window">
            <div ref={posterHead} tabIndex={-1} className="premiere-head">
              <p className="window-sign">Now booking</p>
              <h1>
                {title}. Starring {starName(film.star, film.cast)}.
              </h1>
            </div>
            <div className="admission">
              <span className="admission-l">Admission from</span>
              <strong>{rand(film.trip.price)}</strong>
              <span className="admission-n">
                per person sharing. A sample price, for this demo agency.
              </span>
            </div>
            <QuoteForm
              key={title}
              summary={title}
              button="Get tickets"
              classes={{
                form: "tix",
                field: "tix-f",
                label: "tix-l",
                input: "tix-i",
                button: "tix-b",
                done: "tix-done",
                note: "tix-note",
              }}
            >
              <p className="tix-lead">
                Hold my seats for <em>{title}</em>. Ask {BRAND.name} for the real price and dates.
              </p>
            </QuoteForm>
            <dl className="facts">
              <div>
                <dt>Running time</dt>
                <dd>{film.trip.nights} nights</dd>
              </div>
              <div>
                <dt>Getting there</dt>
                <dd>{film.trip.flight}</dd>
              </div>
            </dl>
            <p className="premiere-intro">{film.trip.intro}</p>
            <ol className="scenes">
              {film.trip.days.map(([d, what], i) => (
                <li key={d}>
                  <span>Scene {i + 1}</span>
                  <strong>{d}</strong>
                  <em>{what}</em>
                </li>
              ))}
            </ol>
            <div className="premiere-more">
              <button type="button" className="mini" onClick={() => roll(film)}>
                Run it again
              </button>
              <button type="button" className="mini" onClick={backToBox}>
                Make another film
              </button>
              <button type="button" className="mini" onClick={() => void share()}>
                {copied ? "Link copied" : "Send it to a friend"}
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="foyer" aria-label="Box office">
          <div className="window">
            <h1 className="window-sign">Box office</h1>
            <p className="window-lead">
              Three quick choices and we’ll cut the trailer for your holiday. You’re the star.
            </p>
            <div className="stubs">
              <Stub
                n={1}
                label="Genre"
                value={genreInfo?.label ?? ""}
                active={step === 0}
                onClick={() => goTo(0)}
              />
              <Stub
                n={2}
                label="Cast"
                value={castInfo?.label ?? ""}
                active={step === 1}
                onClick={() => goTo(1)}
              />
              <Stub
                n={3}
                label="Location"
                value={loc === SURPRISE ? "Surprise" : chosenTrip ? shortName(chosenTrip) : ""}
                active={step === 2}
                onClick={() => goTo(2)}
              />
            </div>

            {step === 0 && (
              <div className="step" key="genre">
                <h2 ref={stepHead} tabIndex={-1} className="step-q">
                  What kind of holiday is it?
                </h2>
                <div className="tix-list tix-genres">
                  {GENRES.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      aria-pressed={genre === g.id}
                      className={`ticket g-${g.id} ${genre === g.id ? "is-on" : ""}`}
                      onClick={() => {
                        setGenre(g.id);
                        blip();
                        goTo(1);
                      }}
                    >
                      <span className="ticket-t">{g.label}</span>
                      <span className="ticket-h">{g.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="step" key="cast">
                <h2 ref={stepHead} tabIndex={-1} className="step-q">
                  Who’s in it?
                </h2>
                <div className="tix-list tix-cast">
                  {CASTS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={cast === c.id}
                      className={`ticket ${cast === c.id ? "is-on" : ""}`}
                      onClick={() => {
                        setCast(c.id);
                        blip();
                      }}
                    >
                      <span className="ticket-p">{c.label}</span>
                      <Seats n={c.seats} />
                    </button>
                  ))}
                </div>
                <label className="star">
                  <span>Whose name goes in lights?</span>
                  <input
                    value={star}
                    maxLength={16}
                    onChange={(e) => setStar(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && cast) goTo(2);
                    }}
                    placeholder="Type the star’s name"
                    autoComplete="given-name"
                  />
                </label>
                <button
                  type="button"
                  className="mini mini-next"
                  disabled={!cast}
                  onClick={() => goTo(2)}
                >
                  {cast ? "On to the location" : "Pick your cast first"}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="step" key="loc">
                <h2 ref={stepHead} tabIndex={-1} className="step-q">
                  Where was it shot?
                </h2>
                <div className="tix-list tix-locs">
                  {TRIPS.map((t) => (
                    <button
                      key={t.slug}
                      type="button"
                      aria-pressed={loc === t.slug}
                      className={`ticket ticket-loc ${loc === t.slug ? "is-on" : ""}`}
                      onClick={() => {
                        setLoc(t.slug);
                        blip();
                        showPlay();
                      }}
                    >
                      <img src={t.photos[0]} alt="" loading="lazy" />
                      <span className="ticket-p">{shortName(t)}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-pressed={loc === SURPRISE}
                    className={`ticket ticket-loc ticket-q ${loc === SURPRISE ? "is-on" : ""}`}
                    onClick={() => {
                      setLoc(SURPRISE);
                      blip();
                      showPlay();
                    }}
                  >
                    <span className="ticket-mark" aria-hidden="true">
                      ?
                    </span>
                    <span className="ticket-p">Surprise me</span>
                  </button>
                </div>
              </div>
            )}

            <div className="action-row">
              <button
                ref={playBtn}
                type="button"
                className={`play ${ready ? "is-ready" : ""}`}
                onClick={play}
                disabled={view === "trailer"}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 4l14 8-14 8z" fill="currentColor" />
                </svg>
                <span>
                  {ready
                    ? "Play my trailer"
                    : !genre
                      ? "Pick a genre"
                      : !cast
                        ? "Pick your cast"
                        : "Pick a location"}
                </span>
              </button>
              <button
                type="button"
                className={`sound ${sound ? "is-on" : ""}`}
                onClick={toggleSound}
                aria-pressed={sound}
              >
                <span className="sound-dot" aria-hidden="true" />
                Score {sound ? "on" : "off"}
              </button>
            </div>
          </div>

          <div className="auditorium">
            <span className="beam" aria-hidden="true" />
            <div className={`screen ${genre ? `g-${genre}` : ""}`}>
              {chosenTrip && view === "box" ? (
                <Clip src={chosenTrip.video} poster={chosenTrip.poster} className="screen-clip" />
              ) : (
                <div className="leader" aria-hidden="true">
                  <span className="leader-sweep" />
                  <span className="leader-ring" />
                  <span className="leader-n">{loc === SURPRISE ? "?" : "3"}</span>
                </div>
              )}
              <span className="screen-bar screen-bar-t" aria-hidden="true" />
              <span className="screen-bar screen-bar-b" aria-hidden="true" />
              <p className="screen-sample" aria-hidden="true" key={genre ?? "none"}>
                {genre === "romance"
                  ? "This winter"
                  : genre === "family"
                    ? "Seven sleeps."
                    : genre === "comedy"
                      ? "(Fine. One email.)"
                      : genre === "documentary"
                        ? "A remarkable migration begins."
                        : genre === "action"
                          ? "ZERO EMAILS."
                          : "Coming soon: you"}
              </p>
            </div>
            <div className="rows" aria-hidden="true">
              {Array.from({ length: 11 }, (_, i) => (
                <span key={i} className="row-seat" />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="showing" aria-labelledby="ns-title">
        <div className="strip" aria-hidden="true">
          <div className="strip-run">
            {[...TRIPS, ...TRIPS].map((t, i) => (
              <span className="strip-frame" key={i}>
                <img src={t.photos[(i % 3) as 0 | 1 | 2]} alt="" loading="lazy" />
              </span>
            ))}
          </div>
        </div>
        <h2 id="ns-title" className="showing-title">
          Now showing
        </h2>
        <p className="showing-lead">
          Every holiday on our books, on all six screens. Prices are sample prices, per person
          sharing.
        </p>
        <div className="showing-grid">
          <ol className="listings">
            {TRIPS.map((t, i) => (
              <li
                key={t.slug}
                className={`listing ${featured === i ? "is-on" : ""}`}
                onPointerEnter={() => setFeatured(i)}
                onFocusCapture={() => setFeatured(i)}
              >
                <span className="listing-no">Screen {i + 1}</span>
                <img className="listing-pic" src={t.photos[1]} alt="" loading="lazy" />
                <div className="listing-body">
                  <h3>{t.name}</h3>
                  <p className="listing-tag">{t.tagline}</p>
                  <p className="listing-meta">
                    {t.nights} nights · {t.flight}
                  </p>
                </div>
                <div className="listing-buy">
                  <span className="listing-price">{rand(t.price)}</span>
                  <button
                    type="button"
                    className="mini"
                    aria-label={`Watch the ${shortName(t)} trailer`}
                    onClick={() => {
                      const f: Film = {
                        genre: HOUSE_GENRE[t.slug] ?? "romance",
                        cast: cast ?? "two",
                        star,
                        trip: t,
                      };
                      setGenre(f.genre);
                      setCast(f.cast);
                      setLoc(t.slug);
                      setStep(2);
                      roll(f);
                    }}
                  >
                    Trailer
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <div className="second-screen" ref={nsScreen}>
            {nsSeen && view !== "trailer" && (
              <Clip src={feat.video} poster={feat.poster} className="second-clip" />
            )}
            <p className="second-cap">
              <span>{feat.name}</span>
              {feat.region}
            </p>
          </div>
        </div>
      </section>

      <footer className="kiosk">
        <Bulbs n={36} className="b-top b-foot" />
        <p className="kiosk-big">Prefer a person at the box office?</p>
        <p className="kiosk-links">
          <a href={tel}>{contact.phoneDisplay}</a>
          <a href={contact.whatsapp}>WhatsApp</a>
          <a href={mailto}>{contact.email}</a>
        </p>
        <p className="kiosk-small">
          {BRAND.name}. Every film here is a real holiday we can book. This page is a design sample,
          and nothing on it is sent anywhere.
        </p>
      </footer>

      {view === "trailer" && film && (
        <TrailerPlayer
          genre={film.genre}
          cast={film.cast}
          star={film.star}
          trip={film.trip}
          reduced={reduced}
          sound={sound}
          score={score}
          onSound={toggleSound}
          onDone={finish}
        />
      )}
    </main>
  );
}
