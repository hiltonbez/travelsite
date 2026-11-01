// Hooks and helpers the Atlas pages share: "has this scrolled into view yet" and opening the floating assistant.
import { useEffect, useRef, useState } from "react";
import { CHAT_EVENT } from "@/designs/atlas/theme";

/** True once the element has scrolled into view (and stays true). Everything shows at once with reduced motion. */
export function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

/** Opens the assistant (chat.tsx) from anywhere on the page. */
export const openChat = () => window.dispatchEvent(new Event(CHAT_EVENT));
