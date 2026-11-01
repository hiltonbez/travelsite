// The quote request form (into TribeTravel's Enquiries inbox), drawn as a page torn from the travel journal: "Dear
// Sun-Set Travel, I'd like to go to …". On a destination page `place` fills in where; on the contact page a tag from
// the specials (?about=…) does.
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useEnquiry } from "@/lib/enquiry";
import { BRAND, BotTrap, FormStatus, monthWords } from "@/designs/shared";
import { DESTINATIONS } from "@/designs/living-map/content";
import { Consent, SectionHead } from "@/designs/living-map/parts";
import { accent, btn, card, gutter, hand, input, soft } from "@/designs/living-map/theme";

export function PlanForm({ place, readQuery = false }: { place?: string; readQuery?: boolean }) {
  const [where, setWhere] = useState(place ?? "");
  const { status, onSubmit, sending } = useEnquiry((fd) => ({ travel_dates: monthWords(String(fd.get("travel_dates") ?? "")) }));

  // A link from a rate tag (?about=Hotel name) fills in where.
  useEffect(() => {
    if (!readQuery) return;
    const about = new URLSearchParams(window.location.search).get("about");
    if (about) setWhere(about.slice(0, 120));
  }, [readQuery]);

  const line = `min-h-11 border-0 border-b-2 border-dashed border-(--lm-ink)/35 bg-transparent px-1 ${hand} text-2xl text-(--lm-accent) outline-none focus:border-solid focus:border-(--lm-accent)`;
  return (
    <form id="plan-form" onSubmit={onSubmit}
      className={`relative flex flex-col gap-5 p-6 md:p-10 ${card} [background-image:repeating-linear-gradient(transparent_0_43px,var(--lm-line)_43px_44px)] [background-position:0_22px]`}>
      <span aria-hidden="true" className="absolute top-0 bottom-0 left-8 w-px bg-(--lm-accent)/40 md:left-14" />
      <div className={`flex flex-col gap-4 pl-6 text-[17px] leading-[44px] md:pl-10`}>
        <p className={`${hand} text-3xl`}>Dear {BRAND.name},</p>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <label htmlFor="lm-where">I'd love to go to</label>
          <input id="lm-where" name="destination" list="lm-places" value={where} onChange={(e) => setWhere(e.target.value)} placeholder="Mauritius, maybe?" className={`${line} w-[min(260px,100%)]`} />
          <datalist id="lm-places">{DESTINATIONS.map((d) => <option key={d.slug} value={d.name} />)}</datalist>
          <label htmlFor="lm-when">around</label>
          <input id="lm-when" type="month" name="travel_dates" className={`${line} w-[min(210px,100%)] text-xl`} />
          <label htmlFor="lm-who">with</label>
          <select id="lm-who" name="travellers" className={`${line} w-[min(200px,100%)] text-xl`}>
            <option>2 adults</option><option>my family</option><option>just me</option><option>a group (6+)</option>
          </select>.
        </p>
        <p className="flex flex-col gap-1">
          <label htmlFor="lm-msg" className="sr-only">Anything else?</label>
          <textarea id="lm-msg" name="message" rows={2} placeholder="Anything else? A budget, a celebration, a must-see…"
            className={`${input} min-h-24 border-dashed bg-transparent py-3 leading-relaxed`} />
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3 md:pl-10">
        <label className="grid gap-1 text-sm font-semibold">Your name<input name="name" required autoComplete="name" className={input} /></label>
        <label className="grid gap-1 text-sm font-semibold">Email<input type="email" name="email" required autoComplete="email" className={input} /></label>
        <label className="grid gap-1 text-sm font-semibold">Mobile (optional)<input type="tel" name="phone" autoComplete="tel" className={input} /></label>
      </div>
      <div className="flex flex-col gap-4 md:pl-10">
        <Consent />
        <BotTrap />
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={sending} className={`${btn} min-h-14 px-8`}>{sending ? "Sending…" : "Send my letter"} <ArrowRight className="h-4 w-4" /></button>
          <span className={`${hand} text-2xl ${soft}`}>A real person replies, usually the same day.</span>
        </div>
        <FormStatus status={status} className={`font-semibold ${accent}`} />
      </div>
    </form>
  );
}

/** The home page's closing section: the letter, under a heading. */
export function PlanSection({ place }: { place?: string }) {
  return (
    <section id="plan" data-pin className={`relative z-10 flex scroll-mt-24 flex-col gap-10 ${gutter} py-24`}>
      <SectionHead kicker="Plan my trip · free, no obligation" title={<>Where shall <em>we draw the line?</em></>}
        intro="Tell us where you'd like to go and we'll plot the route: flights, places to stay and the days in between, priced by a consultant who's been there." />
      <PlanForm {...(place ? { place } : {})} />
    </section>
  );
}
