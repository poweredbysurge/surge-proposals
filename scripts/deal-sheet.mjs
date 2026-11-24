// The deal sheet: the key facts of a proposal in a fixed format Surge HQ can read.
//
// Every proposal page carries one, hidden from the client, as
//   <script type="application/json" id="surge-deal"> { ... } </script>
// It must say the same thing as the page the client reads. When the client signs, the page
// sends it to HQ with what they chose at signing. When they pay, HQ uses it to set the client
// up: client note, board cards, Media service folders, which accounts the access page asks
// for, and the website path. See adr/ADR-002-deal-sheet-on-every-proposal.md.
//
// `node scripts/check-deal-sheets.mjs` runs in build.sh and stops a deploy when a proposal's
// deal sheet is missing or incomplete.

export const VERSION = 1;

export const BRANDS = ['the-surge-agency', 'powered-by-surge'];

// What Surge sells. Keys match the price list on thesurgeagency.com (surge-web src/data/pricing.js)
// plus the pieces older all-inclusive deals name separately. `access` is which account groups or
// accounts the client's access page should ask for (onboarding repo, src/lib/access-accounts.js).
export const SERVICES = {
  'custom-website':          { name: 'Custom Website',            access: ['site', 'ga4', 'gsc', 'gtm'] },
  'local-seo-aeo':           { name: 'Local SEO + AEO',           access: ['gbp', 'ga4', 'gsc', 'site'] },
  'ai-authority':            { name: 'AI Authority (GEO)',        access: ['ga4', 'gsc'] },
  'google-business-profile': { name: 'Google Business Profile',   access: ['gbp'] },
  'google-ads-lsa':          { name: 'Google Ads + LSA',          access: ['google_ads', 'ga4', 'gtm'] },
  'meta-ads':                { name: 'Meta Ads',                  access: ['meta', 'facebook_page'] },
  'ai-follow-up':            { name: 'AI Follow-Up (Command Center)', access: [] },
  'ai-voice-agent':          { name: 'AI Voice Agent',            access: [] },
  'chatgpt-ads':             { name: 'ChatGPT Ads',               access: [] },
  'brand-kit-logo':          { name: 'Brand Kit + Logo',          access: [] },
  'seo-audit-plan':          { name: 'SEO Audit + Plan',          access: ['ga4', 'gsc'] },
  'extra-content':           { name: 'Extra content',             access: [] },
  'quality-links':           { name: 'Quality links',             access: [] },
  'full-machine':            { name: 'The Full Machine',          access: ['gbp', 'ga4', 'gsc', 'gtm', 'google_ads', 'meta', 'facebook_page', 'site'] },
};

export const WEBSITE_PATHS = ['new', 'rebuild', 'keep', 'none'];
export const TIERS = ['Launch', 'Scale', 'Dominate'];

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isMoney = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isEmail = (v) => isStr(v) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** Pull the deal sheet out of a proposal page. Returns { sheet } or { error }. */
export function extractDealSheet(html) {
  const blocks = [...String(html).matchAll(/<script\b[^>]*\bid=["']surge-deal["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!blocks.length) return { error: 'no deal sheet on the page (<script type="application/json" id="surge-deal">)' };
  if (blocks.length > 1) return { error: 'more than one deal sheet on the page' };
  try { return { sheet: JSON.parse(blocks[0][1]) }; } catch (err) { return { error: `the deal sheet is not valid JSON (${err.message})` }; }
}

/**
 * Check a deal sheet. `folder` is the proposal's folder name under clients/.
 * Returns { errors: [...], warnings: [...] } in plain words. Errors block a deploy.
 */
export function validateDealSheet(sheet, { folder } = {}) {
  const errors = [];
  const warnings = [];
  const need = (ok, msg) => { if (!ok) errors.push(msg); };
  if (!sheet || typeof sheet !== 'object' || Array.isArray(sheet)) return { errors: ['the deal sheet must be one JSON object'], warnings };

  need(sheet.version === VERSION, `version must be ${VERSION}`);

  const c = sheet.client || {};
  need(isStr(c.slug) && /^[a-z0-9-]{1,60}$/.test(c.slug), 'client.slug: the client ID, lowercase letters, numbers and hyphens (it must match the Stripe payment link and HQ)');
  need(isStr(c.name), 'client.name: the business name');
  need(isStr(c.contact_name), 'client.contact_name: who signs');
  need(isEmail(c.contact_email), 'client.contact_email: the email the welcome email goes to');
  if (!isStr(c.contact_phone)) warnings.push('client.contact_phone is empty: add it when you have it');
  need(c.website === null || isStr(c.website), 'client.website: their current site address, or null if they have none');

  need(BRANDS.includes(sheet.brand), `brand: one of ${BRANDS.join(', ')}`);

  const services = Array.isArray(sheet.services) ? sheet.services : [];
  need(services.length > 0, 'services: at least one service');
  for (const s of services) need(Object.hasOwn(SERVICES, s), `services: "${s}" is not on the list (${Object.keys(SERVICES).join(', ')})`);
  need(new Set(services).size === services.length, 'services: the same service is listed twice');

  const options = sheet.options ?? [];
  need(Array.isArray(options), 'options: a list (empty if the client chooses nothing at signing)');
  for (const o of Array.isArray(options) ? options : []) {
    need(isStr(o?.key) && /^[a-z0-9_]{1,40}$/.test(o.key) && isStr(o?.label) && isStr(o?.field), 'options: each one needs key, label and field (the name of the form field the client fills in)');
  }

  const p = sheet.price || {};
  need(isMoney(p.one_time), 'price.one_time: the one-time fee in dollars (0 if none)');
  need(isMoney(p.monthly), 'price.monthly: the monthly amount in dollars (0 if none)');
  need(isMoney(p.one_time) && isMoney(p.monthly) && p.one_time + p.monthly > 0, 'price: a proposal needs a one-time fee, a monthly amount, or both');
  need(p.tier === null || TIERS.includes(p.tier), `price.tier: ${TIERS.join(', ')}, or null for a custom deal`);
  need(p.term_months === null || (Number.isInteger(p.term_months) && p.term_months > 0), 'price.term_months: the minimum term in months, or null for month to month');
  if (p.monthly > 0) need(p.monthly_starts === 'at signing' || isDate(p.monthly_starts) || isStr(p.monthly_starts), 'price.monthly_starts: "at signing", a date (YYYY-MM-DD), or a short phrase like "month 2"');

  const f = sheet.first_payment || {};
  need(isMoney(f.amount) && f.amount > 0, 'first_payment.amount: what they pay first, in dollars');
  need(f.due === 'at signing' || isDate(f.due), 'first_payment.due: "at signing" or a date (YYYY-MM-DD)');

  need(WEBSITE_PATHS.includes(sheet.website_path), `website_path: one of ${WEBSITE_PATHS.join(', ')}`);
  if (sheet.website_path === 'rebuild' || sheet.website_path === 'keep') need(isStr(c.website), 'client.website is needed when the website path is rebuild or keep');
  if (services.includes('custom-website')) need(sheet.website_path === 'new' || sheet.website_path === 'rebuild', 'website_path must be new or rebuild when a Custom Website is sold');

  need(isStr(sheet.trade), 'trade: what kind of business they are (roofing, HVAC, restaurant ...)');
  need(Array.isArray(sheet.offerings) && sheet.offerings.length > 0 && sheet.offerings.every(isStr), 'offerings: what the client sells, at least one (roof replacement, roof repair ...)');
  need(Array.isArray(sheet.service_areas) && sheet.service_areas.length > 0 && sheet.service_areas.every(isStr), 'service_areas: where they work, at least one city or county');
  need(isStr(sheet.proposal_title), 'proposal_title: the name of the proposal');

  if (folder && isStr(c.slug) && c.slug !== folder) warnings.push(`client.slug "${c.slug}" is not the folder name "${folder}": make sure the Stripe payment link uses "${c.slug}"`);
  return { errors, warnings };
}

/** Which accounts the client's access page should ask for, from the services they bought. */
export function accessFor(services) {
  const out = [];
  for (const s of services || []) for (const a of SERVICES[s]?.access || []) if (!out.includes(a)) out.push(a);
  return out;
}

/** One plain line per fact, for an email, a card note or a client note. */
export function summaryLines(sheet) {
  const money = (n) => `$${Number(n).toLocaleString('en-US')}`;
  const p = sheet.price;
  const price = [p.one_time ? `${money(p.one_time)} one time` : '', p.monthly ? `${money(p.monthly)}/mo starting ${p.monthly_starts}` : ''].filter(Boolean).join(', then ');
  return [
    `Services: ${sheet.services.map((s) => SERVICES[s]?.name || s).join(', ')}`,
    `Price: ${price}${p.tier ? ` (${p.tier} tier)` : ''}${p.term_months ? `, ${p.term_months} month minimum` : ', month to month'}`,
    `First payment: ${money(sheet.first_payment.amount)}, due ${sheet.first_payment.due}`,
    `Website: ${{ new: 'new build', rebuild: `rebuild of ${sheet.client.website}`, keep: `keep ${sheet.client.website}`, none: 'not part of this deal' }[sheet.website_path]}`,
    `They sell: ${sheet.offerings.join(', ')}`,
    `Where: ${sheet.service_areas.join(', ')}`,
  ];
}
