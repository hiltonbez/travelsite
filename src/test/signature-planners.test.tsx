import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SignaturePlanner, budgetShares } from "@/designs/studio/signature-planners";
import { CONCEPTS } from "@/designs/studio/concepts";

afterEach(cleanup);
const start = (id: string) => {
  const onBrief = vi.fn();
  render(<SignaturePlanner c={CONCEPTS.find((c) => c.id === id)!} onBrief={onBrief} />);
  return onBrief;
};
describe("Distinct planning handoffs", () => {
  it("preserves the corporate team's rooming and coordination needs", () => {
    const send = start("altitude");
    fireEvent.change(screen.getByLabelText("Team destination"), { target: { value: "Cape Town" } });
    fireEvent.change(screen.getByLabelText("Travellers in the team"), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("Rooms to discuss"), { target: { value: "6" } });
    fireEvent.click(screen.getByRole("button", { name: "A team offsite" }));
    fireEvent.change(screen.getByLabelText("What needs coordinating?"), {
      target: { value: "Two accessible rooms and a workshop space" },
    });
    expect(send).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Bring the team brief together" }));
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: "Johannesburg → Cape Town",
        travellers: "8 business travellers",
        notes: expect.stringContaining("6 requested rooms"),
      }),
    );
    expect(send.mock.calls[0]![0].notes).toContain("Two accessible rooms");
  });
  it("keeps individual child ages when a family removes one child", () => {
    const send = start("little-big");
    fireEvent.change(screen.getByLabelText("Child 2 age"), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "Remove child 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Let’s plan this family adventure" }));
    expect(send.mock.calls[0]![0].travellers).toBe("2 adults; children aged 12");
    expect(send.mock.calls[0]![0].notes).toContain("supervision");
  });
  it("allocates the exact budget including odd amounts and zero", () => {
    for (const style of ["Comfort first", "Do more", "A bit of everything"]) {
      for (const total of [0, 1, 107, 19999, 1000000]) {
        const shares = budgetShares(total, style);
        expect(shares.reduce((a, b) => a + b, 0)).toBe(total);
        expect(shares.every((n) => n >= 0 && Number.isInteger(n))).toBe(true);
      }
    }
  });
  it("retains a private traveller's cabin and property preferences", () => {
    const send = start("nocturne");
    fireEvent.click(screen.getByRole("button", { name: /An ocean sanctuary/ }));
    fireEvent.change(screen.getByLabelText("Cabin preference"), {
      target: { value: "Business class" },
    });
    fireEvent.change(screen.getByLabelText("The feeling of the stay"), {
      target: { value: "Villa or exclusive-use options to discuss" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Begin a private conversation" }));
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: "An ocean sanctuary",
        notes: expect.stringContaining("Business class"),
      }),
    );
    expect(send.mock.calls[0]![0].notes).toContain("Villa or exclusive-use options to discuss");
  });
  it("hands off personal budget preferences without treating them as supplier prices", () => {
    const send = start("sidequest");
    fireEvent.change(screen.getByLabelText("Where are we heading?"), {
      target: { value: "Thailand" },
    });
    fireEvent.change(screen.getByLabelText("Budget per person in rand"), {
      target: { value: "15000" },
    });
    fireEvent.change(screen.getByLabelText("How many in the crew?"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Do more" }));
    fireEvent.click(screen.getByRole("button", { name: "Take our plan to an agent" }));
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ destination: "Thailand", travellers: "4 travellers" }),
    );
    expect(send.mock.calls[0]![0].notes).toContain("not supplier prices");
    expect(send.mock.calls[0]![0].notes).toContain("Style: Do more");
  });
  it("carries a traveller's postcard message into the enquiry draft", () => {
    const send = start("postcard");
    fireEvent.click(screen.getByRole("button", { name: "The scenic railway" }));
    fireEvent.change(screen.getByLabelText("And we would really love…"), {
      target: { value: "A mountain train for our anniversary" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Turn our postcard into a plan" }));
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: "The scenic railway",
        notes: expect.stringContaining("A mountain train for our anniversary"),
      }),
    );
  });
});
