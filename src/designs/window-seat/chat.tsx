// The AI web chat as the cabin-crew call button: a glowing overhead-panel button floats bottom right and opens an
// in-flight message panel. It talks to TribeTravel's standard chat (lib/chat.ts); when the brief is complete Tribe
// creates the client and enquiry for the agency. Buttons elsewhere on the page open it with CHAT_EVENT.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Loader2, PersonStanding, Send, X } from "lucide-react";
import { sendChat, startChat } from "@/lib/chat";
import { BRAND } from "@/designs/shared";
import { CHAT_EVENT, QUOTE, display, input, label, mono, soft } from "@/designs/window-seat/theme";

type Msg = { from: "crew" | "me"; text: string };

const STARTERS = ["A beach week in our winter", "Ideas for a first safari", "Help me plan a honeymoon"];

function useCrewChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function begin() {
    if (token || busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await startChat();
      setToken(r.token);
      setMsgs([{ from: "crew", text: r.reply }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function say(text: string) {
    const t = text.trim();
    if (!t || busy || done || !token) return;
    setMsgs((m) => [...m, { from: "me", text: t }]);
    setBusy(true);
    setError("");
    try {
      const r = await sendChat(token, t);
      setMsgs((m) => [...m, { from: "crew", text: r.reply }]);
      setDone(r.done);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return { msgs, busy, done, error, ready: !!token, begin, say };
}

/** The in-flight message panel. */
function CrewPanel({ onClose }: { onClose: () => void }) {
  const chat = useCrewChat();
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => { chat.begin(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [chat.msgs, chat.busy]);
  useEffect(() => { if (chat.ready) field.current?.focus(); }, [chat.ready]);

  function submit(e: FormEvent) {
    e.preventDefault();
    chat.say(text);
    setText("");
  }

  return (
    <div role="dialog" aria-label="Chat with our team" onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="ws-pop flex h-[min(540px,72svh)] flex-col overflow-hidden rounded-[26px] bg-[#FFFBF5] text-[#1C2340] shadow-[0_40px_90px_-30px_rgba(28,35,64,.75)] ring-1 ring-[#1C2340]/10">
      <div className="ws-sky flex items-center gap-3 px-5 py-4">
        <span className="relative flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#1C2340] text-[#FFC857]">
          <span aria-hidden="true" className="ws-chime absolute inset-0 rounded-full" />
          <PersonStanding className="relative h-5 w-5" />
        </span>
        <div className="flex min-w-0 flex-col">
          <b className={`${display} text-lg leading-tight`}>Cabin crew · {BRAND.name}</b>
          <span className={`${label} text-[10px] text-[#1C2340]/80`}>AI assistant · a consultant confirms every price</span>
        </div>
        <button type="button" onClick={onClose} aria-label="Close the chat" className="ml-auto flex h-11 w-11 flex-none items-center justify-center rounded-full hover:bg-white/40"><X className="h-5 w-5" /></button>
      </div>
      <div ref={scroller} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5" aria-live="polite">
        <p className={`self-center ${mono} text-[11px] ${soft}`}>In-flight message · Seat 12A</p>
        {chat.msgs.map((m, i) => (
          <div key={i} className={`ws-pop flex max-w-[86%] flex-col gap-1 ${m.from === "crew" ? "self-start" : "self-end items-end"}`}>
            <span className={`${label} text-[10px] ${soft}`}>{m.from === "crew" ? "Crew" : "You"}</span>
            <p className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line ${m.from === "crew" ? "rounded-tl-sm bg-white ring-1 ring-[#1C2340]/8" : "rounded-tr-sm bg-[#1C2340] text-[#FFF7EC]"}`}>{m.text}</p>
          </div>
        ))}
        {chat.busy && (
          <span className={`flex items-center gap-2 self-start rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-[#1C2340]/8 ${soft}`}><Loader2 className="h-4 w-4 animate-spin" /> The crew is typing…</span>
        )}
        {chat.done && (
          <div className="ws-pop flex items-start gap-3 rounded-2xl bg-[#DCFCE7] px-4 py-3 text-sm text-[#14532D]">
            <Check className="mt-0.5 h-4 w-4 flex-none" />
            <span>Thanks! Your trip details are with our team, and a consultant will be in touch with ideas and a quote.</span>
          </div>
        )}
        {chat.error && (
          <div role="alert" className="flex flex-col gap-2 rounded-2xl bg-[#FEE4E2] px-4 py-3 text-sm text-[#7A271A]">
            <span>{chat.error}</span>
            <a href={QUOTE} className="font-semibold underline underline-offset-2">Fill in the quote form instead</a>
          </div>
        )}
        {chat.ready && chat.msgs.length === 1 && !chat.busy && (
          <div className="flex flex-wrap gap-2 pt-1">
            {STARTERS.map((s) => (
              <button key={s} type="button" onClick={() => chat.say(s)} className="min-h-11 rounded-full border-2 border-[#1C2340]/15 bg-white px-4 text-sm font-medium transition hover:border-[#1C2340]">{s}</button>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-[#1C2340]/10 p-3">
        <label className="sr-only" htmlFor="ws-chat-text">Your message</label>
        <input ref={field} id="ws-chat-text" value={text} onChange={(e) => setText(e.target.value)} disabled={!chat.ready || chat.done} maxLength={1000}
          placeholder={chat.done ? "Your request has been sent" : "Ask us anything…"} className={`${input} flex-1 rounded-full px-5`} />
        <button type="submit" aria-label="Send" disabled={!chat.ready || chat.busy || chat.done || !text.trim()}
          className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#1C2340] text-[#FFC857] disabled:opacity-40">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

/** The call button and its panel. On the home page it shows when the agency has switched the chat on. */
export function CallButton() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(CHAT_EVENT, show);
    return () => window.removeEventListener(CHAT_EVENT, show);
  }, []);

  function close() {
    setOpen(false);
    window.setTimeout(() => button.current?.focus(), 0);
  }

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 md:right-6 md:bottom-6">
      {open && (
        <div className="w-[min(390px,calc(100vw-2rem))]">
          <CrewPanel onClose={close} />
        </div>
      )}
      {!open && (
        <div className="flex items-center gap-3">
          <span className={`ws-hint hidden rounded-full bg-[#FFFBF5] px-4 py-2 text-sm font-semibold text-[#1C2340] shadow-[0_10px_24px_-12px_rgba(28,35,64,.6)] sm:block`} aria-hidden="true">
            Ask the crew
          </span>
          {/* The overhead panel, with its lit call button */}
          <span className="rounded-[22px] bg-gradient-to-b from-[#F4EFE6] to-[#DCD4C6] p-2 shadow-[0_16px_34px_-14px_rgba(28,35,64,.7),inset_0_1px_0_#fff]">
            <button ref={button} type="button" onClick={() => setOpen(true)}
              aria-label="Call the crew: chat with our team" aria-expanded={open}
              className="ws-call relative flex h-14 w-14 items-center justify-center rounded-full text-[#1C2340]">
              <span aria-hidden="true" className="ws-ring absolute inset-0 rounded-full" />
              <PersonStanding className="relative h-7 w-7" strokeWidth={2.2} />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
