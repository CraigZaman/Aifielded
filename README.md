# Fielded: Technical Review Handover

Prepared 7 September 2026. Confidential company source; provided for authorised technical analysis. No new open-source licence is granted by this export. Existing third-party notices remain applicable.

## Start Here

This package contains three separate deployable projects, not a single monorepo application:

| Folder | Purpose | Current public address |
| --- | --- | --- |
| `website/` | Marketing website, pricing, use-case grid, animated product story | https://fielded.ai |
| `beta/` | Authenticated, multi-workspace SaaS product | https://app.fielded.ai |
| `demo/` | Invitation-gated, fictional demonstration | https://demo.fielded.ai |
| `review-tests/` | Supplemental isolated database and browser checks | Local only |

Start your review in `beta/src/lib/auth.ts`, `beta/src/lib/publishing.ts`, `beta/src/lib/ai.ts`, and `beta/supabase/migrations/`. The database functions and row-level security are part of the application, not optional setup.

The export includes current local release source, assets, dependency lockfiles, deployment configuration and migrations 001-038. Earlier migrations 001-036 were recovered from the original workspace because the latest beta release archive contains only 037-038. These are source migrations, NOT a dump or independent attestation of the live database schema. Compare them with a separately authorised, schema-only export before making production changes.

## Release Identity

- Website: `dpl_9mnmk3e3EAUNQFpfPyJ4rmpeE3NY` (use-case grid release).
- Beta: `dpl_4QA2vPH7sYHCS6JffYLMqGv2VFSh` (email activation release).
- Protected demo: `dpl_6baYvzaKD2ZKvMiFHXgM6yDR5Zkg` (commercial-access release).
- This is a review snapshot, not a new deployment. Existing rollback archives remain with the company, outside this package.

## Architecture and Data Flow

### Beta

Next.js App Router, React, TypeScript, Supabase Auth/Postgres/Storage, Vercel AI SDK with Google, and Resend. Source is in `beta/src`; SQL security policies and transactional functions are in `beta/supabase/migrations`.

1. Signup and confirmation: guided signup -> Supabase email verification -> company onboarding or invitation acceptance -> workspace membership. Read `(auth)/actions.ts`, `auth/confirm`, `auth/callback`, `onboarding`, `join/[token]` and `lib/signup-intent.ts`.
2. Company context: company profile, approved documents, sources, departments and reporting structure provide background. See `app/app/company`, `lib/company.ts`, `lib/workspace-directory.ts` and `lib/company-source-refresh.ts`.
3. Discovery missions: author chooses objective and audience -> permission/approval checks -> assignments -> employee discussion -> summary and extraction -> explicit contribution approval -> mission analysis and linked evidence -> findings, investigation proposals and follow-up tasks. See `api/conversations`, `api/missions`, `lib/mission-analysis.ts`, `app/app/investigations` and `lib/work-notifications.ts`.
4. Communications: source policy -> reviewed draft and understanding questions -> targeted assignments -> dialogue and separate understanding check -> results for authorised managers. See `api/communications`, `lib/policy-schema.ts` and `components/policy-check.tsx`.
5. Continuous dialogue and bottom-up suggestions: `api/ai/chat`, `app/app/conversations`, `app/app/suggestions` and associated SQL tables. Confidential concerns have separate routes and access controls; they are not ordinary management evidence.
6. Commercial access: trial/seat/AI allowances and tester/demo-code controls are in `lib/entitlements.ts`, `lib/plans.ts`, `app/billing`, `app/ops/commercial` and migrations 037-038. No Stripe checkout or recurring subscription collection is connected.

Authentication, workspace role, publishing scope, company administration and platform administration are distinct concerns. Do not infer data access merely from a visible navigation item. Check server actions, API routes and SQL policies together.

### AI

The source pins `gemini-3.6-flash` in `beta/src/lib/ai.ts`; this describes the code, not a guarantee of future provider availability. There is no automatic alternate-model fallback. `ai-budget.ts`, `ai-workspace.ts` and SQL reservation functions implement spending allowances. Validate model availability, actual usage and worst-case costs in an isolated project before enabling it for a review environment.

The conversation extraction path separates PRIVATE, CONTRIBUTE and SHARE inputs. Review every downstream summary, evidence reference, notification and synthesis for preservation of those boundaries. Prompt instructions are not a substitute for access controls.

### Website and Demo

The website uses React, vinext/Vite, Tailwind and Three.js, with static Vercel output from `dist/client`. Its familiar `app/` structure does not mean it uses the beta's Next.js runtime.

The demo is plain JavaScript/CSS with fictional data, served through `demo/api/entry.js`. Its AI endpoint returns scripted examples, not production AI processing. The gate calls the beta's demo-access endpoint. It deliberately checks `demo.fielded.ai` and rejects other hosts. Use mocked unit tests first; local browsing requires an explicitly isolated host/API adaptation, not disabling protection on production.

## Local Setup

Use Node.js 22.13 or newer; Node 22.18+ supports the included TypeScript test imports without a separate runner. Use pnpm 11.19.0 for the beta and a compatible pnpm for the website. Each application installs independently. No dependencies or build output are bundled.

Website, from `website/`:

```sh
pnpm install --frozen-lockfile
pnpm dev --port 3010
pnpm lint
pnpm build
```

Beta, from `beta/`:

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
# Populate with credentials from a NEW isolated review project.
pnpm dev --port 3000
pnpm lint
pnpm build
node --test tests/signup-intent.test.mjs
```

The blank environment template lists source-referenced settings. Public Supabase variables are browser-visible by design; service credentials, AI keys and encryption secrets must remain server-side. Never reuse production credentials just to inspect this package.

Create an isolated Supabase project and review/apply migrations in numeric order once. They rely on Supabase-managed auth/storage schemas, and several are not idempotent. Do not run combined historical installer SQL or replay these against production. Fresh-project bootstrap has not been revalidated as part of this export. Configure auth site/redirect URLs, email confirmation, SMTP, private storage and any initial platform-admin identity separately and deliberately. Do not bootstrap an admin by trusting an arbitrary submitted email address.

Supabase SMTP configuration is separate from the beta's Resend API settings. The supplied confirmation template is at `beta/supabase/templates/confirmation.html`. Add your isolated app's `/auth/callback` and confirmation flow to the appropriate auth configuration. Google/Slack integrations require separately registered OAuth applications and appropriate callback URLs. Existing connection code is not proof that a customer/provider integration is approved or enabled.

Demo checks, from `demo/`:

```sh
node --test tests/gate.test.mjs
```

Additional checks, from `review-tests/`:

```sh
pnpm install --frozen-lockfile
node commercial.test.mjs
```

The commercial test creates a simplified isolated PGlite schema; it tests commercial guards, not the whole migration chain. The optional browser script `use-case-grid.mjs` requires Playwright and Chrome, a running local website, and `QA_URL` if using a port other than 3010. It reads public pages only. It writes screenshots and a report under `review-tests/browser-output/`.

`review-tests/historical-beta-tests/` preserves the earlier release's security, workflow and rendering test source for reference. These tests predate later interface changes, may require additional test-only dependencies or command-line arguments, and some retain old temporary output paths. They were not rerun or declared compatible with the current release in this handover. Their fixture passwords are fictional test strings, not account credentials.

## Review Priorities and Known Gaps

- Independently exercise cross-workspace isolation, all roles, invitation acceptance, department scopes, approval chains, privilege changes and platform-admin actions. Tests included here are not a comprehensive penetration test.
- Verify complete discussion -> save -> approval -> extraction -> analysis -> follow-up flows, including retries, partial failures, duplicate requests and revoked memberships.
- Investigations must follow evidence dynamically, not assume a predetermined departmental route or treat an unconfirmed hypothesis as fact.
- Inspect confidentiality, reporting channels, attachment access, personal documents, retention/deletion and audit logging. Do not promise absolute anonymity without validating the technical and operational threat model.
- Review SSRF protections for external company sources, upload validation/quotas, public endpoint rate limits, spending reservations, provider timeouts and prompt-injection boundaries.
- Stripe, paid renewal and subscription webhooks are not implemented. Trials and tester grants are not a working payment system.
- Email confirmation was reported working end to end by the owner in the prior release. This export does not retest delivery, DNS or production invitation/task notifications. Sender quotas and reputation need monitoring.
- `beta/vercel.json` defines a daily analysis cron. Review scheduling, concurrency, queue processing and service expectations; do not assume continuous real-time processing from product wording.
- Website dependencies include beta-stage tooling. Validate supported runtimes, dependency licences, security advisories and reproducible builds independently.
- Production auth settings, SMTP, OAuth approvals, secrets, hosting ownership and DNS are external state, not reproducible from source alone.
- A historical former-employee-owned demo address was still unresolved in the last release notes. This export does not remove that address or establish ownership/control over it.
- Existing automated checks and prior manual reports are evidence with limited scope, not a certification that every product flow is market-ready.

## Export Safety and Provenance

Excluded: `.env` files and values, provider credentials, Vercel linkage, Git history, hosting metadata, dependency/build/cache folders, browser sessions, database dumps, customer uploads, operational account-setup SQL and historical raw debug logs. No production user export was requested or made.

Included fictional demo records and test fixtures are intentional. Public company links and emails in application code remain. The export is confidential source, not a fully anonymised public repository.

Original application code is copied without feature changes. Supplemental test scripts have only machine-specific paths made portable. The environment template and this guide are new handover material. `MANIFEST.json` contains per-file hashes, source origins and the export inventory. `EXPORT-CHECKS.json` records structural checks and a best-effort credential-pattern scan. That scan is not a guarantee that a specialist security review will find no issue.

Share this ZIP privately with the intended reviewer. They do not need your company passwords to analyse it. Any later infrastructure access should use their own invited account with least-privilege permissions.
