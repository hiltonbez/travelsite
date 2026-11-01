// The AI web chat: TribeTravel's standard quote chat (lib/chat.ts) in a clean floating assistant panel. It answers
// questions and, once the visitor's brief is complete, Tribe creates the client, the enquiry and a draft quote.
// The panel opens from its floating button or from anything that fires CHAT_EVENT.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Loader2, Send, Sparkles, X } from "lucide-react";
import { sendChat, startChat } from "@/lib/chat";
import { BRAND } from "@/designs/shared";
import { LiveDot } from "@/designs/atlas/parts";
import { CHAT_EVENT, input, label, muted } from "@/designs/atlas/theme";

type Msg = { from: "ai" | "me"; text: string };

const STARTERS = ["Ideas for a June beach holiday", "What's a good Kruger weekend?", "Plan a family trip for 4"];

function useChat() {
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
      setMsgs([{ from: "ai", text: r.reply }]);
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
      setMsgs((m) => [...m, { from: "ai", text: r.reply }]);
      setDone(r.done);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return { msgs, busy, done, error, ready: !!token, begin, say };
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const chat = useChat();
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => { chat.begin(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [chat.msgs, chat.busy]);
  useEffect(() => { if (chat.ready) field.current?.focus(); }, [chat.ready]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  function submit(e: FormEvent) {
    e.preventDefault();
    chat.say(text);
    setText("");
  }

  return (
    <div role="dialog" aria-label={`Chat with the ${BRAND.name} assistant`} className="atlas-pop flex h-[min(580px,calc(100svh-7rem))] flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_40px_90px_-30px_rgba(11,35,64,.55)] backdrop-blur-2xl">
      <div className="relative flex items-center gap-3 overflow-hidden bg-[linear-gradient(120deg,#1452A3,#1D6FD8_60%,#2F7FE0)] px-5 py-4 text-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur"><Sparkles className="h-5 w-5" /></span>
        <div className="flex flex-col">
          <b className="text-[15px]">{BRAND.name} assistant</b>
          <span className={`flex items-center gap-1.5 ${label} text-white/90`}><LiveDot colour="#FFFFFF" /> AI · a consultant prices every quote</span>
        </div>
        <button type="button" onClick={onClose} aria-label="Close the chat" className="ml-auto flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/20"><X className="h-5 w-5" /></button>
      </div>
      <div ref={scroller} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5" aria-live="polite">
        {chat.msgs.map((m, i) => (
          <p key={i} className={`atlas-msg max-w-[86%] rounded-[20px] px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line ${m.from === "ai" ? "self-start rounded-tl-md bg-[#EEF5FE] text-[#0B2340]" : "self-end rounded-tr-md bg-[#1D6FD8] text-white"}`}>
            {m.text}
          </p>
        ))}
        {chat.busy && (
          <span className={`flex items-center gap-2 self-start rounded-[20px] bg-[#EEF5FE] px-4 py-3 text-sm ${muted}`}><Loader2 className="h-4 w-4 animate-spin" /> Typing…</span>
        )}
        {chat.done && (
          <p className="atlas-msg flex items-start gap-3 rounded-[20px] border border-[#16A34A]/30 bg-[#16A34A]/8 px-4 py-3 text-sm text-[#0B2340]">
            <Check className="mt-0.5 h-4 w-4 flex-none text-[#15803D]" />
            Your request is with us: a consultant has your brief and a draft quote, and will be in touch on WhatsApp or email.
          </p>
        )}
        {chat.error && <p role="alert" className="rounded-[20px] bg-[#FEE4E2] px-4 py-3 text-sm text-[#912018]">{chat.error}</p>}
        {chat.ready && chat.msgs.length === 1 && !chat.busy && (
          <div className="flex flex-wrap gap-2 pt-1">
            {STARTERS.map((s) => (
              <button key={s} type="button" onClick={() => chat.say(s)} className="min-h-11 rounded-full border border-[#1D6FD8]/30 bg-white px-4 text-sm font-semibold text-[#1D6FD8] transition hover:bg-[#EEF5FE]">{s}</button>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-[#0B2340]/8 bg-white/70 p-3">
        <label className="sr-only" htmlFor="atlas-chat-text">Your message</label>
        <input ref={field} id="atlas-chat-text" value={text} onChange={(e) => setText(e.target.value)} disabled={!chat.ready || chat.done} maxLength={1000}
          placeholder={chat.done ? "Your request has been sent" : "Ask anything, or describe your trip…"}
          className={`${input} flex-1 rounded-full px-5`} />
        <button type="submit" aria-label="Send" disabled={!chat.ready || chat.busy || chat.done || !text.trim()}
          className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#1D6FD8] text-white transition disabled:opacity-40">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

/** The floating assistant button and its panel, above the mobile action bar. */
export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(CHAT_EVENT, show);
    return () => window.removeEventListener(CHAT_EVENT, show);
  }, []);
  return (
    <>
      {open && (
        <div className="fixed right-4 bottom-24 z-40 w-[min(400px,calc(100vw-2rem))] md:right-6 md:bottom-6">
          <ChatPanel onClose={() => setOpen(false)} />
        </div>
      )}
      {!open && (
        <button type="button" onClick={() => setOpen(true)}
          className="atlas-pop fixed right-4 bottom-24 z-30 flex min-h-13 items-center gap-2.5 rounded-full bg-[#0B2340] py-2 pr-5 pl-2 font-bold text-white shadow-[0_16px_36px_-12px_rgba(11,35,64,.6)] transition hover:-translate-y-0.5 md:right-6 md:bottom-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4BA3F5,#FFB547)]"><Sparkles className="h-4 w-4" /></span>
          Ask our assistant
        </button>
      )}
    </>
  );
}
