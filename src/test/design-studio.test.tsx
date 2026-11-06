import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConceptPage, DesignStudio } from "@/designs/studio";

// Workflow tests isolate the interactive planners; hero visuals and playback are checked in-browser.
vi.mock("@/designs/studio/experience-hero", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, ExperienceHero: () => null };
});

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  localStorage.clear();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Agency design collection", () => {
  it("filters ten directions into two designs for a chosen audience", () => {
    render(<DesignStudio />);
    expect(screen.getAllByRole("article")).toHaveLength(10);
    fireEvent.click(screen.getByRole("button", { name: "Family" }));
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Little / Big" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Wildlings" })).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("limits the shortlist to five, persists across a revisit and makes room after removal", () => {
    const view = render(<DesignStudio />);
    for (const name of ["Vector", "Wildlings", "Maison", "Sidequest", "Postcard"]) {
      fireEvent.click(screen.getByLabelText(`Shortlist ${name}`, { exact: true }));
    }
    fireEvent.click(screen.getByLabelText("Shortlist Altitude", { exact: true }));
    expect(screen.getByRole("status").textContent).toContain("You have five favourites");
    view.unmount();
    render(<DesignStudio />);
    fireEvent.click(screen.getByRole("button", { name: /My five/ }));
    expect(screen.getAllByRole("article")).toHaveLength(5);
    fireEvent.click(screen.getAllByLabelText("Remove Vector", { exact: true })[0]!);
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(JSON.parse(localStorage.getItem("tribe-design-shortlist-v1")!)).toEqual([
      "wildlings",
      "maison",
      "sidequest",
      "postcard",
    ]);
  });

  it("keeps the shortlist usable when browser persistence is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(<DesignStudio />);
    fireEvent.click(screen.getByLabelText("Shortlist Vector", { exact: true }));
    expect(screen.getByRole("status").textContent).toContain("cannot save");
    expect(screen.getAllByLabelText("Remove Vector", { exact: true }).length).toBeGreaterThan(0);
  });

  it("sends the visitor’s brief and chosen experience through the existing enquiry API only on submission", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as Response);
    render(<ConceptPage id="little-big" />);
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Big family gatherings/ }));
    fireEvent.click(screen.getByRole("button", { name: /Let’s plan this family adventure/ }));
    expect(
      (screen.getByLabelText("Adults, kids & their ages") as HTMLInputElement).value,
    ).toContain("5, 9");
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Test Traveller" } });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Where are you dreaming of?"), {
      target: { value: "Mauritius" },
    });
    fireEvent.change(screen.getByLabelText("Preferred travel dates"), {
      target: { value: "April 2027" },
    });
    fireEvent.change(screen.getByLabelText("Adults, kids & their ages"), {
      target: { value: "2 adults, children 5 and 9" },
    });
    fireEvent.change(screen.getByLabelText("Anything that would make it special?"), {
      target: { value: "Connecting rooms please." },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree that this request/ }));
    fireEvent.click(screen.getByRole("button", { name: "Request my personal quote" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [url, options] = vi.mocked(fetch).mock.calls[0]!;
    expect(String(url)).toContain("/api/enquiry/");
    const payload = JSON.parse(String(options?.body));
    expect(payload.message).toContain("Big family gatherings");
    expect(payload.message).toContain("children 5 and 9");
    expect(payload.message).toContain("Connecting rooms please.");
    expect(payload.message).toContain("April 2027");
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Thanks!"));
  });

  it("carries a custom youth route into the quote brief without sending an enquiry", () => {
    render(<ConceptPage id="offscript" />);
    fireEvent.click(screen.getByRole("button", { name: "Asia" }));
    fireEvent.click(screen.getByLabelText("Remove Chiang Mai"));
    fireEvent.click(screen.getByRole("button", { name: /Take this route to my agent/ }));
    expect((screen.getByLabelText("Where are you dreaming of?") as HTMLInputElement).value).toBe(
      "Bangkok → Krabi → Singapore",
    );
    expect(
      screen.getByText(/9 nights \/ 10 calendar days before extra travel connections/),
    ).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("preserves cabin and route preferences from the corporate desk", () => {
    render(<ConceptPage id="vector" />);
    fireEvent.change(screen.getByLabelText("Travelling to"), { target: { value: "Singapore" } });
    fireEvent.change(screen.getByLabelText("Cabin preference"), {
      target: { value: "Premium economy" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Direct flights/ }));
    fireEvent.click(screen.getByRole("button", { name: /Prepare my travel brief/ }));
    expect((screen.getByLabelText("Destination / route") as HTMLInputElement).value).toBe(
      "Johannesburg → Singapore",
    );
    expect(screen.getByText(/Premium economy cabin.*Direct flights/)).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });
});
