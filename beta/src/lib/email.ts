import "server-only";
import { localSmtpPort, sendLocalEmail } from "@/lib/local-smtp";

type WorkspaceInvitationEmail = {
  to: string;
  organisationName: string;
  inviterName: string;
  accessLabel: string;
  inviteUrl: string;
  idempotencyKey?: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    "\"": "&quot;",
  })[character] || character);
}

export function hasEmailConfiguration() {
  return Boolean(localSmtpPort() || (process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim()
    && process.env.RESEND_API_KEY !== "[SENSITIVE]"));
}

export async function sendEmail(input: { to: string; subject: string; text: string; html?: string; idempotencyKey: string }) {
  if (!hasEmailConfiguration()) return { sent: false, reason: "not_configured" } as const;
  if (localSmtpPort()) {
    try {
      await sendLocalEmail(input);
      return { sent: true, providerId: `local-${input.idempotencyKey}` } as const;
    } catch {
      return { sent: false, reason: "connection_error" } as const;
    }
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(12000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": input.idempotencyKey },
      body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [input.to], subject: input.subject, text: input.text, ...(input.html ? { html: input.html } : {}) }),
    });
    if (!response.ok) return { sent: false, reason: "provider_error" } as const;
    const result = await response.json();
    if (typeof result.id !== "string") return { sent: false, reason: "provider_error" } as const;
    return { sent: true, providerId: result.id } as const;
  } catch {
    return { sent: false, reason: "connection_error" } as const;
  }
}

export async function sendWorkspaceInvitationEmail(invitation: WorkspaceInvitationEmail) {

  const organisationName = escapeHtml(invitation.organisationName);
  const inviterName = escapeHtml(invitation.inviterName);
  const accessLabel = escapeHtml(invitation.accessLabel);
  const inviteUrl = escapeHtml(invitation.inviteUrl);
  return sendEmail({
      to: invitation.to,
      idempotencyKey: invitation.idempotencyKey || `invitation-${new URL(invitation.inviteUrl).pathname.split("/").pop()}`,
      subject: `${invitation.inviterName} invited you to ${invitation.organisationName} on Fielded`,
      text: `${invitation.inviterName} invited you to join ${invitation.organisationName} as ${invitation.accessLabel}. Open your secure invitation: ${invitation.inviteUrl}`,
      html: `<div style="background:#f3f6f4;padding:40px 20px;font-family:Arial,sans-serif;color:#17201d"><div style="max-width:560px;margin:auto;background:white;border:1px solid #dce2df;padding:32px"><div style="font-size:22px;font-weight:700;margin-bottom:28px">Fielded<span style="color:#0f5c49">.ai</span></div><h1 style="font-size:24px;margin:0 0 12px">Join ${organisationName}</h1><p style="color:#56615c;line-height:1.6">${inviterName} invited you to join the organisation's Fielded workspace with <strong>${accessLabel}</strong> access.</p><a href="${inviteUrl}" style="display:inline-block;margin:14px 0 22px;background:#0f5c49;color:white;text-decoration:none;padding:13px 18px;border-radius:6px;font-weight:700">Accept secure invitation</a><p style="color:#68736e;font-size:12px;line-height:1.5">This link is restricted to ${escapeHtml(invitation.to)} and expires automatically. Fielded will ask for your name, password and work profile before you enter.</p></div></div>`,
  });
}
