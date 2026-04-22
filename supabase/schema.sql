-- ============================================
-- Melody — full schema
-- Run this once in the Supabase SQL editor.
-- Safe to re-run: uses drop-and-recreate for policies.
-- ============================================

-- --------- PROFILES ---------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'organizer' check (role in ('musician', 'organizer')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- --------- MUSICIANS ---------
create table if not exists public.musicians (
  id uuid references public.profiles(id) on delete cascade primary key,
  bio text,
  genres text[] default '{}',
  location text,
  city text,
  state text,
  rate_per_hour integer,
  rate_per_event integer,
  years_experience integer default 0,
  is_available boolean default true,
  media_urls text[] default '{}',
  instruments text[] default '{}',
  youtube_url text,
  soundcloud_url text,
  available_dates date[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.musicians enable row level security;

drop policy if exists "Musicians are viewable by everyone" on public.musicians;
drop policy if exists "Musicians can update own record" on public.musicians;
drop policy if exists "Musicians can insert own record" on public.musicians;

create policy "Musicians are viewable by everyone" on public.musicians
  for select using (true);
create policy "Musicians can update own record" on public.musicians
  for update using (auth.uid() = id);
create policy "Musicians can insert own record" on public.musicians
  for insert with check (auth.uid() = id);

-- Add new columns if table already existed
alter table public.musicians add column if not exists youtube_url text;
alter table public.musicians add column if not exists soundcloud_url text;
alter table public.musicians add column if not exists available_dates date[] default '{}';

-- --------- BOOKINGS ---------
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  musician_id uuid references public.musicians(id) on delete cascade not null,
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  event_name text not null,
  event_date date not null,
  event_time text,
  duration_hours integer,
  location text,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  budget integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Make sure the 'completed' status is allowed even if table pre-existed
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending', 'accepted', 'declined', 'cancelled', 'completed'));

alter table public.bookings enable row level security;

drop policy if exists "Musicians can see their bookings" on public.bookings;
drop policy if exists "Organizers can see their bookings" on public.bookings;
drop policy if exists "Organizers can create bookings" on public.bookings;
drop policy if exists "Musicians can update booking status" on public.bookings;
drop policy if exists "Organizers can cancel their bookings" on public.bookings;

create policy "Musicians can see their bookings" on public.bookings
  for select using (auth.uid() = musician_id);
create policy "Organizers can see their bookings" on public.bookings
  for select using (auth.uid() = organizer_id);
create policy "Organizers can create bookings" on public.bookings
  for insert with check (auth.uid() = organizer_id);

-- Tight update policies: only the fields each role should touch.
-- Postgres RLS is row-level, so we guard columns with a trigger.
create policy "Musicians can update their booking rows" on public.bookings
  for update using (auth.uid() = musician_id);
create policy "Organizers can update their booking rows" on public.bookings
  for update using (auth.uid() = organizer_id);

create or replace function public.guard_booking_update()
returns trigger as $$
begin
  if auth.uid() = old.musician_id then
    -- Musicians may only flip status between pending → accepted/declined/completed
    if (new.event_name is distinct from old.event_name)
       or (new.event_date is distinct from old.event_date)
       or (new.event_time is distinct from old.event_time)
       or (new.duration_hours is distinct from old.duration_hours)
       or (new.location is distinct from old.location)
       or (new.budget is distinct from old.budget)
       or (new.organizer_id is distinct from old.organizer_id)
       or (new.musician_id is distinct from old.musician_id) then
      raise exception 'Musicians can only update the status field';
    end if;
    if new.status not in ('accepted', 'declined', 'completed') then
      raise exception 'Invalid status transition';
    end if;
  elsif auth.uid() = old.organizer_id then
    -- Organizers may only cancel, or edit details while still pending.
    if old.status <> 'pending' and new.status not in ('cancelled', old.status) then
      raise exception 'Organizers can only cancel once a booking has been actioned';
    end if;
    if new.musician_id is distinct from old.musician_id then
      raise exception 'Organizers cannot change the musician';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists guard_booking_update_trigger on public.bookings;
create trigger guard_booking_update_trigger
  before update on public.bookings
  for each row execute procedure public.guard_booking_update();

-- --------- REVIEWS ---------
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade unique not null,
  musician_id uuid references public.musicians(id) on delete cascade not null,
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

drop policy if exists "Reviews are viewable by everyone" on public.reviews;
drop policy if exists "Organizers can create reviews" on public.reviews;

create policy "Reviews are viewable by everyone" on public.reviews
  for select using (true);
create policy "Organizers can create reviews" on public.reviews
  for insert with check (auth.uid() = organizer_id);

-- --------- MESSAGES (per booking) ---------
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

drop policy if exists "Booking participants can read messages" on public.messages;
drop policy if exists "Booking participants can send messages" on public.messages;

create policy "Booking participants can read messages" on public.messages
  for select using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and (b.musician_id = auth.uid() or b.organizer_id = auth.uid())
    )
  );

create policy "Booking participants can send messages" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id and (b.musician_id = auth.uid() or b.organizer_id = auth.uid())
    )
  );

create index if not exists messages_booking_id_idx on public.messages(booking_id, created_at);

-- --------- SIGNUP TRIGGER ---------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'organizer');

  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    user_role
  );

  if user_role = 'musician' then
    insert into public.musicians (id) values (new.id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- --------- VIEW: musician_listings ---------
drop view if exists public.musician_listings;
create or replace view public.musician_listings as
select
  m.*,
  p.full_name,
  p.email,
  p.avatar_url,
  coalesce(avg(r.rating), 0) as avg_rating,
  count(r.id) as review_count
from public.musicians m
join public.profiles p on p.id = m.id
left join public.reviews r on r.musician_id = m.id
group by m.id, p.full_name, p.email, p.avatar_url;

-- --------- STORAGE BUCKETS ---------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Owners can upload to folders named with their UID
drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Avatars are publicly readable" on storage.objects;
create policy "Avatars are publicly readable" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "Users can upload own media" on storage.objects;
create policy "Users can upload own media" on storage.objects
  for insert with check (
    bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own media" on storage.objects;
create policy "Users can delete own media" on storage.objects
  for delete using (
    bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Media is publicly readable" on storage.objects;
create policy "Media is publicly readable" on storage.objects
  for select using (bucket_id = 'media');
