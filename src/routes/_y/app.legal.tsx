import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/legal")({
  head: () => ({
    meta: [
      { title: "Legal — YAAWP" },
      { name: "description", content: "YAAWP Legal." },
      { property: "og:title", content: "Legal — YAAWP" },
      { property: "og:description", content: "YAAWP Legal." },
    ],
  }),
  component: LegalPage,
});
