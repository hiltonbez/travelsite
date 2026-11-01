// Destinations as photos taped into the journal: a polaroid with the place's name handwritten underneath, and the
// home page's strip of them.
import { ArrowRight, Plane } from "lucide-react";
import { DESTINATIONS, type Destination } from "@/designs/living-map/content";
import { SectionHead, Tape } from "@/designs/living-map/parts";
import { BASE, accent, caps, ghost, gutter, hand, soft } from "@/designs/living-map/theme";

const TILT = [-2.2, 1.6, -0.8, 2.4, -1.6, 1];

export function PlaceCard({ d, i = 0 }: { d: Destination; i?: number }) {
  return (
    <a href={`${BASE}/destinations/${d.slug}`} className="group relative block pt-3 transition duration-300 hover:z-10 hover:-translate-y-1.5"
      style={{ rotate: `${TILT[i % TILT.length]}deg` }}>
      <Tape className="-top-0.5 left-1/2 z-10 -translate-x-1/2 -rotate-3" />
      <span className="flex flex-col gap-3 bg-[#FFFDF8] p-3 pb-4 text-[#2A1C10] shadow-[0_24px_40px_-24px_var(--lm-shadow)]">
        <span className="relative block aspect-[4/3] overflow-hidden">
          <img src={d.photos[0]} alt={d.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        </span>
        <span className="flex items-end justify-between gap-3 px-1">
          <span className="flex flex-col">
            <span className={`${hand} text-[28px] leading-none font-bold`}>{d.name}</span>
            <span className="text-sm text-[#5A4430]">{d.tagline}</span>
          </span>
          <span className="flex flex-none items-center gap-1 text-xs text-[#5A4430]"><Plane className="h-3.5 w-3.5" /> {d.flight.split(" from")[0]}</span>
        </span>
      </span>
    </a>
  );
}

export function DestinationsStrip() {
  return (
    <section data-pin className={`relative z-10 flex flex-col gap-12 ${gutter} py-24`}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead kicker="Where the ink goes" title={<>Six places <em>we know by heart.</em></>}
          intro="We've been to every one of them, more than once. Pick a place to see a sample itinerary and the best time to go." />
        <a href={`${BASE}/destinations`} className={ghost}>All destinations <ArrowRight className="h-4 w-4" /></a>
      </div>
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {DESTINATIONS.map((d, i) => <PlaceCard key={d.slug} d={d} i={i} />)}
      </div>
      <p className={`${caps} text-[11px] ${soft}`}>Photos: Unsplash · <span className={accent}>Every trip tailor-made</span></p>
    </section>
  );
}
