import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { AmbientFilm, PHOTO, HeroNav } from "./experience-hero";
import type { Concept, Audience } from "./concepts";

const WORLDS = {
  Corporate: [
    {
      title: "Beyond borders.",
      place: "THE CITY / YOUR NEXT CHAPTER",
      image: PHOTO.architecture,
      film: "city",
      note: "From the first conversation to the next big opportunity.",
      word: "AMBITION",
      destination: "A city business journey",
    },
    {
      title: "A different perspective.",
      place: "CAPE TOWN / WORK MEETS WORLD",
      image: PHOTO.capetown,
      film: "",
      note: "Make room for a change of scene between the meetings.",
      word: "PERSPECTIVE",
      destination: "Cape Town",
    },
    {
      title: "Space to think.",
      place: "THE OFFSITE / OUT OF OFFICE",
      image: PHOTO.alpine,
      film: "",
      note: "Bring the team together somewhere that opens minds.",
      word: "POSSIBILITY",
      destination: "A mountain team offsite",
    },
  ],
  Family: [
    {
      title: "Wild little wonders.",
      place: "CHAPTER 01 / INTO THE WILD",
      image: PHOTO.safari,
      film: "",
      note: "The moment they spot something you almost missed.",
      word: "WONDER",
      destination: "A family wildlife adventure",
    },
    {
      title: "Just add sunshine.",
      place: "CHAPTER 02 / SALT IN YOUR HAIR",
      image: PHOTO.beach,
      film: "coast",
      note: "Bare feet. Big smiles. Absolutely nowhere to rush.",
      word: "PLAY",
      destination: "A family beach holiday",
    },
    {
      title: "The long way home.",
      place: "CHAPTER 03 / LITTLE EXPLORERS",
      image: PHOTO.rail,
      film: "",
      note: "Window-seat stories they will tell for years.",
      word: "EXPLORE",
      destination: "A family rail journey",
    },
  ],
  Luxury: [
    {
      title: "Elsewhere, entirely.",
      place: "THE PRIVATE COLLECTION / OCEAN",
      image: PHOTO.islands,
      film: "islands",
      note: "Some places change the way you feel about time.",
      word: "Elsewhere",
      destination: "An Indian Ocean retreat",
    },
    {
      title: "The art of stillness.",
      place: "THE PRIVATE COLLECTION / RETREAT",
      image: PHOTO.pool,
      film: "",
      note: "A quieter world. A beautifully considered escape.",
      word: "Stillness",
      destination: "A considered resort escape",
    },
    {
      title: "Time, beautifully spent.",
      place: "THE PRIVATE COLLECTION / RAIL",
      image: PHOTO.rail,
      film: "",
      note: "Let the journey become the destination.",
      word: "Unhurried",
      destination: "A luxury rail journey",
    },
  ],
  Youth: [
    {
      title: "Get out. Get lost. Get living.",
      place: "NO SCRIPT / JUST GO",
      image: PHOTO.friends,
      film: "",
      note: "The best stories never started in the group chat.",
      word: "GO SOMEWHERE",
      destination: "A trip with friends",
    },
    {
      title: "Chase the last light.",
      place: "COAST MODE / ON",
      image: PHOTO.beach,
      film: "coast",
      note: "One more sunset. One less reason to go home.",
      word: "STAY OUT",
      destination: "A coastal group adventure",
    },
    {
      title: "Take the outside route.",
      place: "LESS SCROLLING / MORE SKY",
      image: PHOTO.mountain,
      film: "",
      note: "Find your people somewhere beyond your usual.",
      word: "FEEL SOMETHING",
      destination: "A mountain adventure with friends",
    },
  ],
  Classic: [
    {
      title: "The world can wait. You shouldn’t.",
      place: "THE TRAVEL JOURNAL / MOUNTAINS",
      image: PHOTO.alpine,
      film: "",
      note: "Take a breath. Find a place that feels like you.",
      word: "Somewhere",
      destination: "An alpine escape",
    },
    {
      title: "A little closer to paradise.",
      place: "THE TRAVEL JOURNAL / ISLANDS",
      image: PHOTO.mauritius,
      film: "islands",
      note: "Warm water, open horizons and time to be together.",
      word: "Further",
      destination: "An Indian Ocean holiday",
    },
    {
      title: "Follow your curiosity.",
      place: "THE TRAVEL JOURNAL / DISCOVERY",
      image: PHOTO.safari,
      film: "",
      note: "Extraordinary moments. Thoughtfully put together.",
      word: "Discover",
      destination: "A wildlife journey",
    },
  ],
} satisfies Record<
  Audience,
  {
    title: string;
    place: string;
    image: string;
    film: string;
    note: string;
    word: string;
    destination: string;
  }[]
>;

type World = (typeof WORLDS)[Audience][number];
const EDITIONS: Record<string, Partial<World>[]> = {
  maison: [
    {
      image: "/images/studio/maison-rail-editorial.png",
      film: "maison-rail",
      place: "THE MAISON JOURNAL / THE ART OF THE JOURNEY",
      note: "A window onto somewhere remarkable. A journey made entirely yours.",
      destination: "An illustrative luxury rail journey",
    },
    {},
    {},
  ],
  altitude: [
    {
      title: "Arrive ahead.",
      word: "NEXT DEPARTURE",
      place: "ALTITUDE / THE BUSINESS TRAVEL DESK",
      image: PHOTO.city,
      note: "Good business travel starts long before the meeting.",
    },
    {
      title: "Bring everyone together.",
      word: "IN GOOD COMPANY",
      place: "ALTITUDE / TEAMS WITH PLACES TO GO",
      note: "A shared destination. Every individual detail considered.",
    },
    {
      title: "Change the setting.",
      word: "FRESH THINKING",
      place: "ALTITUDE / THE ART OF THE OFFSITE",
      note: "Some of the best ideas begin outside the office.",
    },
  ],
  "little-big": [
    {
      title: "Little people. Big yes.",
      word: "HAPPY DAYS",
      place: "LITTLE / BIG — HOLIDAYS FOR YOUR WHOLE WORLD",
      image: PHOTO.family,
      note: "A little sand in their shoes. A lot of joy in your days.",
    },
    {
      title: "One more splash?",
      word: "YES, AGAIN",
      place: "THE FAMILY ALBUM / SUNSHINE EDITION",
      note: "The holiday they’ll want to do all over again.",
    },
    {
      title: "Are we there? Already?",
      word: "ALL ABOARD",
      place: "THE FAMILY ALBUM / WINDOW SEAT STORIES",
      note: "Turn the getting there into part of the adventure.",
    },
  ],
  nocturne: [
    {
      title: "The world, quietly yours.",
      word: "Nocturne",
      place: "PRIVATE JOURNEYS / A QUIETER PERSPECTIVE",
      image: PHOTO.safari,
      film: "",
      destination: "A private coastal retreat",
      note: "Go beyond the familiar. Find a place that stays with you.",
    },
    {
      title: "An unhurried escape.",
      word: "Sanctuary",
      place: "PRIVATE JOURNEYS / THE QUIETER HOURS",
      note: "Space, stillness, and the details you care about.",
    },
    {
      title: "Take the remarkable way.",
      word: "Passage",
      place: "PRIVATE JOURNEYS / A DIFFERENT PACE",
      note: "A journey as considered as the place it leads.",
    },
  ],
  sidequest: [
    {
      title: "Plot twist: you went.",
      word: "TAKE THE DETOUR",
      place: "SIDEQUEST / STORIES START SOMEWHERE",
      image: PHOTO.santorini,
      note: "New coordinates. New people. A very good reason to go.",
    },
    {
      title: "Currently: somewhere good.",
      word: "OFFLINE LOOKS GOOD",
      place: "SIDEQUEST / FOLLOW THE COAST",
      note: "Trade the saved posts for a place you’ve actually been.",
    },
    {
      title: "A little further out.",
      word: "SIDEQUEST ACCEPTED",
      place: "SIDEQUEST / OUTSIDE YOUR USUAL",
      note: "The detour might be the best part of the trip.",
    },
  ],
  postcard: [
    {
      title: "Wish you were here.",
      word: "With love",
      place: "POSTCARD / SENT FROM SOMEWHERE BEAUTIFUL",
      image: PHOTO.beach,
      film: "coast",
      destination: "A coastal holiday",
      note: "Picture the feeling. We’ll help you find the place.",
    },
    {
      title: "A place to come back to.",
      word: "Remember",
      place: "POSTCARD / YOUR NEXT FAVOURITE PLACE",
      note: "Some holidays become part of the family story.",
    },
    {
      title: "Stories worth bringing home.",
      word: "Discover",
      place: "POSTCARD / THE WORLD IS STILL WONDERFUL",
      note: "A little discovery. A little downtime. Personally planned.",
    },
  ],
};
const EDITORIAL_OPENINGS: Record<string, string> = {
  vector: "/images/studio/vector-editorial.webp",
  altitude: "/images/studio/altitude-editorial.webp",
  "little-big": "/images/studio/little-big-editorial.webp",
  wildlings: "/images/studio/wildlings-editorial.webp",
  nocturne: "/images/studio/nocturne-editorial.webp",
  offscript: "/images/studio/offscript-editorial.webp",
  sidequest: "/images/studio/sidequest-editorial.webp",
  meridian: "/images/studio/meridian-editorial.webp",
  postcard: "/images/studio/postcard-editorial.webp",
};
function worldsFor(c: Concept) {
  return WORLDS[c.audience].map((world, i) => ({
    ...world,
    ...EDITIONS[c.id]?.[i],
    ...(i === 0 && EDITORIAL_OPENINGS[c.id]
      ? { image: EDITORIAL_OPENINGS[c.id], film: c.id === "altitude" ? "altitude-lounge" : "" }
      : {}),
  }));
}
const DISCOVERY_COPY: Record<string, [string, string, string]> = {
  vector: ["A WORLD BEYOND THE OFFICE", "Where ambition goes.", "How you get there matters."],
  altitude: ["YOUR NEXT DEPARTURE", "A better working journey.", "Start with the setting."],
  wildlings: ["FOLLOW THE LITTLE EXPLORERS", "Big eyes. Wide worlds.", "Let curiosity choose."],
  "little-big": [
    "LET EVERYONE HAVE A SAY",
    "What’s your happy place?",
    "Pick a little possibility.",
  ],
  maison: ["THE ART OF CHOOSING WELL", "Somewhere that moves you.", "A collection, quietly yours."],
  nocturne: ["THE PRIVATE COLLECTION", "Rare moments. Real feeling.", "Follow what draws you in."],
  offscript: [
    "PICK A DIRECTION. MAKE A STORY.",
    "This could be your next chapter.",
    "Go on. Open a world.",
  ],
  sidequest: ["YOUR NEXT SIDEQUEST", "Choose your plot twist.", "The group chat can wait."],
  meridian: ["A MORE PERSONAL ATLAS", "Where would you like to be?", "Take a moment to imagine."],
  postcard: [
    "A FEW PLACES TO FALL FOR",
    "Your next postcard starts here.",
    "Turn a feeling into a journey.",
  ],
};

export function CinemaHero({
  c,
  still = false,
  onMotionChange,
}: {
  c: Concept;
  still?: boolean;
  onMotionChange?: (enabled: boolean) => void;
}) {
  const [scene, setScene] = useState(0);
  const [motion, setMotion] = useState(false);
  const root = useRef<HTMLElement>(null);
  const start = useRef<number | null>(null);
  const worlds = worldsFor(c);
  const world = worlds[scene]!;
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setMotion(!media?.matches && !still);
    update();
    media?.addEventListener?.("change", update);
    return () => media?.removeEventListener?.("change", update);
  }, [still]);
  useEffect(() => {
    onMotionChange?.(motion);
  }, [motion, onMotionChange]);
  const next = (delta: number) => setScene((n) => (n + delta + worlds.length) % worlds.length);
  return (
    <div
      className={`concept-shell cinema-shell theme-${c.id}`}
      style={{ "--cin-accent": c.palette[2] } as CSSProperties}
    >
      <section
        ref={root}
        className={`cinema cinema-${c.audience.toLowerCase()} cinema-${c.id}`}
        data-motion={motion ? "on" : "off"}
        aria-label={`${c.name} destination explorer`}
        onPointerMove={(e) => {
          if (!motion || e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty(
            "--mx",
            `${((e.clientX - r.left) / r.width - 0.5) * 14}px`,
          );
          e.currentTarget.style.setProperty(
            "--my",
            `${((e.clientY - r.top) / r.height - 0.5) * 10}px`,
          );
        }}
        onPointerLeave={() => {
          root.current?.style.setProperty("--mx", "0px");
          root.current?.style.setProperty("--my", "0px");
        }}
      >
        <HeroNav c={c} />
        <div
          className="cin-media"
          onPointerDown={(e) => {
            if (e.pointerType === "touch") start.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (start.current !== null && Math.abs(e.clientX - start.current) > 55)
              next(e.clientX < start.current ? 1 : -1);
            start.current = null;
          }}
          onPointerCancel={() => {
            start.current = null;
          }}
        >
          <div key={scene} className="cin-scene">
            {world.film && !still ? (
              <AmbientFilm
                src={`/videos/studio/${world.film}.mp4`}
                poster={world.image}
                enabled={motion}
              />
            ) : (
              <img src={world.image} alt="" loading={still ? "lazy" : "eager"} />
            )}
          </div>
          <div className="cin-shade" />
          <span className="cin-landmark" aria-hidden="true">
            {world.word}
          </span>
          <span className="cin-crosshair" aria-hidden="true">
            +
          </span>
        </div>
        <div className="cin-copy" key={`copy-${scene}`}>
          <p className="cin-label">{world.place}</p>
          <h1>{world.title}</h1>
          <div className="cin-description">
            <p>{world.note}</p>
            <a href="#discover">
              {c.audience === "Corporate" ? "Build your itinerary" : "Make it your story"}
              <ArrowUpRight size={22} />
            </a>
          </div>
        </div>
        <div className="cin-orbit" aria-hidden="true">
          <span>{c.audience === "Family" ? "LET CURIOSITY LEAD" : "A WORLD OF POSSIBILITIES"}</span>
          <ArrowUpRight size={40} />
        </div>
        <div className="cin-bottom">
          <a className="cin-scroll" href="#discovery-film">
            Explore the possibilities <ArrowDown size={16} />
          </a>
          <div className="cin-scenes" aria-label="Choose a destination scene">
            {worlds.map((w, i) => (
              <button
                key={w.word}
                onClick={() => setScene(i)}
                aria-pressed={scene === i}
                aria-label={`Explore ${w.word}`}
              >
                <span>0{i + 1}</span>
                <i />
                <small>{w.word}</small>
              </button>
            ))}
          </div>
          <div className="cin-controls">
            <button aria-label="Previous scene" onClick={() => next(-1)}>
              <ChevronLeft size={19} />
            </button>
            <button aria-label="Next scene" onClick={() => next(1)}>
              <ChevronRight size={19} />
            </button>
            {!still && (
              <button
                aria-label={motion ? "Pause ambient motion" : "Play ambient motion"}
                aria-pressed={!motion}
                onClick={() => setMotion((v) => !v)}
              >
                {motion ? <Pause size={15} /> : <Play size={15} />}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export function DiscoveryFilm({
  c,
  motion,
  onChoose,
}: {
  c: Concept;
  motion: boolean;
  onChoose: (destination: string) => void;
}) {
  const [active, setActive] = useState(0);
  const worlds = worldsFor(c);
  const copy = DISCOVERY_COPY[c.id]!;
  return (
    <section
      id="discovery-film"
      className={`discovery-film discovery-${c.audience.toLowerCase()} discovery-${c.id}`}
      data-motion={motion ? "on" : "off"}
      aria-label="Explore your next journey"
    >
      <div className="discovery-heading">
        <p>{copy[0]}</p>
        <h2>
          {copy[1]}
          <br />
          <em>{copy[2]}</em>
        </h2>
        <span>Choose a world. Begin a conversation.</span>
      </div>
      <div className="discovery-deck">
        {worlds.map((w, i) => (
          <div key={w.word} className={`discovery-card ${active === i ? "is-active" : ""}`}>
            <button
              className="discovery-select"
              aria-pressed={active === i}
              onClick={() => setActive(i)}
              aria-label={`Open ${w.destination}`}
            >
              <img src={w.image} alt="" loading="lazy" />
              <span className="discovery-number">0{i + 1}</span>
              <span className="discovery-title">{w.word}</span>
              <span className="discovery-arrow">
                <ArrowUpRight />
              </span>
            </button>
            {active === i && (
              <div className="discovery-detail">
                <p>{w.note}</p>
                <button onClick={() => onChoose(w.destination)}>
                  Start with this idea <ArrowUpRight size={18} />
                </button>
                <small>
                  Inspiration, personally planned. Arrangements confirmed by your agent.
                </small>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
