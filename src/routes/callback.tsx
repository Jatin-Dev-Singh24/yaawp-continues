import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/callback")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/auth/callback",
      search: location.search,
    });
  },
});
