import { createFileRoute } from "@tanstack/react-router";
import { CommunitiesPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/communities")({
  head: () => ({
    meta: [
      { title: "Communities — YAAWP" },
      { name: "description", content: "Discover, join and chat in YAAWP communities built around shared interests." },
      { property: "og:title", content: "Communities — YAAWP" },
      { property: "og:description", content: "Discover, join and chat in YAAWP communities built around shared interests." },
    ],
  }),
  component: CommunitiesPage,
});
