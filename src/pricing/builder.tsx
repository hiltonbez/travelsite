// The quote builder: pick a package, add components and a care plan, and see the once-off and monthly totals. What a
// package already includes shows as included; counts (pages, looks, suppliers) add on top of what it has.
import { Check, Minus, Plus } from "lucide-react";
import { ADD_ONS, CARE_PLANS, MAILBOX, PACKAGES, rand, type AddOn, type PackageId } from "@/pricing/data";
import { quoteLines, quoteTotals, type Choice } from "@/pricing/quote";
import { btn, card, eyebrow, h2, muted, soft, wrap } from "@/pricing/theme";

function Stepper({ value, max, onChange, name }: { value: number; max: number; onChange: (n: number) => void; name: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-[#C9D6EA] bg-white p-1">
      <button type="button" aria-label={`Fewer: ${name}`} disabled={value <= 0} onClick={() => onChange(value - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#0B1D3A] hover:bg-[#EAF2FF] disabled:opacity-30"><Minus className="h-4 w-4" /></button>
      <span className="w-7 text-center text-[15px] font-bold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" aria-label={`More: ${name}`} disabled={value >= max} onClick={() => onChange(value + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#0B1D3A] hover:bg-[#EAF2FF] disabled:opacity-30"><Plus className="h-4 w-4" /></button>
    </div>
  );
}

function AddOnRow({ a, pkg, qty, onChange }: { a: AddOn; pkg: PackageId; qty: number; onChange: (n: number) => void }) {
  const inc = a.included[pkg];
  const price = a.onRequest ? <span className="text-[13px] font-semibold text-[#1E6FE6]">Price on request</span>
    : <span className="text-[13px] font-semibold text-[#0B1D3A]">{rand(a.once)}{a.unit ? ` per ${a.unit}` : ""}{a.monthly ? <span className={muted}> + {rand(a.monthly)}/month</span> : null}</span>;
  if (a.kind === "toggle") {
    const on = inc > 0 || qty > 0;
    return (
      <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${inc ? "cursor-default border-[#8FE3C3] bg-[#E4F8F4]/60" : on ? "border-[#1E6FE6] bg-[#EAF2FF]" : "border-[#E4E9F1] bg-white hover:border-[#C9D6EA]"}`}>
        <input type="checkbox" className="peer sr-only" checked={on} disabled={inc > 0} onChange={(e) => onChange(e.target.checked ? 1 : 0)} />
        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 peer-focus-visible:ring-4 peer-focus-visible:ring-[#1E6FE6]/25 ${on ? "border-transparent bg-[#1E6FE6] text-white" : "border-[#C9D6EA]"} ${inc ? "!bg-[#0a7a52]" : ""}`}>
          {on && <Check className="h-4 w-4" strokeWidth={3} />}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[14px] font-bold text-[#16233B]">{a.name}</span>
          <span className={`text-[12px] ${muted}`}>{a.hint}</span>
          {inc ? <span className="text-[12px] font-bold text-[#0a7a52]">Included in this package</span> : price}
        </span>
      </label>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#E4E9F1] bg-white p-4">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[14px] font-bold text-[#16233B]">{a.name}</span>
        <span className={`text-[12px] ${muted}`}>{a.hint}</span>
        <span className="flex flex-wrap gap-x-2">{price}{inc > 0 && <span className="text-[12px] font-bold text-[#0a7a52]">{inc} already included</span>}</span>
      </span>
      <Stepper name={a.name} value={qty} max={a.max ?? 10} onChange={onChange} />
    </div>
  );
}

export function Builder({ choice, setChoice }: { choice: Choice; setChoice: (c: Choice) => void }) {
  const set = (patch: Partial<Choice>) => setChoice({ ...choice, ...patch });
  const lines = quoteLines(choice);
  const t = quoteTotals(lines);
  return (
    <section id="builder" className={`${wrap} flex scroll-mt-20 flex-col gap-8`}>
      <div className="flex flex-col gap-3">
        <span className={eyebrow}>Quote builder</span>
        <h2 className={h2}>Build your website, see the price.</h2>
        <p className={`max-w-[62ch] text-[16px] ${soft}`}>Choose a package, add what you need, and pick a care plan. The totals update as you go. When it looks right, send it to us below for an official quote.</p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-8">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-[15px] font-extrabold text-[#0B1D3A]">1. Your package</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {PACKAGES.map((p) => {
                const on = choice.pkg === p.id;
                return (
                  <label key={p.id} className={`flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-4 transition ${on ? "border-[#1E6FE6] bg-[#EAF2FF]" : "border-[#E4E9F1] bg-white hover:border-[#C9D6EA]"}`}>
                    <input type="radio" name="pkg" className="sr-only" checked={on} onChange={() => set({ pkg: p.id })} />
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[15px] font-extrabold text-[#0B1D3A]">{p.name}</span>
                      {p.popular && <span className="rounded-full bg-[#FF6B6B] px-2 py-0.5 text-[10px] font-extrabold tracking-[0.08em] text-white">POPULAR</span>}
                    </span>
                    <span className="text-[20px] font-extrabold text-[#0B1D3A]">{p.from ? <span className="text-[13px] font-semibold">from </span> : null}{rand(choice.tribe ? p.tribe : p.other)}</span>
                    <span className={`text-[12px] ${muted}`}>{p.pages} pages{p.monthly ? ` · features ${rand(p.monthly)}/month` : ""}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-[15px] font-extrabold text-[#0B1D3A]">2. Add components</legend>
            {(["count", "toggle"] as const).map((kind) => (
              <div key={kind} className={`grid gap-3 ${kind === "toggle" ? "sm:grid-cols-2" : ""}`}>
                {ADD_ONS.filter((a) => a.kind === kind).map((a) => (
                  <AddOnRow key={a.id} a={a} pkg={choice.pkg} qty={choice.extras[a.id] ?? 0}
                    onChange={(n) => set({ extras: { ...choice.extras, [a.id]: n } })} />
                ))}
              </div>
            ))}
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-[15px] font-extrabold text-[#0B1D3A]">3. Care plan <span className={`font-medium ${muted}`}>(every site takes one)</span></legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {CARE_PLANS.map((c) => {
                const on = choice.care === c.id;
                return (
                  <label key={c.id} className={`flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-4 transition ${on ? "border-[#1E6FE6] bg-[#EAF2FF]" : "border-[#E4E9F1] bg-white hover:border-[#C9D6EA]"}`}>
                    <input type="radio" name="care" className="sr-only" checked={on} onChange={() => set({ care: c.id })} />
                    <span className="text-[15px] font-extrabold text-[#0B1D3A]">{c.name}</span>
                    <span className="text-[18px] font-extrabold text-[#0B1D3A]">{rand(c.monthly)}<span className={`text-[12px] font-semibold ${muted}`}>/month</span></span>
                    <span className={`text-[12px] ${muted}`}>{c.hint}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[#E4E9F1] bg-white p-4">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[14px] font-bold text-[#16233B]">{MAILBOX.name}</span>
                <span className={`text-[12px] ${muted}`}>{MAILBOX.hint}</span>
                <span className="text-[13px] font-semibold text-[#0B1D3A]">{rand(MAILBOX.monthly)} per mailbox a month</span>
              </span>
              <Stepper name="mailboxes" value={choice.mailboxes} max={50} onChange={(n) => set({ mailboxes: n })} />
            </div>
          </fieldset>
        </div>

        {/* The running total */}
        <aside className={`${card} sticky top-20 flex flex-col gap-4 overflow-hidden p-0 shadow-[0_24px_60px_-30px_rgba(11,29,58,.35)]`} aria-label="Your quote">
          <div className="bg-[linear-gradient(135deg,#0B1D3A,#1E6FE6)] p-6 text-white">
            <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8FE3C3]">Your quote</div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div><div className="text-[12px] text-[#C9D6EA]">Once-off</div><div className="text-[34px] font-extrabold leading-none tabular-nums">{rand(t.once)}</div></div>
              <div className="text-right"><div className="text-[12px] text-[#C9D6EA]">Monthly</div><div className="text-[22px] font-extrabold leading-none tabular-nums">{rand(t.monthly)}</div></div>
            </div>
            {!choice.tribe && <div className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-[12px]">Non-TribeTravel prices. On TribeTravel this package is {rand(PACKAGES.find((p) => p.id === choice.pkg)!.tribe)}.</div>}
          </div>
          <ul className="flex flex-col gap-2 px-6 text-[13px]">
            {lines.map((l) => (
              <li key={l.label} className="flex justify-between gap-3">
                <span className={soft}>{l.label}{l.qty > 1 ? ` × ${l.qty}` : ""}</span>
                <span className="shrink-0 text-right font-semibold tabular-nums text-[#16233B]">
                  {l.onRequest ? "On request" : <>{l.once ? rand(l.once) : ""}{l.once && l.monthly ? " + " : ""}{l.monthly ? `${rand(l.monthly)}/m` : ""}</>}
                </span>
              </li>
            ))}
          </ul>
          <div className="mx-6 flex flex-col gap-1.5 border-t border-[#E4E9F1] pt-4 text-[13px]">
            <div className="flex justify-between"><span className={muted}>50% deposit to start</span><b className="tabular-nums">{rand(t.deposit)}</b></div>
            <div className="flex justify-between"><span className={muted}>50% at go-live</span><b className="tabular-nums">{rand(t.once - t.deposit)}</b></div>
            <div className="flex justify-between"><span className={muted}>First year, all in</span><b className="tabular-nums">{rand(t.first_year)}</b></div>
          </div>
          <div className="px-6 pb-6">
            <a href="#request" className={`${btn} w-full`}>Send this for an official quote</a>
            <p className={`mt-3 text-[11px] leading-snug ${muted}`}>An estimate from our price book. Your official quote confirms it. Supplier API contracts, Meta WhatsApp message fees and your domain are your own costs.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
