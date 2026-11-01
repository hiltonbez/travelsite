// Small pieces every Living Map page shares: a section's heading, the "example" label, the wax seal, the POPIA
// consent line and the context that carries the chosen look to pop-ups outside the page.
import { createContext, useContext, useId, type ReactNode } from "react";
import { BRAND } from "@/designs/shared";
import { accent, caps, h2, hand, soft, type Look } from "@/designs/living-map/theme";

/** The look the visitor chose, for pop-ups (portalled outside the page) that need its colours. */
export const LookContext = createContext<{ look: Look; setLook: (l: Look) => void }>({ look: "parchment", setLook: () => {} });
export const useLook = () => useContext(LookContext);

/** A section's opening: a map-lettered kicker, the heading, a line of intro and a handwritten note in the margin. */
export function SectionHead({ kicker, title, intro, note, className = "" }: {
  kicker: ReactNode; title: ReactNode; intro?: ReactNode; note?: string; className?: string;
}) {
  return (
    <div className={`relative flex max-w-[720px] flex-col gap-4 ${className}`}>
      <span className={`${caps} ${accent} flex items-center gap-3`}>{kicker}</span>
      <h2 className={h2}>{title}</h2>
      {intro && <p className={`text-lg leading-relaxed ${soft}`}>{intro}</p>}
      {note && <p className={`${hand} -rotate-2 text-2xl leading-tight ${accent}`}>{note}</p>}
    </div>
  );
}

/** Says plainly that something is example data, not live. */
export function Example({ children = "Example" }: { children?: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-dashed border-(--lm-accent) px-2.5 py-0.5 ${caps} text-[11px] ${accent}`}>{children}</span>
  );
}

/** A red wax seal with a line of map lettering round its rim and a word in the middle. */
export function WaxSeal({ word, rim, className = "" }: { word: string; rim: string; className?: string }) {
  const id = `seal${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <defs><path id={id} d="M50 50 m-31 0 a31 31 0 1 1 62 0 a31 31 0 1 1 -62 0" /></defs>
      <path fill="var(--lm-accent)" d="M50 4c7 0 9 4 15 6s11 1 15 6 1 10 4 15 7 9 6 15-6 8-6 14 3 11-1 16-10 3-15 6-7 10-14 12-11-3-17-2-11 5-16 1-3-10-7-14-11-5-12-11 4-10 3-16-6-10-3-15 9-5 12-10 0-11 5-14 10 1 15-1S43 4 50 4z" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="var(--lm-on-accent)" strokeOpacity=".5" strokeWidth="1" />
      <circle cx="50" cy="50" r="24" fill="none" stroke="var(--lm-on-accent)" strokeOpacity=".5" strokeWidth="1" />
      <text fontSize="8.5" letterSpacing="1.6" fill="var(--lm-on-accent)" fontFamily="'IM Fell English SC', Georgia, serif">
        <textPath href={`#${id}`}>{rim}</textPath>
      </text>
      <text x="50" y="56" textAnchor="middle" fontSize="17" fill="var(--lm-on-accent)" fontFamily="'IM Fell English', Georgia, serif" fontStyle="italic">{word}</text>
    </svg>
  );
}

/** POPIA: consent before details are saved. */
export function Consent() {
  return (
    <label className={`flex items-start gap-3 text-sm leading-relaxed ${soft}`}>
      <input type="checkbox" required className="mt-0.5 h-5 w-5 flex-none accent-(--lm-accent)" />
      <span>I agree that {BRAND.name} may use my details to plan and quote my trip (POPIA). We never share them with anyone else. <a href="/designs/living-map/privacy" className="underline underline-offset-2">Privacy notice</a></span>
    </label>
  );
}

/** A torn strip of tape, for pinning photos and notes to the page. */
export function Tape({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`absolute h-7 w-24 bg-(--lm-gold)/35 shadow-sm [clip-path:polygon(4%_0,100%_6%,96%_100%,0_92%)] ${className}`} />;
}
