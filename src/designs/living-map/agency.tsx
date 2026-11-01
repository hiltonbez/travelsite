// "What your agency sees": the TribeTravel side of Tribe Site Pro, shown to the prospect. A strip of lead reminders
// (the consultant nudged when a quote goes quiet) and a glimpse of the website dashboard. Every figure is example data
// and says so; nothing here is read from TribeTravel.
import { Bell, Eye, MessageCircle, Ticket, Users } from "lucide-react";
import { REMINDERS } from "@/designs/living-map/content";
import { Example, SectionHead } from "@/designs/living-map/parts";
import { accent, caps, card, gutter, hand, soft } from "@/designs/living-map/theme";

/** A small ink line chart of a weekly series. */
function Sketch({ values, name }: { values: number[]; name: string }) {
  const w = 300, h = 90, max = Math.max(...values), step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, h - 8 - (v / max) * (h - 22)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1] ?? [0, 0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={name} className="h-24 w-full overflow-visible">
      <path d={`${line} L${w} ${h} L0 ${h} Z`} fill="var(--lm-accent)" fillOpacity=".1" />
      <path d={line} fill="none" stroke="var(--lm-accent)" strokeWidth="2.2" strokeLinejoin="round" pathLength={1} className="lm-draw" />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill="var(--lm-accent)" />
    </svg>
  );
}

function Reminder({ r }: { r: (typeof REMINDERS)[number] }) {
  return (
    <div className={`flex w-[300px] flex-none items-start gap-3 p-4 ${card}`}>
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-(--lm-accent) text-(--lm-on-accent)"><Bell className="h-5 w-5" /></span>
      <span className="flex flex-col gap-1 text-sm">
        <span><b>{r.who}</b>, your {r.what} has been quiet for <b>{r.quiet}</b>.</span>
        <span className={`${hand} text-xl leading-none ${accent}`}>{r.action}</span>
      </span>
    </div>
  );
}

export function BehindTheScenes() {
  const stats: [typeof Eye, string, string, string][] = [
    [Eye, "Visitors this month", "3 840", "+14%"],
    [MessageCircle, "Enquiries & chats", "126", "38 from the AI chat"],
    [Ticket, "Seat requests", "41", "Zanzibar 4 seats left"],
    [Users, "Newsletter sign-ups", "212", "+57 this month"],
  ];
  return (
    <section id="agency" data-pin className={`relative z-10 flex scroll-mt-24 flex-col gap-10 py-24`}>
      <div className={`flex flex-col gap-4 ${gutter}`}>
        <SectionHead kicker="Behind the scenes · what your agency sees" title={<>Nothing goes <em>quiet</em> on our watch.</>}
          intro="When a quote hasn't been opened, a seat hold is running out or a deposit is late, TribeTravel taps the consultant on the shoulder. And the website dashboard shows what the site is bringing in." />
        <Example>Example data: what the agency sees in TribeTravel</Example>
      </div>

      {/* The reminders, drifting past like notes pinned along a string */}
      <div className="relative overflow-hidden py-2 motion-reduce:overflow-x-auto" aria-label="Example lead reminders">
        <div className="lm-marquee flex w-max gap-4 px-4">
          {[...REMINDERS, ...REMINDERS].map((r, i) => (
            <div key={i} aria-hidden={i >= REMINDERS.length ? true : undefined} style={{ transform: `rotate(${(i % 3) - 1}deg)` }}><Reminder r={r} /></div>
          ))}
        </div>
      </div>

      <div className={`${gutter}`}>
        <div className={`grid gap-5 p-5 md:p-7 lg:grid-cols-[1.2fr_1fr] ${card}`}>
          <div className="flex flex-col gap-4">
            <span className={`${caps} ${accent}`}>Website dashboard</span>
            <div className="grid grid-cols-2 gap-3">
              {stats.map(([Icon, name, value, change]) => (
                <div key={name} className="flex flex-col gap-1 rounded-md border border-(--lm-line) p-3">
                  <span className={`flex items-center gap-1.5 text-xs ${soft}`}><Icon className="h-3.5 w-3.5" /> {name}</span>
                  <b className="text-2xl tabular-nums">{value}</b>
                  <span className={`text-xs ${soft}`}>{change}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className={`text-sm font-semibold`}>Enquiries per week, last 10 weeks</span>
            <Sketch name="Enquiries per week, rising from 14 to 31" values={[14, 17, 15, 19, 22, 21, 24, 27, 26, 31]} />
            <span className={`text-sm font-semibold`}>Pages that bring enquiries</span>
            <ul className="flex flex-col gap-1.5 text-sm">
              {[["Group departures", 34], ["Specials (Beachcomber)", 27], ["Mauritius", 19], ["Home", 15]].map(([n, v]) => (
                <li key={n} className="grid grid-cols-[150px_1fr_auto] items-center gap-2">
                  <span className={`truncate ${soft}`}>{n}</span>
                  <span className="h-2 rounded-full bg-(--lm-ink)/10"><span className="block h-2 rounded-full bg-(--lm-accent)" style={{ width: `${Math.round((Number(v) / 34) * 100)}%` }} /></span>
                  <span className="tabular-nums">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
