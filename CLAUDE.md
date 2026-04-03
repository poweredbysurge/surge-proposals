# Surge Proposals — Project Intelligence

## Who we are
Surge is a creative agency (and separately, a home services marketing agency).
This project handles CLIENT-FACING PROPOSALS only.

## Two proposal modes — always confirm before generating
- **Creative agency**: web design, branding, SEO, redesigns. Brand voice: premium, strategic, direct.
- **Home services marketing**: Meta Ads, PPC, AI automation, speed-to-lead. Brand voice: results-driven, urgent, ROI-focused.
Today's proposals are for: CREATIVE AGENCY unless instructed otherwise.

## Brand tokens
- Background: #080808
- Accent: #dee535 (primary) / #b8be2a (hover)
- Text: #ffffff primary, #9ca3af secondary
- Fonts: "Bebas Neue" (display/headings), "Manrope" (body)
- Load from Google Fonts: Bebas Neue 400, Manrope 400/500/600
- Border radius: 8px standard, 16px cards

## Proposal structure (creative agency)
Every proposal HTML file must include these sections in order:
1. Hero — client name, project title, prepared by Surge, date
2. The opportunity — 2-3 sentences on what we see for their business
3. Scope of work — itemized deliverables with descriptions
4. Timeline — visual phase breakdown
5. Investment — pricing table with options/tiers if applicable
6. Why Surge — 3 proof points, no fluff
7. Signature + next steps — typed name field, date, "Let's go" CTA → Stripe payment link

## Output rules
- Single self-contained HTML file. Tailwind CDN via jsDelivr. No build step.
- Mobile-first. Test at 390px width mentally before finalizing.
- Dark background (#080808) always. Accent (#dee535) for CTAs, highlights, active states.
- Scroll-driven sections. Smooth scroll. Subtle entrance animations (Intersection Observer).
- Signature section: name input + date input + submit button. On submit: POST to a Netlify function or mailto fallback until backend exists.
- Payment button: Stripe payment link (Sam provides per proposal). Opens in new tab.
- DO NOT use placeholder lorem ipsum. Use real context from notes.md.

## File naming
clients/[kebab-case-client-name]/
  notes.md       ← discovery notes go here before generating
  index.html     ← generated output (must be index.html, not proposal.html)

## Deploy
Vercel. Each proposal gets a unique path: proposals.thesurgeagency.com/[client-name]
Run: vercel --prod from the surge-proposals root, NOT the client folder (api/ must be at root).

## Environment variables (set in Vercel dashboard + .env locally)
- STRIPE_API_KEY — Stripe secret key (sk_live_...)
- RESEND_API_KEY — Resend API key for proposal approval emails

## Proposal approval notifications
When a client signs the proposal, the form POSTs to /api/notify (api/notify.js).
This fires a formatted email to sam@thesurgeagency.com and mario@thesurgeagency.com.
Sent from: proposals@updates.thesurgeagency.com
No email is sent to the client — they only interact via the proposal page.
RESEND_API_KEY must be set in Vercel environment variables or emails will silently fail.

## How to generate a new proposal
1. Sam provides: client name, proposal type (creative/home services), any notes
2. Read clients/[name]/notes.md if it exists
3. Ask for any missing critical info: budget range, timeline, key pain points
4. Generate proposal.html using the creative-agency template as base
5. Confirm scope and pricing with Sam before finalizing
6. Output the file path and remind Sam to add the Stripe payment link