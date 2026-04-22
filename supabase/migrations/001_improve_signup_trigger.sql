-- Run this in Supabase SQL Editor to replace the old trigger
-- This creates the profile + musicians row atomically on signup based on metadata

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

-- Trigger already exists, but recreate safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill: any existing profile with role='musician' that has no musicians row
insert into public.musicians (id)
select p.id from public.profiles p
left join public.musicians m on m.id = p.id
where p.role = 'musician' and m.id is null;
