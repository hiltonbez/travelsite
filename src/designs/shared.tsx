// What every design in the gallery (lib/designs.ts) shares: the demo's photos and video, its contact links, and
// the bits of a quote form.
import islands from "@/assets/islands.jpg";
import safari from "@/assets/safari.jpg";
import cities from "@/assets/cities.jpg";
import cruises from "@/assets/cruises.jpg";
import designsCss from "@/designs/designs.css?url";
import { contact } from "@/lib/contact";
import type { EnquiryStatus } from "@/lib/enquiry";
import { BRAND } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export { BRAND, contact };

export const media = { islands, safari, cities, cruises, video: "/videos/hero.mp4" };

export const tel = `tel:${contact.phoneE164}`;
export const mailto = `mailto:${contact.email}`;

/** A design page's <head>: its title, its Google Fonts (`family=…&family=…`) and the designs' animations. */
export function designHead(name: string, description: string, fonts: string) {
  return {
    meta: [
      { title: `${name} — ${BRAND.name} website design` },
      { name: "description", content: description },
      { property: "og:title", content: `${name} — a TribeTravel website design` },
      { property: "og:description", content: description },
    ],
    links: [
      { rel: "stylesheet", href: designsCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: `https://fonts.googleapis.com/css2?${fonts}&display=swap` },
    ],
  };
}

/** The muted, looping background video every design opens with. */
export function HeroVideo({ className, poster = islands }: { className?: string; poster?: string }) {
  return (
    <video
      src={media.video}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
      className={cn("h-full w-full object-cover", className)}
    />
  );
}

/** Spam trap: hidden from people. */
export function BotTrap() {
  return <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />;
}

/** The form's thank-you or error line. */
export function FormStatus({ status, className }: { status: EnquiryStatus; className?: string }) {
  if (!status.message) return null;
  return (
    <p role="status" className={cn("text-sm", status.kind === "error" && "font-semibold", className)}>
      {status.message}
    </p>
  );
}

/** WhatsApp's speech-bubble mark, drawn as a line icon. */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20l1.3-5.1A8.4 8.4 0 1 1 21 11.5z" />
      <path d="M9 9.5c.3 1.7 2 3.6 3.9 4.3l1.2-1.1 1.9.8-.4 1.6c-3.2.3-7-3.4-6.9-6.6l1.6-.4.8 1.9z" />
    </svg>
  );
}

/** A month input's value (2027-03) as words (March 2027) for the agent's summary. */
export function monthWords(value: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return value;
  return new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
}
