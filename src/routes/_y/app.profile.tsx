import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — YAAWP" },
      { name: "description", content: "YAAWP Profile." },
      { property: "og:title", content: "Profile — YAAWP" },
      { property: "og:description", content: "YAAWP Profile." },
    ],
  }),
  component: ProfilePage,
});
