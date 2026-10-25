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
export const AGENCY_SLUG = env["VITE_AGENCY_SLUG"] || "sunset-travel";

/** The agency's name on the page (header, footer, page title). */
export const BRAND = { name: "Sun-Set Travel", short: "SUN-SET", tagline: "Travel & Tours" };

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
  packages: boolean;
  /** The page as ordered sections (TribeTravel's visual editor, P17.150). */
  blocks: Block[];
};

export type TextPhoto = { eyebrow: string; heading: string; text: string; photo: string; side: "left" | "right"; buttonLabel: string };
export type Gallery = { eyebrow: string; title: string; items: { photo: string; caption: string }[] };
export type Reviews = { eyebrow: string; title: string; items: { name: string; text: string; stars: number; trip: string }[] };
export type VideoBanner = { video: string; image: string; headline: string; text: string; buttonLabel: string;
  buttonAction: "chat" | "packages" | "contact" | "link"; buttonUrl: string };
export type PackagesHead = { eyebrow: string; title: string; intro: string };

export type Block =
  | { id: string; type: "hero"; data: SiteContent["hero"] }
  | { id: string; type: "steps"; data: SiteContent["steps"] }
  | { id: string; type: "places"; data: { names: string[] } }
  | { id: string; type: "featured"; data: SiteContent["featured"] }
  | { id: string; type: "packages"; data: PackagesHead }
  | { id: string; type: "promise"; data: SiteContent["promise"] & { video: string } }
  | { id: string; type: "about"; data: SiteContent["about"] }
  | { id: string; type: "journal"; data: SiteContent["journal"] }
  | { id: string; type: "contact"; data: SiteContent["contact"] }
  | { id: string; type: "text_photo"; data: TextPhoto }
  | { id: string; type: "gallery"; data: Gallery }
  | { id: string; type: "reviews"; data: Reviews }
  | { id: string; type: "video_banner"; data: VideoBanner };

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
  steps: { title: "Make it your journey.", items: ["Choose a place", "Tell us your dates", "Plan with us"] },
  places: ["Madagascar", "Zanzibar", "Mauritius", "Seychelles", "Thailand", "Bali", "Maldives", "Kenya", "Zimbabwe"],
  featured: {
    eyebrow: "Destinations",
    title: "Where will you go next?",
    // Example trips until the agency adds its own Specials in TribeTravel.
    cards: [
      { tag: "Islands", name: "Madagascar", line: "Nosy Komba, far from the mega-resorts", img: islands, price: "7 nights from R36 500 pp" },
      { tag: "Safari", name: "Big 5 Safaris", line: "Golden hours with the herds", img: safari, price: "Ask us for a quote" },
      { tag: "Cities", name: "City Breaks", line: "Abu Dhabi, Dubai and beyond", img: cities, price: "5 nights from R24 933 pp" },
      { tag: "Cruises", name: "Cruises", line: "Ocean views, and a balcony upgrade", img: cruises, price: "Ask about the NCL special" },
    ],
  },
  promise: { eyebrow: "Our promise", text: "Not a package. A journey built around the way you want to feel." },
  about: {
    eyebrow: "About us",
    title: "Experience the difference.",
    body:
      "Sun-Set Travel is a small agency focused on finding you the best travel solutions, for business or pleasure. We seek out the adventures that suit you best, at the best possible price, so you make the most of every trip and come home with memories that last forever.",
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
    intro: "Tell us where you'd like to go and when. We'll come back to you with ideas and a quote in rand.",
    email: contact.email,
    phone: contact.phoneDisplay,
    whatsapp: contact.phoneDisplay,
    facebook: contact.facebook,
    instagram: "",
  },
  chat: false,
  packages: false,
  blocks: [],
};
FALLBACK.blocks = defaultBlocks(FALLBACK, false);

/** The first-format page: the fixed sections in their usual order. */
function defaultBlocks(c: SiteContent, packages: boolean): Block[] {
  const out: Block[] = [
    { id: "hero", type: "hero", data: c.hero },
    { id: "steps", type: "steps", data: c.steps },
    { id: "places", type: "places", data: { names: c.places } },
    { id: "featured", type: "featured", data: c.featured },
  ];
  if (packages) out.push({ id: "packages", type: "packages", data: PACKAGES_HEAD });
  out.push(
    { id: "promise", type: "promise", data: { ...c.promise, video: c.hero.video } },
    { id: "about", type: "about", data: c.about },
    { id: "journal", type: "journal", data: c.journal },
    { id: "contact", type: "contact", data: c.contact },
  );
  return out;
}

const PACKAGES_HEAD: PackagesHead = {
  eyebrow: "Book online",
  title: "Mauritius packages",
  intro: "Pick a resort, choose your dates and see live prices. Your quote and itinerary are ready straight away, and your consultant calls you to add flights and transfers.",
};

type Sections = Record<string, Record<string, unknown>>;
type Special = { name: string; destination?: string; summary?: string; from_price?: number | null; nights?: number | null; image?: string };
type ApiBlock = { id?: string; type?: string; fields?: Record<string, unknown>; items?: Record<string, unknown>[] };
export type Payload = { sections?: Sections; featured?: Special[]; chat?: boolean; packages?: boolean; blocks?: ApiBlock[] };

const str = (v: unknown, fb: string) => (typeof v === "string" && v.trim() ? v.trim() : fb);

function rand(n: number) {
  return "R" + Math.round(n).toLocaleString("en-ZA").replace(/[\s,]/g, " ");
}

function card(s: Special, i: number): Card {
  const price = s.from_price
    ? `${s.nights ? `${s.nights} nights ` : ""}from ${rand(s.from_price)} pp`
    : "Ask us for a quote";
  const line = ((s.summary || "").split(/(?<=[.!?])\s/)[0] ?? "").slice(0, 90);
  return { tag: s.destination || "Featured", name: s.name, line, img: s.image || fallbackImages[i % 4] || islands, price };
}

type Get = (key: string, fb: string) => string;

function heroFrom(g: Get): SiteContent["hero"] {
  const f = FALLBACK.hero;
  return { sideText: g("side_text", f.sideText), headline: g("headline", f.headline), linkLabel: g("link_label", f.linkLabel),
    buttonLabel: g("button_label", f.buttonLabel), video: g("video", f.video), image: g("image", f.image) };
}
function stepsFrom(g: Get): SiteContent["steps"] {
  return { title: g("title", FALLBACK.steps.title), items: [1, 2, 3].map((n, i) => g(`step${n}`, FALLBACK.steps.items[i] ?? "")) };
}
function placesFrom(raw: unknown): string[] {
  const names = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string" && !!x) : [];
  return names.length ? names : FALLBACK.places;
}
function featuredFrom(g: Get, specials: Special[] | undefined): SiteContent["featured"] {
  const f = FALLBACK.featured;
  return { eyebrow: g("eyebrow", f.eyebrow), title: g("title", f.title), cards: specials?.length ? specials.slice(0, 8).map(card) : f.cards };
}
function promiseFrom(g: Get): SiteContent["promise"] {
  return { eyebrow: g("eyebrow", FALLBACK.promise.eyebrow), text: g("text", FALLBACK.promise.text) };
}
function aboutFrom(g: Get): SiteContent["about"] {
  const f = FALLBACK.about;
  return { eyebrow: g("eyebrow", f.eyebrow), title: g("title", f.title), body: g("body", f.body),
    stats: [1, 2, 3, 4].map((n, i): [string, string] => [g(`stat${n}_value`, f.stats[i]?.[0] ?? ""), g(`stat${n}_label`, f.stats[i]?.[1] ?? "")]) };
}
function journalFrom(g: Get): SiteContent["journal"] {
  const f = FALLBACK.journal;
  const posts = [1, 2, 3].map((n, i) => ({ title: g(`post${n}_title`, ""), tag: g(`post${n}_tag`, ""),
    img: g(`post${n}_image`, f.posts[i]?.img ?? islands), link: g(`post${n}_link`, "") }));
  return { eyebrow: g("eyebrow", f.eyebrow), title: g("title", f.title), posts: posts.some((x) => x.title) ? posts.filter((x) => x.title) : f.posts };
}
function contactFrom(g: Get): SiteContent["contact"] {
  const f = FALLBACK.contact;
  return { title: g("title", f.title), intro: g("intro", f.intro), email: g("email", f.email), phone: g("phone", f.phone),
    whatsapp: g("whatsapp", f.whatsapp), facebook: g("facebook", f.facebook), instagram: g("instagram", f.instagram) };
}

const getter = (fields: Record<string, unknown> | undefined): Get => (key, fb) => str(fields?.[key], fb);

/** One section from TribeTravel, or null for a kind this site doesn't know (newer than the site). */
function blockFrom(b: ApiBlock, p: Payload, i: number): Block | null {
  const id = typeof b.id === "string" && b.id ? b.id : `b${i}`;
  const g = getter(b.fields);
  const items = Array.isArray(b.items) ? b.items : [];
  const s = (v: unknown) => (typeof v === "string" ? v : "");
  switch (b.type) {
    case "hero": return { id, type: "hero", data: heroFrom(g) };
    case "steps": return { id, type: "steps", data: stepsFrom(g) };
    case "places": return { id, type: "places", data: { names: placesFrom(b.fields?.["names"]) } };
    case "featured": return { id, type: "featured", data: featuredFrom(g, p.featured) };
    case "packages": return { id, type: "packages", data: { eyebrow: g("eyebrow", PACKAGES_HEAD.eyebrow), title: g("title", PACKAGES_HEAD.title), intro: g("intro", PACKAGES_HEAD.intro) } };
    case "promise": return { id, type: "promise", data: { ...promiseFrom(g), video: "" } };
    case "about": return { id, type: "about", data: aboutFrom(g) };
    case "journal": return { id, type: "journal", data: journalFrom(g) };
    case "contact": return { id, type: "contact", data: contactFrom(g) };
    case "text_photo": return { id, type: "text_photo", data: { eyebrow: g("eyebrow", ""), heading: g("heading", ""), text: g("text", ""),
      photo: g("photo", ""), side: g("photo_side", "right") === "left" ? "left" : "right", buttonLabel: g("button_label", "") } };
    case "gallery": return { id, type: "gallery", data: { eyebrow: g("eyebrow", ""), title: g("title", ""),
      items: items.map((it) => ({ photo: s(it["photo"]), caption: s(it["caption"]) })).filter((it) => it.photo) } };
    case "reviews": return { id, type: "reviews", data: { eyebrow: g("eyebrow", ""), title: g("title", ""),
      items: items.map((it) => ({ name: s(it["name"]), text: s(it["text"]), trip: s(it["trip"]),
        stars: Math.max(1, Math.min(5, Number(it["stars"]) || 5)) })).filter((it) => it.text) } };
    case "video_banner": {
      const action = g("button_action", "chat");
      return { id, type: "video_banner", data: { video: g("video", ""), image: g("image", ""), headline: g("headline", ""), text: g("text", ""),
        buttonLabel: g("button_label", ""), buttonUrl: g("button_url", ""),
        buttonAction: (["chat", "packages", "contact", "link"].includes(action) ? action : "chat") as VideoBanner["buttonAction"] } };
    }
    default: return null;
  }
}

/** The API payload laid over FALLBACK. Exported for tests. */
export function merge(p: Payload): SiteContent {
  const sec = p.sections ?? {};
  const at = (name: string) => getter(sec[name]);
  const c: SiteContent = {
    hero: heroFrom(at("hero")),
    steps: stepsFrom(at("steps")),
    places: placesFrom(sec["places"]?.["names"]),
    featured: featuredFrom(at("featured"), p.featured),
    promise: promiseFrom(at("promise")),
    about: aboutFrom(at("about")),
    journal: journalFrom(at("journal")),
    contact: contactFrom(at("contact")),
    chat: p.chat === true,
    packages: p.packages === true,
    blocks: [],
  };
  if (Array.isArray(p.blocks) && p.blocks.length) {
    c.blocks = p.blocks.map((b, i) => blockFrom(b, p, i)).filter((b): b is Block => b !== null)
      .filter((b) => b.type !== "packages" || c.packages);
    // the promise's video is the top of the page's video, as on the first-format page
    const hero = c.blocks.find((b) => b.type === "hero");
    if (hero && hero.type === "hero") {
      c.hero = hero.data;
      c.blocks.forEach((b) => { if (b.type === "promise") b.data.video = hero.data.video; });
    }
    const contactBlock = c.blocks.find((b) => b.type === "contact");
    if (contactBlock && contactBlock.type === "contact") c.contact = contactBlock.data;
  } else {
    c.blocks = defaultBlocks(c, c.packages);
  }
  return c;
}

const UA = "TribeTravelSite/1.0 (+https://tribetravel.io)";

/** GET JSON with Node's https module. Used while the site is built: Cloudflare in front of TribeTravel refuses
 *  Node's built-in fetch (undici) as a bot even with a proper user agent, but lets this through. */
async function nodeGetJson(url: string): Promise<unknown> {
  const mod = url.startsWith("https:") ? await import("node:https") : await import("node:http");
  return new Promise((resolve, reject) => {
    const req = mod.get(url, { headers: { Accept: "application/json", "User-Agent": UA }, timeout: 8000 }, (res) => {
      if ((res.statusCode ?? 500) >= 300) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c: string) => (body += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
  });
}

/** Fetch the content; FALLBACK when TribeTravel can't be reached in 8 seconds or answers with an error. */
export async function loadSiteContent(): Promise<SiteContent> {
  const url = `${TRIBETRAVEL_URL}/api/site/${encodeURIComponent(AGENCY_SLUG)}/content`;
  try {
    if (import.meta.env.SSR) return merge((await nodeGetJson(url)) as Payload);
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { Accept: "application/json" } });
    if (!res.ok) return FALLBACK;
    return merge((await res.json()) as Payload);
  } catch (e) {
    if (import.meta.env.SSR) console.warn(`site content: using the built-in content (${(e as Error).message})`);
    return FALLBACK;
  }
}

/** "+27 76 939 9338" -> "+27769399338" and "https://wa.me/27769399338". */
export const phoneE164 = (p: string) => p.replace(/[^\d+]/g, "");
export const waLink = (p: string) => `https://wa.me/${p.replace(/\D/g, "")}`;
