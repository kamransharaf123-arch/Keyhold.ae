-- KeyHold Module 7: Client Portal + performance-first private data layer
-- Apply after 20260830_000001_keyhold_admin_cms.sql and
-- 20260830_000002_keyhold_website_content_manager.sql.
-- This migration is intentionally retry-safe for triggers, policies, functions and indexes.

create extension if not exists pgcrypto;

create table if not exists public.client_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  preferred_locale text not null default 'en' check (preferred_locale in ('en','fr')),
  preferred_currency text not null default 'AED' check (preferred_currency in ('AED','USD','EUR','GBP','CHF')),
  marketing_opt_in boolean not null default false,
  advisor_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('active','blocked')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists client_profiles_advisor_idx on public.client_profiles(advisor_user_id) where advisor_user_id is not null;
create index if not exists client_profiles_created_idx on public.client_profiles(created_at desc);

create or replace function public.keyhold_is_active_client()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.client_profiles
    where user_id = auth.uid()
      and status = 'active'
  );
$$;


create table if not exists public.client_saved_projects (
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.cms_projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);
create index if not exists client_saved_projects_user_created_idx on public.client_saved_projects(user_id, created_at desc);

create table if not exists public.client_saved_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Saved comparison',
  project_ids uuid[] not null check (cardinality(project_ids) between 2 and 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists client_saved_comparisons_user_idx on public.client_saved_comparisons(user_id, updated_at desc);

create table if not exists public.client_portfolio_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.cms_projects(id) on delete set null,
  unit_id uuid references public.cms_units(id) on delete set null,
  custom_title text,
  ownership_status text not null default 'reserved' check (ownership_status in ('reserved','contracted','under-construction','handed-over','rented','sold')),
  purchase_price_aed bigint not null check (purchase_price_aed >= 0),
  paid_to_date_aed bigint not null default 0 check (paid_to_date_aed >= 0),
  estimated_value_aed bigint check (estimated_value_aed is null or estimated_value_aed >= 0),
  valuation_as_of date,
  acquisition_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists client_portfolio_assets_user_idx on public.client_portfolio_assets(user_id, created_at desc);
create index if not exists client_portfolio_assets_project_idx on public.client_portfolio_assets(project_id) where project_id is not null;

create table if not exists public.client_payment_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid not null references public.client_portfolio_assets(id) on delete cascade,
  label text not null,
  due_date date not null,
  amount_aed bigint not null check (amount_aed >= 0),
  status text not null default 'upcoming' check (status in ('upcoming','due','paid','overdue','waived')),
  paid_at timestamptz,
  source text not null default 'admin' check (source in ('developer-plan','admin','imported')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists client_payment_items_user_due_idx on public.client_payment_items(user_id, due_date asc);
create index if not exists client_payment_items_asset_idx on public.client_payment_items(asset_id, due_date asc);

create table if not exists public.client_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid references public.client_portfolio_assets(id) on delete set null,
  label text not null,
  category text not null check (category in ('Reservation','KYC','SPA','Receipt','DLD','Handover','Inspection','Other')),
  bucket text not null default 'keyhold-private-documents' check (bucket = 'keyhold-private-documents'),
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  created_at timestamptz not null default now()
);
create index if not exists client_documents_user_idx on public.client_documents(user_id, created_at desc);
create index if not exists client_documents_asset_idx on public.client_documents(asset_id, created_at desc) where asset_id is not null;

create table if not exists public.client_advisor_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  advisor_user_id uuid references auth.users(id) on delete set null,
  body text not null,
  is_pinned boolean not null default false,
  visible_to_client boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists client_advisor_notes_user_idx on public.client_advisor_notes(user_id, is_pinned desc, created_at desc);

create table if not exists public.client_watchlist_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.cms_projects(id) on delete cascade,
  area_id uuid references public.cms_areas(id) on delete cascade,
  developer_id uuid references public.cms_developers(id) on delete cascade,
  rule_type text not null check (rule_type in ('price-below','construction-reaches','new-unit','availability-change','new-launch')),
  threshold_numeric numeric,
  is_active boolean not null default true,
  channels text[] not null default array['in-app']::text[],
  last_triggered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(project_id, area_id, developer_id) >= 1)
);
create index if not exists client_watchlist_rules_user_idx on public.client_watchlist_rules(user_id, is_active, updated_at desc);
create index if not exists client_watchlist_rules_project_idx on public.client_watchlist_rules(project_id) where project_id is not null;

create table if not exists public.client_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'update' check (kind in ('update','payment','document','advisor','watchlist','system')),
  title text not null,
  body text not null,
  href text,
  severity text not null default 'info' check (severity in ('info','positive','warning')),
  dedupe_key text,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists client_notifications_user_idx on public.client_notifications(user_id, is_read, created_at desc);
create unique index if not exists client_notifications_dedupe_idx on public.client_notifications(user_id, dedupe_key) where dedupe_key is not null;

create table if not exists public.client_investment_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.cms_projects(id) on delete set null,
  unit_id uuid references public.cms_units(id) on delete set null,
  name text not null default 'Investment analysis',
  locale text not null default 'en' check (locale in ('en','fr')),
  scenario_key text,
  inputs jsonb not null,
  outputs jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists client_investment_snapshots_user_idx on public.client_investment_snapshots(user_id, created_at desc);

create table if not exists public.client_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.cms_projects(id) on delete set null,
  asset_id uuid references public.client_portfolio_assets(id) on delete set null,
  snapshot_id uuid references public.client_investment_snapshots(id) on delete set null,
  title text not null,
  status text not null default 'ready' check (status in ('generating','ready','error')),
  bucket text not null default 'keyhold-private-documents' check (bucket = 'keyhold-private-documents'),
  storage_path text,
  file_name text,
  generated_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists client_reports_user_idx on public.client_reports(user_id, created_at desc);

-- updated_at triggers: retry-safe
DO $$
DECLARE
  pair text[];
BEGIN
  FOREACH pair SLICE 1 IN ARRAY ARRAY[
    ARRAY['client_profiles_touch','client_profiles'],
    ARRAY['client_saved_comparisons_touch','client_saved_comparisons'],
    ARRAY['client_portfolio_assets_touch','client_portfolio_assets'],
    ARRAY['client_payment_items_touch','client_payment_items'],
    ARRAY['client_advisor_notes_touch','client_advisor_notes'],
    ARRAY['client_watchlist_rules_touch','client_watchlist_rules'],
    ARRAY['client_notifications_touch','client_notifications']
  ] LOOP
    EXECUTE format('drop trigger if exists %I on public.%I', pair[1], pair[2]);
    EXECUTE format('create trigger %I before update on public.%I for each row execute function public.keyhold_touch_updated_at()', pair[1], pair[2]);
  END LOOP;
END $$;

-- Dashboard RPC collapses the dashboard into one authenticated round trip.
create or replace function public.keyhold_client_dashboard_summary()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case when not public.keyhold_is_active_client() then '{}'::jsonb else jsonb_build_object(
    'savedCount', (select count(*) from public.client_saved_projects where user_id = auth.uid()),
    'portfolioCount', (select count(*) from public.client_portfolio_assets where user_id = auth.uid() and ownership_status <> 'sold'),
    'portfolioPurchaseValueAed', coalesce((select sum(purchase_price_aed) from public.client_portfolio_assets where user_id = auth.uid() and ownership_status <> 'sold'), 0),
    'portfolioEstimatedValueAed', coalesce((select sum(coalesce(estimated_value_aed, purchase_price_aed)) from public.client_portfolio_assets where user_id = auth.uid() and ownership_status <> 'sold'), 0),
    'paidToDateAed', coalesce((select sum(paid_to_date_aed) from public.client_portfolio_assets where user_id = auth.uid() and ownership_status <> 'sold'), 0),
    'upcomingPaymentsAed', coalesce((select sum(amount_aed) from public.client_payment_items where user_id = auth.uid() and status in ('upcoming','due','overdue')), 0),
    'unreadNotifications', (select count(*) from public.client_notifications where user_id = auth.uid() and is_read = false),
    'documentCount', (select count(*) from public.client_documents where user_id = auth.uid()),
    'analysisCount', (select count(*) from public.client_investment_snapshots where user_id = auth.uid())
  ) end;
$$;
revoke all on function public.keyhold_client_dashboard_summary() from public;
grant execute on function public.keyhold_client_dashboard_summary() to authenticated;

-- RLS on every client table.
alter table public.client_profiles enable row level security;
alter table public.client_saved_projects enable row level security;
alter table public.client_saved_comparisons enable row level security;
alter table public.client_portfolio_assets enable row level security;
alter table public.client_payment_items enable row level security;
alter table public.client_documents enable row level security;
alter table public.client_advisor_notes enable row level security;
alter table public.client_watchlist_rules enable row level security;
alter table public.client_notifications enable row level security;
alter table public.client_investment_snapshots enable row level security;
alter table public.client_reports enable row level security;

-- Drop policies first so the migration can be safely re-run.
DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'client_profiles','client_saved_projects','client_saved_comparisons','client_portfolio_assets',
        'client_payment_items','client_documents','client_advisor_notes','client_watchlist_rules',
        'client_notifications','client_investment_snapshots','client_reports'
      )
      and policyname like 'keyhold client%'
  LOOP
    EXECUTE format('drop policy if exists %I on %I.%I', rec.policyname, rec.schemaname, rec.tablename);
  END LOOP;
END $$;

create policy "keyhold client profile select" on public.client_profiles for select to authenticated
using (user_id = auth.uid() or public.keyhold_is_admin_or_viewer());
create policy "keyhold client profile insert" on public.client_profiles for insert to authenticated
with check (user_id = auth.uid());
create policy "keyhold client profile update" on public.client_profiles for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid() and public.keyhold_is_active_client());
create policy "keyhold client profile admin" on public.client_profiles for all to authenticated
using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

create policy "keyhold client saved select" on public.client_saved_projects for select to authenticated
using ((user_id = auth.uid() and public.keyhold_is_active_client()) or public.keyhold_is_admin_or_viewer());
create policy "keyhold client saved insert" on public.client_saved_projects for insert to authenticated
with check (user_id = auth.uid() and public.keyhold_is_active_client());
create policy "keyhold client saved delete" on public.client_saved_projects for delete to authenticated
using (user_id = auth.uid() and public.keyhold_is_active_client());
create policy "keyhold client saved admin" on public.client_saved_projects for all to authenticated
using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

create policy "keyhold client comparisons own" on public.client_saved_comparisons for all to authenticated
using ((user_id = auth.uid() and public.keyhold_is_active_client()) or public.keyhold_is_admin())
with check ((user_id = auth.uid() and public.keyhold_is_active_client()) or public.keyhold_is_admin());

create policy "keyhold client portfolio select" on public.client_portfolio_assets for select to authenticated
using ((user_id = auth.uid() and public.keyhold_is_active_client()) or public.keyhold_is_admin_or_viewer());
create policy "keyhold client portfolio admin" on public.client_portfolio_assets for all to authenticated
using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

create policy "keyhold client payments select" on public.client_payment_items for select to authenticated
using ((user_id = auth.uid() and public.keyhold_is_active_client()) or public.keyhold_is_admin_or_viewer());
create policy "keyhold client payments admin" on public.client_payment_items for all to authenticated
using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

create policy "keyhold client documents select" on public.client_documents for select to authenticated
using ((user_id = auth.uid() and public.keyhold_is_active_client()) or public.keyhold_is_admin_or_viewer());
create policy "keyhold client documents admin" on public.client_documents for all to authenticated
using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

create policy "keyhold client notes select" on public.client_advisor_notes for select to authenticated
using ((user_id = auth.uid() and visible_to_client = true and public.keyhold_is_active_client()) or public.keyhold_is_admin_or_viewer());
create policy "keyhold client notes admin" on public.client_advisor_notes for all to authenticated
using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

create policy "keyhold client watchlist own" on public.client_watchlist_rules for all to authenticated
using ((user_id = auth.uid() and public.keyhold_is_active_client()) or public.keyhold_is_admin())
with check ((user_id = auth.uid() and public.keyhold_is_active_client()) or public.keyhold_is_admin());

create policy "keyhold client notifications select" on public.client_notifications for select to authenticated
using ((user_id = auth.uid() and public.keyhold_is_active_client()) or public.keyhold_is_admin_or_viewer());
create policy "keyhold client notifications update" on public.client_notifications for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid() and public.keyhold_is_active_client());
create policy "keyhold client notifications admin" on public.client_notifications for all to authenticated
using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

create policy "keyhold client snapshots own" on public.client_investment_snapshots for all to authenticated
using ((user_id = auth.uid() and public.keyhold_is_active_client()) or public.keyhold_is_admin())
with check ((user_id = auth.uid() and public.keyhold_is_active_client()) or public.keyhold_is_admin());

create policy "keyhold client reports select" on public.client_reports for select to authenticated
using ((user_id = auth.uid() and public.keyhold_is_active_client()) or public.keyhold_is_admin_or_viewer());
create policy "keyhold client reports admin" on public.client_reports for all to authenticated
using (public.keyhold_is_admin()) with check (public.keyhold_is_admin());

-- Narrow column privileges for client-editable profile/notification fields.
-- Revoke broad default authenticated grants first; then explicitly grant only what clients need.
revoke all on public.client_profiles from authenticated;
revoke all on public.client_saved_projects from authenticated;
revoke all on public.client_saved_comparisons from authenticated;
revoke all on public.client_portfolio_assets from authenticated;
revoke all on public.client_payment_items from authenticated;
revoke all on public.client_documents from authenticated;
revoke all on public.client_advisor_notes from authenticated;
revoke all on public.client_watchlist_rules from authenticated;
revoke all on public.client_notifications from authenticated;
revoke all on public.client_investment_snapshots from authenticated;
revoke all on public.client_reports from authenticated;

revoke all on public.client_profiles from anon;
revoke all on public.client_saved_projects from anon;
revoke all on public.client_saved_comparisons from anon;
revoke all on public.client_portfolio_assets from anon;
revoke all on public.client_payment_items from anon;
revoke all on public.client_documents from anon;
revoke all on public.client_advisor_notes from anon;
revoke all on public.client_watchlist_rules from anon;
revoke all on public.client_notifications from anon;
revoke all on public.client_investment_snapshots from anon;
revoke all on public.client_reports from anon;

grant select on public.client_profiles to authenticated;
grant insert (user_id,email,full_name,phone,preferred_locale,preferred_currency,marketing_opt_in) on public.client_profiles to authenticated;
grant update (full_name,phone,preferred_locale,preferred_currency,marketing_opt_in,last_seen_at) on public.client_profiles to authenticated;

grant select, insert, delete on public.client_saved_projects to authenticated;
grant select, insert, update, delete on public.client_saved_comparisons to authenticated;
grant select on public.client_portfolio_assets to authenticated;
grant select on public.client_payment_items to authenticated;
grant select on public.client_documents to authenticated;
grant select on public.client_advisor_notes to authenticated;
grant select, insert, update, delete on public.client_watchlist_rules to authenticated;
grant select on public.client_notifications to authenticated;
grant update (is_read,read_at) on public.client_notifications to authenticated;
grant select, insert, delete on public.client_investment_snapshots to authenticated;
grant select on public.client_reports to authenticated;

-- Service role is used only by server-side admin/document-signing code and keeps full access.
-- No public policy is added for keyhold-private-documents. Clients download through a short-lived signed URL after server-side ownership verification.
