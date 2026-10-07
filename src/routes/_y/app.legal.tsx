import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/legal")({
  head: () => ({
    meta: [
      { title: "Legal Center — YAAWP App" },
      { name: "description", content: "Review YAAWP's privacy policy, terms of service and community guidelines from inside the app." },
      { property: "og:title", content: "Legal Center — YAAWP App" },
      { property: "og:description", content: "Review YAAWP's privacy policy, terms of service and community guidelines from inside the app." },
    ],
  }),
  component: LegalPage,
});
