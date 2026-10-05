-- YAAWP core schema + corrected RLS. Replaces db/superseded/20260908000000_enable_rls.sql
-- (which let users read only their OWN profiles/posts — wrong for a social network).
-- Review against your live project before applying.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  name text,
  avatar text,
  bio text,
  website text,
  is_verified boolean not null default false,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- email is intentionally NOT stored here: profiles are readable by other users.

create table if not exists public.custom_circles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.circle_members (
  circle_id uuid not null references public.custom_circles(id) on delete cascade,
  member_user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (circle_id, member_user_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  caption text,
  media_url text,
  media_type text,
  filter_class text,
  tags text[],
  location text,
  audience text not null default 'everyone' check (audience in ('everyone','circle','only_me')),
  circle_id uuid references public.custom_circles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_posts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.hidden_profiles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  hidden_user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (user_id, hidden_user_id)
);

-- ImageKit / Gumlet asset metadata (media bytes never live in Supabase).
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('imagekit','gumlet')),
  kind text not null check (kind in ('image','video')),
  folder text,
  provider_asset_id text not null,
  url text,
  thumbnail_url text,
  file_path text,
  mime_type text,
  size_bytes bigint,
  width int,
  height int,
  created_at timestamptz not null default now(),
  unique (provider, provider_asset_id)
);

grant select, insert, update, delete on public.profiles, public.posts, public.custom_circles,
  public.circle_members, public.saved_posts, public.hidden_profiles, public.media_assets to authenticated;
grant all on public.profiles, public.posts, public.custom_circles, public.circle_members,
  public.saved_posts, public.hidden_profiles, public.media_assets to service_role;
-- No anon grants: content is visible to signed-in users only.

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.custom_circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.saved_posts enable row level security;
alter table public.hidden_profiles enable row level security;
alter table public.media_assets enable row level security;

-- Circle membership helper (security definer avoids RLS recursion).
create or replace function public.is_circle_member(_circle uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from circle_members where circle_id = _circle and member_user_id = _user)
      or exists(select 1 from custom_circles where id = _circle and user_id = _user);
$$;
revoke all on function public.is_circle_member(uuid, uuid) from public, anon;
grant execute on function public.is_circle_member(uuid, uuid) to authenticated;

-- PROFILES: discoverable by signed-in users (basic card); only owner edits.
create policy "profiles_read_signed_in" on public.profiles for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_delete_own" on public.profiles for delete to authenticated using (id = auth.uid());

-- POSTS: owner always; 'everyone' posts from public profiles; circle posts to members.
create policy "posts_read" on public.posts for select to authenticated using (
  user_id = auth.uid()
  or (audience = 'everyone' and exists(select 1 from profiles p where p.id = posts.user_id and not p.is_private))
  or (audience = 'circle' and circle_id is not null and public.is_circle_member(circle_id, auth.uid()))
);
create policy "posts_insert_own" on public.posts for insert to authenticated with check (
  user_id = auth.uid()
  and (circle_id is null or exists(select 1 from custom_circles c where c.id = circle_id and c.user_id = auth.uid()))
);
create policy "posts_update_own" on public.posts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "posts_delete_own" on public.posts for delete to authenticated using (user_id = auth.uid());

-- CIRCLES: owner manages; members can see circles they belong to.
create policy "circles_read" on public.custom_circles for select to authenticated using (public.is_circle_member(id, auth.uid()));
create policy "circles_write_own" on public.custom_circles for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "circle_members_read" on public.circle_members for select to authenticated using (
  member_user_id = auth.uid() or exists(select 1 from custom_circles c where c.id = circle_id and c.user_id = auth.uid()));
create policy "circle_members_owner_write" on public.circle_members for all to authenticated
  using (exists(select 1 from custom_circles c where c.id = circle_id and c.user_id = auth.uid()))
  with check (exists(select 1 from custom_circles c where c.id = circle_id and c.user_id = auth.uid()));

-- PRIVATE LISTS: own rows only.
create policy "saved_own" on public.saved_posts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "hidden_own" on public.hidden_profiles for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "media_own" on public.media_assets for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Auto-create profile on signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name) values (new.id, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
