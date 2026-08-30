# KeyHold CMS setup

1. Create a dedicated Supabase project for KeyHold.
2. Run `supabase/migrations/20260830_000001_keyhold_admin_cms.sql` in the SQL editor or with the Supabase CLI.
3. In Authentication, create the first admin user with their real email and a strong password.
4. Grant the account access by running:

```sql
insert into public.admin_profiles (user_id, role, is_active)
select id, 'owner', true
from auth.users
where lower(email) = lower('YOUR_EMAIL_HERE')
on conflict (user_id) do update set role = 'owner', is_active = true;
```

5. Add the environment variables documented in `.env.example.module6` to local development and Netlify.
6. Create a Netlify Build Hook for the production branch and store it as `NETLIFY_BUILD_HOOK_URL`.
7. Keep `CMS_REQUIRED=false` until the CMS contains valid published developers, areas and projects. Once the migration from demo data is complete, set `CMS_REQUIRED=true` on production so a failed CMS sync fails the build instead of silently serving fallback data.
8. Sign in at `/admin/login`.

## Security model

- Supabase Auth owns admin credentials.
- The browser never receives `SUPABASE_SERVICE_ROLE_KEY`.
- Admin Server Actions call Supabase from the server after `requireAdmin()` succeeds.
- RLS remains enabled as defence in depth.
- Public media is stored in `keyhold-media`.
- Public downloadable documents use `keyhold-public-documents`.
- Request-only/private files use `keyhold-private-documents`.
- Admin mutations are written to `cms_audit_log`.

## Publishing model

The existing KeyHold site stays static-first for speed and SEO.

`CMS -> Publish record -> Publish site -> Netlify build -> prebuild CMS sync -> static snapshot -> production`

This intentionally preserves static project pages while making content editable without touching GitHub.
