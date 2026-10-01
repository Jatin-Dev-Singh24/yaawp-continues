import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — YAAWP" },
      { name: "description", content: "YAAWP Settings." },
      { property: "og:title", content: "Settings — YAAWP" },
      { property: "og:description", content: "YAAWP Settings." },
    ],
  }),
  component: SettingsPage,
});
