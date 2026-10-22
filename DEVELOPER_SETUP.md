# AiFielded — developer onboarding

This repo is a **multi-app workspace** (not one install at the root). Your teammate should clone once, then install dependencies **per app**.

## Prerequisites

- **Node.js 22.13+** (22.18+ recommended for `review-tests`)
- **pnpm 11.19.0** for `beta/` and `website/`
- **npm** for `mobile/`
- **Xcode + CocoaPods** (iOS), **Android Studio / SDK** (Android)
- Access to **Supabase**, **Firebase**, and (optional) **Google AI** credentials — share these **outside Git** (1Password, etc.). Never commit `.env` or service-role keys.

## Clone

```sh
git clone https://github.com/CraigZaman/Aifielded.git
cd Aifielded
```

## 1. Beta (main SaaS app)

```sh
cd beta
pnpm install --frozen-lockfile
cp .env.example .env.local
# Fill .env.local from your isolated Supabase project (see README.md)
pnpm dev --port 3000
```

Database: apply `beta/supabase/migrations/*.sql` in order on a **new** Supabase project (see root `README.md`). Do not run migrations against production.

## 2. Mobile (React Native / Expo prebuild)

```sh
cd mobile
npm ci
cp .env.example .env.local
# EXPO_PUBLIC_* must match the beta/Supabase project you use
cd ios && pod install && cd ..
npx expo run:ios --device
# or: npx expo run:android
```

**Firebase (push):** add `google-services.json` and `GoogleService-Info.plist` under `mobile/` (gitignored). Create them in Firebase for package/bundle `ai.fielded.mobile`. See `mobile/README.md`.

**Native folders:** `mobile/ios` and `mobile/android` are in the repo so teammates do not need `expo prebuild --clean` on day one. Re-run `npx expo prebuild --no-clean --no-install` only when `app.json` plugins change.

## 3. Marketing site

```sh
cd website
pnpm install --frozen-lockfile
pnpm dev --port 3010
```

## 4. Demo & tests

```sh
cd demo && node --test tests/gate.test.mjs
cd ../review-tests && pnpm install --frozen-lockfile
```

## What is intentionally **not** on GitHub

| Item | Why | What devs do |
|------|-----|----------------|
| `node_modules/` (mobile) | Huge; reproducible from lockfile | `npm ci` in `mobile/` |
| `.env`, `.env.local` | Secrets | Copy from `.env.example`; get values from team lead |
| `google-services.json`, `GoogleService-Info.plist` | Firebase secrets | Download from Firebase Console |
| `.supabase-local/`, `.next/`, build outputs | Machine-specific | Regenerate locally |

The `beta/` tree may include `node_modules` from an earlier export; prefer `pnpm install --frozen-lockfile` over relying on committed deps long term.

## Docs to read first

- Root `README.md` — architecture and review scope  
- `LOCAL_RUN.md` — full local stack on a Mac (Supabase + proxy + Mailpit)  
- `ROLE_TEST_GUIDE.md` — test accounts and flows  
- `mobile/README.md` — native build and notifications  

## Repo hygiene

If `.gitignore` files were cleared for a one-off “push everything” run, restore from `*.bak-before-full-push` next to each `.gitignore`, then commit the restored ignores so the repo stays clone-friendly.
