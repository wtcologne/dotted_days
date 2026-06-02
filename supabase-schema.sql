-- Monthly Challenge Supabase draft
-- Noch nicht ausführen, erst bei echter Supabase-Integration prüfen.

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text not null default '',
  month text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid,
  date date not null,
  status text not null default 'done',
  created_at timestamptz not null default now(),
  constraint check_ins_status_check check (status in ('done'))
);

create unique index if not exists challenges_user_month_idx
  on public.challenges (user_id, month);

create unique index if not exists check_ins_challenge_date_idx
  on public.check_ins (challenge_id, date);

-- RLS draft:
-- Noch nicht ausführen, erst bei echter Supabase-Integration prüfen.
--
-- alter table public.challenges enable row level security;
-- alter table public.check_ins enable row level security;
--
-- alter table public.challenges
--   add constraint challenges_user_id_fkey
--   foreign key (user_id) references auth.users(id) on delete cascade;
--
-- alter table public.check_ins
--   add constraint check_ins_user_id_fkey
--   foreign key (user_id) references auth.users(id) on delete cascade;
--
-- create policy "Users can read their own challenges"
--   on public.challenges for select
--   using (auth.uid() = user_id);
--
-- create policy "Users can insert their own challenges"
--   on public.challenges for insert
--   with check (auth.uid() = user_id);
--
-- create policy "Users can update their own challenges"
--   on public.challenges for update
--   using (auth.uid() = user_id)
--   with check (auth.uid() = user_id);
--
-- create policy "Users can delete their own challenges"
--   on public.challenges for delete
--   using (auth.uid() = user_id);
--
-- create policy "Users can read their own check-ins"
--   on public.check_ins for select
--   using (auth.uid() = user_id);
--
-- create policy "Users can insert their own check-ins"
--   on public.check_ins for insert
--   with check (auth.uid() = user_id);
--
-- create policy "Users can delete their own check-ins"
--   on public.check_ins for delete
--   using (auth.uid() = user_id);
