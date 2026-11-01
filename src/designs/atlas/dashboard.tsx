// "Behind the counter": the agency's custom dashboard and advanced reporting from TribeTravel, shown to the visitor.
// KPI tiles count up, charts build as they scroll into view, and the client and supplier lists keep moving like the
// real thing. Every figure is example data and says so; nothing here is read from TribeTravel.
// Charts are hand-drawn SVG: the prerendered page shows them complete; once the script runs they are "armed"
// (collapsed) and build when they come into view (atlas.css, .atlas-build).
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, Building2, Download, RefreshCw, UserRound } from "lucide-react";
import { BY_DESTINATION, BY_SOURCE, CLIENTS, FUNNEL, KPIS, MONTHLY, SUPPLIERS, WEEKLY, type Client } from "@/designs/atlas/content";
import { CountUp, ExampleTag, LiveDot} from "@/designs/atlas/parts";
import { useInView } from "@/designs/atlas/hooks";
import { card, display, label, mono, muted } from "@/designs/atlas/theme";

/** A chart's frame, which collapses on load and builds when it scrolls into view. */
function Build({ title, note, children, className = "" }: { title: string; note?: string; children: ReactNode; className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  const [armed, setArmed] = useState(false);
  useEffect(() => setArmed(true), []);
  return (
    <div ref={ref} data-armed={armed} data-built={seen} className={`atlas-build flex min-w-0 flex-col gap-4 p-5 ${card} ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <b className="text-[15px]">{title}</b>
        {note && <span className={`${mono} text-[11px] ${muted}`}>{note}</span>}
      </div>
      {children}
    </div>
  );
}

export function Kpis() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {KPIS.map((k, i) => (
        <div key={k.name} className={`relative flex flex-col gap-1 overflow-hidden p-5 ${card}`}>
          <span aria-hidden="true" className="absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-25 blur-2xl" style={{ background: ["#1D6FD8", "#0E9FAE", "#6A52E8", "#FFB547"][i] }} />
          <span className={`${label} ${muted}`}>{k.name}</span>
          <b className={`${display} text-[clamp(30px,4vw,46px)] leading-none`}><CountUp value={k.value} prefix={k.prefix} suffix={k.suffix} decimals={k.decimals} /></b>
          <span className="text-xs font-semibold text-[#15803D]">{k.change}</span>
        </div>
      ))}
    </div>
  );
}

/** Enquiries per week as a line that draws itself, with the area below fading in. */
function WeeklyLine() {
  const w = 320, h = 120, max = Math.max(...WEEKLY) * 1.1, step = w / (WEEKLY.length - 1);
  const pts = WEEKLY.map((v, i) => [i * step, h - (v / max) * (h - 10)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1]!;
  return (
    <svg viewBox={`0 0 ${w} ${h + 4}`} role="img" aria-label={`Enquiries per week, last 12 weeks: ${WEEKLY.join(", ")}`} className="h-36 w-full overflow-visible">
      <defs>
        <linearGradient id="atlas-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1D6FD8" stopOpacity=".25" /><stop offset="1" stopColor="#1D6FD8" stopOpacity="0" /></linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="#0B2340" strokeOpacity=".06" />)}
      <path className="atlas-fade" d={`${line} L${w} ${h} L0 ${h} Z`} fill="url(#atlas-area)" />
      <path className="atlas-draw" d={line} pathLength={1} fill="none" stroke="#1D6FD8" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle className="atlas-fade" cx={last[0]} cy={last[1]} r="5" fill="#FFB547" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

/** Booked value by month as columns that grow. */
function MonthlyBars() {
  const max = Math.max(...MONTHLY.map(([, v]) => v));
  return (
    <div className="flex h-40 items-end gap-3" role="img" aria-label={`Booked value by month: ${MONTHLY.map(([m, v]) => `${m} R${v}m`).join(", ")}`}>
      {MONTHLY.map(([m, v], i) => (
        <div key={m} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <span className={`${mono} text-[11px] ${muted}`}>R{v}m</span>
          <span className="atlas-grow-y w-full rounded-t-xl" style={{ height: `${Math.round((v / max) * 78)}%`, transitionDelay: `${i * 90}ms`, background: i === MONTHLY.length - 1 ? "linear-gradient(180deg,#FFB547,#F08C2E)" : "linear-gradient(180deg,#4BA3F5,#1D6FD8)" }} />
          <span className={`text-xs font-semibold ${muted}`}>{m}</span>
        </div>
      ))}
    </div>
  );
}

/** The conversion funnel: centred bars narrowing stage by stage, with the step-to-step conversion. */
function Funnel() {
  const top = FUNNEL[0]![1];
  return (
    <ol className="flex flex-col gap-2.5">
      {FUNNEL.map(([name, n], i) => {
        // Visits dwarf the rest, so the bars use a log scale; the figures are exact.
        // Rounded, so the server's and the browser's numbers match when the page hydrates.
        const width = Math.round(16 + (Math.log10(n) / Math.log10(top)) * 84);
        const prev = i ? FUNNEL[i - 1]![1] : 0;
        return (
          <li key={name} className="flex flex-col gap-1">
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold">{name}</span>
              <span className={`${mono} text-xs`}>{n.toLocaleString("en-ZA").replace(/[\s,]/g, " ")}{i ? <span className={muted}> · {Math.round((n / prev) * 100)}%</span> : null}</span>
            </span>
            <span className="flex h-6 justify-center rounded-lg bg-[#EEF5FE]">
              <span className="atlas-grow-x h-full rounded-lg" style={{ width: `${width}%`, transformOrigin: "center", transitionDelay: `${i * 120}ms`, background: `linear-gradient(90deg, #1D6FD8, ${["#4BA3F5", "#6A52E8", "#0E9FAE", "#F08C2E", "#15803D"][i]})` }} />
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Booked value by destination as a donut, with the figures listed beside it. */
function Donut() {
  const total = BY_DESTINATION.reduce((s, [, v]) => s + v, 0);
  let start = 0;
  return (
    <div className="grid items-center gap-5 sm:grid-cols-[150px_1fr]">
      <svg viewBox="0 0 42 42" className="atlas-spin-in mx-auto h-[150px] w-[150px] -rotate-90" aria-hidden="true">
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#EEF5FE" strokeWidth="6" />
        {BY_DESTINATION.map(([name, v, colour]) => {
          const len = (v / total) * 100, el = (
            <circle key={name} cx="21" cy="21" r="15.9" fill="none" stroke={colour} strokeWidth="6" pathLength={100} strokeDasharray={`${Math.max(0, len - 0.8)} ${100 - len + 0.8}`} strokeDashoffset={-start} />
          );
          start += len;
          return el;
        })}
      </svg>
      <ul className="flex flex-col gap-1.5 text-sm">
        {BY_DESTINATION.map(([name, v, colour]) => (
          <li key={name} className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: colour }} aria-hidden="true" />
            <span className="flex-1">{name}</span>
            <span className={`${mono} text-xs`}>R{Math.round(v / 1000)}k</span>
            <span className={`w-9 text-right ${mono} text-xs ${muted}`}>{Math.round((v / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourceBars() {
  const max = Math.max(...BY_SOURCE.map(([, v]) => v));
  return (
    <ul className="flex flex-col gap-3">
      {BY_SOURCE.map(([name, v], i) => (
        <li key={name} className="grid grid-cols-[120px_1fr_auto] items-center gap-3 text-sm">
          <span className={`truncate ${muted}`}>{name}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-[#EEF5FE]"><span className="atlas-grow-x block h-full rounded-full bg-[linear-gradient(90deg,#1D6FD8,#4BA3F5)]" style={{ width: `${Math.round((v / max) * 100)}%`, transitionDelay: `${i * 80}ms` }} /></span>
          <span className={`${mono} text-xs`}>{v}</span>
        </li>
      ))}
    </ul>
  );
}

export function Reports() {
  return (
    <div className="grid gap-4 lg:grid-cols-6">
      <Build title="Enquiries per week" note="last 12 weeks" className="lg:col-span-3"><WeeklyLine /></Build>
      <Build title="Booked value by month" note="R millions" className="lg:col-span-3"><MonthlyBars /></Build>
      <Build title="Conversion funnel" note="November" className="lg:col-span-3"><Funnel /></Build>
      <Build title="Booked value by destination" note="this year" className="lg:col-span-3"><Donut /></Build>
      <Build title="Where enquiries come from" note="November" className="lg:col-span-3"><SourceBars /></Build>
      <div className={`flex flex-col gap-3 p-5 lg:col-span-3 ${card}`}>
        <b className="text-[15px]">Scheduled reports</b>
        {[["Monday sales summary", "Every Monday 07:00 · to the owners"], ["Consultant leaderboard", "Every Friday · to the team"], ["Supplier statement check", "Month end · to accounts"]].map(([n, t]) => (
          <div key={n} className="flex items-center justify-between gap-3 rounded-2xl bg-[#F5F8FC] p-3 text-sm">
            <span className="flex min-w-0 flex-col"><b className="truncate">{n}</b><span className={`truncate ${muted}`}>{t}</span></span>
            <Download className="h-4 w-4 flex-none text-[#1D6FD8]" aria-hidden="true" />
          </div>
        ))}
        <span className={`text-xs ${muted}`}>Every chart filters by consultant, supplier, destination and date, and exports to Excel.</span>
      </div>
    </div>
  );
}

// ---- customer and supplier management

const STATUS: Record<Client["status"], string> = {
  "New lead": "bg-[#1D6FD8]/10 text-[#1452A3]",
  Quoted: "bg-[#6A52E8]/10 text-[#4C35C4]",
  "Quiet 5 days": "bg-[#F08C2E]/15 text-[#8A3F00]",
  Booked: "bg-[#16A34A]/12 text-[#15803D]",
  Travelling: "bg-[#0E9FAE]/12 text-[#0B6F7A]",
};

/** What happens next in the client list, one change every few seconds (example activity). */
const UPDATES: [string, Client["status"], string][] = [
  ["Priya Naidoo", "Quoted", "Just now"],
  ["Naledi Dlamini", "Quoted", "Opened her quote"],
  ["Mark Fourie", "Booked", "Just now"],
  ["Johan Botha", "Quiet 5 days", "5 days ago"],
  ["Naledi Dlamini", "Booked", "Just now"],
  ["Priya Naidoo", "Booked", "Just now"],
];

const ROW = 72;

export function ClientList() {
  const [rows, setRows] = useState(CLIENTS);
  const [fresh, setFresh] = useState("");
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  useEffect(() => {
    if (!seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const [name, status, last] = UPDATES[i++ % UPDATES.length]!;
      // The client who just changed moves to the top, as in TribeTravel's activity order.
      setRows((r) => {
        const c = r.find((x) => x.name === name)!;
        return [{ ...c, status, last }, ...r.filter((x) => x.name !== name)];
      });
      setFresh(name);
      if (i % UPDATES.length === 0) window.setTimeout(() => setRows(CLIENTS), 2500);
    }, 3200);
    return () => clearInterval(id);
  }, [seen]);
  // Rows keep their place in the DOM (sorted by name) and slide to their new position, so the list reorders smoothly.
  const order = new Map(rows.map((c, i) => [c.name, i]));
  return (
    <div ref={ref} className={`flex min-w-0 flex-col gap-3 p-4 sm:p-5 ${card}`}>
      <div className="flex items-center justify-between gap-3">
        <b className="flex items-center gap-2 text-[15px]"><UserRound className="h-4 w-4 text-[#1D6FD8]" /> Clients · by latest activity</b>
        <span className={`flex items-center gap-1.5 ${mono} text-[11px] ${muted}`}><LiveDot /> Live</span>
      </div>
      <ul className="relative" style={{ height: CLIENTS.length * ROW }}>
        {[...CLIENTS].sort((a, b) => a.name.localeCompare(b.name)).map((base) => {
          const c = rows.find((x) => x.name === base.name)!, at = order.get(c.name)!;
          return (
            <li key={c.name} className={`absolute inset-x-0 flex items-center gap-3 rounded-2xl px-2.5 transition-[transform,background-color] duration-700 ${fresh === c.name && at === 0 ? "bg-[#FFF6E5]" : ""}`}
              style={{ height: ROW - 6, transform: `translateY(${at * ROW}px)` }}>
              <span aria-hidden="true" className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#EEF5FE] text-sm font-bold text-[#1452A3]">
                {c.name.split(" ").map((w) => w[0]).filter((x) => x && x !== "&").slice(0, 2).join("")}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <b className="truncate text-sm">{c.name}</b>
                <span className={`truncate text-xs ${muted}`}>{c.trip} · {c.last}</span>
              </span>
              <span className="hidden flex-none text-right sm:block"><span className={`${mono} text-xs`}>{c.value}</span></span>
              <span className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${STATUS[c.status]}`}>{c.status}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SupplierList() {
  const [ago, setAgo] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setAgo((a) => (a + 1) % 60), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={`flex min-w-0 flex-col gap-3 p-4 sm:p-5 ${card}`}>
      <b className="flex items-center gap-2 text-[15px]"><Building2 className="h-4 w-4 text-[#1D6FD8]" /> Suppliers</b>
      {SUPPLIERS.map((s, i) => (
        <div key={s.name} className="flex items-center gap-3 rounded-2xl border border-[#0B2340]/8 p-3 text-sm">
          <span aria-hidden="true" className="h-9 w-9 flex-none rounded-full border-[3px]" style={{ borderColor: s.colour }} />
          <span className="flex min-w-0 flex-1 flex-col">
            <b className="truncate">{s.name}</b>
            <span className={`truncate text-xs ${muted}`}>{s.kind}</span>
          </span>
          <span className="hidden flex-none flex-col items-end sm:flex">
            <span className={`${mono} text-xs`}>{s.bookings} bookings</span>
            <span className={`flex items-center gap-1 ${mono} text-[11px] ${muted}`}>
              {s.status === "Manual" ? s.last : <><RefreshCw className="h-3 w-3" /> {(ago + i * 17) % 60}s ago</>}
            </span>
          </span>
          <span className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-bold ${s.status === "Live" ? "bg-[#16A34A]/12 text-[#15803D]" : s.status === "Example" ? "bg-[#FFB547]/25 text-[#7A3A00]" : "bg-[#0B2340]/8 text-[#4B6280]"}`}>{s.status}</span>
        </div>
      ))}
      <span className={`text-xs ${muted}`}>Contacts, contracts, commission and statements for each supplier, kept in TribeTravel.</span>
    </div>
  );
}

/** The dashboard in a browser frame, as the agency sees it. */
export function DashboardFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-white/80 bg-[#EEF3F9]/80 shadow-[0_50px_100px_-50px_rgba(11,35,64,.55)] backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-[#0B2340]/8 bg-white/70 px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">{["#FF6159", "#FFBD2E", "#28C941"].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}</span>
        <span className={`flex min-w-0 flex-1 items-center gap-2 truncate rounded-full bg-[#F5F8FC] px-4 py-1.5 ${mono} text-xs ${muted}`}>tribetravel.io/app/dashboard <ArrowUpRight className="h-3 w-3" /></span>
        <ExampleTag />
      </div>
      <div className="flex flex-col gap-4 p-3 sm:p-5">{children}</div>
    </div>
  );
}
