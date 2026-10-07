import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — YAAWP" },
      { name: "description", content: "View and edit your YAAWP profile, posts, followers and personal details." },
      { property: "og:title", content: "Profile — YAAWP" },
      { property: "og:description", content: "View and edit your YAAWP profile, posts, followers and personal details." },
    ],
  }),
  component: ProfilePage,
});
