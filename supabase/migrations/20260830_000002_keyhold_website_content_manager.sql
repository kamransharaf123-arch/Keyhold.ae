-- KeyHold Module 6.1: Website Content Manager
-- Safe/idempotent migration. It does NOT delete existing Module 6 content.
-- Apply after 20260830_000001_keyhold_admin_cms.sql.

create table if not exists public.cms_website_settings (
  id uuid primary key default '00000000-0000-0000-0000-000000000061'::uuid,
  brand_name text not null default 'KeyHold',
  logo_text text not null default 'KEYHOLD',
  logo_url text,
  logo_mark_url text,
  logo_alt text not null default 'KeyHold',
  default_og_image_url text,
  projects_menu_label text not null default 'Projects',
  header_cta_label text not null default 'Speak to an Advisor',
  header_cta_href text not null default '/contact',
  footer_tagline text not null default 'Dubai real estate advisory presented with clarity, context and considered guidance.',
  footer_disclaimer text not null default 'Property information, pricing, availability, payment plans and completion dates are subject to confirmation by the relevant developer, owner or authorised seller. Any investment figures shown on KeyHold are estimates and do not constitute guaranteed returns.',
  copyright_text text not null default 'KeyHold. All rights reserved.',
  locations_label text not null default 'Dubai · UAE',
  global_cta jsonb not null default '{"eyebrow":"Private advisory","title":"Ready to explore Dubai property?","text":"Speak with KeyHold about your objectives, liquidity and preferred timeline.","primaryLabel":"Speak with an Advisor","primaryHref":"/contact","secondaryLabel":"Explore Projects","secondaryHref":"/projects","enabled":true}'::jsonb,
  announcement jsonb not null default '{"enabled":false,"text":"","href":""}'::jsonb,
  ui_copy jsonb not null default '{"common":{"viewProject":"View project","explore":"Explore","contact":"Contact"},"project":{"overview":"Overview","amenities":"Amenities","paymentPlan":"Payment plan","floorPlans":"Floor plans","units":"Unit selector","documents":"Project materials","intelligence":"KeyHold Intelligence","investment":"Investment Simulator","related":"Related projects","availabilityDisclaimer":"* Unit availability is subject to current developer/seller availability and confirmation and may change without prior notice."},"discovery":{},"forms":{}}'::jsonb,
  theme jsonb not null default '{"allowCustomTheme":false,"accent":"#497C78","accentDeep":"#35645F","positive":"#7F9275","premium":"#B99A68","warning":"#C78368","background":"#F7F4EE","surface":"#FCFBF8","text":"#1B1B1B"}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.cms_website_settings add column if not exists ui_copy jsonb not null default '{"common":{},"project":{},"discovery":{},"forms":{}}'::jsonb;

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique check (page_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  route text not null unique check (route = '/' or route ~ '^/[a-z0-9/_-]*$'),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  nav_title text not null,
  eyebrow text,
  hero_title text not null,
  hero_subtitle text,
  hero_image_url text,
  hero_image_alt text,
  hero_video_url text,
  primary_cta_label text,
  primary_cta_href text,
  secondary_cta_label text,
  secondary_cta_href text,
  seo_title text,
  seo_description text,
  og_image_url text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.cms_pages(id) on delete cascade,
  section_key text not null check (section_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  section_type text not null default 'content',
  enabled boolean not null default true,
  eyebrow text,
  title text,
  body text,
  image_url text,
  image_alt text,
  cta_label text,
  cta_href text,
  style_variant text not null default 'default',
  payload jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(page_id, section_key)
);
create index if not exists cms_page_sections_page_idx on public.cms_page_sections(page_id, sort_order);

create table if not exists public.cms_navigation_items (
  id uuid primary key default gen_random_uuid(),
  nav_group text not null check (nav_group in ('header-primary','projects-dropdown','footer-projects','footer-guides','footer-services','footer-company','legal','mobile-extra')),
  label text not null,
  href text not null,
  enabled boolean not null default true,
  external boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(nav_group, href)
);
create index if not exists cms_navigation_items_group_idx on public.cms_navigation_items(nav_group, sort_order);

create table if not exists public.cms_media_library (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  kind text not null default 'image' check (kind in ('image','video','logo','icon','document')),
  bucket text not null default 'keyhold-media' check (bucket in ('keyhold-media','keyhold-public-documents')),
  storage_path text not null unique,
  public_url text not null,
  alt_text text not null default '',
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cms_media_library_kind_idx on public.cms_media_library(kind, created_at desc);

create table if not exists public.cms_people (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  name text not null,
  role text not null,
  bio text not null default '',
  image_url text,
  email text,
  phone text,
  linkedin_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_testimonials (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  name text not null,
  descriptor text,
  quote text not null,
  image_url text,
  source_label text,
  source_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_faqs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  scope text not null default 'global',
  category text,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cms_faqs_scope_idx on public.cms_faqs(scope, sort_order);

-- updated_at triggers: explicitly idempotent to avoid the Module 6 retry issue.
drop trigger if exists cms_website_settings_touch on public.cms_website_settings;
create trigger cms_website_settings_touch before update on public.cms_website_settings for each row execute function public.keyhold_touch_updated_at();
drop trigger if exists cms_pages_touch on public.cms_pages;
create trigger cms_pages_touch before update on public.cms_pages for each row execute function public.keyhold_touch_updated_at();
drop trigger if exists cms_page_sections_touch on public.cms_page_sections;
create trigger cms_page_sections_touch before update on public.cms_page_sections for each row execute function public.keyhold_touch_updated_at();
drop trigger if exists cms_navigation_items_touch on public.cms_navigation_items;
create trigger cms_navigation_items_touch before update on public.cms_navigation_items for each row execute function public.keyhold_touch_updated_at();
drop trigger if exists cms_media_library_touch on public.cms_media_library;
create trigger cms_media_library_touch before update on public.cms_media_library for each row execute function public.keyhold_touch_updated_at();
drop trigger if exists cms_people_touch on public.cms_people;
create trigger cms_people_touch before update on public.cms_people for each row execute function public.keyhold_touch_updated_at();
drop trigger if exists cms_testimonials_touch on public.cms_testimonials;
create trigger cms_testimonials_touch before update on public.cms_testimonials for each row execute function public.keyhold_touch_updated_at();
drop trigger if exists cms_faqs_touch on public.cms_faqs;
create trigger cms_faqs_touch before update on public.cms_faqs for each row execute function public.keyhold_touch_updated_at();

alter table public.cms_website_settings enable row level security;
alter table public.cms_pages enable row level security;
alter table public.cms_page_sections enable row level security;
alter table public.cms_navigation_items enable row level security;
alter table public.cms_media_library enable row level security;
alter table public.cms_people enable row level security;
alter table public.cms_testimonials enable row level security;
alter table public.cms_faqs enable row level security;

-- Policies are also idempotent.
drop policy if exists "public website settings read" on public.cms_website_settings;
create policy "public website settings read" on public.cms_website_settings for select to anon, authenticated using (true);
drop policy if exists "admins website settings write" on public.cms_website_settings;
create policy "admins website settings write" on public.cms_website_settings for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

drop policy if exists "public pages read" on public.cms_pages;
create policy "public pages read" on public.cms_pages for select to anon, authenticated using (status = 'published' or public.keyhold_is_admin_or_viewer());
drop policy if exists "admins pages write" on public.cms_pages;
create policy "admins pages write" on public.cms_pages for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

drop policy if exists "public page sections read" on public.cms_page_sections;
create policy "public page sections read" on public.cms_page_sections for select to anon, authenticated using (
  exists (select 1 from public.cms_pages p where p.id = page_id and (p.status = 'published' or public.keyhold_is_admin_or_viewer()))
);
drop policy if exists "admins page sections write" on public.cms_page_sections;
create policy "admins page sections write" on public.cms_page_sections for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

drop policy if exists "public navigation read" on public.cms_navigation_items;
create policy "public navigation read" on public.cms_navigation_items for select to anon, authenticated using (enabled = true or public.keyhold_is_admin_or_viewer());
drop policy if exists "admins navigation write" on public.cms_navigation_items;
create policy "admins navigation write" on public.cms_navigation_items for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

drop policy if exists "public media library read" on public.cms_media_library;
create policy "public media library read" on public.cms_media_library for select to anon, authenticated using (true);
drop policy if exists "admins media library write" on public.cms_media_library;
create policy "admins media library write" on public.cms_media_library for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

drop policy if exists "public people read" on public.cms_people;
create policy "public people read" on public.cms_people for select to anon, authenticated using (status = 'published' or public.keyhold_is_admin_or_viewer());
drop policy if exists "admins people write" on public.cms_people;
create policy "admins people write" on public.cms_people for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

drop policy if exists "public testimonials read" on public.cms_testimonials;
create policy "public testimonials read" on public.cms_testimonials for select to anon, authenticated using (status = 'published' or public.keyhold_is_admin_or_viewer());
drop policy if exists "admins testimonials write" on public.cms_testimonials;
create policy "admins testimonials write" on public.cms_testimonials for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

drop policy if exists "public faqs read" on public.cms_faqs;
create policy "public faqs read" on public.cms_faqs for select to anon, authenticated using (status = 'published' or public.keyhold_is_admin_or_viewer());
drop policy if exists "admins faqs write" on public.cms_faqs;
create policy "admins faqs write" on public.cms_faqs for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

insert into public.cms_website_settings (id)
values ('00000000-0000-0000-0000-000000000061')
on conflict (id) do nothing;

-- Seed every current public route as editable content. These inserts are safe to rerun.
insert into public.cms_pages (page_key, route, status, nav_title, eyebrow, hero_title, hero_subtitle)
values
  ('home', '/', 'published', 'Home', 'Dubai real estate · Curated advisory', 'Discover your place in Dubai.', 'Curated properties, intelligent analysis and private advisory for better real estate decisions.'),
  ('projects', '/projects', 'published', 'Projects', 'Dubai property', 'A considered selection across Dubai.', 'Explore off-plan, ready and rental opportunities.'),
  ('off-plan', '/projects/off-plan', 'published', 'Off-Plan', 'Projects', 'Off-plan opportunities.', 'Explore new launches and projects under development.'),
  ('ready', '/projects/ready', 'published', 'Ready', 'Projects', 'Ready properties.', 'Explore completed homes for occupation or investment.'),
  ('short-term-rentals', '/projects/short-term-rentals', 'published', 'Short-Term Rentals', 'Projects', 'Short-term rentals.', 'Flexible stays and holiday-home opportunities.'),
  ('long-term-rentals', '/projects/long-term-rentals', 'published', 'Long-Term Rentals', 'Projects', 'Long-term rentals.', 'Annual rental opportunities across Dubai.'),
  ('updates', '/updates', 'published', 'Updates', 'Construction intelligence', 'Follow progress, not promises.', 'Construction updates and verified project milestones.'),
  ('insights', '/insights', 'published', 'Insights', 'Guides & intelligence', 'Better context for better property decisions.', 'Guides, market thinking and practical explanations.'),
  ('services', '/services', 'published', 'Services', 'Private advisory', 'Property support before, during and after the transaction.', 'A complete advisory relationship around Dubai property.'),
  ('who-we-are', '/who-we-are', 'published', 'Who We Are', 'KeyHold', 'A more considered way to navigate Dubai property.', 'Independent thinking, clear information and long-term relationships.'),
  ('developers', '/developers', 'published', 'Developers', 'Developer directory', 'Explore Dubai developers.', 'Understand the people and companies behind each project.'),
  ('areas', '/areas', 'published', 'Areas', 'Dubai communities', 'Explore Dubai by area.', 'Discover communities through property, lifestyle and investment context.'),
  ('contact', '/contact', 'published', 'Contact', 'Private advisory', 'Speak with KeyHold.', 'Tell us what you are looking for and an advisor can continue the conversation.'),
  ('intelligence', '/intelligence', 'published', 'Intelligence', 'KeyHold Intelligence', 'Property intelligence with visible assumptions.', 'Scores, risks, comparables and source transparency.'),
  ('investment-calculator', '/investment-calculator', 'published', 'Investment Calculator', 'Investment modelling', 'Model the property, not just the headline yield.', 'Explore costs, cash flow, scenarios and exit outcomes.'),
  ('privacy', '/privacy', 'published', 'Privacy', 'Legal', 'Privacy Policy', 'How KeyHold handles personal information.'),
  ('terms', '/terms', 'published', 'Terms', 'Legal', 'Terms & Conditions', 'Terms governing use of the KeyHold website.'),
  ('cookies', '/cookies', 'published', 'Cookies', 'Legal', 'Cookie Policy', 'Information about cookies and similar technologies.')
on conflict (page_key) do nothing;

-- Home sections use typed section keys but remain fully editable/reorderable.
insert into public.cms_page_sections (page_id, section_key, section_type, enabled, eyebrow, title, body, style_variant, payload, sort_order)
select p.id, seed.section_key, seed.section_type, true, seed.eyebrow, seed.title, seed.body, seed.style_variant, seed.payload::jsonb, seed.sort_order
from public.cms_pages p
cross join (values
  ('trust-strip','trust-strip','Why KeyHold','Clearer property decisions.','Use three concise trust points below the hero.','default','{"items":[{"title":"Dubai focused","text":"A focused platform for Dubai real estate."},{"title":"Investment minded","text":"Property presentation designed around decisions, not just listings."},{"title":"End-to-end","text":"From discovery and acquisition to rentals, management and after-sales."}]}',10),
  ('featured-projects','project-grid','Projects','Selected opportunities.','Choose featured project slugs in the payload.','default','{"projectSlugs":[],"limit":6,"linkLabel":"Explore all projects"}',20),
  ('property-types','link-grid','Explore','Find the right route into Dubai property.','Control the four property-route cards.','soft-teal','{"items":[{"title":"Off-Plan","href":"/projects/off-plan","text":"New launches and projects under development."},{"title":"Ready","href":"/projects/ready","text":"Completed homes for occupation or investment."},{"title":"Short-Term","href":"/projects/short-term-rentals","text":"Flexible stays and holiday-home opportunities."},{"title":"Long-Term","href":"/projects/long-term-rentals","text":"Annual rental opportunities across Dubai."}]}',30),
  ('construction-updates','updates-grid','Updates','Construction progress, clearly presented.','Show the latest project updates.','default','{"limit":3,"linkLabel":"View construction updates"}',40),
  ('intelligence','feature','KeyHold Intelligence','More context. Less noise.','Explain the Intelligence layer and link to the methodology.','dark','{"items":[{"title":"Score","text":"A transparent multi-factor view."},{"title":"Risk","text":"Visible risks instead of sales-only language."},{"title":"Long-term","text":"Context around costs, comparables and exit strategy."}]}',50),
  ('insights','insights-grid','Insights','Built for better property decisions.','Guides, market thinking and practical explanations.','default','{"limit":3,"linkLabel":"Explore insights"}',60),
  ('services','services-grid','Services','Property support before, during and after the transaction.','Show published KeyHold services.','soft-sand','{"limit":6,"linkLabel":"All services"}',70),
  ('final-cta','global-cta','Private advisory','Ready to explore Dubai property?','Speak with KeyHold about your objectives, liquidity and preferred timeline.','default','{}',80)
) as seed(section_key,section_type,eyebrow,title,body,style_variant,payload,sort_order)
where p.page_key = 'home'
on conflict (page_id, section_key) do nothing;

insert into public.cms_navigation_items (nav_group,label,href,enabled,sort_order)
values
  ('header-primary','Home','/',true,10),
  ('header-primary','Updates','/updates',true,20),
  ('header-primary','Insights','/insights',true,30),
  ('header-primary','Services','/services',true,40),
  ('header-primary','Who We Are','/who-we-are',true,50),
  ('projects-dropdown','Off-Plan','/projects/off-plan',true,10),
  ('projects-dropdown','Ready','/projects/ready',true,20),
  ('projects-dropdown','Short-Term Rentals','/projects/short-term-rentals',true,30),
  ('projects-dropdown','Long-Term Rentals','/projects/long-term-rentals',true,40),
  ('footer-projects','Off-Plan','/projects/off-plan',true,10),
  ('footer-projects','Ready','/projects/ready',true,20),
  ('footer-projects','Short-Term Rentals','/projects/short-term-rentals',true,30),
  ('footer-projects','Long-Term Rentals','/projects/long-term-rentals',true,40),
  ('footer-projects','View All Projects','/projects',true,50),
  ('footer-guides','Insights','/insights',true,10),
  ('footer-guides','Construction Updates','/updates',true,20),
  ('footer-guides','Investment Calculator','/investment-calculator',true,30),
  ('footer-guides','Dubai Areas','/areas',true,40),
  ('footer-company','Who We Are','/who-we-are',true,10),
  ('footer-company','Developers','/developers',true,20),
  ('footer-company','Areas','/areas',true,30),
  ('footer-company','Contact','/contact',true,40),
  ('legal','Privacy','/privacy',true,10),
  ('legal','Terms','/terms',true,20),
  ('legal','Cookies','/cookies',true,30)
on conflict (nav_group,href) do nothing;

-- ============================================================
-- Module 6.1 multilingual foundation (EN default + FR)
-- ============================================================

create table if not exists public.cms_locale_settings (
  locale text primary key check (locale ~ '^[a-z]{2}(?:-[A-Z]{2})?$'),
  label text not null,
  native_label text not null,
  enabled boolean not null default true,
  is_default boolean not null default false,
  route_prefix text not null default '',
  hreflang text not null,
  direction text not null default 'ltr' check (direction in ('ltr','rtl')),
  fallback_locale text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists cms_locale_settings_single_default_idx
on public.cms_locale_settings ((is_default))
where is_default = true;

create table if not exists public.cms_translations (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in (
    'website-settings','website-page','website-section','navigation-item','person','testimonial','faq','form',
    'project','developer','area','unit','payment-milestone','floor-plan','document','construction-update',
    'intelligence-profile','intelligence-source','insight','service'
  )),
  entity_key text not null,
  locale text not null references public.cms_locale_settings(locale) on delete cascade,
  status text not null default 'draft' check (status in ('draft','published')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(entity_type, entity_key, locale)
);
create index if not exists cms_translations_lookup_idx on public.cms_translations(entity_type, entity_key, locale, status);

create table if not exists public.cms_form_copy (
  id uuid primary key default gen_random_uuid(),
  form_key text not null unique check (form_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  enabled boolean not null default true,
  title text not null default '',
  intro text not null default '',
  submit_label text not null default 'Submit',
  success_message text not null default 'Thank you.',
  consent_text text not null default '',
  privacy_label text not null default 'Privacy Policy',
  fields jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent updated_at triggers.
drop trigger if exists cms_locale_settings_touch on public.cms_locale_settings;
create trigger cms_locale_settings_touch before update on public.cms_locale_settings for each row execute function public.keyhold_touch_updated_at();
drop trigger if exists cms_translations_touch on public.cms_translations;
create trigger cms_translations_touch before update on public.cms_translations for each row execute function public.keyhold_touch_updated_at();
drop trigger if exists cms_form_copy_touch on public.cms_form_copy;
create trigger cms_form_copy_touch before update on public.cms_form_copy for each row execute function public.keyhold_touch_updated_at();

alter table public.cms_locale_settings enable row level security;
alter table public.cms_translations enable row level security;
alter table public.cms_form_copy enable row level security;

-- Locale configuration is safe to expose. Translation records themselves stay server/admin only;
-- the public site consumes a build-time snapshot so unpublished copy can never leak.
drop policy if exists "public locale settings read" on public.cms_locale_settings;
create policy "public locale settings read" on public.cms_locale_settings for select to anon, authenticated using (enabled = true or public.keyhold_is_admin_or_viewer());
drop policy if exists "admins locale settings write" on public.cms_locale_settings;
create policy "admins locale settings write" on public.cms_locale_settings for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

drop policy if exists "admins translations read" on public.cms_translations;
create policy "admins translations read" on public.cms_translations for select to authenticated using (public.keyhold_is_admin_or_viewer());
drop policy if exists "admins translations write" on public.cms_translations;
create policy "admins translations write" on public.cms_translations for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

drop policy if exists "public form copy read" on public.cms_form_copy;
create policy "public form copy read" on public.cms_form_copy for select to anon, authenticated using (enabled = true or public.keyhold_is_admin_or_viewer());
drop policy if exists "admins form copy write" on public.cms_form_copy;
create policy "admins form copy write" on public.cms_form_copy for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

insert into public.cms_locale_settings (locale,label,native_label,enabled,is_default,route_prefix,hreflang,direction,fallback_locale,sort_order)
values
  ('en','English','English',true,true,'','en','ltr',null,10),
  ('fr','French','Français',true,false,'/fr','fr','ltr','en',20)
on conflict (locale) do update set
  label=excluded.label,
  native_label=excluded.native_label,
  enabled=excluded.enabled,
  route_prefix=excluded.route_prefix,
  hreflang=excluded.hreflang,
  direction=excluded.direction,
  fallback_locale=excluded.fallback_locale,
  sort_order=excluded.sort_order;

-- Keep the existing corporate settings aware of both enabled languages.
update public.cms_site_settings
set languages = array['EN','FR']::text[], updated_at = now()
where not ('FR' = any(languages));

-- Editable form copy. Validation, recipients and security remain protected in code.
insert into public.cms_form_copy (form_key,title,intro,submit_label,success_message,consent_text,privacy_label,fields,settings)
values
  ('contact','Speak with KeyHold','Tell us what you are looking for and an advisor can continue the conversation.','Send enquiry','Thank you. A KeyHold advisor will review your enquiry.','I agree that KeyHold may use my details to respond to this enquiry.','Privacy Policy','{"name":{"label":"Name","placeholder":"Your name"},"email":{"label":"Email","placeholder":"name@example.com"},"phone":{"label":"Phone / WhatsApp","placeholder":"+971"},"message":{"label":"Message","placeholder":"Tell us what you are looking for"}}','{}'),
  ('project-enquiry','Request project details','Ask for availability, brochures or a call with an advisor.','Request details','Thank you. We will review the project enquiry.','I agree that KeyHold may use my details to respond to this enquiry.','Privacy Policy','{"name":{"label":"Name"},"email":{"label":"Email"},"phone":{"label":"Phone / WhatsApp"},"message":{"label":"Message"}}','{}'),
  ('viewing','Schedule a viewing','Request an in-person or virtual viewing.','Request viewing','Your viewing request has been received.','I agree that KeyHold may contact me about this viewing request.','Privacy Policy','{}','{}'),
  ('newsletter','Stay ahead of the market','Receive selected KeyHold updates and insights.','Subscribe','You are subscribed.','I agree to receive KeyHold marketing updates.','Privacy Policy','{"email":{"label":"Email","placeholder":"name@example.com"}}','{}')
on conflict (form_key) do nothing;

-- French global shell translation. This is copy only, not factual project data.
insert into public.cms_translations (entity_type,entity_key,locale,status,data)
values (
  'website-settings','global','fr','published',
  '{
    "projectsMenuLabel":"Projets",
    "headerCtaLabel":"Parler à un conseiller",
    "footerTagline":"Conseil immobilier à Dubaï, présenté avec clarté, contexte et accompagnement réfléchi.",
    "copyrightText":"KeyHold. Tous droits réservés.",
    "locationsLabel":"Dubaï · EAU",
    "globalCta":{"enabled":true,"eyebrow":"Conseil privé","title":"Prêt à explorer l’immobilier à Dubaï ?","text":"Échangez avec KeyHold sur vos objectifs, votre liquidité et votre horizon d’investissement.","primaryLabel":"Parler à un conseiller","primaryHref":"/contact","secondaryLabel":"Explorer les projets","secondaryHref":"/projects"},
    "uiCopy":{"common":{"viewProject":"Voir le projet","explore":"Explorer","contact":"Contact"},"project":{"overview":"Présentation","amenities":"Équipements","paymentPlan":"Plan de paiement","floorPlans":"Plans","units":"Sélection des unités","documents":"Documents du projet","intelligence":"KeyHold Intelligence","investment":"Simulateur d’investissement","related":"Projets similaires","availabilityDisclaimer":"* La disponibilité des unités dépend de la disponibilité actuelle du promoteur/vendeur, doit être confirmée et peut changer sans préavis."}}
  }'::jsonb
)
on conflict (entity_type,entity_key,locale) do update set data=excluded.data, status='published', updated_at=now();

-- French page-level copy for every existing static public page. Factual property records are NOT auto-translated.
with page_fr(page_key,data) as (
  values
  ('home','{"navTitle":"Accueil","eyebrow":"Immobilier à Dubaï · Conseil sélectionné","heroTitle":"Découvrez votre place à Dubaï.","heroSubtitle":"Des biens sélectionnés, une analyse intelligente et un accompagnement privé pour de meilleures décisions immobilières.","seoTitle":"KeyHold | Immobilier à Dubaï"}'::jsonb),
  ('projects','{"navTitle":"Projets","eyebrow":"Immobilier à Dubaï","heroTitle":"Une sélection réfléchie à travers Dubaï.","heroSubtitle":"Explorez les opportunités sur plan, prêtes et locatives."}'::jsonb),
  ('off-plan','{"navTitle":"Sur plan","eyebrow":"Projets","heroTitle":"Opportunités sur plan.","heroSubtitle":"Découvrez les nouveaux lancements et les projets en construction."}'::jsonb),
  ('ready','{"navTitle":"Prêt","eyebrow":"Projets","heroTitle":"Biens prêts.","heroSubtitle":"Découvrez des biens achevés pour y vivre ou investir."}'::jsonb),
  ('short-term-rentals','{"navTitle":"Location courte durée","eyebrow":"Projets","heroTitle":"Locations courte durée.","heroSubtitle":"Séjours flexibles et opportunités de location saisonnière."}'::jsonb),
  ('long-term-rentals','{"navTitle":"Location longue durée","eyebrow":"Projets","heroTitle":"Locations longue durée.","heroSubtitle":"Opportunités de location annuelle à Dubaï."}'::jsonb),
  ('updates','{"navTitle":"Avancement","eyebrow":"Suivi de construction","heroTitle":"Suivez l’avancement, pas les promesses.","heroSubtitle":"Mises à jour de construction et étapes des projets."}'::jsonb),
  ('insights','{"navTitle":"Analyses","eyebrow":"Guides & intelligence","heroTitle":"Plus de contexte pour de meilleures décisions immobilières.","heroSubtitle":"Guides, analyses de marché et explications pratiques."}'::jsonb),
  ('services','{"navTitle":"Services","eyebrow":"Conseil privé","heroTitle":"Un accompagnement avant, pendant et après la transaction.","heroSubtitle":"Une relation de conseil complète autour de l’immobilier à Dubaï."}'::jsonb),
  ('who-we-are','{"navTitle":"Qui sommes-nous","eyebrow":"KeyHold","heroTitle":"Une approche plus réfléchie de l’immobilier à Dubaï.","heroSubtitle":"Analyse indépendante, information claire et relations de long terme."}'::jsonb),
  ('developers','{"navTitle":"Promoteurs","eyebrow":"Annuaire des promoteurs","heroTitle":"Découvrez les promoteurs de Dubaï.","heroSubtitle":"Comprenez les entreprises à l’origine de chaque projet."}'::jsonb),
  ('areas','{"navTitle":"Quartiers","eyebrow":"Communautés de Dubaï","heroTitle":"Explorez Dubaï par quartier.","heroSubtitle":"Découvrez les quartiers à travers l’immobilier, le style de vie et l’investissement."}'::jsonb),
  ('contact','{"navTitle":"Contact","eyebrow":"Conseil privé","heroTitle":"Parlez avec KeyHold.","heroSubtitle":"Dites-nous ce que vous recherchez et un conseiller pourra poursuivre la conversation."}'::jsonb),
  ('intelligence','{"navTitle":"Intelligence","eyebrow":"KeyHold Intelligence","heroTitle":"Une intelligence immobilière avec des hypothèses visibles.","heroSubtitle":"Scores, risques, comparables et transparence des sources."}'::jsonb),
  ('investment-calculator','{"navTitle":"Simulateur d’investissement","eyebrow":"Modélisation d’investissement","heroTitle":"Modélisez le bien, pas seulement le rendement affiché.","heroSubtitle":"Explorez les coûts, flux de trésorerie, scénarios et stratégies de sortie."}'::jsonb),
  ('privacy','{"navTitle":"Confidentialité","eyebrow":"Mentions légales","heroTitle":"Politique de confidentialité","heroSubtitle":"Comment KeyHold traite les données personnelles."}'::jsonb),
  ('terms','{"navTitle":"Conditions","eyebrow":"Mentions légales","heroTitle":"Conditions générales","heroSubtitle":"Conditions régissant l’utilisation du site KeyHold."}'::jsonb),
  ('cookies','{"navTitle":"Cookies","eyebrow":"Mentions légales","heroTitle":"Politique relative aux cookies","heroSubtitle":"Informations sur les cookies et technologies similaires."}'::jsonb)
)
insert into public.cms_translations (entity_type,entity_key,locale,status,data)
select 'website-page', page_key, 'fr', 'published', data from page_fr
on conflict (entity_type,entity_key,locale) do update set data=excluded.data, status='published', updated_at=now();

-- French fixed navigation labels. Destinations stay canonical and are localized at render time.
with nav_fr(entity_key,data) as (
  values
  ('header-primary:/','{"label":"Accueil"}'::jsonb),
  ('header-primary:/updates','{"label":"Avancement"}'::jsonb),
  ('header-primary:/insights','{"label":"Analyses"}'::jsonb),
  ('header-primary:/services','{"label":"Services"}'::jsonb),
  ('header-primary:/who-we-are','{"label":"Qui sommes-nous"}'::jsonb),
  ('projects-dropdown:/projects/off-plan','{"label":"Sur plan"}'::jsonb),
  ('projects-dropdown:/projects/ready','{"label":"Prêt"}'::jsonb),
  ('projects-dropdown:/projects/short-term-rentals','{"label":"Location courte durée"}'::jsonb),
  ('projects-dropdown:/projects/long-term-rentals','{"label":"Location longue durée"}'::jsonb),
  ('legal:/privacy','{"label":"Confidentialité"}'::jsonb),
  ('legal:/terms','{"label":"Conditions"}'::jsonb),
  ('legal:/cookies','{"label":"Cookies"}'::jsonb)
)
insert into public.cms_translations (entity_type,entity_key,locale,status,data)
select 'navigation-item', entity_key, 'fr', 'published', data from nav_fr
on conflict (entity_type,entity_key,locale) do update set data=excluded.data, status='published', updated_at=now();

-- French form copy.
with forms_fr(entity_key,data) as (
  values
  ('contact','{"title":"Parler avec KeyHold","intro":"Dites-nous ce que vous recherchez et un conseiller pourra poursuivre la conversation.","submitLabel":"Envoyer la demande","successMessage":"Merci. Un conseiller KeyHold examinera votre demande.","consentText":"J’accepte que KeyHold utilise mes coordonnées pour répondre à cette demande.","privacyLabel":"Politique de confidentialité"}'::jsonb),
  ('project-enquiry','{"title":"Demander les détails du projet","intro":"Demandez les disponibilités, brochures ou un échange avec un conseiller.","submitLabel":"Demander les détails","successMessage":"Merci. Nous allons examiner votre demande.","consentText":"J’accepte que KeyHold utilise mes coordonnées pour répondre à cette demande.","privacyLabel":"Politique de confidentialité"}'::jsonb),
  ('viewing','{"title":"Planifier une visite","intro":"Demandez une visite en personne ou virtuelle.","submitLabel":"Demander une visite","successMessage":"Votre demande de visite a été reçue.","consentText":"J’accepte que KeyHold me contacte au sujet de cette demande de visite.","privacyLabel":"Politique de confidentialité"}'::jsonb),
  ('newsletter','{"title":"Gardez une longueur d’avance","intro":"Recevez une sélection d’actualités et d’analyses KeyHold.","submitLabel":"S’inscrire","successMessage":"Votre inscription est confirmée.","consentText":"J’accepte de recevoir les communications marketing de KeyHold.","privacyLabel":"Politique de confidentialité"}'::jsonb)
)
insert into public.cms_translations (entity_type,entity_key,locale,status,data)
select 'form', entity_key, 'fr', 'published', data from forms_fr
on conflict (entity_type,entity_key,locale) do update set data=excluded.data, status='published', updated_at=now();
