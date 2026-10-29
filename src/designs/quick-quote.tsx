// Quick Quote: built to turn visitors into enquiries. A 4-step quote form leads the page, then this week's specials.
import { useState } from "react";
import { Check, Minus, Plus, Sun } from "lucide-react";
import { useEnquiry } from "@/lib/enquiry";
import { useReveal } from "@/hooks/use-reveal";
import { BRAND, BotTrap, FormStatus, HeroVideo, WhatsAppIcon, contact, media, monthWords, tel } from "@/designs/shared";

export const QUICK_QUOTE_FONTS = "family=Plus+Jakarta+Sans:wght@400;500;600;700;800";

const coral = "#E2462B";

const DESTS = [
  { label: "Mauritius", img: media.islands },
  { label: "Safari", img: media.safari },
  { label: "Cruise", img: media.cruises },
  { label: "Europe", img: media.cities },
  { label: "Zanzibar", img: media.islands },
  { label: "Not sure yet", img: media.safari },
];
const LENGTHS = ["A weekend", "5 nights", "7 nights", "10+ nights"];
const STEP_NAMES = ["Destination", "Dates", "Travellers", "Your details"];

const DEALS = [
  { title: "Mauritius beach escape", tag: "7 nights · all-inclusive", img: media.islands, alt: "A Mauritius beach" },
  { title: "Big Five safari lodge", tag: "4 nights · game drives", img: media.safari, alt: "A safari at sunset" },
  { title: "Family cruise holiday", tag: "Kids clubs on board", img: media.cruises, alt: "A cruise ship at sea" },
  { title: "European city break", tag: "Flights included", img: media.cities, alt: "A European city street" },
];

const TRUST = ["Free tailored quotes", "Real agents, not bots", "Flights, stays and transfers in one booking", "Help while you travel", "Quotes within 24 hours"];

const FAQ = [
  ["Does a quote cost anything?", "No. Quotes are free and you're under no obligation to book."],
  ["How fast will I hear back?", "Within 24 hours on working days, usually the same day."],
  ["Can you book flights too?", "Yes. We put flights, stays, transfers and activities together in one booking."],
  ["What if my plans change?", "We handle changes for you, before and during your trip."],
];

const input = "min-h-[52px] rounded-[14px] border border-[#D0D5DD] px-4 text-base font-medium outline-none focus:border-[#E2462B]";

function QuoteCard() {
  const [step, setStep] = useState(0);
  const [dest, setDest] = useState("Mauritius");
  const [len, setLen] = useState("7 nights");
  const [month, setMonth] = useState("");
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const travellers = `${adults} adult${adults > 1 ? "s" : ""}${kids ? `, ${kids} child${kids > 1 ? "ren" : ""}` : ""}`;
  const { status, onSubmit, sending, reset } = useEnquiry(() => ({
    destination: dest,
    travel_dates: [month && monthWords(month), len].filter(Boolean).join(", "),
    travellers,
  }));
  const done = status.kind === "sent";

  const people: [string, string, number, (n: number) => void, number][] = [
    ["Adults", "12 years and older", adults, setAdults, 1],
    ["Children", "Under 12", kids, setKids, 0],
  ];

  return (
    // Enter before the last step moves on instead of sending a half-filled request.
    <form onSubmit={(e) => { if (step < 3) { e.preventDefault(); setStep(step + 1); } else onSubmit(e); }} id="quote" className="flex scroll-mt-24 flex-col gap-6 rounded-[28px] border border-[#EAECF0] bg-white p-6 shadow-[0_40px_80px_-30px_rgba(16,24,40,.28)] md:p-8">
      {done ? (
        <div className="d-slide flex flex-col items-center gap-3.5 py-6 text-center">
          <span aria-hidden="true" className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#ECFDF3] text-[#17B26A]"><Check className="h-9 w-9" strokeWidth={2.4} /></span>
          <h2 className="text-3xl font-extrabold tracking-tight">Request sent!</h2>
          <p className="max-w-[360px] text-[#475467]">We're on it. Expect your tailored quote within 24 hours, usually much sooner.</p>
          <button type="button" onClick={() => { reset(); setStep(0); }} className="min-h-11 rounded-xl border border-[#D0D5DD] px-5 font-bold">Plan another trip</button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between text-[13px] font-bold text-[#667085]"><span>Step {step + 1} of 4</span><span>{STEP_NAMES[step]}</span></div>
            <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-[#F2F4F7]">
              <div className="h-full rounded-full bg-[#E2462B] transition-[width] duration-500" style={{ width: `${(step + 1) * 25}%` }} />
            </div>
          </div>

          {step === 0 && (
            <fieldset key="s0" className="d-slide flex flex-col gap-4">
              <legend className="mb-4 text-[28px] font-extrabold tracking-tight">Where would you love to go?</legend>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {DESTS.map((d) => (
                  <button key={d.label} type="button" aria-pressed={dest === d.label} onClick={() => setDest(d.label)}
                    className={`flex min-h-11 flex-col gap-2 rounded-2xl border-2 p-2 pb-3 text-left font-bold transition ${dest === d.label ? "border-[#E2462B] bg-[#FFF4F1]" : "border-[#EAECF0] hover:border-[#E2462B]"}`}>
                    <img src={d.img} alt="" aria-hidden="true" className="h-[72px] w-full rounded-[10px] object-cover" />
                    <span className="px-1">{d.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset key="s1" className="d-slide flex flex-col gap-4">
              <legend className="mb-4 text-[28px] font-extrabold tracking-tight">When, and for how long?</legend>
              <label className="flex flex-col gap-2 text-sm font-bold">Travel month
                <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={input} />
              </label>
              <span className="text-sm font-bold">Trip length</span>
              <div className="flex flex-wrap gap-2.5">
                {LENGTHS.map((l) => (
                  <button key={l} type="button" aria-pressed={len === l} onClick={() => setLen(l)}
                    className={`min-h-12 rounded-full border px-5 font-bold transition ${len === l ? "border-[#101828] bg-[#101828] text-white" : "border-[#D0D5DD] hover:border-[#101828]"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset key="s2" className="d-slide flex flex-col gap-3">
              <legend className="mb-4 text-[28px] font-extrabold tracking-tight">Who's travelling?</legend>
              {people.map(([label, hint, n, set, min]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-[#EAECF0] px-5 py-4">
                  <div className="flex flex-col"><span className="text-[17px] font-bold">{label}</span><span className="text-sm text-[#667085]">{hint}</span></div>
                  <div className="flex items-center gap-3.5">
                    <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} onClick={() => set(Math.max(min, n - 1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D0D5DD]"><Minus className="h-5 w-5" /></button>
                    <span aria-live="polite" className="min-w-6 text-center text-xl font-extrabold">{n}</span>
                    <button type="button" aria-label={`More ${label.toLowerCase()}`} onClick={() => set(Math.min(12, n + 1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D0D5DD]"><Plus className="h-5 w-5" /></button>
                  </div>
                </div>
              ))}
            </fieldset>
          )}

          {step === 3 && (
            <fieldset key="s3" className="d-slide flex flex-col gap-4">
              <legend className="mb-2 text-[28px] font-extrabold tracking-tight">Where should we send your quote?</legend>
              <p className="text-[15px] text-[#475467]">{dest} · {month ? `${monthWords(month)}, ` : ""}{len} · {travellers}</p>
              <label className="flex flex-col gap-2 text-sm font-bold">Your name<input name="name" required autoComplete="name" className={input} /></label>
              <label className="flex flex-col gap-2 text-sm font-bold">Email<input type="email" name="email" required autoComplete="email" className={input} /></label>
              <label className="flex flex-col gap-2 text-sm font-bold">WhatsApp number (optional)<input type="tel" name="phone" autoComplete="tel" className={input} /></label>
            </fieldset>
          )}

          <div className="flex gap-3">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="min-h-14 rounded-2xl border border-[#D0D5DD] px-5 font-bold">Back</button>
            )}
            {step < 3 ? (
              // Separate keys: reusing one button would turn it into "submit" mid-click and send the form.
              <button key="next" type="button" onClick={() => setStep(step + 1)} className="min-h-14 flex-1 rounded-2xl bg-[#E2462B] text-[17px] font-extrabold text-white shadow-[0_12px_24px_-10px_rgba(226,70,43,.7)] transition hover:brightness-105">
                Continue
              </button>
            ) : (
              <button key="send" type="submit" disabled={sending} className="min-h-14 flex-1 rounded-2xl bg-[#E2462B] text-[17px] font-extrabold text-white shadow-[0_12px_24px_-10px_rgba(226,70,43,.7)] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60">
                {sending ? "Sending…" : "Send my free quote request"}
              </button>
            )}
          </div>
          <FormStatus status={status} className="text-center text-[#B42318]" />
          <p className="text-center text-[13px] text-[#667085]">Your details go only to us. No spam, ever.</p>
        </>
      )}
      <BotTrap />
    </form>
  );
}

export function QuickQuote() {
  useReveal();
  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans',system-ui,sans-serif] text-[#101828]">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-5 border-b border-[#EEF0F4] bg-white/90 px-[5vw] py-4 backdrop-blur-md">
        <a href="#top" className="flex items-center gap-2.5">
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white" style={{ background: coral }}><Sun className="h-5 w-5" /></span>
          <span className="text-xl font-extrabold tracking-tight">{BRAND.name}</span>
        </a>
        <nav className="hidden gap-7 text-[15px] font-semibold text-[#475467] md:flex">
          <a href="#deals" className="hover:text-[#101828]">Specials</a>
          <a href="#faq" className="hover:text-[#101828]">FAQ</a>
          <a href={tel} className="hover:text-[#101828]">{contact.phoneDisplay}</a>
        </nav>
        <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#D0D5DD] px-4 text-sm font-bold">
          <WhatsAppIcon className="h-[18px] w-[18px] text-[#16A34A]" /> WhatsApp
        </a>
      </header>

      <section id="top" className="grid items-center gap-14 bg-[radial-gradient(1200px_500px_at_85%_10%,#FFE9E3_0%,rgba(255,233,227,0)_60%)] px-[5vw] pt-14 pb-20 lg:grid-cols-[1.05fr_.95fr]">
        <div className="flex flex-col gap-7">
          <span className="d-rise inline-flex items-center gap-2 self-start rounded-full bg-[#ECFDF3] px-3.5 py-2 text-sm font-bold text-[#067647]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#17B26A]" /> Free quotes · no obligation
          </span>
          <h1 className="d-rise text-[46px] leading-[1.02] font-extrabold tracking-[-0.035em] [animation-delay:.1s] md:text-[72px]">
            Your holiday, <span style={{ color: coral }}>quoted in 24 hours.</span>
          </h1>
          <p className="d-rise max-w-[540px] text-lg leading-relaxed text-[#475467] [animation-delay:.2s] md:text-xl">
            Answer four quick questions. A real travel agent builds your trip and sends you a priced quote.
          </p>
          <div className="d-rise flex items-end gap-4 [animation-delay:.3s]">
            <div className="d-float aspect-[4/3] w-[58%] overflow-hidden rounded-3xl shadow-[0_30px_60px_-20px_rgba(16,24,40,.35)]">
              <HeroVideo />
            </div>
            <div className="flex w-[38%] flex-col gap-4">
              <img src={media.safari} alt="A safari at sunset" className="aspect-square w-full rounded-[20px] object-cover" />
              <div className="flex flex-col gap-1 rounded-[18px] bg-[#101828] p-4 text-white">
                <span className="text-[13px] text-[#98A2B3]">Your quote</span>
                <span className="text-xl font-extrabold md:text-2xl">Within 24 hours</span>
              </div>
            </div>
          </div>
        </div>
        <QuoteCard />
      </section>

      <div className="overflow-hidden bg-[#101828] py-4 text-white">
        <div className="d-marquee flex w-max gap-12 whitespace-nowrap font-bold">
          {[...TRUST, ...TRUST].map((t, i) => (
            <span key={i} className="flex items-center gap-12"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#FDA29B]" />{t}</span><span aria-hidden="true" className="text-[#FDA29B]">●</span></span>
          ))}
        </div>
      </div>

      <section id="deals" className="flex flex-col gap-10 px-[5vw] py-24">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-extrabold uppercase tracking-[0.08em]" style={{ color: coral }}>This week's specials</span>
            <h2 className="text-4xl leading-tight font-extrabold tracking-[-0.03em] md:text-5xl">Grab one before it's gone</h2>
          </div>
          <a href="#quote" className="font-bold" style={{ color: coral }}>Get a quote for any trip →</a>
        </div>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {DEALS.map((d) => (
            <a key={d.title} href="#quote" className="d-zoom reveal flex flex-col gap-3.5">
              <span className="relative block aspect-[4/5] overflow-hidden rounded-[20px]">
                <img src={d.img} alt={d.alt} loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute top-3.5 left-3.5 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold">{d.tag}</span>
              </span>
              <span className="text-lg font-extrabold md:text-xl">{d.title}</span>
              <span className="text-[15px] font-bold" style={{ color: coral }}>Quote me →</span>
            </a>
          ))}
        </div>
      </section>

      <section id="faq" className="flex flex-col gap-8 px-[5vw] pb-24">
        <h2 className="reveal text-4xl font-extrabold tracking-[-0.03em]">Quick answers</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ.map(([q, a]) => (
            <details key={q} className="reveal rounded-[18px] border border-[#EAECF0] px-6 py-5">
              <summary className="cursor-pointer text-[17px] font-bold">{q}</summary>
              <p className="mt-3 leading-relaxed text-[#475467]">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="flex flex-wrap justify-between gap-3 bg-[#F9FAFB] px-[5vw] py-8 text-sm text-[#475467]">
        <span>© {new Date().getFullYear()} {BRAND.name} · <a href={tel}>{contact.phoneDisplay}</a> · <a href={`mailto:${contact.email}`}>{contact.email}</a></span>
        <span>Powered by TribeTravel</span>
      </footer>
    </div>
  );
}
