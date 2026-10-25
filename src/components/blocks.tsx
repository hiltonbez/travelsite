// One component per section type (TribeTravel's visual editor, P17.150). index.tsx renders the page's sections in
// the order TribeTravel sends them; each is wrapped in [data-tt-block] so the editor's preview can outline it.
import { useRef, useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Facebook, Instagram, Mail, MessageCircle, Pause, Play, Phone, Star } from "lucide-react";
import { EnquiryForm } from "@/components/enquiry-form";
import { PackagesSection } from "@/components/packages";
import { cn } from "@/lib/utils";
import { phoneE164, waLink, type Block, type SiteContent } from "@/lib/site-content";

type Ctx = { chat: boolean };
const chatProps = (ctx: Ctx) => (ctx.chat ? { "data-tt-chat-open": "" } : {});

/** "Some places change everything." -> ["Some places", "change everything."]: the last two words on line two. */
function splitHeadline(h: string): [string, string] {
  const words = h.trim().split(/\s+/);
  return words.length > 3 ? [words.slice(0, -2).join(" "), words.slice(-2).join(" ")] : [h, ""];
}

/** The anchor a section answers to (the first of its kind): the header links and buttons point at these. */
export const ANCHORS: Partial<Record<Block["type"], string>> = {
  steps: "plan", featured: "destinations", packages: "packages", about: "about", journal: "journal", contact: "contact",
};

function Hero({ d, ctx }: { d: SiteContent["hero"]; ctx: Ctx }) {
  const vid = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [line1, line2] = splitHeadline(d.headline);
  const toggle = () => {
    const v = vid.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };
  return (
    <section className="flex">
      <aside className="hidden w-24 shrink-0 flex-col items-center justify-between py-8 md:flex">
        <span className="h-40 w-px bg-border" />
        <span className="eyebrow [writing-mode:vertical-rl] rotate-180">{d.sideText}</span>
        <span className="h-40 w-px bg-border" />
        <span className="text-sm">01</span>
      </aside>
      <div className="relative h-[calc(100svh-4rem)] min-h-[560px] flex-1 overflow-hidden">
        {d.video
          ? <video ref={vid} src={d.video} poster={d.image || undefined} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full scale-105 object-cover" />
          : d.image && <img src={d.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <div className="media-fade absolute inset-0" />
        {[
          { l: "Explore", c: "left-[30%] top-[18%]" },
          { l: "Unwind", c: "right-[10%] top-[30%]" },
          { l: "Stay", c: "right-[25%] top-[62%]" },
        ].map((p, i) => (
          <div key={p.l} className={`animate-rise absolute hidden flex-col items-start text-on-media sm:flex ${p.c}`} style={{ animationDelay: `${0.6 + i * 0.3}s` }}>
            <span className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full border-2 border-on-media" />{p.l}</span>
            <span className="ml-[4px] h-14 w-px bg-on-media" />
            <span className="animate-pulse-ring h-3 w-3 rounded-full border-2 border-on-media" />
          </div>
        ))}
        <div className="absolute bottom-10 left-6 text-on-media md:bottom-14 md:left-12">
          <h1 className="animate-rise font-display text-5xl leading-[0.95] tracking-[-0.04em] md:text-7xl">
            {line1}{line2 && <><br />{line2}</>}
          </h1>
          <a href="#destinations" className="animate-rise mt-6 inline-flex items-center gap-2 border-b border-on-media pb-1 text-lg" style={{ animationDelay: ".3s" }}>
            {d.linkLabel} <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        {d.video && (
          <button onClick={toggle} aria-label={playing ? "Pause video" : "Play video"} className="absolute bottom-10 right-6 grid h-11 w-11 place-items-center rounded-full border-2 border-on-media text-on-media md:bottom-14 md:right-8">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        )}
      </div>
    </section>
  );
}

function Steps({ d, ctx, anchor }: { d: SiteContent["steps"]; ctx: Ctx; anchor?: string | undefined }) {
  return (
    <section id={anchor} className="grid gap-10 px-5 py-20 md:grid-cols-2 md:px-24">
      <h2 className="reveal font-display text-5xl tracking-[-0.04em] md:border-r md:border-border md:text-7xl">{d.title}</h2>
      <ul className="reveal">
        {d.items.map((s, i) => (
          <li key={s + i}>
            <a href="#contact" {...chatProps(ctx)} className="group flex items-center gap-8 border-b border-border py-4 text-lg">
              <span className="text-xs">0{i + 1}</span>
              <span className="flex-1">{s}</span>
              <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-2" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Places({ names }: { names: string[] }) {
  return (
    <div className="overflow-hidden border-y border-border py-6">
      <div className="animate-marquee flex w-max gap-16 whitespace-nowrap font-display text-4xl tracking-tight text-muted-foreground">
        {Array.from({ length: 2 }).flatMap((_, k) => names.map((d) => <span key={d + k}>{d} <span className="text-primary">✦</span></span>))}
      </div>
    </div>
  );
}

function Featured({ d, ctx, anchor }: { d: SiteContent["featured"]; ctx: Ctx; anchor?: string | undefined }) {
  return (
    <section id={anchor} className="px-5 py-24 md:px-24">
      <div className="reveal mb-12 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-primary">{d.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl tracking-[-0.03em] md:text-6xl">{d.title}</h2>
        </div>
        <a href="#contact" className="eyebrow hidden items-center gap-2 md:inline-flex">View all <ArrowUpRight className="h-4 w-4" /></a>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {d.cards.map((c, i) => (
          <a key={c.name + i} href="#contact" {...chatProps(ctx)} className="reveal group relative aspect-[4/5] overflow-hidden" style={{ transitionDelay: `${i * 120}ms` }}>
            <img src={c.img} alt={c.name} loading="lazy" width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover transition duration-[1.4s] group-hover:scale-110" />
            <div className="media-fade absolute inset-0" />
            <span className="eyebrow absolute left-5 top-5 text-on-media">{c.tag}</span>
            <div className="absolute inset-x-5 bottom-5 text-on-media">
              <h3 className="font-display text-3xl tracking-tight">{c.name}</h3>
              <p className="text-sm opacity-90">{c.line}</p>
              <p className="mt-3 max-h-0 overflow-hidden text-sm opacity-0 transition-all duration-500 group-hover:max-h-10 group-hover:opacity-100">{c.price} →</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function PromiseSection({ d }: { d: SiteContent["promise"] & { video: string } }) {
  return (
    <section className="relative h-[80vh] overflow-hidden bg-ink">
      {d.video && <video src={d.video} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover [filter:saturate(1.1)_brightness(.75)]" />}
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-on-media">
        <p className="reveal eyebrow">{d.eyebrow}</p>
        <p className="reveal mt-6 max-w-4xl font-display text-4xl leading-tight tracking-[-0.03em] md:text-6xl">{d.text}</p>
      </div>
    </section>
  );
}

function About({ d, anchor }: { d: SiteContent["about"]; anchor?: string | undefined }) {
  return (
    <section id={anchor} className="grid gap-16 px-5 py-24 md:grid-cols-2 md:px-24">
      <div className="reveal">
        <p className="eyebrow text-primary">{d.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl tracking-[-0.03em] md:text-5xl">{d.title}</h2>
        <p className="mt-6 max-w-lg whitespace-pre-line text-muted-foreground">{d.body}</p>
      </div>
      <div className="reveal grid grid-cols-2 gap-px bg-border">
        {d.stats.map(([n, l], i) => (
          <div key={l + i} className="bg-background p-8">
            <div className="font-display text-5xl tracking-tight text-primary">{n}</div>
            <div className="eyebrow mt-3 text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Journal({ d, anchor }: { d: SiteContent["journal"]; anchor?: string | undefined }) {
  return (
    <section id={anchor} className="bg-secondary px-5 py-24 md:px-24">
      <p className="reveal eyebrow text-primary">{d.eyebrow}</p>
      <h2 className="reveal mt-3 font-display text-4xl tracking-[-0.03em] md:text-5xl">{d.title}</h2>
      <div className="mt-12 grid gap-10 md:grid-cols-3">
        {d.posts.map((p) => {
          const inner = (
            <>
              <div className="aspect-[4/3] overflow-hidden">
                <img src={p.img} alt="" loading="lazy" width={1024} height={1280} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <p className="eyebrow mt-5 text-muted-foreground">{p.tag}</p>
              <h3 className="mt-2 text-xl group-hover:text-primary">{p.title}</h3>
            </>
          );
          return p.link
            ? <a key={p.title} href={p.link} target="_blank" rel="noreferrer" className="reveal group block">{inner}</a>
            : <article key={p.title} className="reveal group">{inner}</article>;
        })}
      </div>
    </section>
  );
}

function Contact({ d, ctx, anchor }: { d: SiteContent["contact"]; ctx: Ctx; anchor?: string | undefined }) {
  return (
    <section id={anchor} className="grid gap-16 px-5 py-24 md:grid-cols-2 md:px-24">
      <div className="reveal">
        <h2 className="font-display text-5xl tracking-[-0.04em] lg:text-7xl xl:text-8xl">{d.title}</h2>
        <p className="mt-6 max-w-md text-muted-foreground">{d.intro}</p>
        {ctx.chat && (
          <button type="button" data-tt-chat-open="" className="eyebrow mt-8 inline-flex items-center gap-2 bg-primary px-8 py-4 text-primary-foreground transition hover:brightness-110">
            Chat to plan your trip <ArrowUpRight className="h-4 w-4" />
          </button>
        )}
        <ul className="mt-10 space-y-4 text-lg">
          {d.email && <li><a href={`mailto:${d.email}`} className="inline-flex items-center gap-3 hover:text-primary"><Mail className="h-5 w-5 text-primary" />{d.email}</a></li>}
          {d.phone && <li><a href={`tel:${phoneE164(d.phone)}`} className="inline-flex items-center gap-3 hover:text-primary"><Phone className="h-5 w-5 text-primary" />{d.phone}</a></li>}
          {d.whatsapp && <li><a href={waLink(d.whatsapp)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 hover:text-primary"><MessageCircle className="h-5 w-5 text-primary" />WhatsApp</a></li>}
          {d.facebook && <li><a href={d.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 hover:text-primary"><Facebook className="h-5 w-5 text-primary" />Facebook</a></li>}
          {d.instagram && <li><a href={d.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 hover:text-primary"><Instagram className="h-5 w-5 text-primary" />Instagram</a></li>}
        </ul>
      </div>
      <EnquiryForm className="reveal" />
    </section>
  );
}

function TextPhoto({ d, ctx }: { d: Extract<Block, { type: "text_photo" }>["data"]; ctx: Ctx }) {
  return (
    <section className="grid items-center gap-12 px-5 py-24 md:grid-cols-2 md:px-24">
      <div className={cn("reveal", d.side === "left" && "md:order-2")}>
        {d.eyebrow && <p className="eyebrow text-primary">{d.eyebrow}</p>}
        <h2 className="mt-3 font-display text-4xl tracking-[-0.03em] md:text-5xl">{d.heading}</h2>
        <p className="mt-6 max-w-lg whitespace-pre-line text-muted-foreground">{d.text}</p>
        {d.buttonLabel && (
          <a href="#contact" {...chatProps(ctx)} className="eyebrow mt-8 inline-flex items-center gap-2 bg-primary px-6 py-3 text-primary-foreground hover:brightness-110">
            {d.buttonLabel} <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
      <div className={cn("reveal aspect-[4/3] overflow-hidden bg-secondary", d.side === "left" && "md:order-1")}>
        {d.photo && <img src={d.photo} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </div>
    </section>
  );
}

function Gallery({ d }: { d: Extract<Block, { type: "gallery" }>["data"] }) {
  return (
    <section className="px-5 py-24 md:px-24">
      {d.eyebrow && <p className="reveal eyebrow text-primary">{d.eyebrow}</p>}
      {d.title && <h2 className="reveal mt-3 font-display text-4xl tracking-[-0.03em] md:text-5xl">{d.title}</h2>}
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {d.items.map((it, i) => (
          <figure key={it.photo + i} className={cn("reveal group relative overflow-hidden", i % 5 === 0 ? "aspect-square md:row-span-2 md:aspect-auto" : "aspect-square")}>
            <img src={it.photo} alt={it.caption} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            {it.caption && <figcaption className="media-fade absolute inset-x-0 bottom-0 p-3 text-sm text-on-media">{it.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}

function Reviews({ d }: { d: Extract<Block, { type: "reviews" }>["data"] }) {
  return (
    <section className="bg-secondary px-5 py-24 md:px-24">
      {d.eyebrow && <p className="reveal eyebrow text-primary">{d.eyebrow}</p>}
      {d.title && <h2 className="reveal mt-3 font-display text-4xl tracking-[-0.03em] md:text-5xl">{d.title}</h2>}
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {d.items.map((r, i) => (
          <blockquote key={r.name + i} className="reveal bg-background p-8">
            <div className="flex gap-1 text-primary" aria-label={`${r.stars} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, k) => <Star key={k} className={cn("h-4 w-4", k < r.stars ? "fill-current" : "opacity-25")} />)}
            </div>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed">“{r.text}”</p>
            <footer className="eyebrow mt-6 text-muted-foreground">{r.name}{r.trip && <> · {r.trip}</>}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

function VideoBanner({ d, ctx }: { d: Extract<Block, { type: "video_banner" }>["data"]; ctx: Ctx }) {
  const button: ReactNode = d.buttonLabel ? (() => {
    const cls = "eyebrow mt-8 inline-flex items-center gap-2 bg-primary px-8 py-4 text-primary-foreground hover:brightness-110";
    if (d.buttonAction === "link" && d.buttonUrl) return <a href={d.buttonUrl} target="_blank" rel="noreferrer" className={cls}>{d.buttonLabel} <ArrowUpRight className="h-4 w-4" /></a>;
    if (d.buttonAction === "packages") return <a href="#packages" className={cls}>{d.buttonLabel} <ArrowRight className="h-4 w-4" /></a>;
    if (d.buttonAction === "chat") return <a href="#contact" {...chatProps(ctx)} className={cls}>{d.buttonLabel} <ArrowRight className="h-4 w-4" /></a>;
    return <a href="#contact" className={cls}>{d.buttonLabel} <ArrowRight className="h-4 w-4" /></a>;
  })() : null;
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-ink">
      {d.video
        ? <video src={d.video} poster={d.image || undefined} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover [filter:brightness(.7)]" />
        : d.image && <img src={d.image} alt="" className="absolute inset-0 h-full w-full object-cover [filter:brightness(.7)]" />}
      <div className="relative max-w-3xl px-6 py-24 text-center text-on-media">
        <h2 className="reveal font-display text-4xl leading-tight tracking-[-0.03em] md:text-6xl">{d.headline}</h2>
        {d.text && <p className="reveal mx-auto mt-6 max-w-xl text-lg opacity-90">{d.text}</p>}
        {button}
      </div>
    </section>
  );
}

/** One section. `first` is true for the first section of its kind (it takes the kind's anchor). */
export function BlockView({ b, ctx, first }: { b: Block; ctx: Ctx; first: boolean }) {
  const anchor = first ? ANCHORS[b.type] : undefined;
  let inner: ReactNode = null;
  switch (b.type) {
    case "hero": inner = <Hero d={b.data} ctx={ctx} />; break;
    case "steps": inner = <Steps d={b.data} ctx={ctx} anchor={anchor} />; break;
    case "places": inner = <Places names={b.data.names} />; break;
    case "featured": inner = <Featured d={b.data} ctx={ctx} anchor={anchor} />; break;
    case "packages": inner = <PackagesSection head={b.data} />; break;
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
