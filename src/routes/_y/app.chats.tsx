import { createFileRoute } from "@tanstack/react-router";
import { ChatsPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app/chats")({
  head: () => ({
    meta: [
      { title: "Chats — YAAWP" },
      { name: "description", content: "YAAWP Chats." },
      { property: "og:title", content: "Chats — YAAWP" },
      { property: "og:description", content: "YAAWP Chats." },
    ],
  }),
  component: ChatsPage,
});
