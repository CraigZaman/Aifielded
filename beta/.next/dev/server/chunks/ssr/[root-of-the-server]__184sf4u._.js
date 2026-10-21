module.exports = [
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
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
"[project]/src/app/app/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WorkspaceLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$app$2d$shell$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/app-shell.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$company$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/company.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/entitlements.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plans$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/plans.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
async function WorkspaceLayout({ children }) {
    const viewer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireViewer"])();
    const access = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$entitlements$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getWorkspaceAccess"])(viewer.organisationId);
    const company = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$company$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCompanyAccess"])(viewer.organisationId);
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    let query = db.from("publication_requests").select("id", {
        count: "exact",
        head: true
    }).eq("organisation_id", viewer.organisationId).neq("author_id", viewer.id);
    query = viewer.role === "owner" ? query.eq("status", "pending_owner") : query.eq("status", "pending_head").eq("head_id", viewer.id);
    const pending = await query;
    if (pending.error) throw new Error("Your approval notifications could not be loaded.");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$app$2d$shell$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AppShell"], {
        viewer: viewer,
        companyAccess: Object.values(company).some((level)=>level > 0),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `workspace-trial-banner ${access.active ? "" : "expired"}`,
                role: "status",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: access.state === "trial" ? `30-day trial · ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$plans$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["daysRemaining"])(access.ends_at)} days left` : access.state === "tester" ? "Complimentary tester workspace" : access.state === "expired" ? "Trial ended · workspace is read-only" : "Workspace subscription active"
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/layout.tsx",
                        lineNumber: 18,
                        columnNumber: 190
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: "/billing",
                        children: "Workspace plan"
                    }, void 0, false, {
                        fileName: "[project]/src/app/app/layout.tsx",
                        lineNumber: 18,
                        columnNumber: 458
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/app/layout.tsx",
                lineNumber: 18,
                columnNumber: 100
            }, this),
            Boolean(pending.count) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "approval-inbox",
                role: "status",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    href: "/app/publishing",
                    children: [
                        pending.count,
                        " publication ",
                        pending.count === 1 ? "request needs" : "requests need",
                        " your review."
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/app/layout.tsx",
                    lineNumber: 18,
                    columnNumber: 580
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/app/layout.tsx",
                lineNumber: 18,
                columnNumber: 534
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/app/layout.tsx",
        lineNumber: 18,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/app/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/components/app-shell.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppShell",
    ()=>AppShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.mjs [app-rsc] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.mjs [app-rsc] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-rsc] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-round.mjs [app-rsc] (ecmascript) <export default as UserRound>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$brand$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/brand.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$refresh$2d$workspace$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/refresh-workspace.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$workspace$2d$navigation$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/workspace-navigation.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fielded$2d$dialogue$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fielded-dialogue.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(auth)/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
const roleLabels = {
    owner: "Workspace owner",
    manager: "Management",
    hr: "HR and People",
    participant: "Employee",
    consultant: "Consultant"
};
function AppShell({ viewer, children, companyAccess = false }) {
    const management = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["canManage"])(viewer.role);
    const initials = viewer.name.split(" ").map((part)=>part[0]).slice(0, 2).join("");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `app-frame role-${viewer.role}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "sidebar",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sidebar-top",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$brand$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Brand"], {
                                href: "/app"
                            }, void 0, false, {
                                fileName: "[project]/src/components/app-shell.tsx",
                                lineNumber: 17,
                                columnNumber: 61
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sidebar-organisation",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Organisation"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/app-shell.tsx",
                                        lineNumber: 17,
                                        columnNumber: 120
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: viewer.organisationName
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/app-shell.tsx",
                                        lineNumber: 17,
                                        columnNumber: 145
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/app-shell.tsx",
                                lineNumber: 17,
                                columnNumber: 82
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$workspace$2d$navigation$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkspaceNavigation"], {
                                management: management,
                                company: companyAccess
                            }, void 0, false, {
                                fileName: "[project]/src/components/app-shell.tsx",
                                lineNumber: 17,
                                columnNumber: 193
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/app-shell.tsx",
                        lineNumber: 17,
                        columnNumber: 32
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sidebar-bottom",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "intelligence-health",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/app-shell.tsx",
                                            lineNumber: 18,
                                            columnNumber: 84
                                        }, this),
                                        "Permission-aware workspace"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/app-shell.tsx",
                                    lineNumber: 18,
                                    columnNumber: 76
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/app-shell.tsx",
                                lineNumber: 18,
                                columnNumber: 39
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                href: "/app/settings",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/app-shell.tsx",
                                        lineNumber: 18,
                                        columnNumber: 177
                                    }, this),
                                    "Settings"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/app-shell.tsx",
                                lineNumber: 18,
                                columnNumber: 150
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                action: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["signOut"],
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/app-shell.tsx",
                                            lineNumber: 18,
                                            columnNumber: 259
                                        }, this),
                                        "Sign out"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/app-shell.tsx",
                                    lineNumber: 18,
                                    columnNumber: 237
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/app-shell.tsx",
                                lineNumber: 18,
                                columnNumber: 214
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/app-shell.tsx",
                        lineNumber: 18,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/app-shell.tsx",
                lineNumber: 17,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "app-main",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "workspace-topbar",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Your Fielded workspace"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/app-shell.tsx",
                                        lineNumber: 20,
                                        columnNumber: 74
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: viewer.organisationName
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/app-shell.tsx",
                                        lineNumber: 20,
                                        columnNumber: 109
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/app-shell.tsx",
                                lineNumber: 20,
                                columnNumber: 69
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                className: "profile-menu",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "avatar",
                                                children: initials
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/app-shell.tsx",
                                                lineNumber: 20,
                                                columnNumber: 200
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: viewer.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/app-shell.tsx",
                                                        lineNumber: 20,
                                                        columnNumber: 248
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                        children: roleLabels[viewer.role]
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/app-shell.tsx",
                                                        lineNumber: 20,
                                                        columnNumber: 278
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/app-shell.tsx",
                                                lineNumber: 20,
                                                columnNumber: 242
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/app-shell.tsx",
                                        lineNumber: 20,
                                        columnNumber: 191
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                        "aria-label": "Your account",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/app/profile",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__["UserRound"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/app-shell.tsx",
                                                        lineNumber: 20,
                                                        columnNumber: 392
                                                    }, this),
                                                    "My Profile"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/app-shell.tsx",
                                                lineNumber: 20,
                                                columnNumber: 366
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/app/my-day",
                                                children: "My Work"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/app-shell.tsx",
                                                lineNumber: 20,
                                                columnNumber: 432
                                            }, this),
                                            management && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/app",
                                                children: "Management dashboard"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/app-shell.tsx",
                                                lineNumber: 20,
                                                columnNumber: 486
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/app/settings",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/app-shell.tsx",
                                                        lineNumber: 20,
                                                        columnNumber: 559
                                                    }, this),
                                                    "Account settings"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/app-shell.tsx",
                                                lineNumber: 20,
                                                columnNumber: 532
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                action: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["signOut"],
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                            size: 16
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/app-shell.tsx",
                                                            lineNumber: 20,
                                                            columnNumber: 649
                                                        }, this),
                                                        "Sign out"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/app-shell.tsx",
                                                    lineNumber: 20,
                                                    columnNumber: 627
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/app-shell.tsx",
                                                lineNumber: 20,
                                                columnNumber: 604
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/app-shell.tsx",
                                        lineNumber: 20,
                                        columnNumber: 335
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/app-shell.tsx",
                                lineNumber: 20,
                                columnNumber: 157
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/app-shell.tsx",
                        lineNumber: 20,
                        columnNumber: 32
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mobile-bar",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$brand$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Brand"], {
                                href: "/app"
                            }, void 0, false, {
                                fileName: "[project]/src/components/app-shell.tsx",
                                lineNumber: 21,
                                columnNumber: 35
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                className: "profile-menu mobile-profile-menu",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                        "aria-label": "Open account menu",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "avatar",
                                            children: initials
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/app-shell.tsx",
                                            lineNumber: 21,
                                            columnNumber: 150
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/app-shell.tsx",
                                        lineNumber: 21,
                                        columnNumber: 110
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                        "aria-label": "Your account",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/app/profile",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$round$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__UserRound$3e$__["UserRound"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/app-shell.tsx",
                                                        lineNumber: 21,
                                                        columnNumber: 259
                                                    }, this),
                                                    "My Profile"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/app-shell.tsx",
                                                lineNumber: 21,
                                                columnNumber: 233
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/app/settings",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/app-shell.tsx",
                                                        lineNumber: 21,
                                                        columnNumber: 326
                                                    }, this),
                                                    "Account settings"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/app-shell.tsx",
                                                lineNumber: 21,
                                                columnNumber: 299
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                action: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["signOut"],
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                            size: 16
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/app-shell.tsx",
                                                            lineNumber: 21,
                                                            columnNumber: 416
                                                        }, this),
                                                        "Sign out"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/app-shell.tsx",
                                                    lineNumber: 21,
                                                    columnNumber: 394
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/app-shell.tsx",
                                                lineNumber: 21,
                                                columnNumber: 371
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/app-shell.tsx",
                                        lineNumber: 21,
                                        columnNumber: 202
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/app-shell.tsx",
                                lineNumber: 21,
                                columnNumber: 56
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/app-shell.tsx",
                        lineNumber: 21,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$workspace$2d$navigation$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkspaceNavigation"], {
                        management: management,
                        company: companyAccess,
                        mobile: true
                    }, void 0, false, {
                        fileName: "[project]/src/components/app-shell.tsx",
                        lineNumber: 21,
                        columnNumber: 482
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$workspace$2d$navigation$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WorkspaceSectionTabs"], {
                        management: management
                    }, void 0, false, {
                        fileName: "[project]/src/components/app-shell.tsx",
                        lineNumber: 21,
                        columnNumber: 560
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "workspace-refresh",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$refresh$2d$workspace$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RefreshWorkspace"], {}, void 0, false, {
                            fileName: "[project]/src/components/app-shell.tsx",
                            lineNumber: 21,
                            columnNumber: 643
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/app-shell.tsx",
                        lineNumber: 21,
                        columnNumber: 608
                    }, this),
                    children
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/app-shell.tsx",
                lineNumber: 20,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fielded$2d$dialogue$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FieldedDialogue"], {
                userId: viewer.id
            }, viewer.id, false, {
                fileName: "[project]/src/components/app-shell.tsx",
                lineNumber: 22,
                columnNumber: 12
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/app-shell.tsx",
        lineNumber: 16,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/components/fielded-dialogue.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FieldedDialogue",
    ()=>FieldedDialogue
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const FieldedDialogue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call FieldedDialogue() from the server but FieldedDialogue is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/fielded-dialogue.tsx", "FieldedDialogue");
}),
"[project]/src/components/fielded-dialogue.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FieldedDialogue",
    ()=>FieldedDialogue
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const FieldedDialogue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call FieldedDialogue() from the server but FieldedDialogue is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/fielded-dialogue.tsx <module evaluation>", "FieldedDialogue");
}),
"[project]/src/components/fielded-dialogue.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fielded$2d$dialogue$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/fielded-dialogue.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fielded$2d$dialogue$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/fielded-dialogue.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fielded$2d$dialogue$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/components/refresh-workspace.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RefreshWorkspace",
    ()=>RefreshWorkspace
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const RefreshWorkspace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call RefreshWorkspace() from the server but RefreshWorkspace is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/refresh-workspace.tsx", "RefreshWorkspace");
}),
"[project]/src/components/refresh-workspace.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RefreshWorkspace",
    ()=>RefreshWorkspace
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const RefreshWorkspace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call RefreshWorkspace() from the server but RefreshWorkspace is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/refresh-workspace.tsx <module evaluation>", "RefreshWorkspace");
}),
"[project]/src/components/refresh-workspace.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$refresh$2d$workspace$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/refresh-workspace.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$refresh$2d$workspace$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/refresh-workspace.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$refresh$2d$workspace$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/components/workspace-navigation.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkspaceNavigation",
    ()=>WorkspaceNavigation,
    "WorkspaceSectionTabs",
    ()=>WorkspaceSectionTabs
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const WorkspaceNavigation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call WorkspaceNavigation() from the server but WorkspaceNavigation is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/workspace-navigation.tsx", "WorkspaceNavigation");
const WorkspaceSectionTabs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call WorkspaceSectionTabs() from the server but WorkspaceSectionTabs is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/workspace-navigation.tsx", "WorkspaceSectionTabs");
}),
"[project]/src/components/workspace-navigation.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkspaceNavigation",
    ()=>WorkspaceNavigation,
    "WorkspaceSectionTabs",
    ()=>WorkspaceSectionTabs
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const WorkspaceNavigation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call WorkspaceNavigation() from the server but WorkspaceNavigation is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/workspace-navigation.tsx <module evaluation>", "WorkspaceNavigation");
const WorkspaceSectionTabs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call WorkspaceSectionTabs() from the server but WorkspaceSectionTabs is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/workspace-navigation.tsx <module evaluation>", "WorkspaceSectionTabs");
}),
"[project]/src/components/workspace-navigation.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$workspace$2d$navigation$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/workspace-navigation.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$workspace$2d$navigation$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/workspace-navigation.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$workspace$2d$navigation$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/lib/auth.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canManage",
    ()=>canManage,
    "canManageIntegrations",
    ()=>canManageIntegrations,
    "canManagePeople",
    ()=>canManagePeople,
    "getViewer",
    ()=>getViewer,
    "requireViewer",
    ()=>requireViewer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/server.ts [app-rsc] (ecmascript)");
;
;
;
;
const getViewer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cache"])(async ()=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hasSupabaseEnv"])()) return null;
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError && ![
        400,
        401,
        403
    ].includes(authError.status || 0)) {
        throw new Error("Sign-in status could not be checked. Please try again.");
    }
    if (!auth.user || !auth.user.email_confirmed_at) return null;
    const { data: membership, error: membershipError } = await supabase.from("organisation_memberships").select("role, organisation_id, organisations!organisation_memberships_organisation_id_fkey(name)").eq("user_id", auth.user.id).eq("status", "active").maybeSingle();
    if (membershipError) throw new Error("Workspace access could not be checked. Please try again.");
    if (!membership) return null;
    const { data: profile, error: profileError } = await supabase.from("profiles").select("full_name").eq("id", auth.user.id).maybeSingle();
    if (profileError) throw new Error("Your profile could not be loaded. Please try again.");
    const organisation = membership.organisations;
    if (!organisation) throw new Error("Your workspace could not be loaded. Please try again.");
    return {
        id: auth.user.id,
        email: auth.user.email || "",
        name: profile?.full_name || auth.user.user_metadata?.full_name || "Member",
        organisationId: membership.organisation_id,
        organisationName: organisation.name,
        role: membership.role
    };
});
async function requireViewer() {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hasSupabaseEnv"])()) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/setup");
    const viewer = await getViewer();
    if (!viewer) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/onboarding");
    return viewer;
}
function canManage(role) {
    switch(role){
        case "owner":
        case "manager":
        case "hr":
        case "consultant":
            return true;
        default:
            return false;
    }
}
function canManagePeople(role) {
    return role === "owner" || role === "manager" || role === "hr";
}
function canManageIntegrations(role) {
    return role === "owner" || role === "manager";
}
}),
"[project]/src/lib/company.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COMPANY_AREAS",
    ()=>COMPANY_AREAS,
    "COMPANY_LABELS",
    ()=>COMPANY_LABELS,
    "getCompanyAccess",
    ()=>getCompanyAccess,
    "getCompanyDirectory",
    ()=>getCompanyDirectory,
    "getDialogueContext",
    ()=>getDialogueContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/server.ts [app-rsc] (ecmascript)");
;
;
;
const COMPANY_AREAS = [
    "profile",
    "sources",
    "structure",
    "people",
    "access"
];
const COMPANY_LABELS = {
    profile: "Company profile and library",
    sources: "Sources and developments",
    structure: "Organisation structure",
    people: "People and invitations",
    access: "Access and approval rules"
};
const getCompanyAccess = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cache"])(async (organisationId)=>{
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const result = await db.rpc("my_company_access", {
        workspace: organisationId
    });
    if (result.error || !result.data) throw new Error("Company access could not be checked. Please try again.");
    return Object.fromEntries(COMPANY_AREAS.map((area)=>[
            area,
            Number(result.data[area]) || 0
        ]));
});
async function getCompanyDirectory(organisationId) {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const result = await db.rpc("company_directory", {
        workspace: organisationId
    });
    if (result.error || !result.data) throw new Error("The company directory could not be loaded.");
    return result.data;
}
async function getDialogueContext(organisationId, userId) {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const [company, personal, documents] = await Promise.all([
        db.rpc("company_dialogue_context", {
            workspace: organisationId
        }),
        db.from("personal_context").select("details,use_for_dialogue").eq("user_id", userId).maybeSingle(),
        db.from("personal_reference_documents").select("title,source_name,content").eq("organisation_id", organisationId).eq("user_id", userId).eq("use_for_dialogue", true).order("created_at", {
            ascending: false
        }).limit(5)
    ]);
    if (company.error || personal.error || documents.error) throw new Error("The authorised conversation context could not be loaded.");
    return {
        company: company.data,
        personal: personal.data?.use_for_dialogue ? personal.data.details : null,
        personalReferences: documents.data?.map((d)=>({
                ...d,
                content: d.content.slice(0, 3000)
            }))
    };
}
}),
"[project]/src/lib/entitlements.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getWorkspaceAccess",
    ()=>getWorkspaceAccess
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/server.ts [app-rsc] (ecmascript)");
;
;
;
const getWorkspaceAccess = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cache"])(async (workspace)=>{
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const result = await db.rpc("workspace_commercial_status", {
        workspace
    });
    if (result.error || !result.data) throw new Error("Workspace access could not be checked. Please retry shortly.");
    return result.data;
});
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
"[project]/src/lib/plans.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PLANS",
    ()=>PLANS,
    "TRIAL_AI_UNITS",
    ()=>TRIAL_AI_UNITS,
    "daysRemaining",
    ()=>daysRemaining
]);
const PLANS = {
    startup: {
        name: "Startup",
        seats: 5,
        cents: 2999,
        aiUnits: 8_000_000
    },
    sme: {
        name: "SME",
        seats: 25,
        cents: 7999,
        aiUnits: 24_000_000
    },
    enterprise: {
        name: "Enterprise",
        seats: 100,
        cents: 22999,
        aiUnits: 80_000_000
    }
};
const TRIAL_AI_UNITS = 4_000_000;
function daysRemaining(end, now = Date.now()) {
    return Math.max(0, Math.ceil((Date.parse(end) - now) / 86_400_000));
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

//# sourceMappingURL=%5Broot-of-the-server%5D__184sf4u._.js.map