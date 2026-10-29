// Itinerary Story: for destination specialists. A sample week in Mauritius told day by day, beside a "price this
// trip" card that turns the visitor's choices into a quote request.
import { useState } from "react";
import { useEnquiry } from "@/lib/enquiry";
import { useReveal } from "@/hooks/use-reveal";
import { BRAND, BotTrap, FormStatus, HeroVideo, WhatsAppIcon, contact, media, tel } from "@/designs/shared";

export const ITINERARY_FONTS = "family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Instrument+Serif:ital@0;1";

const serif = "font-['Instrument_Serif',serif] font-normal";
const teal = "#3FD0C9";

const DAYS = [
  { when: "Day 1", short: "Arrive & unwind", tag: "North coast", img: media.islands, title: "Barefoot from the moment you land", text: "A private driver meets you at the airport. By sunset you have a cocktail in hand and nowhere to be." },
  { when: "Day 2", short: "Catamaran day", tag: "Île aux Cerfs", img: media.cruises, title: "Sail to Île aux Cerfs", text: "A full day on the water: snorkelling stops, a beach barbecue and the waterfall at Grand River South East." },
  { when: "Day 3", short: "Southwest wilds", tag: "Chamarel", img: media.safari, title: "Seven-coloured earth and a rum tasting", text: "Drive the Black River Gorges, see Chamarel's coloured dunes and finish at a historic rum distillery." },
  { when: "Days 4–5", short: "Slow days", tag: "Your resort", img: media.islands, title: "Nothing planned, on purpose", text: "Spa, pool, kayaks and long lunches. We can add a dolphin swim or a round of golf if you get restless." },
  { when: "Days 6–7", short: "Port Louis & home", tag: "The capital", img: media.cities, title: "Markets, street food and a farewell dinner", text: "A morning in the Central Market, a last sunset dinner on the beach and a late checkout before your flight." },
];

const TIERS = [
  { label: "Comfort", hotel: "4-star beachfront hotel", board: "Breakfast & dinner" },
  { label: "Premium", hotel: "5-star resort, sea-view room", board: "All-inclusive" },
  { label: "Luxury", hotel: "Private pool villa", board: "All-inclusive + spa credit" },
];

const EXTRAS = ["Spa day", "Dolphin swim", "Golf", "Private guide"];

const MORE = [
  { name: "Seychelles", img: media.islands },
  { name: "Maldives", img: media.cruises },
  { name: "Bush & beach combo", img: media.safari },
  { name: "Zanzibar", img: media.cities },
];

const input = "min-h-12 rounded-xl border border-[#062A3A]/25 bg-white px-3.5 text-[15px] font-medium text-[#062A3A] outline-none focus:border-[#062A3A]";

export function Itinerary() {
  useReveal();
  const [day, setDay] = useState(0);
  const [tier, setTier] = useState(1);
  const [extras, setExtras] = useState<string[]>([]);
  const t = TIERS[tier]!;
  const d = DAYS[day]!;
  const { status, onSubmit, sending } = useEnquiry(() => ({
    destination: "Mauritius, 7 nights (the sample itinerary)",
    message: [`Stay: ${t.label} (${t.hotel}, ${t.board})`, extras.length ? `Add: ${extras.join(", ")}` : ""].filter(Boolean).join("\n"),
  }));
  const toggle = (x: string) => setExtras((xs) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]));

  return (
    <div className="min-h-screen bg-[#062A3A] font-['Bricolage_Grotesque',system-ui,sans-serif] text-[#F2E3C6]">
      <section className="relative flex min-h-[92vh] flex-col overflow-hidden">
        <HeroVideo className="absolute inset-0" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,42,58,.5),rgba(6,42,58,.1)_40%,#062A3A_100%)]" />
        <header className="relative flex items-center justify-between gap-4 px-[5vw] py-6">
          <a href="#top" className="text-xl font-extrabold">{BRAND.name.split(" ")[0]} <span className={`${serif} italic`} style={{ color: teal }}>Islands</span></a>
          <a href="#price" className="inline-flex min-h-11 items-center rounded-full px-5 font-extrabold text-[#062A3A]" style={{ background: teal }}>Price this trip</a>
        </header>
        <div id="top" className="relative mt-auto flex flex-col gap-5 px-[5vw] pb-16">
          <span className="d-rise text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: teal }}>The Mauritius specialists</span>
          <h1 className="d-rise text-[64px] leading-[.9] font-extrabold tracking-[-0.05em] [animation-delay:.15s] md:text-[136px]">
            Seven days.<br /><span className={`${serif} italic tracking-[-0.02em]`}>One perfect island.</span>
          </h1>
          <p className="d-rise max-w-[560px] text-lg leading-relaxed text-[#F2E3C6]/85 [animation-delay:.3s] md:text-xl">
            Follow the trip day by day, choose your style of stay, then get your price in one tap.
          </p>
        </div>
        <svg className="d-sway relative block h-10 w-[110%]" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 30 Q 180 0 360 30 T 720 30 T 1080 30 T 1440 30 V60 H0Z" fill="#062A3A" />
        </svg>
      </section>

      <section className="px-[5vw] pt-16 pb-28">
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col gap-9">
            <div className="reveal flex flex-col gap-2.5">
              <span className="text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: teal }}>Sample itinerary</span>
              <h2 className="text-5xl leading-none font-extrabold tracking-[-0.04em] md:text-[56px]">Your week, <span className={`${serif} italic`}>day by day</span></h2>
            </div>
            <div className="grid gap-7 xl:grid-cols-[240px_minmax(0,1fr)]">
              <div role="tablist" aria-label="Days" className="relative flex gap-2 overflow-x-auto pb-2 xl:flex-col xl:overflow-visible xl:pb-0">
                <svg className="absolute top-0 left-[25px] hidden h-full w-1 xl:block" aria-hidden="true">
                  <line className="d-dash" x1="2" y1="0" x2="2" y2="1000" stroke={teal} strokeWidth="2" strokeDasharray="6 14" />
                </svg>
                {DAYS.map((x, i) => {
                  const on = i === day;
                  return (
                    <button key={x.when} type="button" role="tab" aria-selected={on} onClick={() => setDay(i)}
                      className={`relative flex min-h-16 shrink-0 items-center gap-3.5 rounded-[18px] border py-2.5 pr-3.5 pl-1.5 text-left transition ${on ? "border-[#3FD0C9]/60 bg-[#3FD0C9]/14" : "border-transparent hover:bg-[#F2E3C6]/5"}`}>
                      <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-full font-extrabold ${on ? "bg-[#3FD0C9] text-[#062A3A]" : "border border-[#F2E3C6]/25 bg-[#0B3B4F]"}`}>{i + 1}</span>
                      <span className="flex flex-col"><span className="text-xs uppercase tracking-[0.2em] opacity-70">{x.when}</span><span className="font-semibold">{x.short}</span></span>
                    </button>
                  );
                })}
              </div>
              <article key={day} role="tabpanel" className="d-slide flex flex-col gap-5">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[28px]">
                  <img src={d.img} alt={d.short} className="h-full w-full object-cover" />
                  <span className="absolute top-4 left-4 rounded-full bg-[#062A3A]/70 px-3.5 py-2 text-[13px] font-semibold backdrop-blur">{d.when} · {d.tag}</span>
                </div>
                <h3 className={`${serif} text-4xl leading-[1.05] md:text-[44px]`}>{d.title}</h3>
                <p className="text-lg leading-relaxed text-[#F2E3C6]/80">{d.text}</p>
              </article>
            </div>
          </div>

          <form id="price" onSubmit={onSubmit} className="flex scroll-mt-6 flex-col gap-5 rounded-[30px] bg-[#F2E3C6] p-7 text-[#062A3A] shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)] lg:sticky lg:top-6">
            <span className="text-[13px] font-semibold uppercase tracking-[0.25em] text-[#0B6E6A]">Price this trip</span>
            <h2 className="text-3xl leading-tight font-extrabold tracking-[-0.03em]">Mauritius, 7 nights</h2>
            <div role="group" aria-label="Stay style" className="grid grid-cols-3 gap-1.5 rounded-2xl bg-[#062A3A]/8 p-1.5">
              {TIERS.map((x, i) => (
                <button key={x.label} type="button" aria-pressed={i === tier} onClick={() => setTier(i)}
                  className={`min-h-11 rounded-xl text-sm font-bold transition ${i === tier ? "bg-[#062A3A] text-[#F2E3C6]" : "hover:bg-[#062A3A]/8"}`}>
                  {x.label}
                </button>
              ))}
            </div>
            <ul className="flex flex-col gap-2.5 text-[15px]">
              <li className="flex justify-between gap-3"><span>Return flights from Johannesburg</span><b>Included</b></li>
              <li className="flex justify-between gap-3"><span>{t.hotel}</span><b>7 nights</b></li>
              <li className="flex justify-between gap-3"><span>Private airport transfers</span><b>Included</b></li>
              <li className="flex justify-between gap-3"><span>{t.board}</span><b>Included</b></li>
            </ul>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Add to your trip</span>
              <div className="flex flex-wrap gap-2">
                {EXTRAS.map((x) => (
                  <button key={x} type="button" aria-pressed={extras.includes(x)} onClick={() => toggle(x)}
                    className={`min-h-10 rounded-full border px-3.5 text-sm font-semibold transition ${extras.includes(x) ? "border-[#062A3A] bg-[#062A3A] text-[#F2E3C6]" : "border-[#062A3A]/30 hover:border-[#062A3A]"}`}>
                    {extras.includes(x) ? "✓ " : "+ "}{x}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2.5 border-t border-dashed border-[#062A3A]/30 pt-4">
              <label className="flex flex-col gap-1 text-[13px] font-semibold">Name<input name="name" required autoComplete="name" className={input} /></label>
              <label className="flex flex-col gap-1 text-[13px] font-semibold">Email<input type="email" name="email" required autoComplete="email" className={input} /></label>
              <label className="flex flex-col gap-1 text-[13px] font-semibold">When would you go?<input name="travel_dates" placeholder="e.g. May 2027" className={input} /></label>
            </div>
            <BotTrap />
            <button type="submit" disabled={sending} className="min-h-14 rounded-[18px] bg-[#062A3A] text-[17px] font-extrabold text-[#F2E3C6] transition hover:brightness-125 disabled:cursor-wait disabled:opacity-60">
              {sending ? "Sending…" : "Get my exact price"}
            </button>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-[18px] border border-[#062A3A]/30 font-bold">
              <WhatsAppIcon className="h-5 w-5" /> Ask on WhatsApp instead
            </a>
            <FormStatus status={status} className="text-center font-semibold" />
            {!status.message && <span className="text-center text-[13px] text-[#3E5A63]">Live prices, confirmed within 24 hours</span>}
          </form>
        </div>
      </section>

      <section className="flex flex-col gap-8 pb-28 pl-[5vw]">
        <h2 className="reveal pr-[5vw] text-4xl font-extrabold tracking-[-0.04em] md:text-5xl">More islands we know <span className={`${serif} italic`} style={{ color: teal }}>by heart</span></h2>
        <div className="flex snap-x snap-mandatory gap-4.5 overflow-x-auto pr-[5vw] pb-3">
          {MORE.map((m) => (
            <a key={m.name} href="#price" className="d-zoom relative flex aspect-[3/4] w-[300px] flex-none snap-start items-end overflow-hidden rounded-[26px] md:w-[340px]">
              <img src={m.img} alt={m.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,42,58,.85),rgba(6,42,58,0)_55%)]" />
              <span className="relative p-6 text-[28px] font-extrabold">{m.name}</span>
            </a>
          ))}
        </div>
      </section>

      <footer className="flex flex-wrap justify-between gap-3 border-t border-[#F2E3C6]/12 px-[5vw] py-9 text-sm text-[#F2E3C6]/65">
        <span>{BRAND.name} · <a href={tel}>{contact.phoneDisplay}</a> · <a href={`mailto:${contact.email}`}>{contact.email}</a></span>
        <span>Powered by TribeTravel</span>
      </footer>
    </div>
  );
}
