// The home page's sections, one component per kind of block the agency edits in TribeTravel's visual editor
// (lib/site-content.ts). Every word and picture comes from the block's data; empty fields are left out. The window
// motion is the design's own (sky.tsx).
import { useEffect, useId, useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Facebook, Instagram, Mail, Phone, Star } from "lucide-react";
import { phoneE164, waLink, type Block } from "@/lib/site-content";
import { WhatsAppIcon, media } from "@/designs/shared";
import { BoardingPass } from "@/designs/window-seat/boarding-pass";
import { SectionLabel } from "@/designs/window-seat/parts";
import { Porthole, Puff, Scene, WindowClouds } from "@/designs/window-seat/sky";
import { BASE, QUOTE, btn, card, coral, display, ghost, gutter, h2, label, mono, openChat, quoteTo, soft, sunBtn } from "@/designs/window-seat/theme";

/** What every section may need to know: whether the agency switched the chat on. */
export type Ctx = { chat: boolean };
type Data<T extends Block["type"]> = Extract<Block, { type: T }>["data"];

/** A button that opens the cabin-crew chat when it's on, or goes to `href` (the quote page) when it isn't. */
function Go({ ctx, href = QUOTE, className, children }: { ctx: Ctx; href?: string; className: string; children: ReactNode }) {
  if (ctx.chat) return <button type="button" onClick={openChat} className={className}>{children}</button>;
  return <a href={href} className={className}>{children}</a>;
}

/** The first two words of a headline and the rest, so the end can be set in italics. */
function splitHeadline(h: string): [string, string] {
  const words = h.trim().split(/\s+/);
  return words.length > 3 ? [words.slice(0, -2).join(" "), words.slice(-2).join(" ")] : [h, ""];
}

// ------------------------------------------------------------------ hero
/** The big window. The page's first hero opens it (the shade slides up and it's the page's h1); any later hero is a
 *  smaller window in the page. */
function Hero({ d, primary }: { d: Data<"hero">; primary: boolean }) {
  const [a, b] = splitHeadline(d.headline || "");
  const Heading = primary ? "h1" : "h2";
  return (
    <section className={`relative grid items-center gap-10 ${gutter} ${primary ? "ws-hero " : ""}${primary ? "pt-8 pb-16 md:min-h-[calc(100svh-68px)] md:pt-6" : "py-20"} md:grid-cols-[1.05fr_.95fr]`}>
      <div className="relative z-10 flex flex-col items-start gap-6">
        {d.sideText && (
          <span className={`ws-rise flex items-center gap-2 rounded-full bg-[#FFFBF5]/80 px-4 py-2 ${label} text-[#1C2340] ring-1 ring-[#1C2340]/10`}>
            <span className={coral}>Seat 12A</span> · {d.sideText}
          </span>
        )}
        {d.headline && (
          <Heading className={`ws-rise ${display} max-w-[13ch] text-[clamp(46px,8.4vw,112px)] leading-[0.95] [animation-delay:.1s]`}>
            {a}{b && <> <em className={`font-medium italic ${coral}`}>{b}</em></>}
          </Heading>
        )}
        <div className="ws-rise flex flex-wrap items-center gap-3 [animation-delay:.22s]">
          {d.buttonLabel && <a href={QUOTE} className={`${sunBtn} min-h-14 px-7 text-base`}>{d.buttonLabel} <ArrowRight className="h-4 w-4" /></a>}
          {d.linkLabel && <a href={`${BASE}/destinations`} className={`${ghost} min-h-14 px-7 text-base`}>{d.linkLabel}</a>}
        </div>
        {primary && <FlightScreen />}
      </div>
      <div className={`relative flex justify-center ${primary ? "" : "ws-reveal"}`}>
        <Porthole shade={primary ? "load" : "reveal"}
          className={`ws-bob aspect-[3/4] ${primary ? "w-[min(80vw,440px)] md:w-[min(40vw,460px)]" : "w-[min(72vw,340px)]"}`}>
          <Scene video={d.video} img={d.image || media.islands} />
          <div className="ws-near absolute inset-0"><WindowClouds dense /></div>
        </Porthole>
        <Puff className="ws-float pointer-events-none absolute -bottom-6 -left-4 w-40 text-white/90 md:-left-10 md:w-56" />
      </div>
    </section>
  );
}

/** The seat-back screen under the hero: local time, height, speed and distance to go, moving with the scroll. */
function FlightScreen() {
  const cell = "flex flex-col gap-0.5 px-4 py-2.5";
  return (
    <div className={`ws-rise mt-2 grid grid-cols-2 overflow-hidden rounded-2xl bg-[#1C2340] text-[#FFF7EC] shadow-[0_20px_40px_-24px_rgba(28,35,64,.9)] [animation-delay:.34s] sm:grid-cols-4`} role="group" aria-label="Flight information">
      {([["Local time", "data-ws-clock", "05:50 · Dawn"], ["Altitude", "data-ws-alt", "11 280 m"], ["Speed", "data-ws-speed", "862 km/h"], ["To go", "data-ws-togo", "4 120 km"]] as const).map(([name, attr, start]) => (
        <span key={name} className={cell}>
          <span className={`${label} text-[10px] text-[#FFC857]`}>{name}</span>
          <span className={`${mono} text-sm tabular-nums whitespace-nowrap`} {...{ [attr]: "" }}>{start}</span>
        </span>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ steps
/** "Make it your journey": the steps as a flight plan, with a plane flying the dotted route between them. */
function Steps({ d, ctx, anchor }: { d: Data<"steps">; ctx: Ctx; anchor?: string | undefined }) {
  const items = d.items.filter(Boolean);
  const names = ["Check-in", "Take-off", "Landing"];
  return (
    <section id={anchor} className={`relative flex scroll-mt-24 flex-col gap-10 ${gutter} py-20`}>
      <div className="ws-reveal flex flex-col gap-4">
        <SectionLabel>Your flight plan</SectionLabel>
        {d.title && <h2 className={`${h2} max-w-[16ch]`}>{d.title}</h2>}
      </div>
      {items.length > 0 && (
        <div className="relative">
          <div aria-hidden="true" className="absolute top-9 right-[8%] left-[8%] hidden h-0 border-t-2 border-dashed border-[#1C2340]/25 md:block">
            <span className="ws-fly absolute -top-3 left-0 text-[#C2410C]">✈</span>
          </div>
          <ol className="relative grid gap-5 md:grid-cols-3">
            {items.map((s, i) => (
              <li key={s + i} className="ws-reveal" style={{ transitionDelay: `${i * 120}ms` }}>
                <Go ctx={ctx} className={`group flex h-full w-full flex-col items-start gap-4 p-6 text-left transition hover:-translate-y-1 ${card}`}>
                  <span className={`flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FFC857] ${display} text-2xl ring-8 ring-[#FFF7EC]`}>{i + 1}</span>
                  <span className={`${label} ${coral}`}>{names[i] ?? `Stop ${i + 1}`}</span>
                  <span className="text-xl leading-snug font-semibold">{s}</span>
                  <ArrowRight className="mt-auto h-5 w-5 transition group-hover:translate-x-1.5" aria-hidden="true" />
                </Go>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

// ------------------------------------------------------------------ places
/** The places the agency flies to, on a departures board; one row at a time is "Boarding". */
function Places({ names }: { names: string[] }) {
  const list = names.filter(Boolean).slice(0, 12);
  const [boarding, setBoarding] = useState(0);
  useEffect(() => {
    if (list.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setBoarding((n) => (n + 1) % list.length), 2600);
    return () => window.clearInterval(t);
  }, [list.length]);
  if (!list.length) return null;
  return (
    <section className={`relative ${gutter} py-10`}>
      <div className="ws-reveal overflow-hidden rounded-[26px] bg-[#16182B] text-[#FFE9B0] shadow-[0_40px_80px_-40px_rgba(28,35,64,.9)]">
        <div className={`flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 ${label} text-[#FFC857]`}>
          <h2 className="font-medium">Departures · Where we fly</h2>
          <span className="hidden sm:inline">Gate SS</span>
        </div>
        <ul className={`grid ${mono} text-[15px] sm:grid-cols-2`}>
          {list.map((n, i) => (
            <li key={n + i} className="ws-flap-row grid grid-cols-[52px_1fr_auto] items-center gap-3 border-b border-white/[.06] px-5 py-3 sm:odd:border-r" style={{ animationDelay: `${i * 70}ms` }}>
              <span className="text-[#FFF7EC]/45">{`SS${String(101 + i * 4)}`}</span>
              <span className="truncate text-[#FFF7EC] uppercase">{n}</span>
              <span className={`text-xs uppercase ${i === boarding ? "ws-blink text-[#4ADE80]" : "text-[#FFE9B0]/60"}`}>{i === boarding ? "Boarding" : "On time"}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ featured
/** Featured trips, each seen through its own window; the shade lifts as it scrolls into view. */
function Featured({ d, anchor }: { d: Data<"featured">; anchor?: string | undefined }) {
  if (!d.cards.length && !d.title) return null;
  return (
    <section id={anchor} className={`relative flex scroll-mt-24 flex-col gap-12 ${gutter} py-20`}>
      <div className="ws-reveal flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-4">
          {d.eyebrow && <SectionLabel>{d.eyebrow}</SectionLabel>}
          {d.title && <h2 className={`${h2} max-w-[16ch]`}>{d.title}</h2>}
        </div>
        <a href={`${BASE}/destinations`} className={ghost}>All destinations <ArrowRight className="h-4 w-4" /></a>
      </div>
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {d.cards.map((c, i) => (
          <a key={c.name + i} href={quoteTo(c.name)} className="ws-reveal group flex flex-col items-center gap-5 text-center" style={{ transitionDelay: `${(i % 4) * 110}ms` }}>
            <Porthole shade="reveal" className="aspect-[3/4] w-[min(70vw,260px)] transition duration-500 group-hover:-translate-y-2">
              {c.img && <Scene img={c.img} alt={c.name} className="h-full" />}
            </Porthole>
            <span className="flex flex-col items-center gap-1.5">
              {c.tag && <span className={`rounded-full bg-[#FFFBF5] px-3 py-1 ${label} ${coral} ring-1 ring-[#1C2340]/10`}>{c.tag}</span>}
              <h3 className={`${display} text-2xl leading-tight`}>{c.name}</h3>
              {c.line && <span className={`text-[15px] ${soft}`}>{c.line}</span>}
              {c.price && <span className="mt-1 flex items-center gap-1 text-[15px] font-semibold">{c.price} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ promise
/** The promise, written on the cabin wall between three windows (one on a phone) with the view running behind them. */
function PromiseSection({ d }: { d: Data<"promise"> }) {
  const id = `ws${useId().replace(/[^\w-]/g, "")}`;
  if (!d.text && !d.eyebrow) return null;
  const holes = (narrow: boolean) => narrow
    ? <rect x="22%" y="10%" width="56%" height="80%" rx="24%" ry="18%" fill="black" />
    : [6, 37.5, 69].map((x) => <rect key={x} x={`${x}%`} y="9%" width="25%" height="82%" rx="9%" ry="16%" fill="black" />);
  return (
    <section className={`relative ${gutter} py-16`}>
      <div className="ws-reveal relative overflow-hidden rounded-[32px] bg-[#EFE7DA] shadow-[0_40px_80px_-50px_rgba(28,35,64,.8)]">
        <div className="relative h-[300px] md:h-[340px]">
          <div className="ws-sky absolute inset-0" />
          <div className="absolute inset-0"><WindowClouds dense /></div>
          {d.video
            ? <video src={d.video} autoPlay muted loop playsInline aria-hidden="true" className="ws-scene absolute inset-x-0 bottom-0 h-[70%] w-full object-cover" />
            : <img src={media.islands} alt="" className="ws-scene absolute inset-x-0 bottom-0 h-[70%] w-full object-cover" />}
          {/* The cabin wall, with the windows cut out of it */}
          <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
            <defs>
              <mask id={`${id}-w`}><rect width="100%" height="100%" fill="white" />{holes(false)}</mask>
              <mask id={`${id}-n`}><rect width="100%" height="100%" fill="white" />{holes(true)}</mask>
            </defs>
            <rect width="100%" height="100%" fill="#EFE7DA" mask={`url(#${id}-w)`} className="hidden md:block" />
            <rect width="100%" height="100%" fill="#EFE7DA" mask={`url(#${id}-n)`} className="md:hidden" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-4 px-6 pt-2 pb-12 text-center">
          {d.eyebrow && <SectionLabel>{d.eyebrow}</SectionLabel>}
          {d.text && <p className={`${display} max-w-[22ch] text-[clamp(30px,4.4vw,56px)] leading-[1.05] font-medium italic`}>{d.text}</p>}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ about
function About({ d, anchor }: { d: Data<"about">; anchor?: string | undefined }) {
  const stats = d.stats.filter(([n, l]) => n || l);
  return (
    <section id={anchor} className={`relative grid scroll-mt-24 gap-12 ${gutter} py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center`}>
      <div className="ws-reveal flex flex-col gap-5">
        {d.eyebrow && <SectionLabel>{d.eyebrow}</SectionLabel>}
        {d.title && <h2 className={`${h2} max-w-[15ch]`}>{d.title}</h2>}
        {d.body && <p className={`max-w-[58ch] text-lg leading-relaxed whitespace-pre-line ${soft}`}>{d.body}</p>}
        <a href={`${BASE}/about`} className={`${ghost} self-start`}>Meet the crew <ArrowRight className="h-4 w-4" /></a>
      </div>
      {stats.length > 0 && (
        <div className="ws-reveal grid grid-cols-2 gap-4">
          {stats.map(([n, l], i) => (
            <div key={l + i} className={`flex flex-col gap-2 p-6 ${card} ${i % 2 ? "translate-y-6" : ""}`}>
              <b className={`${display} text-[clamp(36px,4vw,52px)] leading-none ${coral}`}>{n}</b>
              <span className={`${label} ${soft}`}>{l}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ------------------------------------------------------------------ journal
/** The journal as the in-flight magazine. */
function Journal({ d, anchor }: { d: Data<"journal">; anchor?: string | undefined }) {
  const posts = d.posts.filter((p) => p.title);
  if (!posts.length) return null;
  return (
    <section id={anchor} className={`relative flex scroll-mt-24 flex-col gap-10 ${gutter} py-20`}>
      <div className="ws-reveal flex flex-col gap-4">
        <SectionLabel>{d.eyebrow || "In-flight reading"}</SectionLabel>
        {d.title && <h2 className={`${h2} max-w-[16ch]`}>{d.title}</h2>}
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {posts.map((p, i) => {
          const inner = (
            <>
              <span className="relative block aspect-[4/5] overflow-hidden rounded-[18px] bg-[#EFE7DA]">
                {p.img && <img src={p.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
                <span className="absolute inset-x-0 top-0 bg-gradient-to-b from-[#1C2340]/70 to-transparent p-4">
                  <span className={`${display} text-xl text-white italic`}>Sky pages</span>
                  <span className={`block ${label} text-[10px] text-white/80`}>Issue {String(i + 1).padStart(2, "0")}</span>
                </span>
              </span>
              {p.tag && <span className={`mt-4 block ${label} ${coral}`}>{p.tag}</span>}
              <h3 className={`mt-2 ${display} text-2xl leading-tight`}>{p.title}</h3>
            </>
          );
          const cls = `ws-reveal group block transition duration-500 ${i % 2 ? "md:rotate-[1.2deg]" : "md:-rotate-[1.2deg]"} hover:rotate-0`;
          return p.link
            ? <a key={p.title + i} href={p.link} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
            : <article key={p.title + i} className={cls}>{inner}</article>;
        })}
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ contact
function Contact({ d, ctx, anchor }: { d: Data<"contact">; ctx: Ctx; anchor?: string | undefined }) {
  const row = "flex min-h-11 items-center gap-3 text-lg hover:underline";
  return (
    <section id={anchor} className={`relative grid scroll-mt-24 gap-12 ${gutter} py-20 lg:grid-cols-[.8fr_1.2fr]`}>
      <div className="ws-reveal flex flex-col gap-5">
        <SectionLabel>Final approach</SectionLabel>
        {d.title && <h2 className={`${h2} max-w-[12ch]`}>{d.title}</h2>}
        {d.intro && <p className={`max-w-[46ch] text-lg leading-relaxed ${soft}`}>{d.intro}</p>}
        {ctx.chat && <button type="button" onClick={openChat} className={`${btn} self-start`}>Ask the crew in the chat</button>}
        <ul className="mt-2 flex flex-col">
          {d.email && <li><a href={`mailto:${d.email}`} className={`${row} break-all`}><Mail className={`h-5 w-5 flex-none ${coral}`} />{d.email}</a></li>}
          {d.phone && <li><a href={`tel:${phoneE164(d.phone)}`} className={row}><Phone className={`h-5 w-5 flex-none ${coral}`} />{d.phone}</a></li>}
          {d.whatsapp && <li><a href={waLink(d.whatsapp)} target="_blank" rel="noreferrer" className={row}><WhatsAppIcon className={`h-5 w-5 flex-none ${coral}`} />WhatsApp</a></li>}
          {d.facebook && <li><a href={d.facebook} target="_blank" rel="noreferrer" className={row}><Facebook className={`h-5 w-5 flex-none ${coral}`} />Facebook</a></li>}
          {d.instagram && <li><a href={d.instagram} target="_blank" rel="noreferrer" className={row}><Instagram className={`h-5 w-5 flex-none ${coral}`} />Instagram</a></li>}
        </ul>
      </div>
      <div className="ws-reveal min-w-0"><BoardingPass /></div>
    </section>
  );
}

// ------------------------------------------------------------------ text and photo
function TextPhoto({ d, ctx }: { d: Data<"text_photo">; ctx: Ctx }) {
  if (!d.heading && !d.text && !d.photo) return null;
  const left = d.side === "left";
  return (
    <section className={`relative grid items-center gap-12 ${gutter} py-20 md:grid-cols-2`}>
      <div className={`ws-reveal flex flex-col gap-5 ${left ? "md:order-2" : ""}`}>
        {d.eyebrow && <SectionLabel>{d.eyebrow}</SectionLabel>}
        {d.heading && <h2 className={`${h2} max-w-[16ch]`}>{d.heading}</h2>}
        {d.text && <p className={`max-w-[56ch] text-lg leading-relaxed whitespace-pre-line ${soft}`}>{d.text}</p>}
        {d.buttonLabel && <Go ctx={ctx} className={`${btn} self-start`}>{d.buttonLabel} <ArrowRight className="h-4 w-4" /></Go>}
      </div>
      <div className={`ws-reveal flex justify-center ${left ? "md:order-1" : ""}`}>
        <Porthole shade="reveal" className="aspect-[3/4] w-[min(76vw,380px)]">
          {d.photo && <Scene img={d.photo} className="h-full" />}
        </Porthole>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ gallery
/** Window views: each photo in a small window, its caption on a tag. */
function Gallery({ d }: { d: Data<"gallery"> }) {
  if (!d.items.length) return null;
  return (
    <section className={`relative flex flex-col gap-10 ${gutter} py-20`}>
      {(d.eyebrow || d.title) && (
        <div className="ws-reveal flex flex-col gap-4">
          {d.eyebrow && <SectionLabel>{d.eyebrow}</SectionLabel>}
          {d.title && <h2 className={`${h2} max-w-[16ch]`}>{d.title}</h2>}
        </div>
      )}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {d.items.map((it, i) => (
          <li key={it.photo + i} className="ws-reveal flex flex-col items-center gap-3" style={{ transitionDelay: `${(i % 4) * 90}ms` }}>
            <figure className="flex w-full flex-col items-center gap-3">
              <Porthole clouds={false} className="aspect-[3/4] w-full max-w-[220px]">
                <img src={it.photo} alt={it.caption || ""} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              </Porthole>
              {it.caption && <figcaption className={`rounded-full bg-[#FFFBF5] px-3 py-1 text-center text-sm ring-1 ring-[#1C2340]/10`}>{it.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ------------------------------------------------------------------ reviews
/** Reviews as luggage tags, swinging gently on their strings. */
function Reviews({ d }: { d: Data<"reviews"> }) {
  if (!d.items.length) return null;
  return (
    <section className={`relative flex flex-col gap-10 ${gutter} py-20`}>
      {(d.eyebrow || d.title) && (
        <div className="ws-reveal flex flex-col gap-4">
          {d.eyebrow && <SectionLabel>{d.eyebrow}</SectionLabel>}
          {d.title && <h2 className={`${h2} max-w-[16ch]`}>{d.title}</h2>}
        </div>
      )}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {d.items.map((r, i) => (
          <div key={r.name + i} className="ws-reveal flex flex-col items-center" style={{ transitionDelay: `${(i % 3) * 110}ms` }}>
            <span aria-hidden="true" className="h-8 w-0.5 bg-[#C2410C]/60" />
            <blockquote className="ws-swing relative flex w-full flex-col gap-4 rounded-[22px] rounded-t-[60px] bg-[#FFFBF5] px-7 pt-12 pb-7 shadow-[0_30px_60px_-34px_rgba(28,35,64,.5)] ring-1 ring-[#1C2340]/8" style={{ animationDelay: `${i * -1.3}s` }}>
              <span aria-hidden="true" className="absolute top-4 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-[#FFF7EC] ring-4 ring-[#C2410C]/40" />
              <div className="flex gap-1 text-[#F59E0B]" role="img" aria-label={`${r.stars} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, k) => <Star key={k} aria-hidden="true" className={`h-4 w-4 ${k < r.stars ? "fill-current" : "opacity-25"}`} />)}
              </div>
              <p className="text-lg leading-relaxed whitespace-pre-line">“{r.text}”</p>
              {(r.name || r.trip) && (
                <footer className={`border-t-2 border-dashed border-[#1C2340]/15 pt-4 ${label} ${soft}`}>
                  {r.name}{r.trip && <> · <span className={coral}>{r.trip}</span></>}
                </footer>
              )}
            </blockquote>
          </div>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ video banner
/** The video banner as the in-flight film on a seat-back screen. */
function VideoBanner({ d, ctx }: { d: Data<"video_banner">; ctx: Ctx }) {
  if (!d.video && !d.image && !d.headline) return null;
  const cls = `${sunBtn} mt-2 min-h-14 px-7`;
  let button: ReactNode = null;
  if (d.buttonLabel) {
    if (d.buttonAction === "link" && d.buttonUrl) button = <a href={d.buttonUrl} target="_blank" rel="noreferrer" className={cls}>{d.buttonLabel} <ArrowUpRight className="h-4 w-4" /></a>;
    else if (d.buttonAction === "contact") button = <a href="#contact" className={cls}>{d.buttonLabel} <ArrowRight className="h-4 w-4" /></a>;
    // "packages" (online booking) isn't part of this package, so it asks for a quote instead.
    else if (d.buttonAction === "chat") button = <Go ctx={ctx} className={cls}>{d.buttonLabel} <ArrowRight className="h-4 w-4" /></Go>;
    else button = <a href={QUOTE} className={cls}>{d.buttonLabel} <ArrowRight className="h-4 w-4" /></a>;
  }
  return (
    <section className={`relative ${gutter} py-16`}>
      <div className="ws-reveal mx-auto max-w-[1100px] rounded-[34px] bg-[#23263A] p-3 shadow-[0_50px_90px_-40px_rgba(28,35,64,.9)] md:p-4">
        <div className="relative flex min-h-[420px] items-end overflow-hidden rounded-[24px] bg-[#16182B] md:min-h-[480px]">
          {d.video
            ? <video src={d.video} poster={d.image || undefined} autoPlay muted loop playsInline aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
            : d.image && <img src={d.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#16182B] via-[#16182B]/45 to-transparent" />
          <span className={`absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 ${label} text-white backdrop-blur`}>
            <span className="ws-blink h-2 w-2 rounded-full bg-[#F87171]" /> Now showing
          </span>
          <div className="relative flex max-w-[680px] flex-col items-start gap-4 p-6 text-white md:p-10">
            {d.headline && <h2 className={`${display} text-[clamp(32px,4.6vw,58px)] leading-[1.02]`}>{d.headline}</h2>}
            {d.text && <p className="text-lg leading-relaxed text-white/90">{d.text}</p>}
            {button}
          </div>
        </div>
        <div aria-hidden="true" className="flex items-center justify-between px-4 pt-3 text-white/50">
          <span className={`${mono} text-[11px]`}>CH 07 · {d.video ? "Film" : "Photo"}</span>
          <span className="h-1 w-24 overflow-hidden rounded-full bg-white/15"><span className="ws-film block h-full w-1/3 rounded-full bg-[#FFC857]" /></span>
        </div>
      </div>
    </section>
  );
}

/** The anchor a section answers to (the first of its kind). */
const ANCHORS: Partial<Record<Block["type"], string>> = { steps: "plan", featured: "destinations", about: "about", journal: "journal", contact: "contact" };

/** One section, wrapped so TribeTravel's editor can outline and pick it. `first` is the first of its kind; `primary`
 *  marks the page's opening hero. */
export function BlockView({ b, ctx, first, primary }: { b: Block; ctx: Ctx; first: boolean; primary: boolean }) {
  const anchor = first ? ANCHORS[b.type] : undefined;
  let inner: ReactNode = null;
  switch (b.type) {
    case "hero": inner = <Hero d={b.data} primary={primary} />; break;
    case "steps": inner = <Steps d={b.data} ctx={ctx} anchor={anchor} />; break;
    case "places": inner = <Places names={b.data.names} />; break;
    case "featured": inner = <Featured d={b.data} anchor={anchor} />; break;
    case "packages": return null; // online booking belongs to the higher packages
    case "promise": inner = <PromiseSection d={b.data} />; break;
    case "about": inner = <About d={b.data} anchor={anchor} />; break;
    case "journal": inner = <Journal d={b.data} anchor={anchor} />; break;
    case "contact": inner = <Contact d={b.data} ctx={ctx} anchor={anchor} />; break;
    case "text_photo": inner = <TextPhoto d={b.data} ctx={ctx} />; break;
    case "gallery": inner = <Gallery d={b.data} />; break;
    case "reviews": inner = <Reviews d={b.data} />; break;
    case "video_banner": inner = <VideoBanner d={b.data} ctx={ctx} />; break;
  }
  return <div data-tt-block={b.id} data-tt-type={b.type}>{inner}</div>;
}
