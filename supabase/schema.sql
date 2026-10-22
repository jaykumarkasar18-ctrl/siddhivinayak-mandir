-- Run in Supabase SQL Editor. Seed rows at the bottom are DEMO data: delete them from the admin panel.
create table profiles(id uuid primary key references auth.users on delete cascade,email text,full_name text,role text not null default 'user' check(role in('user','admin')),created_at timestamptz default now());
create table members(id uuid primary key default gen_random_uuid(),full_name text not null,family_name text not null,mobile_number text,email text,profile_photo text,preferred_language text default 'mr',active boolean default true,created_at timestamptz default now());
create table aarti_schedule(id uuid primary key default gen_random_uuid(),member_id uuid not null references members on delete cascade,aarti_date date not null,aarti_time time not null default '19:00',notes text,status text not null default 'scheduled' check(status in('scheduled','completed','cancelled')),created_at timestamptz default now(),updated_at timestamptz default now());
create unique index one_aarti_per_day on aarti_schedule(aarti_date) where status<>'cancelled';
create table events(id uuid primary key default gen_random_uuid(),category text default 'festival',title_mr text not null,title_en text,description_mr text,description_en text,event_date date not null,start_time time,end_time time,location text,image text,published boolean default true,created_at timestamptz default now());
create index on events(event_date);
create table announcements(id uuid primary key default gen_random_uuid(),title_mr text not null,title_en text,description_mr text,description_en text,priority text default 'normal',pinned boolean default false,published boolean default true,image text,created_at timestamptz default now());
create table community_messages(id uuid primary key default gen_random_uuid(),name text not null check(char_length(name)<=60),message text not null check(char_length(message) between 3 and 300),language text default 'mr',status text not null default 'pending' check(status in('pending','approved','rejected')),created_at timestamptz default now(),approved_at timestamptz);

create function is_admin() returns boolean language sql security definer stable as $$select exists(select 1 from profiles where id=auth.uid() and role='admin')$$;
create function handle_new_user() returns trigger language plpgsql security definer as $$begin insert into profiles(id,email) values(new.id,new.email);return new;end$$;
create trigger on_signup after insert on auth.users for each row execute function handle_new_user();

-- Public view exposes names only, never phone numbers.
create view public_aarti as select s.id,s.aarti_date,s.aarti_time,s.notes,s.status,m.full_name,m.family_name,m.profile_photo from aarti_schedule s join members m on m.id=s.member_id;
grant select on public_aarti to anon,authenticated;

alter table profiles enable row level security; alter table members enable row level security; alter table aarti_schedule enable row level security;
alter table events enable row level security; alter table announcements enable row level security; alter table community_messages enable row level security;
create policy own_profile on profiles for select using(id=auth.uid() or is_admin());
create policy admin_members on members for all using(is_admin()) with check(is_admin());
create policy admin_aarti on aarti_schedule for all using(is_admin()) with check(is_admin());
create policy pub_events on events for select using(published or is_admin());
create policy adm_events on events for all using(is_admin()) with check(is_admin());
create policy pub_ann on announcements for select using(published or is_admin());
create policy adm_ann on announcements for all using(is_admin()) with check(is_admin());
create policy pub_msg on community_messages for select using(status='approved' or is_admin());
create policy submit_msg on community_messages for insert with check(status='pending');
create policy adm_msg on community_messages for update using(is_admin());
create policy adm_msg_del on community_messages for delete using(is_admin());
alter publication supabase_realtime add table aarti_schedule, events, announcements;
-- After signing up, make yourself admin:  update profiles set role='admin' where email='you@example.com';

-- DEMO DATA (fictional)
insert into members(full_name,family_name) values('अमोल पाटील','पाटील'),('राहुल चौधरी','चौधरी'),('सचिन देशमुख','देशमुख');
insert into aarti_schedule(member_id,aarti_date) select id,(now() at time zone 'Asia/Kolkata')::date+(row_number() over())::int-1 from members;
