// The three looks (Tribe Site Pro: 3 designs to choose from). An ink-pot control in the header switches the whole map
// between Parchment, Night Sky and Watercolour, and the home page shows them side by side. The choice is remembered in
// this browser; the prerendered page is always Parchment.
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { LookContext, SectionHead, useLook } from "@/designs/living-map/parts";
import { LOOKS, LOOK_KEY, caps, card, display, gutter, soft, type Look } from "@/designs/living-map/theme";

/** The look state for the layout: Parchment on the server and on first paint, then the visitor's saved choice. */
export function useLookState() {
  const [look, setLookState] = useState<Look>("parchment");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOOK_KEY);
      if (saved && LOOKS.some((l) => l.key === saved)) setLookState(saved as Look);
    } catch {
      // storage blocked (private mode): stay on Parchment
    }
  }, []);
  const setLook = (l: Look) => {
    setLookState(l);
    try {
      window.localStorage.setItem(LOOK_KEY, l);
    } catch {
      // not remembered, but still switched
    }
  };
  return { look, setLook };
}
export { LookContext };

/** A little ink pot in the look's colours. */
function InkPot({ swatch, className = "" }: { swatch: [string, string, string]; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d="M9 12h14l3 5v9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-9z" fill={swatch[0]} stroke={swatch[1]} strokeWidth="1.5" />
      <rect x="11" y="7" width="10" height="5" rx="1" fill={swatch[1]} />
      <path d="M8 21h16v5a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" fill={swatch[2]} />
      <path d="M22 2l-5 9" stroke={swatch[1]} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** The header's ink-pot control: tap it, pick a look. */
export function LookSwitcher() {
  const { look, setLook } = useLook();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const current = LOOKS.find((l) => l.key === look) ?? LOOKS[0]!;

  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="true"
        aria-label={`Change the look. Now: ${current.name}`}
        className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-(--lm-line) px-2.5 transition hover:border-(--lm-accent) sm:px-3.5">
        <InkPot swatch={current.swatch} className="h-6 w-6" />
        <span className="hidden text-sm font-semibold xl:inline">{current.name}</span>
      </button>
      {open && (
        <div role="radiogroup" aria-label="Look" className={`lm-rise absolute top-13 right-0 z-50 flex w-[min(280px,calc(100vw-32px))] flex-col gap-1 p-2 ${card}`}>
          <span className={`${caps} px-3 pt-2 pb-1 text-[11px] ${soft}`}>Choose a look</span>
          {LOOKS.map((l) => (
            <button key={l.key} type="button" role="radio" aria-checked={look === l.key} onClick={() => { setLook(l.key); setOpen(false); }}
              className={`flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-left transition hover:bg-(--lm-ink)/6 ${look === l.key ? "bg-(--lm-ink)/8" : ""}`}>
              <InkPot swatch={l.swatch} className="h-8 w-8 flex-none" />
              <span className="flex flex-1 flex-col">
                <b className="text-[15px]">{l.name}</b>
                <span className={`text-xs ${soft}`}>{l.line}</span>
              </span>
              {look === l.key && <Check className="h-4 w-4 flex-none" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** The home page's look picker: three small maps, one per look. Choosing one re-inks the whole site. */
export function LookCards() {
  const { look, setLook } = useLook();
  return (
    <section data-pin className={`relative z-10 flex flex-col gap-10 ${gutter} py-24`}>
      <SectionHead kicker="Three designs · one map" title={<>Pick your <em>ink.</em></>}
        intro="Tribe Site Pro comes with three designs to choose from. Tap one: this whole site changes to match, and your browser remembers it."
        note="Go on, try Night Sky →" />
      <div role="radiogroup" aria-label="Look" className="grid gap-5 md:grid-cols-3">
        {LOOKS.map((l, i) => (
          <button key={l.key} type="button" role="radio" aria-checked={look === l.key} onClick={() => setLook(l.key)}
            className={`group relative flex flex-col gap-4 overflow-hidden p-5 text-left transition hover:-translate-y-1 ${card} ${look === l.key ? "ring-2 ring-(--lm-accent)" : ""}`}
            style={{ transform: `rotate(${(i - 1) * 1.2}deg)` }}>
            <span className="relative block aspect-[16/10] overflow-hidden rounded-[4px]" style={{ background: l.swatch[0] }}>
              <svg viewBox="0 0 160 100" aria-hidden="true" className="absolute inset-0 h-full w-full">
                {[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="160" y1={y} y2={y} stroke={l.swatch[1]} strokeOpacity=".12" strokeDasharray="3 4" />)}
                <path d="M30 10 C50 8 70 18 78 30 C86 44 74 60 80 74 C86 88 70 96 58 92 C44 88 40 70 34 58 C26 42 14 30 30 10 Z" fill={l.swatch[1]} fillOpacity=".12" stroke={l.swatch[1]} strokeWidth="1.2" />
                <path d="M118 52 C124 50 128 60 124 70 C120 76 114 70 116 62 Z" fill={l.swatch[1]} fillOpacity=".12" stroke={l.swatch[1]} strokeWidth="1" />
                <path d="M62 70 Q100 30 140 62" fill="none" stroke={l.swatch[2]} strokeWidth="2" strokeDasharray="4 3" />
                <circle cx="62" cy="70" r="3" fill={l.swatch[2]} /><circle cx="140" cy="62" r="3" fill={l.swatch[2]} />
              </svg>
              <span className="absolute right-3 bottom-2 font-['Caveat',cursive] text-xl font-bold" style={{ color: l.swatch[1] }}>{l.name}</span>
            </span>
            <span className="flex items-center justify-between gap-3">
              <span className="flex flex-col">
                <b className={`${display} text-2xl`}>{l.name}</b>
                <span className={`text-sm ${soft}`}>{l.line}</span>
              </span>
              <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-full border ${look === l.key ? "border-(--lm-accent) bg-(--lm-accent) text-(--lm-on-accent)" : "border-(--lm-line)"}`}>
                {look === l.key ? <Check className="h-5 w-5" /> : <InkPot swatch={l.swatch} className="h-6 w-6" />}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
