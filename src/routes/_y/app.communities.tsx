import { createFileRoute } from "@tanstack/react-router";
import { CommunitiesPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/communities")({
  head: () => ({
    meta: [
      { title: "Communities — YAAWP" },
      { name: "description", content: "YAAWP Communities." },
      { property: "og:title", content: "Communities — YAAWP" },
      { property: "og:description", content: "YAAWP Communities." },
    ],
  }),
  component: CommunitiesPage,
});
