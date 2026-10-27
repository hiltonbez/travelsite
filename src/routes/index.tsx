import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ANCHORS, BlockView } from "@/components/blocks";
import { AGENCY_SLUG, BRAND, TRIBETRAVEL_URL, loadSiteContent } from "@/lib/site-content";
import { usePreview } from "@/lib/preview";

export const Route = createFileRoute("/")({
  // Runs when the page is built (scripts/snapshot.mjs), so the HTML carries the agency's latest saved content.
  loader: () => loadSiteContent(),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Sun-Set Travel — Oh, the places you'll go" },
      { name: "description", content: "A small South African travel agency planning islands, safaris, city breaks and cruises, for business or pleasure, at the best possible price." },
      { property: "og:title", content: "Sun-Set Travel — Some places change everything" },
      { property: "og:description", content: "Tailor-made holidays to Madagascar, Mauritius, Zanzibar, Thailand and beyond, planned personally for you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    // TribeTravel's AI quote chat, written into the built page only when the agency has switched it on (adding it
    // from React after load raced the page's own hydration). Any [data-tt-chat-open] element opens it.
    scripts: loaderData?.chat
      ? [{
          // ?v= makes browsers fetch a changed chat script now instead of after their 4-hour cache; raise it
          // when TribeTravel's quote-chat.js changes.
          src: `${TRIBETRAVEL_URL}/static/js/quote-chat.js?v=2`,
          defer: true,
          "data-agency": AGENCY_SLUG,
          "data-accent": "#c8102e",
          "data-title": "Plan your journey",
          "data-launcher": "Get a quote",
        }]
      : [],
  }),
  component: Index,
});

function useReveal(key: unknown) {
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

const NAV: [string, string][] = [["featured", "Destinations"], ["packages", "Book online"], ["about", "About us"], ["journal", "Journal"]];

function Index() {
  const { content: c } = usePreview(Route.useLoaderData());
  useReveal(c.blocks);
  const ctx = { chat: c.chat };
  // With the chat on, the "plan" buttons open it; otherwise they scroll to the enquiry form.
  const chatProps = c.chat ? { "data-tt-chat-open": "" } : {};
  const present = new Set(c.blocks.map((b) => b.type));
  const seen = new Set<string>();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-5 md:px-24">
          <a href="/" className="flex flex-col whitespace-nowrap leading-none">
            <span className="text-base font-semibold tracking-[0.25em] sm:text-lg sm:tracking-[0.35em]">{BRAND.short}</span>
            <span className="eyebrow mt-1 text-[0.55rem] text-muted-foreground">{BRAND.tagline}</span>
          </a>
          <nav className="hidden gap-12 lg:flex">
            {NAV.filter(([t]) => present.has(t as never)).map(([t, label]) => (
              <a key={t} href={`#${ANCHORS[t as keyof typeof ANCHORS]}`} className="eyebrow hover:text-primary">{label}</a>
            ))}
          </nav>
          <a href={c.chat ? "#contact" : "#plan"} {...chatProps} className="eyebrow whitespace-nowrap bg-primary px-4 py-3 text-primary-foreground transition hover:brightness-110 sm:px-5">
            <span className="sm:hidden">Enquire</span>
            <span className="hidden sm:inline">{c.hero.buttonLabel}</span>
          </a>
        </div>
      </header>

      {c.blocks.map((b) => {
        const first = !seen.has(b.type);
        seen.add(b.type);
        return <BlockView key={b.id} b={b} ctx={ctx} first={first} />;
      })}

      <footer className="mx-5 flex flex-col gap-4 border-t border-border py-8 md:mx-8 md:flex-row md:items-center md:justify-between md:px-16">
        <div className="eyebrow flex flex-wrap gap-4">
          {["Islands", "Safari", "Cities", "Cruises"].map((x, i) => (
            <span key={x}>{i > 0 && <span className="mr-4">/</span>}{x}</span>
          ))}
        </div>
        <span className="eyebrow">© {new Date().getFullYear()} {BRAND.name}</span>
      </footer>
    </div>
  );
}
