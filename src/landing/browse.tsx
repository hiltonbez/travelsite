// Browse designs (/designs/studio): every sample website on the demo site, in AiFundi's colours, logo and top menu. The
// ten Design Studio designs are the New Website package's choices; Living Map, Atlas and Enterprise show the bigger
// packages. Pictures are in public/images/landing/designs/, one per design, named after its path.
import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AifundiHeader, BROWSE } from "@/landing/header";
import { DESIGNS, type Design } from "@/lib/designs";
import { PACKAGES, instalment, rand, type Package } from "@/pricing/data";

const head = "font-['Manrope','Segoe_UI',Arial,sans-serif]";
const body = "font-['DM_Sans','Segoe_UI',Arial,sans-serif]";
const wrap = "mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-10";

const BIGGER = "Bigger packages";
const FILTERS = ["All", "Corporate", "Family", "Luxury", "Youth", "Classic", BIGGER];

/** The package a design belongs to: New Website for the ten Studio designs, else the package it shows. */
function packageOf(d: Design): Package {
  return (d.collection ? PACKAGES.find((p) => p.id === "new") : PACKAGES.find((p) => p.href === d.path))!;
}

/** "Tribe Site Pro (R16,500): a 10-page explorer's map…" → "A 10-page explorer's map…" */
function about(d: Design) {
  const t = d.blurb.replace(/^[^:]+\):\s*/, "");
  return t.charAt(0).toUpperCase() + t.slice(1) + (t.endsWith(".") ? "" : ".");
}

function Card({ d }: { d: Design }) {
  const p = packageOf(d);
  const slug = d.path.split("/").pop();
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-[#D9E7E9] bg-white transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(6,44,60,.45)]">
      <a href={d.path} className="block overflow-hidden bg-[#EFF7F8]" tabIndex={-1} aria-hidden="true">
        <img src={`/images/landing/designs/${slug}.jpg`} alt="" width={1280} height={800} loading="lazy"
          className="block aspect-[16/10] w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]" />
      </a>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-3">
          <span className={`${head} rounded-full bg-[#EFF7F8] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#0F6F8B]`}>
            {d.collection ? d.pkg : "Package design"}
          </span>
          <span className="text-[12px] font-semibold text-[#59717C]">{p.pages} pages{p.pages >= 15 ? "+" : ""}</span>
        </div>
        <h2 className={`${head} text-[22px] font-extrabold tracking-[-0.02em] text-[#0A3D52]`}>{d.name}</h2>
        <p className="text-[15px] leading-relaxed text-[#102E3B]">{about(d)}</p>
        <p className="mt-auto text-[13px] text-[#59717C]">
          <b className="text-[#0A3D52]">{p.name}</b> · {p.from ? "from " : ""}{rand(p.tribe)} or {rand(instalment(p.tribe))}/month over 12 months
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-[#D9E7E9] pt-3">
          <a href={d.path} className={`${head} inline-flex min-h-11 items-center gap-1.5 text-[14px] font-bold text-[#0F6F8B] hover:text-[#0A3D52]`}>
            Open the sample site <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="/packages" className={`${head} inline-flex min-h-11 items-center gap-1.5 text-[14px] font-bold text-[#0A3D52] hover:text-[#0F6F8B]`}>
            Price it <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function BrowseDesigns() {
  const [filter, setFilter] = useState("All");
  const shown = DESIGNS.filter((d) => filter === "All" || (filter === BIGGER ? !d.collection : d.collection && d.pkg === filter));
  return (
    <div className={`${body} min-h-screen bg-[#EFF7F8] text-[#102E3B] [color-scheme:light]`}>
      <AifundiHeader current={BROWSE} sticky />
      <main>
        <section className="bg-white">
          <div className={`${wrap} flex flex-col gap-5 py-14 sm:py-20`}>
            <p className={`${head} flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#0F6F8B]`}>
              <span className="h-2 w-2 rounded-full bg-[#FF6B5C]" aria-hidden="true" />Browse designs
            </p>
            <h1 className={`${head} max-w-[20ch] text-[clamp(36px,5.5vw,64px)] font-extrabold leading-[1.03] tracking-[-0.04em] text-[#0A3D52] [text-wrap:balance]`}>
              Every sample website, working and ready to try.
            </h1>
            <p className="max-w-[62ch] text-[17px] leading-relaxed text-[#59717C]">
              Each one is a full site for a made-up agency, with its pages, the AI Concierge, live packages and an enquiry
              form that lands in Tribe. The ten audience designs are the choices for a New Website; Living Map, Atlas and
              Enterprise show what the bigger packages add. Moving your own site to Tribe? It gets the same concierge, live
              pricing and enquiries, in your own look.
            </p>
          </div>
        </section>
        <section className={`${wrap} flex flex-col gap-8 py-12 sm:py-16`}>
          <div role="group" aria-label="Show designs for" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}
                className={`${head} min-h-11 rounded-full px-4 text-[14px] font-bold transition ${filter === f ? "bg-[#0A3D52] text-white" : "border border-[#D9E7E9] bg-white text-[#0A3D52] hover:border-[#0F6F8B]"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((d) => <Card key={d.path} d={d} />)}
          </div>
        </section>
      </main>
      <footer className="bg-[#062C3C] text-[#C7DDE2]">
        <div className={`${wrap} flex flex-col gap-4 py-10 text-[13px] sm:flex-row sm:items-center sm:justify-between`}>
          <span className="flex items-center gap-3"><img src="/images/landing/mark.svg" alt="" width={28} height={28} />Websites for TribeTravel agencies, built and hosted by AIFUNDI. All prices in rand.</span>
          <a href="/packages" className={`${head} inline-flex min-h-11 items-center gap-2 rounded-full bg-[#FF6B5C] px-5 font-bold text-white`}>Build my quote <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
        </div>
      </footer>
    </div>
  );
}
