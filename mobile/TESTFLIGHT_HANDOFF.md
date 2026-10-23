# Mobile build handoff (self-hosted backend)

Branch: `mobile/testflight-ready`, cut from `main` at `0e93fe48` on 23 October 2026.

This is the mobile code that was built and tested against the self-hosted backend. A build made from the repo alone will not connect to that backend: the app's server settings live in files that git ignores, so you have to create them yourself before building.

## 1. Create `mobile/.env.local`

Expo bakes these values into the app at build time, so set them before you build. Get the publishable key from the team lead; it is a public key, but keep it out of git.

```sh
EXPO_PUBLIC_SUPABASE_URL=https://fielded-auth.basecta.com
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<from the team lead>
EXPO_PUBLIC_API_ORIGIN=https://fielded.basecta.com
```

If any of the three is missing, the app opens its offline preview and cannot sign in.

## 2. Copy the Firebase files into `mobile/`

`app.json` expects them in `mobile/`; the checkout has them under the native folders.

```sh
cd mobile
cp ios/Fielded/GoogleService-Info.plist ./GoogleService-Info.plist
cp android/app/google-services.json ./google-services.json
```

Both copies are gitignored; don't commit them.

## 3. Build

```sh
cd mobile
npm ci
npx tsc --noEmit
cd ios && pod install && cd ..
npx expo run:ios --device
```

Never run `npx expo prebuild --clean`; `ios/` and `android/` hold the signing setup, and `ios/Podfile` must keep `$RNFirebaseAsStaticFramework = true`.

Android: `npx expo run:android`, or `cd android && ./gradlew :app:assembleRelease` for a standalone APK (signed with the debug key, so testing only).

## 4. Before uploading to TestFlight

- **Push notifications:** `app.json` sets `aps-environment` to `development`. TestFlight and App Store builds deliver through production APNs, so check the archived app carries the `production` entitlement and a distribution provisioning profile with Push Notifications enabled.
- **Local-network access:** `app.json` still allows plain-HTTP local-network access (`NSAllowsLocalNetworking`, `NSLocalNetworkUsageDescription`) for the old Wi-Fi development backend. The new backend is HTTPS, so remove both before a release, then run `npx expo prebuild --no-clean --no-install` and `pod install`.

## What was checked on this branch

- `npx tsc --noEmit` passes.
- Android release build from this branch: the bundle contains both backend addresses and no old local addresses.
- On an Android emulator, signed in as `employee@fielded.test` (Eli): Today and Discuss load his live missions from the server, a mission opens with its brief and private dialogue, and the logs show no JavaScript errors.
- Backend: `https://fielded.basecta.com/api/health` returns `{"status":"ready"}`, Supabase Auth and the data API answer on `https://fielded-auth.basecta.com`, and every API route the app calls returns a JSON `401` to an invalid token, as the app expects.
- Push (22 October, same mobile code): a mission alert from the server reached the emulator, and opening it went to the right conversation.
- Not tested on this branch: sending a chat message, suggestions, concerns, settings, sign-up, and sign-out/sign-in.

iOS was not built on this branch: that needs a Mac with Xcode.
