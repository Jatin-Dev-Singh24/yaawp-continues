import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — YAAWP" },
      { name: "description", content: "Manage your YAAWP account, privacy, chat lock, two-factor sign-in and notification preferences." },
      { property: "og:title", content: "Settings — YAAWP" },
      { property: "og:description", content: "Manage your YAAWP account, privacy, chat lock, two-factor sign-in and notification preferences." },
    ],
  }),
  component: SettingsPage,
});
