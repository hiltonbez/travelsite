import { DESIGNS, SHOW_DESIGNS } from "@/lib/designs";

/** The design gallery bar along the top of the demo site: one button per design, the current one highlighted. */
export function DesignBar({ current }: { current: string }) {
  if (!SHOW_DESIGNS) return null;
  return (
    <nav
      aria-label="Website designs"
      className="relative z-50 flex items-center gap-3 overflow-x-auto bg-[#111318] px-4 py-2.5 font-sans text-[13px] text-white/80 md:px-6"
    >
      <span className="hidden shrink-0 font-semibold text-white sm:inline">Design gallery</span>
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
              {d.name}
            </a>
          );
        })}
      </div>
      <span className="ml-auto hidden shrink-0 text-white/50 lg:inline">Every design is a TribeTravel website</span>
    </nav>
  );
}
