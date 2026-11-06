// The kit's shared sample content, the same for every design: six places (from the Enterprise sample), the About
// page and the Privacy (POPIA) page. Example content for a demo agency; a real agency's comes from its own content.
import { DESTINATIONS } from "@/designs/enterprise/content";
import { contact } from "@/lib/contact";
import { BRAND } from "@/lib/site-content";

export type Place = {
  slug: string;
  name: string;
  region: string;
  tagline: string;
  intro: string;
  photo: string;
};

export const PLACES: Place[] = DESTINATIONS.map((d) => ({
  slug: d.slug,
  name: d.name,
  region: d.region,
  tagline: d.tagline,
  intro: d.intro,
  photo: d.photos[0],
}));

export const ABOUT = {
  title: `About ${BRAND.name}`,
  paragraphs: [
    `${BRAND.name} is the demo agency on this site. It stands in for yours: a small team that talks to you first and quotes in writing afterwards.`,
    "Every enquiry, chat and booking on this site goes to the agency's TribeTravel account, so nothing is lost between a click and a consultant.",
    "The places, photographs and words here are examples. A real agency replaces them with its own.",
  ],
};

// The same seven sections as Window Seat's privacy page (designs/window-seat/pages.tsx), kept in step by hand.
export const PRIVACY: [string, string][] = [
  [
    "Who we are",
    `${BRAND.name} is the responsible party for personal information collected on this website. Contact our information officer at ${contact.email}.`,
  ],
  [
    "What we collect",
    "Your name, email address, phone number and trip details when you ask for a quote, send us a note, chat with us or sign up for our newsletter. If you allow it in the cookie notice, we also collect anonymous visit statistics.",
  ],
  [
    "Why we collect it",
    "To plan and quote your trip, to answer your questions and, if you signed up, to send our newsletter. We only use your details with your consent, which you give with the consent tick box on each form.",
  ],
  [
    "Our chat",
    "The chat on this site is an AI assistant. It says so, it never confirms a price, and a consultant reads every request it passes on to us.",
  ],
  [
    "Cookies",
    'Essential cookies keep the site working. Statistics cookies are only used if you choose "Allow statistics", and you can change your mind by clearing this site\'s data in your browser.',
  ],
  [
    "Who we share it with",
    "Only the suppliers needed for your booking (airlines, hotels and tour operators) and our systems provider (TribeTravel). We never sell your details.",
  ],
  [
    "Your rights",
    "You can ask to see, correct or delete your information, or unsubscribe from the newsletter at any time. You can also complain to the Information Regulator.",
  ],
];
