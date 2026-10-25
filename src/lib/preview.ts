// Preview mode for TribeTravel's visual editor (P17.150). The editor shows this site in a frame at
//   /?tt_preview=<signed token>&tt_editor=<the editor's origin>
// Here the page loads the agency's DRAFT from TribeTravel, redraws when the editor sends new content, outlines each
// section with an "Edit" chip, and tells the editor which section was clicked. Without a token none of this runs.
import { useEffect, useState } from "react";
import { AGENCY_SLUG, TRIBETRAVEL_URL, merge, type Payload, type SiteContent } from "@/lib/site-content";

const tribe = new URL(TRIBETRAVEL_URL);

/** The editor must be TribeTravel itself (or an agency's <slug>.tribetravel.io). */
export function editorOriginOk(origin: string) {
  try {
    const o = new URL(origin);
    if (o.origin === tribe.origin) return true;
    return o.protocol === "https:" && o.hostname.endsWith("." + tribe.hostname);
  } catch {
    return false;
  }
}

function params() {
  if (typeof window === "undefined" || window.parent === window) return null;
  const q = new URLSearchParams(window.location.search);
  const token = q.get("tt_preview");
  const editor = q.get("tt_editor") || "";
  return token && editorOriginOk(editor) ? { token, editor: new URL(editor).origin } : null;
}

const STYLE = `
.tt-preview .reveal{opacity:1!important;transform:none!important}
.tt-preview [data-tt-block]{position:relative;cursor:pointer;scroll-margin-top:64px}
.tt-preview [data-tt-block]:hover{outline:2px dashed #2563eb;outline-offset:-2px}
.tt-preview [data-tt-block][data-tt-selected]{outline:3px solid #2563eb;outline-offset:-3px}
.tt-preview [data-tt-block]:hover::after{content:"\\270E  Edit section";position:absolute;top:10px;right:10px;z-index:60;
  background:#2563eb;color:#fff;font:600 12px/1 system-ui,sans-serif;padding:7px 12px;border-radius:999px;pointer-events:none}
`;

/** The page content: the built content normally; the draft (kept up to date by the editor) in preview mode. */
export function usePreview(initial: SiteContent): { content: SiteContent; preview: boolean } {
  const [content, setContent] = useState(initial);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const p = params();
    if (!p) return;
    setPreview(true);
    document.documentElement.classList.add("tt-preview");
    const style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);

    fetch(`${TRIBETRAVEL_URL}/api/site/${encodeURIComponent(AGENCY_SLUG)}/preview?token=${encodeURIComponent(p.token)}`,
      { headers: { Accept: "application/json" }, credentials: "omit" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: Payload | null) => { if (j) setContent(merge(j)); })
      .catch(() => {});

    const post = (m: unknown) => window.parent.postMessage(m, p.editor);
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== p.editor || !e.data || typeof e.data !== "object") return;
      const m = e.data as { type?: string; payload?: Payload; id?: string };
      if (m.type === "tt-content" && m.payload) setContent(merge(m.payload));
      if (m.type === "tt-select" && typeof m.id === "string") select(m.id, 10);
    };
    // A section the editor just added is drawn a moment after its content arrives, so look again briefly.
    const select = (id: string, tries: number) => {
      const el = document.querySelector(`[data-tt-block="${CSS.escape(id)}"]`);
      if (!el) {
        if (tries > 0) window.setTimeout(() => select(id, tries - 1), 50);
        return;
      }
      document.querySelectorAll("[data-tt-selected]").forEach((n) => n.removeAttribute("data-tt-selected"));
      el.setAttribute("data-tt-selected", "");
      // Scroll once the redraw has settled, or a layout change cancels it.
      window.setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    };
    // In the editor a click picks a section to edit; links and buttons don't navigate away.
    const onClick = (e: MouseEvent) => {
      const block = (e.target as Element | null)?.closest?.("[data-tt-block]");
      if (!block) return;
      e.preventDefault();
      e.stopPropagation();
      post({ type: "tt-edit", id: block.getAttribute("data-tt-block") });
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    post({ type: "tt-ready" });
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
      style.remove();
    };
  }, []);

  return { content, preview };
}
