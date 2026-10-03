# YAAWP — Required Credentials & Configuration

YAAWP is provider-independent. The app reads all service configuration from
environment variables; nothing is hard-coded. Supply these when ready.

## 1. Supabase (auth, database, RLS, realtime) — REQUIRED NOW

Public (safe to share, used by the browser app):

- `VITE_SUPABASE_URL` — your Supabase project URL (https://....supabase.co)
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

Optional:

- `VITE_SUPABASE_MEDIA_BUCKET` — storage bucket name for media (default: `media`)

Database setup to apply to your Supabase project (SQL is ready in this repo):

- `supabase/migrations/20260908000000_enable_rls.sql` — tables (profiles, posts,
  custom_circles, circle_members, saved_posts, hidden_profiles), access grants,
  row-level-security policies, and auto-profile-creation on signup.
- `db/pending/20261001_server_chat_lock.sql` — server-side chat PIN lock
  (bcrypt-hashed PINs, server-enforced 5-attempt / 60-second lockout).

Also enable in your Supabase project:

- Email/password sign-in (Authentication → Providers → Email)
- TOTP MFA (Authentication → Multi-Factor) — powers the real 2FA already built
- A `media` storage bucket (public) if you keep Supabase Storage for now

## 2. External object storage (S3-compatible) — LATER

Server-side only, never exposed to the browser:

- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

Plus `VITE_MEDIA_PROVIDER=s3` to switch the app over. Uploads will go through
a server-side pre-signed-URL endpoint so keys never reach the client.

## 3. Gumlet (video processing / CDN for Reels) — LATER

Server-side only:

- `GUMLET_API_KEY`
- `GUMLET_SOURCE_ID`
- `GUMLET_CDN_BASE_URL`

## Notes

- Do not paste secret keys in chat. Public values (Supabase URL, anon key) are
  fine in chat; secret keys go through the secure secrets form.
- Lovable Cloud was enabled on this project before your instruction arrived.
  Removing it entirely requires a workspace admin: Cloud Tab → Advanced →
  Disconnect (irreversible, deletes cloud data). The app code itself no longer
  depends on it — it uses only the env vars above.
