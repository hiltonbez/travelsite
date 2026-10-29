// The agency's Thompsons Holidays packages (TribeTravel /api/site/<slug>/thompsons). Read-only: no online booking,
// one "from" price per person, no supplier name; "Ask about this holiday" goes through the enquiry form.
import { AGENCY_SLUG, TRIBETRAVEL_URL } from "@/lib/site-content";

export type Holiday = {
  id: string;
  name: string;
  destination: string;
  nights: number;
  board: string;
  star: string;
  strapline: string;
  inclusions: string[];
  depart_city: string;
  hot_deal: boolean;
  image: string;
  gallery: string[];
  from_pp: number | null;
  currency: string;
};

export type HolidayDay = { date: string; items: string[] };
export type HolidayFull = Holiday & { exclusions: string[]; days: HolidayDay[] };

const base = `${TRIBETRAVEL_URL}/api/site/${encodeURIComponent(AGENCY_SLUG)}/thompsons`;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(base + path, { headers: { Accept: "application/json" }, credentials: "omit" });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}

export const listHolidays = () => get<{ packages: Holiday[] }>("").then((r) => r.packages);
export const getHoliday = (id: string) => get<{ package: HolidayFull }>(`/${encodeURIComponent(id)}`).then((r) => r.package);
