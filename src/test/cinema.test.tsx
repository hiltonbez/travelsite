import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CinemaHero, DiscoveryFilm } from "@/designs/studio/cinema";
import { CONCEPTS } from "@/designs/studio/concepts";
const c = CONCEPTS.find(c=>c.id === "maison")!;
beforeEach(()=>{vi.spyOn(HTMLMediaElement.prototype,"pause").mockImplementation(()=>{});});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
describe("Cinematic exploration",()=>{
  it("changes scenes with explicit controls and wraps backwards",()=>{
    render(<CinemaHero c={c} still/>);
    fireEvent.click(screen.getByRole("button",{name:"Previous scene"}));
    expect(screen.getByRole("heading",{level:1}).textContent).toBe("Time, beautifully spent.");
    fireEvent.click(screen.getByRole("button",{name:"Next scene"}));
    expect(screen.getByRole("heading",{level:1}).textContent).toBe("Elsewhere, entirely.");
    expect(document.querySelectorAll("video")).toHaveLength(0);
  });
  it("starts without automatic motion when reduced motion is requested",()=>{
    vi.stubGlobal("matchMedia",vi.fn(()=>({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()})));
    const change=vi.fn();render(<CinemaHero c={CONCEPTS.find(c=>c.id === "little-big")!} onMotionChange={change}/>);
    fireEvent.click(screen.getByRole("button",{name:"Explore YES, AGAIN"}));
    expect(screen.getByRole("button",{name:"Play ambient motion"})).toBeTruthy();
    expect(document.querySelector("video")?.getAttribute("src")).toBeNull();
    expect(change).toHaveBeenLastCalledWith(false);
  });
  it("hands the selected discovery idea to the enquiry without sending it",()=>{
    const choose=vi.fn();render(<DiscoveryFilm c={c} motion={false} onChoose={choose}/>);
    fireEvent.click(screen.getByRole("button",{name:"Open A luxury rail journey"}));
    fireEvent.click(screen.getByRole("button",{name:/Start with this idea/}));
    expect(choose).toHaveBeenCalledWith("A luxury rail journey");
  });
});
