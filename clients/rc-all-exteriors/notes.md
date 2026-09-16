# RC All Exteriors LLC — Discovery Notes

Prepared: 2026-09-16
Proposal: proposals.thesurgeagency.com/rc-all-exteriors
Brand: The Surge Agency (home services division)

## Client

| | |
|---|---|
| Legal name | RC All Exteriors LLC |
| Contact | Ricardo Castro, Owner |
| Address | 12325 Woodlawn Ct, Woodbridge, VA 22193 |
| Phone | 703-677-1976 |
| Email | Info@rcallexteriors.com |
| Website | https://rcallexteriors.com/ |
| Instagram | @rcallexteriors |
| Market | Prince William County / Northern Virginia / DMV |

## Credentials (verified 2026-09-16)

- Virginia DPOR Class A contractor license 2705196138, expires 6/30/2027
- BBB accredited 11/25/2025, rating A-
- Google: 5.0 stars across 48 reviews (Trustindex widget on site)

## Services offered

Roof replacement (residential and commercial), roof and siding repairs, gutters, siding,
windows and doors, storm damage inspections, insurance claim assistance.

## Site audit (verified 2026-09-16)

- WordPress + Elementor 4.2.4
- 9 pages total, confirmed via `wp-sitemap-posts-page-1.xml`:
  home, about, services, contact, projects, roof-replacement, roof-siding-repairs,
  gutters-siding, windows-doors
- No blog (no `wp-sitemap-posts-post-*.xml` sub-sitemap exists)
- No city or location pages
- No `sitemap_index.xml`, so no Yoast or RankMath. Running WordPress core sitemaps only.
- Title tag template is `%page% - Your trusted partner in exteriors`. Homepage title is
  just "Your trusted partner in exteriors": no service keyword, no geography.
- No manufacturer certification displayed (no GAF, Owens Corning, or CertainTeed)
- No financing offer presented
- No workmanship warranty terms stated
- 48 five-star reviews are present but not used as a conversion asset

## Paid channels

From outside inspection: no visible LSA presence, no Google Ads, no paid social.
Confirm on the launch call before treating as fact.

## Offer as proposed

| Item | Terms |
|---|---|
| Launch tier | $3,000/mo, billed monthly from signup date |
| Website build | Included, $0 (full retail $12,000 one-time) |
| Ad spend | Separate, paid by client directly to Google and Meta. Recommended floor $100/day |
| Term | Month to month, 30 days notice |
| Timeline | 30 to 45 days to full launch |

Scope: Google LSA, Google Ads, Meta ads, ad spend management, new website with SEO,
local SEO (GBP, city pages, citations, review engine, content), call/form/conversion
tracking, monthly reporting and strategy call.

## Stripe (live mode)

| Object | ID |
|---|---|
| Product | `prod_VGzVyN13qI6FuC` ("RC All Exteriors - Launch Tier") |
| Price | `price_1UGRWTCsRrvmli7rvu6fMrii` ($3,000/mo recurring USD) |
| Payment Link | `plink_1UGRWbCsRrvmli7rS46FfASr` |

The Payment Link creates the subscription at checkout, so nothing bills the client until
they enter a card. This differs from HomeSource, which used a hosted invoice URL with
`send_invoice` collection. No customer object pre-created; Stripe creates it at checkout.

Internal review notes for this engagement live in
`workspace/clients/rc-all-exteriors/internal-notes.md`, not in this repo.
