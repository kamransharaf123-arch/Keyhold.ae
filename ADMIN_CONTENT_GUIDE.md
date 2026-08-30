# KeyHold Website Studio — owner workflow

After Module 6.1 is integrated and migration 000002 applied, the owner should be able to use:

`/admin/website`

## Everyday tasks
- Change Home hero: Website Studio -> Pages & Sections -> Home.
- Replace Home/page image: choose file directly or use Media Library.
- Reorder Home sections: edit section Order.
- Hide a section: uncheck Enabled.
- Change header/footer labels: Navigation + Global & Brand.
- Add team member: Team.
- Add testimonial: Testimonials. Publish only genuine testimonials.
- Edit form wording: Forms.
- Change warm-luxury colors: Global & Brand -> Theme. Use sparingly and review contrast warning.
- Add French copy: use the Français panel inside the normal content editor. Advanced fallback lives in Website Studio -> Translations.

## Language behavior
English is canonical. French pages live under `/fr`.
If a French field is empty, the English value is shown. This is intentional so a partially translated page never becomes blank.

## Publishing
1. Edit content.
2. Save English/French records as Draft while reviewing.
3. Preview.
4. Mark intended content/translation Published.
5. Click Publish Site.
6. Netlify rebuilds the static snapshot.

Do not set `CMS_REQUIRED=true` until the real public content inventory is complete and verified.
