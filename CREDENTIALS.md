# YAAWP — Credentials & Configuration

Architecture: Supabase (auth, database, RLS, realtime) · ImageKit (all images) · Gumlet (all videos).
No S3, no Supabase Storage for media, no Lovable Cloud at runtime. Nothing is hard-coded.

## Public (browser-safe, `VITE_` prefix)

| Name | Where to find it |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public key |
| `VITE_IMAGEKIT_PUBLIC_KEY` | ImageKit → Developer options → Public key |
| `VITE_IMAGEKIT_URL_ENDPOINT` | ImageKit → Developer options → URL endpoint (https://ik.imagekit.io/your_id) |

## Server-only secrets (secure secrets form, never in chat or code)

| Name | Purpose |
| --- | --- |
| `YAAWP_SUPABASE_URL` | Same Project URL, used by the server to verify sessions |
| `YAAWP_SUPABASE_ANON_KEY` | Same anon key, used server-side for session/ownership checks |
| `IMAGEKIT_PRIVATE_KEY` | Signs ImageKit uploads + deletes. Never sent to the browser |
| `GUMLET_API_KEY` | Creates/deletes Gumlet video assets |
| `GUMLET_SOURCE_ID` | Gumlet → Video → your Video Source (collection) ID |

Gumlet playback/thumbnail URLs come back from the Gumlet API per asset, so no separate CDN URL is needed.
The Supabase service-role key is NOT needed.

## Database (apply to your Supabase, in order, after review)

1. `db/pending/20261003_yaawp_core_rls.sql` — tables, grants, corrected social RLS, media_assets.
2. `db/pending/20261001_server_chat_lock.sql` — server-side chat PIN lock.

`db/superseded/20260908000000_enable_rls.sql` is the old version — do not apply.

## Supabase settings
- Email/password sign-in on; TOTP MFA on.

## Recommended provider settings
- ImageKit: restrict uploads to images, max 10 MB (Settings → Upload restrictions).
- Gumlet: keep the source private to your API key.
