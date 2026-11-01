// Stop 6: the client's own account. Sign in and register are TribeTravel's pages on the agency's address
// (<slug>.tribetravel.io/my-trips), so passwords and passports never pass through this site.
import { ArrowRight, CreditCard, FileText, MessageCircle, ReceiptText, ShieldCheck, UserRound } from "lucide-react";
import { ACCOUNT_URL } from "@/lib/site-content";
import { StopLabel } from "@/designs/enterprise/parts";
import { btn, ghost, gutter, h2, label, mono, orange, panel, soft } from "@/designs/enterprise/theme";

const WHAT: [typeof ReceiptText, string, string][] = [
  [ReceiptText, "Your quotes", "Every quote, its status and the full details."],
  [CreditCard, "Payments due", "What's still to pay, when it's due, and a Pay button."],
  [MessageCircle, "Messages", "Your conversations with your consultant, in one place."],
  [FileText, "Travel documents", "Vouchers, tickets and your itinerary, ready to download."],
  [ShieldCheck, "Passports, sent securely", "Upload passports and IDs. Stored encrypted; only your consultant can open them."],
];

export function YourAccount() {
  return (
    <section id="account" data-stop className={`relative z-10 grid scroll-mt-20 items-center gap-12 ${gutter} py-24 md:py-28 lg:grid-cols-[1fr_1fr]`}>
      <div className="flex flex-col gap-5">
        <StopLabel><UserRound className="h-4 w-4" /> Stop 6 · Your account</StopLabel>
        <h2 className={h2}>Your trips, <span className={orange}>all in one place.</span></h2>
        <p className={`text-lg leading-relaxed ${soft}`}>
          Create your account with your name, email and mobile. We email you a link to set your password, and from then on everything for your trip is here.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href={`${ACCOUNT_URL}/login`} className={`${btn} min-h-14 px-8`}>Sign in <ArrowRight className="h-4 w-4" /></a>
          <a href={`${ACCOUNT_URL}/register`} className={`${ghost} min-h-14 px-8`}>Create my account</a>
        </div>
        <p className={`text-sm ${soft}`}>Already travelled with us? Use the email we have for you and your trips show straight away.</p>
      </div>
      <ul className={`flex flex-col divide-y divide-[#EDE6D8]/10 p-2 ${panel}`}>
        {WHAT.map(([Icon, title, text]) => (
          <li key={title} className="flex items-start gap-4 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF6A2E]/15"><Icon className={`h-5 w-5 ${orange}`} /></span>
            <span className="flex flex-col gap-0.5"><b>{title}</b><span className={`text-sm ${soft}`}>{text}</span></span>
          </li>
        ))}
        <li className={`p-4 ${label} ${mono} ${soft}`}>Secure sign-in by TribeTravel</li>
      </ul>
    </section>
  );
}
