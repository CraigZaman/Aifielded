# Fielded local run (20 October 2026)

For all six local test accounts, their role hierarchy, and a tap-by-tap test flow, see [ROLE_TEST_GUIDE.md](ROLE_TEST_GUIDE.md).

This workspace has a native local Supabase project. Its database, Auth, REST,
Storage and Mailpit services are separate from the live Fielded service. All
40 migrations have been applied. The local database is in `.supabase-local/`;
do not delete it if you want to keep the test workspace.

Current Mac LAN address: `192.168.1.175`. The local Supabase API port is
`26313`, the backend port is `3000`, and Mailpit is at
`http://127.0.0.1:26171`. These values may change after starting a new stack
or joining another Wi-Fi network. The ignored `beta/.env.local` and
`mobile/.env.local` currently point to these addresses. Never copy the
backend's Supabase secret or Firebase private key into the mobile file.

To restart after a reboot, use Node 22 and run these in separate terminals:

```sh
cd /Users/ios2/Downloads/fielded-technical-review-2026-09-07/beta
SUPABASE_HOME=/Users/ios2/Downloads/fielded-technical-review-2026-09-07/.supabase-local SUPABASE_EXPERIMENTAL_STACK=1 /private/tmp/fielded-tools/node_modules/.bin/supabase start
```

```sh
cd /Users/ios2/Downloads/fielded-technical-review-2026-09-07
node scripts/local-supabase-proxy.mjs 192.168.1.175 26313
```

```sh
cd /Users/ios2/Downloads/fielded-technical-review-2026-09-07/beta
npm run dev -- --hostname 0.0.0.0
```

The CLI was installed into `/private/tmp/fielded-tools`. If macOS clears
temporary files, reinstall it with Node 22:
`npm install --prefix /private/tmp/fielded-tools --no-save --no-package-lock supabase@2.121.0`.
Check `supabase status` for changed ports and keys before rebuilding mobile.
The proxy binds only to the specified Mac LAN address; do not expose it to the
internet. Stop it when local phone testing is over.

The local owner account is `owner@aifielded.com` in workspace
`Fielded Local`. It has one assigned discovery mission and a completed sample
policy check. A second account, `employee@aifielded.com`, joined by the
real invitation flow and has an assigned mission and sample suggestion. A
harmless sample confidential report is visible only to its author and named
handler. The employee also has an unanswered `Data handling policy — practice`
check for an on-device test; the owner sample check is already completed. The
owner can publish more content through the web UI. Mail from
the backend is captured locally by Mailpit when `LOCAL_SMTP_PORT` is set;
no messages leave this Mac. Production email still requires Resend credentials.
An owner can drain queued local work alerts with an authenticated POST to
`/api/local/notifications/dispatch`; that endpoint is unavailable when local
SMTP is not configured. The sample assignment alerts have already been
delivered and are visible in Mailpit.

Health check: `http://192.168.1.175:3000/api/health` should return
`{"status":"ready"}`. The native iPhone build embeds the current LAN URLs;
rebuild it if the Mac's address or Supabase port changes. Firebase push still
requires the iOS app's APNs key uploaded to the matching Firebase project and
an on-device permission/token test. AI conversations, extraction, and drafting
require `GOOGLE_GENERATIVE_AI_API_KEY`, which is not present locally.

## Verified locally

- Native Supabase Auth and 40 migrations; owner and employee onboarding through
  invitation; separate-workspace RLS isolation.
- Mission launch/assignment, employee suggestion, designated-handler concern,
  and text attachment storage.
- Published policy, hidden answer key for the employee, 3/3 server-scored
  check with a saved result, and an unanswered employee practice check.
- Mobile bearer-token API, push-token registration/unregistration, and FCM
  authentication/error handling with a deliberately invalid test token.
- Queued work email through the actual notification worker into Mailpit.
- Backend development and standalone-production health checks, signed iPhone
  12 Release install, and native JavaScript startup.

The iPhone has not yet supplied a real FCM token or approved notification
permission in an automated test, so actual APNs delivery remains unverified.
The phone's sign-in and policy UI still need a human tap-through. Local Auth
currently confirms test users immediately, so the emailed confirmation-code
screen has not been exercised. The uploaded
Firebase service account cannot replace a Gemini AI key, and this snapshot
does not include production Supabase/Resend credentials. Planned document
features (for example recurring attestations, Stripe billing, MFA and full
native management screens) are not made real by the local setup.
