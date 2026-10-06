import { Outlet, createFileRoute } from "@tanstack/react-router";
import yaawpCss from "../yaawp/index.css?url";

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
  head: () => ({
    links: [
      { rel: "stylesheet", href: yaawpCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=MonteCarlo&display=swap" },
    ],
  }),
  component: () => <Outlet />,
});
