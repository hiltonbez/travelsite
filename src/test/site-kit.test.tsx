import { existsSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { ConceptPage } from "@/designs/studio";
import { ChatPanel } from "@/site-kit/chat-panel";
import { CONSENT_KEY, ConsentNotice } from "@/site-kit/consent";
import { CONCEPTS } from "@/designs/studio/concepts";
import { PLACES, PRIVACY } from "@/site-kit/content";
import { contact } from "@/lib/contact";
import { EnquiryForm } from "@/site-kit/enquiry-form";
import { SiteFrame, SitePagesNav } from "@/site-kit/frame";
import { LivePackages } from "@/site-kit/live-packages";
import { Newsletter } from "@/site-kit/newsletter";
import { siteHead } from "@/site-kit/head";
import { SiteSubpage } from "@/site-kit/pages";
import { resolveSubpage, SITE_PAGES, skinFor } from "@/site-kit/skins";

// The studio's own tests isolate the interactive parts from the hero visuals in the same way.
vi.mock("@/designs/studio/experience-hero", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, ExperienceHero: () => null };
});

const PKG = {
  id: "p1",
  hotel: "Test Hotel",
  star: "5 star",
  board: "Half board",
  location: "Mauritius",
  nights: 7,
  from_pp: 30000,
  currency: "ZAR",
  inclusions: [],
  image: "",
  gallery: [],
};

const ok = (body: unknown) => ({ ok: true, json: async () => body });

beforeEach(() => {
  localStorage.clear();
  // jsdom has no modal dialog support; the panels only need these calls to exist.
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
  };
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Chat panel", () => {
  it("does not call TribeTravel until the visitor starts", () => {
    render(<ChatPanel onClose={() => {}} formHref="/designs/vector/quote" />);
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: /Use the enquiry form/ }).getAttribute("href")).toBe(
      "/designs/vector/quote",
    );
  });

  it("shows a refusal and keeps the form link", async () => {
    (fetch as Mock).mockRejectedValue(new TypeError("blocked"));
    render(<ChatPanel onClose={() => {}} formHref="/designs/vector/quote" />);
    fireEvent.click(screen.getByRole("button", { name: /Start AI conversation/ }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("couldn't reach the concierge");
    expect(screen.getByRole("link", { name: /Use the enquiry form/ })).toBeTruthy();
  });
});

describe("Live packages", () => {
  it("asks the feed as soon as the section appears and lists the packages with prices", async () => {
    (fetch as Mock).mockResolvedValue(ok({ packages: [PKG], min_days_ahead: 10 }));
    render(<LivePackages onChoose={() => {}} />);
    expect(await screen.findByRole("button", { name: /Test Hotel/ })).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/From R\s?30/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Explore live packages/ })).toBeNull();
  });

  it("shows the unavailable message and no price when the feed fails", async () => {
    (fetch as Mock).mockResolvedValue({ ok: false, json: async () => ({}) });
    render(<LivePackages onChoose={() => {}} />);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Live packages are unavailable");
    expect(document.body.textContent).not.toMatch(/R\s?\d/);
  });

  it("survives a feed that answers without a package list", async () => {
    (fetch as Mock).mockResolvedValue(ok({ ok: true }));
    render(<LivePackages onChoose={() => {}} />);
    expect(await screen.findByText(/No packages are currently available/)).toBeTruthy();
  });

  it("opens the booking dialog for a selected package", async () => {
    (fetch as Mock).mockResolvedValue(ok({ packages: [PKG], min_days_ahead: 10 }));
    render(<LivePackages onChoose={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: /Test Hotel/ }));
    fireEvent.click(screen.getByRole("button", { name: /Book this package online/ }));
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog.textContent).toContain("Test Hotel"));
  });
});

describe("Skins and content", () => {
  it("gives every design a skin with a film file that exists", () => {
    expect(CONCEPTS).toHaveLength(10);
    for (const c of CONCEPTS) {
      const skin = skinFor(c.id);
      expect(skin, c.id).toBeDefined();
      expect(skin!.vars).toMatchObject({
        "--tk-a": c.palette[0],
        "--tk-b": c.palette[1],
        "--tk-c": c.palette[2],
      });
      expect(existsSync(`public/videos/studio/${skin!.film}.mp4`), `${c.id} film`).toBe(true);
      expect(existsSync(`public${skin!.filmPoster}`), `${c.id} poster`).toBe(true);
    }
  });

  it("accepts the five pages and rejects anything else", () => {
    expect(resolveSubpage("vector", "about")).toEqual({ id: "vector", page: "about" });
    expect(resolveSubpage("studio", "about")).toBeNull();
    expect(resolveSubpage("vector", "admin")).toBeNull();
    expect(resolveSubpage("../x", "about")).toBeNull();
    expect(resolveSubpage("constructor", "about")).toBeNull();
    expect(resolveSubpage("vector", "")).toBeNull();
  });

  it("keeps Window Seat's seven privacy sections without its seatbelt joke", () => {
    expect(PRIVACY.map(([title]) => title)).toEqual([
      "Who we are",
      "What we collect",
      "Why we collect it",
      "Our chat",
      "Cookies",
      "Who we share it with",
      "Your rights",
    ]);
    expect(PRIVACY.flat().join(" ")).not.toMatch(/seatbelt/i);
  });
});

describe("Cookie notice", () => {
  beforeEach(() => localStorage.clear());

  it("shows until the visitor chooses, then stays away", async () => {
    const view = render(<ConsentNotice id="vector" />);
    await screen.findByRole("region", { name: "Cookies" });
    fireEvent.click(screen.getByRole("button", { name: "Allow statistics" }));
    expect(localStorage.getItem(CONSENT_KEY)).toBe("all");
    expect(screen.queryByRole("region", { name: "Cookies" })).toBeNull();
    view.unmount();
    render(<ConsentNotice id="vector" />);
    await waitFor(() => expect(screen.queryByRole("region", { name: "Cookies" })).toBeNull());
  });

  it("still works when storage throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(<ConsentNotice id="vector" />);
    await screen.findByRole("region", { name: "Cookies" });
    fireEvent.click(screen.getByRole("button", { name: "Essential only" }));
    expect(screen.queryByRole("region", { name: "Cookies" })).toBeNull();
  });

  it("loads no analytics script, even when statistics are allowed", async () => {
    render(<ConsentNotice id="vector" />);
    await screen.findByRole("region", { name: "Cookies" });
    fireEvent.click(screen.getByRole("button", { name: "Allow statistics" }));
    expect(
      document.querySelector('script[src*="googletagmanager"], script[src*="facebook"]'),
    ).toBeNull();
  });
});

const sentBody = () => JSON.parse((fetch as Mock).mock.calls[0]![1].body as string);
const type = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = (name: RegExp) => fireEvent.click(screen.getByRole("button", { name }));

describe("Newsletter", () => {
  beforeEach(() => (fetch as Mock).mockResolvedValue(ok({ ok: true })));

  it("sends nothing without consent", () => {
    render(<Newsletter id="vector" />);
    type(/Email/, "a@example.com");
    submit(/Subscribe/);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends a sign-up marked as one", async () => {
    render(<Newsletter id="vector" />);
    type(/Email/, "a@example.com");
    fireEvent.click(screen.getByRole("checkbox", { name: /newsletter/i }));
    submit(/Subscribe/);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const body = sentBody();
    expect(body.name).toBe("Newsletter sign-up");
    expect(body.message).toContain("Newsletter sign-up");
    expect(body.message).toContain("Vector");
  });
});

describe("Enquiry form", () => {
  beforeEach(() => (fetch as Mock).mockResolvedValue(ok({ ok: true })));
  const fillQuote = () => {
    type("Your name", "Thandi Dube");
    type("Email address", "t@example.com");
    type(/Where would you like to go/, "Zanzibar");
    type(/Who.s travelling/, "2 adults");
    type(/Preferred month/, "2027-04");
  };

  it("refuses to send without consent", () => {
    render(<EnquiryForm id="vector" kind="quote" />);
    fillQuote();
    submit(/Request my personal quote/);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends destination, month, travellers and the design name", async () => {
    render(<EnquiryForm id="vector" kind="quote" />);
    fillQuote();
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree/ }));
    submit(/Request my personal quote/);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const { message } = sentBody();
    expect(message).toContain("Destination: Zanzibar");
    expect(message).toContain("When: April 2027");
    expect(message).toContain("Travellers: 2 adults");
    expect(message).toContain("Vector");
  });

  it("sends nothing when the spam trap is ticked", () => {
    const { container } = render(<EnquiryForm id="vector" kind="quote" />);
    fillQuote();
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree/ }));
    fireEvent.click(container.querySelector('input[name="botcheck"]')!);
    submit(/Request my personal quote/);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows a hostile place as plain text, capped at 200 characters", () => {
    const hostile = "<img src=x onerror=alert(1)>".repeat(20);
    const { container } = render(<EnquiryForm id="vector" kind="quote" place={hostile} />);
    const field = screen.getByLabelText(/Where would you like to go/) as HTMLInputElement;
    expect(field.value.length).toBeLessThanOrEqual(200);
    expect(container.querySelector("img")).toBeNull();
  });

  it("links the consent to the design's privacy page", () => {
    render(<EnquiryForm id="altitude" kind="quote" />);
    expect(screen.getByRole("link", { name: /Privacy/ }).getAttribute("href")).toBe(
      "/designs/altitude/privacy",
    );
  });

  it("has no destination or month fields on the contact form", () => {
    render(<EnquiryForm id="vector" kind="contact" />);
    expect(screen.queryByLabelText(/Where would you like to go/)).toBeNull();
    expect(screen.queryByLabelText(/Preferred month/)).toBeNull();
    expect(screen.getByRole("button", { name: /Send my message/ })).toBeTruthy();
  });
});

describe("Site frame", () => {
  it("links all six pages and marks the current one", () => {
    render(<SitePagesNav id="vector" current="about" />);
    const nav = screen.getByRole("navigation", { name: "Site pages" });
    const links = Array.from(nav.querySelectorAll("a"));
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/designs/vector",
      "/designs/vector/destinations",
      "/designs/vector/about",
      "/designs/vector/quote",
      "/designs/vector/contact",
      "/designs/vector/privacy",
    ]);
    expect(
      links.filter((a) => a.getAttribute("aria-current") === "page").map((a) => a.textContent),
    ).toEqual(["About us"]);
  });

  it("wraps its page in the design's own theme", () => {
    const { container } = render(
      <SiteFrame id="vector" current="about">
        <p>Body</p>
      </SiteFrame>,
    );
    const main = container.querySelector("main")!;
    expect(main.classList.contains("concept-page")).toBe(true);
    expect(main.classList.contains("theme-vector")).toBe(true);
    expect(main.style.getPropertyValue("--tk-a")).toBe("#123e35");
    expect(screen.getByText("Body")).toBeTruthy();
  });

  it("opens the chat from the header and closes it again", async () => {
    render(
      <SiteFrame id="vector" current="about">
        <p>Body</p>
      </SiteFrame>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Ask the AI assistant/ }));
    const dialog = await screen.findByRole("dialog");
    expect(
      Array.from(dialog.querySelectorAll("a"))
        .find((a) => /Use the enquiry form/.test(a.textContent ?? ""))!
        .getAttribute("href"),
    ).toBe("/designs/vector/quote");
    fireEvent.click(screen.getByRole("button", { name: "Close assistant" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("AI Concierge launcher", () => {
  beforeEach(() => (fetch as Mock).mockResolvedValue(ok({ packages: [], min_days_ahead: 10 })));

  it("floats on every subpage and opens the chat", async () => {
    render(
      <SiteFrame id="vector" current="about">
        <p>Body</p>
      </SiteFrame>,
    );
    fireEvent.click(screen.getByRole("button", { name: /^AI Concierge/ }));
    expect(await screen.findByRole("dialog")).toBeTruthy();
  });

  it("floats on the homepage too", async () => {
    render(<ConceptPage id="vector" />);
    fireEvent.click(screen.getByRole("button", { name: /^AI Concierge/ }));
    expect(await screen.findByRole("dialog")).toBeTruthy();
  });
});

describe("Site pages", () => {
  beforeEach(() => (fetch as Mock).mockResolvedValue(ok({ ok: true })));

  it("renders every page for all ten designs with its own heading", () => {
    for (const c of CONCEPTS) {
      for (const { page, label } of SITE_PAGES) {
        render(<SiteSubpage id={c.id} page={page} />);
        expect(screen.getByRole("heading", { level: 1 }).textContent, `${c.id}/${page}`).toBe(
          label,
        );
        cleanup();
      }
    }
  });

  it("lists the six places with a quote link each, and the live Beachcomber packages", async () => {
    (fetch as Mock).mockResolvedValue(ok({ packages: [PKG], min_days_ahead: 10 }));
    render(<SiteSubpage id="vector" page="destinations" />);
    for (const place of PLACES) {
      expect(screen.getByRole("heading", { name: place.name })).toBeTruthy();
    }
    expect(PLACES).toHaveLength(6);
    expect(
      screen.getByRole("link", { name: "Get a quote for Zanzibar" }).getAttribute("href"),
    ).toBe("/designs/vector/quote?to=Zanzibar");
    expect(await screen.findByRole("button", { name: /Test Hotel/ })).toBeTruthy();
  });

  it("puts live Beachcomber quotes and booking above the enquiry form on the quote page", async () => {
    (fetch as Mock).mockResolvedValue(ok({ packages: [PKG], min_days_ahead: 10 }));
    render(<SiteSubpage id="vector" page="quote" />);
    const live = await screen.findByRole("button", { name: /Test Hotel/ });
    const form = screen.getByLabelText(/Where would you like to go/);
    expect(live.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("prefills the chosen place on the quote page", () => {
    render(<SiteSubpage id="vector" page="quote" place="Zanzibar" />);
    expect((screen.getByLabelText(/Where would you like to go/) as HTMLInputElement).value).toBe(
      "Zanzibar",
    );
  });

  it("shows the agency's phone and email as text on the contact page", () => {
    render(<SiteSubpage id="vector" page="contact" />);
    expect(screen.getAllByText(contact.phoneDisplay).length).toBeGreaterThan(0);
    expect(screen.getAllByText(contact.email).length).toBeGreaterThan(0);
  });

  it("shows all seven privacy sections", () => {
    render(<SiteSubpage id="vector" page="privacy" />);
    for (const [title] of PRIVACY)
      expect(screen.getByRole("heading", { name: title })).toBeTruthy();
  });

  it("gives each page its own title and a description of 160 characters or less", () => {
    const titles = new Set<string>();
    for (const { page } of SITE_PAGES) {
      const head = siteHead("vector", page);
      const title = head.meta.find((m) => "title" in m)!.title!;
      const description = head.meta.find((m) => m.name === "description")!.content!;
      expect(description.length).toBeLessThanOrEqual(160);
      expect(title).toContain("Vector");
      titles.add(title);
    }
    expect(titles.size).toBe(5);
  });
});

describe("Homepage", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  });

  it("links the other five pages and carries the newsletter and the cookie notice", async () => {
    render(<ConceptPage id="vector" />);
    const nav = screen.getByRole("navigation", { name: "Site pages" });
    expect(Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("href"))).toEqual([
      "/designs/vector",
      "/designs/vector/destinations",
      "/designs/vector/about",
      "/designs/vector/quote",
      "/designs/vector/contact",
      "/designs/vector/privacy",
    ]);
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeTruthy();
    await screen.findByRole("region", { name: "Cookies" });
  });
});

describe("Review fixes", () => {
  it("returns keyboard focus to whatever opened the chat", () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    const view = render(<ChatPanel onClose={() => {}} />);
    // A browser moves focus into the modal when it opens; jsdom does not, so do the same here.
    screen.getByRole("button", { name: "Close assistant" }).focus();
    view.unmount();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it("keeps the chat's start button enabled while it connects, and starts only once", () => {
    (fetch as Mock).mockReturnValue(new Promise(() => {}));
    render(<ChatPanel onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Start AI conversation/ }));
    const button = screen.getByRole("button", { name: /Connecting/ });
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("aria-busy")).toBe("true");
    fireEvent.click(button);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("hides the cookie notice while a booking dialog is open", () => {
    const css = readFileSync("src/site-kit/site-kit.css", "utf8");
    expect(css).toMatch(/html\.tt-dialog-open\s+\.tk-consent\s*\{[^}]*display:\s*none/);
  });
});
