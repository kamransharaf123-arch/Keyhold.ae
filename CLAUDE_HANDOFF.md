# CLAUDE HANDOFF — KEYHOLD MODULE 1

You are receiving the complete Module 1 codebase for **KeyHold.ae**.

## Your job

1. Open this repository as-is.
2. Do **not** rewrite it from scratch.
3. Run:
   - `npm install`
   - `npm run verify:source`
   - `npm run typecheck`
   - `npm run build`
4. Fix only genuine build/type issues if your environment exposes one.
5. Preserve the product architecture and visual direction below.
6. Commit the clean, buildable repository to GitHub so it can be connected to Netlify.

## Non-negotiable navigation

Desktop header, visually centered:

`Home | Projects ▾ | Updates | Insights | Services | Who We Are`

Projects dropdown:

- Off-Plan
- Ready
- Short-Term Rentals
- Long-Term Rentals

Logo remains left. A restrained `Speak to an Advisor` CTA may remain right. Mobile navigation must include every route.

## Brand direction

KeyHold must feel like a premium real-estate advisory / private investment house, not a generic property template.

Palette:

- `#F7F4EE` bone
- `#171717` graphite
- `#222222` charcoal
- `#B79A6B` matte champagne
- `#8B8984` stone
- `#ECE8E1` warm grey
- `#FCFBF8` soft white

Rules:

- abundant whitespace
- editorial typography
- large architectural imagery
- subtle micro-animation only
- no bright gold
- no gradients that look like crypto/fintech marketing
- no glassmorphism overload
- no excessive rounded cards
- no fake awards, reviews, transactions or corporate statistics

## Footer requirements

Preserve the large 4-column information architecture:

1. Projects & Properties
2. Guides & Insights
3. Services
4. Who We Are

Then preserve the corporate section with KeyHold identity, company/location, contact and legal links.

RERA ORN and Trade Licence only render when real values are provided in `data/site.ts`. Never invent them.

## Module 1 scope

Must include and keep functioning:

- `/`
- `/projects`
- `/projects/off-plan`
- `/projects/ready`
- `/projects/short-term-rentals`
- `/projects/long-term-rentals`
- `/updates`
- `/insights`
- `/services`
- `/who-we-are`
- `/developers`
- `/areas`
- `/contact`
- `/privacy`
- `/terms`
- `/cookies`
- sitemap
- robots
- manifest
- custom 404

## Data rule

`data/site.ts` contains demo inventory for visual development only.

Do not transform demo data into claims that look verified. Future modules will replace this data source with the actual property/project backend.

## Architecture rule

Keep public display components independent from the future data source. Pages should consume typed data objects rather than hard-code database logic inside visual components.

This is important because later modules will add:

- Sanity / property content management
- Supabase / accounts and platform data
- ROI simulator
- investment scoring
- project comparison
- construction tracking
- portfolio dashboard
- owner portal
- CRM

## Acceptance checklist

Before saying Module 1 is ready:

- [ ] `npm run verify:source` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] No missing internal routes
- [ ] No console errors on Home
- [ ] No console errors on Projects
- [ ] No console errors on mobile navigation
- [ ] Header order is exact
- [ ] Projects dropdown contains exactly the four requested categories
- [ ] Footer works on mobile and desktop
- [ ] No horizontal overflow at 320px
- [ ] Reduced-motion preference is respected
- [ ] All links have visible keyboard focus
- [ ] No fake company registration data
- [ ] No fake live inventory claims
- [ ] `keyhold.ae` remains the metadata base
- [ ] Netlify production build succeeds

Do not start Module 2 until Module 1 passes every item above.
