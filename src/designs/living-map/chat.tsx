// The AI web chat: TribeTravel's standard quote chat (lib/chat.ts), written as notes in the journal. The visitor's
// lines are typed, the assistant's are handwritten. It lives in a section on the home page and in a pop-up from the
// floating "Ask us" button on every page. When the brief is complete, Tribe creates the client, enquiry and a draft
// quote.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Feather, Loader2, Send, X } from "lucide-react";
import { sendChat, startChat } from "@/lib/chat";
import { BRAND } from "@/designs/shared";
import { SectionHead } from "@/designs/living-map/parts";
import { accent, caps, card, gutter, hand, input, soft } from "@/designs/living-map/theme";

type Note = { from: "ai" | "me"; text: string };

const STARTERS = ["A family beach holiday in April", "Is the Zanzibar group trip still open?", "A long weekend somewhere close"];

function useChat() {
  const [notes, setNotes] = useState<Note[]>([]);
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
      setNotes([{ from: "ai", text: r.reply }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function say(text: string) {
    const t = text.trim();
    if (!t || busy || done || !token) return;
    setNotes((n) => [...n, { from: "me", text: t }]);
    setBusy(true);
    setError("");
    try {
      const r = await sendChat(token, t);
      setNotes((n) => [...n, { from: "ai", text: r.reply }]);
      setDone(r.done);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return { notes, busy, done, error, ready: !!token, begin, say };
}

function Journal({ compact = false, onClose }: { compact?: boolean; onClose?: () => void }) {
  const chat = useChat();
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const fieldId = compact ? "lm-chat-pop" : "lm-chat";

  useEffect(() => { chat.begin(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [chat.notes, chat.busy]);

  function submit(e: FormEvent) {
    e.preventDefault();
    chat.say(text);
    setText("");
  }

  return (
    <div className={`flex flex-col overflow-hidden ${card} ${compact ? "h-[min(540px,72vh)]" : "h-[540px]"}`}>
      <div className="flex items-center gap-3 border-b border-(--lm-line) px-5 py-3.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--lm-accent) text-(--lm-on-accent)"><Feather className="h-5 w-5" /></span>
        <div className="flex flex-col">
          <b className="text-[15px]">Ask {BRAND.name}</b>
          <span className={`text-xs ${soft}`}>AI assistant · a consultant prices every quote</span>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close the chat" className="ml-auto flex h-11 w-11 items-center justify-center rounded-full hover:bg-(--lm-ink)/8"><X className="h-5 w-5" /></button>
        )}
      </div>
      {/* Ruled journal paper */}
      <div ref={scroller} aria-live="polite"
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 [background-image:repeating-linear-gradient(transparent_0_31px,var(--lm-line)_31px_32px)] [background-attachment:local]">
        {chat.notes.map((n, i) => n.from === "ai" ? (
          <p key={i} className={`lm-msg max-w-[92%] ${hand} text-[23px] leading-[1.25] whitespace-pre-line`}>{n.text}</p>
        ) : (
          <p key={i} className="lm-msg max-w-[85%] self-end rounded-md border border-(--lm-line) bg-(--lm-field) px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-line shadow-sm">
            {n.text}
          </p>
        ))}
        {chat.busy && <span className={`flex items-center gap-2 ${hand} text-xl ${soft}`}><Loader2 className="h-4 w-4 animate-spin" /> writing…</span>}
        {chat.done && (
          <p className="lm-msg flex items-start gap-3 rounded-md border border-(--lm-accent)/50 px-4 py-3 text-sm">
            <Check className={`mt-0.5 h-4 w-4 flex-none ${accent}`} />
            Your request is in. A consultant has your brief and a draft quote, and will be in touch soon.
          </p>
        )}
        {chat.error && <p role="alert" className="rounded-md border border-(--lm-accent) px-4 py-3 text-sm">{chat.error}</p>}
        {chat.ready && chat.notes.length === 1 && !chat.busy && (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button key={s} type="button" onClick={() => chat.say(s)}
                className={`min-h-11 rounded-full border border-dashed border-(--lm-accent) px-4 text-sm ${accent} transition hover:bg-(--lm-accent)/10`}>{s}</button>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-(--lm-line) p-3">
        <label className="sr-only" htmlFor={fieldId}>Your message</label>
        <input id={fieldId} value={text} onChange={(e) => setText(e.target.value)} disabled={!chat.ready || chat.done} maxLength={1000}
          placeholder={chat.done ? "Your request has been sent" : "Write your question or dream trip…"} className={`${input} flex-1 rounded-full px-5`} />
        <button type="submit" aria-label="Send" disabled={!chat.ready || chat.busy || chat.done || !text.trim()}
          className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-(--lm-accent) text-(--lm-on-accent) disabled:opacity-40">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

/** The chat on the home page: the journal opens when the visitor asks for it (each start counts against the agency's
 *  AI allowance, so it doesn't start on its own). */
export function ChatSection() {
  const [on, setOn] = useState(false);
  return (
    <section id="ask" data-pin className={`relative z-10 grid scroll-mt-24 items-center gap-12 ${gutter} py-24 lg:grid-cols-[.9fr_1.1fr]`}>
      <SectionHead kicker="AI web chat · day and night" title={<>Write to us in <em>the margins.</em></>}
        intro="Ask anything, any time: what's included, when to go, whether there's still a seat on the group trip. Our AI assistant answers straight away, then hands your brief to a consultant who prices it."
        note="It says it's an AI, and asks before saving your details." />
      <div>
        {on ? <Journal /> : (
          <button type="button" onClick={() => setOn(true)}
            className={`group relative flex h-[540px] w-full flex-col items-center justify-center gap-5 overflow-hidden text-center transition hover:-translate-y-1 ${card}`}>
            <span aria-hidden="true" className="absolute inset-0 [background-image:repeating-linear-gradient(transparent_0_31px,var(--lm-line)_31px_32px)]" />
            <span className="lm-bob relative flex h-20 w-20 items-center justify-center rounded-full bg-(--lm-accent) text-(--lm-on-accent)"><Feather className="h-9 w-9" /></span>
            <span className={`relative ${hand} text-4xl font-bold`}>Dear {BRAND.name}…</span>
            <span className={`relative ${soft}`}>Tap to start writing</span>
          </button>
        )}
      </div>
    </section>
  );
}

/** The floating "Ask us" button on every page, and its pop-up journal. Hidden while the chat section is on screen. */
export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [sectionShowing, setSectionShowing] = useState(false);
  useEffect(() => {
    const section = document.getElementById("ask");
    if (!section) return;
    const io = new IntersectionObserver(([e]) => setSectionShowing(!!e?.isIntersecting), { threshold: 0.2 });
    io.observe(section);
    return () => io.disconnect();
  }, []);
  if (sectionShowing && !open) return null;
  return (
    <>
      {open && (
        <div className="fixed right-4 bottom-24 z-40 w-[min(400px,calc(100vw-2rem))] md:right-6 md:bottom-6">
          <Journal compact onClose={() => setOpen(false)} />
        </div>
      )}
      {!open && (
        <button type="button" onClick={() => setOpen(true)}
          className={`lm-rise fixed right-4 bottom-24 z-40 flex min-h-12 items-center gap-2 rounded-full bg-(--lm-accent) px-5 font-semibold text-(--lm-on-accent) shadow-[0_14px_30px_-10px_var(--lm-shadow)] md:right-6 md:bottom-6`}>
          <Feather className="h-5 w-5" /> <span className={`${caps} text-sm`}>Ask us</span>
        </button>
      )}
    </>
  );
}
