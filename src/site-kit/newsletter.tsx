// The newsletter sign-up every Tribe Site includes. Until TribeTravel has a newsletter endpoint it arrives in the
// agency's Enquiries inbox marked as a sign-up, as in the Atlas design.
import { BotTrap, FormStatus } from "@/designs/shared";
import { useEnquiry } from "@/lib/enquiry";
import { skinFor } from "@/site-kit/skins";

export function Newsletter({ id }: { id: string }) {
  const name = skinFor(id)?.concept.name ?? "this";
  const { status, sending, onSubmit } = useEnquiry(() => ({
    name: "Newsletter sign-up",
    message: `Newsletter sign-up from the ${name} demo site.`,
  }));
  return (
    <section className="tk-news" aria-label="Newsletter">
      <div>
        <h2>Travel ideas, now and then.</h2>
        <p>One short email with places worth knowing about. Unsubscribe whenever you like.</p>
      </div>
      <form onSubmit={onSubmit}>
        <BotTrap />
        <label>
          Email for the newsletter
          <input name="email" type="email" required autoComplete="email" maxLength={200} />
        </label>
        <label className="plan-consent">
          <input type="checkbox" name="consent" required /> Send me the newsletter. I agree that my
          email address will be sent to the demo agency through TribeTravel.{" "}
          <a href={`/designs/${id}/privacy`}>Privacy (POPIA)</a>
        </label>
        <button className="concept-cta" disabled={sending || status.kind === "sent"}>
          {status.kind === "sent" ? "Subscribed" : sending ? "Subscribing…" : "Subscribe"}
        </button>
        <FormStatus status={status} />
      </form>
    </section>
  );
}
