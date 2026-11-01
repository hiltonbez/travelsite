// The home page: the agency's own editable site. Its sections come from TribeTravel in the order the agency set them
// (content.blocks) and are drawn by blocks.tsx; the frame around them is the Window Seat layout.
import { BRAND } from "@/designs/shared";
import type { SiteContent } from "@/lib/site-content";
import { BlockView } from "@/designs/window-seat/blocks";
import { WindowSeatLayout } from "@/designs/window-seat/layout";
import { useWsReveal } from "@/designs/window-seat/parts";
import { HOME } from "@/designs/window-seat/theme";

export function WindowSeatHome({ content }: { content: SiteContent }) {
  // Sections the editor adds or changes are drawn after load, so watch for new ones to lift into view.
  useWsReveal(content.blocks);
  const heroAt = content.blocks.findIndex((b) => b.type === "hero");
  const seen = new Set<string>();
  return (
    <WindowSeatLayout current={HOME} chat={content.chat}>
      {heroAt < 0 && <h1 className="sr-only">{BRAND.name}</h1>}
      {content.blocks.map((b, i) => {
        const first = !seen.has(b.type);
        seen.add(b.type);
        return <BlockView key={b.id} b={b} ctx={{ chat: content.chat }} first={first} primary={i === heroAt} />;
      })}
    </WindowSeatLayout>
  );
}
