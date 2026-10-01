import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app")({
  head: () => ({
    meta: [
      { title: "YAAWP" },
      { name: "description", content: "Your YAAWP feed, chats and communities." },
      { property: "og:title", content: "YAAWP" },
      { property: "og:description", content: "Your YAAWP feed, chats and communities." },
    ],
  }),
  component: AppLayout,
});
