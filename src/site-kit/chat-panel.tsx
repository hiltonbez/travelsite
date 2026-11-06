// The AI web chat every Tribe Site includes (TribeTravel's standard chat, not the Enterprise concierge). Moved here from
// the Design Studio homepage so the kit's other pages can use it. It calls TribeTravel only when the visitor starts.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Sparkles, X } from "lucide-react";
import { sendChat, startChat } from "@/lib/chat";

/** `formHref` is where "Use the enquiry form" goes: the homepage's own form, or another page's Quote page. */
export function ChatPanel({
  onClose,
  formHref = "#plan",
}: {
  onClose: () => void;
  formHref?: string;
}) {
  const [messages, setMessages] = useState<{ who: string; text: string }[]>([]);
  const [token, setToken] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const panel = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    // Closing removes the panel, so give focus back to whatever opened it.
    const opener = document.activeElement as HTMLElement | null;
    panel.current?.showModal();
    return () => opener?.focus?.();
  }, []);
  async function begin() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await startChat();
      setToken(r.token);
      setMessages([{ who: "AI assistant", text: r.reply }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function say(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy || done || !token) return;
    const value = text.trim();
    setText("");
    setBusy(true);
    setError("");
    setMessages((m) => [...m, { who: "You", text: value }]);
    try {
      const r = await sendChat(token, value);
      setMessages((m) => [...m, { who: "AI assistant", text: r.reply }]);
      setDone(r.done);
    } catch (e) {
      setError((e as Error).message);
      setText(value);
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog ref={panel} onCancel={onClose} className="studio-dialog" aria-labelledby="chat-title">
      <button className="dialog-close" onClick={onClose} aria-label="Close assistant">
        <X />
      </button>
      <p className="studio-eyebrow">POWERED BY TRIBETRAVEL</p>
      <h2 id="chat-title">A little help, a world away.</h2>
      <p>
        This is an AI assistant for the Sun-Set Travel demo agency. Chat is subject to the agency’s
        enabled features and website permissions.
      </p>
      {!token && (
        <button className="dialog-action" onClick={begin} aria-busy={busy}>
          {busy ? "Connecting…" : "Start AI conversation"}
          <Sparkles size={17} />
        </button>
      )}
      <div className="studio-messages" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} data-who={m.who}>
            <small>{m.who}</small>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      {busy && token && <p role="status">Thinking…</p>}
      {error && <p role="alert">{error}</p>}
      {token && !done && (
        <form onSubmit={say}>
          <label htmlFor="assistant-message">Your message</label>
          <div className="chat-input-row">
            <input
              id="assistant-message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              required
            />
            <button disabled={busy || !text.trim()} aria-label="Send message">
              <ArrowRight />
            </button>
          </div>
        </form>
      )}
      {done && (
        <p role="status">
          {messages.at(-1)?.text
            ? "This conversation is complete. You can continue through the enquiry form below."
            : "Conversation complete."}
        </p>
      )}
      <a href={formHref} onClick={onClose}>
        Use the enquiry form <ArrowUpRight size={15} />
      </a>
    </dialog>
  );
}
