// Stop 2: the AI concierge, talking to TribeTravel's chat API, in its section and as a floating panel.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Check, Loader2, Send, Sparkles, X } from "lucide-react";
import { sendChat, startChat } from "@/lib/chat";
import { BRAND } from "@/designs/shared";
import { LiveDot, StopLabel } from "@/designs/enterprise/parts";
import { OPEN_EVENT } from "@/designs/enterprise/theme";
import { btn, display, ghost, gutter, h2, input, label, mono, orange, panel, soft } from "@/designs/enterprise/theme";

type Msg = { from: "ai" | "me"; text: string };

const STARTERS = ["A honeymoon in Mauritius", "A family safari in the school holidays", "Somewhere warm for 2 in December"];

function useConcierge() {
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

function ChatWindow({ compact = false, onClose }: { compact?: boolean; onClose?: () => void }) {
  const chat = useConcierge();
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => { chat.begin(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [chat.msgs, chat.busy]);

  function submit(e: FormEvent) {
    e.preventDefault();
    chat.say(text);
    setText("");
  }

  return (
    <div className={`flex flex-col overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,.85)] ${panel} ${compact ? "h-[min(560px,75vh)]" : "h-[560px]"}`}>
      <div className="flex items-center gap-3 border-b border-[#EDE6D8]/10 px-5 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6A2E] text-[#0B1424]"><Bot className="h-5 w-5" /></span>
        <div className="flex flex-col">
          <b className="text-[15px]">{BRAND.name} concierge</b>
          <span className={`flex items-center gap-1.5 ${label} ${soft}`}><LiveDot /> AI · a consultant prices every quote</span>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close the chat" className="ml-auto flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#EDE6D8]/10"><X className="h-5 w-5" /></button>
        )}
      </div>
      <div ref={scroller} className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5" aria-live="polite">
        {chat.msgs.map((m, i) => (
          <p key={i} className={`d-slide max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line ${m.from === "ai" ? "self-start rounded-tl-sm bg-[#EDE6D8]/8" : "self-end rounded-tr-sm bg-[#EDE6D8] text-[#0B1424]"}`}>
            {m.text}
          </p>
        ))}
        {chat.busy && (
          <span className={`flex items-center gap-2 self-start rounded-2xl bg-[#EDE6D8]/8 px-4 py-3 text-sm ${soft}`}><Loader2 className="h-4 w-4 animate-spin" /> Typing…</span>
        )}
        {chat.done && (
          <div className="d-slide flex items-start gap-3 rounded-2xl border border-[#4ADE80]/40 bg-[#4ADE80]/10 px-4 py-3 text-sm">
            <Check className="mt-0.5 h-4 w-4 flex-none text-[#4ADE80]" />
            <span>Your request is in TribeTravel: a new client, an enquiry and a draft quote for your consultant to price and send.</span>
          </div>
        )}
        {chat.error && <p role="alert" className="rounded-2xl bg-[#B42318]/25 px-4 py-3 text-sm">{chat.error}</p>}
        {chat.ready && chat.msgs.length === 1 && !chat.busy && (
          <div className="flex flex-wrap gap-2 pt-1">
            {STARTERS.map((s) => (
              <button key={s} type="button" onClick={() => chat.say(s)} className={`min-h-10 rounded-full border border-[#FF6A2E]/50 px-4 text-sm ${orange} transition hover:bg-[#FF6A2E]/10`}>{s}</button>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-[#EDE6D8]/10 p-3">
        <label className="sr-only" htmlFor={compact ? "chat-text-pop" : "chat-text"}>Your message</label>
        <input id={compact ? "chat-text-pop" : "chat-text"} value={text} onChange={(e) => setText(e.target.value)} disabled={!chat.ready || chat.done} maxLength={1000}
          placeholder={chat.done ? "Your request has been sent" : "Tell me about your dream trip…"}
          className={`${input} flex-1 rounded-full px-5`} />
        <button type="submit" aria-label="Send" disabled={!chat.ready || chat.busy || chat.done || !text.trim()} className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#FF6A2E] text-[#0B1424] disabled:opacity-40">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

export function Concierge() {
  const [on, setOn] = useState(false);
  return (
    <section id="concierge" data-stop className={`relative z-10 grid scroll-mt-20 items-center gap-12 ${gutter} py-24 md:py-28 lg:grid-cols-[1.1fr_.9fr]`}>
      <div className="lg:order-2 flex flex-col gap-6">
        <StopLabel><Sparkles className="h-4 w-4" /> Stop 2 · AI concierge, 24/7</StopLabel>
        <h2 className={h2}>Plan it <span className={orange}>mid-air.</span></h2>
        <p className={`text-lg leading-relaxed ${soft}`}>
          Our AI concierge asks the right questions, suggests ideas from our packages and passes your complete brief to a consultant, who prices it and sends your quote. Day or night.
        </p>
        <ul className="flex flex-col gap-3 text-[15px]">
          {["Answers in seconds, any time", "Never guesses a price: your consultant quotes", "Says it's an AI, and asks before saving your details (POPIA)"].map((x) => (
            <li key={x} className="flex items-center gap-3"><Check className={`h-4 w-4 flex-none ${orange}`} />{x}</li>
          ))}
        </ul>
      </div>
      <div className="lg:order-1">
        {on ? <ChatWindow /> : (
          <button type="button" onClick={() => setOn(true)} className={`group flex h-[560px] w-full flex-col items-center justify-center gap-5 border-dashed text-center transition hover:border-[#FF6A2E] ${panel}`}>
            <span className="d-float flex h-20 w-20 items-center justify-center rounded-full bg-[#FF6A2E] text-[#0B1424]"><Bot className="h-9 w-9" /></span>
            <span className={`${display} text-3xl`}>Start a conversation</span>
            <span className={soft}>Chat with our AI concierge</span>
          </button>
        )}
      </div>
    </section>
  );
}

/** The floating "Ask our concierge" button, above the WhatsApp button. Hidden while the concierge section
 *  itself is on screen, where it would cover the chat. */
export function ConciergeLauncher() {
  const [open, setOpen] = useState(false);
  const [sectionShowing, setSectionShowing] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, show);
    const section = document.getElementById("concierge");
    const io = new IntersectionObserver(([e]) => setSectionShowing(!!e?.isIntersecting), { threshold: 0.2 });
    if (section) io.observe(section);
    return () => { window.removeEventListener(OPEN_EVENT, show); io.disconnect(); };
  }, []);
  if (sectionShowing && !open) return null;
  return (
    <>
      {open && (
        <div className="fixed right-4 bottom-24 z-30 w-[min(400px,calc(100vw-2rem))] md:right-6 md:bottom-28">
          <ChatWindow compact onClose={() => setOpen(false)} />
        </div>
      )}
      {!open && (
        <button type="button" onClick={() => setOpen(true)} className="d-rise fixed right-4 bottom-24 z-30 flex min-h-12 items-center gap-2 rounded-full bg-[#FF6A2E] px-5 font-bold text-[#0B1424] shadow-[0_12px_30px_rgba(0,0,0,.5)] md:right-6 md:bottom-28">
          <Bot className="h-5 w-5" /> Ask our concierge
        </button>
      )}
    </>
  );
}
