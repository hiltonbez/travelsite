// The frame every Atlas page shares: the sunlit sky behind the page, the glass header with its menu, the footer with
// the newsletter sign-up, the floating assistant and the mobile action bar. Pages link to each other with plain
// links because each one is its own prerendered page (scripts/snapshot.mjs).
import { useState, type ReactNode } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEnquiry } from "@/lib/enquiry";
import { BRAND, BotTrap, WhatsAppIcon, contact, mailto, tel } from "@/designs/shared";
import { ChatLauncher } from "@/designs/atlas/chat";
import { Consent, Toasts } from "@/designs/atlas/parts";
import { BASE, MENU, btn, display, glow, gutter, input, label, mono, muted, sans } from "@/designs/atlas/theme";

export function AtlasLayout({ current, children, toasts = false }: { current: string; children: ReactNode; toasts?: boolean }) {
  return (
    <div className={`relative min-h-screen overflow-x-clip bg-[#F5F8FC] ${sans} text-[#0B2340] [color-scheme:light]`}>
      {/* Morning light: a warm sun top right and open sky top left. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[1100px] bg-[radial-gradient(60%_50%_at_88%_0%,rgba(255,196,110,.38),transparent_70%),radial-gradient(55%_45%_at_5%_8%,rgba(120,180,250,.3),transparent_70%)]" />
      <a href="#main" className="sr-only z-50 rounded-full bg-[#0B2340] px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-16 focus:left-4">Skip to the page</a>
      <Header current={current} />
      <main id="main" className="relative">{children}</main>
      <Footer />
      <ChatLauncher />
      {toasts && <Toasts />}
      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2.5 border-t border-[#0B2340]/8 bg-white/90 p-3 backdrop-blur-xl md:hidden">
        <a href={`${BASE}/contact#quote`} className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#1D6FD8] font-bold text-white">Get a quote</a>
        <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#0B2340]/15 font-bold">
          <WhatsAppIcon className="h-5 w-5 text-[#16A34A]" /> WhatsApp
        </a>
      </div>
    </div>
  );
}

/** A small sun rising over a globe's curve, beside the agency's name. */
function Logo() {
  return (
    <a href={BASE} className={`flex min-h-11 items-center gap-2.5 ${display} text-[19px] whitespace-nowrap`}>
      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8 flex-none">
        <circle cx="16" cy="16" r="15" fill="#EEF5FE" stroke="#1D6FD8" strokeWidth="1.5" />
        <path d="M1.5 19 Q16 9 30.5 19" fill="none" stroke="#1D6FD8" strokeWidth="1.5" />
        <path d="M5 26 Q16 17 27 26" fill="none" stroke="#1D6FD8" strokeOpacity=".45" strokeWidth="1.2" />
        <circle cx="21" cy="9.5" r="4" fill="#FFB547" />
      </svg>
      {BRAND.name}
    </a>
  );
}

function Header({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const here = (href: string) => href === current || (href !== BASE && current.startsWith(href));
  return (
    <>
      <header className={`sticky top-0 z-30 flex items-center justify-between gap-6 border-b border-white/70 bg-[#F5F8FC]/75 ${gutter} py-3 backdrop-blur-xl`}>
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 rounded-full border border-[#0B2340]/8 bg-white/70 p-1 xl:flex">
          {MENU.slice(0, 6).map(([href, text]) => (
            <a key={href} href={href} aria-current={here(href) ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition ${here(href) ? "bg-[#0B2340] text-white" : "text-[#0B2340] hover:bg-[#EEF5FE]"}`}>
              {text}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={`${BASE}/contact`} className={`${btn} min-h-11 px-5 text-sm whitespace-nowrap max-sm:hidden`}>Plan my trip <ArrowRight className="h-4 w-4" /></a>
          <button type="button" onClick={() => setOpen(true)} aria-label="Open the menu" aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0B2340]/12 bg-white xl:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>
      {/* The open menu sits outside the header: the header's backdrop blur would otherwise trap it inside the header. */}
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Menu" className="atlas-pop fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[#F5F8FC]/95 px-[max(16px,5vw)] py-3 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <Logo />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close the menu" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0B2340]/12 bg-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav aria-label="Main" className="mt-8 flex flex-col">
            {[[BASE, "Home"] as [string, string], ...MENU].map(([href, text], i) => (
              <a key={href} href={href} onClick={() => setOpen(false)} aria-current={here(href) ? "page" : undefined}
                className={`flex min-h-14 items-center justify-between border-b border-[#0B2340]/8 ${display} text-[26px] ${here(href) ? "text-[#1D6FD8]" : ""}`}>
                {text}<span className={`${mono} text-xs ${muted}`}>{String(i).padStart(2, "0")}</span>
              </a>
            ))}
          </nav>
          <a href={`${BASE}/contact`} className={`${btn} mt-8 min-h-14`}>Plan my trip <ArrowRight className="h-4 w-4" /></a>
          <p className={`mt-auto pt-8 ${mono} text-sm ${muted}`}>{contact.phoneDisplay} · {contact.email}</p>
        </div>
      )}
    </>
  );
}

/** Newsletter sign-up into TribeTravel. Until Tribe has a newsletter endpoint it arrives as an enquiry, marked as a
 *  sign-up with the reader's interests, so the agency can add them to its list. */
export function Newsletter() {
  const [interests, setInterests] = useState<string[]>([]);
  const { status, onSubmit, sending } = useEnquiry(() => ({
    name: "Newsletter sign-up",
    message: `Newsletter sign-up. Interests: ${interests.join(", ") || "anything"}.`,
  }));
  const toggle = (x: string) => setInterests((v) => (v.includes(x) ? v.filter((y) => y !== x) : [...v, x]));

  if (status.kind === "sent") {
    return <p role="status" className="text-lg font-semibold">You're on the list. Look out for our next trip letter.</p>;
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="What would you like to hear about?">
        {["Islands", "Safari", "Cruises", "Europe", "Group departures"].map((x) => (
          <button key={x} type="button" aria-pressed={interests.includes(x)} onClick={() => toggle(x)}
            className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition ${interests.includes(x) ? "border-[#1D6FD8] bg-[#1D6FD8] text-white" : "border-[#0B2340]/12 bg-white hover:border-[#1D6FD8]"}`}>
            {x}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="atlas-newsletter-email">Email</label>
        <input id="atlas-newsletter-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={`${input} flex-1 rounded-full px-5`} />
        <button type="submit" disabled={sending} className={btn}>{sending ? "Signing up…" : "Send me trip ideas"}</button>
      </div>
      <Consent />
      <BotTrap />
      {status.kind === "error" && <p role="alert" className="text-sm font-semibold text-[#B42318]">{status.message}</p>}
    </form>
  );
}

function Footer() {
  const col = `flex flex-col gap-1 text-sm ${muted}`;
  const link = "flex min-h-11 items-center hover:text-[#1D6FD8]";
  return (
    <footer className="relative mt-12 border-t border-[#0B2340]/8 bg-white/60">
      <div className={`grid gap-12 ${gutter} py-16 lg:grid-cols-[1.2fr_1fr]`}>
        <div className="flex max-w-[560px] flex-col gap-4">
          <span className={`${label} text-[#1D6FD8]`}>The trip letter</span>
          <h2 className={`${display} text-3xl leading-tight md:text-4xl`}>New trips, <span className={glow}>once a month.</span></h2>
          <Newsletter />
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div className={col}>
            <b className={`${label} mb-2 text-[#0B2340]`}>Explore</b>
            {MENU.slice(0, 3).map(([href, text]) => <a key={href} href={href} className={link}>{text}</a>)}
          </div>
          <div className={col}>
            <b className={`${label} mb-2 text-[#0B2340]`}>Agency</b>
            <a href={`${BASE}/automation`} className={link}>How we work</a>
            <a href={`${BASE}/dashboard`} className={link}>Behind the counter</a>
            <a href={`${BASE}/about`} className={link}>About us</a>
            <a href={`${BASE}/privacy`} className={link}>Privacy (POPIA)</a>
          </div>
          <div className={col}>
            <b className={`${label} mb-2 text-[#0B2340]`}>Talk to us</b>
            <a href={tel} className={link}>{contact.phoneDisplay}</a>
            <a href={mailto} className={`${link} break-all`}>{contact.email}</a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className={link}>WhatsApp</a>
            <a href={`${BASE}/contact`} className={link}>Contact</a>
          </div>
        </div>
      </div>
      <div className={`flex flex-wrap justify-between gap-4 border-t border-[#0B2340]/8 ${gutter} py-6 pb-28 text-[13px] ${muted} md:pb-6`}>
        <span className="font-bold text-[#0B2340]">{BRAND.name} · {BRAND.tagline}</span>
        <span className={label}>A TribeTravel website</span>
      </div>
    </footer>
  );
}

/** An inner page's opening: where you are, the title, a line of intro, and whatever the page puts beside it. */
export function PageTitle({ crumb, title, intro, children, aside }: { crumb: ReactNode; title: ReactNode; intro?: string; children?: ReactNode; aside?: ReactNode }) {
  return (
    <section className={`relative grid items-center gap-10 ${gutter} pt-12 pb-14 md:pt-16 ${aside ? "lg:grid-cols-[1.1fr_.9fr]" : ""}`}>
      <div className="flex flex-col gap-6">
        <p className={`${label} ${muted}`}><a href={BASE} className="hover:text-[#1D6FD8]">Home</a> <span className="text-[#1D6FD8]">/</span> {crumb}</p>
        <h1 className={`d-rise ${display} max-w-[16ch] text-[clamp(40px,6.2vw,88px)] leading-[0.95]`}>{title}</h1>
        {intro && <p className={`d-rise max-w-[58ch] text-lg leading-relaxed ${muted} [animation-delay:.12s]`}>{intro}</p>}
        {children}
      </div>
      {aside}
    </section>
  );
}
