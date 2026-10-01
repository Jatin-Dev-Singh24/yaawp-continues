import { createFileRoute } from "@tanstack/react-router";
import { LegalStandalonePage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/legal")({
  head: () => ({
    meta: [
      { title: "Legal — YAAWP" },
      { name: "description", content: "YAAWP privacy policy, terms, cookies and community guidelines." },
      { property: "og:title", content: "Legal — YAAWP" },
      { property: "og:description", content: "YAAWP privacy policy, terms, cookies and community guidelines." },
    ],
  }),
  component: LegalStandalonePage,
});
