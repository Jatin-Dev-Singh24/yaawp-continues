import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/yaawp/pages";

export const Route = createFileRoute("/_y/auth/login")({
  head: () => ({
    meta: [
      { title: "Log in — YAAWP" },
      { name: "description", content: "Log in to your YAAWP account." },
      { property: "og:title", content: "Log in — YAAWP" },
      { property: "og:description", content: "Log in to your YAAWP account." },
    ],
  }),
  component: LoginPage,
});
