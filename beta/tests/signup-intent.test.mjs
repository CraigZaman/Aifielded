import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { sealSignupCode, openSignupCode } from '../src/lib/signup-intent.ts';

const secret = 'test-only-server-secret';
const email = 'owner@example.test';
const code = 'a-test-only-access-code';
const now = 1000000;

test('preserves the digest across devices without exposing the code or digest', () => {
  const envelope = sealSignupCode(code, email, secret, now);
  const digest = createHash('sha256').update(code).digest('hex');
  assert.equal(openSignupCode(envelope, email, secret, now + 1), digest);
  assert.ok(!envelope.includes(code));
  assert.ok(!Buffer.from(envelope, 'base64url').toString().includes(digest));
});
test('binds a pending code to the verified email', () => {
  const envelope = sealSignupCode(code, email, secret, now);
  assert.equal(openSignupCode(envelope, 'other@example.test', secret, now), null);
  assert.notEqual(openSignupCode(envelope, 'OWNER@example.test', secret, now), null);
});
test('rejects tampering, wrong server keys and expired intentions', () => {
  const envelope = sealSignupCode(code, email, secret, now);
  assert.equal(openSignupCode(envelope.slice(0, 40) + 'AAAA' + envelope.slice(44), email, secret, now), null);
  assert.equal(openSignupCode(envelope, email, 'different-key', now), null);
  assert.equal(openSignupCode(envelope, email, secret, now + 30 * 86400000), null);
});
test('rejects malformed data and generates unique encryption nonces', () => {
  for (const invalid of [null, {}, '', 'invalid', 'a'.repeat(1025)]) assert.equal(openSignupCode(invalid, email, secret, now), null);
  assert.notEqual(sealSignupCode(code, email, secret, now), sealSignupCode(code, email, secret, now));
});
