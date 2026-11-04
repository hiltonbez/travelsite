import { createFileRoute } from "@tanstack/react-router";
import { Concept, FONTS } from "@/concepts/scratch-the-world";
import css from "@/concepts/scratch-the-world/style.css?url";
import { conceptHead, ConceptNav } from "@/concepts/kit";

export const Route = createFileRoute("/concepts/scratch-the-world")({
  head: () => conceptHead("scratch-the-world", FONTS, css),
  component: () => (
    <>
      <Concept />
      <ConceptNav slug="scratch-the-world" />
    </>
  ),
});
