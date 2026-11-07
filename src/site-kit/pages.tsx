// The five pages of a Tribe Site besides the homepage. The same templates serve all ten designs; each takes its
// design's theme, film and intro words from its skin (skins.ts).
import { AmbientFilm } from "@/designs/studio/experience-hero";
import { contact } from "@/lib/contact";
import { ABOUT, PLACES, PRIVACY } from "@/site-kit/content";
import { EnquiryForm } from "@/site-kit/enquiry-form";
import { SiteFrame } from "@/site-kit/frame";
import { LivePackages } from "@/site-kit/live-packages";
import { SITE_PAGES, skinFor, type SitePage } from "@/site-kit/skins";

function Destinations({ id }: { id: string }) {
  return (
    <>
      <section className="tk-places" aria-label="Destinations">
        {PLACES.map((p) => (
          <article className="tk-place" key={p.slug}>
            <img src={p.photo} alt="" loading="lazy" />
            <h2>{p.name}</h2>
            <p className="tk-region">{p.region}</p>
            <p>{p.tagline}</p>
            <a href={`/designs/${id}/quote?to=${encodeURIComponent(p.name)}`}>
              Get a quote for {p.name}
            </a>
          </article>
        ))}
      </section>
      <LivePackages
        onChoose={(destination) =>
          window.location.assign(`/designs/${id}/quote?to=${encodeURIComponent(destination)}`)
        }
      />
    </>
  );
}

function About({ id }: { id: string }) {
  return (
    <section className="tk-prose">
      <h2>{ABOUT.title}</h2>
      {ABOUT.paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
      <p>
        <a href={`/designs/${id}/quote`}>Ask for a quote</a>
      </p>
    </section>
  );
}

function Contact({ id }: { id: string }) {
  return (
    <>
      <section className="tk-contact">
        <h2>Talk to us</h2>
        <ul>
          <li>
            Phone: <a href={`tel:${contact.phoneE164}`}>{contact.phoneDisplay}</a>
          </li>
          <li>
            Email: <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </li>
          <li>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp us
            </a>
          </li>
        </ul>
      </section>
      <EnquiryForm id={id} kind="contact" />
    </>
  );
}

function Privacy() {
  return (
    <section className="tk-prose">
      <p className="tk-note">
        Template wording for this sample site. Each agency's privacy page is checked against its own
        processes before going live.
      </p>
      {PRIVACY.map(([title, text]) => (
        <div key={title}>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
      ))}
    </section>
  );
}

export function SiteSubpage({ id, page, place }: { id: string; page: SitePage; place?: string }) {
  const skin = skinFor(id);
  if (!skin) return null;
  const label = SITE_PAGES.find((p) => p.page === page)?.label ?? "";
  return (
    <SiteFrame id={id} current={page}>
      <section className="tk-banner">
        <AmbientFilm src={`/videos/studio/${skin.film}.mp4`} poster={skin.filmPoster} />
        <div className="tk-banner-text">
          <h1>{label}</h1>
          <p>{skin.intro[page]}</p>
        </div>
      </section>
      {page === "destinations" && <Destinations id={id} />}
      {page === "about" && <About id={id} />}
      {page === "quote" && (
        <>
          <LivePackages
            onChoose={(destination) => {
              const field = document.querySelector<HTMLInputElement>('input[name="destination"]');
              if (field) field.value = destination.slice(0, 200);
              document.getElementById("plan")?.scrollIntoView({ behavior: "smooth" });
            }}
          />
          <EnquiryForm id={id} kind="quote" {...(place ? { place } : {})} />
        </>
      )}
      {page === "contact" && <Contact id={id} />}
      {page === "privacy" && <Privacy />}
    </SiteFrame>
  );
}
