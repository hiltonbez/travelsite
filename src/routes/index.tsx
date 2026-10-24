import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Facebook, Mail, MessageCircle, Pause, Phone, Play } from "lucide-react";
import islands from "@/assets/islands.jpg";
import safari from "@/assets/safari.jpg";
import cities from "@/assets/cities.jpg";
import cruises from "@/assets/cruises.jpg";
import { EnquiryForm } from "@/components/enquiry-form";
import { contact } from "@/lib/contact";

// Served from public/videos (was hosted by Lovable)
// ?v= busts the Cloudflare cache when the video changes
const heroVideo = { url: "/videos/hero.mp4?v=2" };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Paper Plane Travel & Tours — Oh, the places you'll go" },
      { name: "description", content: "A small South African travel agency planning islands, safaris, city breaks and cruises, for business or pleasure, at the best possible price." },
      { property: "og:title", content: "Paper Plane Travel & Tours — Some places change everything" },
      { property: "og:description", content: "Tailor-made holidays to Madagascar, Mauritius, Zanzibar, Thailand and beyond, planned personally by Vanessa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// "price" values are taken from the current specials on paperplanetravel.co.za.
const destinations = [
  { tag: "Islands", name: "Madagascar", line: "Nosy Komba, far from the mega-resorts", img: islands, price: "7 nights from R36 500 pp" },
  { tag: "Safari", name: "Big 5 Safaris", line: "Golden hours with the herds", img: safari, price: "Ask Vanessa for a quote" },
  { tag: "Cities", name: "City Breaks", line: "Abu Dhabi, Dubai and beyond", img: cities, price: "5 nights from R24 933 pp" },
  { tag: "Cruises", name: "Cruises", line: "Ocean views, and a balcony upgrade", img: cruises, price: "Ask about the NCL special" },
];

const steps = ["Choose a place", "Tell us your dates", "Plan with Vanessa"];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Index() {
  useReveal();
  const vid = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const toggle = () => {
    const v = vid.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-5 md:px-24">
          <a href="/" className="flex flex-col whitespace-nowrap leading-none">
            <span className="text-base font-semibold tracking-[0.25em] sm:text-lg sm:tracking-[0.35em]">PAPER PLANE</span>
            <span className="eyebrow mt-1 text-[0.55rem] text-muted-foreground">Travel &amp; Tours</span>
          </a>
          <nav className="hidden gap-12 lg:flex">
            <a href="#destinations" className="eyebrow hover:text-primary">Destinations</a>
            <a href="#vanessa" className="eyebrow hover:text-primary">About Vanessa</a>
            <a href="#journal" className="eyebrow hover:text-primary">Journal</a>
          </nav>
          <a href="#plan" className="eyebrow whitespace-nowrap bg-primary px-4 py-3 text-primary-foreground transition hover:brightness-110 sm:px-5">
            <span className="sm:hidden">Enquire</span>
            <span className="hidden sm:inline">Plan your journey</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="flex">
        <aside className="hidden w-24 shrink-0 flex-col items-center justify-between py-8 md:flex">
          <span className="h-40 w-px bg-border" />
          <span className="eyebrow [writing-mode:vertical-rl] rotate-180">A different point of view</span>
          <span className="h-40 w-px bg-border" />
          <span className="text-sm">01</span>
        </aside>
        <div className="relative h-[calc(100svh-4rem)] min-h-[560px] flex-1 overflow-hidden">
          <video ref={vid} src={heroVideo.url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full scale-105 object-cover" />
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
              Some places<br />change everything.
            </h1>
            <a href="#destinations" className="animate-rise mt-6 inline-flex items-center gap-2 border-b border-on-media pb-1 text-lg" style={{ animationDelay: ".3s" }}>
              Explore Madagascar <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <button onClick={toggle} aria-label={playing ? "Pause video" : "Play video"} className="absolute bottom-10 right-6 grid h-11 w-11 place-items-center rounded-full border-2 border-on-media text-on-media md:bottom-14 md:right-8">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
      </section>

      {/* Journey steps */}
      <section id="plan" className="grid gap-10 px-5 py-20 md:grid-cols-2 md:px-24">
        <h2 className="reveal font-display text-5xl tracking-[-0.04em] md:border-r md:border-border md:text-7xl">Make it your journey.</h2>
        <ul className="reveal">
          {steps.map((s, i) => (
            <li key={s}>
              <a href="#contact" className="group flex items-center gap-8 border-b border-border py-4 text-lg">
                <span className="text-xs">0{i + 1}</span>
                <span className="flex-1">{s}</span>
                <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-2" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-border py-6">
        <div className="animate-marquee flex w-max gap-16 whitespace-nowrap font-display text-4xl tracking-tight text-muted-foreground">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["Madagascar", "Zanzibar", "Mauritius", "Seychelles", "Thailand", "Bali", "Maldives", "Kenya", "Zimbabwe"].map((d) => (
              <span key={d + k}>{d} <span className="text-primary">✦</span></span>
            )),
          )}
        </div>
      </div>

      {/* Destinations */}
      <section id="destinations" className="px-5 py-24 md:px-24">
        <div className="reveal mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-primary">Destinations</p>
            <h2 className="mt-3 font-display text-4xl tracking-[-0.03em] md:text-6xl">Where will you go next?</h2>
          </div>
          <a href="#contact" className="eyebrow hidden items-center gap-2 md:inline-flex">View all <ArrowUpRight className="h-4 w-4" /></a>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((d, i) => (
            <a key={d.name} href="#contact" className="reveal group relative aspect-[4/5] overflow-hidden" style={{ transitionDelay: `${i * 120}ms` }}>
              <img src={d.img} alt={d.name} loading="lazy" width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover transition duration-[1.4s] group-hover:scale-110" />
              <div className="media-fade absolute inset-0" />
              <span className="eyebrow absolute left-5 top-5 text-on-media">{d.tag}</span>
              <div className="absolute inset-x-5 bottom-5 text-on-media">
                <h3 className="font-display text-3xl tracking-tight">{d.name}</h3>
                <p className="text-sm opacity-90">{d.line}</p>
                <p className="mt-3 max-h-0 overflow-hidden text-sm opacity-0 transition-all duration-500 group-hover:max-h-10 group-hover:opacity-100">
                  {d.price} →
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Video break */}
      <section className="relative h-[80vh] overflow-hidden">
        <video src={heroVideo.url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover [filter:saturate(1.1)_brightness(.75)]" />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-on-media">
          <p className="reveal eyebrow">Our promise</p>
          <p className="reveal mt-6 max-w-4xl font-display text-4xl leading-tight tracking-[-0.03em] md:text-6xl">
            Not a package. A journey built around the way you want to feel.
          </p>
        </div>
      </section>

      {/* Stats + Vanessa */}
      <section id="vanessa" className="grid gap-16 px-5 py-24 md:grid-cols-2 md:px-24">
        <div className="reveal">
          <p className="eyebrow text-primary">About Vanessa</p>
          <h2 className="mt-3 font-display text-4xl tracking-[-0.03em] md:text-5xl">Experience the difference.</h2>
          <p className="mt-6 max-w-lg text-muted-foreground">
            Paper Plane is a small agency focused on finding you the best travel solutions, for business or pleasure. Vanessa seeks out the adventures that suit you best, at the best possible price, so you make the most of every trip and come home with memories that last forever.
          </p>
        </div>
        <div className="reveal grid grid-cols-2 gap-px bg-border">
          {[["1:1", "Personal planning"], ["100%", "Tailor-made"], ["ZAR", "Quoted in rand"], ["2-in-1", "Business & leisure"]].map(([n, l]) => (
            <div key={l} className="bg-background p-8">
              <div className="font-display text-5xl tracking-tight text-primary">{n}</div>
              <div className="eyebrow mt-3 text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Journal */}
      <section id="journal" className="bg-secondary px-5 py-24 md:px-24">
        <p className="reveal eyebrow text-primary">Journal</p>
        <h2 className="reveal mt-3 font-display text-4xl tracking-[-0.03em] md:text-5xl">Stories from the road</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {[
            { img: safari, t: "When to go on safari in Botswana", c: "Safari · 6 min" },
            { img: islands, t: "Choosing the right Maldives island", c: "Islands · 4 min" },
            { img: cruises, t: "The quiet magic of fjord cruising", c: "Cruises · 5 min" },
          ].map((p) => (
            <article key={p.t} className="reveal group cursor-pointer">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={p.img} alt="" loading="lazy" width={1024} height={1280} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <p className="eyebrow mt-5 text-muted-foreground">{p.c}</p>
              <h3 className="mt-2 text-xl group-hover:text-primary">{p.t}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="grid gap-16 px-5 py-24 md:grid-cols-2 md:px-24">
        <div className="reveal">
          <h2 className="font-display text-5xl tracking-[-0.04em] lg:text-7xl xl:text-8xl">Ready when you are.</h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            Tell Vanessa where you'd like to go and when. She'll come back to you with ideas and a quote in rand.
          </p>
          <ul className="mt-10 space-y-4 text-lg">
            <li><a href={`mailto:${contact.email}`} className="inline-flex items-center gap-3 hover:text-primary"><Mail className="h-5 w-5 text-primary" />{contact.email}</a></li>
            <li><a href={`tel:${contact.phoneE164}`} className="inline-flex items-center gap-3 hover:text-primary"><Phone className="h-5 w-5 text-primary" />{contact.phoneDisplay}</a></li>
            <li><a href={contact.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 hover:text-primary"><MessageCircle className="h-5 w-5 text-primary" />WhatsApp</a></li>
            <li><a href={contact.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 hover:text-primary"><Facebook className="h-5 w-5 text-primary" />Facebook</a></li>
          </ul>
        </div>
        <EnquiryForm className="reveal" />
      </section>

      <footer className="mx-5 flex flex-col gap-4 border-t border-border py-8 md:mx-8 md:flex-row md:items-center md:justify-between md:px-16">
        <div className="eyebrow flex flex-wrap gap-4">
          {["Islands", "Safari", "Cities", "Cruises"].map((c, i) => (
            <span key={c}>{i > 0 && <span className="mr-4">/</span>}{c}</span>
          ))}
        </div>
        <span className="eyebrow">© {new Date().getFullYear()} Paper Plane Travel &amp; Tours</span>
      </footer>
    </div>
  );
}
