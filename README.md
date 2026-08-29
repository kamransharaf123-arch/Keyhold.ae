# KeyHold Module 1 — Brand & Public Website

This repository is the first production-oriented module for **keyhold.ae**. It establishes the public brand experience and navigation architecture before the property data, investment engine, client portal and CRM modules are connected.

## Included

- Premium responsive KeyHold design system
- Exact main navigation direction: Home, Projects, Updates, Insights, Services, Who We Are
- Projects submenu: Off-Plan, Ready, Short-Term Rentals, Long-Term Rentals
- Home page with premium hero, featured opportunities, project categories, construction updates, insights, services and conversion CTA
- Public Projects index and four category routes
- Construction Updates page
- Insights page
- Services page
- Who We Are page
- Developers and Dubai Areas foundation pages
- Contact page
- Large structured footer inspired by the reference pattern, but written and designed for KeyHold
- Privacy, Terms and Cookies baseline pages
- Sitemap, robots and web app manifest
- Mobile navigation
- Accessibility focus styles and reduced-motion support
- SEO metadata foundation
- Netlify build configuration
- Central content/config file in `data/site.ts`
- Zero mandatory external API keys for Module 1

## Important demo-data rule

The property names, prices, progress values and images in `data/site.ts` are **demo content only**. They exist to make the UI complete during development. Replace them with verified inventory before public launch.

Never invent or publish:

- RERA ORN numbers
- trade licence numbers
- DLD/RERA permit numbers
- project availability
- customer reviews
- transaction statistics
- developer verification badges
- staff names or phone numbers

The relevant company fields intentionally remain blank until real information is supplied.

## Local run

```bash
npm install
npm run verify:source
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:3000`.

## Netlify

Push the repository to GitHub and connect it to Netlify. `netlify.toml` uses `npm run build` and Node 22. Modern Netlify supports the Next.js App Router through its OpenNext integration without a custom adapter configuration.

## Future-module boundaries

Do **not** bolt fake implementations of the following into Module 1:

- live property inventory
- Sanity CMS
- Supabase user accounts
- CRM lead routing
- investment calculator
- investment score
- project comparison
- unit selector
- construction CMS
- client dashboard
- seller portal
- deal room

The components and routes in this repository are deliberately prepared so those modules can replace demo data later without redesigning the public site.

## Brand tokens

- Bone: `#F7F4EE`
- Graphite: `#171717`
- Charcoal: `#222222`
- Champagne: `#B79A6B`
- Stone: `#8B8984`
- Warm grey: `#ECE8E1`
- Soft white: `#FCFBF8`

Keep champagne restrained. The visual goal is quiet, editorial and architectural, not glossy black-and-gold luxury.
