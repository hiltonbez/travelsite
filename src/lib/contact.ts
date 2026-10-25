// Contact details the site shows before the agency saves its own in TribeTravel (src/lib/site-content.ts).
// Empty on purpose: the demo site (Sun-Set Travel) shows only what the agency enters in the website editor.
const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const tribetravel = (env["VITE_TRIBETRAVEL_URL"] || "https://tribetravel.io").replace(/\/$/, "");
const slug = env["VITE_AGENCY_SLUG"] || "sunset-travel";

export const contact = {
  email: "",
  phoneDisplay: "",
  phoneE164: "",
  whatsapp: "",
  facebook: "",
  // Website enquiries land in the agency's TribeTravel Enquiries inbox.
  enquiryUrl: `${tribetravel}/api/enquiry/${slug}`,
};
