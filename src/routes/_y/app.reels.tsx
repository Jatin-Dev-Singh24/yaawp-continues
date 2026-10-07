import { createFileRoute } from "@tanstack/react-router";
import { ReelsPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/reels")({
  head: () => ({
    meta: [
      { title: "Reels — YAAWP" },
      { name: "description", content: "Watch and share short vertical videos from people and communities you follow on YAAWP." },
      { property: "og:title", content: "Reels — YAAWP" },
      { property: "og:description", content: "Watch and share short vertical videos from people and communities you follow on YAAWP." },
    ],
  }),
  component: ReelsPage,
});
