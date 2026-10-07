import { createFileRoute } from "@tanstack/react-router";
import { ChatsPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/chats")({
  head: () => ({
    meta: [
      { title: "Chats — YAAWP" },
      { name: "description", content: "Private one-to-one and group conversations with friends on YAAWP, with optional PIN chat lock." },
      { property: "og:title", content: "Chats — YAAWP" },
      { property: "og:description", content: "Private one-to-one and group conversations with friends on YAAWP, with optional PIN chat lock." },
    ],
  }),
  component: ChatsPage,
});
