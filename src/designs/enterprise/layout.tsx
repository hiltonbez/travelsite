// The frame every Enterprise page shares: the chart grid, the header with its menu, the footer with the newsletter
// sign-up, and the floating concierge and WhatsApp buttons. Pages link to each other with plain links because each
// one is its own prerendered page (scripts/snapshot.mjs).
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { useEnquiry } from "@/lib/enquiry";
import { BRAND, BotTrap, WhatsAppIcon, contact, mailto, tel } from "@/designs/shared";
import { ConciergeLauncher } from "@/designs/enterprise/concierge";
import { Consent } from "@/designs/enterprise/parts";
import { BASE, MENU, btn, display, gutter, input, label, mono, orange, soft } from "@/designs/enterprise/theme";

export function EnterpriseLayout({ current, children }: { current: string; children: ReactNode }) {
  useEffect(() => {
    // The installable app (public/designs/enterprise.webmanifest): the service worker keeps pages for offline use.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/designs/enterprise-sw.js", { scope: BASE }).catch(() => {});
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0B1424] font-['Instrument_Sans',system-ui,sans-serif] text-[#EDE6D8] [color-scheme:dark]">
      {/* The chart grid */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0" style={{
        backgroundImage: "linear-gradient(rgb(237 230 216 / .045) 1px, transparent 1px), linear-gradient(90deg, rgb(237 230 216 / .045) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />
      <Header current={current} />
      <main id="top" className="relative overflow-x-clip">{children}</main>
      <Footer />
      <ConciergeLauncher />
      <a href={contact.whatsapp} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fixed right-6 bottom-6 z-20 hidden h-15 w-15 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_rgba(0,0,0,.45)] md:flex">
        <WhatsAppIcon className="h-7 w-7" />
      </a>
      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2.5 border-t border-[#EDE6D8]/15 bg-[#0B1424] p-3 md:hidden">
        <a href={`${BASE}#quote`} className="flex-1 rounded-xl bg-[#FF6A2E] py-3.5 text-center font-bold text-[#0B1424]">Get a quote</a>
        <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#EDE6D8]/40 py-3.5 font-bold">
          <WhatsAppIcon className="h-5 w-5" /> WhatsApp
        </a>
      </div>
    </div>
  );
}

function Logo() {
  return <a href={BASE} className={`${display} text-lg leading-none`}>{BRAND.short}<span className={orange}>/</span></a>;
}

function Header({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const link = (href: string) => `hover:text-[#FF6A2E] ${href === current ? orange : ""}`;
  // The open menu sits outside the header: the header's backdrop blur would otherwise trap it inside the header.
  return (
    <>
    <header className={`sticky top-0 z-30 flex items-center justify-between gap-6 border-b border-[#EDE6D8]/10 bg-[#0B1424]/85 ${gutter} py-4 backdrop-blur-md`}>
      <Logo />
      <nav aria-label="Main" className={`hidden gap-7 ${label} lg:flex`}>
        {MENU.map(([href, text]) => (
          <a key={href} href={href} aria-current={href === current ? "page" : undefined} className={link(href)}>{text}</a>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <a href={`${BASE}#quote`} className={`${btn} min-h-11 px-5 text-sm`}>Plan my trip</a>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open the menu" aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#EDE6D8]/25 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Menu" className="d-slide fixed inset-0 z-[60] flex flex-col bg-[#0B1424] px-[max(16px,5vw)] py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close the menu" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#EDE6D8]/25">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav aria-label="Main" className="mt-10 flex flex-col">
            {[[BASE, "Home"] as [string, string], ...MENU].map(([href, text], i) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className={`flex items-baseline gap-4 border-b border-[#EDE6D8]/10 py-4 ${display} text-[28px] ${link(href)}`}>
                <span className={`${mono} text-xs ${orange}`}>{String(i).padStart(2, "0")}</span>{text}
              </a>
            ))}
          </nav>
          <p className={`mt-auto ${mono} text-sm ${soft}`}>{contact.phoneDisplay} · {contact.email}</p>
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
    return <p role="status" className="text-lg">You're on the list. Look out for our next trip letter.</p>;
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="What would you like to hear about?">
        {["Islands", "Safari", "Cruises", "Europe", "Last-minute deals"].map((x) => (
          <button key={x} type="button" aria-pressed={interests.includes(x)} onClick={() => toggle(x)}
            className={`min-h-10 rounded-full border px-4 text-sm transition ${interests.includes(x) ? "border-[#FF6A2E] bg-[#FF6A2E] text-[#0B1424]" : "border-[#EDE6D8]/25 hover:border-[#FF6A2E]"}`}>
            {x}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="newsletter-email">Email</label>
        <input id="newsletter-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={`${input} flex-1 rounded-full px-5`} />
        <button type="submit" disabled={sending} className={btn}>{sending ? "Signing up…" : "Send me trip ideas"}</button>
      </div>
      <Consent />
      <BotTrap />
      {status.kind === "error" && <p role="alert" className="text-sm font-semibold text-[#F87171]">{status.message}</p>}
    </form>
  );
}

function Footer() {
  const col = `flex flex-col gap-3 text-sm ${soft}`;
  return (
    <footer className="relative border-t border-[#EDE6D8]/10">
      <div className={`grid gap-12 ${gutter} py-16 lg:grid-cols-[1.3fr_1fr]`}>
        <div className="flex max-w-[560px] flex-col gap-4">
          <span className={`${label} ${orange}`}>The trip letter</span>
          <h2 className={`${display} text-3xl leading-none md:text-4xl`}>Ideas, deals and travel news, once a month.</h2>
          <Newsletter />
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div className={col}>
            <b className={`${label} text-[#EDE6D8]`}>Explore</b>
            {MENU.slice(0, 4).map(([href, text]) => <a key={href} href={href} className="hover:text-[#FF6A2E]">{text}</a>)}
          </div>
          <div className={col}>
            <b className={`${label} text-[#EDE6D8]`}>Agency</b>
            <a href={`${BASE}/about`} className="hover:text-[#FF6A2E]">About us</a>
            <a href={`${BASE}/contact`} className="hover:text-[#FF6A2E]">Contact</a>
            <a href={`${BASE}#agency`} className="hover:text-[#FF6A2E]">What your agency sees</a>
            <a href={`${BASE}/privacy`} className="hover:text-[#FF6A2E]">Privacy (POPIA)</a>
          </div>
          <div className={col}>
            <b className={`${label} text-[#EDE6D8]`}>Talk to us</b>
            <a href={tel} className="hover:text-[#FF6A2E]">{contact.phoneDisplay}</a>
            <a href={mailto} className="break-all hover:text-[#FF6A2E]">{contact.email}</a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="hover:text-[#FF6A2E]">WhatsApp</a>
          </div>
        </div>
      </div>
      <div className={`flex flex-wrap justify-between gap-4 border-t border-[#EDE6D8]/10 ${gutter} py-6 pb-28 text-[13px] ${soft} md:pb-6`}>
        <span className={`${display} text-sm text-[#EDE6D8]`}>{BRAND.short}<span className={orange}>/</span></span>
        <span className={label}>{BRAND.name} · {BRAND.tagline} · A TribeTravel website</span>
      </div>
    </footer>
  );
}

/** An inner page's opening: where you are, the title, a line of intro and a short stretch of route. */
export function PageTitle({ crumb, title, intro, children }: { crumb: ReactNode; title: ReactNode; intro?: string; children?: ReactNode }) {
  return (
    <section className={`relative flex flex-col gap-6 ${gutter} pt-14 pb-12 md:pt-20`}>
      <p className={`${label} ${soft}`}><a href={BASE} className="hover:text-[#FF6A2E]">Home</a> <span className={orange}>→</span> {crumb}</p>
      <h1 className={`d-rise ${display} max-w-[16ch] text-[clamp(38px,6.4vw,96px)] leading-[0.92]`}>{title}</h1>
      {intro && <p className={`d-rise max-w-[60ch] text-lg leading-relaxed ${soft} [animation-delay:.12s]`}>{intro}</p>}
      {children}
      <svg aria-hidden="true" viewBox="0 0 600 40" className="mt-4 h-8 w-full max-w-[600px]" preserveAspectRatio="none">
        <path d="M0 30 C 150 30, 200 8, 330 8 S 520 26, 600 20" fill="none" stroke="#B9B3A6" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="2 8" />
        <path className="d-route-draw" d="M0 30 C 150 30, 200 8, 330 8 S 520 26, 600 20" fill="none" stroke="#FF6A2E" strokeWidth="2" pathLength={1} />
      </svg>
    </section>
  );
}
