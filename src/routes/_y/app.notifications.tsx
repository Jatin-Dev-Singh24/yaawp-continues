import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — YAAWP" },
      { name: "description", content: "YAAWP Notifications." },
      { property: "og:title", content: "Notifications — YAAWP" },
      { property: "og:description", content: "YAAWP Notifications." },
    ],
  }),
  component: NotificationsPage,
});
