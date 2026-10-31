// The Enterprise design's "Night flight" look, shared by every page: a night-time navigation chart with a navy page,
// ivory ink and runway orange as the one accent (text on orange is navy).
export const ENTERPRISE_FONTS = "family=Archivo:wdth,wght@125,500;125,800&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600";

export const display = "font-['Archivo','Arial_Black',sans-serif] [font-stretch:125%] font-extrabold uppercase [text-wrap:balance]";
export const mono = "font-['JetBrains_Mono',ui-monospace,monospace]";
export const label = `${mono} text-[11px] uppercase tracking-[0.14em]`;
export const orange = "text-[#FF6A2E]";
export const soft = "text-[#B9B3A6]";
export const h2 = `${display} text-[clamp(32px,4.4vw,64px)] leading-[0.94]`;
export const panel = "rounded-[22px] border border-[#EDE6D8]/12 bg-[#111D33]";
export const btn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF6A2E] px-6 text-[15px] font-semibold text-[#0B1424] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0";
export const ghost = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#EDE6D8]/60 px-6 text-[15px] font-semibold transition hover:border-[#FF6A2E] hover:text-[#FF6A2E]";
export const input = "min-h-12 w-full rounded-xl border border-[#EDE6D8]/15 bg-[#0B1424] px-4 text-[15px] text-[#EDE6D8] outline-none placeholder:text-[#B9B3A6]/70 focus:border-[#FF6A2E]";
export const gutter = "px-[max(16px,5vw)]";

/** Every page of the Enterprise site lives under this path. */
export const BASE = "/designs/enterprise";

export const MENU: [string, string][] = [
  [`${BASE}/destinations`, "Destinations"],
  [`${BASE}#live`, "Book online"],
  [`${BASE}/gallery`, "Gallery"],
  [`${BASE}/news`, "Travel news"],
  [`${BASE}/about`, "About"],
  [`${BASE}/contact`, "Contact"],
];

/** The concierge panel opens from its section and from the floating button; this keeps them in step. */
export const OPEN_EVENT = "tt-concierge-open";
