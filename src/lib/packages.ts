// Beachcomber packages the traveller can book from this site (TribeTravel /api/site/<slug>/packages, P17.146).
// Called from the browser at run time: prices are live, so they are never baked into the static page.
import { AGENCY_SLUG, TRIBETRAVEL_URL } from "@/lib/site-content";

export type Package = {
  id: string;
  hotel: string;
  star: string;
  board: string;
  location: string;
  nights: number;
  from_pp: number;
  currency: string;
  inclusions: string[];
  image: string;
  gallery: string[];
};

export type Room = { room_id: string; name: string; board: string; nights: number; total: number; pp: number; currency: string; highlights: string[]; image: string };

export type CheckRequest = {
  package_id: string;
  check_in: string;
  nights: number;
  adults: number;
  children: number;
  child_ages: number[];
  depart_city: "JNB" | "CPT" | "DUR";
};

export type Traveller = { name: string; email: string; phone: string; travellers: string[]; notes: string; whatsapp_ok: boolean };

export type Booked = { quote_number: string; quote_url: string; story_url: string };

const base = `${TRIBETRAVEL_URL}/api/site/${encodeURIComponent(AGENCY_SLUG)}/packages`;

async function call<T>(path: string, body?: unknown): Promise<T> {
  const init: RequestInit = body === undefined
    ? { method: "GET", headers: { Accept: "application/json" }, credentials: "omit" }
    : { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body), credentials: "omit" };
  const res = await fetch(base + path, init);
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}

export const listPackages = () => call<{ packages: Package[]; min_days_ahead: number }>("");
export const checkDates = (r: CheckRequest) => call<{ token: string; rooms: Room[] }>("/check", r);
export const bookRoom = (token: string, room_id: string, t: Traveller) => call<Booked>("/book", { token, room_id, ...t });

export function rand(n: number, currency = "ZAR") {
  const v = Math.round(n).toLocaleString("en-ZA").replace(/[\s,]/g, " ");
  return currency === "ZAR" ? `R${v}` : `${currency} ${v}`;
}
