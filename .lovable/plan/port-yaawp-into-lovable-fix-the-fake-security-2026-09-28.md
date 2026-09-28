# Port YAAWP into Lovable + fix the fake security

## What I found in the existing YAAWP project

- Vite + React SPA using `react-router-dom`.
- A very large `AppContext.tsx` containing most application state and business logic.
- Real Supabase integration exists.
- Authentication is incorrectly supplemented by a `yaawp_authenticated` localStorage flag.
- Several security features are currently only frontend simulations:
  - hardcoded/fake audit events and IP information
  - plaintext chat PIN/secret storage
  - plaintext 2FA secret/password storage
  - browser-generated reset/verification codes
  - login lockout that resets when the page refreshes
  - "end-to-end encrypted" claims without actual E2EE
  - fake/local account-security operations

The goal is to port the existing YAAWP UI and functionality into this Lovable project while replacing those fake security mechanisms with real Supabase-backed security.

---

# IMPORTANT CONSTRAINTS

### 1. Do NOT use `react-router-dom`

This Lovable project uses TanStack Router.

Port the application into the existing TanStack Router architecture.

Do NOT copy the old router, routing files, or `react-router-dom` dependency into this project.

Preserve the existing Lovable/TanStack Router shell and rebuild YAAWP routes around it.

---

### 2. Do NOT destroy existing YAAWP functionality

Port the existing:

- UI
- styles
- translations
- components
- feature logic
- feed
- posts
- reels
- explore
- communities
- profile
- notifications
- settings
- legal pages
- messaging UI

where compatible.

Do not remove a feature merely because its backend is not implemented yet.

If something is currently local/mock functionality, preserve its UI but do not falsely represent it as server-persisted or encrypted.

---

### 3. Supabase is the authentication/data security boundary

Remove:

```text
yaawp_authenticated

```

and any equivalent localStorage authentication flags.

The user's authentication state must come from the real Supabase Auth session.

Use the existing Supabase client and TanStack Router's protected-route architecture.

A route guard is only a navigation/UI guard. Actual data security MUST be enforced through Supabase RLS and trusted server/Edge Function operations.

Do not treat localStorage as proof of authentication.

---

# 1. PORT THE APPLICATION

Port the YAAWP source into the existing Lovable project without copying:

- `.git`
- duplicate `Yaawp-main` folders
- old router implementation
- `react-router-dom`
- obsolete configuration
- unnecessary prototype files

Install only dependencies actually required by the port.

Do not introduce unnecessary dependencies.

Preserve the existing Lovable/TanStack Router architecture.

---

# 2. TANSTACK ROUTER STRUCTURE

Use the existing TanStack Router structure.

Public routes should include:

```text
/
 /auth

```

Protected routes should include the existing YAAWP application routes, such as:

```text
/home
/feed
/chats
/reels
/explore
/communities
/notifications
/profile
/settings
/legal

```

Use the project's existing route naming conventions rather than blindly creating duplicate routes.

Logged-out users must not be able to access protected application pages.

Logged-in users should not be unnecessarily redirected away from public/legal pages.

---

# 3. SUPABASE CONFIGURATION

Use the configured Supabase project.

The browser client should use:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

```

Do NOT place a Supabase service-role/secret key in:

- frontend code
- `VITE_*` variables
- GitHub
- source files
- localStorage
- client-visible configuration

If privileged operations require a service-role key, use a Supabase Edge Function/server-side secret.

The Supabase URL and anon/publishable key are safe to use client-side.

---

# 4. IMPORTANT: INSPECT THE EXISTING DATABASE FIRST

Before creating or modifying ANY database table or RLS policy:

1. Inspect the existing Supabase schema.
2. Inspect existing migrations.
3. Inspect existing RLS policies.
4. Identify which YAAWP features already have real database support.
5. Preserve existing tables, columns, relationships, and working functionality.

Do NOT create replacement tables for existing functionality.

Do NOT duplicate existing tables under different names.

Do NOT assume that a table exists simply because the frontend contains a corresponding TypeScript type.

The existing schema currently includes functionality such as:

```text
profiles
posts
custom_circles
circle_members
saved_posts
hidden_profiles

```

Verify the actual current schema before relying on these names.

---

# 5. REAL AUTHENTICATION

Remove all authentication based on localStorage.

Do not use:

```text
localStorage.setItem('yaawp_authenticated', ...)

```

or any equivalent flag.

Use Supabase Auth.

The application should react to:

```text
supabase.auth.getSession()
supabase.auth.onAuthStateChange()

```

and the project's appropriate authenticated-user mechanism.

Do not create a second client-side authentication system.

---

# 6. REAL TOTP MFA

Implement REAL Supabase TOTP MFA.

Do NOT retain the old implementation that stores a 2FA password/secret in localStorage.

Use Supabase MFA enrollment/challenge/verification APIs.

Expected flow:

```text
Settings
 ↓
Enable 2FA
 ↓
Supabase MFA enrollment
 ↓
TOTP QR/secret
 ↓
Authenticator app
 ↓
User enters code
 ↓
Supabase verifies challenge
 ↓
MFA enabled

```

Use the user's Supabase Auth MFA state as the source of truth.

Do not invent a browser-side 2FA system.

Do not store TOTP secrets/passwords in localStorage.

Keep the existing YAAWP settings UI where possible.

---

# 7. PASSWORD RESET

Remove all fake/browser-generated reset codes.

Do NOT:

- generate a fake OTP in React
- display a verification code in a toast
- compare an entered code against local state
- store reset credentials in localStorage

Use Supabase's real password-reset flow:

```text
Forgot password
 ↓
supabase.auth.resetPasswordForEmail()
 ↓
email
 ↓
Supabase recovery session
 ↓
new password

```

Never display the reset/verification code to the user through the application.

---

# 8. PASSWORD CHANGE

The password-change UI must actually update the Supabase Auth password.

Use the appropriate Supabase Auth API.

Do not show:

```text
"Password updated securely"

```

unless the password update actually succeeded.

Handle errors explicitly.

---

# 9. CHAT PIN

If the existing YAAWP chat PIN is retained, treat it as a **chat-lock feature**, not encryption.

Do NOT store the PIN in plaintext in:

```text
localStorage
sessionStorage
React state as a persistent credential

```

For any server-side PIN verification:

- store only a strong salted hash
- never return the plaintext PIN to the client
- never log the PIN
- never expose the hash unnecessarily

Use a trusted Edge Function/server-side operation for verification where appropriate.

IMPORTANT:

A chat PIN does NOT constitute end-to-end encryption.

Do not describe it as encryption.

If the current chat PIN is only intended to lock the local chat UI, preserve that distinction clearly in the UI.

---

# 10. REMOVE FALSE E2EE CLAIMS

Search the ENTIRE project for claims such as:

```text
end-to-end encrypted
E2EE
encrypted messages
zero-knowledge
military-grade encryption
fully encrypted chats

```

Remove or rewrite claims that are not actually implemented.

Do NOT implement fake encryption merely to preserve the wording.

Use accurate wording such as:

```text
Private chats

```

where appropriate.

Do not claim E2EE unless actual client-side cryptographic encryption/decryption is implemented.

---

# 11. SECURITY AUDIT LOG

Do not keep hardcoded fake audit entries such as:

```text
192.168.1.104
Chrome 128
JWT session verified
Signed Storage URL Generated

```

unless those values/events are actually generated by the system.

If a security audit log is required, create a real server-backed audit mechanism.

Potential events:

```text
login
logout
failed_login
password_change
password_reset
mfa_enabled
mfa_disabled
chat_pin_changed
account_deactivated
account_deleted

```

Security-sensitive audit writes should happen through trusted server/Edge Function code rather than allowing the browser to fabricate arbitrary audit events.

Where available, record real server-observed metadata such as:

- timestamp
- authenticated user ID
- event type
- IP address
- user agent
- relevant metadata

Do NOT expose all users' audit logs to ordinary users.

A normal user must never be able to:

```text
SELECT * FROM security_audit_log

```

and see other users' security information.

If users need a security-history screen, they may only see their own records.

Administrative/security-wide access must be restricted to trusted server/admin mechanisms.

---

# 12. LOGIN RATE LIMITING / LOCKOUT

Remove browser-only login attempt counters.

Refreshing the page must NOT reset security throttling.

Do not trust a client-provided attempt count.

Implement server-side rate limiting/throttling.

Do not rely exclusively on IP-based blocking because users can share/change IPs.

Use appropriate account/request throttling and avoid creating a permanent lockout mechanism that can be abused to lock another user's account.

If a database table such as `login_attempts` is necessary, it must be protected so normal users cannot manipulate their own or another user's counters.

Prefer trusted server/Edge Function logic for security-sensitive updates.

---

# 13. ACCOUNT DELETION

If the application currently claims:

```text
Account permanently deleted

```

it must actually perform the operation.

Do not implement deletion with:

```text
localStorage.clear()
window.location.reload()

```

That only clears browser state.

Account deletion must be handled through an appropriate privileged Supabase/server operation.

It should:

1. Verify the authenticated user.
2. Remove/deactivate their owned application data according to the actual schema and retention requirements.
3. Remove owned storage objects where applicable.
4. Delete the Supabase Auth user through a privileged server-side mechanism.
5. Sign the user out.
6. Clear only appropriate client-side state.

Do not invent deletion of database tables/relationships that do not exist.

---

# 14. ACCOUNT DEACTIVATION

Do not store account-deactivated state only in localStorage.

If the feature is retained, make it server/database-backed.

The server must be able to recognize that the account is deactivated regardless of:

- browser
- device
- localStorage
- session

Respect the existing database model and RLS.

---

# 15. SUPABASE RLS

Review all existing RLS policies instead of blindly replacing them.

Ensure policies reflect the actual YAAWP privacy model.

For example:

```text
Public post
→ readable by appropriate authenticated users

Private content
→ owner/authorized users only

Community content
→ appropriate members only

Own profile/private data
→ owner only

Own post modifications
→ owner only

Own media
→ owner/authorized user only

```

Do NOT solve RLS problems by making everything public.

Do NOT allow:

```text
authenticated users
→ update/delete any user's data

```

Ensure UPDATE and DELETE policies verify ownership.

---

# 16. STORAGE SECURITY

Inspect the existing Supabase Storage buckets and policies before changing them.

Do not make private user content publicly accessible merely to simplify the frontend.

For private media, use appropriate private buckets and signed URLs.

If object paths use user IDs, scope storage policies to the authenticated user's permitted path.

For example, if the architecture uses:

```text
{user_id}/...

```

the policy should verify the path against:

```text
auth.uid()

```

Do not allow an authenticated user to update/delete arbitrary users' files.

Preserve genuinely public media where appropriate.

---

# 17. POSTS / AUTHORS

Fix post author mapping.

Never use:

```text
currentUser

```

as the author information for every database post.

The author must come from the actual post owner's `user_id`.

Use the appropriate profile lookup/join.

Example:

```text
posts.user_id
 ↓
profiles.id
 ↓
actual author

```

A post created by Alice must never render as Bob merely because Bob is logged in.

---

# 18. MEDIA PERSISTENCE

Fix image/video persistence so the stored URL corresponds to the actual media type.

Do not determine:

```text
media_type = video

```

from `videoUrl` while storing a different/empty URL from `mediaUrls[0]`.

Use one consistent media model.

Verify:

```text
image → correct image URL
video → correct video URL
multiple media → correct ordering

```

Do not break existing UI behavior while correcting persistence.

---

# 19. COMMENTS / MESSAGES / OTHER LOCAL FEATURES

Do NOT invent database tables simply because a frontend feature exists.

If the current Supabase schema has no real persistence for:

```text
comments
messages
conversations
reactions
notifications

```

do not silently create an entire unrelated data model during this security migration.

Instead:

- preserve the UI
- clearly separate local/mock functionality from persisted functionality
- document what remains local
- only create new tables when necessary and after inspecting the existing schema

If new tables genuinely need to be created, provide the SQL migration for review before applying it.

---

# 20. SOURCE OF TRUTH

Do not continue treating all of these as equal sources of truth:

```text
mockData
localStorage
React state
Supabase

```

For server-backed application data, Supabase should eventually be the source of truth.

Use localStorage only for appropriate client-side preferences such as:

```text
theme
UI preferences
temporary drafts
non-sensitive device preferences

```

Do NOT use localStorage as the source of truth for:

```text
authentication
passwords
TOTP secrets
account status
server permissions
security events
server-persisted messages
server-persisted comments

```

Do not attempt a massive state refactor unless necessary for the port. Preserve working functionality first and isolate future refactoring opportunities.

---

# 21. REMOVE PROTOTYPE SECURITY CODE

Search for and remove obsolete code related to:

```text
fake security
fake OTP
fake authentication
fake Google accounts
hardcoded developer accounts
fake IP addresses
fake audit events
fake biometric authentication
localStorage passwords
localStorage 2FA

```

Do not merely rename these mechanisms.

Replace them with real implementations or remove the unsupported feature.

---

# 22. REMOVE PERSONAL/DEVELOPER DATA

Search the entire project for hardcoded personal developer information, including:

- personal email addresses
- personal usernames
- personal profile data
- fake developer accounts

Do not use developer credentials as fallback application data.

Use the authenticated user's actual Supabase profile.

---

# 23. REMOVE OLD PROJECT RESIDUE CAREFULLY

Search for old project names such as:

```text
Lumina
Instagram app
Collabry

```

Remove obsolete user-facing references where they are clearly leftover prototype content.

Do not blindly rename legitimate third-party/library references.

Remove duplicate components only after verifying which copy is actually imported.

---

# 24. DO NOT HIDE ERRORS

Do not suppress errors merely to make the application appear clean.

In particular, do not globally suppress:

```text
WebSocket errors
Supabase errors
authentication errors
network errors

```

Fix the underlying problem where possible.

---

# 25. MIGRATION SAFETY

Before applying any database migration:

1. Inspect the existing schema.
2. Produce the complete SQL migration.
3. Explain every new table.
4. Explain every new RLS policy.
5. Explain every function/trigger.
6. Check for conflicts with existing tables/policies.
7. Only then apply the migration.

Do not drop existing tables.

Do not destroy existing data.

Do not replace working RLS policies without checking their current behavior.

---

# 26. VERIFICATION

After implementation:

### Build

Run the project's normal build and type checks.

Fix actual errors rather than suppressing them.

### Authentication

Verify:

- signup
- login
- logout
- session persistence
- protected routes
- logged-out redirect
- password reset
- password change

### MFA

Verify:

- enable TOTP
- verify TOTP
- disable TOTP
- invalid code handling
- MFA state persists after refresh

### Security

Verify:

- no auth flag in localStorage
- no plaintext passwords
- no plaintext PINs
- no browser-generated reset OTP
- no fake security audit entries
- no fake E2EE claims
- login throttling survives refresh
- users cannot access another user's protected data

### Data

Verify:

- post author is correct
- image URL persists correctly
- video URL persists correctly
- existing posts still load
- existing profiles still load
- existing communities still work

### Routing

Verify every TanStack Router route works.

Do not reintroduce `react-router-dom`.

---

# FINAL REQUIREMENT

Do not tell me the migration is complete merely because the UI renders.

At the end, provide a concise report containing:

1. Files changed.
2. Database tables changed/created.
3. RLS policies changed/created.
4. Security mechanisms removed.
5. Security mechanisms implemented.
6. Features that remain local/mock because the existing database does not support them.
7. Build/type-check result.
8. Any remaining known issues.

Do not hide unresolved errors.