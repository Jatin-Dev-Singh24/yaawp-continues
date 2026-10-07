import { createFileRoute } from "@tanstack/react-router";
import { ExplorePage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/explore")({
  head: () => ({
    meta: [
      { title: "Explore — YAAWP" },
      { name: "description", content: "Explore trending posts, reels, people and communities across YAAWP." },
      { property: "og:title", content: "Explore — YAAWP" },
      { property: "og:description", content: "Explore trending posts, reels, people and communities across YAAWP." },
    ],
  }),
  component: ExplorePage,
});
