# How you will use KeyHold Admin

After Module 6 is configured, normal content work should not require Claude or GitHub.

## Add a project

`/admin -> Projects -> Add project`

Enter the project identity, category, developer, area, price/rent, bedrooms, sizes, handover, description, amenities and structured discovery/regulatory/investment fields. Save it as a draft first.

## Add imagery

Open the project -> Media. Upload up to 30 images at once, choose the category and optionally set the first upload as the hero.

## Add or update units

Open the project -> Units. Existing units are directly editable for price, view, availability and verification date. You can add one unit manually or import/update a developer stock list with CSV. The unique key is project + unit number, so re-importing the same units updates them instead of creating duplicates.

## Add payment plan

Open the project -> Payment plan. Add/edit milestones. Off-Plan publication is blocked if an entered payment plan does not total 100%.

## Add floor plans / brochures

Use Floor Plans and Documents. Request-only files are stored privately and are not given a public URL.

## Construction update

`Admin -> Construction Updates`. Create or edit progress, display date, milestones, summary and image reference. Set status to published only after verification.

## KeyHold Intelligence

`Admin -> Intelligence -> Project`. Edit score inputs, risks, comparables, price history, supply pipeline, view intelligence and KeyHold Verdict. Maintain the source ledger. Do not mark the profile Verified without real evidence.

## Publish

Saving an item changes the CMS, not the live website immediately. When your batch is ready:

1. mark the relevant records Published;
2. use `Publish site` in the admin;
3. Netlify builds KeyHold;
4. the prebuild script creates the validated static CMS snapshot;
5. the new public site goes live.
