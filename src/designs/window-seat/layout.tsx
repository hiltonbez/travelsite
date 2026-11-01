// The frame every Window Seat page shares: the sky and its clouds (sky.tsx), the header with the flight's progress
// along its bottom edge, the night-time footer with the postcard sign-up, the seatbelt-sign cookie notice and the
// cabin-crew call button. Pages link with plain links because each one is its own prerendered page
// (scripts/snapshot.mjs).
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, Plane, X } from "lucide-react";
import { BRAND, WhatsAppIcon, contact, mailto, tel } from "@/designs/shared";
import { CallButton } from "@/designs/window-seat/chat";
import { SeatbeltIcon, useWsReveal } from "@/designs/window-seat/parts";
import { Postcard } from "@/designs/window-seat/postcard";
import { Porthole, Scene, SkyLayer, useSky } from "@/designs/window-seat/sky";
import { BASE, HOME, MENU, QUOTE, body, coral, display, gutter, label, mono, soft, sunBtn } from "@/designs/window-seat/theme";

export function WindowSeatLayout({ current, chat = true, children }: { current: string; chat?: boolean; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useSky(root);
  useWsReveal();
  return (
    <div ref={root} className={`ws-root relative min-h-screen bg-[#FFF7EC] ${body} text-[#1C2340] [color-scheme:light]`}>
      <a href="#main" className="sr-only z-[70] rounded-full bg-[#1C2340] px-5 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">Skip to content</a>
      <SkyLayer />
      <Header current={current} />
      <main id="main" className="relative z-10 overflow-x-clip">{children}</main>
      <Footer />
      <SeatbeltSign />
      {chat && <CallButton />}
    </div>
  );
}

/** The agency's name with a setting sun. */
function Logo() {
  return (
    <a href={HOME} className="flex min-h-11 items-center gap-2.5" aria-label={`${BRAND.name}, home`}>
      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8 flex-none">
        <circle cx="16" cy="16" r="15" fill="#FFC857" />
        <path d="M6 20a10 10 0 0 1 20 0z" fill="#C2410C" />
        <path d="M3 20h26M6 24h20M10 28h12" stroke="#1C2340" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className={`${display} text-[22px] leading-none whitespace-nowrap`}>{BRAND.name}</span>
    </a>
  );
}

function Header({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);
  const link = (href: string) => `rounded-full px-3.5 py-2 transition hover:bg-[#1C2340]/8 ${href === current ? "bg-[#1C2340]/8 font-semibold" : ""}`;
  return (
    <>
      <header className={`sticky top-0 z-30 flex items-center justify-between gap-4 bg-[#FFF7EC]/80 ${gutter} py-3 backdrop-blur-md`}>
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 text-[15px] lg:flex">
          {MENU.map(([href, text]) => (
            <a key={href} href={href} aria-current={href === current ? "page" : undefined} className={link(href)}>{text}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className={`hidden ${mono} text-xs ${soft} xl:inline`}>Local time <span data-ws-clock>05:50 · Dawn</span></span>
          <a href={QUOTE} className={`${sunBtn} min-h-11 px-5 text-sm whitespace-nowrap max-sm:hidden`}>Get a quote</a>
          <button type="button" onClick={() => setOpen(true)} aria-label="Open the menu" aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#1C2340]/15 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
        {/* The flight so far: a dotted route with the plane riding along it as the page scrolls */}
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px border-b border-dashed border-[#1C2340]/20" />
        <span aria-hidden="true" className="ws-progress absolute bottom-0 left-0 h-[2px] bg-[#C2410C]" />
        <Plane aria-hidden="true" className="ws-progress-plane absolute -bottom-[9px] h-[18px] w-[18px] rotate-45 text-[#C2410C]" />
      </header>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Menu" className="ws-pop fixed inset-0 z-[60] flex flex-col bg-[#FFF7EC] px-[max(16px,5vw)] py-3">
          <div className="flex items-center justify-between">
            <Logo />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close the menu" autoFocus className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#1C2340]/15">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav aria-label="Main" className="mt-8 flex flex-col">
            {[...MENU, [QUOTE, "Get a quote"] as [string, string]].map(([href, text], i) => (
              <a key={href} href={href} aria-current={href === current ? "page" : undefined} onClick={() => setOpen(false)}
                className={`flex items-baseline gap-4 border-b border-[#1C2340]/10 py-4 ${display} text-[30px]`}>
                <span className={`${mono} text-xs ${coral}`}>{`1${i + 2}A`}</span>{text}
              </a>
            ))}
          </nav>
          <p className={`mt-auto ${mono} text-sm ${soft}`}>{contact.phoneDisplay} · {contact.email}</p>
        </div>
      )}
    </>
  );
}

/** Night falls: the footer, with the stars out, the postcard sign-up and the agency's details. */
function Footer() {
  const col = "flex flex-col gap-1 text-[15px] text-[#D9D6E8]";
  const a = "flex min-h-11 items-center hover:text-[#FFC857]";
  return (
    <footer className="ws-night relative z-10 overflow-hidden text-[#FFF7EC]">
      <div className={`relative grid gap-12 ${gutter} pt-20 pb-14 lg:grid-cols-[1.1fr_1fr] lg:items-center`}>
        <div className="flex flex-col gap-6">
          <span className={`${label} text-[#FFC857]`}>The trip letter</span>
          <h2 className={`${display} max-w-[16ch] text-[clamp(32px,4.4vw,52px)] leading-[1.02]`}>Postcards from the places you'll go next.</h2>
          <Postcard />
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div className={col}>
            <b className={`${label} mb-2 text-white`}>Explore</b>
            {MENU.map(([href, text]) => <a key={href} href={href} className={a}>{text}</a>)}
            <a href={QUOTE} className={a}>Get a quote</a>
          </div>
          <div className={col}>
            <b className={`${label} mb-2 text-white`}>Talk to us</b>
            <a href={tel} className={a}>{contact.phoneDisplay}</a>
            <a href={mailto} className={`${a} break-all`}>{contact.email}</a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className={`${a} gap-2`}><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a>
          </div>
          <div className={col}>
            <b className={`${label} mb-2 text-white`}>The small print</b>
            <a href={`${BASE}/privacy`} className={a}>Privacy (POPIA)</a>
            <a href={`${BASE}/about#flight-log`} className={a}>What your agency sees</a>
          </div>
        </div>
      </div>
      <div className={`relative flex flex-wrap justify-between gap-4 border-t border-white/10 ${gutter} py-6 pb-24 text-[13px] text-[#C9C5DD] md:pb-6`}>
        <span>© {BRAND.name} · {BRAND.tagline}</span>
        <span className={label}>A TribeTravel website</span>
      </div>
    </footer>
  );
}

const CONSENT_KEY = "ws-seatbelt";

/** The cookie notice as the overhead seatbelt sign: it chimes on after a moment until the visitor chooses. The choice
 *  is kept in this browser only. */
function SeatbeltSign() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let stored: string | null = "";
    try { stored = window.localStorage.getItem(CONSENT_KEY); } catch { stored = "essential"; }
    if (stored) return;
    const t = window.setTimeout(() => setShow(true), 1400);
    return () => window.clearTimeout(t);
  }, []);
  function choose(v: string) {
    try { window.localStorage.setItem(CONSENT_KEY, v); } catch { /* private mode: ask again next time */ }
    setShow(false);
  }
  if (!show) return null;
  return (
    <div role="region" aria-label="Cookies" className="ws-chime-in fixed bottom-4 left-4 right-24 z-40 max-w-[420px] rounded-[22px] bg-[#1C2340] p-4 text-[#FFF7EC] shadow-[0_30px_60px_-20px_rgba(28,35,64,.8)] md:left-6 md:bottom-6">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="ws-sign flex h-10 w-12 flex-none items-center justify-center rounded-lg bg-[#FFC857] text-[#1C2340]">
          <SeatbeltIcon className="h-7 w-7" />
        </span>
        <p className="text-[14px] leading-snug">
          <b className="block">Please fasten your seatbelt.</b>
          We use essential cookies to run this site and, if you allow it, anonymous visit statistics. <a href={`${BASE}/privacy`} className="underline underline-offset-2">Privacy</a>
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("all")} className="min-h-11 flex-1 rounded-full bg-[#FFC857] px-4 text-sm font-semibold text-[#1C2340]">Allow statistics</button>
        <button type="button" onClick={() => choose("essential")} className="min-h-11 flex-1 rounded-full border-2 border-white/30 px-4 text-sm font-semibold">Essential only</button>
      </div>
    </div>
  );
}

/** An inner page's opening: where you are, the title, a line of intro, and a window with a view of the place. */
export function PageTitle({ crumb, title, intro, photo, alt = "", children }: {
  crumb: string; title: ReactNode; intro?: string; photo: string; alt?: string; children?: ReactNode;
}) {
  return (
    <section className={`ws-hero relative grid items-center gap-10 ${gutter} pt-10 pb-14 md:grid-cols-[1.3fr_.7fr] md:pt-16`}>
      <div className="flex flex-col gap-5">
        <p className={`${label} ${soft}`}><a href={HOME} className="hover:underline">Home</a> <span className={coral}>✈</span> {crumb}</p>
        <h1 className={`ws-rise ${display} max-w-[15ch] text-[clamp(40px,6.4vw,88px)] leading-[0.98]`}>{title}</h1>
        {intro && <p className={`ws-rise max-w-[58ch] text-lg leading-relaxed ${soft} [animation-delay:.12s]`}>{intro}</p>}
        {children}
      </div>
      <Porthole shade="load" className="mx-auto aspect-[3/4] w-[min(56vw,250px)] md:w-[min(24vw,300px)]">
        <Scene img={photo} alt={alt} />
      </Porthole>
    </section>
  );
}
