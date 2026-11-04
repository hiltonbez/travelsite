import { createFileRoute } from "@tanstack/react-router";
import { CONCEPTS } from "@/concepts/list";

export const Route = createFileRoute("/concepts/")({
  head: () => ({
    meta: [{ title: "Ten website samples" }, { name: "robots", content: "noindex" }],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&display=swap",
      },
    ],
  }),
  component: ConceptsIndex,
});

function ConceptsIndex() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#101114",
        color: "#f4f1ea",
        fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
        padding: "clamp(24px, 5vw, 64px) clamp(16px, 5vw, 64px)",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(40px, 8vw, 96px)",
          fontWeight: 800,
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          margin: 0,
        }}
      >
        Ten ways to sell a holiday
      </h1>
      <p style={{ fontSize: 18, maxWidth: 620, margin: "16px 0 40px", opacity: 0.75 }}>
        Sample websites for travel agents. On each one, playing the game is how the traveller plans
        a trip and asks for a price.
      </p>
      <ol
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
        }}
      >
        {CONCEPTS.map((c, i) => (
          <li key={c.slug}>
            <a
              href={`/concepts/${c.slug}`}
              style={{
                display: "block",
                color: "inherit",
                textDecoration: "none",
                borderRadius: 14,
                overflow: "hidden",
                background: "#1b1d22",
              }}
            >
              <img
                src={c.poster}
                alt=""
                loading="lazy"
                style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
              />
              <div style={{ padding: "14px 16px 18px" }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>
                  {i + 1}. {c.name}
                </div>
                <p style={{ margin: "6px 0 0", opacity: 0.72, lineHeight: 1.4 }}>{c.pitch}</p>
              </div>
            </a>
          </li>
        ))}
      </ol>
    </main>
  );
}
