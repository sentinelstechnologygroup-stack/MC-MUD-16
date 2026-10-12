import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_ENDPOINT, submitContact } from '../src/lib/contact-form.js';

test('contact submission uses the approved endpoint and requires explicit acceptance', async () => {
  const data = new FormData(); data.set('email', 'test@example.com');
  await submitContact(data, async (url, options) => {
    assert.equal(url, CONTACT_ENDPOINT);
    assert.equal(options.method, 'POST');
    assert.equal(options.body, data);
    assert.equal(options.headers.Accept, 'application/json');
    return { ok: true, json: async () => ({ ok: true }) };
  });
});
test('failed, malformed and unconfirmed submissions never report success', async () => {
  for (const response of [
    { ok: false, json: async () => ({ errors: [{ message: 'Rejected' }] }) },
    { ok: true, json: async () => ({}) },
    { ok: true, json: async () => { throw new Error('Invalid JSON'); } },
  ]) await assert.rejects(submitContact(new FormData(), async () => response));
  await assert.rejects(submitContact(new FormData(), async () => { throw new Error('Offline'); }));
});
