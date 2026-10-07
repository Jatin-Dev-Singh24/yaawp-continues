import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — YAAWP" },
      { name: "description", content: "See new likes, comments, follows, mentions and community activity on YAAWP." },
      { property: "og:title", content: "Notifications — YAAWP" },
      { property: "og:description", content: "See new likes, comments, follows, mentions and community activity on YAAWP." },
    ],
  }),
  component: NotificationsPage,
});
