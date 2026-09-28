# Port Yaawp into Lovable + fix the fake security

## What I found in the zip

- A Vite + React SPA using `react-router-dom`, with a 6,180-line `AppContext.tsx` holding most of the app logic in `localStorage`.
- Real Supabase wiring exists (`src/lib/supabase.ts`, one RLS migration), but auth state is decided by a `yaawp_authenticated` localStorage flag.
- The fake-security issues from the review are all present: hardcoded audit log with a fake IP, chat PIN and 2FA secret in plain browser storage, reset code shown on screen, lockout that resets on refresh, and "end-to-end encrypted" wording with no encryption.

## Constraint

This Lovable project runs on TanStack Router — `react-router-dom` cannot be used here. So the app must be **ported**, not copied verbatim. The UI components, styles, translations, and business logic carry over; the routing shell and auth guard get rebuilt.

## Steps

1. **Bring the code in**
   - Copy `src/` (components, context, hooks, pages, translations, utils, data), `public/`, and the Supabase migration into this project (excluding the duplicate `Yaawp-main/` folder and any git metadata).
   - Install missing dependencies (`@supabase/supabase-js`, `@hcaptcha/react-hcaptcha`, `canvas-confetti`, `recharts`, `motion`, etc.).

2. **Rebuild the shell on TanStack Router**
   - Public routes: landing/preview, `/auth` (login + signup via `AuthCard`).
   - Protected routes under `_authenticated/`: home, chats, reels, explore, communities, notifications, profile, settings, legal — gated by a real Supabase session check, replacing the `yaawp_authenticated` flag.

3. **Wire your Supabase project**
   - Browser client reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`; server-side uses the secrets you just saved.
   - Apply the RLS migration to your project.

4. **Fix the fake security (the actual ask)**
   - **Auth flag**: delete `yaawp_authenticated`; being logged in = valid Supabase session, checked on the server.
   - **Audit log**: replace the three hardcoded entries with a real `security_audit_log` table — login, logout, failed attempts, PIN changes written server-side with real IP/timestamp.
   - **Chat PIN**: store only a hashed PIN (never plain text), verified server-side.
   - **2FA**: replace the plain-text stored password with Supabase's real TOTP 2FA (or remove the toggle if you don't want real 2FA yet — your call).
   - **Password reset**: use Supabase's real email reset flow; the code is never shown on screen.
   - **Login lockout**: move the attempt counter server-side so refreshing the page doesn't reset it.
   - **Encryption claims**: remove "end-to-end encrypted" wording everywhere unless we actually build encryption (not in scope here).

5. **Verify**
   - Build passes, login/signup work against your Supabase, protected pages bounce logged-out users, lockout survives refresh, audit log records real events.

## What I need from you

- The Supabase **URL and anon key** also as plain values (they're public by design, safe to paste) OR connect your Supabase via **Project Settings → Connectors → Supabase** — the secrets form stores them server-side only, and the browser needs the public pair.
- Permission to apply the database migration to your Supabase project.
- Decision on 2FA: real TOTP via Supabase, or remove the toggle for now?

## Technical details

- Stack: TanStack Start (React 19), Tailwind v4, Supabase JS v2.
- New tables: `security_audit_log`, `login_attempts`, `chat_passcodes` (hashed), all with RLS + grants.
- Auth guard: integration-managed `_authenticated` layout, `ssr: false`, `supabase.auth.getUser()` gate.
