import { createFileRoute } from "@tanstack/react-router";
import { ExplorePage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/explore")({
  head: () => ({
    meta: [
      { title: "Explore — YAAWP" },
      { name: "description", content: "YAAWP Explore." },
      { property: "og:title", content: "Explore — YAAWP" },
      { property: "og:description", content: "YAAWP Explore." },
    ],
  }),
  component: ExplorePage,
});
