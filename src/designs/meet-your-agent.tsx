// Meet Your Agent: a personal site for a home-based agent. The agent is the brand: a friendly hello, trips they
// know first-hand, and an "ask me anything" form. The agent here (Sam) is a sample; an agency puts in its own.
import { useState } from "react";
import { ShieldCheck, Star, UserRound } from "lucide-react";
import { useEnquiry } from "@/lib/enquiry";
import { useReveal } from "@/hooks/use-reveal";
import { BRAND, BotTrap, FormStatus, WhatsAppIcon, contact, media, tel } from "@/designs/shared";

export const MEET_FONTS = "family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;700";

const serif = "font-['DM_Serif_Display',serif] font-normal";
const AGENT = "Sam";

const REELS = [
  { name: "Mauritius", img: media.islands, note: "My go-to for honeymoons: a beachfront resort on the east coast, a catamaran day and the best sunset spot in Flic en Flac." },
  { name: "Sabi Sands", img: media.safari, note: "Three nights is the sweet spot. I'll pair a lodge with a short flight so you skip the long drive." },
  { name: "Med cruise", img: media.cruises, note: "Perfect for families: kids clubs on board, a new port every morning, and you only unpack once." },
  { name: "Lisbon & Porto", img: media.cities, note: "Ten days, two cities, one train ride and far too many custard tarts." },
];

const WHY = [
  { icon: UserRound, title: "One person, start to finish", text: "No call centres. You message me, I answer, before, during and after your trip." },
  { icon: Star, title: "Perks you won't find online", text: "Upgrades and agent-only rates from the hotels and lodges I work with every week." },
  { icon: ShieldCheck, title: "Looked after, all the way", text: "Help with travel insurance, visas and changes, and someone to call while you're away." },
];

const input = "min-h-[52px] rounded-[14px] border border-[#E9C7AD] bg-white px-4 text-base font-medium outline-none focus:border-[#0D4D4F]";

export function MeetYourAgent() {
  useReveal();
  const [open, setOpen] = useState(0);
  const { status, onSubmit, sending } = useEnquiry();

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',system-ui,sans-serif] text-[#10282A]">
      <header className="flex flex-wrap items-center justify-between gap-4 px-[5vw] py-6">
        <a href="#top" className={`${serif} text-[26px] text-[#0D4D4F]`}>
          {AGENT} <span className="font-['DM_Sans',sans-serif] text-[13px] text-[#5B6B6C]">· {BRAND.name}</span>
        </a>
        <div className="flex flex-wrap gap-2.5">
          <a href={tel} className="inline-flex min-h-11 items-center rounded-full border border-[#0D4D4F] px-5 text-sm font-bold text-[#0D4D4F] transition hover:bg-[#0D4D4F]/5">Call me</a>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0D4D4F] px-5 text-sm font-bold text-white transition hover:bg-[#08393A]">
            <WhatsAppIcon className="h-[18px] w-[18px]" /> WhatsApp me
          </a>
        </div>
      </header>

      <section id="top" className="grid items-center gap-16 px-[5vw] pt-12 pb-24 lg:grid-cols-[1.1fr_.9fr]">
        <div className="flex flex-col gap-6">
          <span className="d-rise self-start rounded-full bg-[#FDEBDD] px-4 py-2 text-sm font-bold text-[#8A4B17]">Your personal travel agent</span>
          <h1 className={`d-rise ${serif} text-[52px] leading-none tracking-[-0.015em] [animation-delay:.1s] md:text-[84px]`}>
            Hi, I'm {AGENT}.<br />I plan trips I'd <em className="text-[#C2621F]">take myself.</em>
          </h1>
          <p className="d-rise max-w-[560px] text-lg leading-relaxed text-[#44585A] [animation-delay:.2s] md:text-xl">
            Skip the 40 open tabs. Tell me what you love and I'll send you a hand-picked plan with real prices, then look after you until you're home.
          </p>
          <div className="d-rise flex flex-wrap gap-3 [animation-delay:.3s]">
            <a href="#ask" className="inline-flex min-h-14 items-center rounded-full bg-[#F4A261] px-7 font-bold text-[#10282A] transition hover:-translate-y-0.5">Ask me anything</a>
            <a href="#trips" className="inline-flex min-h-14 items-center rounded-full border border-[#10282A]/20 px-7 font-bold transition hover:-translate-y-0.5">See my favourite trips</a>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          <div aria-hidden="true" className="d-blob absolute inset-0 bg-[#F4A261]" />
          <div className="d-blob absolute inset-[18px] flex items-center justify-center overflow-hidden bg-[#0D4D4F] [animation-delay:-3s]">
            <span aria-hidden="true" className={`${serif} text-[220px] leading-none text-[#FDEBDD]`}>{AGENT[0]}</span>
          </div>
          <div className="absolute bottom-10 -left-2 flex items-center gap-3 rounded-[18px] bg-white px-4 py-3.5 shadow-[0_20px_40px_-16px_rgba(16,40,42,.35)] md:-left-6">
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#22A06B]" />
            <span className="text-[15px] font-bold">I reply personally, usually same day</span>
          </div>
        </div>
      </section>

      <section id="trips" className="flex flex-col gap-10 bg-[#0D4D4F] px-[5vw] py-24 text-white">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${serif} max-w-[700px] text-[44px] leading-[1.05] md:text-[56px]`}>
            Places I love <em className="text-[#F4A261]">(and will plan for you)</em>
          </h2>
          <p className="max-w-[360px] leading-relaxed text-white/75">Tap a trip. These are the ones my clients ask about most.</p>
        </div>
        <div className="flex flex-col gap-3.5 md:h-[520px] md:flex-row">
          {REELS.map((r, i) => {
            const on = i === open;
            return (
              <div
                key={r.name}
                className={`relative flex min-h-[220px] min-w-0 items-end overflow-hidden rounded-[26px] bg-[#08393A] p-6 transition-[flex-grow] duration-700 md:min-h-0 ${on ? "md:flex-[3.2_1_0]" : "md:flex-[1_1_0]"}`}
              >
                <img src={r.img} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,30,31,.9),rgba(8,30,31,0)_60%)]" />
                {/* The whole card opens the trip; the button covers it, under the "Plan this" link. */}
                <button type="button" aria-expanded={on} onClick={() => setOpen(i)} className="absolute inset-0 cursor-pointer" aria-label={`${r.name}: show the trip`} />
                <div className="pointer-events-none relative flex flex-col gap-2">
                  <span className={`${serif} text-3xl leading-tight`}>{r.name}</span>
                  {on && (
                    <div className="d-slide flex flex-col gap-3">
                      <p className="max-w-[420px] leading-relaxed text-white/90">{r.note}</p>
                      <a href="#ask" className="pointer-events-auto self-start rounded-full bg-[#F4A261] px-4 py-2.5 text-sm font-bold text-[#10282A]">Plan this for me</a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-10 px-[5vw] py-24">
        <h2 className={`reveal ${serif} text-center text-[44px] md:text-[52px]`}>Why book with a person?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {WHY.map(({ icon: Icon, title, text }) => (
            <div key={title} className="reveal flex flex-col gap-3 rounded-3xl bg-[#F3F7F7] p-8">
              <Icon aria-hidden="true" className="h-9 w-9 text-[#0D4D4F]" strokeWidth={1.8} />
              <h3 className="text-[22px] font-bold">{title}</h3>
              <p className="leading-relaxed text-[#44585A]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ask" className="mx-[5vw] mb-24 flex flex-col items-center gap-7 rounded-[36px] bg-[#FDEBDD] px-[5vw] py-16 text-center">
        <h2 className={`reveal ${serif} max-w-[820px] text-[40px] leading-[1.05] md:text-[56px]`}>
          Ask me anything. <em className="text-[#C2621F]">Even “where should I go?”</em>
        </h2>
        <form onSubmit={onSubmit} className="flex w-full max-w-[760px] flex-col gap-3.5 text-left">
          <label className="flex flex-col gap-1.5 text-sm font-bold">What are you dreaming about?
            <textarea name="message" required rows={3} placeholder="Anniversary trip in May, somewhere warm, just the two of us…" className={`${input} resize-y py-4`} />
          </label>
          <div className="grid gap-3.5 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm font-bold">Name<input name="name" required autoComplete="name" className={input} /></label>
            <label className="flex flex-col gap-1.5 text-sm font-bold">Email<input type="email" name="email" required autoComplete="email" className={input} /></label>
            <label className="flex flex-col gap-1.5 text-sm font-bold">WhatsApp (optional)<input type="tel" name="phone" autoComplete="tel" className={input} /></label>
          </div>
          <BotTrap />
          <button type="submit" disabled={sending} className="mt-1 min-h-14 self-center rounded-full bg-[#0D4D4F] px-9 text-[17px] font-bold text-white transition hover:bg-[#08393A] disabled:cursor-wait disabled:opacity-60">
            {sending ? "Sending…" : `Send it to ${AGENT}`}
          </button>
          <FormStatus status={status} className="text-center font-semibold text-[#0D4D4F]" />
        </form>
      </section>

      <footer className="flex flex-wrap justify-between gap-3 border-t border-[#E3EAEA] px-[5vw] py-8 text-sm text-[#5B6B6C]">
        <span>{AGENT} · {BRAND.name} · <a href={tel}>{contact.phoneDisplay}</a> · <a href={`mailto:${contact.email}`}>{contact.email}</a></span>
        <span>Powered by TribeTravel</span>
      </footer>
    </div>
  );
}
