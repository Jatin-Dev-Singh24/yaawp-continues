# YAAWP Roadmap

## Done
- Ported YAAWP code into project (src/yaawp, routes under /app, /auth)
- Fixed fake security: real session auth, hashed PIN/2FA secrets, persistent chat lockout, removed fake audit log entries, removed fake Google login, removed "end-to-end encrypted" claims, no on-screen reset codes
- Real TOTP 2FA (authenticator app) via Supabase MFA: TwoFactorPanel + TwoFactorGate
- Server-side chat lock SQL prepared (db/pending/20261001_server_chat_lock.sql)

## In progress
- Remove Lovable Cloud dependency; use user's own Supabase (per uploaded architecture doc)
  - Blocker: Lovable Cloud cannot be removed by the agent once enabled; workspace admin must disconnect (Cloud Tab → Advanced → Disconnect, irreversible)
  - Blocker: user's own Supabase URL + anon key not yet provided
- Media provider abstraction (Supabase storage now; external S3-compatible + Gumlet later, credentials from user)

## Open
- Apply RLS + chat-lock SQL to user's own Supabase once connected
- Continue security audit items from doc section 5
- Real password-reset emails (needs email sending on user's Supabase)
