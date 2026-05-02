# PDi (Prime Datalytics) — Ideal Customer Profile

**Prepared by:** Powered By Surge
**Last updated:** May 1, 2026
**Source material:** AiTD Features and Benefits deck, Platform Demo Summary, AI/ML FAQ (March 2026), April 17 discovery call with Sean Lundy

---

## 1. Company & Product Overview

**Company:** Prime Datalytics (PDi)
**Website:** pdistack.com
**Product:** AiTD (AI Trading Desk), Powered by Primer™
**Category:** Meta-DSP / unified programmatic trading platform
**Positioning statement:** "We turn fragmented DSP optimization into a unified, cross-channel intelligence engine."
**Tagline:** Plan smarter, activate faster, and scale effortlessly.

**What it actually is:** AiTD is a unified intelligence and execution layer that sits on top of single, siloed DSPs (Google DV360, The Trade Desk, Yahoo DSP). It eliminates the friction of jumping between buying platforms, housing planning, activation, and optimization in one ecosystem. It uses global-first API calls with full read and write access to give advertisers full control over campaign creation, execution, and optimization across all connected DSPs from one workflow.

**Core differentiators:**
- Cross-DSP optimization (NoraAI Autopilot performs "macro" optimizations across DSPs while DSPs handle "micro" optimizations within their own ecosystem)
- Multi-KPI optimization that single DSPs cannot do (balance primary, secondary, and tertiary KPIs simultaneously)
- Granular role-based access with margin masking (Super Admin, Agency Admin, Campaign Manager, Read Only)
- Built-in agency margin controls baked into reporting at the advertiser level
- Local sandbox staging environment for testing before pushing changes live to DSPs
- Closed-loop NoraAI Assistant for performance summaries (data does not leave to OpenAI)
- "Data-yesterday" reporting philosophy: pulls, cleans, and stores data locally early each morning so reporting is instant
- CM360 ad server integration for holistic reach/frequency and cross-DSP attribution

---

## 2. Primary Audiences (Personas)

PDi sells to programmatic agencies and the technical teams inside them. Three primary personas, in priority order:

### Persona 1: Agency Programmatic Lead / Director of Programmatic
**The decision maker.** Runs the trading desk at a mid-to-large independent agency or holding company subsidiary. Title variants: Director of Programmatic, VP of Programmatic, Head of Trading, Director of Performance Media, Head of Media Operations.

- **Pain:** Their team is wasting hours every day logging into 3-4 DSP portals, fighting 2FA, pulling fragmented reports, and stitching performance data together in spreadsheets. They cannot prove holistic value to clients because every DSP optimizes in a silo. They worry about junior trader mistakes (typos that cause overspends) and about clients seeing internal margin.
- **What they care about:** Trader efficiency, margin protection, agency profitability, holistic performance reporting, audit-proof optimization logs, defensible AI guardrails.
- **What they search:** "best meta DSP," "DSP management platform," "cross-DSP optimization," "trade desk vs DV360 vs yahoo," "how to manage multiple DSPs," "DSP comparison 2026," "agency programmatic stack," "DSP reporting tools."
- **Buying authority:** Decision maker or strong influencer. Sponsors the eval, runs the demo, defends the business case to the CMO/owner.

### Persona 2: Agency Owner / Operator (CEO, Founder, Managing Partner)
**The economic buyer.** Runs an independent agency that does programmatic media buying as a service. Sean's team described their owner as "very invested," "logical," "the kind of person you can't sell to without showing the value."

- **Pain:** Margin compression in agency programmatic. Holding co's are eating share. Clients are getting smarter about DSP fees. Hard to defend mark-up to clients. Hard to scale ops without hiring more traders. AI-anxiety: knows AI is the future but doesn't trust black-box solutions.
- **What they care about:** Agency profitability, scalability without headcount, defensible competitive moat, AI without losing human control, margin transparency to clients (without exposing internal agency margin).
- **What they search:** "how agencies can compete with holding companies," "AI in programmatic advertising," "agency profitability programmatic," "DSP markup transparency," "is the trade desk worth it for agencies," "DSP fees comparison."
- **Buying authority:** Final approver. Signs the contract.

### Persona 3: Senior Programmatic Trader / Campaign Manager
**The end user and internal champion.** The person who actually logs into AiTD every day. Titles: Senior Programmatic Trader, Programmatic Campaign Manager, Senior Media Buyer (Programmatic).

- **Pain:** Logs into 3-4 DSPs daily. Hates pulling DV360 reports that take hours. Has been burned by setting up campaigns wrong and getting blamed for overspends. Resents being asked to manually compare DSP performance for client QBRs. Skeptical of AI tools that promise to replace their judgment.
- **What they care about:** Speed of getting work done, accuracy/safety guardrails, transparency in what AI changed and why, ability to override AI decisions, customizable dashboards that remember their preferences.
- **What they search:** "DV360 alternatives," "trade desk vs DV360," "cross-DSP attribution," "programmatic optimization tools," "yahoo DSP review," "CM360 floodlight setup," "DSP reporting automation."
- **Buying authority:** Internal champion / influencer. Pushes the eval up the chain.

### Secondary buyer: In-house programmatic teams at brands
Mid-to-large brands that have brought programmatic in-house and run their own DV360 + TTD seats. Smaller TAM than the agency segment, but high-value. Same pains, different org structure (no margin question, but same workflow pain and same need for cross-DSP optimization).

---

## 3. Industries & Verticals

**Primary:** Independent and mid-sized programmatic agencies, performance marketing agencies, full-service agencies with in-house programmatic capabilities, agency holding company subsidiaries.

**Secondary:** Brand-direct programmatic teams (in-housed media), trading desks at retail/CPG/finance/auto/B2B SaaS brands.

**Out of scope:** Small social-only agencies (Meta/Google search shops), creative-only agencies without programmatic capability, brand teams without DSP seats.

---

## 4. Firmographics

- **Company size:** Agencies with 10-500 employees. Sweet spot is 25-150 employee agencies running $5M-$100M in annual programmatic media spend across multiple DSPs.
- **Geography:** US and Canada primary. UK and Australia secondary (English-speaking, mature programmatic markets, similar DSP landscape).
- **Tech stack signals:** Already have seats on at least two of: Google DV360, The Trade Desk, Yahoo DSP. Likely use CM360 or Sizmek as ad server. May use Looker Studio, Tableau, or similar for client reporting.
- **Spend signals:** $250K+ minimum monthly programmatic spend across DSPs (below this the platform overhead doesn't pencil out).

---

## 5. Pain Points (in PDi's words and ours)

The pain that drives a buyer to evaluate AiTD, ranked roughly in order of frequency:

1. **DSP fatigue:** Traders waste hours every day juggling logins, 2FA, fragmented invoicing, and unique workflows for each DSP.
2. **Reporting lag and fragmentation:** Pulling reports from multiple DSPs takes hours. Merging them into a single view is manual. Clients want unified reach/frequency and cross-DSP attribution that DSPs cannot provide on their own.
3. **Siloed optimization:** Each DSP optimizes in a vacuum. No platform sees the whole picture. Agencies cannot move budget in real time to whichever DSP is winning the yield race.
4. **Margin protection:** Agencies need to mark up DSP costs to clients without exposing the markup to traders or to the client. Most DSPs don't support this natively.
5. **Trader error risk:** A typo can cause a six-figure overspend. No safety net in standard DSPs.
6. **AI anxiety:** Agencies want AI-driven optimization but don't trust black-box autopilot tools that might shift Spanish-language budget to English audiences or violate brand guardrails.
7. **Onboarding friction:** Standing up new advertisers, adjusting margins, granting client access — all of this is slow and clunky in standalone DSPs.
8. **Client transparency:** Agencies need read-only client views that show pacing and performance without giving clients the ability to break things.

---

## 6. Search Intent Themes

This is the highest-priority section for the SEO tool. PDi's buyers search across four intent buckets:

### A. Category creation & education ("What is a Meta-DSP?")
Top-of-funnel content that defines the category and positions PDi as the authority. The term "Meta-DSP" is not yet saturated, so first-mover content advantage is real.

- "what is a meta DSP"
- "what is a unified DSP"
- "cross-DSP optimization explained"
- "AI in programmatic advertising"
- "machine learning in programmatic"
- "programmatic trading desk vs DSP"
- "how does a trading desk work"
- "in-housing programmatic"

### B. DSP comparison ("DV360 vs Trade Desk vs Yahoo")
Mid-funnel comparison content. High commercial intent. Buyers in active eval mode.

- "DV360 vs The Trade Desk"
- "Trade Desk vs Yahoo DSP"
- "DV360 vs Yahoo DSP"
- "best DSP for agencies"
- "best DSP for video advertising"
- "DSP comparison 2026"
- "DV360 alternatives"
- "Trade Desk alternatives"
- "DSP fees comparison"
- "DSPs ranked"

### C. Pain-point and how-to ("How do I do X across multiple DSPs?")
Bottom-of-funnel problem-aware searches. The reader has the pain and is hunting for a solution.

- "how to manage multiple DSPs"
- "cross-DSP attribution"
- "cross-DSP audience management"
- "cross-DSP reporting"
- "DSP reporting automation"
- "how to A/B test DSPs"
- "how to optimize across DSPs"
- "DSP margin management for agencies"
- "agency markup DSP"
- "CM360 floodlight setup"
- "how to hide agency margin from client"
- "deduplicated cross-DSP attribution"
- "DSP overspend prevention"

### D. Competitor/alternative ("Alternative to [established platform]")
The directly-bought commercial intent layer. Buyers who already know they want a Meta-DSP and are comparing vendors. Likely competitors to PDi in this space include Skai, Mediaocean (Flashtalking), StackAdapt, Basis (Centro), Adform, Smadex, and MediaMath.

- "Skai alternatives"
- "Mediaocean alternatives"
- "StackAdapt alternatives"
- "Basis alternatives"
- "best meta DSP"
- "best cross-DSP optimization platform"
- "[competitor name] vs PDi"
- "[competitor name] review"
- "[competitor name] pricing"

---

## 7. Brand Voice & Tone

Pulled from the AiTD decks and the AI/ML FAQ:

- **Confident but not arrogant.** "We turn fragmented DSP optimization into a unified, cross-channel intelligence engine." Direct, declarative, doesn't hedge.
- **Technical but accessible.** Comfortable with terms like floodlight, CM360, IO, line item, but always explains why a feature matters in business terms ("Reason to believe…").
- **Anti-black-box.** Heavily emphasizes transparency, guardrails, human control, and rationale-backed AI decisions. The brand actively distances itself from "set it and forget it" AI.
- **Pro-trader.** Always positions AI as augmenting the trader, never replacing them. "Human Intent + Machine Speed."
- **Plain-spoken on differentiation.** Not afraid to call out competitors' weaknesses in measured language ("siloed platforms yield vague observations," "single DSPs crash or lag when querying real-time intraday data").

**Voice attributes to mirror in content:**
- Use real ad-tech vocabulary; do not dumb it down for a generalist audience. The reader is technical.
- Always pair a feature with a "reason to believe" — concrete benefit or business outcome.
- Avoid hype words ("revolutionary," "game-changing," "best-in-class"). The existing collateral uses "revolutionary" once but the broader voice is restrained and specific.
- Use comparison framing whenever possible ("Single, Siloed DSPs vs Our Unified Platform"). It's how the brand thinks.
- Lean into transparency and control language. These are the brand's North Stars.

---

## 8. Brand & Visual Identity

Pulled from the AiTD deck design system:

- **Primary background:** Deep black (`#000000` / near-black)
- **Primary accent:** Vibrant green (`#39FF14` / lime green family)
- **Highlight/secondary accent:** Teal/cyan in UI ("Sign In" buttons, status pills)
- **Typography:** Sans-serif, weighty for headlines (looks like Inter Bold or similar geometric sans), regular weight for body
- **Visual style:** Minimal, dark mode, grid-based, lots of negative space, isolated UI screenshots on solid black with subtle green grid backgrounds
- **Imagery:** Black and white photography of professionals at work (analysts, traders, knowledge workers)

---

## 9. Competitors (for content benchmarking)

Direct meta-DSP / cross-DSP optimization competitors:
- Skai (formerly Kenshoo)
- Mediaocean (parent of Flashtalking)
- StackAdapt
- Basis Technologies (formerly Centro)
- Adform
- MediaMath (rebuilt under Infillion)

Adjacent (DSPs themselves and tooling):
- Google DV360 (also a partner platform — careful framing required)
- The Trade Desk (also a partner platform)
- Yahoo DSP (also a partner platform)
- Amazon DSP

Tangential / non-direct but appears in buyer research:
- Innovid (CTV-focused)
- Smadex (mobile-focused)
- AdRoll (SMB, not direct competition)

**Important:** PDi's positioning should be careful here. DV360, TTD, and Yahoo are *also* partners (the underlying DSPs that AiTD optimizes across). Comparison content should frame AiTD as "powered by + on top of" these DSPs, not as a replacement. Saying "DV360 vs PDi" is misleading and bad positioning. The right framing is: "Should you use DV360 alone, or DV360 + TTD + Yahoo together via a Meta-DSP?"

---

## 10. Content Angles & Topic Pillars

Six pillar topics the SEO tool should build keyword clusters around:

1. **Meta-DSP & cross-DSP optimization** (category creation, owns the term)
2. **DSP comparisons** (DV360, TTD, Yahoo head-to-heads — high-intent comparison content)
3. **AI/ML in programmatic** (educational and trust-building, positions NoraAI as defensible)
4. **Agency profitability & margin management** (speaks directly to the economic buyer)
5. **Programmatic workflow & operational efficiency** (speaks to the trader persona)
6. **Cross-DSP attribution & reporting** (technical pillar that captures high-intent how-to searches)

---

## 11. Conversion Goals

What "ranking" needs to translate into:

- **Primary:** Demo request from agency programmatic leads ($250K+ monthly spend across 2+ DSPs)
- **Secondary:** Free platform tour / sign-up (the AiTD login screen mentions invitation-only access; flag for Sean whether to keep this gated or open up self-serve discovery)
- **Tertiary:** Newsletter / content subscription for nurture (worth setting up if they don't already have it)

---

## 12. Notes for the SEO Tool / Audit

- pdistack.com is built from scratch and connected to Webflow as the CMS
- Hosting currently on Webflow (estimated $20-40/mo)
- We need to verify that GA4 is installed and tracking properly — this is a known open item from the discovery call
- Confirm whether they have any product analytics (Mixpanel, Amplitude, PostHog) tracking demo requests
- Check for existing schema markup, sitemap, robots.txt, Core Web Vitals
- Check for existing blog / content footprint — if none, that is the biggest greenfield opportunity
- AiTD product pages are gated (login screen). Confirm whether there is any indexable product content beyond the marketing site

---

## 13. Open Questions for Sean (to confirm before content kickoff)

1. Is the buyer primarily agencies, in-house brand teams, or both? (We've assumed agencies — confirm.)
2. Are there named target accounts or a tier-1 prospect list we should be writing toward?
3. What does the current sales pipeline look like — inbound demo requests per month?
4. Are there any topics/competitors we should explicitly avoid mentioning in published content?
5. Confirm full competitor list — anyone we missed in section 9?
6. Confirm preferred CTAs — "Request a demo," "See a live walkthrough," "Get access"?
