-- Monthly Challenge Supabase V1
-- Execute this in the Supabase SQL editor after creating the project.

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid references auth.users(id) on delete cascade,
  title text not null default '',
  month text not null,
  kind text not null default 'personal',
  invite_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint challenges_kind_check check (kind in ('personal', 'shared'))
);

alter table public.challenges
  add column if not exists created_by uuid references auth.users(id) on delete cascade;

alter table public.challenges
  add column if not exists kind text not null default 'personal';

alter table public.challenges
  add column if not exists invite_code text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'challenges_kind_check'
  ) then
    alter table public.challenges
      add constraint challenges_kind_check check (kind in ('personal', 'shared'));
  end if;
end;
$$;

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  status text not null default 'done',
  created_at timestamptz not null default now(),
  constraint check_ins_status_check check (status in ('done'))
);

update public.challenges
set created_by = user_id
where created_by is null;

drop index if exists challenges_user_month_idx;

create unique index if not exists challenges_user_personal_month_idx
  on public.challenges (user_id, month)
  where kind = 'personal';

create unique index if not exists challenges_invite_code_idx
  on public.challenges (invite_code)
  where invite_code is not null;

drop index if exists check_ins_challenge_date_idx;

create unique index if not exists check_ins_challenge_user_date_idx
  on public.check_ins (challenge_id, user_id, date);

create table if not exists public.challenge_members (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id),
  constraint challenge_members_role_check check (role in ('owner', 'member'))
);

create or replace function public.is_challenge_member(challenge_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.challenge_members cm
    where cm.challenge_id = is_challenge_member.challenge_id
      and cm.user_id = auth.uid()
  );
$$;

create or replace function public.join_challenge_by_invite(invite_code_input text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_challenge_id uuid;
begin
  select id into target_challenge_id
  from public.challenges c
  where c.invite_code = invite_code_input
    and kind = 'shared';

  if target_challenge_id is null then
    raise exception 'Invite code not found';
  end if;

  insert into public.challenge_members (challenge_id, user_id, role)
  values (target_challenge_id, auth.uid(), 'member')
  on conflict (challenge_id, user_id) do nothing;

  return target_challenge_id;
end;
$$;

alter table public.challenges enable row level security;
alter table public.check_ins enable row level security;
alter table public.challenge_members enable row level security;

drop policy if exists "Users can read their own challenges" on public.challenges;
create policy "Users can read their own challenges"
  on public.challenges for select
  using (
    auth.uid() = user_id
    or (kind = 'shared' and public.is_challenge_member(id))
  );

drop policy if exists "Users can insert their own challenges" on public.challenges;
create policy "Users can insert their own challenges"
  on public.challenges for insert
  with check (auth.uid() = user_id and auth.uid() = created_by);

drop policy if exists "Users can update their own challenges" on public.challenges;
create policy "Users can update their own challenges"
  on public.challenges for update
  using (auth.uid() = user_id or auth.uid() = created_by)
  with check (auth.uid() = user_id or auth.uid() = created_by);

drop policy if exists "Users can delete their own challenges" on public.challenges;
create policy "Users can delete their own challenges"
  on public.challenges for delete
  using (auth.uid() = user_id or auth.uid() = created_by);

drop policy if exists "Users can read their own check-ins" on public.check_ins;
create policy "Users can read their own check-ins"
  on public.check_ins for select
  using (
    auth.uid() = user_id
    or public.is_challenge_member(challenge_id)
  );

drop policy if exists "Users can insert their own check-ins" on public.check_ins;
create policy "Users can insert their own check-ins"
  on public.check_ins for insert
  with check (
    auth.uid() = user_id
    and (
      exists (
        select 1
        from public.challenges c
        where c.id = challenge_id
          and c.user_id = auth.uid()
      )
      or public.is_challenge_member(challenge_id)
    )
  );

drop policy if exists "Users can delete their own check-ins" on public.check_ins;
create policy "Users can delete their own check-ins"
  on public.check_ins for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read shared challenge members" on public.challenge_members;
create policy "Users can read shared challenge members"
  on public.challenge_members for select
  using (public.is_challenge_member(challenge_id));

drop policy if exists "Users can insert themselves as members" on public.challenge_members;
create policy "Users can insert themselves as members"
  on public.challenge_members for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own membership" on public.challenge_members;
create policy "Users can delete their own membership"
  on public.challenge_members for delete
  using (auth.uid() = user_id);
