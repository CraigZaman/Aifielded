# Fielded backend deployment

The backend is a standalone Next.js service. Deploy the `beta/` directory as a container on Cloud Run or another Node 22 container host.

The Docker build requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as build arguments. Next.js embeds these public values in the browser bundle at build time; setting them only on the running container leaves browser sign-in unconfigured. Pass the same values again as runtime environment variables, along with the secrets below. Set `NEXT_PUBLIC_APP_URL` at build and runtime to the public backend URL.

Build from `beta/` with public values for the target environment:

```sh
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY \
  --build-arg NEXT_PUBLIC_APP_URL=https://YOUR_BACKEND_DOMAIN \
  -t fielded-backend .
```

Supply the backend-only values as runtime secrets. The Firebase private key and `SUPABASE_SECRET_KEY` must never be placed in build arguments or the mobile app. The hosting service must expose container port `8080` over HTTPS.

Required secrets:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `PLATFORM_ADMIN_BOOTSTRAP_SECRET` (one-time setup only)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY_B64`

For the AI interviewer, extraction and drafting, also set
`GOOGLE_GENERATIVE_AI_API_KEY`. For outbound work/invitation email, set
`RESEND_API_KEY` and `RESEND_FROM_EMAIL`. Scheduled analysis needs a strong
`CRON_SECRET`; source connections need `INTEGRATION_ENCRYPTION_KEY` plus the
matching Google or Slack OAuth client ID and secret. The Firebase service
account does not supply any of these credentials.

Do not set `LOCAL_SMTP_PORT` in a deployed environment. That variable routes
messages to a local Mailpit SMTP listener for development only; deployed email
uses the configured Resend credentials.

Before the first deployment, apply Supabase migrations through `040_mobile_push_token_ownership.sql`, then deploy the container. Check `GET /api/health`: it returns `{"status":"ready"}` when core environment values and the push-device table are available. It does not prove that APNs can deliver to an iPhone. Visit `/ops/bootstrap` once, create the first administrator, sign in, and remove `PLATFORM_ADMIN_BOOTSTRAP_SECRET` from the deployed environment. The bootstrap route rejects further setup once `platform_admins` contains an account.

The mobile app should use the deployed URL as `EXPO_PUBLIC_API_ORIGIN` and retain the matching Supabase project settings.
Rebuild and redistribute the iOS/Android app after setting `EXPO_PUBLIC_API_ORIGIN`, `EXPO_PUBLIC_SUPABASE_URL`, and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; these values are embedded in the mobile JavaScript bundle. The signed local iPhone 12 build in `../mobile/.local-build/Fielded.app` points to the isolated Mac-hosted stack, not a deployed service, and must not be distributed as a production build.

For a device smoke test, sign in, open Notifications, tap Enable test notifications, then tap Send backend test alert. This sends through the deployed backend and Firebase to that phone's registered token.

For the current local setup, `GET /api/health` returns `200 ready` with the native Supabase stack running. Firebase service-account values alone do not provide the authentication or database used by the app. See `../LOCAL_RUN.md` for local restart and test instructions.
