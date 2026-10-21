# Fielded local role test guide

These are **local demo accounts only**, in the `Fielded Local` workspace. They are not production users. Keep the Mac and iPhone on the same Wi-Fi; the native app currently points to `192.168.1.175`.

Web sign-in: <http://192.168.1.175:3000/sign-in>  
Platform operations: <http://192.168.1.175:3000/ops>  
Shared local password for every account below: `Test1234!!`

| Account | System role | What to test |
|---|---|---|
| `owner@aifielded.com` | Owner | Company structure/access, people, missions, publishing and policy reports |
| `manager@aifielded.com` | Manager | Missions, findings and follow-up work; Operations team invitations |
| `hr@aifielded.com` | HR | People, policy communications and understanding reports |
| `employee@aifielded.com` | Participant | Assigned conversation, policy check, suggestion, concern and phone notifications |
| `consultant@aifielded.com` | Consultant | Mission/intelligence management without people or policy administration |
| `operator@aifielded.com` | Platform operator, **not** a workspace role | `/ops` beta account and workspace administration; no workspace membership |

## How the hierarchy actually works

There are five workspace roles: owner, manager, HR, participant, and consultant. The platform operator is a separate permission, not a sixth workspace role. This is not a single linear permission ladder. Manager, HR and consultant have overlapping management abilities but different specialties. Workspace roles, company-area grants, and reporting lines are separate controls.

- The owner has full company-area access by default.
- The manager heads **Operations**. The employee is in Operations and reports to that manager. The manager can manage missions and invite into their department, but has read-level (not edit-level) access to company profile, sources, structure and people; no company access-administration grant.
- HR heads **People**, can administer the People company area, and can manage policies. HR has no integration capability or access-administration grant.
- The participant works on their own assignments. They cannot manage missions, people, policies or integrations.
- The consultant can manage mission/intelligence work, but cannot administer people, policies or integrations. They have read-level profile/source grants and no structure, people or access grant.
- The operator belongs to no workspace. Use the web `/ops` route, not the mobile app, for that account.

Company-area grant levels are `0` = none, `1` = read, `2` = edit. These grants supplement role-based permissions; they do not replace them. In particular, a manager's mission capability is broader than the Operations reporting line. Do not treat the reporting line as a universal row-level data boundary.

## End-to-end check

1. Sign in as **owner** on the Mac. Open Company to see Operations, People and the employee's reporting line. Open Missions and the sample mission, **“Why are customer orders delayed?”** The employee is already assigned. The mission's **Policy understanding report** is where the owner's view of a completed policy check appears.
2. Sign in as **employee** on the iPhone. Under Today or Conversations, open the assigned mission. Inside it, tap **Policy and understanding check**, answer all three questions, choose a concern response, acknowledge, and submit. The result should say **Check saved**. The employee can also use More → Suggestions and More → Confidential concerns. A concern is confidential, **not anonymous**; only designated handlers should see it.
3. Refresh the owner's mission/policy report on the Mac. Then sign in as **manager** in a separate browser profile or after signing out. Check Missions, Company/Operations and the team invitation flow. The manager should not have company access-administration rights.
4. Sign in as **HR**. Check People and policy communication/report pages. HR should not have integration access. Sign in as **consultant** and check mission/intelligence pages; People and policy administration should not be available.
5. Sign in as **operator** at `/ops`. Check the beta account list and role labels. This account has no Fielded Local workspace membership and is not meant for the mobile workspace UI.
6. On the iPhone as employee, go to More → Notifications → **Enable test notifications** → allow iOS permission → **Send backend test alert**. This is the remaining real-device Firebase/APNs delivery check.

Use separate browser profiles/private windows to keep two web accounts signed in at once. To switch users on one phone: More → Settings → Sign out. The full management interface is currently on the web; native management screens are not feature-complete.

## What is and is not verified

The six passwords, memberships, platform permission, company grants, reporting line, mission/people/integration/policy/invitation capability checks were verified against the local backend. The existing owner/employee data and policy sample are described in [LOCAL_RUN.md](LOCAL_RUN.md). The role fixture can be checked again with `/opt/homebrew/bin/node scripts/provision-local-roles.mjs` from `beta/`; it only accepts this local Supabase instance and preserves existing conflicting grants/reporting data.

AI chat, extraction and drafting still need `GOOGLE_GENERATIVE_AI_API_KEY`. Real iPhone push delivery remains unverified until the on-device alert test succeeds; Firebase also needs the matching APNs key. Planned features such as billing and MFA are not part of this local working model.

These shared credentials are only for the isolated local database. Change them before any server deployment. The `/ops` form for creating *additional* test accounts still enforces its own `@fielded.test` email and 12-character password rules; that does not affect these six existing logins.
