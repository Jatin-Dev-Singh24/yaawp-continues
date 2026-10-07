import { createFileRoute } from "@tanstack/react-router";
import { AppProvider } from "@/yaawp/context/AppContext";
import { TemporaryGamesProvider } from "@/yaawp/context/TemporaryGamesContext";
import { AppLayout } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/app")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your Feed — YAAWP" },
      { name: "description", content: "Your YAAWP feed, chats and communities." },
      { property: "og:title", content: "Your Feed — YAAWP" },
      { property: "og:description", content: "Your YAAWP feed, chats and communities." },
    ],
  }),
  component: () => (
    <AppProvider>
      <TemporaryGamesProvider>
        <AppLayout />
      </TemporaryGamesProvider>
    </AppProvider>
  ),
});
