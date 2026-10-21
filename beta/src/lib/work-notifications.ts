import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { appUrl } from "@/lib/env";
import { hasEmailConfiguration, sendEmail } from "@/lib/email";
import { hasFirebaseAdminConfiguration, sendFirebasePush } from "@/lib/firebase-admin";

const subjects: Record<string, string> = {
  task_assigned: "You have a new Fielded task",
  task_updated: "A Fielded task has been updated",
  task_comment: "New reply on a Fielded task",
  mission_assigned: "You have a new Fielded discussion",
};

// Call only after an authenticated, workspace-scoped mutation or manager retry action.
export async function dispatchWorkNotifications(workspaceId: string) {
  if (!hasEmailConfiguration() && !hasFirebaseAdminConfiguration()) return;
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_work_notifications", { workspace_id: workspaceId });
  if (error) throw new Error("Notification queue could not be read.");
  for (const notification of data || []) {
    const { data: membership, error: membershipError } = await admin.from("organisation_memberships")
      .select("id").eq("organisation_id", workspaceId).eq("user_id", notification.recipient_id).eq("status", "active").maybeSingle();
    if (membershipError) throw new Error("Notification recipient could not be checked.");
    if (!membership) {
      const { error } = await admin.from("work_notifications").update({ status: "skipped", error_code: "inactive_recipient" }).eq("id", notification.id);
      if (error) throw new Error("Notification status could not be saved.");
      continue;
    }
    const destination = notification.kind === "mission_assigned"
      ? `/app/conversations/${notification.entity_id}` : `/app/follow-ups#task-${notification.entity_id}`;
    const subject = subjects[notification.kind];
    if (!subject) throw new Error("Unknown notification type.");
    let emailSent = false;
    let emailProviderId: string | null = null;
    let emailReason: string | null = null;
    if (hasEmailConfiguration()) {
      const { data: user, error: userError } = await admin.auth.admin.getUserById(notification.recipient_id);
      if (userError || !user.user?.email) throw new Error("Notification recipient email unavailable.");
      // Keep employee statements and task content out of external email bodies.
      const delivery = await sendEmail({
        to: user.user.email,
        subject,
        text: `${subject}. Sign in to your workspace to view it: ${appUrl()}${destination}`,
        idempotencyKey: `work-${notification.id}`,
      });
      emailSent = delivery.sent;
      emailProviderId = delivery.sent ? delivery.providerId : null;
      emailReason = delivery.sent ? null : delivery.reason;
    }
    const { data: devices, error: devicesError } = await admin.from("mobile_push_devices")
      .select("id,token").eq("organisation_id", workspaceId).eq("user_id", notification.recipient_id).eq("enabled", true);
    if (devicesError) throw new Error("Notification devices could not be loaded.");
    let pushSent = false;
    const invalidDeviceIds: string[] = [];
    if (hasFirebaseAdminConfiguration()) {
      for (const device of devices || []) {
        const push = await sendFirebasePush({ token: device.token, title: subject, body: "Sign in to view your Fielded update.", data: { kind: notification.kind, entity_id: notification.entity_id, notification_id: notification.id } });
        pushSent = pushSent || push.sent;
        if (push.invalid) invalidDeviceIds.push(device.id);
      }
    }
    if (invalidDeviceIds.length) await admin.from("mobile_push_devices").update({ enabled: false, updated_at: new Date().toISOString() }).in("id", invalidDeviceIds);
    const delivered = emailSent || pushSent;
    const { error: saveError } = await admin.from("work_notifications").update(delivered
      ? { status: "accepted", provider_id: emailProviderId, error_code: null }
      : { status: "failed", error_code: emailReason || (devices?.length ? "push_delivery_failed" : "no_active_delivery_target") }).eq("id", notification.id);
    if (saveError) throw new Error("Notification delivery status could not be saved.");
  }
}

export async function tryDispatchWorkNotifications(workspaceId: string) {
  try { await dispatchWorkNotifications(workspaceId); }
  catch { console.error("Work notification processing incomplete; retained for retry."); }
}
