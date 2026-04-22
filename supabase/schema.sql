-- Run this in your Supabase SQL editor

-- Profiles table (all users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'organizer' check (role in ('musician', 'organizer')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Musicians extended profile
create table public.musicians (
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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.musicians enable row level security;

create policy "Musicians are viewable by everyone" on public.musicians
  for select using (true);

create policy "Musicians can update own record" on public.musicians
  for update using (auth.uid() = id);

create policy "Musicians can insert own record" on public.musicians
  for insert with check (auth.uid() = id);

-- Bookings
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  musician_id uuid references public.musicians(id) on delete cascade not null,
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  event_name text not null,
  event_date date not null,
  event_time text,
  duration_hours integer,
  location text,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  budget integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bookings enable row level security;

create policy "Musicians can see their bookings" on public.bookings
  for select using (auth.uid() = musician_id);

create policy "Organizers can see their bookings" on public.bookings
  for select using (auth.uid() = organizer_id);

create policy "Organizers can create bookings" on public.bookings
  for insert with check (auth.uid() = organizer_id);

create policy "Musicians can update booking status" on public.bookings
  for update using (auth.uid() = musician_id);

create policy "Organizers can cancel their bookings" on public.bookings
  for update using (auth.uid() = organizer_id);

-- Reviews
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade unique not null,
  musician_id uuid references public.musicians(id) on delete cascade not null,
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone" on public.reviews
  for select using (true);

create policy "Organizers can create reviews" on public.reviews
  for insert with check (auth.uid() = organizer_id);

-- Trigger to create profile (and musicians row if applicable) on signup
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- View for musician listing with profile + avg rating
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
