import { useEffect } from "react";

/** Fades `.reveal` elements in as they scroll into view; runs again when `key` changes (new sections drawn). */
export function useReveal(key?: unknown) {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.in)");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
}
