# Architecture Decision Records

Chronological log of meaningful decisions about how proposals in this repo are built,
wired, and deployed. Each ADR captures the context, the decision, the options considered,
and the consequences, so the *why* survives alongside the *what*.

When a decision worth remembering gets made, write the ADR the same day. Don't batch them.

## Scope of this folder

Decisions that govern how proposals are built here: payment mechanics, page structure,
routing and deploy conventions, notification wiring.

Decisions that belong elsewhere:

- Cross-repo or business decisions (pricing tiers, vendor selection, engagement
  structure) go in `workspace/operations/decisions/`.
- Decisions scoped to one client engagement (which CRM, which ad channels, why a term
  was waived) go in `workspace/clients/[name]/decisions/`.

## Rules

- Naming: `ADR-NNN-short-kebab-title.md`, sequential, never reused. An ADR keeps its
  number forever, including after it is superseded or deprecated.
- ADRs are immutable after acceptance. If a decision changes, write a new ADR that says
  "Supersedes ADR-XXX" and mark the old one Superseded. Don't edit history.
- Write for an absent reader. Give enough context that someone outside the conversation
  can follow the decision without asking anyone.
- Start from `adr-template.md`.

## Status legend

- **Accepted**, decision is locked, may or may not be built against yet (see
  Implementation status on each ADR)
- **Proposed**, under discussion, not yet acted on
- **Superseded**, replaced by a later ADR
- **Deprecated**, no longer applies

## Index

| # | Title | Status | Implementation | Date |
|---|---|---|---|---|
| 001 | [Stripe Payment Links, not hosted invoices, as the default payment mechanism on proposals](ADR-001-stripe-payment-links-for-proposals.md) | Accepted | Wired and live | 2026-09-16 |
