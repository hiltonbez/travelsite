import { createFileRoute } from "@tanstack/react-router";
import { Concept, FONTS } from "@/concepts/cover-story";
import css from "@/concepts/cover-story/style.css?url";
import { conceptHead, ConceptNav } from "@/concepts/kit";

export const Route = createFileRoute("/concepts/cover-story")({
  head: () => conceptHead("cover-story", FONTS, css),
  component: () => (
    <>
      <Concept />
      <ConceptNav slug="cover-story" />
    </>
  ),
});
