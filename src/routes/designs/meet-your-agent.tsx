import { createFileRoute } from "@tanstack/react-router";
import { DesignBar } from "@/components/design-bar";
import { MEET_FONTS, MeetYourAgent } from "@/designs/meet-your-agent";
import { designHead } from "@/designs/shared";

export const Route = createFileRoute("/designs/meet-your-agent")({
  head: () => designHead("Meet Your Agent", "A personal travel agent website: a friendly hello, favourite trips and an ask-me-anything form.", MEET_FONTS),
  component: () => (
    <>
      <DesignBar current="/designs/meet-your-agent" />
      <MeetYourAgent />
    </>
  ),
});
