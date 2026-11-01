// The Living Map design's look, shared by every page: an explorer's map drawn in ink. The colours are CSS variables
// set by the chosen look (Parchment, Night Sky or Watercolour, see living-map.css), so every class here works in all
// three. Headings are engraved map lettering (IM Fell English), notes are handwritten (Caveat), text is Literata.
export const LIVING_MAP_FONTS =
  "family=Caveat:wght@500;700&family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&family=Literata:opsz,wght@7..72,400;7..72,600;7..72,700";

export const display = "font-['IM_Fell_English',Georgia,serif] font-normal [text-wrap:balance]";
export const caps = "font-['IM_Fell_English_SC',Georgia,serif] text-[13px] tracking-[0.14em]";
export const hand = "font-['Caveat',cursive]";
export const ink = "text-(--lm-ink)";
export const soft = "text-(--lm-soft)";
export const accent = "text-(--lm-accent)";
export const h2 = `${display} text-[clamp(34px,5vw,64px)] leading-[1.02]`;
export const card = "rounded-[6px] border border-(--lm-line) bg-(--lm-card) shadow-[0_22px_44px_-30px_var(--lm-shadow)]";
export const btn =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-(--lm-accent) px-6 text-[15px] font-semibold text-(--lm-on-accent) shadow-[0_10px_22px_-12px_var(--lm-shadow)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0";
export const ghost =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-[1.5px] border-(--lm-ink)/60 px-6 text-[15px] font-semibold transition hover:border-(--lm-accent) hover:text-(--lm-accent)";
export const input =
  "min-h-12 w-full rounded-md border border-(--lm-line) bg-(--lm-field) px-4 text-[15px] text-(--lm-ink) outline-none placeholder:text-(--lm-soft) focus:border-(--lm-accent)";
export const gutter = "px-[max(16px,5vw)]";

/** Every page of the Living Map site lives under this path. */
export const BASE = "/designs/living-map";

export const MENU: [string, string][] = [
  [`${BASE}/destinations`, "Destinations"],
  [`${BASE}/departures`, "Group departures"],
  [`${BASE}/specials`, "Specials"],
  [`${BASE}/reviews`, "Reviews"],
  [`${BASE}/about`, "About"],
  [`${BASE}/contact`, "Contact"],
];

/** The three looks the agency can choose from (Tribe Site Pro: 3 designs). Each sets the colours in living-map.css. */
export type Look = "parchment" | "night" | "watercolour";
export const LOOKS: { key: Look; name: string; line: string; swatch: [string, string, string] }[] = [
  { key: "parchment", name: "Parchment", line: "Ink on old paper, sealing-wax red", swatch: ["#F2E6C9", "#2A1C10", "#9E2A1E"] },
  { key: "night", name: "Night Sky", line: "Star charts in navy and gold", swatch: ["#0E1630", "#EEF0FF", "#F2C14E"] },
  { key: "watercolour", name: "Watercolour", line: "Soft washes of sea and sand", swatch: ["#FBFAF6", "#1E3442", "#B53A27"] },
];
/** Where the visitor's chosen look is remembered (localStorage). */
export const LOOK_KEY = "tt-living-map-look";
