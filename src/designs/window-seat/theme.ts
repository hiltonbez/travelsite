// The Window Seat design's look, shared by every page: a warm cabin seen from the window seat. Cream walls, deep
// navy ink, a sunshine yellow for the call to action and a coral accent; the sky itself (sky.tsx) changes with the
// page's scroll from dawn to dusk.
export const WINDOW_SEAT_FONTS =
  "family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Figtree:wght@400;500;600;700&family=DM+Mono:wght@400;500";

export const body = "font-['Figtree',system-ui,sans-serif]";
export const display = "font-['Fraunces',Georgia,serif] font-semibold tracking-[-0.025em] [text-wrap:balance]";
export const mono = "font-['DM_Mono',ui-monospace,monospace]";
export const label = `${mono} text-[11px] uppercase tracking-[0.16em]`;
export const coral = "text-[#C2410C]";
export const soft = "text-[#4A5068]";
export const h2 = `${display} text-[clamp(34px,5vw,62px)] leading-[1.02]`;
/** A cream card floating on the sky. */
export const card = "rounded-[28px] bg-[#FFFBF5] shadow-[0_30px_60px_-34px_rgba(28,35,64,.45)] ring-1 ring-[#1C2340]/8";
export const btn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1C2340] px-6 text-[15px] font-semibold text-[#FFF7EC] shadow-[0_14px_30px_-14px_rgba(28,35,64,.7)] transition hover:-translate-y-0.5 hover:bg-[#2B3560] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0";
export const sunBtn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FFC857] px-6 text-[15px] font-semibold text-[#1C2340] shadow-[0_14px_30px_-14px_rgba(194,65,12,.6)] transition hover:-translate-y-0.5 hover:bg-[#FFD677]";
export const ghost = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[#1C2340]/80 px-6 text-[15px] font-semibold transition hover:bg-[#1C2340] hover:text-[#FFF7EC]";
export const input = "min-h-12 w-full rounded-2xl border border-[#1C2340]/15 bg-white px-4 text-[15px] text-[#1C2340] outline-none placeholder:text-[#4A5068]/70 focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/25";
export const gutter = "px-[max(16px,5vw)]";

/** Every page of the Window Seat site but the home page (/) lives under this path. */
export const BASE = "/designs/window-seat";
export const HOME = "/";
export const QUOTE = `${BASE}/quote`;

export const MENU: [string, string][] = [
  [HOME, "Home"],
  [`${BASE}/destinations`, "Destinations"],
  [`${BASE}/about`, "About us"],
  [`${BASE}/contact`, "Contact"],
];

/** The quote page for a place: the boarding pass reads `?to=` and fills in "To". */
export const quoteTo = (place: string) => (place ? `${QUOTE}?to=${encodeURIComponent(place)}` : QUOTE);

/** Buttons anywhere on the page open the cabin-crew chat with this window event. */
export const CHAT_EVENT = "ws-call-crew";
export const openChat = () => window.dispatchEvent(new Event(CHAT_EVENT));
