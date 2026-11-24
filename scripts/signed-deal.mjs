// What /api/signed sends to Surge HQ. Kept apart from the endpoint so it can be tested.
import { extractDealSheet, summaryLines, validateDealSheet } from './deal-sheet.mjs';

const clean = (s, max) => String(s ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);

/** Where the published proposal page for a slug lives. */
export const pageUrl = (base, slug) => `${String(base).replace(/\/+$/, '')}/clients/${slug}/index.html`;

/**
 * Build the signed deal from the published page and what the signer filled in.
 * `body` is what the browser sent: { slug, signed_by, signed_title, signed_on, fields }.
 * `html` is the proposal page as published. The deal sheet comes only from `html`.
 * Returns { ok, payload, lines } or { ok: false, error }.
 */
export function buildSignedDeal(body, html, publicUrl) {
  const slug = clean(body?.slug, 60);
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return { ok: false, error: 'bad_slug' };
  const signedBy = clean(body?.signed_by, 200);
  if (!signedBy) return { ok: false, error: 'missing_signer' };

  const got = extractDealSheet(html);
  if (got.error) return { ok: false, error: 'no_deal_sheet' };
  const { errors } = validateDealSheet(got.sheet);
  if (errors.length) return { ok: false, error: 'deal_sheet_incomplete' };
  if (got.sheet.client.slug !== slug) return { ok: false, error: 'slug_mismatch' };

  // Only the options the proposal declares, read from the form fields it names.
  const fields = body?.fields && typeof body.fields === 'object' ? body.fields : {};
  const options = {};
  for (const o of got.sheet.options || []) {
    const v = clean(fields[o.field], 300);
    if (v) options[o.key] = v;
  }

  const payload = {
    sheet: got.sheet,
    options,
    signed_by: signedBy,
    signed_title: clean(body?.signed_title, 200),
    signed_on: clean(body?.signed_on, 60),
    proposal_url: publicUrl,
  };
  const chosen = (got.sheet.options || []).filter((o) => options[o.key]).map((o) => `${o.label}: ${options[o.key]}`);
  const lines = [
    `Signed by ${signedBy}${payload.signed_title ? ` (${payload.signed_title})` : ''}${payload.signed_on ? ` on ${payload.signed_on}` : ''}`,
    ...summaryLines(got.sheet),
    ...chosen,
  ];
  return { ok: true, payload, lines };
}
