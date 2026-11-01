// The website packages, add-ons and care plans on the Packages & pricing page (/packages). A copy of AiFundi's price
// book (Dropbox: AiFundi_WebDev_Pricing_2026-10_updated.xlsx, sheets Packages, Package Matrix, Modules, Care Plans):
// change a price there, then here. Prices are once-off unless they say monthly, in rand.
import { TRIBETRAVEL_URL } from "@/lib/site-content";

export type PackageId = "site" | "pro" | "platform" | "enterprise";

export type Package = {
  id: PackageId;
  name: string;
  design: string;
  /** The sample design that shows it. */
  href: string;
  tagline: string;
  /** For agencies on a paid TribeTravel subscription. */
  tribe: number;
  /** For everyone else. */
  other: number;
  from?: boolean;
  /** Running costs of the features it includes (WhatsApp, AI concierge, client login), a month. */
  monthly: number;
  market: string;
  popular?: boolean;
  pages: number;
};

export const PACKAGES: Package[] = [
  { id: "site", name: "Tribe Site", design: "Window Seat", href: "/", tagline: "A professional site that sends every lead to Tribe.",
    tribe: 7000, other: 12500, monthly: 0, market: "R35k – R60k", pages: 6 },
  { id: "pro", name: "Tribe Site Pro", design: "Living Map", href: "/designs/living-map", tagline: "More looks, bookings and automated follow-ups.",
    tribe: 16500, other: 24500, monthly: 250, market: "R60k – R120k", popular: true, pages: 10 },
  { id: "platform", name: "Business Platform", design: "Atlas", href: "/designs/atlas", tagline: "Your own dashboard and reports, and workflows that run themselves.",
    tribe: 29500, other: 45000, from: true, monthly: 250, market: "R150k – R400k", pages: 10 },
  { id: "enterprise", name: "Enterprise", design: "Enterprise", href: "/designs/enterprise", tagline: "Everything: AI concierge, online deposits, client login and an app.",
    tribe: 60000, other: 90000, monthly: 700, market: "R400k – R1.5m", pages: 15 },
];

export const ORDER: PackageId[] = ["site", "pro", "platform", "enterprise"];

/** A cell in the matrix: true (included), false (not), or a short text such as "3" or "Concierge". */
type Cell = boolean | string;
export type Row = { label: string; hint: string; cells: [Cell, Cell, Cell, Cell] };
export type Group = { title: string; rows: Row[] };

export const MATRIX: Group[] = [
  { title: "Your website", rows: [
    { label: "Pages", hint: "Home, destinations, about, contact and more.", cells: ["Up to 6", "Up to 10", "Up to 10", "15+"] },
    { label: "Design looks to choose from", hint: "Full design concepts before we build.", cells: ["1", "3", "3", "3"] },
    { label: "Edit your own words and pictures", hint: "In TribeTravel's visual editor.", cells: [true, true, true, true] },
    { label: "Mobile-ready, SEO set-up, POPIA consent", hint: "Privacy page, Google Analytics 4 and Meta Pixel.", cells: [true, true, true, true] },
    { label: "Website dashboard", hint: "Visitors, enquiries and chats in Tribe.", cells: [true, true, true, true] },
  ] },
  { title: "Winning the enquiry", rows: [
    { label: "Quote request and contact forms into Tribe", hint: "Every lead lands in your Enquiries inbox.", cells: [true, true, true, true] },
    { label: "AI web chat", hint: "Takes the trip brief and creates the client and a draft quote.", cells: [true, true, true, "AI concierge"] },
    { label: "Newsletter sign-up", hint: "Straight into Tribe.", cells: [true, true, true, true] },
    { label: "Live supplier feeds, bookable online", hint: "Your suppliers' APIs: live rates, clients book, it lands in Tribe. More suppliers: R500 each.",
      cells: ["2 suppliers", "2 suppliers", "3 suppliers", "3 suppliers"] },
  ] },
  { title: "Bookings and follow-ups", rows: [
    { label: "Bookings with seat limits", hint: "Group trips and call times; when full, the next date.", cells: [false, true, true, true] },
    { label: "Lead reminders", hint: "Your consultant is nudged when a quote goes quiet.", cells: [false, true, true, true] },
    { label: "WhatsApp and email updates to clients", hint: "Quote ready, deposit due, documents.", cells: [false, true, true, true] },
  ] },
  { title: "Running your agency", rows: [
    { label: "Custom dashboard and advanced reports", hint: "Conversion, booked value, consultants, lead sources.", cells: [false, false, true, true] },
    { label: "Workflow automation", hint: "Lead to quote to booking, set up once.", cells: [false, false, true, true] },
    { label: "Customer and supplier management", hint: "On your TribeTravel Pro or Pro+ plan.", cells: [false, false, true, true] },
  ] },
  { title: "The full experience", rows: [
    { label: "AI concierge", hint: "Answers questions, shows live packages, books calls, hands over on WhatsApp.", cells: [false, false, false, true] },
    { label: "Online deposits", hint: "Accept a quote and pay by card, EFT or QR (Paystack).", cells: [false, false, false, true] },
    { label: "Client login", hint: "Clients see quotes, payments, messages and documents.", cells: [false, false, false, true] },
    { label: "Blog and travel news", hint: "Written in TribeTravel, sent as a newsletter too.", cells: [false, false, false, true] },
    { label: "Outside CRM sync", hint: "HubSpot, Zoho or Salesforce.", cells: [false, false, false, true] },
    { label: "Installable app", hint: "On your client's home screen, with quote alerts.", cells: [false, false, false, true] },
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
};

const none = { site: 0, pro: 0, platform: 0, enterprise: 0 };

export const ADD_ONS: AddOn[] = [
  { id: "looks", name: "Extra design look", hint: "Another full design concept to choose from.", once: 1500, kind: "count",
    included: { site: 0, pro: 2, platform: 2, enterprise: 2 }, max: 4, unit: "look" },
  { id: "pages", name: "Extra page", hint: "One more page on the site.", once: 450, kind: "count", included: none, max: 30, unit: "page" },
  { id: "copy", name: "Copywriting and content loading", hint: "We write and load one page's words and pictures.", once: 350,
    kind: "count", included: none, max: 30, unit: "page" },
  // Every package includes live feeds (Hilton, 1 Nov 2026): 2 supplier APIs as standard (3 on Business Platform and
  // Enterprise), R500 for each more, to build it into the site's look. The price book's Modules sheet still says R4,500.
  { id: "feeds", name: "Extra supplier API (live feed)", hint: "Each supplier API beyond what your package includes, built into your site's look. You supply the supplier's API contract.",
    once: 500, kind: "count", included: { site: 2, pro: 2, platform: 3, enterprise: 3 }, max: 10, unit: "supplier" },
  { id: "booking", name: "Bookings with seat limits", hint: "Group trips and call times with seats left.", once: 3500,
    kind: "toggle", included: { site: 0, pro: 1, platform: 1, enterprise: 1 } },
  { id: "reminders", name: "Lead reminders", hint: "Your consultant is told when a quote goes quiet.", once: 2500,
    kind: "toggle", included: { site: 0, pro: 1, platform: 1, enterprise: 1 } },
  { id: "whatsapp", name: "WhatsApp and email updates", hint: "Meta's message fees are passed on at cost.", once: 2500,
    monthly: 250, kind: "toggle", included: { site: 0, pro: 1, platform: 1, enterprise: 1 } },
  { id: "dashboard", name: "Custom dashboard and reports", hint: "Your agency's numbers on one screen.", once: 1500,
    kind: "toggle", included: { site: 0, pro: 0, platform: 1, enterprise: 1 } },
  { id: "concierge", name: "AI concierge", hint: "The upgraded AI chat: live packages, call booking, WhatsApp handover.",
    once: 2000, monthly: 300, kind: "toggle", included: { site: 0, pro: 0, platform: 0, enterprise: 1 } },
  { id: "deposits", name: "Online deposits (Paystack)", hint: "Clients pay deposits and invoices on the site.", once: 1500,
    kind: "toggle", included: { site: 0, pro: 0, platform: 0, enterprise: 1 } },
  { id: "login", name: "Client login", hint: "Quotes, payments due, messages and documents in one place.", once: 2000,
    monthly: 150, kind: "toggle", included: { site: 0, pro: 0, platform: 0, enterprise: 1 } },
  { id: "blog", name: "Blog and travel news", hint: "Posts written in TribeTravel, published to the site.", once: 1500,
    kind: "toggle", included: { site: 0, pro: 0, platform: 0, enterprise: 1 } },
  { id: "crm", name: "Outside CRM sync", hint: "HubSpot, Zoho or Salesforce kept in step.", once: 5000, kind: "toggle",
    included: { site: 0, pro: 0, platform: 0, enterprise: 1 } },
  { id: "app", name: "Installable app", hint: "Your site on the client's home screen, with alerts.", once: 18000, kind: "toggle",
    included: { site: 0, pro: 0, platform: 0, enterprise: 1 } },
  { id: "store", name: "Store app (iOS and Android)", hint: "A real app in the app stores. Store fees are yours.", once: 60000,
    kind: "toggle", included: none },
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

export function rand(n: number) {
  return "R" + Math.round(n).toLocaleString("en-ZA").replace(/[\s, ]/g, ",");
}
