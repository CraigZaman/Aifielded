module.exports = [
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/.next-internal/server/app/(auth)/sign-in/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/(auth)/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00420b8028643ae847da8ea6a502707fc17cecef7f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["signOut"],
    "403b384e6f5b7c905a1baaf3bae3b798f0b209fa55",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["completeOnboarding"],
    "404dd5a5c417649a4a80e0c69886d9fc8a88ae9562",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["startInvitationSignUp"],
    "405fe4d4371b3b44875f7d912d3e112effc2e718dc",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["switchInvitationAccount"],
    "40948f28d66bc5d5d052a77cc726c2dcecd6b14eb7",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["continueWithInvitation"],
    "40978437cbf35c8ac50199fb4e90cba2af37fb8ec3",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["signIn"],
    "603fbefca70fd1ba1d9b0fc677fe9f6c7ef45630e9",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["signUpGuided"],
    "60c87fc8bc21a77aee42d750d92bb1593148b99f70",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resendConfirmation"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$auth$292f$sign$2d$in$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/(auth)/sign-in/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/(auth)/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(auth)/actions.ts [app-rsc] (ecmascript)");
}),
"[project]/.next-internal/server/app/(auth)/sign-in/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/(auth)/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(auth)/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
}),
"[project]/src/app/(auth)/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00420b8028643ae847da8ea6a502707fc17cecef7f":{"name":"signOut"},"403b384e6f5b7c905a1baaf3bae3b798f0b209fa55":{"name":"completeOnboarding"},"404dd5a5c417649a4a80e0c69886d9fc8a88ae9562":{"name":"startInvitationSignUp"},"405fe4d4371b3b44875f7d912d3e112effc2e718dc":{"name":"switchInvitationAccount"},"40948f28d66bc5d5d052a77cc726c2dcecd6b14eb7":{"name":"continueWithInvitation"},"40978437cbf35c8ac50199fb4e90cba2af37fb8ec3":{"name":"signIn"},"603fbefca70fd1ba1d9b0fc677fe9f6c7ef45630e9":{"name":"signUpGuided"},"60c87fc8bc21a77aee42d750d92bb1593148b99f70":{"name":"resendConfirmation"}},"src/app/(auth)/actions.ts",""] */ __turbopack_context__.s([
    "completeOnboarding",
    ()=>completeOnboarding,
    "continueWithInvitation",
    ()=>continueWithInvitation,
    "resendConfirmation",
    ()=>resendConfirmation,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut,
    "signUpGuided",
    ()=>signUpGuided,
    "startInvitationSignUp",
    ()=>startInvitationSignUp,
    "switchInvitationAccount",
    ()=>switchInvitationAccount
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$profile$2d$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/profile-options.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$safe$2d$redirect$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/safe-redirect.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$signup$2d$intent$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/signup-intent.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
const credentials = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email(),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8)
});
const workProfileSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    fullName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2).max(80),
    businessRole: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$profile$2d$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BUSINESS_ROLE_VALUES"]),
    department: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$profile$2d$options$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DEPARTMENT_VALUES"])
});
const managerSignupSchema = credentials.merge(workProfileSchema).extend({
    workspaceName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2).max(100),
    businessDescription: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(4000).default(""),
    website: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].url({
            protocol: /^https?$/
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("")
    ]).default("")
});
const employeeSignupSchema = workProfileSchema.extend({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email().optional().or(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("")),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8),
    invitation: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
function fail(path, message) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`${path}${path.includes("?") ? "&" : "?"}message=${encodeURIComponent(message)}`);
}
async function applyInitialTrialPlan(supabase, userId, plan) {
    const { data: membership, error } = await supabase.from("organisation_memberships").select("organisation_id").eq("user_id", userId).eq("role", "owner").eq("status", "active").maybeSingle();
    if (error || !membership) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/billing?message=Please+check+your+workspace+plan.");
    const result = await supabase.rpc("choose_trial_plan", {
        workspace: membership.organisation_id,
        chosen_plan: plan
    });
    if (result.error) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/billing?message=Your+workspace+is+ready.+Please+choose+your+trial+plan.");
    const { data: auth } = await supabase.auth.getUser();
    const pending = auth.user?.user_metadata?.signup_access;
    if (pending && auth.user?.email_confirmed_at && auth.user.email) {
        const digest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$signup$2d$intent$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openSignupCode"])(pending, auth.user.email, process.env.SUPABASE_SECRET_KEY || "");
        if (!digest) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/billing?message=Your+workspace+is+ready.+Please+enter+your+access+code+again.");
        const redeemed = await supabase.rpc("redeem_tester_code", {
            workspace: membership.organisation_id,
            code_digest: digest
        });
        if (redeemed.error) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/billing?message=Your+workspace+trial+is+ready,+but+the+access+code+could+not+be+applied.+Check+it+below.");
        await supabase.auth.updateUser({
            data: {
                signup_access: null
            }
        });
    }
}
function invitationToken(value) {
    const candidate = value.trim();
    if (!candidate) return null;
    try {
        const url = new URL(candidate, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appUrl"])());
        const match = url.pathname.match(/^\/join\/([^/]+)\/?$/);
        if (match) return decodeURIComponent(match[1]);
    } catch  {
        return null;
    }
    return /^[A-Za-z0-9_-]{20,256}$/.test(candidate) ? candidate : null;
}
async function signIn(formData) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hasSupabaseEnv"])()) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/setup");
    const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$safe$2d$redirect$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["safeRedirect"])(String(formData.get("next") || "/app"));
    const returnPath = `/sign-in?next=${encodeURIComponent(next)}`;
    const parsed = credentials.safeParse({
        email: formData.get("email"),
        password: formData.get("password")
    });
    if (!parsed.success) fail(returnPath, "Enter a valid email and a password of at least 8 characters.");
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) fail(returnPath, error.message);
    if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut({
            scope: "local"
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/check-email");
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(next);
}
async function signUpGuided(_state, formData) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hasSupabaseEnv"])()) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/setup");
    const path = formData.get("path") === "employee" ? "employee" : "manager";
    const trialPlan = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "startup",
        "sme",
        "enterprise"
    ]).catch("sme").parse(formData.get("trialPlan"));
    const raw = {
        email: formData.get("email") ?? "",
        password: formData.get("password"),
        fullName: formData.get("fullName"),
        businessRole: formData.get("businessRole"),
        department: formData.get("department"),
        workspaceName: formData.get("workspaceName"),
        businessDescription: formData.get("businessDescription") || "",
        website: formData.get("website") || "",
        invitation: formData.get("invitation")
    };
    const token = path === "employee" ? invitationToken(String(formData.get("invitation") || "")) : null;
    if (path === "employee" && !token) return {
        error: "Enter the Fielded invitation link sent by your organisation."
    };
    const parsed = path === "employee" ? employeeSignupSchema.safeParse(raw) : managerSignupSchema.safeParse(raw);
    if (!parsed.success) return {
        error: "Check the earlier steps and complete every required field. Passwords must be at least 8 characters."
    };
    if (formData.get("terms") !== "accepted") return {
        error: "Please accept the beta terms and privacy notice to continue."
    };
    const accessCode = String(formData.get("accessCode") || "").trim();
    if (accessCode && !/^[A-Za-z0-9_-]{32,64}$/.test(accessCode)) return {
        error: "Enter the complete trial or tester code, or choose the standard 30-day trial."
    };
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    let invitation = null;
    if (token) {
        const { data: preview } = await supabase.rpc("invitation_preview", {
            raw_token: token
        });
        invitation = Array.isArray(preview) ? preview[0] : null;
        if (!invitation || invitation.expired) return {
            error: "That invitation is invalid or has expired. Ask your manager for a new link."
        };
    }
    const email = path === "employee" ? invitation?.invited_email || parsed.data.email : parsed.data.email;
    if (!email) return {
        error: "Enter your work email address."
    };
    if (accessCode && !process.env.SUPABASE_SECRET_KEY) return {
        error: "Access-code signup is temporarily unavailable. Please try again shortly."
    };
    const next = token ? `/join/${token}` : "/onboarding?path=manager";
    const { data, error } = await supabase.auth.signUp({
        email,
        password: parsed.data.password,
        options: {
            emailRedirectTo: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appUrl"])()}/auth/callback?next=${encodeURIComponent(next)}`,
            data: {
                full_name: parsed.data.fullName,
                business_role: parsed.data.businessRole,
                department: parsed.data.department,
                onboarding_path: path,
                trial_plan: path === "manager" ? trialPlan : undefined,
                signup_access: path === "manager" && accessCode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$signup$2d$intent$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sealSignupCode"])(accessCode, email, process.env.SUPABASE_SECRET_KEY) : undefined,
                workspace_name: path === "manager" && "workspaceName" in parsed.data ? parsed.data.workspaceName : undefined,
                company_description: "businessDescription" in parsed.data ? parsed.data.businessDescription : undefined,
                company_website: "website" in parsed.data ? parsed.data.website : undefined,
                invitation_token: token || undefined
            }
        }
    });
    if (error) {
        const message = error.message.toLowerCase().includes("rate limit") ? "Email verification is temporarily at capacity. Please try again shortly or sign in if your account already exists." : error.code === "email_address_not_authorized" || error.message.toLowerCase().includes("sending confirmation email") ? "We could not send your confirmation email. Please try again shortly or contact tech@fielded.ai. Your workspace has not been opened." : "We couldn't create your account. Please check your details, or sign in if you already registered.";
        return {
            error: message
        };
    }
    if (data.session) {
        // Preserve the current signup mode until email delivery is configured.
        // Supabase will return no session once mandatory confirmation is enabled.
        if (!data.user?.email_confirmed_at) {
            await supabase.auth.signOut({
                scope: "local"
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/check-email?next=${encodeURIComponent(next)}`);
        }
        if (path === "manager" && "workspaceName" in parsed.data) {
            const workspace = await supabase.rpc("create_company_workspace", {
                workspace_name: parsed.data.workspaceName,
                business_description: parsed.data.businessDescription,
                company_website: parsed.data.website
            });
            if (workspace.error && workspace.error.code !== "23505") fail("/onboarding?path=manager", "Your account is ready. Please finish creating your workspace.");
            await applyInitialTrialPlan(supabase, data.user.id, trialPlan);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/app/company");
        }
        if (token) {
            const accepted = await supabase.rpc("accept_invitation", {
                raw_token: token
            });
            if (accepted.error) fail(next, "Your account is ready. Please review and accept your invitation.");
            const result = accepted.data;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(result?.assignment_id ? `/app/conversations/${result.assignment_id}` : "/app");
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(next);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/check-email?next=${encodeURIComponent(next)}`);
}
async function completeOnboarding(formData) {
    const workspaceName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2).max(100).safeParse(formData.get("workspaceName"));
    const profile = workProfileSchema.safeParse(Object.fromEntries(formData));
    const context = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(4000),
        website: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].url({
                protocol: /^https?$/
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("")
        ])
    }).safeParse({
        description: formData.get("businessDescription") || "",
        website: formData.get("website") || ""
    });
    if (!context.success) fail("/onboarding?path=manager", "Use a valid website address and a short company description.");
    if (!workspaceName.success || !profile.success) fail("/onboarding?path=manager", "Complete your workspace and work profile.");
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/sign-in");
    if (!auth.user.email_confirmed_at) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/check-email");
    const { error: profileError } = await supabase.from("profiles").update({
        full_name: profile.data.fullName,
        business_role: profile.data.businessRole,
        department: profile.data.department
    }).eq("id", auth.user.id);
    if (profileError) fail("/onboarding?path=manager", profileError.message);
    const { error } = await supabase.rpc("create_company_workspace", {
        workspace_name: workspaceName.data,
        business_description: context.data.description,
        company_website: context.data.website
    });
    if (error && error.code !== "23505") fail("/onboarding", error.message);
    const trialPlan = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "startup",
        "sme",
        "enterprise"
    ]).catch("sme").parse(formData.get("trialPlan"));
    await applyInitialTrialPlan(supabase, auth.user.id, trialPlan);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/app/company");
}
async function resendConfirmation(_state, formData) {
    const email = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email().safeParse(formData.get("email"));
    if (!email.success) return {
        message: "Enter the email address you used to register."
    };
    const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$safe$2d$redirect$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["safeRedirect"])(String(formData.get("next") || "/onboarding"));
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.data,
        options: {
            emailRedirectTo: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appUrl"])()}/auth/callback?next=${encodeURIComponent(next)}`
        }
    });
    if (error) return {
        message: error.status === 429 ? "Please wait a minute before requesting another confirmation." : "We couldn't send a confirmation right now. Please try again later or contact tech@fielded.ai."
    };
    return {
        message: "If this email is awaiting confirmation, a new link has been sent. Check your inbox and spam folder."
    };
}
async function continueWithInvitation(formData) {
    const token = invitationToken(String(formData.get("invitation") || ""));
    if (!token) fail("/onboarding?path=employee", "Enter the complete Fielded invitation link sent by your organisation.");
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: preview } = await supabase.rpc("invitation_preview", {
        raw_token: token
    });
    const invitation = Array.isArray(preview) ? preview[0] : null;
    if (!invitation || invitation.expired) fail("/onboarding?path=employee", "That invitation is invalid or has expired. Ask your manager for a new link.");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/join/${token}`);
}
async function startInvitationSignUp(formData) {
    const token = invitationToken(String(formData.get("invitation") || ""));
    if (!token) fail("/sign-up?path=employee", "Enter the complete Fielded invitation link sent by your organisation.");
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: preview } = await supabase.rpc("invitation_preview", {
        raw_token: token
    });
    const invitation = Array.isArray(preview) ? preview[0] : null;
    if (!invitation || invitation.expired) fail("/sign-up?path=employee", "That invitation is invalid or has expired. Ask your manager for a new link.");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/sign-up?next=${encodeURIComponent(`/join/${token}`)}`);
}
async function signOut() {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hasSupabaseEnv"])()) {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
        await supabase.auth.signOut();
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/");
}
async function switchInvitationAccount(formData) {
    const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^[A-Za-z0-9_-]{20,256}$/).parse(formData.get("token"));
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { error } = await supabase.auth.signOut({
        scope: "local"
    });
    if (error) fail(`/join/${token}`, "Could not sign out. Please try again.");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/join/${token}`);
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    signIn,
    signUpGuided,
    completeOnboarding,
    resendConfirmation,
    continueWithInvitation,
    startInvitationSignUp,
    signOut,
    switchInvitationAccount
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(signIn, "40978437cbf35c8ac50199fb4e90cba2af37fb8ec3", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(signUpGuided, "603fbefca70fd1ba1d9b0fc677fe9f6c7ef45630e9", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(completeOnboarding, "403b384e6f5b7c905a1baaf3bae3b798f0b209fa55", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(resendConfirmation, "60c87fc8bc21a77aee42d750d92bb1593148b99f70", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(continueWithInvitation, "40948f28d66bc5d5d052a77cc726c2dcecd6b14eb7", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(startInvitationSignUp, "404dd5a5c417649a4a80e0c69886d9fc8a88ae9562", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(signOut, "00420b8028643ae847da8ea6a502707fc17cecef7f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(switchInvitationAccount, "405fe4d4371b3b44875f7d912d3e112effc2e718dc", null);
}),
"[project]/src/lib/env.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appUrl",
    ()=>appUrl,
    "hasSupabaseEnv",
    ()=>hasSupabaseEnv,
    "requireEnv",
    ()=>requireEnv
]);
function hasSupabaseEnv() {
    return Boolean(("TURBOPACK compile-time value", "http://192.168.1.175:26313") && ("TURBOPACK compile-time value", "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"));
}
function appUrl() {
    return (("TURBOPACK compile-time value", "http://192.168.1.175:3000") || "http://localhost:3000").replace(/\/$/, "");
}
function requireEnv(name) {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is not configured`);
    return value;
}
}),
"[project]/src/lib/profile-options.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BUSINESS_ROLE_OPTIONS",
    ()=>BUSINESS_ROLE_OPTIONS,
    "BUSINESS_ROLE_VALUES",
    ()=>BUSINESS_ROLE_VALUES,
    "DEPARTMENT_OPTIONS",
    ()=>DEPARTMENT_OPTIONS,
    "DEPARTMENT_VALUES",
    ()=>DEPARTMENT_VALUES,
    "optionLabel",
    ()=>optionLabel
]);
const BUSINESS_ROLE_VALUES = [
    "individual_contributor",
    "team_lead",
    "people_manager",
    "department_lead",
    "executive_founder",
    "external_adviser"
];
const BUSINESS_ROLE_OPTIONS = [
    {
        value: "individual_contributor",
        label: "Individual contributor"
    },
    {
        value: "team_lead",
        label: "Team lead"
    },
    {
        value: "people_manager",
        label: "People manager"
    },
    {
        value: "department_lead",
        label: "Department lead"
    },
    {
        value: "executive_founder",
        label: "Executive or founder"
    },
    {
        value: "external_adviser",
        label: "External adviser"
    }
];
const DEPARTMENT_VALUES = [
    "executive",
    "operations",
    "engineering",
    "product",
    "sales",
    "marketing",
    "finance",
    "people",
    "legal_compliance",
    "customer",
    "other"
];
const DEPARTMENT_OPTIONS = [
    {
        value: "executive",
        label: "Executive leadership"
    },
    {
        value: "operations",
        label: "Operations"
    },
    {
        value: "engineering",
        label: "Engineering"
    },
    {
        value: "product",
        label: "Product"
    },
    {
        value: "sales",
        label: "Sales"
    },
    {
        value: "marketing",
        label: "Marketing"
    },
    {
        value: "finance",
        label: "Finance"
    },
    {
        value: "people",
        label: "People and HR"
    },
    {
        value: "legal_compliance",
        label: "Legal and compliance"
    },
    {
        value: "customer",
        label: "Customer success or service"
    },
    {
        value: "other",
        label: "Other"
    }
];
function optionLabel(options, value) {
    return options.find((option)=>option.value === value)?.label || value?.replaceAll("_", " ") || "Not provided";
}
}),
"[project]/src/lib/safe-redirect.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "safeRedirect",
    ()=>safeRedirect
]);
function safeRedirect(value) {
    if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) return "/app";
    const origin = "https://fielded.invalid";
    try {
        const url = new URL(value, origin);
        return url.origin === origin ? `${url.pathname}${url.search}${url.hash}` : "/app";
    } catch  {
        return "/app";
    }
}
}),
"[project]/src/lib/signup-intent.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openSignupCode",
    ()=>openSignupCode,
    "sealSignupCode",
    ()=>sealSignupCode
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
// Keep access-code digests out of readable auth metadata, including across devices.
function key(secret) {
    if (!secret) throw new Error("Signup access is not configured.");
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(`fielded:signup-intent:v1:${secret}`).digest();
}
function sealSignupCode(code, email, secret, now = Date.now()) {
    const iv = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(12);
    const cipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createCipheriv"])("aes-256-gcm", key(secret), iv);
    cipher.setAAD(Buffer.from(email.trim().toLowerCase()));
    const payload = JSON.stringify({
        digest: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(code.trim()).digest("hex"),
        expires: now + 30 * 86400000
    });
    const encrypted = Buffer.concat([
        cipher.update(payload, "utf8"),
        cipher.final()
    ]);
    return Buffer.concat([
        iv,
        cipher.getAuthTag(),
        encrypted
    ]).toString("base64url");
}
function openSignupCode(value, email, secret, now = Date.now()) {
    if (typeof value !== "string" || value.length > 1024) return null;
    try {
        const bytes = Buffer.from(value, "base64url");
        const decipher = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createDecipheriv"])("aes-256-gcm", key(secret), bytes.subarray(0, 12));
        decipher.setAAD(Buffer.from(email.trim().toLowerCase()));
        decipher.setAuthTag(bytes.subarray(12, 28));
        const payload = JSON.parse(Buffer.concat([
            decipher.update(bytes.subarray(28)),
            decipher.final()
        ]).toString("utf8"));
        return /^[a-f0-9]{64}$/.test(payload.digest) && Number.isFinite(payload.expires) && payload.expires > now ? payload.digest : null;
    } catch  {
        return null;
    }
}
}),
"[project]/src/lib/supabase/server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-rsc] (ecmascript)");
;
;
;
;
async function createClient() {
    const authorization = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])()).get("authorization");
    const bearer = authorization?.match(/^Bearer ([A-Za-z0-9._-]+)$/i)?.[1];
    if (bearer) {
        // Native clients carry a Supabase user JWT instead of browser cookies.
        // Supabase Auth verifies it for getUser(); PostgREST still enforces RLS.
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireEnv"])("NEXT_PUBLIC_SUPABASE_URL"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireEnv"])("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false
            },
            global: {
                headers: {
                    Authorization: `Bearer ${bearer}`
                }
            }
        });
    }
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireEnv"])("NEXT_PUBLIC_SUPABASE_URL"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireEnv"])("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), {
        cookies: {
            getAll: ()=>cookieStore.getAll(),
            setAll: (items)=>{
                try {
                    items.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // Server Components cannot set cookies. Proxy refreshes the session.
                }
            }
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__189u-u6._.js.map