# ADR-001: Stripe Payment Links, not hosted invoices, as the default payment mechanism on proposals

**Status:** Accepted
**Date:** 2026-09-16
**Decider:** Sam Delgado
**Implementation status:** Wired and live (RC All Exteriors, `/rc-all-exteriors`)
**Scope:** All proposals

## Context

Every proposal in this repo ends with a signature form and a payment button. The button
is a single URL held in a `STRIPE_LINK` constant near the top of the client's
`index.html`, revealed by `handleSubmit()` once the client signs.

Until now that URL was produced ad hoc per client, and the first real pattern came from
Home Source Roofing in May 2026. That proposal used a **hosted invoice URL**
(`invoice.stripe.com/i/acct_.../live_...`) generated from a Stripe invoice created in
advance, with `collection_method=send_invoice`. That choice was made for a
client-specific reason: Brandon Moye wanted to review and pay each invoice manually
rather than have his personal debit card auto-charged.

That reason was never general, but the mechanism got copied forward as if it were. It
carries three problems when applied to a prospect who has not yet signed:

1. Creating the invoice creates a real, outstanding bill against a client who has not
   agreed to anything yet.
2. Stripe can email that invoice to the client, so the first thing they hear from Surge
   after seeing a proposal may be a bill.
3. The subscription's billing anchor gets set when the invoice is created, not when the
   client actually commits, so the billing date drifts away from the start date.

Building the RC All Exteriors proposal in September 2026 forced the question, since
Ricardo Castro had not signed anything at the time the proposal page was built.

## Decision

Proposals use a **Stripe Payment Link** for the payment button by default. The client
clicks through to Stripe Checkout, enters their own card, and that checkout is what
creates the customer, the subscription, and the first charge.

Nothing exists in Stripe against the client until they pay. No customer object, no
subscription, no invoice.

## Options considered

- **Stripe Payment Link (chosen).** One reusable URL per client tier, created from a
  product plus a recurring price. Creates customer and subscription at checkout.
  Nothing is billed, emailed, or scheduled beforehand. Billing anchors to the day the
  client actually pays, which is also the day work starts, so the two stay aligned.
  Downside: Surge does not control the customer record's fields, since Stripe builds it
  from what the client types at checkout. Cleaning up name and metadata afterward is a
  small manual step.

- **Hosted invoice URL with `send_invoice` collection (not chosen as default).** What
  Home Source uses. Right when a client has explicitly asked to review and pay invoices
  manually, or when terms are net-N rather than due on receipt. Wrong as a default,
  because it bills a prospect before they commit and can email them unprompted. Remains
  the correct choice for the specific cases named below.

- **Stripe Checkout Session created on demand by an API route (not chosen).** Most
  control, and `api/create-rush-checkout.js` already shows the shape of it. Rejected as
  a default because it adds a serverless dependency, an env var, and a failure mode to
  every proposal in exchange for control that a static Payment Link does not need. Worth
  revisiting only if proposals start needing dynamic pricing or per-session metadata.

## Consequences

**Enables**

- A proposal can be built and sent before the client has committed to anything, which is
  the normal case.
- Billing date equals start date, so there is no drift to explain later.
- The client enters their own card, so nobody is auto-charging a card on file that was
  never offered for this engagement.
- The link is reusable and idempotent. Sending the proposal twice does not create two
  bills.

**Constrains**

- The Stripe customer record is created from checkout input, so the name and email are
  whatever the client typed. Tidy the customer record and attach engagement metadata
  after the first payment.
- A Payment Link cannot carry a one-time kickoff fee and a recurring subscription on
  different schedules in a single link. Engagements with both need either two links or a
  Checkout Session route.

**Defers**

- Stripe webhooks for real-time payment success and failure notifications. Today the
  signature notification (`api/notify.js`) fires on signature, not on payment, so a
  client who signs and does not pay looks identical to one who paid until someone checks
  Stripe.

**Assumes**

- Proposals stay single-tier at the point of payment. If a proposal ever needs the
  client to pick a tier at checkout, revisit the Checkout Session option.

**Exceptions that remain valid.** Use a hosted invoice instead when the client has
explicitly asked to pay by invoice, when terms are net-N rather than due on receipt, or
when the payer needs a reviewable invoice document for their own bookkeeping or AP
process. State the reason in the client's `notes.md` so the exception is legible later.

## Related ADRs

- None yet. First ADR in this repo.

## References

- Live example: `clients/rc-all-exteriors/index.html`, `STRIPE_LINK` constant.
  Product `prod_VGzVyN13qI6FuC`, price `price_1UGRWTCsRrvmli7rvu6fMrii`,
  payment link `plink_1UGRWbCsRrvmli7rS46FfASr`.
- Prior pattern: `clients/home-source/index.html`, hosted invoice URL from invoice
  `in_1TwC7LCsRrvmli7r96pk67iq`, subscription `sub_1TwCCqCsRrvmli7rLJ2FA3K0`.
- Stripe MCP does not expose subscription create, invoice update, or invoice send. Fall
  back to curl with `STRIPE_API_KEY` from `.env`. Payment link create works over the API
  directly.
- `CLAUDE.md` in this repo, "Proposal structure", step 7, signature and next steps.
