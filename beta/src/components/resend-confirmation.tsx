"use client";

import { useActionState } from "react";
import { resendConfirmation } from "@/app/(auth)/actions";

export function ResendConfirmation({ next }: { next: string }) {
  const [state, action, pending] = useActionState(resendConfirmation, { message: "" });
  return <details className="confirmation-resend"><summary>Didn&apos;t receive an email?</summary>
    <form action={action} className="stack-form">
      <input type="hidden" name="next" value={next}/>
      <label>Your email<input name="email" type="email" autoComplete="email" required placeholder="you@company.com"/></label>
      <button className="button button-secondary button-full" disabled={pending}>{pending ? "Requesting..." : "Resend confirmation"}</button>
      {state.message && <p className="signup-note" role="status">{state.message}</p>}
    </form>
  </details>;
}
