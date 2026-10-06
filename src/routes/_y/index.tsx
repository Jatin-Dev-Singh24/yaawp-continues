import { createFileRoute } from "@tanstack/react-router";
import { PreviewPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/")({
  head: () => ({
    meta: [
      { title: "YAAWP — Pure social expression" },
      { name: "description", content: "Real moments, genuine connections. Join YAAWP." },
      { property: "og:title", content: "YAAWP — Pure social expression" },
      { property: "og:description", content: "Real moments, genuine connections. Join YAAWP." },
    ],
  }),
  component: PreviewPage,
});
