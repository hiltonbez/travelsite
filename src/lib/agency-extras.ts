// TribeTravel's Enterprise website extras (31 Oct 2026), each switched on by the agency in Website > Settings and
// answered only for the agency's own sites (its allowed origins):
//   GET/POST <tribetravel>/api/site/<slug>/appointments   call times with seats left / book a call
//   GET      <tribetravel>/api/site/<slug>/push/key       public key for "your quote is ready" alerts
//   POST     <tribetravel>/api/site/<slug>/push/subscribe the browser's subscription and the visitor's email
import { AGENCY_SLUG, TRIBETRAVEL_URL } from "@/lib/site-content";

const base = `${TRIBETRAVEL_URL}/api/site/${encodeURIComponent(AGENCY_SLUG)}`;

async function call<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(base + path, {
      method: body === undefined ? "GET" : "POST",
      headers: { Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
      body: body === undefined ? null : JSON.stringify(body),
      credentials: "omit",
    });
  } catch {
    throw new Error("We couldn't reach our booking system just now. Please try again, or call us.");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}

// ---- book a call
export type Slot = { start: string; time: string; left: number };
export type SlotDay = { date: string; label: string; slots: Slot[] };
export type Slots = { minutes: number; days: SlotDay[]; next_free: string | null };
export type CallBooked = { start: string; end: string; label: string; minutes: number };
export type CallRequest = { start: string; name: string; email: string; phone: string; topic: string; website: string };

export const listSlots = () => call<Slots>("/appointments");
export const bookCall = (r: CallRequest) => call<CallBooked>("/appointments", r);

/** A calendar file for the booked call (South African time). */
export function callIcs(c: CallBooked, title: string) {
  const stamp = (iso: string) => iso.replace(/[-:]/g, "").slice(0, 13) + "00";
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TribeTravel//Website//EN", "BEGIN:VEVENT",
    `UID:${stamp(c.start)}-${Math.random().toString(36).slice(2)}@tribetravel.io`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;TZID=Africa/Johannesburg:${stamp(c.start)}`, `DTEND;TZID=Africa/Johannesburg:${stamp(c.end)}`,
    `SUMMARY:${title.replace(/[,;\\]/g, " ")}`, "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}


// ---- quote alerts
function keyBytes(key: string) {
  const b64 = (key + "=".repeat((4 - (key.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
}

export const alertsSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

/** Ask the browser for permission, subscribe through this page's service worker and register with TribeTravel. */
export async function turnOnAlerts(email: string) {
  const { key } = await call<{ key: string }>("/push/key");
  if ((await Notification.requestPermission()) !== "granted") {
    throw new Error("Alerts are blocked for this site. Allow notifications in your browser settings, then try again.");
  }
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription())
    ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) }));
  await call<{ ok: boolean }>("/push/subscribe", { subscription: sub.toJSON(), email });
}
