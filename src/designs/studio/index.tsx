import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  X,
  Plus,
  Sparkles,
  Compass,
  ArrowLeft,
  ArrowDown,
  Bookmark,
  Loader2,
} from "lucide-react";
import { CONCEPTS, AUDIENCES, conceptPath, type Concept } from "./concepts";
import { CinemaHero, DiscoveryFilm } from "./cinema";
import { SignaturePlanner, TravelNotes } from "./signature-planners";
import { TravelEditorial, type TravelBrief } from "./journeys";
import { FLAGSHIPS, FlagshipJourney, SignatureChapter, HumanHandoff } from "./flagship";
import { useEnquiry } from "@/lib/enquiry";
import { BotTrap, FormStatus } from "@/designs/shared";
import { ChatPanel } from "@/site-kit/chat-panel";
import { LivePackages } from "@/site-kit/live-packages";
import { ConsentNotice } from "@/site-kit/consent";
import { ChatFloat, SitePagesNav } from "@/site-kit/frame";
import { Newsletter } from "@/site-kit/newsletter";

const SHORTLIST = "tribe-design-shortlist-v1";
const validIds = new Set(CONCEPTS.map((c) => c.id));
export function useShortlist() {
  const [ids, setIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(SHORTLIST) || "[]");
      if (Array.isArray(saved))
        setIds(
          [
            ...new Set(
              saved.filter((id): id is string => typeof id === "string" && validIds.has(id)),
            ),
          ].slice(0, 5),
        );
    } catch {
      /* Storage is optional. */
    }
  }, []);
  function toggle(id: string) {
    if (!ids.includes(id) && ids.length >= 5) {
      setNotice("You have five favourites. Remove one to make room for another.");
      return;
    }
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    setIds(next);
    setNotice("");
    try {
      localStorage.setItem(SHORTLIST, JSON.stringify(next));
    } catch {
      setNotice(
        "Your browser cannot save this shortlist. Keep this page open to retain your choices.",
      );
    }
  }
  return { ids, toggle, notice };
}

export function ConceptHero({
  c,
  still = false,
  onMotionChange,
}: {
  c: Concept;
  still?: boolean;
  onMotionChange?: (enabled: boolean) => void;
}) {
  const Hero = CinemaHero;
  return <Hero c={c} still={still} {...(onMotionChange ? { onMotionChange } : {})} />;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="concept-eyebrow">{children}</p>;
}

function Miniature({ c }: { c: Concept }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    if (!wrap.current) return;
    const observer = new ResizeObserver((entries) =>
      setScale((entries[0]?.contentRect.width || 480) / 1200),
    );
    observer.observe(wrap.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="studio-preview" ref={wrap}>
      <div
        className="studio-preview-canvas"
        style={{ transform: `scale(${scale})` }}
        inert
        aria-hidden="true"
      >
        <ConceptHero c={c} still />
      </div>
      <a
        className="studio-preview-link"
        href={conceptPath(c.id)}
        aria-label={`Explore ${c.name}, ${c.audience} concept`}
      >
        <span>
          Explore design <ArrowUpRight size={17} />
        </span>
      </a>
    </div>
  );
}

export function DesignStudio() {
  const [filter, setFilter] = useState("All");
  const [showSaved, setShowSaved] = useState(false);
  const { ids, toggle, notice } = useShortlist();
  const shown = CONCEPTS.filter(
    (c) => (filter === "All" || c.audience === filter) && (!showSaved || ids.includes(c.id)),
  );
  return (
    <main className="studio">
      <header className="studio-nav">
        <a href="/designs/studio" className="studio-brand">
          tribe<span>travel</span>
          <i>DESIGN STUDIO</i>
        </a>
        <a href="/packages">
          Packages & pricing <ArrowUpRight size={16} />
        </a>
      </header>
      <section className="studio-intro">
        <div>
          <p className="studio-eyebrow">
            <span /> THE AGENCY COLLECTION / TEN COMPLETE WORLDS
          </p>
          <h1>
            Ten worlds.
            <br />
            <em>Extraordinary journeys.</em>
          </h1>
          <p>
            Ten distinct identities. Ten personal ways to explore.
            <br />
            Explore the designs. Find your audience. Pick your five.
          </p>
        </div>
        <aside>
          <span className="studio-edition">REIMAGINED / NOVEMBER 2026</span>
          <span className="studio-big-number">
            10<span>→ 05</span>
          </span>
          <p>
            Two perspectives.
            <br />
            For each of five audiences.
          </p>
          <span className="studio-intro-rule" />
        </aside>
      </section>
      <div className="studio-toolbar">
        <div className="studio-filters" role="group" aria-label="Filter concepts by audience">
          {["All", ...AUDIENCES].map((a) => (
            <button key={a} onClick={() => setFilter(a)} aria-pressed={filter === a}>
              {a}
              {a === "All" && <sup>10</sup>}
            </button>
          ))}
        </div>
        <button
          className={`studio-saved ${showSaved ? "active" : ""}`}
          onClick={() => setShowSaved(!showSaved)}
          aria-pressed={showSaved}
        >
          <Bookmark size={16} /> My five <b>{ids.length}/5</b>
        </button>
      </div>
      <p role="status" className="studio-notice">
        {notice}
      </p>
      <section className="studio-grid" aria-label="Website design concepts">
        {shown.map((c) => (
          <article className="studio-card" key={c.id}>
            <Miniature c={c} />
            <div className="studio-card-meta">
              <div>
                <p>
                  {c.number} <span>/ {c.audience}</span>
                  <strong className="studio-edit-badge">EXPLORE THE EXPERIENCE</strong>
                </p>
                <a href={conceptPath(c.id)}>
                  <h2>{c.name}</h2>
                </a>
              </div>
              <button
                className={ids.includes(c.id) ? "picked" : ""}
                aria-label={`${ids.includes(c.id) ? "Remove" : "Shortlist"} ${c.name}`}
                aria-pressed={ids.includes(c.id)}
                onClick={() => toggle(c.id)}
              >
                {ids.includes(c.id) ? <Check size={19} /> : <Plus size={19} />}
              </button>
            </div>
            <p className="studio-card-line">{c.line}</p>
            <p className="studio-signature">{c.signature}</p>
            <div className="studio-swatches">
              {c.palette.map((p) => (
                <span key={p} style={{ background: p }} />
              ))}
            </div>
          </article>
        ))}
      </section>
      {shown.length === 0 && (
        <div className="studio-empty">
          <h2>Your collection starts here.</h2>
          <p>Tap the + on a design to save it. Your shortlist stays in this browser.</p>
          <button
            onClick={() => {
              setShowSaved(false);
              setFilter("All");
            }}
          >
            Explore all ten <ArrowRight size={16} />
          </button>
        </div>
      )}
      {ids.length > 0 && (
        <section className="studio-shortlist">
          <p className="studio-eyebrow">YOUR SELECTED DIRECTIONS</p>
          <h2>
            {ids.length === 5
              ? "Your five. Ready to discuss."
              : `${ids.length} selected. Keep exploring.`}
          </h2>
          <div>
            {ids.map((id) => {
              const c = CONCEPTS.find((c) => c.id === id)!;
              return (
                <span key={id}>
                  <a href={conceptPath(id)}>
                    {c.number} / {c.name}
                  </a>
                  <button aria-label={`Remove ${c.name}`} onClick={() => toggle(id)}>
                    <X size={14} />
                  </button>
                </span>
              );
            })}
          </div>
          <p>Saved on this device. Choosing a design doesn’t place an order.</p>
        </section>
      )}
      <footer className="studio-footer">
        <p>Designed for people. Connected to TribeTravel.</p>
        <span>
          Concept identities are illustrative. Photography, copy and branding are adapted for each
          agency.
        </span>
        <a href="/">
          Existing package demonstrations <ArrowUpRight size={14} />
        </a>
      </footer>
    </main>
  );
}

export function ConceptPage({ id }: { id: string }) {
  const c = CONCEPTS.find((c) => c.id === id)!;
  const { ids, toggle, notice } = useShortlist();
  const [chat, setChat] = useState(false);
  const [film, setFilm] = useState(false);
  const [pageMotion, setPageMotion] = useState(true);
  const [destination, setDestination] = useState("");
  const [brief, setBrief] = useState<TravelBrief | null>(null);
  const [travelDates, setTravelDates] = useState("");
  const [travellers, setTravellers] = useState("");
  const flagship = FLAGSHIPS.has(id);
  function chooseBrief(next: TravelBrief) {
    setBrief(next);
    setDestination(next.destination);
    if (next.dates !== undefined) setTravelDates(next.dates);
    if (next.travellers !== undefined) setTravellers(next.travellers);
    requestAnimationFrame(() =>
      document.getElementById("plan")?.scrollIntoView?.({
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      }),
    );
  }
  const { status, sending, onSubmit } = useEnquiry((fd) => ({
    message: `Design concept: ${c.name} (${c.audience}). Saved planning preferences (final trip fields above take priority): ${brief?.notes || c.experiences[0]}.\n${String(fd.get("message") || "")}`,
  }));
  const movie = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (film) movie.current?.showModal();
  }, [film]);
  return (
    <main className={`concept-page theme-${id}`} data-motion={pageMotion ? "on" : "off"}>
      <a className="skip-to-plan" href="#discover">
        Skip to trip planning
      </a>
      <nav className="concept-review-bar" aria-label="Design review">
        <a href="/designs/studio">
          <ArrowLeft size={15} /> All ten designs
        </a>
        <span>
          {c.number} / {c.name} <i>{c.audience}</i>
        </span>
        <button onClick={() => toggle(id)} aria-pressed={ids.includes(id)}>
          {ids.includes(id) ? <Check size={15} /> : <Plus size={15} />}{" "}
          {ids.includes(id) ? "In my five" : "Add to my five"}
        </button>
      </nav>
      {notice && (
        <p className="concept-review-notice" role="status">
          {notice}
        </p>
      )}
      <SitePagesNav id={id} current="home" />
      <ConceptHero c={c} onMotionChange={setPageMotion} />
      <div className="page-guide">
        <span>{c.name} / The journey</span>
        <nav aria-label="Page sections">
          <a href="#discovery-film">Explore</a>
          <a href="#discover">Make it yours</a>
          <a href="#live">Live packages</a>
          <a href="#plan">Your enquiry ↗</a>
        </nav>
      </div>
      <DiscoveryFilm
        c={c}
        motion={pageMotion}
        onChoose={(destination) =>
          chooseBrief({
            destination,
            notes: `Discovery inspiration: ${destination}. Please discuss suitable options and confirm arrangements.`,
          })
        }
      />
      {flagship && ["wildlings", "meridian"].includes(id) && <SignatureChapter c={c} />}
      {flagship ? (
        <FlagshipJourney c={c} onBrief={chooseBrief} />
      ) : (
        <SignaturePlanner c={c} onBrief={chooseBrief} />
      )}
      {flagship && ["vector", "offscript"].includes(id) && <SignatureChapter c={c} />}
      {id === "vector" && <HumanHandoff />}
      <TravelEditorial
        c={c}
        onBrief={chooseBrief}
        onChat={() => setChat(true)}
        onFilm={() => setFilm(true)}
        showManifesto={false}
      />
      {id === "maison" && <SignatureChapter c={c} />}
      {!flagship && <TravelNotes c={c} />}
      {id !== "vector" && <HumanHandoff />}
      <LivePackages onChoose={setDestination} />
      <section className="concept-plan" id="plan">
        <div>
          <Eyebrow>LET’S MAKE IT HAPPEN</Eyebrow>
          <h2>
            {c.audience === "Corporate"
              ? "Where does business take you next?"
              : c.audience === "Luxury"
                ? "An exceptional journey begins with a conversation."
                : "Your next story starts here."}
          </h2>
          <p>
            A few details are all we need to begin. Your request goes to the Sun-Set Travel demo
            agency in TribeTravel.
          </p>
          <span className="plan-note">
            No payment. No obligation.
            <br />A personal quote, prepared by your agent.
          </span>
        </div>
        <form onSubmit={onSubmit}>
          <BotTrap />
          {brief && (
            <aside className="x-saved-brief" aria-live="polite">
              <span>YOUR SAVED PLANNING PREFERENCES</span>
              <p>{brief.notes}</p>
              <button
                type="button"
                onClick={() => setBrief(null)}
                aria-label="Clear saved journey brief"
              >
                <X size={15} />
              </button>
              <small className="f-brief-priority">
                The final trip details below take priority.
              </small>
              {
                <div className="f-brief-actions">
                  <a href="#discover">
                    Edit planning preferences <ArrowUpRight size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `${c.name} — planning brief\n\nDestination / route: ${destination}\nTravel window: ${travelDates || "To discuss"}\nTravellers: ${travellers || "To discuss"}\n\n${brief.notes}\n\nPlanning ideas only. Supplier options and pricing to be confirmed by the agency.`;
                      const url = URL.createObjectURL(
                        new Blob([text], { type: "text/plain;charset=utf-8" }),
                      );
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${c.id}-planning-brief.txt`;
                      link.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    }}
                  >
                    Download planning brief <ArrowDown size={13} />
                  </button>
                </div>
              }
            </aside>
          )}
          <div className="plan-fields">
            <label>
              Your name
              <input name="name" autoComplete="name" required maxLength={120} />
            </label>
            <label>
              Email address
              <input name="email" type="email" autoComplete="email" required maxLength={200} />
            </label>
            <label>
              {c.audience === "Corporate" ? "Destination / route" : "Where are you dreaming of?"}
              <input
                name="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                maxLength={200}
              />
            </label>
            <label>
              Preferred travel dates
              <input
                name="travel_dates"
                value={travelDates}
                onChange={(e) => setTravelDates(e.target.value)}
                placeholder="e.g. April 2027, flexible"
                required
                maxLength={120}
              />
            </label>
            <label>
              {c.audience === "Family" ? "Adults, kids & their ages" : "Who’s travelling?"}
              <input
                name="travellers"
                value={travellers}
                onChange={(e) => setTravellers(e.target.value)}
                placeholder={
                  c.audience === "Family" ? "2 adults, children aged 5 and 9" : "e.g. 2 adults"
                }
                required
                maxLength={200}
              />
            </label>
            <label>
              Phone (optional)
              <input name="phone" type="tel" autoComplete="tel" maxLength={50} />
            </label>
          </div>
          <label>
            Anything that would make it special?
            <textarea
              id="plan-message"
              name="message"
              rows={3}
              placeholder="Your budget, preferences, or must-have moments…"
              maxLength={3000}
            />
          </label>
          <label className="plan-consent">
            <input type="checkbox" required /> I agree that this request and my details will be sent
            to the demo agency through TribeTravel so they can contact me about this trip.
          </label>
          <button className="concept-cta" disabled={sending || status.kind === "sent"}>
            {sending
              ? "Sending your request…"
              : status.kind === "sent"
                ? "Request received"
                : "Request my personal quote"}
            {sending ? <Loader2 size={17} /> : <ArrowUpRight size={17} />}
          </button>
          <FormStatus status={status} />
        </form>
      </section>
      <Newsletter id={id} />
      <footer className="concept-footer">
        <a className="concept-wordmark" href={conceptPath(id)}>
          {c.name}
          <span>TRAVEL</span>
        </a>
        <p>Independent spirit. Personally planned.</p>
        <button onClick={() => setChat(true)}>
          Ask the AI assistant <Sparkles size={16} />
        </button>
        <small>Illustrative agency identity · TribeTravel design concept {c.number}</small>
        <a href="/designs/studio">
          Back to the collection <ArrowUpRight size={15} />
        </a>
      </footer>
      {chat && <ChatPanel onClose={() => setChat(false)} />}
      {film && (
        <dialog
          ref={movie}
          className="studio-film"
          onCancel={() => setFilm(false)}
          aria-label="Travel inspiration film"
        >
          <button onClick={() => setFilm(false)} aria-label="Close film">
            <X />
          </button>
          <video src="/videos/hero.mp4" controls autoPlay muted playsInline />
          <p>A moment of travel inspiration. Destinations are illustrative.</p>
        </dialog>
      )}
      <ConsentNotice id={id} />
      <ChatFloat onOpen={() => setChat(true)} />
    </main>
  );
}
