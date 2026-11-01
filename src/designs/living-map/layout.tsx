// The frame every Living Map page shares: the paper and its look, the ink trail, the header with its menu and ink-pot
// look switcher, the footer with the newsletter sign-up, and the floating chat and WhatsApp buttons. Pages link to
// each other with plain links because each one is its own prerendered page (scripts/snapshot.mjs).
import { useState, type ReactNode } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEnquiry } from "@/lib/enquiry";
import { BRAND, BotTrap, WhatsAppIcon, contact, mailto, tel } from "@/designs/shared";
import { ChatLauncher } from "@/designs/living-map/chat";
import { LookContext, LookSwitcher, useLookState } from "@/designs/living-map/looks";
import { Compass, LivingMap } from "@/designs/living-map/map";
import { Consent } from "@/designs/living-map/parts";
import { InkTrail } from "@/designs/living-map/trail";
import type { View } from "@/designs/living-map/geo";
import { BASE, MENU, accent, btn, caps, display, gutter, hand, input, soft } from "@/designs/living-map/theme";

export function LivingMapLayout({ current, children }: { current: string; children: ReactNode }) {
  const looks = useLookState();
  return (
    <LookContext.Provider value={looks}>
      <div className={`lm-root lm-paper lm-look-${looks.look} relative min-h-screen font-['Literata',Georgia,serif]`}>
        {/* The hand-drawn wobble the map's coastlines are drawn through */}
        <svg aria-hidden="true" className="absolute h-0 w-0">
          <filter id="lm-rough"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" /><feDisplacementMap in="SourceGraphic" scale="3.5" /></filter>
        </svg>
        <a href="#main" className="sr-only z-50 rounded-full bg-(--lm-accent) px-5 py-3 text-(--lm-on-accent) focus:not-sr-only focus:fixed focus:top-3 focus:left-3">Skip to the page</a>
        <Header current={current} />
        <main id="main" className="relative z-10 overflow-x-clip">
          <InkTrail />
          {children}
        </main>
        <Footer />
        <ChatLauncher />
        <a href={contact.whatsapp} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
          className="fixed bottom-24 left-6 z-30 hidden h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-[#0B2A1A] shadow-[0_12px_30px_-8px_rgba(0,0,0,.45)] md:bottom-6 md:flex">
          <WhatsAppIcon className="h-7 w-7" />
        </a>
        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t border-(--lm-line) bg-(--lm-paper) p-3 md:hidden">
          <a href={`${BASE}#plan`} className={`${btn} flex-1`}>Plan my trip</a>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border-[1.5px] border-(--lm-ink)/50 font-semibold">
            <WhatsAppIcon className="h-5 w-5" /> WhatsApp
          </a>
        </div>
      </div>
    </LookContext.Provider>
  );
}

function Logo() {
  return (
    <a href={BASE} className="flex min-h-11 items-center gap-2 whitespace-nowrap" aria-label={`${BRAND.name}, home`}>
      <Compass className="h-9 w-9 flex-none" />
      <span className="flex flex-col leading-none">
        <span className={`${display} text-xl`}>{BRAND.name}</span>
        <span className={`${hand} text-base ${accent}`}>{BRAND.tagline}</span>
      </span>
    </a>
  );
}

function Header({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const link = (href: string) => `underline-offset-[6px] decoration-(--lm-accent) decoration-2 hover:underline ${href === current ? "underline" : ""}`;
  return (
    <>
      <header className={`sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-(--lm-line) bg-(--lm-paper)/92 ${gutter} py-2.5 backdrop-blur-sm`}>
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-6 text-[15px] lg:flex">
          {MENU.map(([href, text]) => (
            <a key={href} href={href} aria-current={href === current ? "page" : undefined} className={link(href)}>{text}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LookSwitcher />
          <a href={`${BASE}/book`} className={`${btn} min-h-11 px-5 text-sm whitespace-nowrap max-sm:hidden`}>Book a seat</a>
          <button type="button" onClick={() => setOpen(true)} aria-label="Open the menu" aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-(--lm-line) lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Menu" className="lm-rise fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-(--lm-paper) px-[max(16px,5vw)] py-3">
          <div className="flex items-center justify-between">
            <Logo />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close the menu" className="flex h-11 w-11 items-center justify-center rounded-full border border-(--lm-line)">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav aria-label="Main" className="mt-8 flex flex-col">
            {[[BASE, "Home"] as [string, string], ...MENU, [`${BASE}/book`, "Book a seat"] as [string, string]].map(([href, text], i) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className={`flex min-h-14 items-baseline gap-4 border-b border-dashed border-(--lm-line) py-3 ${display} text-[30px] ${link(href)}`}>
                <span className={`${hand} text-xl ${accent}`}>{["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"][i]}.</span>{text}
              </a>
            ))}
          </nav>
          <p className={`mt-auto pt-8 text-sm ${soft}`}>{contact.phoneDisplay} · {contact.email}</p>
        </div>
      )}
    </>
  );
}

/** Newsletter sign-up into TribeTravel. It arrives as an enquiry marked as a sign-up, with the reader's interests, so
 *  the agency can add them to its list. */
export function Newsletter() {
  const [interests, setInterests] = useState<string[]>([]);
  const { status, onSubmit, sending } = useEnquiry(() => ({
    name: "Newsletter sign-up",
    message: `Newsletter sign-up. Interests: ${interests.join(", ") || "anything"}.`,
  }));
  const toggle = (x: string) => setInterests((v) => (v.includes(x) ? v.filter((y) => y !== x) : [...v, x]));

  if (status.kind === "sent") {
    return <p role="status" className={`${hand} text-3xl ${accent}`}>You're on the list. Look out for our next letter.</p>;
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="What would you like to hear about?">
        {["Group departures", "Islands", "Safari", "Europe", "Last-minute deals"].map((x) => (
          <button key={x} type="button" aria-pressed={interests.includes(x)} onClick={() => toggle(x)}
            className={`min-h-11 rounded-full border px-4 text-sm transition ${interests.includes(x) ? "border-(--lm-accent) bg-(--lm-accent) text-(--lm-on-accent)" : "border-(--lm-line) hover:border-(--lm-accent)"}`}>
            {x}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="lm-newsletter-email">Email</label>
        <input id="lm-newsletter-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={`${input} flex-1 rounded-full px-5`} />
        <button type="submit" disabled={sending} className={btn}>{sending ? "Signing up…" : "Send me the letter"}</button>
      </div>
      <Consent />
      <BotTrap />
      {status.kind === "error" && <p role="alert" className="text-sm font-semibold">{status.message}</p>}
    </form>
  );
}

function Footer() {
  const col = `flex flex-col gap-1 text-[15px] ${soft}`;
  const a = "flex min-h-11 items-center hover:text-(--lm-accent)";
  return (
    <footer className="relative z-10 border-t border-(--lm-line) bg-(--lm-card)/60">
      <div className={`grid gap-12 ${gutter} py-16 lg:grid-cols-[1.3fr_1fr]`}>
        <div className="flex max-w-[560px] flex-col gap-4">
          <span className={`${caps} ${accent}`}>The trip letter</span>
          <h2 className={`${display} text-4xl leading-tight`}>New departures and deals, once a month.</h2>
          <Newsletter />
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div className={col}>
            <b className={`${caps} text-(--lm-ink)`}>Explore</b>
            {MENU.slice(0, 4).map(([href, text]) => <a key={href} href={href} className={a}>{text}</a>)}
          </div>
          <div className={col}>
            <b className={`${caps} text-(--lm-ink)`}>Agency</b>
            <a href={`${BASE}/about`} className={a}>About us</a>
            <a href={`${BASE}/contact`} className={a}>Contact</a>
            <a href={`${BASE}#agency`} className={a}>What your agency sees</a>
            <a href={`${BASE}/privacy`} className={a}>Privacy (POPIA)</a>
          </div>
          <div className={col}>
            <b className={`${caps} text-(--lm-ink)`}>Talk to us</b>
            <a href={tel} className={a}>{contact.phoneDisplay}</a>
            <a href={mailto} className={`${a} break-all`}>{contact.email}</a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className={a}>WhatsApp</a>
          </div>
        </div>
      </div>
      <div className={`flex flex-wrap items-center justify-between gap-4 border-t border-(--lm-line) ${gutter} py-6 pb-28 text-[13px] ${soft} md:pb-6`}>
        <span className={`${display} text-base text-(--lm-ink)`}>{BRAND.name}</span>
        <span>{BRAND.tagline} · A TribeTravel website · Map drawn for this site</span>
      </div>
    </footer>
  );
}

/** An inner page's opening: where you are, the title and intro, and the page's own region of the map. */
export function PageTitle({ crumb, title, intro, view = "world", viewBox, focus, routes, mapLabel, children }: {
  crumb: ReactNode; title: ReactNode; intro?: string; view?: View; viewBox?: string; focus?: string; routes?: string[];
  mapLabel: string; children?: ReactNode;
}) {
  return (
    <section data-pin className={`relative z-10 grid items-center gap-10 ${gutter} pt-10 pb-14 md:pt-16 lg:grid-cols-[1.05fr_.95fr]`}>
      <div className="flex min-w-0 flex-col gap-5">
        <p className={`${caps} ${soft}`}><a href={BASE} className="hover:text-(--lm-accent)">Home</a> <span className={accent}>›</span> {crumb}</p>
        <h1 className={`lm-rise ${display} text-[clamp(40px,6.5vw,92px)] leading-[0.98]`}>{title}</h1>
        {intro && <p className={`lm-rise max-w-[58ch] text-lg leading-relaxed ${soft} [animation-delay:.12s]`}>{intro}</p>}
        {children}
      </div>
      <div className="relative">
        <div className={`relative aspect-[4/3] overflow-hidden rounded-[4px] border border-(--lm-line) shadow-[0_30px_60px_-40px_var(--lm-shadow)] [clip-path:polygon(0_1%,6%_0,22%_1.4%,41%_0,63%_1%,82%_0,100%_1.2%,99.4%_30%,100%_62%,99.2%_100%,70%_99%,46%_100%,20%_99.2%,0_100%,.6%_60%)]`}>
          <LivingMap view={view} {...(viewBox ? { viewBox } : {})} {...(focus ? { focus } : {})} {...(routes ? { routes } : {})} label={mapLabel} />
        </div>
        <Compass className="absolute -bottom-6 -left-4 h-20 w-20 md:h-24 md:w-24" />
      </div>
    </section>
  );
}

/** A big "go on, do it" line: the call to action at the foot of a page. */
export function NextStop({ title, line, href, cta }: { title: ReactNode; line: string; href: string; cta: string }) {
  return (
    <section data-pin className={`relative z-10 flex flex-col items-center gap-6 ${gutter} py-24 text-center`}>
      <h2 className={`${display} max-w-[18ch] text-[clamp(34px,5vw,64px)] leading-[1.02]`}>{title}</h2>
      <p className={`max-w-[48ch] text-lg ${soft}`}>{line}</p>
      <a href={href} className={`${btn} min-h-14 px-8`}>{cta} <ArrowRight className="h-4 w-4" /></a>
    </section>
  );
}
