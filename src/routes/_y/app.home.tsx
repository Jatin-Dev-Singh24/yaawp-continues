import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/home")({
  head: () => ({
    meta: [
      { title: "Home — YAAWP" },
      { name: "description", content: "Your YAAWP home feed: the latest posts, photos and updates from friends and circles you follow." },
      { property: "og:title", content: "Home — YAAWP" },
      { property: "og:description", content: "Your YAAWP home feed: the latest posts, photos and updates from friends and circles you follow." },
    ],
  }),
  component: HomePage,
});
