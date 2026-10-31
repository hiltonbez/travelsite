// Accept and pay: the customer accepts a quote and pays the deposit online (Paystack on a live site). On the sample
// it is a demo: no card details are asked for and no payment is taken.
import { useState } from "react";
import { Check, CreditCard, Landmark, Lock, QrCode } from "lucide-react";
import { StopLabel } from "@/designs/enterprise/parts";
import { btn, gutter, h2, label, mono, orange, panel, soft } from "@/designs/enterprise/theme";

const LINES: [string, string][] = [
  ["Paradis Beachcomber, 7 nights, half board", "R61,200"],
  ["Return flights JNB → MRU, 2 adults", "R14,800"],
  ["Private transfers", "R2,400"],
];

export function AcceptAndPay() {
  const [step, setStep] = useState<"invoice" | "checkout" | "paid">("invoice");
  return (
    <section id="pay" data-stop className={`relative z-10 grid scroll-mt-20 items-center gap-12 ${gutter} py-24 md:py-28 lg:grid-cols-[.9fr_1.1fr]`}>
      <div className="flex flex-col gap-5">
        <StopLabel><CreditCard className="h-4 w-4" /> Stop 5 · Accept and pay</StopLabel>
        <h2 className={h2}>Say yes. <span className={orange}>Pay the deposit.</span></h2>
        <p className={`text-lg leading-relaxed ${soft}`}>
          Accept your quote online and pay the deposit by card, EFT or QR code. The payment is matched to your booking and posted to our books, and your consultant is told straight away.
        </p>
      </div>
      <div className={`flex flex-col gap-5 p-6 md:p-8 ${panel}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`${label} ${soft}`}>Invoice INV-2207 · Quote Q-1052</span>
          <span className={`rounded-full bg-[#FF6A2E]/15 px-3 py-1 ${label} ${orange}`}>Demo</span>
        </div>
        <ul className="flex flex-col gap-2 text-sm">
          {LINES.map(([k, v]) => (
            <li key={k} className="flex justify-between gap-4 border-b border-[#EDE6D8]/8 pb-2"><span className={soft}>{k}</span><span className={`${mono} tabular-nums`}>{v}</span></li>
          ))}
          <li className="flex justify-between gap-4 pt-1"><b>Total</b><b className={`${mono} tabular-nums`}>R78,400</b></li>
          <li className="flex justify-between gap-4"><b className={orange}>Deposit due now (25%)</b><b className={`${mono} tabular-nums ${orange}`}>R19,600</b></li>
        </ul>

        {step === "invoice" && (
          <button type="button" onClick={() => setStep("checkout")} className={`${btn} min-h-14`}>Accept and pay deposit</button>
        )}
        {step === "checkout" && (
          <div className="d-slide flex flex-col gap-3 rounded-2xl border border-[#EDE6D8]/12 bg-[#0B1424] p-5">
            <span className={`flex items-center gap-2 text-sm ${soft}`}><Lock className="h-4 w-4" /> Secure checkout by Paystack</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {([[CreditCard, "Card"], [Landmark, "Instant EFT"], [QrCode, "QR code"]] as const).map(([Icon, name]) => (
                <button key={name} type="button" onClick={() => setStep("paid")}
                  className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-[#EDE6D8]/20 font-semibold transition hover:border-[#FF6A2E]">
                  <Icon className="h-5 w-5" /> {name}
                </button>
              ))}
            </div>
            <p className={`text-xs ${soft}`}>This is a demo: pick a method to see what happens next. No card details are asked for and no money moves.</p>
          </div>
        )}
        {step === "paid" && (
          <div role="status" className="d-slide flex items-start gap-3 rounded-2xl border border-[#4ADE80]/40 bg-[#4ADE80]/10 p-5 text-sm">
            <Check className="mt-0.5 h-5 w-5 flex-none text-[#4ADE80]" />
            <span><b>Deposit paid (demo).</b> Your booking is confirmed, a receipt is on its way by email and WhatsApp, and Thandi has been told. The balance is due 45 days before you fly.</span>
          </div>
        )}
      </div>
    </section>
  );
}
