"use client";

import { useActionState, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Ticket } from "lucide-react";
import { signUpGuided } from "@/app/(auth)/actions";
import { BUSINESS_ROLE_OPTIONS, DEPARTMENT_OPTIONS } from "@/lib/profile-options";
import { TrialPlanField } from "@/components/trial-plan-field";

export function SignupWizard({ employee = false, invitation = "", invitedEmail, accessLabel, plan = "sme", useCode = false }: {
  employee?: boolean; invitation?: string; invitedEmail?: string | null; accessLabel?: string; plan?: string; useCode?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [codeMode, setCodeMode] = useState(useCode);
  const [values, setValues] = useState<Record<string, string>>({ email: invitedEmail || "" });
  const [terms, setTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(plan);
  const [state, action, pending] = useActionState(signUpGuided, { error: "" });
  const form = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const titles = employee ? ["Let's start with you", "Your place in the team", "One last step"] : ["Let's start with you", "Tell us about your company", "Make it yours", "Your workspace access"];
  const last = step === titles.length - 1;

  function go(next: number) {
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function validCurrent() {
    const fields = form.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[data-step="${step}"] input, [data-step="${step}"] select, [data-step="${step}"] textarea`);
    return Array.from(fields || []).every(field => field.reportValidity());
  }

  const field = (name: string) => ({ value: values[name] || "", onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setValues(current => ({ ...current, [name]: event.target.value })) });

  return <form ref={form} className="stack-form signup-wizard" action={action} noValidate onSubmit={event => {
    if (!validCurrent()) { event.preventDefault(); return; }
    if (!last) { event.preventDefault(); go(step + 1); }
  }}>
    <input type="hidden" name="path" value={employee ? "employee" : "manager"}/>
    {employee && <input type="hidden" name="invitation" value={invitation}/>}
    <div className="signup-progress" aria-label={`Step ${step + 1} of ${titles.length}`}>
      {titles.map((title, index) => <span key={title} className={index <= step ? "active" : ""} aria-hidden="true"/>) }
    </div>
    <div className="signup-step-heading"><span>Step {step + 1} of {titles.length}</span><h2 ref={heading} tabIndex={-1}>{titles[step]}</h2></div>
    {state.error && <p className="signup-error" role="alert">{state.error}</p>}
    <fieldset data-step="0" hidden={step !== 0} disabled={pending}>
      <label>Your name<input name="fullName" {...field("fullName")} autoComplete="name" minLength={2} maxLength={80} required placeholder="Alex Morgan"/></label>
      <label>Work email<input name="email" {...field("email")} type="email" autoComplete="email" required readOnly={Boolean(invitedEmail)} placeholder="you@company.com"/></label>
      {invitedEmail && <p className="signup-note">This invitation is addressed to {invitedEmail}.</p>}
      <label>Password<input name="password" {...field("password")} type="password" autoComplete="new-password" minLength={8} required placeholder="At least 8 characters"/></label>
      <p className="signup-note">Use your own work email. Your invitation, if you have one, determines your team access.</p>
    </fieldset>
    {!employee && <fieldset data-step="1" hidden={step !== 1} disabled={pending}>
      <label>Company name<input name="workspaceName" {...field("workspaceName")} autoComplete="organization" minLength={2} maxLength={100} required placeholder="Your company"/></label>
      <label>What does your company do? <span className="signup-optional">Optional</span><textarea name="businessDescription" {...field("businessDescription")} rows={3} maxLength={4000} placeholder="What you do, who you help, and where you work."/></label>
      <p className="signup-note">You can build out your company profile with Fielded later.</p>
    </fieldset>}
    <fieldset data-step={employee ? 1 : 2} hidden={step !== (employee ? 1 : 2)} disabled={pending}>
      {!employee && <label>Company website <span className="signup-optional">Optional</span><input name="website" {...field("website")} type="url" placeholder="https://yourcompany.com"/></label>}
      <label>Your position<select name="businessRole" {...field("businessRole")} required><option value="" disabled>Select your position</option>{BUSINESS_ROLE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <label>Team or function<select name="department" {...field("department")} required><option value="" disabled>Select your team</option>{DEPARTMENT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <p className="signup-note">{employee ? `Your invitation provides ${accessLabel || "employee"} access. Your job title does not change your permissions.` : "You will be the workspace owner. Invite your team after setup."}</p>
    </fieldset>
    <fieldset data-step={titles.length - 1} hidden={!last} disabled={pending}>
      {!employee && <>
        <div className="signup-access" role="group" aria-label="Workspace access">
          <button type="button" aria-pressed={!codeMode} onClick={() => setCodeMode(false)}>30-day trial</button>
          <button type="button" aria-pressed={codeMode} onClick={() => setCodeMode(true)}><Ticket size={15}/> Access code</button>
        </div>
        <TrialPlanField value={selectedPlan} onChange={setSelectedPlan}/>
        {codeMode && <label>Trial / tester code<input name="accessCode" {...field("accessCode")} required maxLength={64} autoComplete="off" spellCheck={false} placeholder="Enter your Fielded code"/><span className="signup-note">Applied when your workspace is created. A code never grants admin access.</span></label>}
      </>}
      {employee && <p className="signup-note">Create your account to join with the access assigned by your organisation.</p>}
      <label className="checkbox-row"><input name="terms" type="checkbox" value="accepted" checked={terms} onChange={event => setTerms(event.target.checked)} required/><span>I agree to the private beta terms and acknowledge the privacy notice.</span></label>
    </fieldset>
    <div className="signup-navigation">
      {step > 0 && <button className="button button-secondary" type="button" disabled={pending} onClick={() => go(step - 1)}><ArrowLeft size={16}/>Back</button>}
      <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Creating account..." : last ? "Create account & continue" : "Next"}{last ? <Check size={16}/> : <ArrowRight size={16}/>}</button>
    </div>
  </form>;
}
