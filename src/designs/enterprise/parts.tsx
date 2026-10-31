// Small pieces every Enterprise page shares: the stop label, the live dot and the POPIA consent line.
import type { ReactNode } from "react";
import { BRAND } from "@/designs/shared";
import { btn, display, ghost, gutter, h2, input, label, mono, orange, panel, soft } from "@/designs/enterprise/theme";

/** "Stop 2 · AI concierge": the label every section opens with, naming where it sits on the route. */
export function StopLabel({ children }: { children: ReactNode }) {
  return <span className={`${label} ${orange} flex items-center gap-3`}>{children}</span>;
}

export function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF6A2E] opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FF6A2E]" />
    </span>
  );
}

/** POPIA: consent before details are saved. */
export function Consent() {
  return (
    <label className={`flex items-start gap-2.5 text-xs leading-relaxed ${soft}`}>
      <input type="checkbox" required className="mt-0.5 h-4 w-4 flex-none accent-[#FF6A2E]" />
      I agree that {BRAND.name} may use my details to plan and quote my trip (POPIA). We never share them with anyone else.
    </label>
  );
}
