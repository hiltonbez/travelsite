// The Atlas design's "Sunlit" look, shared by every page: a bright product-site page in morning light. Off-white
// sky, deep-ocean ink, sky blue for actions and a warm sun accent; glassy cards and generous whitespace. Each of the
// agency's three supplier feeds has its own colour, used for its orbit ring around the globe and its cards.
export const ATLAS_FONTS = "family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Manrope:wght@400;500;600;700;800&family=DM+Mono:wght@400;500";

export const sans = "font-['Manrope',system-ui,sans-serif]";
export const display = "font-['Bricolage_Grotesque',system-ui,sans-serif] font-bold tracking-[-0.035em] [text-wrap:balance]";
export const mono = "font-['DM_Mono',ui-monospace,monospace]";
export const label = `${mono} text-[11px] uppercase tracking-[0.16em]`;

// Colours: ink #0B2340 on the page, muted #4B6280, action blue #1D6FD8 (white text on it), sun #FFB547 (ink text on it)
// and warm text #A84A06 for the accent in words.
export const ink = "text-[#0B2340]";
export const muted = "text-[#4B6280]";
export const sky = "text-[#1D6FD8]";
export const warm = "text-[#A84A06]";

export const h2 = `${display} text-[clamp(34px,4.6vw,64px)] leading-[0.98]`;
export const glass = "rounded-[28px] border border-white/80 bg-white/65 shadow-[0_24px_60px_-34px_rgba(11,35,64,.45)] backdrop-blur-xl";
export const card = "rounded-[24px] border border-[#0B2340]/8 bg-white shadow-[0_18px_44px_-30px_rgba(11,35,64,.4)]";
export const btn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1D6FD8] px-6 text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(29,111,216,.7)] transition hover:-translate-y-0.5 hover:bg-[#165DB8] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#FFB547] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0";
export const ghost = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#0B2340]/15 bg-white/70 px-6 text-[15px] font-bold text-[#0B2340] backdrop-blur transition hover:border-[#1D6FD8] hover:text-[#1D6FD8]";
export const input = "min-h-12 w-full rounded-2xl border border-[#0B2340]/12 bg-white px-4 text-[15px] text-[#0B2340] outline-none placeholder:text-[#4B6280]/75 focus:border-[#1D6FD8] focus:ring-4 focus:ring-[#1D6FD8]/15";
export const gutter = "px-[max(16px,5vw)]";
export const chip = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold";

/** Every page of the Atlas site lives under this path. */
export const BASE = "/designs/atlas";

export const MENU: [string, string][] = [
  [`${BASE}/destinations`, "Destinations"],
  [`${BASE}/suppliers`, "Live packages"],
  [`${BASE}/book`, "Book"],
  [`${BASE}/automation`, "How we work"],
  [`${BASE}/dashboard`, "Behind the counter"],
  [`${BASE}/about`, "About"],
  [`${BASE}/contact`, "Contact"],
];

/** The floating assistant opens from its button and from any "Ask our assistant" link; this keeps them in step. */
export const CHAT_EVENT = "atlas-chat-open";

/** The agency's three supplier feeds, each an orbit ring around the globe. The third is an example. */
export type FeedKey = "beachcomber" | "thompsons" | "example";
export const FEEDS: { key: FeedKey; name: string; line: string; colour: string; example?: boolean }[] = [
  { key: "beachcomber", name: "Beachcomber", line: "Live rates · book online", colour: "#0E9FAE" },
  { key: "thompsons", name: "Thompsons Holidays", line: "Live packages · enquire", colour: "#F08C2E" },
  { key: "example", name: "Coastline Cruises", line: "Example supplier · enquire", colour: "#7B61FF", example: true },
];

/** The sky-to-sunset gradient on a headline's key words (dark enough at both ends to read on the page). */
export const glow = "bg-[linear-gradient(95deg,#1D6FD8,#6A52E8_55%,#C2570C)] bg-clip-text text-transparent [-webkit-box-decoration-break:clone] [box-decoration-break:clone]";
