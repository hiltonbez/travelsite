// The Window Seat site's pages beside the home page (home.tsx): destinations, about, the quote (the boarding pass),
// contact and privacy. Six pages in all, the Tribe Site limit. Each is prerendered on its own (scripts/snapshot.mjs).
import type { ReactNode } from "react";
import { ArrowRight, Clock, Mail, Phone, Plane, Sun } from "lucide-react";
import kruger from "@/assets/places/kruger-2.jpg";
import mauritius from "@/assets/places/mauritius-3.jpg";
import santorini from "@/assets/places/santorini-1.jpg";
import zanzibar from "@/assets/places/zanzibar-2.jpg";
import falls from "@/assets/places/falls-1.jpg";
import { useEnquiry } from "@/lib/enquiry";
import { DESTINATIONS } from "@/designs/enterprise/content";
import { BRAND, BotTrap, FormStatus, WhatsAppIcon, contact, mailto, tel } from "@/designs/shared";
import { BoardingPass } from "@/designs/window-seat/boarding-pass";
import { FlightLog } from "@/designs/window-seat/flight-log";
import { PageTitle, WindowSeatLayout } from "@/designs/window-seat/layout";
import { Seatbelt, SectionLabel } from "@/designs/window-seat/parts";
import { Porthole, Scene } from "@/designs/window-seat/sky";
import { BASE, QUOTE, btn, card, coral, display, gutter, h2, input, label, mono, quoteTo, soft, sunBtn } from "@/designs/window-seat/theme";

// ------------------------------------------------------------------ destinations
export function DestinationsPage() {
  return (
    <WindowSeatLayout current={`${BASE}/destinations`}>
      <PageTitle crumb="Destinations" photo={zanzibar} alt="Zanzibar from above"
        title={<>Where would you <em className={`font-medium italic ${coral}`}>like to land?</em></>}
        intro="Six places our clients love, from a long weekend in the bush to the Greek islands. Every trip is tailor-made: tell us what you like and we'll build it around you." />
      <div className={`flex flex-col gap-24 ${gutter} pb-24`}>
        {DESTINATIONS.map((d, i) => (
          <article key={d.slug} id={d.slug} className="ws-reveal grid scroll-mt-24 items-center gap-10 md:grid-cols-[.8fr_1.2fr]">
            <div className={`flex items-end justify-center gap-4 ${i % 2 ? "md:order-2" : ""}`}>
              <Porthole shade="reveal" className="aspect-[3/4] w-[min(64vw,300px)]">
                <Scene img={d.photos[0]} alt={d.name} className="h-full" />
              </Porthole>
              <Porthole clouds={false} className="mb-4 hidden aspect-[3/4] w-[110px] sm:block">
                <img src={d.photos[1]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              </Porthole>
            </div>
            <div className="flex flex-col items-start gap-4">
              <span className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${label} ${soft}`}>
                <span className="flex items-center gap-1.5 rounded-full bg-[#1C2340] px-3 py-1.5 text-[#FFF7EC]"><Plane className="h-3.5 w-3.5" aria-hidden="true" /> JNB → {d.code}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> {d.flight}</span>
                <span>{d.region}</span>
              </span>
              <h2 className={`${display} text-[clamp(34px,4.4vw,56px)] leading-[1.02]`}>{d.name}</h2>
              <p className={`${display} text-xl font-medium italic ${coral}`}>{d.tagline}</p>
              <p className={`max-w-[58ch] text-lg leading-relaxed ${soft}`}>{d.intro}</p>
              <p className="flex items-start gap-2 text-[15px]"><Sun className={`mt-0.5 h-4 w-4 flex-none ${coral}`} aria-hidden="true" /><span><b>Best time to go:</b> {d.bestTime}</span></p>
              <ul className="flex flex-wrap gap-2" aria-label="Good for">
                {d.goodFor.map((g) => <li key={g} className="rounded-full bg-[#FFFBF5] px-3 py-1.5 text-sm ring-1 ring-[#1C2340]/10">{g}</li>)}
              </ul>
              <a href={quoteTo(d.slug)} className={`${btn} mt-2`}>Plan my {d.name} trip <ArrowRight className="h-4 w-4" /></a>
            </div>
          </article>
        ))}
      </div>
      <CallToAction />
    </WindowSeatLayout>
  );
}

/** "Not sure where yet?" with the way to the quote page. */
function CallToAction() {
  return (
    <section className={`${gutter} pb-24`}>
      <div className={`ws-reveal flex flex-col items-start gap-5 p-8 md:flex-row md:items-center md:justify-between md:p-10 ${card}`}>
        <div className="flex flex-col gap-2">
          <h2 className={`${display} text-[clamp(28px,3.4vw,40px)] leading-tight`}>Not sure where yet?</h2>
          <p className={`max-w-[52ch] ${soft}`}>Tell us when you can travel and what you love. We'll suggest a few places and quote them in rand.</p>
        </div>
        <a href={QUOTE} className={`${sunBtn} min-h-14 px-7`}>Get a quote <ArrowRight className="h-4 w-4" /></a>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ about
const CREW: [string, string, string][] = [
  ["Thandi Mokoena", "Islands & honeymoons", "Has stayed at nine of Mauritius's resorts, so you don't have to guess."],
  ["Pieter van der Berg", "Safari & self-drive", "Fifteen years planning trips into the Kruger and Botswana."],
  ["Aisha Khan", "Europe & cruises", "Knows the Schengen visa process inside out."],
];

export function AboutPage() {
  return (
    <WindowSeatLayout current={`${BASE}/about`}>
      <PageTitle crumb="About us" photo={kruger} alt="A safari vehicle in the Kruger"
        title={<>Real people, <em className={`font-medium italic ${coral}`}>in the seat next to yours.</em></>}
        intro={`${BRAND.name} is a small South African agency planning holidays for business or pleasure. We find the trips that suit you best, at the best possible price, and stay with you until you're home.`} />

      <section className={`grid gap-12 ${gutter} pb-20 lg:grid-cols-[1.1fr_.9fr]`}>
        <div className="ws-reveal flex flex-col gap-5">
          <SectionLabel>Our story</SectionLabel>
          <h2 className={`${h2} max-w-[14ch]`}>Every trip, planned by a person.</h2>
          <p className={`max-w-[58ch] text-lg leading-relaxed ${soft}`}>
            We started {BRAND.name} because booking a holiday had become a maze of tabs and pop-ups. You tell us how you want to feel, and we do the rest: flights, hotels, transfers and the small things that make a trip.
          </p>
          <p className={`max-w-[58ch] text-lg leading-relaxed ${soft}`}>
            Every quote is priced in rand by someone who knows the place, and you can reach us on WhatsApp the whole time you're away.
          </p>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer" className={`${btn} mt-2 self-start`}><WhatsAppIcon className="h-5 w-5" /> WhatsApp us</a>
        </div>
        <FlightLog />
      </section>

      <section className={`flex flex-col gap-10 ${gutter} pb-24`}>
        <div className="ws-reveal flex flex-col gap-4">
          <SectionLabel>Your crew</SectionLabel>
          <h2 className={h2}>Meet the team.</h2>
        </div>
        <ul className="grid gap-6 md:grid-cols-3">
          {CREW.map(([name, role, line], i) => (
            <li key={name} className={`ws-reveal flex flex-col gap-3 p-6 ${card}`} style={{ transitionDelay: `${i * 110}ms` }}>
              {/* A crew badge */}
              <span aria-hidden="true" className={`flex h-16 w-16 items-center justify-center rounded-full bg-[#FFC857] ${display} text-xl ring-4 ring-[#FFF7EC]`}>
                {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <h3 className={`${display} text-2xl`}>{name}</h3>
              <span className={`${label} ${coral}`}>{role}</span>
              <p className={soft}>{line}</p>
            </li>
          ))}
        </ul>
        <p className={`text-xs ${soft}`}>Sample team for this demo site.</p>
      </section>
    </WindowSeatLayout>
  );
}

// ------------------------------------------------------------------ quote
export function QuotePage() {
  const next: [string, string][] = [
    ["We read it", "A consultant reads your boarding pass the same day."],
    ["We plan it", "We put together a few options that fit your dates and budget."],
    ["You choose", "You get your quote in rand, and we change it until it's right."],
  ];
  return (
    <WindowSeatLayout current={QUOTE}>
      <PageTitle crumb="Get a quote" photo={santorini} alt="Santorini's white houses above the sea"
        title={<>Your boarding pass <em className={`font-medium italic ${coral}`}>to a quote.</em></>}
        intro="Tell us where, when and who's coming. It takes a minute, and a real person comes back to you within a day." />
      <section className={`${gutter} pb-16`}>
        <div className="mx-auto max-w-[1080px]"><BoardingPass id="quote" /></div>
      </section>
      <section className={`${gutter} pb-24`}>
        <ol className="mx-auto grid max-w-[1080px] gap-5 md:grid-cols-3">
          {next.map(([t, x], i) => (
            <li key={t} className={`ws-reveal flex flex-col gap-2 p-6 ${card}`} style={{ transitionDelay: `${i * 110}ms` }}>
              <span className={`${mono} text-sm ${coral}`}>0{i + 1}</span>
              <h2 className={`${display} text-2xl`}>{t}</h2>
              <p className={soft}>{x}</p>
            </li>
          ))}
        </ol>
      </section>
    </WindowSeatLayout>
  );
}

// ------------------------------------------------------------------ contact
/** A message to the agency: name, email and a note. Sent as an enquiry. */
function NoteToCrew() {
  const { status, onSubmit, sending } = useEnquiry();
  if (status.kind === "sent") {
    return (
      <div role="status" className={`ws-pop flex flex-col gap-3 p-8 ${card}`}>
        <h2 className={`${display} text-3xl`}>Message received.</h2>
        <p className={soft}>Thanks! We'll reply soon, usually the same day.</p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-4 p-6 md:p-8 ${card}`}>
      <h2 className={`${display} text-3xl`}>Send us a note</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Your name<input name="name" required autoComplete="name" className={input} /></label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Email<input name="email" type="email" required autoComplete="email" className={input} /></label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Phone (optional)<input name="phone" type="tel" autoComplete="tel" className={input} /></label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Your message
        <textarea name="message" required rows={4} maxLength={2000} className={`${input} min-h-28 py-3`} />
      </label>
      <Seatbelt />
      <BotTrap />
      <button type="submit" disabled={sending} className={`${btn} self-start`}>{sending ? "Sending…" : "Send my note"}</button>
      <FormStatus status={status} className="text-[#B42318]" />
    </form>
  );
}

export function ContactPage() {
  const ways: [ReactNode, string, string, string, string][] = [
    [<WhatsAppIcon key="w" className="h-6 w-6" />, "WhatsApp", "Fastest for quick questions", contact.whatsapp, "Chat now"],
    [<Phone key="p" className="h-6 w-6" />, contact.phoneDisplay, "Mon to Fri 08:30 to 17:00, Sat 09:00 to 12:00", tel, "Call us"],
    [<Mail key="e" className="h-6 w-6" />, contact.email, "For documents and longer briefs", mailto, "Email us"],
  ];
  return (
    <WindowSeatLayout current={`${BASE}/contact`}>
      <PageTitle crumb="Contact" photo={falls} alt="Victoria Falls"
        title={<>Press the button, <em className={`font-medium italic ${coral}`}>we'll come.</em></>}
        intro="Send us a WhatsApp, call, email or a note below, or tap the call button in the corner to chat. A real person replies, usually the same day." />
      <section className={`grid gap-5 ${gutter} pb-16 md:grid-cols-3`}>
        {ways.map(([icon, title, line, href, cta], i) => (
          <a key={cta} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
            className={`ws-reveal group flex flex-col gap-3 p-6 transition hover:-translate-y-1 ${card}`} style={{ transitionDelay: `${i * 110}ms` }}>
            {/* An overhead-panel button */}
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFC857] text-[#1C2340] shadow-[0_0_0_6px_#F1EADF,0_0_24px_rgba(255,200,87,.7)]">{icon}</span>
            <b className="text-lg break-all">{title}</b>
            <span className={soft}>{line}</span>
            <span className={`mt-auto flex items-center gap-1 text-sm font-semibold ${coral}`}>{cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
          </a>
        ))}
      </section>
      <section className={`grid items-start gap-10 ${gutter} pb-24 lg:grid-cols-[1.2fr_.8fr]`}>
        <div className="ws-reveal min-w-0"><NoteToCrew /></div>
        <div className="ws-reveal flex flex-col items-center gap-5 text-center">
          <Porthole shade="reveal" className="aspect-[3/4] w-[min(60vw,260px)]">
            <Scene img={mauritius} alt="A lagoon in Mauritius" className="h-full" />
          </Porthole>
          <p className={`max-w-[34ch] ${soft}`}>Planning a trip? The boarding pass gets you a quote fastest.</p>
          <a href={QUOTE} className={sunBtn}>Get a quote <ArrowRight className="h-4 w-4" /></a>
        </div>
      </section>
    </WindowSeatLayout>
  );
}

// ------------------------------------------------------------------ privacy
export function PrivacyPage() {
  const sections: [string, string][] = [
    ["Who we are", `${BRAND.name} is the responsible party for personal information collected on this website. Contact our information officer at ${contact.email}.`],
    ["What we collect", "Your name, email address, phone number and trip details when you ask for a quote, send us a note, chat with us or sign up for our newsletter. If you allow it in the cookie notice, we also collect anonymous visit statistics."],
    ["Why we collect it", "To plan and quote your trip, to answer your questions and, if you signed up, to send our newsletter. We only use your details with your consent, which you give with the seatbelt tick box on each form."],
    ["Our chat", "The chat on this site is an AI assistant. It says so, it never confirms a price, and a consultant reads every request it passes on to us."],
    ["Cookies", "Essential cookies keep the site working. Statistics cookies are only used if you choose \"Allow statistics\", and you can change your mind by clearing this site's data in your browser."],
    ["Who we share it with", "Only the suppliers needed for your booking (airlines, hotels and tour operators) and our systems provider (TribeTravel). We never sell your details."],
    ["Your rights", "You can ask to see, correct or delete your information, or unsubscribe from the newsletter at any time. You can also complain to the Information Regulator."],
  ];
  return (
    <WindowSeatLayout current={`${BASE}/privacy`}>
      <PageTitle crumb="Privacy" photo={mauritius} alt="A quiet beach in Mauritius"
        title={<>Your privacy <em className={`font-medium italic ${coral}`}>(POPIA).</em></>}
        intro="How we collect, use and protect your personal information under the Protection of Personal Information Act." />
      <section className={`flex max-w-[860px] flex-col gap-8 ${gutter} pb-24`}>
        <p className={`rounded-2xl border-2 border-dashed border-[#C2410C]/40 bg-[#FFFBF5] p-4 text-sm ${soft}`}>Template wording for this sample site. Each agency's privacy page is checked against its own processes before going live.</p>
        {sections.map(([t, x]) => (
          <div key={t} className="flex flex-col gap-2">
            <h2 className={`${display} text-2xl`}>{t}</h2>
            <p className={`text-lg leading-relaxed ${soft}`}>{x}</p>
          </div>
        ))}
      </section>
    </WindowSeatLayout>
  );
}
