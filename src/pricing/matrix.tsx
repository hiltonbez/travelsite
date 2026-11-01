// The feature matrix: every package side by side, what it includes and what it costs. A table from laptop width up; on
// a phone or tablet, one package at a time with tabs, so nothing scrolls sideways.
import { useEffect, useRef, useState } from "react";
import { Check, Minus, Sparkles } from "lucide-react";
import { MATRIX, ORDER, PACKAGES, rand, type Package, type PackageId } from "@/pricing/data";
import { eyebrow, h2, muted, soft, wrap } from "@/pricing/theme";

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#E4F8F4] text-[#0a7a52]" aria-label="Included"><Check className="h-4 w-4" strokeWidth={3} /></span>;
  if (v === false) return <span className="inline-flex h-7 w-7 items-center justify-center text-[#C9D6EA]" aria-label="Not included"><Minus className="h-4 w-4" /></span>;
  return <span className="text-[13px] font-bold text-[#0B1D3A]">{v}</span>;
}

function Price({ p, tribe, dark }: { p: Package; tribe: boolean; dark?: boolean }) {
  const quiet = dark ? "text-[#C9D6EA]" : "text-[#6b7b93]";
  return (
    <div className="flex flex-col gap-1">
      <span className={`text-[13px] font-semibold ${quiet}`}>{p.from ? "from " : ""}once-off{tribe ? ", on TribeTravel" : ""}</span>
      <span className={`text-[30px] font-extrabold leading-none tracking-[-0.02em] ${dark ? "text-white" : "text-[#0B1D3A]"}`}>{rand(tribe ? p.tribe : p.other)}</span>
      <span className={`text-[12px] ${quiet}`}>
        {tribe ? <>Not on TribeTravel: <b className={dark ? "text-[#FF6B6B]" : "text-[#E8493F]"}>{rand(p.other)}</b></>
          : <>On TribeTravel: <b className={dark ? "text-[#8FE3C3]" : "text-[#0a7a52]"}>{rand(p.tribe)}</b></>}
      </span>
    </div>
  );
}

function Head({ p, tribe, onPick }: { p: Package; tribe: boolean; onPick: (id: PackageId) => void }) {
  return (
    <div className={`relative flex h-full flex-col gap-3 rounded-3xl p-5 ${p.popular ? "bg-[#0B1D3A] text-white" : "bg-[#F5F8FB]"}`}>
      {p.popular && <span className="absolute -top-3 left-5 rounded-full bg-[#FF6B6B] px-3 py-1 text-[11px] font-extrabold tracking-[0.1em] text-white">MOST POPULAR</span>}
      <div>
        <div className={`text-[18px] font-extrabold ${p.popular ? "text-white" : "text-[#0B1D3A]"}`}>{p.name}</div>
        <p className={`mt-1 text-[13px] leading-snug ${p.popular ? "text-[#C9D6EA]" : soft}`}>{p.tagline}</p>
      </div>
      <Price p={p} tribe={tribe} dark={!!p.popular} />
      <div className="mt-auto flex flex-col gap-2">
        <button type="button" onClick={() => onPick(p.id)}
          className={`min-h-11 whitespace-nowrap rounded-full px-4 text-[14px] font-bold transition ${p.popular ? "bg-[#8FE3C3] text-[#0B1D3A] hover:bg-white" : "bg-[#1E6FE6] text-white hover:bg-[#1760cc]"}`}>
          Build my quote
        </button>
        <a href={p.href} className={`text-center text-[13px] font-semibold underline-offset-4 hover:underline ${p.popular ? "text-[#8FE3C3]" : "text-[#1E6FE6]"}`}>See the {p.design} design</a>
      </div>
      <p className={`border-t pt-3 text-[12px] ${p.popular ? "border-white/15 text-[#C9D6EA]" : `border-[#E4E9F1] ${muted}`}`}>
        Typical agency price <b className={p.popular ? "text-white" : "text-[#16233B]"}>{p.market}</b>
      </p>
    </div>
  );
}

/** The slim package names that stay at the top of the screen once the big package cards scroll away. */
function StuckHead({ p, tribe }: { p: Package; tribe: boolean }) {
  return (
    <div className={`flex h-full flex-col items-center justify-center rounded-b-2xl px-2 py-2 shadow-[0_10px_24px_-14px_rgba(11,29,58,.45)] ${p.popular ? "bg-[#0B1D3A] text-white" : "bg-white text-[#0B1D3A] ring-1 ring-[#E4E9F1]"}`}>
      <span className="text-[15px] font-extrabold leading-tight">{p.name}</span>
      <span className={`text-[12px] font-semibold ${p.popular ? "text-[#8FE3C3]" : "text-[#6b7b93]"}`}>{p.from ? "from " : ""}{rand(tribe ? p.tribe : p.other)}</span>
    </div>
  );
}

export function Matrix({ tribe, onPick }: { tribe: boolean; onPick: (id: PackageId) => void }) {
  const [focus, setFocus] = useState<PackageId>("pro");
  const fi = ORDER.indexOf(focus);
  const fp = PACKAGES[fi]!;
  // The slim names show only once the package cards have scrolled off the top
  const heads = useRef<HTMLTableRowElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = heads.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e!.isIntersecting && e!.boundingClientRect.top < 0), { rootMargin: "-90px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section id="compare" className={`${wrap} flex scroll-mt-20 flex-col gap-8`}>
      <div className="flex flex-col gap-3">
        <span className={eyebrow}>Compare the packages</span>
        <h2 className={h2}>What's in each package.</h2>
        <p className={`max-w-[60ch] text-[16px] ${soft}`}>Every package includes everything in the one before it. Each one comes with its own sample design, so you can see it working.</p>
      </div>

      {/* Phone and tablet: one package at a time */}
      <div className="flex flex-col gap-4 lg:hidden">
        <div role="tablist" aria-label="Package" className="sticky top-0 z-20 -mx-1 grid grid-cols-2 gap-2 bg-[#F5F8FB] px-1 py-2 sm:grid-cols-4">
          {PACKAGES.map((p) => (
            <button key={p.id} type="button" role="tab" aria-selected={focus === p.id} onClick={() => setFocus(p.id)}
              className={`min-h-11 rounded-xl px-3 text-[13px] font-bold transition ${focus === p.id ? "bg-[#0B1D3A] text-white" : "bg-[#F5F8FB] text-[#0B1D3A]"}`}>
              {p.name}
            </button>
          ))}
        </div>
        <Head p={fp} tribe={tribe} onPick={onPick} />
        {MATRIX.map((g) => (
          <div key={g.title} className="flex flex-col">
            <div className="py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#1E6FE6]">{g.title}</div>
            {g.rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-4 border-t border-[#E4E9F1] py-3">
                <div className="min-w-0"><div className="text-[14px] font-semibold text-[#16233B]">{r.label}</div><div className={`text-[12px] ${muted}`}>{r.hint}</div></div>
                <div className="shrink-0"><Cell v={r.cells[fi]!} /></div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Laptop and up: the full table */}
      <div className="hidden lg:block">
        <table className="w-full table-fixed border-separate border-spacing-x-2">
          <caption className="sr-only">Features and prices of each website package</caption>
          <colgroup><col className="w-[30%]" /><col /><col /><col /><col /></colgroup>
          <thead>
            <tr ref={heads}>
              <th scope="col" className="align-bottom"><span className="sr-only">Feature</span>
                <div className="flex flex-col gap-2 pb-2 text-left text-[13px] font-medium text-[#6b7b93]"><Sparkles className="h-5 w-5 text-[#00B5C8]" />Prices are once-off. Monthly costs are in the quote builder below.</div>
              </th>
              {PACKAGES.map((p) => <th key={p.id} scope="col" className="pt-4 align-top font-normal"><Head p={p} tribe={tribe} onPick={onPick} /></th>)}
            </tr>
            {/* No height of its own: it floats over the rows while the table scrolls */}
            <tr aria-hidden="true">
              <td className="sticky top-0 z-20 h-0 p-0" />
              {PACKAGES.map((p) => (
                <td key={p.id} className="sticky top-0 z-20 h-0 p-0">
                  <div className={`absolute inset-x-0 top-0 h-[58px] transition-opacity duration-200 ${stuck ? "opacity-100" : "pointer-events-none opacity-0"}`}><StuckHead p={p} tribe={tribe} /></div>
                </td>
              ))}
            </tr>
          </thead>
          {MATRIX.map((g) => (
            <tbody key={g.title}>
              <tr><th colSpan={5} scope="colgroup" className="pt-8 pb-2 text-left text-[12px] font-bold uppercase tracking-[0.12em] text-[#1E6FE6]">{g.title}</th></tr>
              {g.rows.map((r) => (
                <tr key={r.label} className="group">
                  <th scope="row" className="border-t border-[#E4E9F1] py-3 pr-4 text-left align-middle font-normal group-hover:bg-[#F5F8FB]">
                    <div className="text-[14px] font-semibold text-[#16233B]">{r.label}</div>
                    <div className={`text-[12px] ${muted}`}>{r.hint}</div>
                  </th>
                  {r.cells.map((c, i) => (
                    <td key={i} className={`border-t border-[#E4E9F1] py-3 text-center align-middle group-hover:bg-[#F5F8FB] ${PACKAGES[i]!.popular ? "bg-[#EAF2FF]/60" : ""}`}><Cell v={c} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}
