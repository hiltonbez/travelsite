// The Packages & pricing page (/packages, linked from the gallery bar): every package's features and price, a quote
// builder and the request form. TribeTravel prices are for paying subscribers; everyone else sees the higher price.
import { useState } from "react";
import { ArrowDown, BadgeCheck, Info } from "lucide-react";
import { PACKAGES, rand, type PackageId } from "@/pricing/data";
import { Builder } from "@/pricing/builder";
import { Matrix } from "@/pricing/matrix";
import { START, type Choice } from "@/pricing/quote";
import { RequestForm } from "@/pricing/request";
import { font, ghost, gutter, muted, wrap } from "@/pricing/theme";

/** "On TribeTravel" or not: switches every price on the page. */
function TribeSwitch({ tribe, onChange }: { tribe: boolean; onChange: (v: boolean) => void }) {
  return (
    <div role="radiogroup" aria-label="Are you on TribeTravel?" className="inline-flex rounded-full bg-white/10 p-1 ring-1 ring-white/20">
      {[[true, "I'm on TribeTravel"], [false, "I'm not on TribeTravel"]].map(([v, text]) => (
        <button key={String(v)} type="button" role="radio" aria-checked={tribe === v} onClick={() => onChange(v as boolean)}
          className={`min-h-11 rounded-full px-4 text-[14px] font-bold transition sm:px-5 ${tribe === v ? "bg-white text-[#0B1D3A] shadow" : "text-white/80 hover:text-white"}`}>
          {text as string}
        </button>
      ))}
    </div>
  );
}

export function PricingPage() {
  const [choice, setChoice] = useState<Choice>(START);
  const pick = (pkg: PackageId) => {
    setChoice({ ...choice, pkg });
    document.getElementById("builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const site = PACKAGES.find((p) => p.id === "new")!;

  return (
    <div className={`${font} min-h-screen bg-[#F5F8FB] text-[#16233B] [color-scheme:light]`}>
      {/* Hero */}
      <header className={`relative overflow-hidden bg-[#0B1D3A] ${gutter} pt-14 pb-24 text-white sm:pt-20`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_100%_0%,rgba(0,181,200,.35),transparent_70%),radial-gradient(50%_70%_at_0%_100%,rgba(30,111,230,.45),transparent_70%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full border-[40px] border-[#8FE3C3]/10 d-spin" />
        <div className={`${wrap} relative flex flex-col gap-6`}>
          <span className="flex items-center gap-2 text-[13px] font-bold text-[#8FE3C3]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00B5C8,#1E6FE6)] text-[13px]">✈</span>TribeTravel Websites</span>
          <h1 className="max-w-[16ch] text-[clamp(38px,6vw,72px)] font-extrabold leading-[1.02] tracking-[-0.03em] [text-wrap:balance]">
            Packages and <span className="bg-[linear-gradient(90deg,#8FE3C3,#00B5C8)] bg-clip-text text-transparent">pricing.</span>
          </h1>
          <p className="max-w-[58ch] text-[17px] leading-relaxed text-[#C9D6EA]">
            Five website packages, from connecting the site you already have to Tribe, to a full platform. Every one includes the AI Concierge. Compare what's included, build your quote, and send it to us for an official quote.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <TribeSwitch tribe={choice.tribe} onChange={(tribe) => setChoice({ ...choice, tribe })} />
            <a href="#builder" className="inline-flex min-h-11 items-center gap-2 text-[14px] font-bold text-white hover:text-[#8FE3C3]">Jump to the quote builder <ArrowDown className="h-4 w-4" /></a>
          </div>
        </div>
      </header>

      {/* Who the prices are for */}
      <div className={`${gutter} -mt-12 relative`}>
        <div className={`${wrap} grid gap-4 rounded-3xl bg-white p-5 shadow-[0_24px_60px_-30px_rgba(11,29,58,.4)] ring-1 ring-[#E4E9F1] sm:grid-cols-[auto_1fr] sm:items-center sm:p-6`}>
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${choice.tribe ? "bg-[#E4F8F4] text-[#0a7a52]" : "bg-[#FFF1F1] text-[#E8493F]"}`}>
            {choice.tribe ? <BadgeCheck className="h-6 w-6" /> : <Info className="h-6 w-6" />}
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-extrabold text-[#0B1D3A]">
              {choice.tribe ? "These prices are only for agencies on a paid TribeTravel subscription." : "You're seeing the price for agencies not on TribeTravel."}
            </p>
            <p className={`text-[14px] ${muted}`}>
              {choice.tribe
                ? <>Agencies outside TribeTravel pay more, because TribeTravel's CRM, quotes, supplier connections and AI do much of the work behind each site. A New Website, for example, is {rand(site.tribe)} on TribeTravel and {rand(site.other)} without it. Every site also takes a monthly care plan, plus R300 a month for the AI Concierge's tokens.</>
                : <>Join TribeTravel and every package costs less: a New Website is {rand(site.tribe)} instead of {rand(site.other)}. Every site also takes a monthly care plan, plus R300 a month for the AI Concierge's tokens.</>}
            </p>
          </div>
        </div>
      </div>

      <main className={`${gutter} flex flex-col gap-24 py-20`}>
        <Matrix tribe={choice.tribe} onPick={pick} />
        <Builder choice={choice} setChoice={setChoice} />
        <RequestForm choice={choice} setChoice={setChoice} />
      </main>

      <footer className={`${gutter} border-t border-[#E4E9F1] bg-white py-8`}>
        <div className={`${wrap} flex flex-col gap-3 text-[13px] sm:flex-row sm:items-center sm:justify-between ${muted}`}>
          <span>TribeTravel Websites, built and hosted by AiFundi. All prices in rand; once-off prices are 50% to start and 50% at go-live, or 12 monthly payments (the price over 12 months, rounded up).</span>
          <a href="/designs/studio" className={`${ghost} min-h-10 px-5 text-[13px]`}>Browse all designs</a>
        </div>
      </footer>
    </div>
  );
}
