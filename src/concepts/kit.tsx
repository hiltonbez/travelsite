// What the ten /concepts samples share: the destinations with their clips and sample prices, the <head> of a sample's
// page, the looping clip, the price-request form (a sample: it sends nothing) and the small bar for moving between
// samples. Each sample's own look and game live in src/concepts/<slug>/. Clips: public/videos/concepts/CREDITS.txt.
import { useEffect, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { DESTINATIONS } from "@/designs/enterprise/content";
import { BRAND, contact } from "@/designs/shared";
import { CONCEPTS } from "@/concepts/list";

export { BRAND, contact };

export type Mood =
  "beach" | "adventure" | "luxury" | "culture" | "wildlife" | "romance" | "family" | "food";

export type ConceptTrip = {
  slug: string;
  name: string;
  region: string;
  flight: string;
  tagline: string;
  intro: string;
  video: string;
  poster: string;
  photos: [string, string, string];
  days: [string, string][];
  nights: number;
  price: number;
  /** 0 to 3: how strongly the trip offers each mood. The games score a traveller's choices against these. */
  moods: Record<Mood, number>;
};

const clip = (name: string) => ({
  video: `/videos/concepts/${name}.mp4`,
  poster: `/videos/concepts/${name}.jpg`,
});
const place = (slug: string) => {
  const d = DESTINATIONS.find((x) => x.slug === slug);
  if (!d) throw new Error(`No destination ${slug}`);
  return {
    slug: d.slug,
    name: d.name,
    region: d.region,
    flight: d.flight,
    tagline: d.tagline,
    intro: d.intro,
    photos: d.photos,
    days: d.days,
  };
};

/** Six trips, each with its own moving footage. Prices are examples for a demo agency, per person sharing. */
export const TRIPS: ConceptTrip[] = [
  {
    ...place("mauritius"),
    ...clip("mauritius"),
    nights: 7,
    price: 32900,
    moods: {
      beach: 3,
      adventure: 1,
      luxury: 3,
      culture: 1,
      wildlife: 0,
      romance: 3,
      family: 2,
      food: 2,
    },
  },
  {
    ...place("zanzibar"),
    ...clip("zanzibar"),
    nights: 7,
    price: 24900,
    moods: {
      beach: 3,
      adventure: 1,
      luxury: 1,
      culture: 3,
      wildlife: 1,
      romance: 2,
      family: 1,
      food: 2,
    },
  },
  {
    ...place("victoria-falls"),
    ...clip("falls"),
    nights: 4,
    price: 18750,
    moods: {
      beach: 0,
      adventure: 3,
      luxury: 1,
      culture: 1,
      wildlife: 2,
      romance: 1,
      family: 1,
      food: 0,
    },
  },
  {
    ...place("kruger"),
    ...clip("herd"),
    nights: 4,
    price: 14500,
    moods: {
      beach: 0,
      adventure: 2,
      luxury: 2,
      culture: 0,
      wildlife: 3,
      romance: 1,
      family: 3,
      food: 1,
    },
  },
  {
    ...place("cape-town"),
    ...clip("capetown"),
    nights: 5,
    price: 16900,
    moods: {
      beach: 1,
      adventure: 2,
      luxury: 2,
      culture: 2,
      wildlife: 1,
      romance: 2,
      family: 2,
      food: 3,
    },
  },
  {
    ...place("santorini"),
    ...clip("santorini"),
    nights: 7,
    price: 42500,
    moods: {
      beach: 1,
      adventure: 0,
      luxury: 3,
      culture: 3,
      wildlife: 0,
      romance: 3,
      family: 0,
      food: 3,
    },
  },
];

/** Extra footage with no trip of its own: an aerial island coast and a coral reef. */
export const EXTRA_CLIPS = { coast: clip("coast"), reef: clip("reef") };

/** R32 900, the way the demo agency writes its prices. */
export const rand = (n: number) => `R${Math.round(n).toLocaleString("en-ZA").replace(/\D/g, " ")}`;

/** The trip that best fits the moods chosen, each with a weight. Ties go to the earlier trip, so server and browser agree. */
export function bestTrip(weights: Partial<Record<Mood, number>>): ConceptTrip {
  let best = TRIPS[0]!;
  let top = -Infinity;
  for (const t of TRIPS) {
    let s = 0;
    for (const [m, w] of Object.entries(weights)) s += t.moods[m as Mood] * (w ?? 0);
    if (s > top) {
      top = s;
      best = t;
    }
  }
  return best;
}

/** A sample page's <head>: noindex until it's chosen, its own Google Fonts (`family=…&family=…`) and stylesheet. */
export function conceptHead(slug: string, fonts: string, css: string) {
  const c = CONCEPTS.find((x) => x.slug === slug);
  return {
    meta: [
      { title: `${c?.name ?? slug} — sample website design` },
      { name: "description", content: c?.pitch ?? "" },
      { name: "robots", content: "noindex" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      ...(fonts
        ? [{ rel: "stylesheet", href: `https://fonts.googleapis.com/css2?${fonts}&display=swap` }]
        : []),
      { rel: "stylesheet", href: css },
    ],
  };
}

/** True when the traveller's device asks for less motion. False on the server and on the first draw. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(q.matches);
    const on = () => setReduced(q.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** A muted, looping clip. Holds still on its poster when the device asks for less motion. */
export function Clip({
  src,
  poster,
  className,
  style,
  videoRef,
  paused,
}: {
  src: string;
  poster: string;
  className?: string;
  style?: React.CSSProperties;
  videoRef?: RefObject<HTMLVideoElement | null>;
  paused?: boolean;
}) {
  const reduced = useReducedMotion();
  const still = reduced || paused;
  return (
    <video
      key={src}
      ref={(el) => {
        if (videoRef) videoRef.current = el;
        if (el) {
          el.muted = true;
          if (still) el.pause();
          else void el.play().catch(() => {});
        }
      }}
      src={src}
      poster={poster}
      autoPlay={!still}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      className={className}
      style={{ objectFit: "cover", ...style }}
    />
  );
}

export type QuoteFormClasses = {
  form?: string;
  field?: string;
  label?: string;
  input?: string;
  button?: string;
  done?: string;
  note?: string;
};

/** The price request every sample ends on. A sample: it never sends anything, it only shows what the traveller would see. */
export function QuoteForm({
  summary,
  button = "Ask for my price",
  thanks,
  classes = {},
  children,
}: {
  /** What's being priced, in the traveller's own terms. Shown in the thank-you. */
  summary: string;
  button?: string;
  thanks?: string;
  classes?: QuoteFormClasses;
  children?: ReactNode;
}) {
  const [sent, setSent] = useState<string | null>(null);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
    setSent(name.split(/\s+/)[0] || "traveller");
  };
  if (sent) {
    return (
      <div role="status" className={classes.done}>
        <p>
          {thanks ??
            `Thanks ${sent}. ${BRAND.name} would now price "${summary}" and reply within a working day.`}
        </p>
        <p className={classes.note}>This is a design sample, so nothing was sent.</p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className={classes.form}>
      {children}
      <label className={classes.field}>
        <span className={classes.label}>Your name</span>
        <input name="name" required autoComplete="name" className={classes.input} />
      </label>
      <label className={classes.field}>
        <span className={classes.label}>Email or WhatsApp number</span>
        <input name="contact" required autoComplete="email" className={classes.input} />
      </label>
      <button type="submit" className={classes.button}>
        {button}
      </button>
    </form>
  );
}

/** A small pill for moving between the samples. It belongs to the gallery, not to the design. */
export function ConceptNav({ slug }: { slug: string }) {
  const i = CONCEPTS.findIndex((c) => c.slug === slug);
  const at = (n: number) => CONCEPTS[(n + CONCEPTS.length) % CONCEPTS.length]!;
  const prev = at(i - 1);
  const next = at(i + 1);
  const pill: React.CSSProperties = {
    position: "fixed",
    left: 12,
    bottom: 12,
    zIndex: 9000,
    display: "flex",
    alignItems: "center",
    gap: 2,
    padding: 3,
    borderRadius: 999,
    background: "rgba(17,19,24,.88)",
    color: "#fff",
    font: "500 12px/1 system-ui, sans-serif",
    boxShadow: "0 4px 18px rgba(0,0,0,.35)",
  };
  const a: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 32,
    minWidth: 32,
    justifyContent: "center",
    padding: "0 10px",
    borderRadius: 999,
    color: "#fff",
    textDecoration: "none",
  };
  return (
    <nav aria-label="Design samples" style={pill}>
      <a href={`/concepts/${prev.slug}`} style={a} aria-label={`Previous sample: ${prev.name}`}>
        ‹
      </a>
      <a href="/concepts" style={a}>
        {i + 1} of {CONCEPTS.length}
      </a>
      <a href={`/concepts/${next.slug}`} style={a} aria-label={`Next sample: ${next.name}`}>
        ›
      </a>
    </nav>
  );
}
