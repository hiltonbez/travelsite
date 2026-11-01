// The newsletter sign-up as a postcard: the picture side invites you to turn it over, and it flips in 3D to the
// writing side with the email field. Like Enterprise's, it sends into TribeTravel as an enquiry marked as a
// newsletter sign-up (until Tribe has a newsletter endpoint), so the agency can add the reader to its list.
import { useRef, useState } from "react";
import { ArrowLeft, RotateCw, Send, Sunrise } from "lucide-react";
import capetown from "@/assets/places/capetown-2.jpg";
import { useEnquiry } from "@/lib/enquiry";
import { BRAND, BotTrap } from "@/designs/shared";
import { Seatbelt } from "@/designs/window-seat/parts";
import { display, label, mono } from "@/designs/window-seat/theme";

export function Postcard() {
  const [flipped, setFlipped] = useState(false);
  const email = useRef<HTMLInputElement>(null);
  const turn = useRef<HTMLButtonElement>(null);
  const { status, onSubmit, sending } = useEnquiry(() => ({
    name: "Newsletter sign-up",
    message: "Newsletter sign-up from the postcard on the website.",
  }));

  function flip(to: boolean) {
    setFlipped(to);
    // Move focus to the side now facing up, once it has turned.
    window.setTimeout(() => (to ? email.current : turn.current)?.focus(), 450);
  }

  const posted = status.kind === "sent";

  return (
    <div className="ws-card3d w-full max-w-[560px]">
      <div className={`ws-card3d-inner grid ${flipped ? "ws-flipped" : ""}`}>
        {/* The picture side */}
        <div className="ws-face relative min-h-[340px] overflow-hidden rounded-[20px] bg-[#1C2340] shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)] [grid-area:1/1]" inert={flipped}>
          <img src={capetown} alt="Cape Town from the air" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C2340]/85 via-[#1C2340]/25 to-transparent" />
          <span aria-hidden="true" className="absolute top-4 right-4 flex h-16 w-14 rotate-3 items-center justify-center border-2 border-dashed border-white/80 bg-[#FFC857] text-[#1C2340] shadow">
            <Sunrise className="h-7 w-7" />
          </span>
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6">
            <span className={`${label} text-white/85`}>The trip letter · once a month</span>
            <p className={`${display} text-[clamp(28px,4vw,40px)] leading-[1.02] text-white italic`}>Greetings from wherever's next.</p>
            <button ref={turn} type="button" onClick={() => flip(true)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#FFC857] px-5 text-[15px] font-semibold text-[#1C2340] transition hover:-translate-y-0.5">
              <RotateCw className="h-4 w-4" /> Turn over to sign up
            </button>
          </div>
        </div>

        {/* The writing side */}
        <div className="ws-face ws-back relative grid min-h-[340px] gap-5 rounded-[20px] bg-[#FFFBF2] p-5 text-[#1C2340] shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)] [grid-area:1/1] sm:grid-cols-[1fr_1.1fr] sm:p-6" inert={!flipped}>
          <div className="flex flex-col gap-3 sm:border-r sm:border-[#1C2340]/15 sm:pr-5">
            <p className={`${display} text-2xl leading-tight italic`}>Dear traveller,</p>
            <p className="text-[15px] leading-relaxed text-[#4A5068]">Ideas, specials and travel news from {BRAND.name}, once a month. No spam, and you can unsubscribe any time.</p>
            <button type="button" onClick={() => flip(false)} className="mt-auto flex min-h-11 items-center gap-2 self-start text-sm font-semibold underline underline-offset-4">
              <ArrowLeft className="h-4 w-4" /> Turn back
            </button>
          </div>
          {posted ? (
            <div role="status" className="relative flex flex-col items-start justify-center gap-3">
              <span aria-hidden="true" className={`ws-stamp ${mono} flex h-24 w-24 items-center justify-center rounded-full border-4 border-double border-[#C2410C] text-center text-xs leading-tight font-medium text-[#C2410C] uppercase`}>
                Posted<br />{BRAND.short}
              </span>
              <p className="text-lg font-semibold">You're on the list.</p>
              <p className="text-[15px] text-[#4A5068]">Look out for our next trip letter in your inbox.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <span aria-hidden="true" className="flex h-14 w-12 items-center justify-center self-end border-2 border-dashed border-[#1C2340]/30 text-[10px] text-[#1C2340]/50">STAMP</span>
              <label className="flex flex-col gap-1">
                <span className={`${label} text-[#1C2340]/65`}>Your email address</span>
                <input ref={email} name="email" type="email" required autoComplete="email" placeholder="you@example.com"
                  className="min-h-11 w-full border-0 border-b-2 border-[#1C2340]/20 bg-transparent p-0 text-[17px] font-semibold outline-none placeholder:font-normal placeholder:text-[#4A5068]/60 focus:border-[#C2410C]" />
              </label>
              <Seatbelt />
              <BotTrap />
              <button type="submit" disabled={sending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1C2340] px-5 font-semibold text-[#FFF7EC] disabled:opacity-60">
                {sending ? "Posting…" : "Post it"} <Send className="h-4 w-4" />
              </button>
              {status.kind === "error" && <p role="alert" className="text-sm font-semibold text-[#B42318]">{status.message}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
