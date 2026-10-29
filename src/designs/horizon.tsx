// Horizon: cinematic luxury. A full-screen video, an elegant serif headline and a glass "where, when, who" quote bar.
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useEnquiry } from "@/lib/enquiry";
import { useReveal } from "@/hooks/use-reveal";
import { BRAND, BotTrap, FormStatus, HeroVideo, WhatsAppIcon, contact, media, monthWords, tel } from "@/designs/shared";

export const HORIZON_FONTS = "family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;500;600;700";

const serif = "font-['Cormorant_Garamond',serif]";
const gold = "text-[#E8C79A]";

const PLACES = ["Mauritius", "Kruger", "Zanzibar", "Santorini", "Bali", "Victoria Falls", "Maldives", "Cape Town"];

const CARDS = [
  { tag: "Islands", name: "Mauritius & the Indian Ocean", img: media.islands },
  { tag: "Safari", name: "Kruger & the Okavango", img: media.safari },
  { tag: "Cruises", name: "The Mediterranean at sea", img: media.cruises },
  { tag: "Cities", name: "Europe's great cities", img: media.cities },
];

const STEPS = [
  ["Tell us your dream", "A minute on our quote form, a WhatsApp message or a call. Rough ideas are welcome."],
  ["Get a tailored quote", "We design an itinerary with real prices and send it to you within 24 hours."],
  ["Pack. We've got the rest", "Flights, transfers and stays, plus a real person to call if anything changes on the road."],
];

const field = "flex flex-col gap-1.5 px-6 py-4";
const fieldLabel = `text-[11px] uppercase tracking-[0.24em] ${gold}`;
const fieldInput = "min-h-7 border-0 bg-transparent p-0 text-[17px] font-semibold text-[#F4F1EC] outline-none [color-scheme:dark] placeholder:text-[#F4F1EC]/45";

export function Horizon() {
  useReveal();
  const [tab, setTab] = useState("All");
  const [more, setMore] = useState(false);
  const { status, onSubmit, sending } = useEnquiry((fd) => ({ travel_dates: monthWords(String(fd.get("travel_dates") ?? "")) }));

  return (
    <div className="relative min-h-screen bg-[#0B0D10] font-['Manrope',system-ui,sans-serif] text-[#F4F1EC]">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-6 px-[5vw] py-7">
        <a href="#top" className="flex flex-col leading-none">
          <span className={`${serif} text-3xl font-semibold tracking-[0.04em]`}>{BRAND.short}</span>
          <span className={`mt-1 text-[10px] tracking-[0.42em] ${gold}`}>{BRAND.tagline.toUpperCase()}</span>
        </a>
        <nav className="hidden gap-9 text-[13px] uppercase tracking-[0.18em] lg:flex">
          <a href="#destinations" className="hover:text-[#E8C79A]">Destinations</a>
          <a href="#how" className="hover:text-[#E8C79A]">How it works</a>
          <a href="#why" className="hover:text-[#E8C79A]">Why us</a>
          <a href="#contact" className="hover:text-[#E8C79A]">Contact</a>
        </nav>
        <a href="#quote" className="inline-flex min-h-11 items-center rounded-full bg-[#E8C79A] px-6 text-[13px] font-bold uppercase tracking-[0.14em] text-[#0B0D10] transition hover:-translate-y-0.5">
          Plan my trip
        </a>
      </header>

      <section id="top" className="relative flex min-h-screen items-end overflow-hidden pt-36">
        <HeroVideo className="absolute inset-0" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,13,16,.55)_0%,rgba(11,13,16,0)_30%,rgba(11,13,16,.15)_55%,rgba(11,13,16,.94)_100%)]" />
        <div className="relative flex w-full flex-col gap-6 px-[5vw] pb-16">
          <p className={`d-rise text-[13px] uppercase tracking-[0.4em] ${gold}`}>Tailor-made holidays</p>
          <h1 className={`d-rise ${serif} max-w-[1100px] text-[56px] font-medium leading-[0.95] [animation-delay:.15s] md:text-[104px]`}>
            Somewhere extraordinary <em className={gold}>is waiting.</em>
          </h1>
          <p className="d-rise max-w-[560px] text-lg leading-relaxed text-[#F4F1EC]/85 [animation-delay:.35s]">
            Tell us where you dream of going. We'll design it, price it and send your quote within 24 hours.
          </p>

          <form id="quote" onSubmit={onSubmit} className="d-rise mt-2 max-w-[1080px] scroll-mt-6 overflow-hidden rounded-[22px] border border-[#F4F1EC]/20 bg-[#14161A]/55 backdrop-blur-xl [animation-delay:.6s]">
            <div className="grid md:grid-cols-[1.3fr_1fr_1fr_auto]">
              <label className={`${field} border-b border-[#F4F1EC]/15 md:border-r md:border-b-0`}>
                <span className={fieldLabel}>Where to</span>
                <select name="destination" className={`${fieldInput} [&>option]:text-black`}>
                  <option>Mauritius &amp; islands</option>
                  <option>An African safari</option>
                  <option>A cruise</option>
                  <option>Europe &amp; cities</option>
                  <option>Not sure yet, surprise me</option>
                </select>
              </label>
              <label className={`${field} border-b border-[#F4F1EC]/15 md:border-r md:border-b-0`}>
                <span className={fieldLabel}>When</span>
                <input type="month" name="travel_dates" className={fieldInput} />
              </label>
              <label className={`${field} border-b border-[#F4F1EC]/15 md:border-b-0`}>
                <span className={fieldLabel}>Travellers</span>
                <select name="travellers" className={`${fieldInput} [&>option]:text-black`}>
                  <option>2 adults</option>
                  <option>A family</option>
                  <option>Just me</option>
                  <option>A group (6+)</option>
                </select>
              </label>
              {!more && (
                <button type="button" onClick={() => setMore(true)} className="min-h-[76px] bg-[#E8C79A] px-9 text-sm font-bold uppercase tracking-[0.16em] text-[#0B0D10] transition hover:brightness-105">
                  Get my quote
                </button>
              )}
            </div>
            {more && (
              <div className="d-slide grid border-t border-[#F4F1EC]/15 md:grid-cols-[1.3fr_1fr_1fr_auto]">
                <label className={`${field} border-b border-[#F4F1EC]/15 md:border-r md:border-b-0`}>
                  <span className={fieldLabel}>Your name</span>
                  <input name="name" required autoComplete="name" autoFocus className={fieldInput} />
                </label>
                <label className={`${field} border-b border-[#F4F1EC]/15 md:border-r md:border-b-0`}>
                  <span className={fieldLabel}>Email</span>
                  <input type="email" name="email" required autoComplete="email" className={fieldInput} />
                </label>
                <label className={`${field} border-b border-[#F4F1EC]/15 md:border-b-0`}>
                  <span className={fieldLabel}>Phone (optional)</span>
                  <input type="tel" name="phone" autoComplete="tel" className={fieldInput} />
                </label>
                <button type="submit" disabled={sending} className="min-h-[76px] bg-[#E8C79A] px-9 text-sm font-bold uppercase tracking-[0.16em] text-[#0B0D10] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60">
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>
            )}
            <BotTrap />
          </form>
          <FormStatus status={status} className={gold} />
          {!status.message && <p className="text-[13px] text-[#F4F1EC]/70">Free, no obligation. A real person replies, not a bot.</p>}
        </div>
      </section>

      <div className="overflow-hidden border-y border-[#F4F1EC]/10 py-6">
        <div className={`d-marquee flex w-max gap-16 whitespace-nowrap ${serif} text-[40px] italic text-[#F4F1EC]/55`}>
          {[...PLACES, ...PLACES].map((p, i) => (
            <span key={i} className="flex gap-16">{p}<span aria-hidden="true" className={gold}>✦</span></span>
          ))}
        </div>
      </div>

      <section id="destinations" className="flex flex-col gap-12 px-[5vw] pt-28 pb-24">
        <div className="reveal flex flex-wrap items-end justify-between gap-8">
          <div className="flex max-w-[640px] flex-col gap-4">
            <span className={`text-xs uppercase tracking-[0.4em] ${gold}`}>Where we'll take you</span>
            <h2 className={`${serif} text-5xl leading-none font-medium md:text-[64px]`}>Four ways to fall in love with the world</h2>
          </div>
          <div role="tablist" aria-label="Travel style" className="flex flex-wrap gap-2">
            {["All", ...CARDS.map((c) => c.tag)].map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`min-h-11 rounded-full border px-5 text-sm font-semibold transition ${tab === t ? "border-[#E8C79A] bg-[#E8C79A] text-[#0B0D10]" : "border-[#F4F1EC]/30 hover:border-[#E8C79A]"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {CARDS.map((c) => {
            const dim = tab !== "All" && c.tag !== tab;
            return (
              <a key={c.tag} href="#quote" className={`d-zoom reveal relative flex aspect-[3/4] items-end overflow-hidden rounded-3xl transition duration-500 ${dim ? "opacity-25 grayscale" : ""}`}>
                <img src={c.img} alt={c.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,.8))]" />
                <span className="relative flex flex-col gap-2 p-5 md:p-7">
                  <span className={`text-[11px] uppercase tracking-[0.3em] ${gold}`}>{c.tag}</span>
                  <span className={`${serif} text-2xl leading-none md:text-4xl`}>{c.name}</span>
                  <span className="text-sm text-[#F4F1EC]/80">Ask for a quote →</span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section id="how" className="flex flex-col gap-16 bg-[#F4F1EC] px-[5vw] py-24 text-[#14161A]">
        <div className="reveal flex max-w-[720px] flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.4em] text-[#8A6A3C]">How it works</span>
          <h2 className={`${serif} text-5xl leading-none font-medium md:text-[64px]`}>From daydream to boarding pass in three easy steps</h2>
        </div>
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          {STEPS.map(([title, text], i) => (
            <div key={title} className="reveal flex flex-col gap-4 border-t border-[#14161A] pt-7">
              <span className={`${serif} text-7xl leading-none text-[#8A6A3C]`}>0{i + 1}</span>
              <h3 className="text-[22px] font-semibold">{title}</h3>
              <p className="leading-relaxed text-[#4A4D55]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="why" className="grid items-center gap-12 px-[5vw] py-28 md:grid-cols-2 md:gap-16">
        <div className="reveal relative aspect-[4/5] overflow-hidden rounded-[28px]">
          <img src={media.safari} alt="A safari vehicle at golden hour" loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute bottom-6 left-6 rounded-full bg-[#0B0D10]/60 px-4 py-3 text-[13px] backdrop-blur">Big Five, slow and private</span>
        </div>
        <div className="reveal flex flex-col gap-7">
          <span className={`text-xs uppercase tracking-[0.4em] ${gold}`}>Why travel with us</span>
          <h2 className={`${serif} text-5xl leading-[1.02] font-medium md:text-6xl`}>
            We've been there, so your trip feels <em className={gold}>effortless.</em>
          </h2>
          <p className="text-lg leading-relaxed text-[#F4F1EC]/78">
            Every itinerary is planned by a travel expert who knows the lodges, the islands and the shortcuts. You get one
            point of contact from your first message to your flight home.
          </p>
          <ul className="flex flex-col gap-3 text-[15px] text-[#F4F1EC]/85">
            {["Free, tailor-made quotes", "Flights, stays and transfers in one booking", "Help before, during and after your trip"].map((x) => (
              <li key={x} className="flex items-center gap-3"><span aria-hidden="true" className={gold}>✦</span>{x}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" className="relative flex flex-col items-center gap-7 overflow-hidden px-[5vw] py-36 text-center">
        <img src={media.cruises} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,13,16,.3),rgba(11,13,16,.95)_75%)]" />
        <h2 className={`reveal relative max-w-[900px] ${serif} text-5xl leading-none font-medium md:text-[80px]`}>Your next story starts with one message.</h2>
        <div className="relative flex flex-wrap justify-center gap-4">
          <a href="#quote" className="inline-flex min-h-14 items-center gap-2 rounded-full bg-[#E8C79A] px-8 text-sm font-bold uppercase tracking-[0.12em] text-[#0B0D10] transition hover:-translate-y-0.5">
            Get a free quote <ArrowUpRight className="h-4 w-4" />
          </a>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center gap-2 rounded-full border border-[#F4F1EC]/50 px-8 text-sm font-bold uppercase tracking-[0.12em] transition hover:-translate-y-0.5">
            <WhatsAppIcon className="h-5 w-5" /> WhatsApp us
          </a>
        </div>
        <p className="relative text-sm text-[#F4F1EC]/70">
          <a href={tel} className="hover:text-[#E8C79A]">{contact.phoneDisplay}</a> · <a href={`mailto:${contact.email}`} className="hover:text-[#E8C79A]">{contact.email}</a>
        </p>
      </section>

      <footer className="flex flex-wrap justify-between gap-4 border-t border-[#F4F1EC]/10 px-[5vw] py-10 pb-28 text-[13px] text-[#F4F1EC]/55 md:pb-10">
        <span>© {new Date().getFullYear()} {BRAND.name}</span>
        <span>Powered by TribeTravel</span>
      </footer>

      <a href={contact.whatsapp} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="d-pulse fixed right-6 bottom-6 z-20 hidden h-15 w-15 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_rgba(0,0,0,.4)] md:flex">
        <WhatsAppIcon className="h-7 w-7" />
      </a>
      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2.5 border-t border-[#F4F1EC]/15 bg-[#0B0D10] p-3 md:hidden">
        <a href="#quote" className="flex-1 rounded-xl bg-[#E8C79A] py-3.5 text-center font-bold text-[#0B0D10]">Get a quote</a>
        <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#F4F1EC]/40 py-3.5 font-bold">
          <WhatsAppIcon className="h-5 w-5" /> WhatsApp
        </a>
      </div>
    </div>
  );
}
