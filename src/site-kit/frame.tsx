// What every page of a Tribe Site shares besides the homepage: the design's own theme, a header with the six pages
// and the chat, the newsletter and a footer, and the cookie notice. The theme is the design's existing
// `concept-page theme-<id>` styling, so its fonts, colours, forms and dialogs apply without being repeated.
import { useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { ChatPanel } from "@/site-kit/chat-panel";
import { ConsentNotice } from "@/site-kit/consent";
import { Newsletter } from "@/site-kit/newsletter";
import { SITE_PAGES, skinFor, type SitePage } from "@/site-kit/skins";

/** Home and the five pages, for the header, the footer and the homepage's own page guide. */
export function SitePagesNav({ id, current }: { id: string; current?: SitePage | "home" }) {
  const links = [
    { key: "home", href: `/designs/${id}`, label: "Home" },
    ...SITE_PAGES.map((p) => ({ key: p.page, href: `/designs/${id}/${p.page}`, label: p.label })),
  ];
  return (
    <nav aria-label="Site pages" className="tk-nav">
      {links.map((l) => (
        <a key={l.key} href={l.href} aria-current={current === l.key ? "page" : undefined}>
          {l.label}
        </a>
      ))}
    </nav>
  );
}

export function SiteFrame({
  id,
  current,
  children,
}: {
  id: string;
  current: SitePage;
  children: ReactNode;
}) {
  const [chat, setChat] = useState(false);
  const skin = skinFor(id);
  if (!skin) return null;
  const { concept } = skin;
  return (
    <main className={`concept-page theme-${id} tk-site`} style={skin.vars}>
      <a className="skip-to-plan" href="#site-main">
        Skip to content
      </a>
      <header className="tk-header">
        <a className="tk-wordmark" href={`/designs/${id}`}>
          {concept.name}
          <span>TRAVEL</span>
        </a>
        <SitePagesNav id={id} current={current} />
        <button type="button" className="tk-chat-launcher" onClick={() => setChat(true)}>
          Ask the AI assistant <Sparkles size={16} />
        </button>
      </header>
      <div id="site-main">{children}</div>
      <Newsletter id={id} />
      <footer className="tk-footer">
        <a className="tk-wordmark" href={`/designs/${id}`}>
          {concept.name}
          <span>TRAVEL</span>
        </a>
        <SitePagesNav id={id} current={current} />
        <small>Illustrative agency identity · TribeTravel Tribe Site demo</small>
        <a href="/designs/studio">Back to the collection</a>
      </footer>
      <ConsentNotice id={id} />
      {chat && <ChatPanel onClose={() => setChat(false)} formHref={`/designs/${id}/quote`} />}
    </main>
  );
}
