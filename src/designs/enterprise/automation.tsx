// Stop 4: what happens after an enquiry, as waypoints that light up as the plane passes.
import { useRef } from "react";
import { Bell, CalendarClock, CreditCard, Eye, FileText, MessageCircle, UserPlus } from "lucide-react";
import { useOnScroll } from "@/designs/flight-path";
import { StopLabel } from "@/designs/enterprise/parts";
import { btn, display, ghost, gutter, h2, input, label, mono, orange, panel, soft } from "@/designs/enterprise/theme";

const FLOW = [
  { icon: MessageCircle, title: "You enquire", text: "On the website, in the AI chat, or on WhatsApp." },
  { icon: UserPlus, title: "Client created", text: "TribeTravel files you as a client with your trip brief. No retyping." },
  { icon: FileText, title: "Draft quote", text: "A complete brief becomes a draft quote, built from live supplier rates." },
  { icon: Bell, title: "Consultant alerted", text: "Your consultant checks it, prices it and sends it, usually the same day." },
  { icon: Eye, title: "Quote tracked", text: "Tribe sees when you open it, and reminds your consultant if it goes quiet." },
  { icon: CreditCard, title: "Accept and pay", text: "Accept online, then pay the invoice by card or EFT. It's posted to the books." },
  { icon: CalendarClock, title: "Ready to go", text: "Documents, reminders before you fly, and help while you travel." },
];

export function Automation() {
  // Each waypoint lights up as it passes the lower part of the screen, one after the other.
  const list = useRef<HTMLOListElement>(null);
  useOnScroll((_, reduced) => {
    list.current?.querySelectorAll<HTMLElement>("li").forEach((li, i) => {
      const lit = reduced || li.getBoundingClientRect().top < window.innerHeight * (0.9 - i * 0.04);
      li.dataset["lit"] = String(lit);
    });
  });

  return (
    <section data-stop className={`relative z-10 flex flex-col gap-14 ${gutter} py-24 md:py-28`}>
      <div className="flex max-w-[760px] flex-col gap-4">
        <StopLabel>Stop 4 · What happens next</StopLabel>
        <h2 className={h2}>One message. <span className={orange}>The rest flies itself.</span></h2>
        <p className={`text-lg leading-relaxed ${soft}`}>Every enquiry runs through TribeTravel, our travel system, so nothing gets lost between your first message and your flight home.</p>
      </div>
      <ol ref={list} className="relative grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-7">
        <span aria-hidden="true" className="absolute top-7 right-0 left-0 hidden border-t-2 border-dashed border-[#EDE6D8]/15 lg:block" />
        {FLOW.map(({ icon: Icon, title, text }, i) => (
          <li key={title} data-lit="false" className="group relative flex flex-col gap-3">
            <span className="flex items-center gap-3">
              <span className={`flex h-14 w-14 flex-none items-center justify-center rounded-full border-2 border-[#EDE6D8]/30 bg-[#0B1424] transition duration-500 group-data-[lit=true]:border-[#FF6A2E] group-data-[lit=true]:bg-[#FF6A2E] group-data-[lit=true]:text-[#0B1424]`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className={`${mono} text-sm ${soft} transition group-data-[lit=true]:text-[#FF6A2E]`}>WP{i + 1}</span>
            </span>
            <b className="text-[15px]">{title}</b>
            <span className={`text-sm leading-relaxed ${soft}`}>{text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
