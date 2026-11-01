// WhatsApp and email notifications (Tribe Site Pro): a phone drawn in the margin of the map, with updates arriving
// one after another: the quote, the seats held, the deposit reminder, the documents and the "you fly soon" message.
// Example messages, labelled. The prerendered page shows them all; in the browser they arrive in turn, and start again
// while the phone is on screen. With reduced motion they simply sit there.
import { useEffect, useRef, useState } from "react";
import { Check, Mail } from "lucide-react";
import { BRAND, WhatsAppIcon } from "@/designs/shared";
import { MESSAGES } from "@/designs/living-map/content";
import { Example, SectionHead } from "@/designs/living-map/parts";
import { accent, gutter, hand, soft } from "@/designs/living-map/theme";

const GAP = 1.6;                                   // seconds between messages
const CYCLE = MESSAGES.length * GAP + 5;           // then a pause before they arrive again

function Phone() {
  const ref = useRef<HTMLDivElement>(null);
  const [round, setRound] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(timer);
      if (e?.isIntersecting) {
        setRound((r) => r + 1);
        timer = window.setInterval(() => setRound((r) => r + 1), CYCLE * 1000);
      }
    }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); window.clearInterval(timer); };
  }, []);

  return (
    <div ref={ref} className="relative mx-auto w-[min(300px,82vw)] rotate-2">
      <div className="relative rounded-[42px] border-[3px] border-(--lm-ink) bg-(--lm-ink) p-2.5 shadow-[0_40px_70px_-30px_var(--lm-shadow)]">
        <div className="relative flex h-[560px] flex-col overflow-hidden rounded-[32px] bg-[#ECE5DD] text-[#1F2C34]">
          <div className="flex items-center gap-3 bg-[#075E54] px-4 pt-7 pb-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold">ST</span>
            <span className="flex flex-col leading-tight">
              <b className="text-sm">{BRAND.name}</b>
              <span className="text-[11px] text-white/80">WhatsApp & email updates</span>
            </span>
          </div>
          <div key={round} className="flex flex-1 flex-col justify-end gap-2.5 p-3" aria-label="Example messages">
            {MESSAGES.map((m, i) => (
              <div key={i} className="lm-msg" style={{ animationDelay: `${round ? i * GAP : 0}s` }}>
                {m.channel === "whatsapp" ? (
                  <p className="max-w-[92%] rounded-xl rounded-tl-sm bg-white px-3 py-2 text-[13px] leading-snug shadow-sm">
                    <span className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold text-[#128C7E]"><WhatsAppIcon className="h-3 w-3" /> WhatsApp</span>
                    {m.text}
                    <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#667781]">{m.time} <Check className="h-3 w-3 text-[#34B7F1]" /></span>
                  </p>
                ) : (
                  <p className="ml-auto max-w-[92%] rounded-xl border border-[#1F2C34]/10 bg-[#FFFDF7] px-3 py-2 text-[13px] leading-snug shadow-sm">
                    <span className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold text-[#9E2A1E]"><Mail className="h-3 w-3" /> Email · {m.time}</span>
                    <b className="block">{m.title}</b>
                    <span className="text-[#41525D]">{m.text}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        <span aria-hidden="true" className="absolute top-4 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full bg-(--lm-ink)" />
      </div>
      <span className={`absolute -top-10 -left-6 -rotate-6 ${hand} text-2xl ${accent} max-sm:hidden`}>ping!</span>
    </div>
  );
}

export function Notifications() {
  return (
    <section data-pin className={`relative z-10 grid items-center gap-14 ${gutter} py-24 lg:grid-cols-[1fr_.9fr]`}>
      <div className="flex flex-col gap-6">
        <SectionHead kicker="WhatsApp & email · never miss a thing" title={<>Postcards from <em>your consultant.</em></>}
          intro="From the moment you ask, you hear from us where you already are: WhatsApp for the quick things, email for the paperwork. Your quote, your seats, your deposit and your documents, each on time." />
        <ul className="flex flex-col gap-3 text-[15px]">
          {["Your quote is ready, with a link to view it", "Seats held, and when the hold runs out", "A friendly nudge before a payment is due", "Documents and flight times before you go"].map((x) => (
            <li key={x} className="flex items-start gap-3"><Check className={`mt-1 h-4 w-4 flex-none ${accent}`} />{x}</li>
          ))}
        </ul>
        <p className={`flex flex-wrap items-center gap-2 text-sm ${soft}`}><Example>Example messages</Example> Sent automatically by TribeTravel, in the agency's name.</p>
      </div>
      <Phone />
    </section>
  );
}
