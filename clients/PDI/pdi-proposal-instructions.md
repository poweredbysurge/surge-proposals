# PDi Proposal — Generator Instructions

**Client:** Prime Datalytics (PDi)
**Slug:** `pdi`
**URL:** `proposals.thesurgeagency.com/pdi` (or Powered By Surge subdomain if preferred)
**Prepared for:** Sean Lundy, Head of Product
**Brand context:** This is a **Powered By Surge** engagement (parent creative agency, B2B SaaS / ad-tech client). Use Powered By Surge branding, not The Surge Agency.

---

## Title + Cover Block

**Title:** PDi × Powered By Surge: Proposal
**Hero headline:** MAKE THE WEBSITE MATCH THE PRODUCT.
**Hero sub:** A technical rebuild, SEO foundation, and ongoing content engine to make pdistack.com perform like the AiTD platform behind it.
**Prepared for:** Sean Lundy
**Date:** May 2026

---

## Section 02 · The Product Has Shipped. The Site Hasn't Caught Up.

**Section headline:** EIGHTEEN MONTHS OF PRODUCT EVOLUTION. ZERO SITE UPDATES.

**Lede paragraph:**
When we built pdistack.com, AiTD was a roadmap item. Today it is the product. NoraAI is in production. The trading desk hierarchy is live. The platform is integrated across DV360, The Trade Desk, and Yahoo DSP. The website is still talking about the old version of PDi.

**Three numbered points:**

**01 · The four products are invisible.**
Primer, AiTD, Data Lake, Planning, and Reporting are five distinct product surfaces. The site treats them as undifferentiated marketing pages, none deeper than 600 words. The /primer-aitd page (your primary revenue product) is 272 words. NoraAI Assistant and NoraAI Autopilot, the proprietary differentiators in your AI/ML FAQ, are not mentioned anywhere on pdistack.com.

**02 · The category-defining term lives in a blog post.**
"Meta-DSP" is the term that should anchor your homepage and product pages. Today it is defined in exactly one place: a single blog post buried two clicks deep. It does not appear on the homepage, the AiTD product page, or any service page. Buyers searching for "meta-DSP" or "cross-DSP optimization" cannot find you because you are not telling Google or LLMs that you own this category.

**03 · The technical foundation is undermining everything else.**
Even if the content were perfect, the underlying SEO configuration is leaking value. We ran a full audit on May 1. The findings are below.

---

## Section 03 · The Audit

**Section headline:** WE RAN A FULL AUDIT. THE SCORE IS 28 OUT OF 100.

**Lede paragraph:**
Twelve pages reviewed. Seven SEO categories scored. Twenty-seven specific findings catalogued, each with severity and confidence ratings. The full report is available on request. The headline number is below.

**Big visual element:** Score circle showing **28/100 — Poor**

**Score band note:** Score bands run 0–30 Poor | 31–55 Fair | 56–75 Good | 76–100 Strong.

**Category scorecard (table or grid layout):**

| Category | Weight | Score |
|---|---|---|
| Technical SEO | 25% | 30/100 |
| Content Quality | 20% | 30/100 |
| On-Page SEO | 15% | 30/100 |
| Schema / Structured Data | 15% | 15/100 |
| Performance / Core Web Vitals | 10% | 40/100 |
| Images | 10% | 29/100 |
| AI Search Readiness | 5% | 45/100 |

---

## Section 04 · Critical Findings

**Section headline:** THREE ISSUES ARE DOING THE MOST DAMAGE.

**Lede paragraph:**
The audit catalogued 27 findings. Most are configuration-level fixes that take hours, not weeks. Three findings sit in the critical category and are actively suppressing every other SEO investment you might make. They are below.

**Three numbered findings:**

**01 · Zero meta descriptions on 92% of pages.**
Eleven of twelve pages have no meta description tag. Google is writing its own snippets for the entire site except the homepage. Click-through rates from search results are suffering across every page that matters.

**02 · Zero canonical tags sitewide.**
Not a single page has a canonical tag. This creates unmitigated duplicate-content risk, especially for the blog. Webflow has a five-minute toggle that handles this. It has not been enabled.

**03 · Zero structured data anywhere.**
No Organization schema. No SoftwareApplication schema. No Article schema. Google cannot confirm brand identity, product category, or article authorship through the channels it expects. AI systems like ChatGPT and Perplexity cannot cite the site reliably for category queries because there is no structured data to anchor to.

**Below the three findings, smaller callout block:**

**A few more, for completeness:**
- About Us page lists CEO "John Doe," CTO "Jane Smith," CMO "Emily Johnson" as live team members
- /primer-aitd H1 reads "Programatic Advertising Industry" (typo, missing 'm')
- /blog/understanding-aitd H2 reads "the next evolution in digital adverting" (typo)
- All 226 images on the site have empty alt text
- Privacy Policy, Terms of Service, and Cookie Settings footer links go to `#` (no real pages exist)
- All three blog post title tags read "PDI Website" (CMS default never configured)

---

## Section 05 · What Good Looks Like

**Section headline:** FROM 28/100 TO 65/100 IN 90 DAYS.

**Lede paragraph:**
The audit identified 30 quick-win keywords where pdistack.com can realistically rank within 90 days. Each has a competition score of 35 or lower. The opportunity below shows what becomes possible once the foundation is fixed.

**Three columns:**

**Score Lift**
- Today: 28/100 (Poor)
- 90-day target: 55–65/100 (Fair to Good)
- 12-month target: 75+ (Strong)

**Indexed Footprint**
- Today: 12 pages, 3 blog posts
- 90-day target: 15 pages, 15 blog posts
- 12-month target: 22 pages, 36+ blog posts

**Top Keyword Opportunities**
- "programmatic advertising platforms" — 1,600 searches/mo, $117 CPC, competition 13
- "demand side platform providers" — 720 searches/mo, $42 CPC, competition 3
- "programmatic advertising agency" — 2,900 searches/mo, $85 CPC, competition 10
- "programmatic agencies" — 140 searches/mo, $198 CPC (highest in dataset)

**Sidebar callout — Category Creation Opportunity:**
Terms like "meta-DSP," "cross-DSP optimization," and "cross-DSP attribution" return near-zero search volume today. That is not a problem. It is an opportunity. PDi can publish authoritative content now and own the SERP before competitors define the language. First-mover advantage is real in under-defined categories.

---

## Section 06 · The Technical Foundation

**Section headline:** A NEW FOUNDATION. INCLUDED.

**Lede paragraph:**
The current site runs on Webflow. It works, but it costs you in flexibility, content scaling, and developer access. We are including a full rebuild on Next.js + Tailwind, deployed to Vercel, at no additional cost. The reasons matter for both sides.

**Two columns:**

**For PDi**
Your dev team can update the site through Claude Code, the same way they would any modern repo. Vercel hosting is faster and cheaper than Webflow. The site can scale to 100+ content pages without CMS limitations. The stack matches the technical credibility of your product.

**For Powered By Surge**
Eliminates Webflow workflow friction so we ship content and updates faster. Better margin on ongoing maintenance, which means more time invested in your content engine. One less platform fee to coordinate across teams.

**Stack callout box:**
**Built on:** Next.js + Tailwind CSS, deployed to Vercel, with content managed through Markdown or a headless CMS of your team's choice. Full repo handed over to PDi at launch. You own the code.

---

## Section 07 · What We're Delivering

**Section headline:** ONE ENGAGEMENT. THREE WORKSTREAMS.

**Lede paragraph:**
Month 1 is intentionally heavy: we rebuild the site, fix every critical and high-severity audit finding, and ship the first four blog posts. From Month 2 forward, the engine runs at a steady cadence: content, service pages, AEO, and reporting.

### Month 1 Deliverables

**01 · Site Rebuild on Vercel**
Full migration off Webflow. Brand system carried over and modernized. Page structure rebuilt around your actual product hierarchy. DNS cutover and redirects handled by us.

**02 · Critical Audit Fixes**
Every critical and high-severity finding from the audit. Real Privacy Policy and Terms pages. About Us rebuild with real team. H1 typos corrected. Meta descriptions written for every page. Canonical tags enabled. Title tags rewritten with keyword targeting. All 226 image alt tags written.

**03 · Schema Implementation**
Organization schema sitewide. SoftwareApplication schema on AiTD and Primer. BlogPosting schema across blog posts. BreadcrumbList sitewide. FAQPage schema where applicable.

**04 · Product Page Rebuilds**
The five product surfaces (Primer, AiTD, Data Lake, Planning, Reporting) expanded from current 239–587 word stubs to 700–1,000 word product pages with NoraAI, cross-DSP attribution, and CM360 integration featured prominently.

**05 · Four Blog Posts**
Foundational content shipped in Month 1. Topics drawn from highest-priority categories in the keyword research: what is programmatic advertising, what is a meta-DSP, demand side platform providers, and DV360 vs The Trade Desk vs Yahoo DSP comparison.

### Monthly From Month 2 Onward

**01 · Four Blog Posts Per Month**
Mix of pillar posts (1,800–2,500 words), comparison content (1,500–2,000 words), and trader pain-point how-tos (1,200–1,500 words). Every post includes FAQ sections, schema markup, and named author attribution. All written for both Google ranking and LLM citation.

**02 · One Service Page Per Month**
Built or refreshed from the five-cluster keyword strategy. Each targets a specific buyer persona and primary keyword: Meta-DSP core product page, agency persona page, programmatic media buying, cross-DSP reporting, DSP comparison. 600–1,000 words, keyword-optimized, internally linked to relevant blog content.

**03 · AI Engine Optimization (AEO)**
Reddit community seeding in r/programmaticadvertising, r/PPC, r/AdOps, r/AdTech. Backlink and citation work designed for ingestion by ChatGPT, Claude, and Perplexity. Strategic content structure built for LLM citation. PDi's buyers use these tools every day. Most agencies are not optimizing for this yet. You can.

**04 · Site Maintenance and Reporting**
Ongoing technical SEO maintenance. Monthly performance report covering rankings, organic traffic, demo requests, and AEO citations. Quarterly strategy review with Sean. Slack and email access to the Powered By Surge team throughout.

---

## Section 08 · Investment

**Section headline:** TRANSPARENT PRICING.

**Lede paragraph:**
Flat monthly retainer. No setup fee. No phase-gate billing. The Vercel rebuild, technical audit fixes, content engine, AEO work, and ongoing maintenance all roll into one monthly number. 120-day minimum commitment, then month-to-month.

**Pricing block (single tier — no retainer options like AccuEnviro had):**

**Monthly Retainer**

### Everything in Scope of Work

Site rebuild · Audit fixes · Schema · Product pages · 4 blog posts/mo · 1 service page/mo · AEO · Maintenance · Reporting

**$5,000 / month**

120-day minimum, month-to-month after.

**Total over the 120-day minimum: $20,000**

**Below the pricing block, smaller callout:**

**Why this number works:**

Comparable engagements typically split into a site rebuild project ($15,000–$25,000 one-time), an SEO retainer ($4,000–$8,000/month), and a separate content production line item ($2,000–$5,000/month). We bundle everything because we built your brand, our onboarding cost is zero, and our AI-native execution stack lets us ship at the pace of a 10-person agency with a two-person team.

---

## Section 09 · Why Powered By Surge

**Section headline:** THREE REASONS. NO FLUFF.

**01 · We built your brand.**
The original pdistack.com design, the brand system, the messaging architecture. We have your design files, we know your voice, we already understand your product. Day one is execution day. No 30-day discovery phase, no slide deck of generic positioning frameworks. We ship.

**02 · We are AI-native, end to end.**
Powered By Surge has rebuilt our delivery stack around AI-augmented workflows over the past 18 months. That's why we can deliver site rebuild + technical SEO + content engine + AEO at $5K/month with no setup fee. The same scope from a traditional agency runs $10K to $15K/month. We pass the efficiency through.

**03 · We do the technical work most agencies don't.**
This proposal includes a full Vercel rebuild, Schema markup implementation, Core Web Vitals work, and DNS migration. Most marketing agencies subcontract this kind of work or skip it entirely. We do it in house because that's where the SEO compounding actually happens.

---

## Section 10 · Next Steps

**Section headline:** LET'S GO.

**Lede:**
Sign below to approve this proposal. Once signed and the first month is paid, we schedule the kickoff call and begin Week 1 immediately.

### What happens after sign-off:

**Within 48 hours:** Kickoff call with Sean. We confirm the team info for the About Us rebuild, get access to Webflow + Google Search Console + GA4, and lock the Vercel rebuild timeline.

**Week 1:** Vercel rebuild begins. First content brief shared by end of week.

**Week 3:** First blog post live. Schema implementation complete.

**Week 4:** Vercel cutover. Site relaunched. Audit fixes shipped. Engine running.

---

## Signature + Payment Block

Standard generator block:
- Full Name field
- Company field
- Email field
- Date field
- **NO retainer tier dropdown** (this is a single-tier proposal, not multi-tier like AccuEnviro)
- Approve button
- Stripe payment link: $5,000 (first month)
- Note text: "Secure payment via Stripe. Work begins within 48 hours of payment confirmation."

---

## Generator Configuration Notes

**Section count:** 10 sections (cover + 9 numbered)
**Pricing structure:** Single-tier monthly retainer (NOT multi-tier like AccuEnviro). No "Foundation/Growth/Domination" tier cards.
**Stripe:** First payment is $5,000 for Month 1. Configure as monthly recurring or as a one-time charge with a separate subscription handoff (your call based on what's cleanest in your generator).
**Voice rules:**
- No em dashes anywhere (Sam's standing rule)
- Match AccuEnviro proposal voice: declarative, short paragraphs, no hype words
- Avoid "revolutionary," "game-changing," "best-in-class"
- Always pair feature claims with reasons-to-believe (concrete outcomes, real numbers)
**Brand:**
- Use Powered By Surge logo and branding (NOT The Surge Agency)
- If your generator has a brand toggle, use the parent agency variant
**Visual notes:**
- Score circle on Section 03 should be a strong visual moment (the 28/100 is the proposal's biggest punch)
- Category scorecard works as table or grid
- Keyword opportunity table in Section 05 should be readable, not buried in tiny type

**Source data references for the generator:**
- SEO audit data: pulled from `/mnt/user-data/uploads/PDI-SEO-REPORT.html`
- ICP and product info: pulled from `pdi-icp.md`
- Meeting context: April 17 Notion meeting page with Sean Lundy

**Send to:** Sean Lundy, Head of Product at PDi
