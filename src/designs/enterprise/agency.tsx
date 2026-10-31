// "What your agency sees": the TribeTravel side of the Enterprise package, shown to the prospect as a mock-up of the
// agency's screens. Every figure here is example data and says so; nothing is read from TribeTravel.
import { useState, type ReactNode } from "react";
import {
  BarChart3, Bell, Building2, Check, FileText, Globe, Mail, Megaphone, MessageCircle, PenLine, RefreshCw, Send, Sparkles,
  Users, Workflow,
} from "lucide-react";
import { StopLabel } from "@/designs/enterprise/parts";
import { gutter, h2, label, mono, orange, soft } from "@/designs/enterprise/theme";

const TABS = [
  { key: "dashboard", icon: BarChart3, name: "Dashboard & reports", line: "Custom dashboard, advanced reporting" },
  { key: "analytics", icon: Globe, name: "Website analytics", line: "GA4, Meta Pixel, advanced analytics" },
  { key: "marketing", icon: Megaphone, name: "Marketing", line: "Blog, newsletter, SEO" },
  { key: "reminders", icon: Bell, name: "Lead reminders", line: "When a lead goes quiet" },
  { key: "automation", icon: Workflow, name: "Automation", line: "Workflow and complex automation" },
  { key: "records", icon: Users, name: "Customers & suppliers", line: "Customer and supplier management" },
  { key: "crm", icon: RefreshCw, name: "CRM sync", line: "Outside CRM integration" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const card = "rounded-2xl border border-[#EDE6D8]/10 bg-[#0B1424] p-4";

export function BehindTheScenes() {
  const [tab, setTab] = useState<Tab>("dashboard");
  return (
    <section id="agency" data-stop className={`relative z-10 flex scroll-mt-20 flex-col gap-10 ${gutter} py-24 md:py-28`}>
      <div className="flex max-w-[760px] flex-col gap-4">
        <StopLabel>Behind the scenes · What your agency sees</StopLabel>
        <h2 className={h2}>Your customers see the trip. <span className={orange}>You see everything.</span></h2>
        <p className={`text-lg leading-relaxed ${soft}`}>
          Every click on this site lands in TribeTravel: dashboards, reports, reminders, your blog and newsletter, customer and supplier records, synced to your CRM. Here's a look at your side of the screen.
        </p>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-[#EDE6D8]/15 bg-[#111D33] shadow-[0_50px_100px_-40px_rgba(0,0,0,.9)]">
        <div className="flex items-center gap-3 border-b border-[#EDE6D8]/10 px-4 py-3">
          <span className="flex gap-1.5" aria-hidden="true">{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-[#EDE6D8]/20" />)}</span>
          <span className={`flex-1 truncate rounded-full bg-[#0B1424] px-4 py-1.5 ${mono} text-xs ${soft}`}>tribetravel.io/app · Sun-Set Travel</span>
          <span className={`rounded-full bg-[#FF6A2E]/15 px-3 py-1 ${label} ${orange}`}>Example data</span>
        </div>
        <div className="grid lg:grid-cols-[250px_1fr]">
          <div role="tablist" aria-label="Agency screens" className="flex gap-1 overflow-x-auto border-b border-[#EDE6D8]/10 p-2 lg:flex-col lg:border-r lg:border-b-0">
            {TABS.map(({ key, icon: Icon, name, line }) => (
              <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
                className={`flex flex-none items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${tab === key ? "bg-[#FF6A2E] text-[#0B1424]" : "hover:bg-[#EDE6D8]/6"}`}>
                <Icon className="mt-0.5 h-4 w-4 flex-none" />
                <span className="flex flex-col">
                  <b className="text-sm whitespace-nowrap">{name}</b>
                  <span className={`hidden text-xs lg:block ${tab === key ? "text-[#0B1424]/70" : soft}`}>{line}</span>
                </span>
              </button>
            ))}
          </div>
          <div role="tabpanel" className="d-slide min-w-0 p-4 md:p-6" key={tab}>
            {tab === "dashboard" && <Dashboard />}
            {tab === "analytics" && <Analytics />}
            {tab === "marketing" && <Marketing />}
            {tab === "reminders" && <Reminders />}
            {tab === "automation" && <AutomationRun />}
            {tab === "records" && <Records />}
            {tab === "crm" && <CrmSync />}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ name, value, change }: { name: string; value: string; change: string }) {
  return (
    <div className={card}>
      <span className={`${label} ${soft}`}>{name}</span>
      <b className={`mt-2 block ${mono} text-2xl tabular-nums`}>{value}</b>
      <span className="text-xs text-[#4ADE80]">{change}</span>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`${card} flex min-w-0 flex-col gap-3 ${className}`}>
      <b className="text-sm">{title}</b>
      {children}
    </div>
  );
}

/** Horizontal bars, each labelled with its value. */
function Bars({ rows, unit = "" }: { rows: [string, number][]; unit?: string }) {
  const max = Math.max(...rows.map(([, v]) => v));
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map(([name, v]) => (
        <li key={name} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-sm">
          <span className={`truncate ${soft}`}>{name}</span>
          <span className="h-2 rounded-full bg-[#EDE6D8]/8"><span className="block h-2 rounded-full bg-[#FF6A2E]" style={{ width: `${(v / max) * 100}%` }} /></span>
          <span className={`${mono} text-xs tabular-nums`}>{unit}{v.toLocaleString("en-ZA")}</span>
        </li>
      ))}
    </ul>
  );
}

/** A small line chart of a weekly series, with the last point marked. */
function Trend({ values, name }: { values: number[]; name: string }) {
  const w = 300, h = 90, max = Math.max(...values), step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, h - 8 - (v / max) * (h - 20)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1] ?? [0, 0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={name} className="h-24 w-full">
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="#EDE6D8" strokeOpacity=".06" />)}
      <path d={`${line} L${w} ${h} L0 ${h} Z`} fill="#FF6A2E" fillOpacity=".12" />
      <path d={line} fill="none" stroke="#FF6A2E" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#FF6A2E" />
    </svg>
  );
}

function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat name="Enquiries this month" value="148" change="+22% on last month" />
        <Stat name="Quotes sent" value="96" change="Median 3h 40m to send" />
        <Stat name="Quotes accepted" value="31" change="32% conversion" />
        <Stat name="Bookings value" value="R1.84m" change="+R310k on last month" />
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        <Panel title="Enquiries per week, last 12 weeks"><Trend name="Enquiries per week" values={[18, 22, 19, 25, 24, 28, 26, 31, 29, 34, 33, 38]} /></Panel>
        <Panel title="Bookings value by destination"><Bars unit="R" rows={[["Mauritius", 612000], ["Zanzibar", 384000], ["Cape Town", 298000], ["Kruger", 276000], ["Cruises", 270000]]} /></Panel>
      </div>
      <Panel title="Consultants this month">
        <table className="w-full text-left text-sm">
          <thead className={`${label} ${soft}`}><tr><th className="py-1.5 font-normal">Consultant</th><th className="font-normal">Quotes</th><th className="font-normal">Accepted</th><th className="font-normal">Avg. reply</th></tr></thead>
          <tbody className={`${mono} tabular-nums`}>
            {[["Thandi M.", 38, 14, "2h 10m"], ["Pieter v.d. B.", 31, 9, "4h 05m"], ["Aisha K.", 27, 8, "3h 20m"]].map(([n, q, a, r]) => (
              <tr key={n} className="border-t border-[#EDE6D8]/8"><td className="py-2 font-sans">{n}</td><td>{q}</td><td>{a}</td><td>{r}</td></tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function Analytics() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat name="Visitors (30 days)" value="6,420" change="+18%" />
        <Stat name="Enquiry rate" value="2.3%" change="Visitors who enquire" />
        <Stat name="Concierge chats" value="212" change="61 became enquiries" />
        <Stat name="App installs" value="87" change="54 with quote alerts on" />
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        <Panel title="Where visitors come from (GA4)"><Bars rows={[["Google search", 2810], ["Instagram (Meta)", 1460], ["Direct", 1020], ["Newsletter", 690], ["Facebook ads", 440]]} /></Panel>
        <Panel title="Pages that bring enquiries"><Bars rows={[["Mauritius", 41], ["Home", 33], ["Live packages", 29], ["Zanzibar", 18], ["Blog: Mauritius", 12]]} /></Panel>
      </div>
      <p className={`text-xs ${soft}`}>Google Analytics 4 and the Meta Pixel are set up on every page; Meta ad conversions are matched to enquiries in TribeTravel.</p>
    </div>
  );
}

function Marketing() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
      <Panel title="Blog: writing a post">
        <div className="flex flex-col gap-3 rounded-xl border border-[#EDE6D8]/10 p-4">
          <span className={`${label} ${soft}`}>Travel news · Draft</span>
          <b className="text-lg leading-snug">Why Mauritius is at its best in our winter</b>
          <p className={`text-sm leading-relaxed ${soft}`}>Most South Africans picture Mauritius as a December holiday. But the island's winter, from May to September, is when it is at its most comfortable…</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1.5 rounded-full border border-[#FF6A2E]/40 px-3 py-1.5 text-[#FF6A2E]"><Sparkles className="h-3.5 w-3.5" /> Write with AI</span>
            <span className="rounded-full border border-[#EDE6D8]/20 px-3 py-1.5">Add photos</span>
            <span className="rounded-full border border-[#EDE6D8]/20 px-3 py-1.5">SEO title and description ✓</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[#EDE6D8]/10 pt-3">
            <span className={`text-xs ${soft}`}>Publishes to <a href="/designs/enterprise/news" className={orange}>Travel news</a> and the next newsletter</span>
            <span className="flex items-center gap-1.5 rounded-full bg-[#FF6A2E] px-4 py-2 text-sm font-semibold text-[#0B1424]"><PenLine className="h-4 w-4" /> Publish</span>
          </div>
        </div>
        <Bars rows={[["Mauritius in winter", 1240], ["First safari", 860], ["Greek cruise", 520]]} />
        <span className={`text-xs ${soft}`}>Reads per post, last 30 days</span>
      </Panel>
      <div className="flex flex-col gap-4">
        <Panel title="Newsletter">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[["Subscribers", "2,318"], ["Opened", "48%"], ["Clicked", "9.6%"]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-[#111D33] p-3"><b className={`block ${mono} text-lg`}>{v}</b><span className={`text-xs ${soft}`}>{k}</span></div>
            ))}
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-[#EDE6D8]/10 p-3 text-sm">
            <Mail className={`mt-0.5 h-4 w-4 flex-none ${orange}`} />
            <span><b>October trip letter</b> <span className={soft}>· sent to 2,318 · 3 new posts, 4 live deals · 14 enquiries</span></span>
          </div>
          <span className={`text-xs ${soft}`}>New sign-ups from this site's footer arrive tagged with their interests.</span>
        </Panel>
        <Panel title="SEO and Google">
          <ul className="flex flex-col gap-2 text-sm">
            {["Google Search Console verified", "Google Business Profile linked", "Sitemap and page titles for every destination", "Meta Pixel and GA4 events on enquiries"].map((x) => (
              <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 flex-none text-[#4ADE80]" />{x}</li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Reminders() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title="Leads gone quiet">
        {[["Naledi Dlamini", "Zanzibar, 2 adults, June", "5 days", true], ["Mark Fourie", "Kruger, family of 4", "3 days", false], ["Priya Naidoo", "Mauritius honeymoon", "8 days", false]].map(([n, t, d, on]) => (
          <div key={String(n)} className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-sm ${on ? "border-[#FF6A2E]/50 bg-[#FF6A2E]/8" : "border-[#EDE6D8]/10"}`}>
            <span className="flex flex-col"><b>{n}</b><span className={soft}>{t}</span></span>
            <span className={`${mono} text-xs whitespace-nowrap ${on ? orange : soft}`}>Quiet {d}</span>
          </div>
        ))}
        <span className={`text-xs ${soft}`}>Rule: remind the consultant when a quoted lead hasn't opened their quote or replied in 5 days.</span>
      </Panel>
      <Panel title="The reminder Thandi got">
        <div className="flex flex-col gap-2 rounded-xl bg-[#0E3B2E] p-4 text-sm">
          <span className="flex items-center gap-2 text-xs text-[#9FE6C4]"><MessageCircle className="h-4 w-4" /> WhatsApp · 08:00</span>
          <p>Naledi Dlamini (Zanzibar, 2 adults, June) hasn't opened quote <b>Q-1047</b> in 5 days. Her last message: "Can we add Stone Town?"</p>
          <span className="self-start rounded-full bg-[#9FE6C4]/15 px-3 py-1 text-xs text-[#9FE6C4]">Open in TribeTravel</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-[#EDE6D8]/10 p-4 text-sm">
          <span className={`flex items-center gap-2 text-xs ${soft}`}><Mail className="h-4 w-4" /> Email · same time</span>
          <b>Follow up: Naledi Dlamini, Q-1047</b>
          <span className={soft}>Suggested reply: "Hi Naledi, I've added two nights in Stone Town to your quote…"</span>
        </div>
      </Panel>
    </div>
  );
}

function AutomationRun() {
  const steps: [string, string, string][] = [
    ["09:14", "Enquiry received", "Website boarding pass: Mauritius, April 2027, 2 adults"],
    ["09:14", "Client created", "Lerato & Sipho Mokoena, matched to no existing client"],
    ["09:15", "Draft quote built", "Q-1052 from live Beachcomber rates: Paradis, 7 nights, half board"],
    ["09:15", "Consultant alerted", "Thandi M. on WhatsApp and email"],
    ["11:02", "Quote sent", "Thandi priced it and sent it; the customer got a WhatsApp and an email"],
    ["11:40", "Quote opened", "Viewed twice on a phone; the app alert fired"],
    ["14:25", "Accepted and deposit paid", "R19,600 by card (Paystack); invoice posted to the books"],
  ];
  return (
    <Panel title="One enquiry, start to finish (today)">
      <ol className="relative flex flex-col gap-4 border-l-2 border-dashed border-[#EDE6D8]/15 pl-6">
        {steps.map(([t, name, text], i) => (
          <li key={name} className="relative">
            <span className={`absolute top-1 -left-[31px] flex h-4 w-4 items-center justify-center rounded-full ${i === steps.length - 1 ? "bg-[#4ADE80]" : "bg-[#FF6A2E]"}`} />
            <span className={`${mono} text-xs ${soft}`}>{t}</span>
            <b className="ml-3 text-sm">{name}</b>
            <p className={`text-sm ${soft}`}>{text}</p>
          </li>
        ))}
      </ol>
      <span className={`text-xs ${soft}`}>Nobody retyped anything. Rules like "alert a second consultant if a quote isn't sent in 4 hours" are set in TribeTravel.</span>
    </Panel>
  );
}

function Records() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
      <Panel title="Customer: Lerato & Sipho Mokoena">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[["Trips", "3 (Cape Town 2024, Zanzibar 2025, Mauritius 2027)"], ["Lifetime value", "R96,300"], ["Prefers", "WhatsApp, beach, half board"], ["Next", "Passport check due Feb 2027"]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-[#111D33] p-3"><span className={`${label} ${soft}`}>{k}</span><p className="mt-1">{v}</p></div>
          ))}
        </div>
        <ul className="flex flex-col gap-2 text-sm">
          {[[FileText, "Quote Q-1052 · accepted"], [FileText, "Invoice INV-2207 · deposit paid"], [Send, "Travel documents · sent 3 Mar"]].map(([Icon, t], i) => {
            const I = Icon as typeof FileText;
            return <li key={i} className="flex items-center gap-2"><I className={`h-4 w-4 ${orange}`} />{String(t)}</li>;
          })}
        </ul>
      </Panel>
      <Panel title="Suppliers">
        {[["Beachcomber", "Live rates · online booking", "Live"], ["Thompsons Holidays", "Live packages · enquire", "Live"], ["MSC Cruises", "Cruise feed · enquire", "Live"], ["Airlink", "Contracted rates · manual", "Manual"]].map(([n, t, s]) => (
          <div key={n} className="flex items-center justify-between gap-3 rounded-xl border border-[#EDE6D8]/10 p-3 text-sm">
            <span className="flex items-center gap-3"><Building2 className={`h-4 w-4 ${soft}`} /><span className="flex flex-col"><b>{n}</b><span className={soft}>{t}</span></span></span>
            <span className={`rounded-full px-2.5 py-1 text-xs ${s === "Live" ? "bg-[#4ADE80]/15 text-[#4ADE80]" : "bg-[#EDE6D8]/10"}`}>{s}</span>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function CrmSync() {
  return (
    <div className="grid items-center gap-4 xl:grid-cols-[1fr_auto_1fr]">
      <Panel title="TribeTravel">
        <p className="text-sm"><b>Lerato Mokoena</b><br /><span className={soft}>lerato@example.com · Mauritius 2027 · Quote accepted</span></p>
      </Panel>
      <div className="flex flex-col items-center gap-1 text-[#4ADE80]">
        <RefreshCw className="h-6 w-6" />
        <span className={`${mono} text-xs`}>Synced 2 min ago</span>
      </div>
      <Panel title="HubSpot">
        <p className="text-sm"><b>Lerato Mokoena</b><br /><span className={soft}>Deal: Mauritius 2027 · Stage: Closed won · R78,400</span></p>
      </Panel>
      <p className={`text-xs ${soft} xl:col-span-3`}>Contacts, deals and stages stay in step both ways with HubSpot, Zoho or Salesforce. Marketing lists in HubSpot pick up new newsletter sign-ups.</p>
    </div>
  );
}
