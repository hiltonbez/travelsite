// The Living Map home page: the whole map, inked in route by route with planes and boats on the move, then each
// feature of Tribe Site Pro as a stop along the ink trail.
import { ArrowRight } from "lucide-react";
import { BehindTheScenes } from "@/designs/living-map/agency";
import { ChatSection } from "@/designs/living-map/chat";
import { DEPARTURES, seatsLeft } from "@/designs/living-map/content";
import { DeparturesStrip } from "@/designs/living-map/departures";
import { LivingMapLayout } from "@/designs/living-map/layout";
import { LookCards } from "@/designs/living-map/looks";
import { Compass, LivingMap } from "@/designs/living-map/map";
import { Notifications } from "@/designs/living-map/phone";
import { DestinationsStrip } from "@/designs/living-map/places";
import { PlanSection } from "@/designs/living-map/plan";
import { RatesSection } from "@/designs/living-map/rates";
import { BASE, accent, btn, caps, display, ghost, gutter, hand, soft } from "@/designs/living-map/theme";

export function LivingMapHome() {
  return (
    <LivingMapLayout current={BASE}>
      <Hero />
      <DestinationsStrip />
      <DeparturesStrip />
      <RatesSection />
      <Notifications />
      <ChatSection />
      <LookCards />
      <BehindTheScenes />
      <PlanSection />
    </LivingMapLayout>
  );
}

function Hero() {
  const zanzibar = DEPARTURES[0]!;
  return (
    <section className={`relative z-10 grid items-center gap-10 ${gutter} pt-10 pb-20 md:pt-14 lg:grid-cols-[.9fr_1.1fr]`}>
      <div className="flex min-w-0 flex-col gap-6">
        <p className={`lm-rise ${caps} ${soft}`}>26°12′S 28°02′E · <span className={accent}>Johannesburg</span> · est. for explorers</p>
        <h1 className={`lm-rise ${display} text-[clamp(44px,7.4vw,108px)] leading-[0.95] [animation-delay:.1s]`}>
          Every trip starts as <em className={accent}>a line on a map.</em>
        </h1>
        <p className={`lm-rise max-w-[50ch] text-lg leading-relaxed ${soft} [animation-delay:.22s] md:text-xl`}>
          Tell us where you'd like to go and we'll draw the route: flights, places to stay, and small group trips with a seat saved just for you.
        </p>
        <div className="lm-rise flex flex-wrap gap-3 [animation-delay:.34s]">
          <a href={`${BASE}/departures`} className={`${btn} min-h-14 px-7`}>See group departures <ArrowRight className="h-4 w-4" /></a>
          <a href="#plan" className={`${ghost} min-h-14 px-7`}>Plan my trip</a>
        </div>
        <ul className={`lm-rise flex flex-wrap gap-x-6 gap-y-2 text-sm ${soft} [animation-delay:.46s]`}>
          <li><b className="text-(--lm-ink)">6</b> destinations</li>
          <li><b className="text-(--lm-ink)">{DEPARTURES.length}</b> group departures</li>
          <li><b className="text-(--lm-ink)">Live</b> Beachcomber rates</li>
        </ul>
      </div>

      <div className="relative">
        <div className="relative aspect-[106/100] overflow-hidden rounded-[6px] border border-(--lm-line) shadow-[0_40px_80px_-50px_var(--lm-shadow)]">
          <LivingMap label="Hand-drawn map of Africa and the Indian Ocean, with routes from Johannesburg to Mauritius, Zanzibar, Victoria Falls, the Kruger, Cape Town and Santorini" />
        </div>
        <Compass className="absolute -bottom-8 -left-5 h-24 w-24 md:h-32 md:w-32" />
        {/* A note pinned to the map */}
        <a href={`${BASE}/book?trip=${zanzibar.slug}`}
          className="lm-bob absolute top-[30%] -right-1 flex max-w-[170px] rotate-3 flex-col rounded-sm bg-(--lm-card) px-3 py-2 shadow-[0_16px_30px_-16px_var(--lm-shadow)] md:right-[-14px]">
          <span className={`${hand} text-xl leading-tight`}>{zanzibar.name}</span>
          <span className={`${hand} text-xl leading-tight font-bold ${accent}`}>only {seatsLeft(zanzibar)} seats left!</span>
          <span className="text-[11px] opacity-70">Example departure</span>
        </a>
      </div>
    </section>
  );
}
