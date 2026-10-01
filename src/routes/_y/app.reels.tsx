import { createFileRoute } from "@tanstack/react-router";
import { ReelsPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/reels")({
  head: () => ({
    meta: [
      { title: "Reels — YAAWP" },
      { name: "description", content: "YAAWP Reels." },
      { property: "og:title", content: "Reels — YAAWP" },
      { property: "og:description", content: "YAAWP Reels." },
    ],
  }),
  component: ReelsPage,
});
