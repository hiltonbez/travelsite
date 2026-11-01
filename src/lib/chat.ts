// TribeTravel's AI quote chat, called directly (the Classic page loads Tribe's quote-chat.js widget instead).
// POST <tribetravel>/api/chat/<slug>/start, then /message per visitor message. Tribe only answers the agency's own
// sites (its allowed origins), counts each turn against the agency's AI allowance, and when the brief is complete
// ("done") creates the client, enquiry and a draft quote in Tribe.
import { AGENCY_SLUG, TRIBETRAVEL_URL } from "@/lib/site-content";

const base = `${TRIBETRAVEL_URL}/api/chat/${encodeURIComponent(AGENCY_SLUG)}`;

/** The AI Concierge (TribeTravel's paid upgrade of the chat, P17.229) can also send package cards, a booked call and
 *  a WhatsApp handover. The standard chat sends none of these. */
export type ChatCard = { kind: "beachcomber" | "thompsons"; id: string; title: string; place: string; nights: number | null; from_pp: number | null; currency: string; image: string };
export type ChatCall = { start: string; end: string; label: string; minutes: number };
export type ChatHandover = { whatsapp_url: string; ref: string };
export type ChatTurn = { reply: string; done: boolean; cards?: ChatCard[]; call?: ChatCall; handover?: ChatHandover };

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(base + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      credentials: "omit",
    });
  } catch {
    // Offline, or TribeTravel refused this site (only the agency's own sites may use the chat).
    throw new Error("We couldn't reach the concierge just now. Please check your connection, or use the enquiry form.");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || "The chat isn't available right now. Please use the enquiry form.");
  return data as T;
}

export const startChat = () => post<ChatTurn & { token: string; concierge?: boolean }>("/start", {});
export const sendChat = (token: string, text: string) => post<ChatTurn>("/message", { token, text });
