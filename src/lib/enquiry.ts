// Sends a website enquiry to the agency's TribeTravel Enquiries inbox. Used by the enquiry form and by every
// design's quote form (src/designs/).
import { useState, type FormEvent } from "react";
import { contact } from "@/lib/contact";

export type EnquiryFields = {
  name: string;
  email: string;
  phone?: string;
  destination?: string;
  travel_dates?: string;
  travellers?: string;
  message?: string;
};

export const THANKS = "Thanks! Your enquiry is on its way. We'll be in touch soon.";

/** POST the enquiry; throws when TribeTravel doesn't accept it. */
export async function sendEnquiry(data: EnquiryFields) {
  // TribeTravel stores a name, a contact and a summary, so the trip details
  // go into the summary where the agent will see them.
  const summary = [
    data.destination && `Destination: ${data.destination}`,
    data.travel_dates && `When: ${data.travel_dates}`,
    data.travellers && `Travellers: ${data.travellers}`,
    data.phone && `Phone: ${data.phone}`,
    data.message && `\n${data.message}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(contact.enquiryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: data.name, email: data.email, message: summary }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new Error(result.error || `HTTP ${response.status}`);
}

export type EnquiryStatus = { kind: "idle" | "sending" | "sent" | "error"; message?: string };

/**
 * A form's submit handler and its status. The form's inputs are named like EnquiryFields (plus a hidden
 * `botcheck` spam trap); `extra` adds or rewrites details, such as choices made with buttons.
 */
export function useEnquiry(extra?: (fd: FormData) => Partial<EnquiryFields>) {
  const [status, setStatus] = useState<EnquiryStatus>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const field = (key: string) => String(fd.get(key) ?? "").trim();

    // Bots tend to tick the hidden checkbox; pretend it worked and send nothing.
    if (fd.get("botcheck")) {
      form.reset();
      setStatus({ kind: "sent", message: THANKS });
      return;
    }

    const data: EnquiryFields = {
      name: field("name"),
      email: field("email"),
      phone: field("phone"),
      destination: field("destination"),
      travel_dates: field("travel_dates"),
      travellers: field("travellers"),
      message: field("message"),
      ...extra?.(fd),
    };

    setStatus({ kind: "sending" });
    try {
      await sendEnquiry(data);
      form.reset();
      setStatus({ kind: "sent", message: THANKS });
    } catch (err) {
      console.error("Enquiry form:", err);
      setStatus({
        kind: "error",
        message: `Sorry, something went wrong sending your enquiry. Please try again, or email ${contact.email}.`,
      });
    }
  }

  return { status, onSubmit, sending: status.kind === "sending", reset: () => setStatus({ kind: "idle" }) };
}
