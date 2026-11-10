// The website packages, add-ons and care plans on the Packages & pricing page (/packages). A copy of AiFundi's price
// book (Dropbox: AiFundi_WebDev_Pricing_2026-10_updated.xlsx, sheets Packages, Package Matrix, Modules, Care Plans):
// change a price there, then here. Prices are once-off unless they say monthly, in rand.
import { TRIBETRAVEL_URL } from "@/lib/site-content";

export type PackageId = "move" | "new" | "pro" | "platform" | "enterprise";

export type Package = {
  id: PackageId;
  name: string;
  design: string;
  /** The sample design that shows it. */
  href: string;
  tagline: string;
  /** What the landing page (/) says is included, in a sentence. */
  summary: string;
  /** The small picture of it on the landing page (public/images/landing). */
  image: string;
  /** For agencies on a paid TribeTravel subscription. */
  tribe: number;
  /** For everyone else. */
  other: number;
  from?: boolean;
  /** Running costs of the features it includes (WhatsApp, client login), a month; the AI tokens are AI_TOKENS, on every package. */
  monthly: number;
  market: string;
  popular?: boolean;
  pages: number;
};

// Tribe Site (R7,000, the Window Seat design) was dropped on 10 Nov 2026 and replaced by Move to Tribe and New Website.
// The non-TribeTravel prices of those two are our own estimate (the gap the old Tribe Site had): confirm them.
export const PACKAGES: Package[] = [
  { id: "move", name: "Move to Tribe", design: "Design Studio", href: "/designs/studio", tagline: "Keep your website. We connect it to Tribe.",
    summary: "Your existing site keeps its look. We add the AI Concierge, send enquiries to Tribe, show live supplier pricing and give you a back end in Tribe to change your content.",
    image: "/images/landing/move.jpg", tribe: 7000, other: 12500, monthly: 0, market: "R20k – R35k", pages: 0 },
  { id: "new", name: "New Website", design: "Design Studio", href: "/designs/studio", tagline: "A new 6-page site from scratch, built on Tribe.",
    summary: "A new 6-page website in one of our ten designs, with the AI Concierge, quote and contact forms into Tribe, live packages and online booking.",
    image: "/images/landing/new.jpg", tribe: 8500, other: 14000, monthly: 0, market: "R35k – R60k", pages: 6 },
  { id: "pro", name: "Tribe Site Pro", design: "Living Map", href: "/designs/living-map", tagline: "More looks, bookings and automated follow-ups.",
    summary: "Up to 10 pages and three design looks, plus group bookings with seat limits, lead reminders and WhatsApp and email updates to clients.",
    image: "/images/landing/pro.jpg", tribe: 16500, other: 24500, monthly: 250, market: "R60k – R120k", popular: true, pages: 10 },
  { id: "platform", name: "Business Platform", design: "Atlas", href: "/designs/atlas", tagline: "Your own dashboard and reports, and workflows that run themselves.",
    summary: "Everything in Pro, plus your own dashboard and reports, workflow automation and three live supplier feeds.",
    image: "/images/landing/platform.jpg", tribe: 29500, other: 45000, from: true, monthly: 250, market: "R150k – R400k", pages: 10 },
  { id: "enterprise", name: "Enterprise", design: "Enterprise", href: "/designs/enterprise", tagline: "Everything: online deposits, client login, a blog and CRM sync.",
    summary: "15+ pages with online deposits, a client login, a blog and travel news, and sync with HubSpot, Zoho or Salesforce.",
    image: "/images/landing/enterprise.jpg", tribe: 60000, other: 90000, monthly: 400, market: "R400k – R1.5m", pages: 15 },
];

export const ORDER: PackageId[] = ["move", "new", "pro", "platform", "enterprise"];

/** The AI Concierge comes with every package; its AI tokens are a monthly cost with a cap. */
export const AI_TOKENS = {
  monthly: 300,
  /** Tokens included each month (input and output together). */
  included: 3_000_000,
  /** A top-up: this many more tokens for `topUp` rand, charged only in a month that goes over. */
  topUpTokens: 1_000_000,
  topUp: 100,
  /** Roughly how many visitor chats the included tokens cover (about 20,000 tokens a chat). */
  chats: 150,
};
// Sizing (10 Nov 2026): Claude Sonnet 5.5 costs US$2 per million input tokens and US$10 per million output tokens. A chat
// is mostly input (the concierge's instructions, packages and the conversation so far), so about US$2.40 a million
// blended, or about R45 at R18 to the dollar. 3 million tokens cost about R130 of the R300; a 1-million top-up costs about
// R45 and sells for R100. When the month's tokens run out and the agency has not allowed top-ups, the concierge hands
// over to the enquiry form, so nobody gets a surprise bill.

/** A cell in the matrix: true (included), false (not), or a short text such as "3" or "Concierge". */
type Cell = boolean | string;
export type Row = { label: string; hint: string; cells: [Cell, Cell, Cell, Cell, Cell] };
export type Group = { title: string; rows: Row[] };

export const MATRIX: Group[] = [
  { title: "Your website", rows: [
    { label: "Pages", hint: "Home, destinations, about, contact and more.", cells: ["Your own", "Up to 6", "Up to 10", "Up to 10", "15+"] },
    { label: "Design looks to choose from", hint: "Full design concepts before we build.", cells: ["Keeps yours", "1 of 10", "3", "3", "3"] },
    { label: "Change your own content in Tribe", hint: "A back end in TribeTravel for your words, pictures and prices.", cells: [true, true, true, true, true] },
    { label: "Mobile-ready, SEO set-up, POPIA consent", hint: "Privacy page, Google Analytics 4 and Meta Pixel.", cells: [false, true, true, true, true] },
    { label: "Website dashboard", hint: "Visitors, enquiries and chats in Tribe.", cells: [true, true, true, true, true] },
  ] },
  { title: "Winning the enquiry", rows: [
    { label: "AI Concierge", hint: "Answers questions, shows live packages, takes the trip brief and books calls. AI tokens R300 a month.", cells: [true, true, true, true, true] },
    { label: "Enquiries into Tribe", hint: "Quote and contact forms: every lead lands in your Enquiries inbox.", cells: [true, true, true, true, true] },
    { label: "Newsletter sign-up", hint: "Straight into Tribe.", cells: [false, true, true, true, true] },
    { label: "Live supplier pricing, bookable online", hint: "Your suppliers' APIs: live rates, clients book, it lands in Tribe. More suppliers: R500 each.",
      cells: ["2 suppliers", "2 suppliers", "2 suppliers", "3 suppliers", "3 suppliers"] },
  ] },
  { title: "Bookings and follow-ups", rows: [
    { label: "Bookings with seat limits", hint: "Group trips and call times; when full, the next date.", cells: [false, false, true, true, true] },
    { label: "Lead reminders", hint: "Your consultant is nudged when a quote goes quiet.", cells: [false, false, true, true, true] },
    { label: "WhatsApp and email updates to clients", hint: "Quote ready, deposit due, documents.", cells: [false, false, true, true, true] },
  ] },
  { title: "Running your agency", rows: [
    { label: "Custom dashboard and advanced reports", hint: "Conversion, booked value, consultants, lead sources.", cells: [false, false, false, true, true] },
    { label: "Workflow automation", hint: "Lead to quote to booking, set up once.", cells: [false, false, false, true, true] },
    { label: "Customer and supplier management", hint: "On your TribeTravel Pro or Pro+ plan.", cells: [false, false, false, true, true] },
  ] },
  { title: "The full experience", rows: [
    { label: "Online deposits", hint: "Accept a quote and pay by card, EFT or QR (Paystack).", cells: [false, false, false, false, true] },
    { label: "Client login", hint: "Clients see quotes, payments, messages and documents.", cells: [false, false, false, false, true] },
    { label: "Blog and travel news", hint: "Written in TribeTravel, sent as a newsletter too.", cells: [false, false, false, false, true] },
    { label: "Outside CRM sync", hint: "HubSpot, Zoho or Salesforce.", cells: [false, false, false, false, true] },
  ] },
];

export type AddOn = {
  id: string;
  name: string;
  hint: string;
  once: number;
  monthly?: number;
  /** "count": the client chooses how many; "toggle": on or off. */
  kind: "count" | "toggle";
  /** How many each package already includes (for a toggle, 1 = included). */
  included: Record<PackageId, number>;
  max?: number;
  unit?: string;
  /** Quoted per agency: shown as "Price on request" and added to the request without a price. */
  onRequest?: boolean;
};

const none = { move: 0, new: 0, pro: 0, platform: 0, enterprise: 0 };

export const ADD_ONS: AddOn[] = [
  { id: "looks", name: "Extra design look", hint: "Another full design concept to choose from.", once: 1500, kind: "count",
    included: { move: 0, new: 0, pro: 2, platform: 2, enterprise: 2 }, max: 4, unit: "look" },
  { id: "pages", name: "Extra page", hint: "One more page on the site.", once: 450, kind: "count", included: none, max: 30, unit: "page" },
  { id: "copy", name: "Copywriting and content loading", hint: "We write and load one page's words and pictures.", once: 350,
    kind: "count", included: none, max: 30, unit: "page" },
  // Every package includes live feeds (Hilton, 1 Nov 2026): 2 supplier APIs as standard (3 on Business Platform and
  // Enterprise), R500 for each more, to build it into the site's look. The price book's Modules sheet still says R4,500.
  { id: "feeds", name: "Extra supplier API (live feed)", hint: "Each supplier API beyond what your package includes, built into your site's look. You supply the supplier's API contract.",
    once: 500, kind: "count", included: { move: 2, new: 2, pro: 2, platform: 3, enterprise: 3 }, max: 10, unit: "supplier" },
  { id: "booking", name: "Bookings with seat limits", hint: "Group trips and call times with seats left.", once: 3500,
    kind: "toggle", included: { move: 0, new: 0, pro: 1, platform: 1, enterprise: 1 } },
  { id: "reminders", name: "Lead reminders", hint: "Your consultant is told when a quote goes quiet.", once: 2500,
    kind: "toggle", included: { move: 0, new: 0, pro: 1, platform: 1, enterprise: 1 } },
  { id: "whatsapp", name: "WhatsApp and email updates", hint: "Meta's message fees are passed on at cost.", once: 2500,
    monthly: 250, kind: "toggle", included: { move: 0, new: 0, pro: 1, platform: 1, enterprise: 1 } },
  { id: "dashboard", name: "Custom dashboard and reports", hint: "Your agency's numbers on one screen.", once: 1500,
    kind: "toggle", included: { move: 0, new: 0, pro: 0, platform: 1, enterprise: 1 } },
  // The AI Concierge is in every package now; what can be added is more AI tokens for a busy month.
  { id: "tokens", name: "Extra AI tokens", hint: "Pre-book 1 million more AI Concierge tokens a month (about 50 more chats). Without it, a month that goes over is R100 per extra million.",
    once: 0, monthly: 100, kind: "count", included: none, max: 20, unit: "million tokens" },
  { id: "deposits", name: "Online deposits (Paystack)", hint: "Clients pay deposits and invoices on the site.", once: 1500,
    kind: "toggle", included: { move: 0, new: 0, pro: 0, platform: 0, enterprise: 1 } },
  { id: "login", name: "Client login", hint: "Quotes, payments due, messages and documents in one place.", once: 2000,
    monthly: 150, kind: "toggle", included: { move: 0, new: 0, pro: 0, platform: 0, enterprise: 1 } },
  { id: "blog", name: "Blog and travel news", hint: "Posts written in TribeTravel, published to the site.", once: 1500,
    kind: "toggle", included: { move: 0, new: 0, pro: 0, platform: 0, enterprise: 1 } },
  { id: "crm", name: "Outside CRM sync", hint: "HubSpot, Zoho or Salesforce kept in step.", once: 5000, kind: "toggle",
    included: { move: 0, new: 0, pro: 0, platform: 0, enterprise: 1 } },
  // No set price: each agency's store app is quoted on its own (Apple's US$99 a year and its own developer account).
  { id: "store", name: "Store app (iOS and Android)", hint: "Your own app in the App Store and Google Play. Apple and Google's fees are yours.",
    once: 0, onRequest: true, kind: "toggle", included: none },
];

export type CarePlan = { id: string; name: string; monthly: number; hint: string };

export const CARE_PLANS: CarePlan[] = [
  { id: "care", name: "Care", monthly: 450, hint: "Hosting, SSL, daily backups, security updates, uptime watch." },
  { id: "plus", name: "Care Plus", monthly: 850, hint: "Care, plus 1 hour of changes a month, a monthly stats report and AI chat tuning." },
  { id: "growth", name: "Growth", monthly: 1650, hint: "Care Plus, plus 3 hours of changes, SEO and content updates, a quarterly review." },
];

export const MAILBOX = { name: "Business email (Zoho Mail)", monthly: 40, hint: "Per mailbox: spam filtering, webmail and phone apps." };

export const QUOTE_TO = "hilton@tribetravel.io";
/** TribeTravel emails the request to QUOTE_TO (site_api.website_quote); it only accepts this site's address. */
export const QUOTE_URL = `${TRIBETRAVEL_URL}/api/website-quote`;

/** The 12-month payment plan for a once-off price: the price over 12 months, rounded up to the next rand. */
export const PLAN_MONTHS = 12;
export function instalment(n: number) {
  return Math.ceil(n / PLAN_MONTHS);
}

export function rand(n: number) {
  return "R" + Math.round(n).toLocaleString("en-ZA").replace(/[\s, ]/g, ",");
}
