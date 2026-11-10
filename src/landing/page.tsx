// The landing page of travelsite.aifundi.io (the demo agency's home page, routes/index.tsx): AiFundi's website packages
// for travel agencies, in AiFundi's own colours, logo and fonts (aifundi.io: navy, teal, cyan and coral; Manrope and DM
// Sans). Each package has a small picture of its sample design, its price and what is included. Prices and words come
// from the price book (src/pricing/data.ts), so this page and /packages always agree.
import { ArrowRight, ArrowUpRight, Check, MessageCircle, Sparkles } from "lucide-react";
import { AI_TOKENS, CARE_PLANS, PACKAGES, PLAN_MONTHS, instalment, rand, type Package } from "@/pricing/data";

export { LANDING_FONTS } from "@/landing/header";
import { AifundiHeader, BROWSE } from "@/landing/header";

// aifundi.io's colours, written in the classes below: navy #0A3D52, deep navy #062C3C, teal #0F6F8B, cyan #32BFD0,
// coral #FF6B5C, ink #102E3B, muted #59717C, mist #EFF7F8, line #D9E7E9.

const body = "font-['DM_Sans','Segoe_UI',Arial,sans-serif]";
const head = "font-['Manrope','Segoe_UI',Arial,sans-serif]";
const wrap = "mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-10";
const kicker = `${head} text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#0F6F8B]`;
const h2 = `${head} text-[clamp(30px,4vw,48px)] font-extrabold leading-[1.06] tracking-[-0.03em] text-[#0A3D52] [text-wrap:balance]`;
const btn = `${head} inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold transition`;

/** What every package comes with, whichever one an agency chooses. */
const ALWAYS = [
  "AI Concierge on every page",
  "Every enquiry into your Tribe inbox",
  "Live supplier pricing, bookable online",
  "Change your own content in Tribe",
];

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(50,191,208,.18),transparent_65%)]" />
      <div className={`${wrap} relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24`}>
        <div className="flex flex-col gap-6">
          <p className={`${kicker} flex items-center gap-2`}><span className="h-2 w-2 rounded-full bg-[#FF6B5C]" aria-hidden="true" />Websites for travel agencies</p>
          <h1 className={`${head} text-[clamp(40px,6vw,72px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#0A3D52] [text-wrap:balance]`}>
            A website that answers, quotes and <em className="not-italic text-[#0F6F8B]">sends every lead to Tribe.</em>
          </h1>
          <p className="max-w-[54ch] text-[18px] leading-relaxed text-[#59717C]">
            We build and host websites for travel agencies on TribeTravel. Keep the site you have and connect it to Tribe,
            or start fresh with one of our designs. Every package comes with an AI Concierge that talks to your visitors,
            shows live prices and passes the enquiry straight to your team.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#packages" className={`${btn} bg-[#FF6B5C] text-white shadow-[0_12px_28px_-12px_rgba(255,107,92,.8)] hover:bg-[#f2564a]`}>
              See the packages <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href={BROWSE} className={`${btn} border border-[#D9E7E9] bg-white text-[#0A3D52] hover:border-[#0F6F8B] hover:text-[#0F6F8B]`}>
              Browse all 13 designs
            </a>
          </div>
          <ul className="grid gap-x-6 gap-y-2 pt-2 text-[14px] font-medium text-[#102E3B] sm:grid-cols-2">
            {ALWAYS.map((a) => (
              <li key={a} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EFF7F8] text-[#0F6F8B]"><Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /></span>
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* A sample site in a browser frame, with what Tribe adds to it */}
        <div className="relative mx-auto w-full max-w-[560px] lg:mr-0">
          <div className="overflow-hidden rounded-2xl border border-[#D9E7E9] bg-white shadow-[0_28px_80px_rgba(6,44,60,.18)]">
            <div className="flex items-center gap-1.5 border-b border-[#D9E7E9] bg-[#EFF7F8] px-4 py-3" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B5C]" /><span className="h-2.5 w-2.5 rounded-full bg-[#32BFD0]" /><span className="h-2.5 w-2.5 rounded-full bg-[#0F6F8B]" />
              <span className="ml-3 truncate rounded-full bg-white px-3 py-1 text-[11px] text-[#59717C]">youragency.co.za</span>
            </div>
            <img src="/images/landing/new.jpg" alt="The Meridian design: a travel agency home page with a lakeside villa" width={1280} height={800} className="block aspect-[16/10] w-full object-cover object-top" />
          </div>
          <div className="absolute -left-3 top-[38%] flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-[13px] font-bold text-[#0A3D52] shadow-[0_18px_40px_-16px_rgba(6,44,60,.45)] sm:-left-8">
            <Sparkles className="h-4 w-4 text-[#FF6B5C]" aria-hidden="true" /> AI Concierge: "Zanzibar in March for 4?"
          </div>
          <div className="absolute -bottom-5 right-3 flex items-center gap-2 rounded-2xl bg-[#0A3D52] px-4 py-3 text-[13px] font-bold text-white shadow-[0_18px_40px_-16px_rgba(6,44,60,.6)] sm:-right-6">
            <MessageCircle className="h-4 w-4 text-[#32BFD0]" aria-hidden="true" /> New enquiry in Tribe
          </div>
        </div>
      </div>
    </section>
  );
}

function PackageCard({ p }: { p: Package }) {
  return (
    <article className={`group flex flex-col overflow-hidden rounded-3xl border bg-white transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(6,44,60,.45)] ${p.popular ? "border-[#0F6F8B] ring-1 ring-[#0F6F8B]" : "border-[#D9E7E9]"}`}>
      <a href={p.href} className="relative block overflow-hidden bg-[#EFF7F8]" tabIndex={-1} aria-hidden="true">
        <img src={p.image} alt="" width={1280} height={800} loading="lazy" className="block aspect-[16/9] w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]" />
        {p.popular && <span className={`${head} absolute left-4 top-4 rounded-full bg-[#FF6B5C] px-3 py-1 text-[11px] font-extrabold tracking-[0.1em] text-white`}>MOST POPULAR</span>}
        {p.id === "move" && <span className={`${head} absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-extrabold tracking-[0.08em] text-[#0A3D52]`}>KEEPS YOUR CURRENT SITE</span>}
      </a>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className={`${head} text-[21px] font-extrabold tracking-[-0.02em] text-[#0A3D52]`}>{p.name}</h3>
          <p className="mt-1 text-[14px] font-medium text-[#0F6F8B]">{p.tagline}</p>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          {p.from && <span className="text-[13px] font-semibold text-[#59717C]">from</span>}
          <span className={`${head} text-[32px] font-extrabold leading-none tracking-[-0.03em] text-[#102E3B]`}>{rand(p.tribe)}</span>
          <span className="text-[13px] font-semibold text-[#59717C]">once-off</span>
        </div>
        <p className="-mt-2 rounded-xl bg-[#EFF7F8] px-3 py-2 text-[13px] font-semibold text-[#0A3D52]">
          or {p.from ? "from " : ""}{rand(instalment(p.tribe))}/month over {PLAN_MONTHS} months
        </p>
        <p className="-mt-2 text-[13px] text-[#59717C]">
          + {rand(AI_TOKENS.monthly)}/month AI tokens{p.monthly ? ` · ${rand(p.monthly)}/month features` : ""} · care plan from {rand(CARE_PLANS[0]!.monthly)}/month
        </p>
        <p className="text-[15px] leading-relaxed text-[#102E3B]">{p.summary}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#D9E7E9] pt-4">
          <a href={`/packages`} className={`${head} inline-flex min-h-11 items-center gap-1.5 text-[14px] font-bold text-[#0A3D52] hover:text-[#0F6F8B]`}>
            Price it <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href={p.href} className={`${head} inline-flex min-h-11 items-center gap-1.5 text-[14px] font-bold text-[#0F6F8B] hover:text-[#0A3D52]`}>
            {p.id === "move" ? "See the Concierge working" : p.id === "new" ? "Choose a design" : `See the ${p.design} design`} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

function Packages() {
  return (
    <section id="packages" className="scroll-mt-20 bg-[#EFF7F8] py-20 sm:py-24">
      <div className={`${wrap} flex flex-col gap-12`}>
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div className="flex flex-col gap-3">
            <p className={kicker}>Our packages</p>
            <h2 className={h2}>Five ways to get your agency online with Tribe.</h2>
          </div>
          <div className="flex flex-col gap-3 text-[16px] leading-relaxed text-[#59717C]">
            <p>
              <b className="text-[#102E3B]">Move to Tribe</b> keeps the website you already have and connects it: the AI Concierge, enquiries
              and live pricing all run through Tribe, and you change your content there. <b className="text-[#102E3B]">New Website</b> builds
              you a fresh six-page site. <b className="text-[#102E3B]">Pro</b>, <b className="text-[#102E3B]">Business Platform</b> and
              {" "}<b className="text-[#102E3B]">Enterprise</b> add bookings, automation and, at the top, online payments and a client login.
            </p>
            <p className="text-[13px]">Prices are for agencies on a paid TribeTravel subscription and are once-off: pay 50% to start and 50% at go-live, or spread it over 12 monthly payments.</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PACKAGES.map((p) => <PackageCard key={p.id} p={p} />)}
          <a href="/packages" className="flex flex-col justify-between gap-6 rounded-3xl bg-[#0A3D52] p-8 text-white transition hover:bg-[#062C3C]">
            <div className="flex flex-col gap-3">
              <p className={`${head} text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#32BFD0]`}>Compare and price</p>
              <p className={`${head} text-[26px] font-extrabold leading-tight tracking-[-0.02em]`}>See every feature side by side and build your own quote.</p>
              <p className="text-[15px] text-[#C7DDE2]">Add pages, supplier feeds, WhatsApp updates and more, choose a care plan and send it to us for an official quote.</p>
            </div>
            <span className={`${btn} self-start bg-[#FF6B5C] text-white`}>Open the quote builder <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </a>
        </div>
      </div>
    </section>
  );
}

function Tokens() {
  const million = (n: number) => `${n / 1_000_000} million`;
  return (
    <section id="ai-tokens" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className={`${wrap} grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center`}>
        <div className="flex flex-col gap-4">
          <p className={kicker}>The AI Concierge</p>
          <h2 className={h2}>Included in every package, with a monthly cap you control.</h2>
          <p className="text-[16px] leading-relaxed text-[#59717C]">
            The concierge runs on AI that is paid for by the word, called tokens. A flat monthly fee covers a generous
            allowance. If a busy month uses it all, you choose: top up at a set price, or the concierge hands visitors over
            to your enquiry form until the next month. There are never surprise bills.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { big: `${rand(AI_TOKENS.monthly)}`, small: "a month", text: `Includes ${million(AI_TOKENS.included)} AI tokens, about ${AI_TOKENS.chats} visitor chats.` },
            { big: `${rand(AI_TOKENS.topUp)}`, small: `per ${million(AI_TOKENS.topUpTokens)}`, text: "Extra tokens, only in a month that goes over, and only if you allow it." },
            { big: "Capped", small: "by you", text: "No top-ups allowed? The concierge passes visitors to your enquiry form instead." },
          ].map((t, i) => (
            <div key={t.big} className={`flex flex-col gap-2 rounded-3xl p-6 ${i === 0 ? "bg-[#0A3D52] text-white" : "border border-[#D9E7E9] bg-[#EFF7F8] text-[#102E3B]"}`}>
              <span className={`${head} text-[30px] font-extrabold leading-none tracking-[-0.03em] ${i === 0 ? "text-white" : "text-[#0A3D52]"}`}>{t.big}</span>
              <span className={`text-[13px] font-semibold ${i === 0 ? "text-[#32BFD0]" : "text-[#0F6F8B]"}`}>{t.small}</span>
              <p className={`text-[14px] leading-snug ${i === 0 ? "text-[#C7DDE2]" : "text-[#59717C]"}`}>{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Care() {
  return (
    <section className="border-t border-[#D9E7E9] bg-white pb-20 pt-16 sm:pb-24">
      <div className={`${wrap} flex flex-col gap-10`}>
        <div className="flex max-w-[60ch] flex-col gap-3">
          <p className={kicker}>Care plans</p>
          <h2 className={h2}>We host it, back it up and keep it safe.</h2>
          <p className="text-[16px] text-[#59717C]">Every site takes one care plan. The AI tokens above are added to whichever plan you choose.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {CARE_PLANS.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 rounded-3xl border border-[#D9E7E9] p-6">
              <h3 className={`${head} text-[18px] font-extrabold text-[#0A3D52]`}>{c.name}</h3>
              <p><span className={`${head} text-[28px] font-extrabold tracking-[-0.03em] text-[#102E3B]`}>{rand(c.monthly)}</span><span className="text-[13px] font-semibold text-[#59717C]">/month</span></p>
              <p className="text-[14px] leading-snug text-[#59717C]">{c.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#062C3C] text-[#C7DDE2]">
      <div className={`${wrap} flex flex-col gap-10 py-16`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className={`${head} max-w-[18ch] text-[clamp(30px,4vw,46px)] font-extrabold leading-[1.06] tracking-[-0.03em] text-white`}>
            Ready to see what your site would cost?
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="/packages" className={`${btn} bg-[#FF6B5C] text-white hover:bg-[#f2564a]`}>Build my quote <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
            <a href="https://aifundi.io" className={`${btn} border border-white/25 text-white hover:border-[#32BFD0] hover:text-[#32BFD0]`}>About AiFundi <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-3"><img src="/images/landing/mark.svg" alt="" width={28} height={28} />Websites for TribeTravel agencies, built and hosted by AIFUNDI. All prices in rand.</span>
          <a href="https://tribetravel.io" className="hover:text-white">TribeTravel.io ↗</a>
        </div>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className={`${body} min-h-screen bg-white text-[#102E3B] [color-scheme:light]`}>
      <AifundiHeader current="/" sticky />
      <main>
        <Hero />
        <Packages />
        <Tokens />
        <Care />
      </main>
      <Footer />
    </div>
  );
}
