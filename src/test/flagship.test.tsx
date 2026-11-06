import { cleanup, render, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FlagshipJourney } from "@/designs/studio/flagship";
import { CONCEPTS } from "@/designs/studio/concepts";
const concept = (id: string) => CONCEPTS.find((c) => c.id === id)!;
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("The personal edit planners", () => {
  it("carries each city, meeting and preferred arrival buffer into a corporate brief", () => {
    const onBrief = vi.fn();
    render(<FlagshipJourney c={concept("vector")} onBrief={onBrief} />);
    fireEvent.change(screen.getByLabelText("Leg 1 meeting, local time"), {
      target: { value: "2027-03-04T10:30" },
    });
    fireEvent.change(screen.getByLabelText("Preferred arrival buffer"), {
      target: { value: "24" },
    });
    fireEvent.click(screen.getByText("Add another city"));
    fireEvent.change(screen.getByLabelText("Leg 2 destination"), {
      target: { value: "Singapore" },
    });
    fireEvent.change(screen.getByLabelText("Leg 2 meeting venue / preferred hotel area"), {
      target: { value: "Conference centre" },
    });
    fireEvent.click(screen.getByText("Prepare my travel brief"));
    expect(onBrief).toHaveBeenCalledTimes(1);
    expect(onBrief.mock.calls[0]![0].destination).toContain("Dubai → Singapore");
    expect(onBrief.mock.calls[0]![0].notes).toContain("24 hours");
    expect(onBrief.mock.calls[0]![0].notes).toContain("2027-03-04 10:30 (destination local time)");
    expect(onBrief.mock.calls[0]![0].notes).toContain("Conference centre");
  });
  it("includes children’s ages, rooms and both family ideas in a comparison request", () => {
    const onBrief = vi.fn();
    render(<FlagshipJourney c={concept("wildlings")} onBrief={onBrief} />);
    fireEvent.change(screen.getByLabelText("Child 1’s age"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Room preference"), {
      target: { value: "Family suite" },
    });
    fireEvent.click(screen.getByLabelText("Work around our school holidays"));
    fireEvent.click(screen.getByText("Ask my agent to compare both ideas"));
    const brief = onBrief.mock.calls[0]![0];
    expect(brief.travellers).toContain("3, 9");
    expect(brief.notes).toContain("Family suite");
    expect(brief.notes).toContain("School-holiday timing");
    expect(brief.destination).toContain("Safari");
    expect(brief.destination).toContain("island");
  });
  it("preserves a reordered route and edited nights across an explicit saved-draft restore", () => {
    const onBrief = vi.fn();
    const view = render(<FlagshipJourney c={concept("offscript")} onBrief={onBrief} />);
    fireEvent.change(screen.getByLabelText("Rome nights"), { target: { value: "5" } });
    fireEvent.click(screen.getByLabelText("Move Rome earlier"));
    fireEvent.click(screen.getByText("Save planning draft"));
    view.unmount();
    render(<FlagshipJourney c={concept("offscript")} onBrief={onBrief} />);
    fireEvent.click(screen.getByText("Resume saved draft"));
    fireEvent.click(screen.getByText("Take this route to my agent"));
    expect(onBrief.mock.calls[0]![0].destination).toBe("Lisbon → Rome → Barcelona → Athens");
    expect(onBrief.mock.calls[0]![0].notes).toContain("Rome, 5 nights");
    expect(onBrief.mock.calls[0]![0].notes).toContain("14 nights / 15 calendar days");
  });
  it("turns a mixed luxury collection into one ordered consultation brief", () => {
    const onBrief = vi.fn();
    render(<FlagshipJourney c={concept("maison")} onBrief={onBrief} />);
    fireEvent.click(screen.getByRole("button", { name: /The beautifully long way/ }));
    fireEvent.change(screen.getByLabelText("Flights"), { target: { value: "First class" } });
    fireEvent.click(screen.getByText("Arrange a private consultation"));
    const brief = onBrief.mock.calls[0]![0];
    expect(brief.destination).toContain("A room by the ocean + The beautifully long way");
    expect(brief.notes).toContain("First class");
    expect(brief.notes).toContain("2. The beautifully long way");
  });
  it("keeps atlas comparisons independent of the current filter", () => {
    const onBrief = vi.fn();
    render(<FlagshipJourney c={concept("meridian")} onBrief={onBrief} />);
    fireEvent.click(screen.getAllByText("Add to comparison")[0]!);
    fireEvent.click(screen.getByRole("button", { name: /Mountains/ }));
    expect(screen.getByRole("table")).toBeTruthy();
    fireEvent.click(screen.getByText("Discuss my selected directions"));
    expect(onBrief).toHaveBeenCalledTimes(1);
    expect(onBrief.mock.calls[0]![0].notes).toContain("Personal atlas");
  });
});
