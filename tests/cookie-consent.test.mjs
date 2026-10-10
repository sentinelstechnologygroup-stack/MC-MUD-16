import test from 'node:test';
import assert from 'node:assert/strict';
import { CONSENT_COOKIE, CONSENT_MAX_AGE, consentCookie, isGoogleMapEmbed, parseConsent } from '../src/lib/cookie-consent.js';

test('accepted and declined choices persist and expire after 180 days', () => {
  const now = 1_790_000_000_000;
  for (const choice of ['accepted', 'declined']) {
    const cookie = consentCookie(choice, true, now);
    assert.equal(parseConsent('other=value; ' + cookie, now + 1000), choice);
    assert.equal(parseConsent(cookie, now + CONSENT_MAX_AGE * 1000), null);
    assert.ok(cookie.includes('; Secure'));
    assert.ok(cookie.includes('; SameSite=Lax'));
  }
  assert.ok(!consentCookie('declined', false, now).includes('; Secure'));
});

test('missing, malformed and obsolete consent never enable the map', () => {
  assert.equal(parseConsent(''), null);
  assert.equal(parseConsent(CONSENT_COOKIE + '=%broken'), null);
  for (const value of [{ version: 0, choice: 'accepted', expiresAt: Date.now() + 10000 }, { version: 1, choice: 'yes', expiresAt: Date.now() + 10000 }, { version: 1, choice: 'accepted' }]) {
    assert.equal(parseConsent(CONSENT_COOKIE + '=' + encodeURIComponent(JSON.stringify(value))), null);
  }
  assert.throws(() => consentCookie('yes', true));
});

test('only genuine HTTPS Google Maps share embeds are allowed', () => {
  assert.equal(isGoogleMapEmbed('https://www.google.com/maps/embed?pb=map'), true);
  for (const value of ['http://www.google.com/maps/embed?pb=map', 'https://www.google.com.attacker.test/maps/embed?pb=map', 'https://www.google.com/search?pb=map', 'javascript:alert(1)', '']) assert.equal(isGoogleMapEmbed(value), false);
});
