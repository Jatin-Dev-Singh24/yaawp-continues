import React from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import yaawpCss from "../yaawp/index.css?url";

class YaawpRouteErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error("YAAWP route error:", error); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen w-full bg-[#09090b] text-[#f4f4f5] flex items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <div className="font-monte-carlo text-7xl mb-5">YAAWP</div>
          <h1 className="text-lg tracking-wide">This page could not load</h1>
          <p className="mt-2 text-sm text-zinc-500">Please try again or return to the YAAWP home page.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-zinc-100 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-950">Try again</button>
            <a href="/" className="rounded-full border border-zinc-700 px-5 py-2.5 text-xs uppercase tracking-wider text-zinc-200">Home</a>
          </div>
        </div>
      </div>
    );
  }
}

function YaawpLoadingScreen() {
  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#f4f4f5] flex flex-col items-center justify-center text-center px-6">
      <div className="flex flex-col items-center">
        <img src="/icon.svg" alt="YAAWP" className="w-16 h-16 mb-7" />
        <div className="font-monte-carlo text-7xl sm:text-8xl md:text-9xl leading-none font-normal tracking-wide">YAAWP</div>
        <p className="text-zinc-400 text-sm sm:text-base tracking-[0.14em] font-light mt-4 max-w-lg">
          Pure social expression. Real moments, genuine connections.
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_y")({
  ssr: false,
  head: () => ({
    links: [
      { rel: "stylesheet", href: yaawpCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=MonteCarlo&display=swap" },
    ],
  }),
  component: () => <YaawpRouteErrorBoundary><Outlet /></YaawpRouteErrorBoundary>,
});
