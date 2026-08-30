# Module 6 Production Checklist

Before switching KeyHold from demo fallback to the real CMS:

1. Create a dedicated Supabase project.
2. Apply `supabase/migrations/20260830_000001_keyhold_admin_cms.sql` once.
3. Create the first owner in Supabase Authentication and grant the `owner` profile.
4. Add Netlify environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret, server only)
   - `NETLIFY_BUILD_HOOK_URL` (secret)
   - initially `CMS_REQUIRED=false`
5. Enter real company settings. Keep ORN/licence/address/reviews blank until verified.
6. Create/publish real developers and areas.
7. Create each real project and attach the correct developer/area.
8. Upload final licensed/authorised project photography and meaningful alt text.
9. Enter real payment plans and confirm Off-Plan totals equal 100%.
10. Import current unit availability from developer/seller stock lists. Re-verify dates regularly.
11. Upload floor plans and brochures with correct public/request-only classification.
12. Enter DLD/RERA/Trakheesi/Madmoun fields only from verified documents.
13. Enter investment assumptions with source/provenance. Do not convert demo placeholders to verified data without evidence.
14. Enter construction updates only from confirmed sources and dates.
15. Review the private draft preview before publication.
16. Publish records, trigger a Netlify preview/build and inspect the generated site.
17. Confirm no demo/placeholder content remains publicly visible.
18. Once the CMS is complete and stable, set `CMS_REQUIRED=true` in production.
19. Run a full production build and browser smoke test.
20. Keep the service-role key and Netlify hook secret out of Git, client components and screenshots.
