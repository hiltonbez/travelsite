import { createFileRoute } from "@tanstack/react-router";
import { Concept, FONTS } from "@/concepts/pop-up-book";
import css from "@/concepts/pop-up-book/style.css?url";
import { conceptHead, ConceptNav } from "@/concepts/kit";

export const Route = createFileRoute("/concepts/pop-up-book")({
  head: () => conceptHead("pop-up-book", FONTS, css),
  component: () => (
    <>
      <Concept />
      <ConceptNav slug="pop-up-book" />
    </>
  ),
});
