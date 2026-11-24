// Vercel serverless function: a proposal was signed, tell Surge HQ what the client agreed to.
// POST /api/signed
// Body: { slug, signed_by, signed_title?, signed_on?, fields? }   (sent by /brand/deal-sign.js)
//
// The deal sheet is read from the published proposal page, not from the request, so a visitor
// cannot change the services or the price. HQ stores it (public.hq_intake_deal) and uses it when
// the client's first payment arrives. If HQ cannot be reached, Sam and Mario get the deal by email.
// The "Proposal Approved" email from /api/notify is separate and unchanged.

import { buildSignedDeal, pageUrl } from '../scripts/signed-deal.mjs';

const BASE = (process.env.PROPOSALS_BASE_URL || 'https://proposals.thesurgeagency.com').replace(/\/+$/, '');

async function toHq(payload) {
  const url = process.env.HQ_SUPABASE_URL;
  const key = process.env.HQ_SUPABASE_ANON_KEY;
  const secret = process.env.HQ_INTAKE_SECRET;
  if (!url || !key || !secret) return { sent: false, reason: 'HQ is not connected' };
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/hq_intake_deal`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_secret: secret, p_payload: payload }),
    });
    if (res.ok) return { sent: true };
    console.error('signed: HQ refused the deal', res.status, (await res.text()).slice(0, 200));
    return { sent: false, reason: `HQ answered ${res.status}` };
  } catch (err) {
    console.error('signed: HQ unreachable', err?.message || err);
    return { sent: false, reason: 'HQ could not be reached' };
  }
}

async function toTeam(company, lines, reason) {
  if (!process.env.RESEND_API_KEY) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Surge Proposals <proposals@updates.thesurgeagency.com>',
        to: ['sam@thesurgeagency.com', 'mario@thesurgeagency.com'],
        subject: `Signed deal did not reach HQ: ${company}`,
        text: [`${company} signed, but the deal could not be saved in HQ: ${reason}.`, 'HQ will set this client up without knowing what they bought. The deal:', '', ...lines.map((l) => `- ${l}`)].join('\n'),
      }),
    });
    return res.ok;
  } catch { return false; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = req.body || {};
  const slug = String(body.slug || '');
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).json({ error: 'bad_slug' });

  let html;
  try {
    const page = await fetch(pageUrl(BASE, slug), { cache: 'no-store' });
    if (!page.ok) return res.status(404).json({ error: 'no_such_proposal' });
    html = await page.text();
  } catch (err) {
    console.error('signed: could not read the proposal page', err?.message || err);
    return res.status(502).json({ error: 'page_unreachable' });
  }

  const built = buildSignedDeal(body, html, `${BASE}/${slug}`);
  if (!built.ok) return res.status(400).json({ error: built.error });

  const hq = await toHq(built.payload);
  const emailed = hq.sent ? false : await toTeam(built.payload.sheet.client.name, built.lines, hq.reason);
  return res.status(200).json({ ok: true, delivered: hq.sent || emailed });
}
