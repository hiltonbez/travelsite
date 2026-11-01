// The quote form: pick a place on the map, a month and who's going, and the request lands in the agency's
// TribeTravel Enquiries inbox. Afterwards it shows the WhatsApp and email the visitor will get (examples).
import { useState } from "react";
import { ArrowRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { useEnquiry } from "@/lib/enquiry";
import { BRAND, BotTrap, FormStatus, monthWords } from "@/designs/shared";
import { DESTINATIONS } from "@/designs/atlas/content";
import { Consent } from "@/designs/atlas/parts";
import { btn, display, glass, input, label, mono, muted } from "@/designs/atlas/theme";

const ELSEWHERE = "Somewhere else";

export function QuoteForm({ place }: { place?: string }) {
  const [where, setWhere] = useState(place ?? DESTINATIONS[0]!.name);
  const { status, onSubmit, sending } = useEnquiry((fd) => ({
    destination: where === ELSEWHERE ? String(fd.get("elsewhere") || ELSEWHERE) : where,
    travel_dates: monthWords(String(fd.get("travel_dates") ?? "")),
  }));

  return (
    <div className="flex flex-col gap-4">
      <form id="quote" onSubmit={onSubmit} className={`grid scroll-mt-28 gap-5 p-5 sm:p-7 ${glass}`}>
        <fieldset className="flex flex-col gap-3">
          <legend className={`${label} mb-3 ${muted}`}>Where to</legend>
          <div className="flex flex-wrap gap-2">
            {[...DESTINATIONS.map((d) => d.name), ELSEWHERE].map((n) => (
              <button key={n} type="button" aria-pressed={where === n} onClick={() => setWhere(n)}
                className={`flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition ${where === n ? "border-[#0B2340] bg-[#0B2340] text-white" : "border-[#0B2340]/12 bg-white hover:border-[#1D6FD8]"}`}>
                {where === n && <MapPin className="h-3.5 w-3.5 text-[#FFB547]" />}{n}
              </button>
            ))}
          </div>
          {where === ELSEWHERE && <input name="elsewhere" placeholder="Where would you like to go?" aria-label="Where would you like to go?" className={input} />}
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold">When<input type="month" name="travel_dates" className={input} /></label>
          <label className="grid gap-1 text-sm font-semibold">Who's going
            <select name="travellers" className={input}>
              <option>2 adults</option><option>A family</option><option>Just me</option><option>A group (6+)</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">Your name<input name="name" required autoComplete="name" className={input} /></label>
          <label className="grid gap-1 text-sm font-semibold">Email<input name="email" type="email" required autoComplete="email" className={input} /></label>
          <label className="grid gap-1 text-sm font-semibold">Mobile (optional)<input name="phone" type="tel" autoComplete="tel" className={input} /></label>
          <label className="grid gap-1 text-sm font-semibold">Anything else?<input name="message" placeholder="Budget, occasion, must-haves" className={input} /></label>
        </div>
        <Consent />
        <BotTrap />
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={sending} className={`${btn} min-h-14 px-8`}>{sending ? "Sending…" : <>Send my request <ArrowRight className="h-4 w-4" /></>}</button>
          <span className={`text-sm ${muted}`}>Free, no obligation. A real person prices every quote.</span>
        </div>
        <FormStatus status={status} className="font-semibold text-[#15803D]" />
      </form>
      {status.kind === "sent" && <WhatHappensNow where={where} />}
    </div>
  );
}

/** After sending: the WhatsApp and email updates on their way (examples of the agency's notifications). */
function WhatHappensNow({ where }: { where: string }) {
  return (
    <div className="atlas-pop grid gap-3 md:grid-cols-2">
      <div className="flex flex-col gap-2 rounded-[22px] border border-[#16A34A]/20 bg-[#E7F8EE] p-4 text-sm">
        <span className={`flex items-center gap-2 ${mono} text-[11px] ${muted}`}><MessageCircle className="h-4 w-4" /> WhatsApp · example</span>
        <p>Hi! It's Thandi from {BRAND.name}. Your {where} quote is ready: flights, transfers and a day-by-day plan. Tap to view and accept.</p>
      </div>
      <div className="flex flex-col gap-1 rounded-[22px] border border-[#0B2340]/8 bg-white p-4 text-sm">
        <span className={`flex items-center gap-2 ${mono} text-[11px] ${muted}`}><Mail className="h-4 w-4" /> Email · example</span>
        <b className={display}>Your quote is ready: {where}</b>
        <span className={muted}>Day by day, with prices and photos, and a button to accept.</span>
      </div>
    </div>
  );
}
