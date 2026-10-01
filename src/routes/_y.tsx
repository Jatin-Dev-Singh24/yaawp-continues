import { createFileRoute, Outlet } from "@tanstack/react-router";
import yaawpCss from "../yaawp/index.css?url";
import { AppProvider } from "@/yaawp/context/AppContext";
import { TemporaryGamesProvider } from "@/yaawp/context/TemporaryGamesContext";

// Yaawp relies heavily on browser storage, so its screens render in the browser only.
export const Route = createFileRoute("/_y")({
  ssr: false,
  head: () => ({
    links: [
      { rel: "stylesheet", href: yaawpCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=MonteCarlo&display=swap" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  component: () => (
    <AppProvider>
      <TemporaryGamesProvider>
        <Outlet />
      </TemporaryGamesProvider>
    </AppProvider>
  ),
});
