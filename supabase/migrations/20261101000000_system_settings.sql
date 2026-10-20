-- System-wide control flags for super admin emergency controls
-- (Lock System, Maintenance Mode).
create table if not exists public.system_settings (
  key        text primary key,
  value      boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table public.system_settings enable row level security;

-- Anyone (including unauthenticated callers, e.g. the login route and proxy)
-- may read the flags. Only the service role can write — no write policies.
create policy "system_settings_read_all"
  on public.system_settings for select
  using (true);

insert into public.system_settings (key, value) values
  ('logins_locked', false),
  ('maintenance_mode', false)
on conflict (key) do nothing;
