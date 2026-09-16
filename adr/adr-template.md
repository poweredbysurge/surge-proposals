# ADR-NNN: [Short decision title]

**Status:** Proposed | Accepted | Superseded by ADR-XXX | Deprecated
**Date:** YYYY-MM-DD
**Decider:** Sam Delgado (+ others if relevant)
**Implementation status:** Not yet wired | In progress | Wired and live | Deprecated
**Scope:** All proposals | Specific client (name it) | Repo infrastructure

## Context

What is the situation that requires a decision? What constraints, requirements, or
prior decisions inform this? Be brief but complete enough that a future reader can
understand the world at the time of the decision without external context.

## Decision

What we decided to do. State the chosen option clearly, in one or two sentences.

## Options considered

- **Option A**, what it is, pros/cons, why not chosen (or why chosen)
- **Option B**, same
- **Option C**, same

## Consequences

- What this enables (positive)
- What this constrains (negative)
- What this defers (future work)
- What this assumes that could later become false

## Related ADRs

- Supersedes / superseded by: ADR-XXX
- Related: ADR-YYY

## References

- Link to the client proposal or file this came out of
- Link to external docs (vendor APIs, etc.)
- Link to discussion thread / call notes if relevant

---

## Field reference

**Implementation status** captures whether the decision is reflected in shipped work yet.
ADRs are often written before implementation begins, which is the point: lock the
reasoning before the code accumulates.

- **Not yet wired**: decision accepted, nothing built against it yet
- **In progress**: being built against now
- **Wired and live**: reflected in a deployed proposal
- **Deprecated**: no longer applies (write a successor ADR rather than editing this one)

**Scope** clarifies how broadly the decision applies.

- **All proposals**: the default for every new proposal built in this repo
- **Specific client**: a deliberate exception for one engagement, with the reason stated
- **Repo infrastructure**: build, routing, API, or deploy mechanics rather than proposal content
