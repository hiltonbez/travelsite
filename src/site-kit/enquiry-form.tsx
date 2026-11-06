// The quote and contact forms of a Tribe Site: they go to the agency's TribeTravel Enquiries inbox through
// useEnquiry, only after the visitor ticks the consent box and presses send.
import { BotTrap, FormStatus, monthWords } from "@/designs/shared";
import { useEnquiry } from "@/lib/enquiry";
import { PLACES } from "@/site-kit/content";
import { skinFor } from "@/site-kit/skins";

type Props = { id: string; kind: "quote" | "contact"; place?: string };

export function EnquiryForm({ id, kind, place = "" }: Props) {
  const concept = skinFor(id)?.concept;
  const name = concept?.name ?? "";
  const quote = kind === "quote";
  const { status, sending, onSubmit } = useEnquiry((fd) => ({
    travel_dates: monthWords(String(fd.get("travel_dates") ?? "")),
    message: `Sent from the ${name} demo site (${kind} form).\n${String(fd.get("message") ?? "")}`,
  }));
  const family = concept?.audience === "Family";
  return (
    <section className="concept-plan tk-plan" id="plan">
      <div>
        <h2>{quote ? "Tell us about your trip." : "Send us a message."}</h2>
        <p>
          Your request goes to the Sun-Set Travel demo agency in TribeTravel. Nothing is sent until
          you press the button.
        </p>
        <span className="plan-note">
          No payment. No obligation.
          <br />A personal quote, prepared by your agent.
        </span>
      </div>
      <form onSubmit={onSubmit}>
        <BotTrap />
        <div className="plan-fields">
          <label>
            Your name
            <input name="name" autoComplete="name" required maxLength={120} />
          </label>
          <label>
            Email address
            <input name="email" type="email" autoComplete="email" required maxLength={200} />
          </label>
          <label>
            Phone (optional)
            <input name="phone" type="tel" autoComplete="tel" maxLength={50} />
          </label>
          {quote && (
            <>
              <label>
                Where would you like to go?
                <input
                  name="destination"
                  list="tk-places"
                  defaultValue={place.slice(0, 200)}
                  required
                  maxLength={200}
                />
                <datalist id="tk-places">
                  {PLACES.map((p) => (
                    <option key={p.slug} value={p.name} />
                  ))}
                </datalist>
              </label>
              <label>
                Preferred month
                <input name="travel_dates" type="month" required />
              </label>
              <label>
                {family ? "Adults, children and their ages" : "Who’s travelling?"}
                <input
                  name="travellers"
                  placeholder={family ? "2 adults, children aged 5 and 9" : "e.g. 2 adults"}
                  required
                  maxLength={200}
                />
              </label>
            </>
          )}
        </div>
        <label>
          {quote ? "Anything that would make it special?" : "Your message"}
          <textarea name="message" rows={3} maxLength={3000} required={!quote} />
        </label>
        <label className="plan-consent">
          <input type="checkbox" name="consent" required /> I agree that this request and my details
          will be sent to the demo agency through TribeTravel so they can contact me.{" "}
          <a href={`/designs/${id}/privacy`}>Privacy (POPIA)</a>
        </label>
        <button className="concept-cta" disabled={sending || status.kind === "sent"}>
          {sending
            ? "Sending…"
            : status.kind === "sent"
              ? "Request received"
              : quote
                ? "Request my personal quote"
                : "Send my message"}
        </button>
        <FormStatus status={status} />
      </form>
    </section>
  );
}
