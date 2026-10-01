import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/home")({
  head: () => ({
    meta: [
      { title: "Home — YAAWP" },
      { name: "description", content: "YAAWP Home." },
      { property: "og:title", content: "Home — YAAWP" },
      { property: "og:description", content: "YAAWP Home." },
    ],
  }),
  component: HomePage,
});
