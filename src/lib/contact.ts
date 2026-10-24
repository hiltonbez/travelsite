// Paper Plane Travel & Tours contact details, as listed on paperplanetravel.co.za. Fallbacks only: the live values
// come from TribeTravel (src/lib/site-content.ts) once the agency has saved them there.
const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const tribetravel = (env["VITE_TRIBETRAVEL_URL"] || "https://tribetravel.io").replace(/\/$/, "");
const slug = env["VITE_AGENCY_SLUG"] || "paper-plane-travel-tours";

export const contact = {
  email: "vanessa@paperplanetravel.co.za",
  phoneDisplay: "+27 76 939 9338",
  phoneE164: "+27769399338",
  whatsapp: "https://wa.me/27769399338",
  facebook: "https://www.facebook.com/profile.php?id=100094546973010",
  // Website enquiries land in the agency's TribeTravel Enquiries inbox.
  enquiryUrl: `${tribetravel}/api/enquiry/${slug}`,
};
