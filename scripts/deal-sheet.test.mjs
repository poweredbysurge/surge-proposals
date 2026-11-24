import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SERVICES, accessFor, extractDealSheet, summaryLines, validateDealSheet } from './deal-sheet.mjs';
import { checkAll } from './check-deal-sheets.mjs';
import { buildSignedDeal, pageUrl } from './signed-deal.mjs';

const good = () => ({
  version: 1,
  client: { slug: 'acme-roofing', name: 'Acme Roofing', contact_name: 'Pat Lee', contact_email: 'pat@acmeroofing.com', contact_phone: '555-0100', website: null },
  brand: 'the-surge-agency',
  services: ['custom-website', 'local-seo-aeo', 'google-ads-lsa'],
  options: [],
  price: { one_time: 0, monthly: 6500, monthly_starts: 'at signing', tier: null, term_months: 12 },
  first_payment: { amount: 6500, due: 'at signing' },
  website_path: 'new',
  trade: 'roofing',
  offerings: ['Roof replacement', 'Roof repair'],
  service_areas: ['Hagerstown, MD'],
  proposal_title: 'Acme Roofing Growth System',
});
const page = (sheet) => `<html><body><form><input name="signer_name"><input name="signer_title"><input name="date"><input name="spend"></form>
<script>function handleSubmit(e){ if (window.surgeDealSigned) window.surgeDealSigned(e.target); }</script>
<script src="/brand/deal-sign.js"></script>
<script type="application/json" id="surge-deal">${JSON.stringify(sheet)}</script></body></html>`;

test('a complete deal sheet passes', () => {
  assert.deepEqual(validateDealSheet(good(), { folder: 'acme-roofing' }), { errors: [], warnings: [] });
});

test('each key item is required, in plain words', () => {
  const broken = (change) => { const s = good(); change(s); return validateDealSheet(s).errors.join(' | '); };
  assert.match(broken((s) => { s.client.slug = 'Acme Roofing'; }), /client\.slug/);
  assert.match(broken((s) => { s.client.contact_email = 'pat'; }), /contact_email/);
  assert.match(broken((s) => { delete s.client.website; }), /client\.website/);
  assert.match(broken((s) => { s.brand = 'surge'; }), /brand/);
  assert.match(broken((s) => { s.services = []; }), /at least one service/);
  assert.match(broken((s) => { s.services = ['seo']; }), /"seo" is not on the list/);
  assert.match(broken((s) => { s.price.monthly = '6,500'; }), /price\.monthly/);
  assert.match(broken((s) => { s.price.one_time = 0; s.price.monthly = 0; }), /a one-time fee, a monthly amount, or both/);
  assert.match(broken((s) => { s.price.tier = 'Surge'; }), /price\.tier/);
  assert.match(broken((s) => { s.first_payment.due = 'soon'; }), /first_payment\.due/);
  assert.match(broken((s) => { s.website_path = 'maybe'; }), /website_path/);
  assert.match(broken((s) => { s.website_path = 'rebuild'; }), /client\.website is needed/);
  assert.match(broken((s) => { s.website_path = 'none'; }), /must be new or rebuild when a Custom Website is sold/);
  assert.match(broken((s) => { s.offerings = []; }), /offerings/);
  assert.match(broken((s) => { s.service_areas = []; }), /service_areas/);
  assert.match(broken((s) => { s.options = [{ key: 'ad_budget' }]; }), /options/);
});

test('a missing phone is a note, not a blocker; a slug that differs from the folder is flagged', () => {
  const s = good(); s.client.contact_phone = '';
  const r = validateDealSheet(s, { folder: 'acme' });
  assert.deepEqual(r.errors, []);
  assert.equal(r.warnings.length, 2);
});

test('reading the sheet off a page', () => {
  assert.deepEqual(extractDealSheet(page(good())).sheet.client.slug, 'acme-roofing');
  assert.match(extractDealSheet('<html></html>').error, /no deal sheet/);
  assert.match(extractDealSheet(page(good()) + page(good())).error, /more than one/);
  assert.match(extractDealSheet('<script type="application/json" id="surge-deal">{oops</script>').error, /not valid JSON/);
});

test('services decide which accounts the access page asks for', () => {
  assert.deepEqual(accessFor(['google-business-profile']), ['gbp']);
  assert.deepEqual(accessFor(['custom-website', 'meta-ads']), ['site', 'ga4', 'gsc', 'gtm', 'meta', 'facebook_page']);
  assert.deepEqual(accessFor(['brand-kit-logo']), []);
  for (const [key, s] of Object.entries(SERVICES)) assert.ok(s.name && Array.isArray(s.access), key);
});

test('the summary reads plainly and has no em dashes', () => {
  const lines = summaryLines(good());
  assert.equal(lines[1], 'Price: $6,500/mo starting at signing, 12 month minimum');
  assert.equal(lines[3], 'Website: new build');
  assert.ok(!lines.join('\n').includes('—'));
});

test('the deploy check fails a proposal with no sheet, passes a good one and skips the listed old ones', () => {
  const dir = mkdtempSync(join(tmpdir(), 'deals-'));
  for (const [name, html] of [['good-co', page({ ...good(), client: { ...good().client, slug: 'good-co' } })], ['no-sheet', '<html></html>'], ['old-one', '<html></html>']]) {
    mkdirSync(join(dir, name)); writeFileSync(join(dir, name, 'index.html'), html);
  }
  const r = checkAll(dir, { 'old-one': 'Signed before the rule.' }, undefined);
  assert.equal(r.failed, 1);
  assert.ok(r.lines.some((l) => l.startsWith('ok    good-co')));
  assert.ok(r.lines.some((l) => l.startsWith('FAIL  no-sheet')));
  assert.ok(r.lines.some((l) => l.startsWith('skip  old-one')));
});

test('the real proposals in this repo pass the check', () => {
  assert.equal(checkAll(undefined, JSON.parse(readFileSync(new URL('./deal-sheet-legacy.json', import.meta.url), 'utf8')).skip, undefined).failed, 0);
});

test('the deploy check also needs the page to report signing to HQ', () => {
  const dir = mkdtempSync(join(tmpdir(), 'deals-'));
  const sheet = { ...good(), client: { ...good().client, slug: 'quiet-co' }, options: [{ key: 'ad_budget', label: 'Starting ad budget', field: 'budget' }] };
  mkdirSync(join(dir, 'quiet-co'));
  writeFileSync(join(dir, 'quiet-co', 'index.html'), `<html><script type="application/json" id="surge-deal">${JSON.stringify(sheet)}</script></html>`);
  const r = checkAll(dir, {}, undefined);
  const text = r.lines.join('\n');
  assert.equal(r.failed, 1);
  assert.match(text, /does not load \/brand\/deal-sign\.js/);
  assert.match(text, /does not call window\.surgeDealSigned/);
  assert.match(text, /field named signer_name/);
  assert.match(text, /no form field named "budget"/);
});

test('a signed deal is built from the published page, never from what the browser sent', () => {
  const sheet = { ...good(), options: [{ key: 'ad_budget', label: 'Starting ad budget', field: 'spend' }] };
  const body = {
    slug: 'acme-roofing', signed_by: ' Pat Lee ', signed_title: 'Owner', signed_on: '2026-11-23',
    fields: { spend: '$50 a day', signer_name: 'Pat Lee', hacked: 'yes' },
    sheet: { price: { monthly: 1 } }, // a visitor trying to change the price: ignored
  };
  const r = buildSignedDeal(body, page(sheet), 'https://proposals.thesurgeagency.com/acme-roofing');
  assert.equal(r.ok, true);
  assert.equal(r.payload.sheet.price.monthly, 6500);
  assert.deepEqual(r.payload.options, { ad_budget: '$50 a day' });
  assert.equal(r.payload.signed_by, 'Pat Lee');
  assert.equal(r.payload.proposal_url, 'https://proposals.thesurgeagency.com/acme-roofing');
  assert.equal(r.lines[0], 'Signed by Pat Lee (Owner) on 2026-11-23');
  assert.ok(r.lines.includes('Starting ad budget: $50 a day'));
});

test('a signing is refused when it does not match a real, complete proposal', () => {
  const base = { slug: 'acme-roofing', signed_by: 'Pat Lee' };
  assert.equal(buildSignedDeal({ ...base, slug: '../etc' }, page(good())).error, 'bad_slug');
  assert.equal(buildSignedDeal({ ...base, signed_by: ' ' }, page(good())).error, 'missing_signer');
  assert.equal(buildSignedDeal(base, '<html></html>').error, 'no_deal_sheet');
  assert.equal(buildSignedDeal(base, page({ ...good(), services: [] })).error, 'deal_sheet_incomplete');
  assert.equal(buildSignedDeal({ ...base, slug: 'other-co' }, page(good())).error, 'slug_mismatch');
  assert.equal(pageUrl('https://proposals.thesurgeagency.com/', 'acme-roofing'), 'https://proposals.thesurgeagency.com/clients/acme-roofing/index.html');
});
