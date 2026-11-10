// AiFundi's header, on every page of the demo site (the landing page, pricing, the design gallery and every sample
// site): the AiFundi logo and the top menu, in aifundi.io's colours and fonts. It replaced the dark design bar on
// 10 Nov 2026. It shows on the demo agency's site only (SHOW_DESIGNS) and never inside TribeTravel's visual editor.
import { ArrowRight } from "lucide-react";
import { SHOW_DESIGNS } from "@/lib/designs";

export const LANDING_FONTS = "family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800";
export const BROWSE = "/designs/studio";

const head = "font-['Manrope','Segoe_UI',Arial,sans-serif]";

const MENU = [
  { href: "/#packages", label: "Packages", key: "/" },
  { href: BROWSE, label: "Browse designs", key: BROWSE },
  { href: "/#ai-tokens", label: "AI Concierge", key: "concierge" },
];

/** `current` is the page's path, to mark its menu item; `sticky` keeps it at the top of AiFundi's own pages (the sample
 *  sites have their own sticky menus, so there it scrolls away). */
export function AifundiHeader({ current, sticky = false }: { current?: string; sticky?: boolean }) {
  if (!SHOW_DESIGNS) return null;
  return (
    <>
      {/* React puts this in the head; every page needs AiFundi's fonts for the header */}
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${LANDING_FONTS}&display=swap`} precedence="default" />
      <header className={`${sticky ? "sticky top-0" : "relative"} z-[60] border-b border-[#D9E7E9] bg-white/95 text-[#102E3B] backdrop-blur [color-scheme:light]`}>
        <div className="mx-auto flex h-[68px] w-full max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <a href="/" aria-label="AiFundi websites home" className="shrink-0">
            <img src="/images/landing/aifundi-logo.png" alt="AIFUNDI.io" width={2172} height={724} className="h-auto w-[132px] sm:w-[160px]" />
          </a>
          <nav aria-label="AiFundi" className={`${head} flex items-center gap-0.5 text-[14px] font-bold`}>
            {MENU.map((m) => (
              <a key={m.href} href={m.href} aria-current={current === m.key ? "page" : undefined}
                className={`min-h-11 items-center rounded-full px-3 !no-underline lg:px-4 ${m.key === BROWSE ? "hidden sm:inline-flex" : "hidden md:inline-flex"} ${current === m.key ? "!text-[#0F6F8B]" : "!text-[#102E3B] hover:!text-[#0F6F8B]"}`}>
                {m.label}
              </a>
            ))}
            <a href="/packages" aria-current={current === "/packages" ? "page" : undefined}
              className="ml-1 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-[#0A3D52] px-4 text-[14px] !text-white !no-underline transition hover:bg-[#0F6F8B] sm:px-5">
              Build a quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
