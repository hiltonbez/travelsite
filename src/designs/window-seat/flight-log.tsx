// "What your agency sees": a small glimpse of the website dashboard and analytics that come with the Tribe Site
// package, shown to the prospect as the agency's flight log. Every figure is example data and says so; nothing is
// read from TribeTravel.
import { BarChart3 } from "lucide-react";
import { BRAND } from "@/designs/shared";
import { SectionLabel } from "@/designs/window-seat/parts";
import { card, display, label, mono, soft } from "@/designs/window-seat/theme";

const WEEK: [string, number][] = [["Mon", 142], ["Tue", 168], ["Wed", 155], ["Thu", 201], ["Fri", 236], ["Sat", 214], ["Sun", 188]];

export function FlightLog() {
  const max = Math.max(...WEEK.map(([, v]) => v));
  const total = WEEK.reduce((a, [, v]) => a + v, 0);
  return (
    <section id="flight-log" className="ws-reveal relative flex scroll-mt-24 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <SectionLabel><BarChart3 className="h-4 w-4" aria-hidden="true" /> What your agency sees</SectionLabel>
        <h2 className={`${display} text-[clamp(28px,3.6vw,42px)] leading-[1.05]`}>Your website's flight log.</h2>
        <p className={`max-w-[56ch] ${soft}`}>Your TribeTravel dashboard shows who visited your site this week, which pages they read and every quote request that came in.</p>
      </div>
      <div className={`flex flex-col gap-5 p-5 md:p-6 ${card}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <b className="text-[15px]">This week · {BRAND.name}</b>
          <span className={`rounded-full bg-[#FFC857]/40 px-3 py-1 ${label} text-[#1C2340]`}>Example data</span>
        </div>
        <dl className="grid grid-cols-3 gap-3">
          {[["Visitors", String(total).replace(/\B(?=(\d{3})+(?!\d))/g, " "), "+12%"], ["Quote requests", "23", "+4"], ["Chats", "41", "+9"]].map(([n, v, c]) => (
            <div key={n} className="flex flex-col gap-1 rounded-2xl bg-[#FFF7EC] p-3">
              <dt className={`${label} text-[10px] ${soft}`}>{n}</dt>
              <dd className={`${mono} text-xl tabular-nums md:text-2xl`}>{v}</dd>
              <dd className="text-xs font-semibold text-[#15803D]">{c} on last week</dd>
            </div>
          ))}
        </dl>
        <figure className="flex flex-col gap-2">
          <figcaption className={`${label} text-[10px] ${soft}`}>Visitors per day</figcaption>
          <ul className="flex h-32 items-end gap-2" aria-label="Visitors per day, example data">
            {WEEK.map(([d, v], i) => (
              <li key={d} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="ws-bar w-full rounded-t-lg bg-gradient-to-t from-[#C2410C] to-[#FFC857]" style={{ height: `${(v / max) * 100}%`, animationDelay: `${i * 80}ms` }}>
                  <span className="sr-only">{d}: {v} visitors</span>
                </span>
                <span aria-hidden="true" className={`${mono} text-[11px] ${soft}`}>{d}</span>
              </li>
            ))}
          </ul>
        </figure>
        <div className="flex flex-col gap-2 border-t border-dashed border-[#1C2340]/15 pt-4 text-sm">
          <span className={`${label} text-[10px] ${soft}`}>Most-read pages</span>
          {[["Home", 46], ["Destinations", 28], ["Get a quote", 17]].map(([p, pc]) => (
            <span key={p} className="flex items-center justify-between gap-3"><span>{p}</span><span className={`${mono} tabular-nums`}>{pc}%</span></span>
          ))}
        </div>
      </div>
    </section>
  );
}
