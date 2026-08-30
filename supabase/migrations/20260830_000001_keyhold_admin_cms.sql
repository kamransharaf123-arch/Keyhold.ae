-- KeyHold Module 6: Admin / CMS / Data Engine
-- Apply in a dedicated Supabase project before enabling CMS_REQUIRED=true.

create extension if not exists pgcrypto;

create or replace function public.keyhold_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner','admin','editor','viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.keyhold_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid()
      and is_active = true
      and role in ('owner','admin','editor')
  );
$$;

create or replace function public.keyhold_is_admin_or_viewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid()
      and is_active = true
  );
$$;

create table if not exists public.cms_site_settings (
  id uuid primary key default '00000000-0000-0000-0000-000000000001'::uuid,
  company_name text not null default 'KeyHold',
  legal_name text not null default 'KeyHold',
  email text not null default 'hello@keyhold.ae',
  phone text,
  location text not null default 'Dubai, United Arab Emirates',
  address_line text,
  orn text,
  trade_license text,
  socials jsonb not null default '[]'::jsonb,
  google_reviews jsonb not null default '{"rating":null,"reviewCount":null,"href":""}'::jsonb,
  languages text[] not null default array['EN']::text[],
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_developers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  summary text not null,
  location text not null default 'Dubai, UAE',
  verified_facts_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  summary text not null,
  emirate text not null default 'Dubai',
  highlights text[] not null default '{}'::text[],
  map_x numeric(5,2) not null default 50 check (map_x between 0 and 100),
  map_y numeric(5,2) not null default 50 check (map_y between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  category text not null check (category in ('Off-Plan','Ready','Short-Term','Long-Term')),
  developer_id uuid references public.cms_developers(id) on delete restrict,
  area_id uuid references public.cms_areas(id) on delete restrict,
  location text not null,
  short_description text not null,
  overview text not null,
  hero_image_url text not null default '',
  price_from_aed bigint check (price_from_aed is null or price_from_aed >= 0),
  rental_price_from_aed bigint check (rental_price_from_aed is null or rental_price_from_aed >= 0),
  rental_period text check (rental_period is null or rental_period in ('night','year')),
  bedrooms_label text not null,
  bedrooms integer[] not null default '{}'::integer[],
  bathrooms_label text,
  property_types text[] not null default '{}'::text[],
  size_from_sqft integer check (size_from_sqft is null or size_from_sqft >= 0),
  size_to_sqft integer check (size_to_sqft is null or size_to_sqft >= 0),
  handover_label text not null,
  handover_date date,
  completion_status text not null check (completion_status in ('pre-launch','under-construction','ready')),
  amenities text[] not null default '{}'::text[],
  regulatory jsonb not null default '{"registrationStatus":"pending-verification"}'::jsonb,
  availability_last_verified_at timestamptz not null default now(),
  published_at timestamptz,
  featured boolean not null default false,
  footer_featured boolean not null default false,
  construction_progress numeric(5,2) check (construction_progress is null or construction_progress between 0 and 100),
  discovery jsonb not null default '{"investmentGoals":[],"lifestyleTags":[],"keywords":[]}'::jsonb,
  investment jsonb,
  key_facts jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cms_projects_status_idx on public.cms_projects(status);
create index if not exists cms_projects_developer_idx on public.cms_projects(developer_id);
create index if not exists cms_projects_area_idx on public.cms_projects(area_id);

create table if not exists public.cms_project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.cms_projects(id) on delete cascade,
  storage_path text not null unique,
  public_url text not null,
  alt_text text not null,
  category text not null check (category in ('Exterior','Interior','Amenities','Master Plan','Construction')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists cms_project_images_project_idx on public.cms_project_images(project_id, sort_order);

create table if not exists public.cms_units (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.cms_projects(id) on delete cascade,
  unit_number text not null,
  floor integer not null,
  bedrooms integer not null check (bedrooms >= 0),
  bathrooms integer not null check (bathrooms >= 0),
  property_type text not null,
  size_sqft integer not null check (size_sqft > 0),
  view_label text not null,
  price_aed bigint check (price_aed is null or price_aed >= 0),
  availability text not null default 'unknown' check (availability in ('available','reserved','sold','unknown')),
  last_verified_at timestamptz not null default now(),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, unit_number)
);
create index if not exists cms_units_project_idx on public.cms_units(project_id, sort_order);

create table if not exists public.cms_payment_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.cms_projects(id) on delete cascade,
  label text not null,
  percentage numeric(7,3) not null check (percentage between 0 and 100),
  timing text not null,
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cms_payment_milestones_project_idx on public.cms_payment_milestones(project_id, sort_order);

create table if not exists public.cms_floor_plans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.cms_projects(id) on delete cascade,
  label text not null,
  bedrooms integer not null check (bedrooms >= 0),
  property_type text not null,
  size_from_sqft integer not null check (size_from_sqft > 0),
  size_to_sqft integer check (size_to_sqft is null or size_to_sqft >= size_from_sqft),
  storage_path text not null unique,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.cms_projects(id) on delete cascade,
  label text not null,
  kind text not null check (kind in ('Brochure','Floor Plans','Payment Plan','Permit','Other')),
  availability text not null default 'request-only' check (availability in ('available','request-only','coming-soon')),
  bucket text not null default 'keyhold-private-documents' check (bucket in ('keyhold-public-documents','keyhold-private-documents')),
  storage_path text,
  public_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_construction_updates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  project_id uuid not null references public.cms_projects(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  progress numeric(5,2) not null check (progress between 0 and 100),
  status_label text not null,
  updated_at_label text not null,
  published_at timestamptz not null default now(),
  image_url text not null default '',
  summary text not null,
  milestones text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cms_construction_updates_project_idx on public.cms_construction_updates(project_id, published_at desc);

create table if not exists public.cms_intelligence_profiles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.cms_projects(id) on delete cascade,
  data_status text not null default 'pending-verification' check (data_status in ('demo-placeholder','pending-verification','verified')),
  last_reviewed_at timestamptz not null default now(),
  score_dimensions jsonb not null default '[]'::jsonb,
  risk_dimensions jsonb not null default '[]'::jsonb,
  developer_delivery_score numeric(4,2) not null default 0 check (developer_delivery_score between 0 and 10),
  developer_delivery_rationale text not null default 'Pending verified evidence.',
  liquidity_score numeric(4,2) not null default 0 check (liquidity_score between 0 and 10),
  liquidity_rationale text not null default 'Pending verified evidence.',
  price_history jsonb not null default '[]'::jsonb,
  comparables jsonb not null default '[]'::jsonb,
  supply_pipeline jsonb not null default '[]'::jsonb,
  view_intelligence jsonb not null default '[]'::jsonb,
  verdict jsonb not null default '{"headline":"","summary":"","whyWeLikeIt":[],"whatWeWouldWatch":[],"bestFor":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_intelligence_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.cms_projects(id) on delete cascade,
  source_key text not null,
  label text not null,
  category text not null check (category in ('Developer material','Public record','Market evidence','KeyHold analysis','User supplied')),
  status text not null default 'pending-verification' check (status in ('demo-placeholder','pending-verification','verified')),
  last_checked_at timestamptz not null default now(),
  url text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, source_key)
);

create table if not exists public.cms_insights (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  category text not null,
  title text not null,
  excerpt text not null,
  body text not null default '',
  cover_image_url text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  title text not null,
  text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_audit_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists cms_audit_log_created_idx on public.cms_audit_log(created_at desc);

-- updated_at triggers
create trigger admin_profiles_touch before update on public.admin_profiles for each row execute function public.keyhold_touch_updated_at();
create trigger cms_developers_touch before update on public.cms_developers for each row execute function public.keyhold_touch_updated_at();
create trigger cms_areas_touch before update on public.cms_areas for each row execute function public.keyhold_touch_updated_at();
create trigger cms_projects_touch before update on public.cms_projects for each row execute function public.keyhold_touch_updated_at();
create trigger cms_units_touch before update on public.cms_units for each row execute function public.keyhold_touch_updated_at();
create trigger cms_payment_milestones_touch before update on public.cms_payment_milestones for each row execute function public.keyhold_touch_updated_at();
create trigger cms_floor_plans_touch before update on public.cms_floor_plans for each row execute function public.keyhold_touch_updated_at();
create trigger cms_documents_touch before update on public.cms_documents for each row execute function public.keyhold_touch_updated_at();
create trigger cms_construction_updates_touch before update on public.cms_construction_updates for each row execute function public.keyhold_touch_updated_at();
create trigger cms_intelligence_profiles_touch before update on public.cms_intelligence_profiles for each row execute function public.keyhold_touch_updated_at();
create trigger cms_intelligence_sources_touch before update on public.cms_intelligence_sources for each row execute function public.keyhold_touch_updated_at();
create trigger cms_insights_touch before update on public.cms_insights for each row execute function public.keyhold_touch_updated_at();
create trigger cms_services_touch before update on public.cms_services for each row execute function public.keyhold_touch_updated_at();

-- RLS
alter table public.admin_profiles enable row level security;
alter table public.cms_site_settings enable row level security;
alter table public.cms_developers enable row level security;
alter table public.cms_areas enable row level security;
alter table public.cms_projects enable row level security;
alter table public.cms_project_images enable row level security;
alter table public.cms_units enable row level security;
alter table public.cms_payment_milestones enable row level security;
alter table public.cms_floor_plans enable row level security;
alter table public.cms_documents enable row level security;
alter table public.cms_construction_updates enable row level security;
alter table public.cms_intelligence_profiles enable row level security;
alter table public.cms_intelligence_sources enable row level security;
alter table public.cms_insights enable row level security;
alter table public.cms_services enable row level security;
alter table public.cms_audit_log enable row level security;

create policy "admin can read own profile" on public.admin_profiles for select to authenticated using (user_id = auth.uid() and is_active = true);
create policy "admins manage admin profiles" on public.admin_profiles for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

create policy "public settings read" on public.cms_site_settings for select to anon, authenticated using (true);
create policy "admins settings write" on public.cms_site_settings for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

create policy "public developers read" on public.cms_developers for select to anon, authenticated using (status = 'published' or public.keyhold_is_admin_or_viewer());
create policy "admins developers write" on public.cms_developers for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());
create policy "public areas read" on public.cms_areas for select to anon, authenticated using (status = 'published' or public.keyhold_is_admin_or_viewer());
create policy "admins areas write" on public.cms_areas for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());
create policy "public projects read" on public.cms_projects for select to anon, authenticated using (status = 'published' or public.keyhold_is_admin_or_viewer());
create policy "admins projects write" on public.cms_projects for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

create policy "public project images read" on public.cms_project_images for select to anon, authenticated using (exists (select 1 from public.cms_projects p where p.id = project_id and (p.status = 'published' or public.keyhold_is_admin_or_viewer())));
create policy "admins project images write" on public.cms_project_images for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());
create policy "public units read" on public.cms_units for select to anon, authenticated using (exists (select 1 from public.cms_projects p where p.id = project_id and (p.status = 'published' or public.keyhold_is_admin_or_viewer())));
create policy "admins units write" on public.cms_units for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());
create policy "public payment read" on public.cms_payment_milestones for select to anon, authenticated using (exists (select 1 from public.cms_projects p where p.id = project_id and (p.status = 'published' or public.keyhold_is_admin_or_viewer())));
create policy "admins payment write" on public.cms_payment_milestones for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());
create policy "public floor plans read" on public.cms_floor_plans for select to anon, authenticated using (exists (select 1 from public.cms_projects p where p.id = project_id and (p.status = 'published' or public.keyhold_is_admin_or_viewer())));
create policy "admins floor plans write" on public.cms_floor_plans for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());
create policy "public documents metadata read" on public.cms_documents for select to anon, authenticated using (exists (select 1 from public.cms_projects p where p.id = project_id and (p.status = 'published' or public.keyhold_is_admin_or_viewer())));
create policy "admins documents write" on public.cms_documents for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());
create policy "public updates read" on public.cms_construction_updates for select to anon, authenticated using (status = 'published' or public.keyhold_is_admin_or_viewer());
create policy "admins updates write" on public.cms_construction_updates for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());
create policy "public intelligence read" on public.cms_intelligence_profiles for select to anon, authenticated using (exists (select 1 from public.cms_projects p where p.id = project_id and (p.status = 'published' or public.keyhold_is_admin_or_viewer())));
create policy "admins intelligence write" on public.cms_intelligence_profiles for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());
create policy "public intelligence sources read" on public.cms_intelligence_sources for select to anon, authenticated using (exists (select 1 from public.cms_projects p where p.id = project_id and (p.status = 'published' or public.keyhold_is_admin_or_viewer())));
create policy "admins intelligence sources write" on public.cms_intelligence_sources for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());
create policy "public insights read" on public.cms_insights for select to anon, authenticated using (status = 'published' or public.keyhold_is_admin_or_viewer());
create policy "admins insights write" on public.cms_insights for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());
create policy "public services read" on public.cms_services for select to anon, authenticated using (status = 'published' or public.keyhold_is_admin_or_viewer());
create policy "admins services write" on public.cms_services for all to authenticated using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

-- Storage buckets. Media and public documents are intentionally public. Private documents never receive a public URL.
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('keyhold-media', 'keyhold-media', true, 20971520),
  ('keyhold-public-documents', 'keyhold-public-documents', true, 31457280),
  ('keyhold-private-documents', 'keyhold-private-documents', false, 31457280)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

create policy "public read keyhold media" on storage.objects for select to public using (bucket_id in ('keyhold-media','keyhold-public-documents'));
create policy "admins upload keyhold storage" on storage.objects for insert to authenticated with check (bucket_id in ('keyhold-media','keyhold-public-documents','keyhold-private-documents') and public.keyhold_is_admin());
create policy "admins update keyhold storage" on storage.objects for update to authenticated using (bucket_id in ('keyhold-media','keyhold-public-documents','keyhold-private-documents') and public.keyhold_is_admin()) with check (bucket_id in ('keyhold-media','keyhold-public-documents','keyhold-private-documents') and public.keyhold_is_admin());
create policy "admins delete keyhold storage" on storage.objects for delete to authenticated using (bucket_id in ('keyhold-media','keyhold-public-documents','keyhold-private-documents') and public.keyhold_is_admin());

insert into public.cms_site_settings (id) values ('00000000-0000-0000-0000-000000000001') on conflict (id) do nothing;
