// The inside pages. Faces are numbered as they fall in the book: 1 is the inside of the cover, 11 the back page.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BRAND, Clip, contact, EXTRA_CLIPS, QuoteForm, type ConceptTrip } from "@/concepts/kit";
import { Barcode, Fit } from "./cover";
import { CLASSIFIEDS, HOROSCOPE, type Story } from "./copy";

const tel = `tel:${contact.phoneE164}`;
const mail = `mailto:${contact.email}`;

type PageProps = {
  story: Story;
  trip: ConceptTrip;
  live: boolean;
  goToFace: (face: number) => void;
};

const Folio = ({ n, story, flip }: { n: number; story: Story; flip?: boolean }) => (
  <p className={`folio ${flip ? "folio--r" : ""}`}>
    <b>{n}</b> LEAVE, {story.title}
  </p>
);

/** Face 1: the perfume ad every glossy opens with. */
export function AdPerfume({ story }: PageProps) {
  return (
    <div className="pg pg--perfume">
      <p className="pg-adlabel">Advertisement</p>
      <p className="pf-word pf-word--1 rv">Out of</p>
      <svg className="pf-bottle rv" viewBox="0 0 200 320" aria-hidden="true">
        <defs>
          <clipPath id="cs-bottle">
            <rect x="24" y="84" width="152" height="220" rx="4" />
          </clipPath>
        </defs>
        <rect x="74" y="8" width="52" height="54" fill="#fff" />
        <rect x="84" y="62" width="32" height="22" fill="none" stroke="#fff" strokeWidth="2" />
        <g clipPath="url(#cs-bottle)">
          <g className="pf-liquid">
            <path
              d="M-200 150 q50 -16 100 0 t100 0 t100 0 t100 0 t100 0 V320 H-200 Z"
              fill="var(--ink)"
            />
          </g>
        </g>
        <rect
          x="24"
          y="84"
          width="152"
          height="220"
          rx="4"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
        />
        <rect className="pf-glint" x="40" y="96" width="9" height="196" fill="#fff" opacity=".35" />
        <text x="100" y="208" textAnchor="middle" className="pf-label">
          O/O
        </text>
      </svg>
      <p className="pf-word pf-word--2 rv">Office</p>
      <p className="pf-notes rv">
        The new fragrance. Notes of sunscreen, airport coffee and one unread email, deleted. For{" "}
        {story.first}, and for nobody who needs anything by Friday.
      </p>
    </div>
  );
}

/** Face 2: contents, with the editor's letter. Each line turns to its page. */
export function Contents({ story, goToFace }: PageProps) {
  const rows: [number, string, string][] = [
    [3, `${story.first} in ${story.head}`, "The cover story, with the itinerary"],
    [7, "Moving pictures", "Nothing happens. Beautifully."],
    [8, "Your horoscope", "It isn't good news. It's better."],
    [9, "Classifieds", "And how to reach us"],
    [11, "Exclusive subscriber offer", "The price, and the card you tear out"],
  ];
  return (
    <div className="pg pg--contents">
      <Folio n={2} story={story} flip />
      <Fit className="ct-head rv" text="Contents" />
      <ol className="ct-list">
        {rows.map(([face, title, sub], i) => (
          <li key={face} className="rv" style={{ "--d": i + 1 } as React.CSSProperties}>
            <button type="button" onClick={() => goToFace(face)}>
              <span className="ct-num">{face}</span>
              <span className="ct-t">
                {title}
                <small>{sub}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="ct-letter rv" style={{ "--d": 6 } as React.CSSProperties}>
        <p className="kick">From the editor</p>
        <p>{story.letter}</p>
      </div>
    </div>
  );
}

/** Faces 3 and 4: one photograph across the gutter, the headline split over it. */
export function FeatureLeft({ story, trip }: PageProps) {
  return (
    <div className="pg pg--open">
      <img
        src={trip.photos[0]}
        alt={`${trip.name}, the opening photograph`}
        className="op-photo op-photo--l"
      />
      <Folio n={3} story={story} />
      <div className="op-word">
        <Fit className="op-name rv" text={story.first} maxH={0.34} />
        <p className="op-in rv" style={{ "--d": 2 } as React.CSSProperties}>
          in
        </p>
      </div>
    </div>
  );
}

export function FeatureRight({ story, trip }: PageProps) {
  return (
    <div className="pg pg--open">
      <img src={trip.photos[0]} alt="" className="op-photo op-photo--r" />
      <Folio n={4} story={story} flip />
      <Fit className="op-place rv" text={story.head} maxH={0.3} />
      <p className="op-stand rv" style={{ "--d": 3 } as React.CSSProperties}>
        <span className="kick">{story.title}</span>
        {story.standfirst}
      </p>
    </div>
  );
}

function Day({ i, title, text, aside }: { i: number; title: string; text: string; aside: string }) {
  return (
    <div className="day rv" style={{ "--d": i + 2 } as React.CSSProperties}>
      <h4>
        <span>Day {String(i + 1).padStart(2, "0")}</span> {title}
      </h4>
      <p>
        {text} {aside}
      </p>
    </div>
  );
}

/** Face 5: the story itself, drop cap and all. */
export function FeatureStory({ story, trip }: PageProps) {
  return (
    <div className="pg pg--story">
      <Folio n={5} story={story} />
      <h3 className="st-head rv">{trip.tagline}</h3>
      <p className="st-drop rv" style={{ "--d": 1 } as React.CSSProperties}>
        {trip.intro}
      </p>
      <p className="st-from rv" style={{ "--d": 1 } as React.CSSProperties}>
        {trip.flight}. {trip.nights} nights. {story.party}.
      </p>
      <div className="st-days">
        {trip.days.slice(0, 3).map(([t, d], i) => (
          <Day key={t + i} i={i} title={t} text={d} aside={story.asides[i] ?? ""} />
        ))}
      </div>
      <div className="st-photo">
        <img src={trip.photos[2]} alt={`${trip.name}, a third photograph`} />
      </div>
    </div>
  );
}

/** Face 6: big photograph, big pull quote, the rest of the trip. */
export function FeaturePull({ story, trip }: PageProps) {
  return (
    <div className="pg pg--pull">
      <div className="pl-photo">
        <img src={trip.photos[1]} alt={`${trip.name}, a second photograph`} />
      </div>
      <Folio n={6} story={story} flip />
      <blockquote className="pl-quote rv">{story.pull}</blockquote>
      <div className="st-days">
        {trip.days.slice(3).map(([t, d], i) => (
          <Day key={t + i} i={i + 3} title={t} text={d} aside={story.asides[i + 3] ?? ""} />
        ))}
      </div>
    </div>
  );
}

/** Face 7: text pouring round a circular clip, with a ring of type turning about it. */
export function MovingPage({ story, trip, live }: PageProps) {
  const ring = `${story.first.toUpperCase()} IS ON LEAVE • ${story.head.toUpperCase()} • ${story.first.toUpperCase()} IS ON LEAVE • ${story.head.toUpperCase()} • `;
  return (
    <div className="pg pg--moving">
      <Folio n={7} story={story} />
      <h3 className="mv-head rv">
        Moving <em>pictures</em>
      </h3>
      <div className="mv-cols">
        <div className="mv-col mv-col--l">
          <i className="mv-float" />
          {story.moving[0]}
        </div>
        <div className="mv-col mv-col--r">
          <i className="mv-float" />
          {story.moving[1]}
        </div>
        <div className="mv-circle">
          {live ? (
            <Clip src={trip.video} poster={trip.poster} className="mv-video" />
          ) : (
            <img src={trip.poster} alt="" className="mv-video" loading="lazy" />
          )}
        </div>
        <svg className="mv-ring" viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <path id="cs-ring" d="M100 100 m-92 0 a92 92 0 1 1 184 0 a92 92 0 1 1 -184 0" />
          </defs>
          <text textLength="570" lengthAdjust="spacing">
            <textPath href="#cs-ring">{ring}</textPath>
          </text>
        </svg>
      </div>
      <p className="mv-foot rv" style={{ "--d": 2 } as React.CSSProperties}>
        {story.pull2}
      </p>
    </div>
  );
}

/** Face 8: the horoscope. All twelve signs get roughly the same news. */
export function Horoscope({ story }: PageProps) {
  return (
    <div className="pg pg--stars">
      <Folio n={8} story={story} flip />
      <p className="kick rv">Your horoscope</p>
      <h3 className="hs-big rv" style={{ "--d": 1 } as React.CSSProperties}>
        You need a <em>holiday.</em>
      </h3>
      <ul className="hs-grid">
        {HOROSCOPE.map(([s, t], i) => (
          <li key={s} className="rv" style={{ "--d": 2 + i * 0.35 } as React.CSSProperties}>
            <b>{s}</b> {t}
          </li>
        ))}
      </ul>
      <p className="hs-foot rv" style={{ "--d": 7 } as React.CSSProperties}>
        Written in the stars by the {BRAND.name} astrology desk, which is also the {BRAND.name}{" "}
        everything desk.
      </p>
    </div>
  );
}

/** Face 9: classifieds and the imprint, which is where you find the agency. */
export function Classifieds({ story }: PageProps) {
  return (
    <div className="pg pg--class">
      <Folio n={9} story={story} />
      <Fit className="cl-head rv" text="Classifieds" />
      <div className="cl-grid">
        {CLASSIFIEDS.map(([k, t], i) => (
          <p key={k} className="rv" style={{ "--d": i + 1 } as React.CSSProperties}>
            <b>{k}</b>
            {t}
          </p>
        ))}
      </div>
      <div className="cl-imprint rv" style={{ "--d": 5 } as React.CSSProperties}>
        <p className="kick">Imprint</p>
        <p>
          Editor-in-chief, cover star and sole subject: {story.name}. Published by {BRAND.name},
          your travel agent, who'd actually like to hear from you.
        </p>
        <p className="cl-links">
          <a href={tel}>{contact.phoneDisplay}</a>
          <a href={mail}>{contact.email}</a>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp us
          </a>
        </p>
      </div>
    </div>
  );
}

/** Face 10: a full-page moving ad. */
export function AdReef({ live }: PageProps) {
  const { reef } = EXTRA_CLIPS;
  return (
    <div className="pg pg--reef">
      {live ? (
        <Clip src={reef.video} poster={reef.poster} className="rf-video" />
      ) : (
        <img src={reef.poster} alt="" className="rf-video" loading="lazy" />
      )}
      <p className="pg-adlabel">Advertisement</p>
      <p className="rf-line rv">
        The reef does not have a <em>Monday.</em>
      </p>
      <p className="rf-brand rv" style={{ "--d": 3 } as React.CSSProperties}>
        {BRAND.name}. Booking holidays for people who have run out of excuses.
      </p>
    </div>
  );
}

/** Face 11: the back page. The price, then the card you tear out, which is the price request. */
export function BackPage({ story, onSent }: PageProps & { onSent?: () => void }) {
  const [torn, setTorn] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const input = card.current?.querySelector<HTMLInputElement>('input[name="name"]');
    if (input && !input.value) input.value = story.typed;
  }, [story.typed]);
  const submitted = (e: FormEvent) => {
    if (e.defaultPrevented) {
      setTorn(true);
      onSent?.();
    }
  };
  return (
    <div className="pg pg--offer no-turn">
      <div className="of-band">
        <span>Exclusive subscriber offer</span>
        <span>No. {story.issueNo}</span>
      </div>
      <Fit className="of-price" text={story.price} maxH={0.2} />
      <p className="of-terms">
        <b>
          {story.nights} nights in {story.place}, {story.whoWords}.
        </b>{" "}
        Sample price, per person sharing. Your agent confirms the real one for your dates. Cancel
        your subscription to Mondays at any time.
      </p>
      <div className={`of-slot ${torn ? "is-torn" : ""}`}>
        <p className="of-stub" aria-hidden={!torn}>
          Good. It's gone. There's a hole in your magazine and a holiday in your future.
        </p>
        <div className="of-card" ref={card} onSubmit={submitted}>
          <p className="of-scissor" aria-hidden="true">
            Tear along the dotted line
          </p>
          <QuoteForm
            summary={story.summary}
            button="Tear it out and ask for my price"
            classes={{
              form: "of-form",
              field: "of-field",
              label: "of-label",
              input: "of-input",
              button: "of-btn",
              done: "of-done",
              note: "of-donenote",
            }}
          >
            <p className="of-cardhead">
              Yes! Send {story.typed ? story.first : "me"} to {story.place}.
            </p>
          </QuoteForm>
        </div>
      </div>
      <div className="of-foot">
        <div className="of-bar">
          <Barcode seed={story.name + story.place} />
        </div>
        <p>
          {BRAND.name} <a href={tel}>{contact.phoneDisplay}</a>
        </p>
      </div>
    </div>
  );
}
