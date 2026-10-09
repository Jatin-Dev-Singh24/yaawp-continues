import React, { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase, isSupabaseConfigured } from "@/yaawp/lib/supabase";
import { useApp } from "@/yaawp/context/AppContext";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

function AuthCallback() {
  const navigate = useNavigate();
  const { showToast, setIsAuthenticated } = useApp();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        if (!isSupabaseConfigured) {
          // If Supabase is not configured, navigate home
          navigate({ to: "/app/home", replace: true });
          return;
        }

        // Check URL parameters for errors or code exchange
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");
        const errorDesc = url.searchParams.get("error_description");

        if (error) {
          if (isMounted) {
            setStatus("error");
            setErrorMessage(errorDesc || error || "Authentication verification failed.");
          }
          return;
        }

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("Exchange code error:", exchangeError);
            if (isMounted) {
              setStatus("error");
              setErrorMessage(exchangeError.message);
            }
            return;
          }
        }

        // Retrieve the current session to confirm authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (isMounted) {
            setStatus("error");
            setErrorMessage(sessionError.message);
          }
          return;
        }

        if (session) {
          if (isMounted) {
            setStatus("success");
            setIsAuthenticated(true);
            showToast("Successfully authenticated! Welcome to YAAWP.");
            navigate({ to: "/app/home", replace: true });
          }
        } else {
          // Fallback check: if hash fragment exists, give Supabase a moment to detect it
          setTimeout(async () => {
            if (!isMounted) return;
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              setStatus("success");
              setIsAuthenticated(true);
              showToast("Welcome back!");
              navigate({ to: "/app/home", replace: true });
            } else {
              setStatus("error");
              setErrorMessage("No active session found. Please try logging in again.");
            }
          }, 600);
        }
      } catch (err: any) {
        console.error("Auth callback exception:", err);
        if (isMounted) {
          setStatus("error");
          setErrorMessage(err.message || "An unexpected error occurred during authentication.");
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, showToast, setIsAuthenticated]);

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#f4f4f5] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-2xl flex flex-col items-center">
        {status === "processing" && (
          <>
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
            <h2 className="text-xl font-medium tracking-wide text-zinc-100">
              Verifying Authentication...
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Finalizing your session and preparing your YAAWP feed.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-10 h-10 text-emerald-400 mb-4 animate-bounce" />
            <h2 className="text-xl font-medium tracking-wide text-zinc-100">
              Authenticated!
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Redirecting you to home...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="w-10 h-10 text-rose-400 mb-4" />
            <h2 className="text-xl font-medium tracking-wide text-zinc-100">
              Authentication Notice
            </h2>
            <p className="text-sm text-zinc-400 mt-2 mb-6">
              {errorMessage || "Unable to complete sign-in. Please try again."}
            </p>
            <button
              onClick={() => navigate({ to: "/auth/login", replace: true })}
              className="px-6 py-2.5 rounded-full bg-zinc-100 text-zinc-950 text-xs uppercase font-medium tracking-wider hover:bg-white transition-all cursor-pointer"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_y/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Verifying Authentication — YAAWP" },
      { name: "description", content: "Completing your secure authentication." },
    ],
  }),
  component: AuthCallback,
});
