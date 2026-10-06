import { createFileRoute } from "@tanstack/react-router";
import { AppPreviewPage } from "@/yaawp/components/preview/AppPreviewPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YAAWP — Pure social expression" },
      { name: "description", content: "Real moments, genuine connections. Join YAAWP." },
      { property: "og:title", content: "YAAWP — Pure social expression" },
      { property: "og:description", content: "Real moments, genuine connections. Join YAAWP." },
    ],
  }),
  component: AppPreviewPage,
});
