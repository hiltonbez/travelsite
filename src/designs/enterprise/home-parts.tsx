// The home page's own sections: the departure (quote form as a boarding pass) and the contact stop.
import { useState } from "react";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { useEnquiry } from "@/lib/enquiry";
import { BRAND, BotTrap, FormStatus, WhatsAppIcon, contact, mailto, monthWords, tel } from "@/designs/shared";
import { LiveDot, StopLabel } from "@/designs/enterprise/parts";
import { btn, display, ghost, gutter, h2, input, label, mono, orange, panel, soft } from "@/designs/enterprise/theme";

export function Departure() {
  const [more, setMore] = useState(false);
  const { status, onSubmit, sending } = useEnquiry((fd) => ({ travel_dates: monthWords(String(fd.get("travel_dates") ?? "")) }));

  const field = "flex min-w-0 flex-col gap-1.5";
  const fieldLabel = `${label} text-[#0B1424]/60`;
  const fieldInput = "min-h-9 w-full border-0 border-b-2 border-[#0B1424]/15 bg-transparent p-0 text-[17px] font-semibold text-[#0B1424] outline-none [color-scheme:light] focus:border-[#FF6A2E]";

  return (
    <section className={`relative z-10 flex flex-col gap-8 ${gutter} pt-16 pb-28 md:pt-24`}>
      <p className={`d-rise flex flex-wrap gap-x-7 gap-y-2 ${label} ${soft}`}>
        <span>JNB → MRU · ZNZ · VFA</span><span>26°12′S 28°02′E</span><span className={`flex items-center gap-2 ${orange}`}><LiveDot /> Live rates on</span>
      </p>
      <h1 className={`d-rise ${display} max-w-[13ch] text-[clamp(42px,8vw,120px)] leading-[0.9] [animation-delay:.12s]`}>
        Every trip is a <em className={`not-italic ${orange}`}>route.</em> We fly it with you.
      </h1>
      <p className={`d-rise max-w-[54ch] text-lg leading-relaxed ${soft} [animation-delay:.25s] md:text-xl`}>
        Live prices from our suppliers, a concierge that answers at midnight and a consultant on your schedule. Tell us where you're headed and your quote follows within 24 hours.
      </p>

      <form id="quote" onSubmit={onSubmit} className="d-rise relative grid max-w-[1080px] scroll-mt-24 rounded-[22px] bg-[#EDE6D8] text-[#0B1424] shadow-[0_40px_80px_-40px_rgba(0,0,0,.9)] [animation-delay:.4s] md:grid-cols-[1fr_250px]">
        <div className="flex flex-col gap-6 p-6 md:p-8">
          <div className={`flex flex-wrap items-center justify-between gap-3 ${label} text-[#0B1424]/60`}>
            <span>Boarding pass · {BRAND.name}</span>
            <span className="font-semibold text-[#0B1424]">JNB → <span className="text-[#C2410C]">anywhere</span></span>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <label className={field}>
              <span className={fieldLabel}>Where to</span>
              <select name="destination" className={fieldInput}>
                <option>Mauritius &amp; islands</option>
                <option>An African safari</option>
                <option>A cruise</option>
                <option>Europe &amp; cities</option>
                <option>Not sure yet, surprise me</option>
              </select>
            </label>
            <label className={field}>
              <span className={fieldLabel}>When</span>
              <input type="month" name="travel_dates" className={fieldInput} />
            </label>
            <label className={field}>
              <span className={fieldLabel}>Travellers</span>
              <select name="travellers" className={fieldInput}>
                <option>2 adults</option>
                <option>A family</option>
                <option>Just me</option>
                <option>A group (6+)</option>
              </select>
            </label>
          </div>
          {more && (
            <div className="d-slide grid gap-6 sm:grid-cols-3">
              <label className={field}>
                <span className={fieldLabel}>Your name</span>
                <input name="name" required autoComplete="name" autoFocus className={fieldInput} />
              </label>
              <label className={field}>
                <span className={fieldLabel}>Email</span>
                <input type="email" name="email" required autoComplete="email" className={fieldInput} />
              </label>
              <label className={field}>
                <span className={fieldLabel}>Phone (optional)</span>
                <input type="tel" name="phone" autoComplete="tel" className={fieldInput} />
              </label>
            </div>
          )}
          <BotTrap />
        </div>
        {/* The stub, torn off along the perforation */}
        <div className="relative flex flex-col justify-between gap-5 border-t-2 border-dashed border-[#0B1424]/20 p-6 md:border-t-0 md:border-l-2 md:p-8">
          <span aria-hidden="true" className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-[#0B1424] md:-top-3 md:-left-3" />
          <span aria-hidden="true" className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-[#0B1424] md:top-auto md:-bottom-3 md:-left-3 md:right-auto" />
          <div className={`flex flex-col gap-1 ${label} text-[#0B1424]/60`}>
            <span>Gate</span>
            <span className={`${display} text-4xl leading-none text-[#0B1424]`}>24H</span>
            <span>Quote within a day</span>
          </div>
          {more ? (
            <button type="submit" disabled={sending} className={btn}>{sending ? "Sending…" : "Send my request"}</button>
          ) : (
            <button type="button" onClick={() => setMore(true)} className={btn}>Get my quote <ArrowRight className="h-4 w-4" /></button>
          )}
        </div>
      </form>
      <FormStatus status={status} className={orange} />
      {status.kind === "sent" && <WhatHappensNow />}
      {!status.message && <p className={`text-[13px] ${soft}`}>Free, no obligation. A real person prices every quote.</p>}
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" data-stop className={`relative z-10 flex scroll-mt-20 flex-col items-center gap-7 ${gutter} pt-28 pb-40 text-center`}>
      <StopLabel>Final approach</StopLabel>
      <h2 className={`${h2} max-w-[16ch]`}>Ready when <span className={orange}>you are.</span></h2>
      <p className={`max-w-[48ch] text-lg leading-relaxed ${soft}`}>Tell us where you dream of going. A real person replies, usually the same day.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <a href="#quote" className={`${btn} min-h-14 px-8`}>Get my quote</a>
        <a href={contact.whatsapp} target="_blank" rel="noreferrer" className={`${ghost} min-h-14 px-8`}>
          <WhatsAppIcon className="h-5 w-5" /> WhatsApp us
        </a>
      </div>
      <p className={`${mono} text-sm ${soft}`}>
        <a href={tel} className="hover:text-[#FF6A2E]">{contact.phoneDisplay}</a> · <a href={mailto} className="hover:text-[#FF6A2E]">{contact.email}</a>
      </p>
    </section>
  );
}


/** After the boarding pass is sent: the WhatsApp and email updates the customer will get (Pro: WhatsApp + email
 *  notifications), shown as examples of what's coming. */
function WhatHappensNow() {
  return (
    <div className="d-slide grid max-w-[1080px] gap-4 md:grid-cols-[1fr_1fr_1fr]">
      <div className="flex flex-col gap-2">
        <span className={`${label} ${orange}`}>What happens now</span>
        <p className={`text-[15px] leading-relaxed ${soft}`}>Your consultant prices your trip today. You'll hear from us on WhatsApp and by email, like this:</p>
      </div>
      <div className="flex flex-col gap-2 rounded-2xl bg-[#0E3B2E] p-4 text-sm">
        <span className="flex items-center gap-2 text-xs text-[#9FE6C4]"><MessageCircle className="h-4 w-4" /> WhatsApp · example</span>
        <p>Hi! It's Thandi from {BRAND.name}. Your Mauritius quote <b>Q-1042</b> is ready: 7 nights, half board, flights and transfers. Tap to view and accept.</p>
      </div>
      <div className="flex flex-col gap-1 rounded-2xl border border-[#EDE6D8]/12 bg-[#111D33] p-4 text-sm">
        <span className={`flex items-center gap-2 text-xs ${soft}`}><Mail className="h-4 w-4" /> Email · example</span>
        <b>Your quote is ready: Mauritius, April 2027</b>
        <span className={soft}>Day-by-day itinerary, prices and photos, with a button to accept and pay your deposit online.</span>
      </div>
    </div>
  );
}
