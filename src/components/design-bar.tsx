import { DESIGNS, SHOW_DESIGNS } from "@/lib/designs";

/** The Packages & pricing page (routes/packages.tsx): the matrix, quote builder and request form. */
const PRICING = "/packages";

/** The design gallery bar along the top of the demo site: one button per package's design, the current one highlighted.
 *  `current` is the design's path in DESIGNS (the home page's for every Window Seat page). */
export function DesignBar({ current }: { current: string }) {
  if (!SHOW_DESIGNS) return null;
  return (
    <nav
      aria-label="Website designs"
      className="relative z-50 flex items-center gap-3 overflow-x-auto bg-[#111318] px-4 py-2.5 font-sans text-[13px] text-white/80 md:px-6"
    >
      <a href="/" aria-current={current === "/" ? "page" : undefined} className="shrink-0 font-semibold text-white hover:text-[#32BFD0]">AiFundi websites</a>
      <span className="hidden h-4 w-px shrink-0 bg-white/20 sm:inline" aria-hidden="true" />
      <a href="/designs/studio" className="shrink-0 font-semibold text-white">Explore 10 new designs ↗</a>
      <span className="hidden h-4 w-px shrink-0 bg-white/20 sm:inline" aria-hidden="true" />
      <div className="flex shrink-0 gap-1.5">
        {DESIGNS.map((d) => {
          const on = d.path === current;
          return (
            <a
              key={d.path}
              href={d.path}
              title={d.blurb}
              aria-current={on ? "page" : undefined}
              className={
                "inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3.5 font-medium transition " +
                (on ? "bg-white text-[#111318]" : "text-white/80 hover:bg-white/10 hover:text-white")
              }
            >
              {d.collection ? d.name : d.pkg}
            </a>
          );
        })}
      </div>
      <a
        href={PRICING}
        aria-current={current === PRICING ? "page" : undefined}
        className={
          "inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 font-semibold transition max-xl:ml-auto " +
          (current === PRICING ? "bg-white text-[#0B1D3A]" : "bg-[#1E6FE6] text-white hover:bg-[#3b82f6]")
        }
      >
        Compare &amp; price packages
      </a>
    </nav>
  );
}
