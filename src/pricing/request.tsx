// The request form: the agency's details and requirements plus the quote they built, sent to TribeTravel, which emails
// it to Hilton (QUOTE_TO) to turn into an official quote. Nothing is sent anywhere else.
import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { PACKAGES, QUOTE_TO, QUOTE_URL, rand, type PackageId } from "@/pricing/data";
import { quoteLines, quoteTotals, type Choice } from "@/pricing/quote";
import { btn, card, eyebrow, h2, input, label, muted, soft, wrap } from "@/pricing/theme";

type Status = { kind: "idle" | "sending" | "sent" | "error"; message?: string };

const TIMELINES = ["As soon as possible", "Within a month", "In 1 to 3 months", "Just getting prices for now"];

export function RequestForm({ choice, setChoice }: { choice: Choice; setChoice: (c: Choice) => void }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const t = quoteTotals(quoteLines(choice));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const field = (k: string) => String(fd.get(k) ?? "").trim();
    const lines = quoteLines(choice);
    const pkg = PACKAGES.find((p) => p.id === choice.pkg)!;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch(QUOTE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "omit",
        body: JSON.stringify({
          name: field("name"), agency: field("agency"), email: field("email"), phone: field("phone"),
          website: field("website"), hosting: field("hosting"), tribe: choice.tribe ? "yes" : "no", package: pkg.name,
          timeline: field("timeline"), requirements: field("requirements"), consent: fd.get("consent") === "on",
          botcheck: fd.get("botcheck") ? "1" : "", items: lines, totals: quoteTotals(lines),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      form.reset();
      setStatus({ kind: "sent" });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error && err.message && !err.message.startsWith("HTTP") && err.message !== "Failed to fetch"
        ? err.message : `Sorry, that didn't send. Please try again, or email ${QUOTE_TO}.` });
    }
  }

  return (
    <section id="request" className={`${wrap} scroll-mt-20`}>
      <div className={`${card} grid overflow-hidden lg:grid-cols-[.8fr_1.2fr]`}>
        <div className="flex flex-col gap-5 bg-[radial-gradient(120%_80%_at_0%_0%,#00B5C8_0%,transparent_60%),linear-gradient(160deg,#0B1D3A,#13306a)] p-8 text-white sm:p-10">
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8FE3C3]">Get your official quote</span>
          <h2 className="text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.08] tracking-[-0.02em]">Send us your quote and we'll make it official.</h2>
          <p className="text-[15px] leading-relaxed text-[#C9D6EA]">Tell us about your agency and what you need. Hilton reads every request and comes back to you with an official quote, usually within one working day.</p>
          <div className="mt-auto rounded-2xl bg-white/10 p-5">
            <div className="text-[12px] text-[#C9D6EA]">Your quote so far</div>
            <div className="mt-1 text-[15px] font-bold">{PACKAGES.find((p) => p.id === choice.pkg)!.name}{choice.tribe ? "" : " · not on TribeTravel"}</div>
            <div className="mt-2 flex gap-6">
              <div><div className="text-[24px] font-extrabold tabular-nums">{rand(t.once)}</div><div className="text-[12px] text-[#C9D6EA]">once-off</div></div>
              <div><div className="text-[24px] font-extrabold tabular-nums">{rand(t.monthly)}</div><div className="text-[12px] text-[#C9D6EA]">a month</div></div>
            </div>
            <a href="#builder" className="mt-3 inline-block text-[13px] font-bold text-[#8FE3C3] underline-offset-4 hover:underline">Change it in the builder</a>
          </div>
        </div>

        {status.kind === "sent" ? (
          <div className="flex flex-col items-start justify-center gap-4 p-8 sm:p-10" role="status">
            <CheckCircle2 className="h-12 w-12 text-[#0a7a52]" />
            <h3 className="text-[26px] font-extrabold text-[#0B1D3A]">Thank you, it's on its way.</h3>
            <p className={`text-[15px] ${soft}`}>Hilton has your details and your quote, and will come back to you with an official quote soon.</p>
            <button type="button" className="text-[14px] font-bold text-[#1E6FE6]" onClick={() => setStatus({ kind: "idle" })}>Send another request</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2 sm:p-10">
            <span className={`${eyebrow} sm:col-span-2`}>Your details</span>
            <label className={label}>Your name<input name="name" required autoComplete="name" className={input} /></label>
            <label className={label}>Agency name<input name="agency" required autoComplete="organization" className={input} /></label>
            <label className={label}>Email<input name="email" type="email" required autoComplete="email" className={input} /></label>
            <label className={label}>Phone <span className={`font-normal ${muted}`}>(optional)</span><input name="phone" type="tel" autoComplete="tel" className={input} /></label>
            <label className={label}>Your website today <span className={`font-normal ${muted}`}>(if you have one)</span>
              <input name="website" type="url" inputMode="url" placeholder="https://" className={input} /></label>
            <label className={label}>Who hosts it now? <span className={`font-normal ${muted}`}>(if you know)</span>
              <input name="hosting" placeholder="e.g. Afrihost, Wix, Xneelo" className={input} /></label>

            <span className={`${eyebrow} mt-2 sm:col-span-2`}>What you'd like</span>
            <label className={label}>Package
              <select value={choice.pkg} onChange={(e) => setChoice({ ...choice, pkg: e.target.value as PackageId })} className={input}>
                {PACKAGES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select></label>
            <label className={label}>Are you on TribeTravel?
              <select value={choice.tribe ? "yes" : "no"} onChange={(e) => setChoice({ ...choice, tribe: e.target.value === "yes" })} className={input}>
                <option value="yes">Yes, a paying subscriber</option>
                <option value="no">No, not yet</option>
              </select></label>
            <label className={`${label} sm:col-span-2`}>When do you need it?
              <select name="timeline" defaultValue={TIMELINES[1]} className={input}>
                {TIMELINES.map((x) => <option key={x}>{x}</option>)}
              </select></label>
            <label className={`${label} sm:col-span-2`}>Your requirements
              <textarea name="requirements" rows={5} placeholder="What should the site do? Suppliers you work with, pages you need, anything you like on other sites…"
                className={`${input} min-h-32 py-3`} /></label>
            <p className={`text-[12px] sm:col-span-2 ${muted}`}>The add-ons and care plan you chose in the builder are sent with this form.</p>

            <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <label className="flex items-start gap-3 text-[13px] text-[#45536b] sm:col-span-2">
              <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 shrink-0 accent-[#1E6FE6]" />
              I agree that AiFundi and TribeTravel may use these details to prepare my quote and contact me about it (POPIA). They're never shared with anyone else.
            </label>
            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
              <button type="submit" className={btn} disabled={status.kind === "sending"}>
                {status.kind === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {status.kind === "sending" ? "Sending…" : "Send my quote request"}
              </button>
              {status.kind === "error" && <p role="alert" className="text-[13px] font-semibold text-[#E8493F]">{status.message}</p>}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
