import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// Keep access-code digests out of readable auth metadata, including across devices.
function key(secret: string) {
  if (!secret) throw new Error("Signup access is not configured.");
  return createHash("sha256").update(`fielded:signup-intent:v1:${secret}`).digest();
}

export function sealSignupCode(code: string, email: string, secret: string, now = Date.now()) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  cipher.setAAD(Buffer.from(email.trim().toLowerCase()));
  const payload = JSON.stringify({ digest: createHash("sha256").update(code.trim()).digest("hex"), expires: now + 30 * 86400000 });
  const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function openSignupCode(value: unknown, email: string, secret: string, now = Date.now()): string | null {
  if (typeof value !== "string" || value.length > 1024) return null;
  try {
    const bytes = Buffer.from(value, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(secret), bytes.subarray(0, 12));
    decipher.setAAD(Buffer.from(email.trim().toLowerCase()));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const payload = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8"));
    return /^[a-f0-9]{64}$/.test(payload.digest) && Number.isFinite(payload.expires) && payload.expires > now ? payload.digest : null;
  } catch {
    return null;
  }
}
