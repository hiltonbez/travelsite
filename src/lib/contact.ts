// Contact details the site shows before the agency saves its own in TribeTravel (src/lib/site-content.ts).
// The demo site (Sun-Set Travel) shows Hilton's details, for agencies trying it out.
const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const tribetravel = (env["VITE_TRIBETRAVEL_URL"] || "https://tribetravel.io").replace(/\/$/, "");
const slug = env["VITE_AGENCY_SLUG"] || "sunset-travel";

export const contact = {
  email: "hiltonbez@gmail.com",
  phoneDisplay: "061 424 2403",
  phoneE164: "+27614242403",
  whatsapp: "https://wa.me/27614242403",
  facebook: "",
  // Website enquiries land in the agency's TribeTravel Enquiries inbox.
  enquiryUrl: `${tribetravel}/api/enquiry/${slug}`,
};
