# ADR-002: Every proposal carries a deal sheet that Surge HQ reads

**Status:** Accepted
**Date:** 2026-11-23
**Decider:** Sam Delgado
**Implementation status:** Format, deploy check, the first sheet (RC All Exteriors) and sending the signed deal to HQ are in. HQ using it on payment is the last step.
**Scope:** All proposals

## Context

Surge HQ now sets a client up by itself the moment their first payment clears: Drive folders, Slack channel, client note, starter cards, welcome email (fulfillment map steps ONB-00 to ONB-06). It does that knowing only what Stripe knows: a name, an email and an amount. It does not know what the client bought.

The fulfillment map's next step (ONB-02, "scan the signed proposal") was drawn as an agent reading the proposal page and working out the services, add-ons, price and first payment date. Proposals here are hand-built HTML, each a little different, so that reading would be a guess every time.

On Nov 23, 2026 Sam confirmed two things: every new client signs a proposal before paying, and proposals should go out with the key items already stated so nothing has to be worked out.

## Decision

Every proposal page ends with a hidden **deal sheet**: `<script type="application/json" id="surge-deal">`. It states, in one fixed format:

| Item | Used for |
|---|---|
| Client ID (slug), business name | Matching the proposal to the Stripe payment and to HQ |
| Contact name, email, phone | Welcome email and client note |
| Current website, or none | Website path and the SEO migration |
| Brand: The Surge Agency or Powered By Surge | Keeping the two brands separate |
| Services, from the fixed list in `scripts/deal-sheet.mjs` | Starter cards, and which accounts the access page asks for |
| Options the client picks at signing | Same |
| Price: one-time, monthly, when monthly starts, tier, minimum term | Client note and billing check |
| First payment: amount and when | Confirming the right payment came in |
| Website path: new, rebuild, keep, none | The "Website path" card |
| Trade, what they sell, where they work | Media service folders and the SEO starting point |

Rules:

- The deal sheet must match the visible page. A change to scope or price changes both in the same edit.
- `client.slug` is the proposal's folder name, and the Stripe payment link carries the same slug.
- `node scripts/check-deal-sheets.mjs` runs at the top of `build.sh`. A proposal with no sheet, or a sheet missing an item, stops the deploy with a plain list of what to fix.
- Proposals sent before this rule are listed in `scripts/deal-sheet-legacy.json` and skipped. Nothing new goes on that list.
- The list of services follows the price list on thesurgeagency.com. When a service is added there, add it to `scripts/deal-sheet.mjs` too.
- A missing contact phone is a note, not a blocker.

## Options considered

1. **An agent reads the proposal as written.** No change to how proposals are made, but every setup would rest on an interpretation, and a wrong one sets up the wrong folders and asks the client for the wrong accounts.
2. **A separate form filled in at signing.** Reliable, but it is a second place to enter the deal, and it would drift from the page.
3. **A deal sheet on the page, checked at deploy (chosen).** One place, written when the proposal is written, and impossible to forget because the deploy stops.

## Consequences

- Writing a proposal takes a few more minutes. The check says exactly what is missing.
- The deal sheet is in the page source. It holds nothing the client is not already shown, plus their own contact details. Do not put internal notes, margins or other clients in it.
- HQ can act on a deal without anyone retyping it.
- Until the next two steps are built, the sheet is on the page but nothing reads it yet.

## Update, 2026-11-23: signing reports to HQ

- Every proposal page loads `/brand/deal-sign.js` and its signature handler calls `window.surgeDealSigned(e.target)`. The deploy check now requires both, the `signer_name` field, and a form field for every option the sheet declares.
- The browser sends only the client slug, who signed, and the form fields. `POST /api/signed` reads the deal sheet from the published page (`/clients/<slug>/index.html`), so a visitor cannot change the services or the price by editing the request.
- The endpoint sends the sheet, the chosen options and the signer to Surge HQ (`public.hq_intake_deal`, table `hq.signed_deals`). HQ accepts a client it has not seen, because clients sign before they pay.
- Vercel needs `HQ_SUPABASE_URL`, `HQ_SUPABASE_ANON_KEY` and `HQ_INTAKE_SECRET` on this project. The secret is this site's own (HQ key name `proposals`), not the onboarding site's.
- If HQ cannot be reached, Sam and Mario get the deal by email with a line saying it did not save. The existing "Proposal Approved" email is unchanged.
