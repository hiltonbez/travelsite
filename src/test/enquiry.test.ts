import { afterEach, describe, expect, it, vi } from "vitest";
import { enquirySummary, EnquirySizeError, sendEnquiry } from "@/lib/enquiry";

afterEach(() => vi.unstubAllGlobals());
describe("Enquiry capacity", () => {
  it("preserves final trip fields alongside the saved brief", () => {
    expect(
      enquirySummary({
        name: "Test",
        email: "test@example.com",
        destination: "Paris",
        travel_dates: "June",
        travellers: "Two adults",
        message: "Planning preferences: rail",
      }),
    ).toBe("Destination: Paris\nWhen: June\nTravellers: Two adults\n\nPlanning preferences: rail");
  });
  it("blocks oversized briefs before any request instead of truncating them", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      sendEnquiry({ name: "Test", email: "test@example.com", message: "x".repeat(4000) }),
    ).rejects.toBeInstanceOf(EnquirySizeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("counts Unicode characters like the receiving API and accepts exactly 4000", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);
    const message = "🌍".repeat(3999);
    await sendEnquiry({ name: "Test", email: "test@example.com", message });
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body).message).toBe(`\n${message}`);
  });
});
