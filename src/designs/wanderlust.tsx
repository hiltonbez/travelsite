// Wanderlust: bold and young, for adventure and group-trip agencies. Rotating headline words and a bento grid of
// video, photos and a two-field quick quote.
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useEnquiry } from "@/lib/enquiry";
import { useReveal } from "@/hooks/use-reveal";
import { BRAND, BotTrap, FormStatus, HeroVideo, contact, media, tel } from "@/designs/shared";

export const WANDERLUST_FONTS = "family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600";

const grotesk = "font-['Space_Grotesk',sans-serif]";
const lime = "#C8F55A";

const VIBES: Record<string, string> = {
  Wild: "Sleep under the stars in the Okavango",
  Beach: "Barefoot weeks on Indian Ocean islands",
  City: "Rooftops, markets and night trains",
  Active: "Hike, paddle and summit with a small crew",
  Chill: "Slow mornings, sunsets, nothing to plan",
};

const TICKER = ["Kilimanjaro", "Okavango", "Vietnam by rail", "Patagonia", "Namibia road trip", "Bali surf camp"];

const TRIPS = [
  { title: "Botswana mokoro & camping", days: "8 days", tag: "Small group", img: media.safari, alt: "Wildlife in Botswana" },
  { title: "Europe by night train", days: "10 days", tag: "Solo friendly", img: media.cities, alt: "A European city" },
  { title: "Zanzibar reef & spice", days: "7 days", tag: "Dive & snorkel", img: media.islands, alt: "A tropical island beach" },
];

const tile = "reveal overflow-hidden rounded-[28px]";
const input = "min-h-[50px] rounded-[14px] border border-[#B8C4BC] bg-white px-3.5 text-[15px] font-medium text-[#0C211B] outline-none focus:border-[#0C211B]";

export function Wanderlust() {
  useReveal();
  const [vibe, setVibe] = useState("Wild");
  const { status, onSubmit, sending } = useEnquiry(() => ({ destination: `Vibe: ${vibe}` }));

  return (
    <div className="min-h-screen bg-[#0C211B] font-['Inter',system-ui,sans-serif] text-[#F1F5EE]">
      <header className="flex items-center justify-between gap-5 px-[4vw] py-5">
        <a href="#top" className={`${grotesk} text-[22px] font-bold tracking-tight lowercase`}>
          {BRAND.short.toLowerCase()}<span style={{ color: lime }}>/</span>travel
        </a>
        <nav className="hidden gap-1.5 rounded-full border border-[#F1F5EE]/12 bg-[#F1F5EE]/6 p-1.5 text-sm font-medium md:flex">
          {[["#trips", "Trips"], ["#trips", "Group tours"], ["#ask", "Quick quote"], [tel, "Call us"]].map(([href, label]) => (
            <a key={label} href={href} className="rounded-full px-4 py-2.5 transition hover:bg-[#F1F5EE]/10">{label}</a>
          ))}
        </nav>
        <a href="#ask" className={`inline-flex min-h-[46px] items-center gap-1.5 rounded-full px-5 ${grotesk} font-bold text-[#0C211B]`} style={{ background: lime }}>
          Get a quote <ArrowUpRight className="h-4 w-4" />
        </a>
      </header>

      <section id="top" className="flex flex-col gap-8 px-[4vw] pt-10 pb-6">
        <h1 className={`${grotesk} text-[56px] leading-[.92] font-bold tracking-[-0.05em] uppercase sm:text-[88px] lg:text-[132px]`}>
          Go{" "}
          {/* Each word is exactly 1em tall, the step the animation scrolls by. */}
          <span className="inline-block h-[1em] overflow-hidden align-bottom leading-none" style={{ color: lime }}>
            <span className="d-words flex flex-col [&>span]:h-[1em]">
              <span>further.</span><span>wilder.</span><span>together.</span><span>solo.</span><span>further.</span>
            </span>
          </span>
          <br />Come back changed.
        </h1>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <p className="max-w-[520px] text-lg leading-relaxed text-[#F1F5EE]/75">
            Adventures for people who'd rather have a story than a souvenir. Pick a vibe, we'll build the trip and send a quote today.
          </p>
          <div role="group" aria-label="Pick your vibe" className="flex flex-wrap gap-2">
            {Object.keys(VIBES).map((v) => (
              <button key={v} type="button" aria-pressed={vibe === v} onClick={() => setVibe(v)}
                className={`min-h-[46px] rounded-full border px-5 ${grotesk} font-bold transition ${vibe === v ? "border-[#C8F55A] bg-[#C8F55A] text-[#0C211B]" : "border-[#F1F5EE]/30 hover:border-[#C8F55A]"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-[4vw] pt-4 pb-20">
        <div className="grid auto-rows-[180px] grid-cols-2 gap-4 lg:auto-rows-[220px] lg:grid-cols-4">
          <div className={`${tile} relative col-span-2 row-span-2`}>
            <HeroVideo className="absolute inset-0" />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgba(12,33,27,.85),rgba(12,33,27,0)_55%)]" />
            <div className="absolute inset-x-7 bottom-7 flex items-end justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold uppercase" style={{ color: lime }}>Your vibe · {vibe}</span>
                <span key={vibe} className={`d-slide ${grotesk} text-2xl leading-tight font-bold md:text-[34px]`}>{VIBES[vibe]}</span>
              </div>
              <a href="#ask" aria-label="Get a quote for this kind of trip" className="flex h-14 w-14 flex-none items-center justify-center rounded-full text-[#0C211B]" style={{ background: lime }}>
                <ArrowUpRight className="h-6 w-6" strokeWidth={2.4} />
              </a>
            </div>
          </div>
          <div className={`${tile} flex flex-col justify-between p-6 text-[#0C211B]`} style={{ background: lime }}>
            <span className={`${grotesk} text-[15px] font-bold`}>GROUP TRIPS</span>
            <span className={`${grotesk} text-2xl leading-none font-bold tracking-[-0.03em] xl:text-4xl`}>Travel with people who get it.</span>
          </div>
          <div className={`${tile} d-zoom relative`}>
            <img src={media.safari} alt="A safari" loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute bottom-4 left-4 rounded-full bg-[#0C211B] px-3.5 py-2 text-[13px] font-semibold">Safari</span>
          </div>
          <div className={`${tile} d-zoom relative`}>
            <img src={media.cities} alt="A city street" loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute bottom-4 left-4 rounded-full bg-[#0C211B] px-3.5 py-2 text-[13px] font-semibold">City hops</span>
          </div>
          <div className={`${tile} relative flex items-center justify-center border border-[#F1F5EE]/10 bg-[#16352C]`}>
            <svg className="d-spin h-[150px] w-[150px]" viewBox="0 0 150 150" aria-hidden="true">
              <defs><path id="wl-circle" d="M75,75 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0" /></defs>
              <text fill={lime} fontFamily="Space Grotesk" fontSize="14" fontWeight="700" letterSpacing="3"><textPath href="#wl-circle">FREE QUOTES • REAL PEOPLE • </textPath></text>
            </svg>
            <span className={`absolute ${grotesk} text-3xl font-bold`}>24h</span>
          </div>
          <form id="ask" onSubmit={onSubmit} className={`${tile} col-span-2 row-span-2 flex scroll-mt-6 flex-col justify-between gap-4 bg-[#F1F5EE] p-6 text-[#0C211B] md:p-7 lg:row-span-1`}>
            <span className={`${grotesk} text-2xl font-bold tracking-tight md:text-[26px]`}>Quick quote. Three fields, done.</span>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end">
              <label className="flex flex-col gap-1 text-xs font-semibold sm:col-span-2 lg:col-span-1">Dream trip
                <input name="message" required placeholder="e.g. Zanzibar in March, 2 of us" className={input} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold">Name<input name="name" required autoComplete="name" className={input} /></label>
              <label className="flex flex-col gap-1 text-xs font-semibold">Email<input type="email" name="email" required autoComplete="email" className={input} /></label>
              <button type="submit" disabled={sending} className={`min-h-[50px] rounded-[14px] bg-[#0C211B] px-6 ${grotesk} font-bold disabled:cursor-wait disabled:opacity-60`} style={{ color: lime }}>
                {sending ? "Sending…" : "Send ↗"}
              </button>
            </div>
            <FormStatus status={status} className="font-semibold" />
            <BotTrap />
          </form>
          <div className={`${tile} d-zoom relative col-span-2`}>
            <img src={media.cruises} alt="A cruise ship" loading="lazy" className="h-full w-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,33,27,.85),rgba(12,33,27,0)_70%)]" />
            <div className="absolute inset-y-7 left-7 flex max-w-[60%] flex-col justify-between">
              <span className="text-[13px] font-semibold" style={{ color: lime }}>LAST-MINUTE</span>
              <span className={`${grotesk} text-2xl leading-tight font-bold md:text-3xl`}>Island-hopping cruises, leaving soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* The tilted banner is wider than the page; the wrapper trims it so phones don't scroll sideways. */}
      <div className="overflow-hidden py-4">
        <div className="-mx-[2vw] -rotate-[1.5deg] overflow-hidden py-5 text-[#0C211B]" style={{ background: lime }}>
          <div className={`d-marquee flex w-max gap-10 whitespace-nowrap ${grotesk} text-[28px] font-bold uppercase`}>
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="flex gap-10">{t}<span aria-hidden="true">✺</span></span>
            ))}
          </div>
        </div>
      </div>

      <section id="trips" className="flex flex-col gap-9 px-[4vw] pt-28 pb-24">
        <h2 className={`reveal ${grotesk} text-5xl leading-none font-bold tracking-[-0.04em] uppercase md:text-[64px]`}>Trips leaving soon</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {TRIPS.map((t) => (
            <a key={t.title} href="#ask" className="d-zoom reveal flex flex-col gap-4 rounded-[28px] bg-[#16352C] p-4 transition hover:-translate-y-1">
              <span className="block overflow-hidden rounded-[18px]"><img src={t.img} alt={t.alt} loading="lazy" className="aspect-[16/10] w-full object-cover" /></span>
              <span className="flex gap-2 text-xs font-semibold">
                <span className="rounded-full bg-[#C8F55A]/15 px-2.5 py-1.5" style={{ color: lime }}>{t.days}</span>
                <span className="rounded-full bg-[#F1F5EE]/8 px-2.5 py-1.5">{t.tag}</span>
              </span>
              <span className={`${grotesk} text-2xl font-bold`}>{t.title}</span>
              <span className="flex justify-between text-[15px] text-[#F1F5EE]/70"><span>Dates on request</span><span style={{ color: lime }}>Ask for a quote →</span></span>
            </a>
          ))}
        </div>
      </section>

      <footer className="flex flex-wrap justify-between gap-4 border-t border-[#F1F5EE]/10 px-[4vw] py-10 text-sm text-[#F1F5EE]/60">
        <span className={`${grotesk} font-bold text-[#F1F5EE] lowercase`}>{BRAND.short.toLowerCase()}<span style={{ color: lime }}>/</span>travel</span>
        <span><a href={tel}>{contact.phoneDisplay}</a> · <a href={`mailto:${contact.email}`}>{contact.email}</a> · <a href={contact.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a> · Powered by TribeTravel</span>
      </footer>
    </div>
  );
}
