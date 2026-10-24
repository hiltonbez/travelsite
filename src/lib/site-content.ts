// The site's words, pictures and featured trips, edited by the agency in TribeTravel (Website > Site content) and
// read from GET <tribetravel>/api/site/<slug>/content when the page is built (scripts/snapshot.mjs). Anything
// TribeTravel doesn't send, or the whole lot when it can't be reached, falls back to FALLBACK below, so a build
// never fails and the site always has content.
import islands from "@/assets/islands.jpg";
import safari from "@/assets/safari.jpg";
import cities from "@/assets/cities.jpg";
import cruises from "@/assets/cruises.jpg";
import { contact } from "@/lib/contact";

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
export const TRIBETRAVEL_URL = (env["VITE_TRIBETRAVEL_URL"] || "https://tribetravel.io").replace(/\/$/, "");
export const AGENCY_SLUG = env["VITE_AGENCY_SLUG"] || "paper-plane-travel-tours";

export type Card = { tag: string; name: string; line: string; img: string; price: string };
export type Post = { title: string; tag: string; img: string; link: string };

export type SiteContent = {
  hero: { sideText: string; headline: string; linkLabel: string; buttonLabel: string; video: string; image: string };
  steps: { title: string; items: string[] };
  places: string[];
  featured: { eyebrow: string; title: string; cards: Card[] };
  promise: { eyebrow: string; text: string };
  about: { eyebrow: string; title: string; body: string; stats: [string, string][] };
  journal: { eyebrow: string; title: string; posts: Post[] };
  contact: { title: string; intro: string; email: string; phone: string; whatsapp: string; facebook: string; instagram: string };
  chat: boolean;
};

const fallbackImages: string[] = [islands, safari, cities, cruises];

export const FALLBACK: SiteContent = {
  hero: {
    sideText: "A different point of view",
    headline: "Some places change everything.",
    linkLabel: "Explore Madagascar",
    buttonLabel: "Plan your journey",
    video: "/videos/hero.mp4?v=2", // ?v= busts the Cloudflare cache when the video changes
    image: "",
  },
  steps: { title: "Make it your journey.", items: ["Choose a place", "Tell us your dates", "Plan with Vanessa"] },
  places: ["Madagascar", "Zanzibar", "Mauritius", "Seychelles", "Thailand", "Bali", "Maldives", "Kenya", "Zimbabwe"],
  featured: {
    eyebrow: "Destinations",
    title: "Where will you go next?",
    // Prices from the specials on paperplanetravel.co.za (Oct 2026).
    cards: [
      { tag: "Islands", name: "Madagascar", line: "Nosy Komba, far from the mega-resorts", img: islands, price: "7 nights from R36 500 pp" },
      { tag: "Safari", name: "Big 5 Safaris", line: "Golden hours with the herds", img: safari, price: "Ask Vanessa for a quote" },
      { tag: "Cities", name: "City Breaks", line: "Abu Dhabi, Dubai and beyond", img: cities, price: "5 nights from R24 933 pp" },
      { tag: "Cruises", name: "Cruises", line: "Ocean views, and a balcony upgrade", img: cruises, price: "Ask about the NCL special" },
    ],
  },
  promise: { eyebrow: "Our promise", text: "Not a package. A journey built around the way you want to feel." },
  about: {
    eyebrow: "About Vanessa",
    title: "Experience the difference.",
    body:
      "Paper Plane is a small agency focused on finding you the best travel solutions, for business or pleasure. Vanessa seeks out the adventures that suit you best, at the best possible price, so you make the most of every trip and come home with memories that last forever.",
    stats: [["1:1", "Personal planning"], ["100%", "Tailor-made"], ["ZAR", "Quoted in rand"], ["2-in-1", "Business & leisure"]],
  },
  journal: {
    eyebrow: "Journal",
    title: "Stories from the road",
    posts: [
      { img: safari, title: "When to go on safari in Botswana", tag: "Safari · 6 min", link: "" },
      { img: islands, title: "Choosing the right Maldives island", tag: "Islands · 4 min", link: "" },
      { img: cruises, title: "The quiet magic of fjord cruising", tag: "Cruises · 5 min", link: "" },
    ],
  },
  contact: {
    title: "Ready when you are.",
    intro: "Tell Vanessa where you'd like to go and when. She'll come back to you with ideas and a quote in rand.",
    email: contact.email,
    phone: contact.phoneDisplay,
    whatsapp: contact.phoneDisplay,
    facebook: contact.facebook,
    instagram: "",
  },
  chat: false,
};

type Sections = Record<string, Record<string, unknown>>;
type Special = { name: string; destination?: string; summary?: string; from_price?: number | null; nights?: number | null; image?: string };
type Payload = { sections?: Sections; featured?: Special[]; chat?: boolean };

const str = (v: unknown, fb: string) => (typeof v === "string" && v.trim() ? v.trim() : fb);

function rand(n: number) {
  return "R" + Math.round(n).toLocaleString("en-ZA").replace(/[\s,]/g, " ");
}

function card(s: Special, i: number): Card {
  const price = s.from_price
    ? `${s.nights ? `${s.nights} nights ` : ""}from ${rand(s.from_price)} pp`
    : "Ask Vanessa for a quote";
  const line = ((s.summary || "").split(/(?<=[.!?])\s/)[0] ?? "").slice(0, 90);
  return { tag: s.destination || "Featured", name: s.name, line, img: s.image || fallbackImages[i % 4] || islands, price };
}

/** The API payload laid over FALLBACK. Exported for tests. */
export function merge(p: Payload): SiteContent {
  const s = p.sections ?? {};
  const f = FALLBACK;
  const g = (sec: string, key: string, fb: string) => str(s[sec]?.[key], fb);
  const posts = [1, 2, 3].map((n, i) => ({
    title: g("journal", `post${n}_title`, ""),
    tag: g("journal", `post${n}_tag`, ""),
    img: g("journal", `post${n}_image`, f.journal.posts[i]?.img ?? islands),
    link: g("journal", `post${n}_link`, ""),
  }));
  const rawPlaces = s["places"]?.["names"];
  const places = Array.isArray(rawPlaces) ? rawPlaces.filter((x): x is string => typeof x === "string" && !!x) : [];
  return {
    hero: {
      sideText: g("hero", "side_text", f.hero.sideText),
      headline: g("hero", "headline", f.hero.headline),
      linkLabel: g("hero", "link_label", f.hero.linkLabel),
      buttonLabel: g("hero", "button_label", f.hero.buttonLabel),
      video: g("hero", "video", f.hero.video),
      image: g("hero", "image", f.hero.image),
    },
    steps: {
      title: g("steps", "title", f.steps.title),
      items: [1, 2, 3].map((n, i) => g("steps", `step${n}`, f.steps.items[i] ?? "")),
    },
    places: places.length ? places : f.places,
    featured: {
      eyebrow: g("featured", "eyebrow", f.featured.eyebrow),
      title: g("featured", "title", f.featured.title),
      cards: p.featured?.length ? p.featured.slice(0, 8).map(card) : f.featured.cards,
    },
    promise: { eyebrow: g("promise", "eyebrow", f.promise.eyebrow), text: g("promise", "text", f.promise.text) },
    about: {
      eyebrow: g("about", "eyebrow", f.about.eyebrow),
      title: g("about", "title", f.about.title),
      body: g("about", "body", f.about.body),
      stats: [1, 2, 3, 4].map((n, i): [string, string] => [
        g("about", `stat${n}_value`, f.about.stats[i]?.[0] ?? ""),
        g("about", `stat${n}_label`, f.about.stats[i]?.[1] ?? ""),
      ]),
    },
    journal: {
      eyebrow: g("journal", "eyebrow", f.journal.eyebrow),
      title: g("journal", "title", f.journal.title),
      posts: posts.some((x) => x.title) ? posts.filter((x) => x.title) : f.journal.posts,
    },
    contact: {
      title: g("contact", "title", f.contact.title),
      intro: g("contact", "intro", f.contact.intro),
      email: g("contact", "email", f.contact.email),
      phone: g("contact", "phone", f.contact.phone),
      whatsapp: g("contact", "whatsapp", f.contact.whatsapp),
      facebook: g("contact", "facebook", f.contact.facebook),
      instagram: g("contact", "instagram", f.contact.instagram),
    },
    chat: p.chat === true,
  };
}

/** Fetch the content; FALLBACK when TribeTravel can't be reached in 8 seconds or answers with an error. */
export async function loadSiteContent(): Promise<SiteContent> {
  try {
    const res = await fetch(`${TRIBETRAVEL_URL}/api/site/${encodeURIComponent(AGENCY_SLUG)}/content`, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return FALLBACK;
    return merge((await res.json()) as Payload);
  } catch {
    return FALLBACK;
  }
}

/** "+27 76 939 9338" -> "+27769399338" and "https://wa.me/27769399338". */
export const phoneE164 = (p: string) => p.replace(/[^\d+]/g, "");
export const waLink = (p: string) => `https://wa.me/${p.replace(/\D/g, "")}`;
