import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { migratedAsset } from '../src/lib/migrated-assets.js';
import { STORMWATER_DOCUMENTS } from '../src/lib/stormwater-documents.js';
import { district } from '../src/api/districtClient.js';

const data = JSON.parse(fs.readFileSync('src/data/public-content.json', 'utf8'));
const content = key => JSON.parse(data.WebsiteContent.find(row => row.key === key).value);

test('favicon assets have browser sizes and remain outside the SPA fallback', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8').replace(/^\uFEFF/, ''));
  const fallback = new RegExp('^' + config.rewrites[0].source + '$');
  for (const size of [16, 32, 180]) {
    const path = `/favicon-${size}.png`;
    const png = fs.readFileSync('public' + path);
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
    assert.ok(html.includes(path));
    assert.equal(fallback.test(path), false);
  }
  const ico = fs.readFileSync('public/favicon.ico');
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 6);
  assert.equal(fallback.test('/favicon.ico'), false);
  assert.equal(fallback.test('/stormwater-management'), true);
});

test('public page queries work and private reads and staff writes are rejected', async () => {
  const elections = await district.entities.Document.filter({ $or: [{ category: 'election' }, { title: 'Notice of Deadline - 2026 Directors Election' }], archived: { $ne: true } }, '-date', 100);
  assert.equal(elections.length, 11);
  const future = await district.entities.Meeting.filter({ status: 'scheduled', date: { $gte: '2026-10-10' } }, 'date', 1);
  assert.equal(future.length, 0);
  await assert.rejects(district.entities.WebsiteDraft.list(), { status: 403 });
  await assert.rejects(district.entities.Document.create({ title: 'Unauthorized' }), { status: 503 });
  await assert.rejects(district.auth.me(), { status: 401 });
});

test('supplied district roster and pending tax status survive migration', () => {
  assert.deepEqual(content('board_members').map(row => row.name), ['Fred Paris', 'Tomas Enix', 'Dustin Van Dyne', 'Kathy McDonald', 'Jim McNamara']);
  assert.equal(content('tax_update').total, '0.988');
  assert.equal(content('tax_update').status, 'pending');
  assert.equal(content('meeting_schedule').show_recurring, false);
  for (const key of ['accessibility', 'privacy', 'terms']) assert.equal(content(key).draft, true);
});

test('every original asset and all five supplied PDFs are preserved', () => {
  const original = JSON.parse(fs.readFileSync('migration/asset-manifest.json', 'utf8'));
  assert.equal(original.filter(row => row.type === 'document').length, 56);
  for (const row of original) {
    const file = 'public' + migratedAsset(row.url);
    assert.ok(fs.existsSync(file), row.url);
    assert.equal(fs.statSync(file).size, row.bytes, row.url);
  }
  const stormwater = JSON.parse(fs.readFileSync('migration/stormwater/asset-manifest.json', 'utf8'));
  for (const row of stormwater) {
    const bytes = fs.readFileSync('public' + row.path);
    assert.equal(bytes.length, row.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), row.sha256);
  }
});

test('public calendar and document links retain relationships and exclude private records', () => {
  assert.equal(data.Meeting.length, 26);
  assert.equal(new Set(data.Meeting.map(row => row.id)).size, 26);
  assert.equal(data.WebsiteDraft, undefined);
  assert.equal(data.ContentChange, undefined);
  assert.ok(!JSON.stringify(data).includes('sentinelstechnologygroup@gmail.com'));
  const seeds = STORMWATER_DOCUMENTS.filter(seed => !data.Document.some(row => row.seed_key === seed.id || row.file_url === seed.file_url));
  const documents = [...data.Document, ...seeds];
  assert.equal(documents.length, 61);
  assert.equal(new Set(documents.map(row => row.file_url)).size, 61);
  for (const row of documents) {
    assert.ok(!row.archived && !row.is_sample);
    assert.ok(row.file_url.startsWith('/'));
    assert.equal(fs.readFileSync('public' + row.file_url).subarray(0, 5).toString(), '%PDF-');
  }
  for (const meeting of data.Meeting) {
    if (meeting.agenda_url) assert.ok(documents.some(row => row.file_url === meeting.agenda_url));
  }
});

