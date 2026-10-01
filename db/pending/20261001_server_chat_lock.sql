-- Apply once Supabase is connected.
-- Server-side chat PIN lock. PINs are bcrypt-hashed in the database and
-- wrong-PIN limits are enforced here, so clearing browser storage can't bypass them.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.chat_locks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pin_hash text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

-- No direct table access: everything goes through the functions below.
revoke all on public.chat_locks from anon, authenticated;
grant all on public.chat_locks to service_role;
alter table public.chat_locks enable row level security;

create or replace function public.chat_lock_status()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'enabled', exists(select 1 from chat_locks where user_id = auth.uid()),
    'locked_until', (select locked_until from chat_locks where user_id = auth.uid() and locked_until > now())
  );
$$;

-- Set a PIN. If one already exists, the current PIN must be supplied.
create or replace function public.set_chat_pin(_new_pin text, _current_pin text default null)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare r chat_locks;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', 'not_signed_in'); end if;
  if _new_pin !~ '^[0-9]{4}$' then return json_build_object('ok', false, 'error', 'invalid_pin'); end if;
  select * into r from chat_locks where user_id = auth.uid();
  if found then
    if r.locked_until is not null and r.locked_until > now() then
      return json_build_object('ok', false, 'error', 'locked', 'locked_until', r.locked_until);
    end if;
    if _current_pin is null or crypt(_current_pin, r.pin_hash) <> r.pin_hash then
      return json_build_object('ok', false, 'error', 'wrong_pin');
    end if;
  end if;
  insert into chat_locks(user_id, pin_hash) values (auth.uid(), crypt(_new_pin, gen_salt('bf')))
  on conflict (user_id) do update set pin_hash = excluded.pin_hash, failed_attempts = 0, locked_until = null, updated_at = now();
  return json_build_object('ok', true);
end $$;

-- Check a PIN. 5 wrong attempts lock for 60 seconds.
create or replace function public.verify_chat_pin(_pin text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare r chat_locks; n int;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', 'not_signed_in'); end if;
  select * into r from chat_locks where user_id = auth.uid() for update;
  if not found then return json_build_object('ok', true); end if;
  if r.locked_until is not null and r.locked_until > now() then
    return json_build_object('ok', false, 'error', 'locked', 'locked_until', r.locked_until);
  end if;
  if crypt(_pin, r.pin_hash) = r.pin_hash then
    update chat_locks set failed_attempts = 0, locked_until = null where user_id = auth.uid();
    return json_build_object('ok', true);
  end if;
  n := r.failed_attempts + 1;
  if n >= 5 then
    update chat_locks set failed_attempts = 0, locked_until = now() + interval '60 seconds' where user_id = auth.uid();
    return json_build_object('ok', false, 'error', 'locked', 'locked_until', now() + interval '60 seconds');
  end if;
  update chat_locks set failed_attempts = n where user_id = auth.uid();
  return json_build_object('ok', false, 'error', 'wrong_pin', 'attempts_left', 5 - n);
end $$;

create or replace function public.remove_chat_pin(_current_pin text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare v json;
begin
  v := public.verify_chat_pin(_current_pin);
  if (v->>'ok')::boolean is not true then return v; end if;
  delete from chat_locks where user_id = auth.uid();
  return json_build_object('ok', true);
end $$;

revoke all on function public.chat_lock_status() from public, anon;
revoke all on function public.set_chat_pin(text, text) from public, anon;
revoke all on function public.verify_chat_pin(text) from public, anon;
revoke all on function public.remove_chat_pin(text) from public, anon;
grant execute on function public.chat_lock_status() to authenticated;
grant execute on function public.set_chat_pin(text, text) to authenticated;
grant execute on function public.verify_chat_pin(text) to authenticated;
grant execute on function public.remove_chat_pin(text) to authenticated;
