-- REDFLIX core schema. Run only in a dedicated Redflix Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.redflix_titles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  synopsis text not null default '',
  category text not null default 'General',
  content_type text not null check (content_type in ('movie','series')),
  release_year integer,
  maturity_rating text not null default '13+' check (maturity_rating in ('7+','13+','16+','18+')),
  seasons integer,
  runtime_minutes integer,
  poster_url text not null default '',
  hero_image_url text not null default '',
  video_url text not null default '',
  trailer_url text not null default '',
  tags text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists redflix_titles_published_idx on public.redflix_titles (published, featured desc, created_at desc);
create index if not exists redflix_titles_category_idx on public.redflix_titles (category, content_type);

create table if not exists public.redflix_viewer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 20),
  language text not null default 'Español (Latinoamérica)',
  is_kids boolean not null default false,
  maturity text not null default 'ALL' check (maturity in ('ALL','16+','13+','7+')),
  avatar text not null default '#e50914',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists redflix_profiles_user_idx on public.redflix_viewer_profiles(user_id);

create table if not exists public.redflix_watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  viewer_profile_id uuid not null references public.redflix_viewer_profiles(id) on delete cascade,
  title_id uuid not null references public.redflix_titles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, viewer_profile_id, title_id)
);
create table if not exists public.redflix_watch_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  viewer_profile_id uuid not null references public.redflix_viewer_profiles(id) on delete cascade,
  title_id uuid not null references public.redflix_titles(id) on delete cascade,
  progress_seconds integer not null default 0 check(progress_seconds >= 0),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(user_id, viewer_profile_id, title_id)
);

alter table public.redflix_titles enable row level security;
alter table public.redflix_viewer_profiles enable row level security;
alter table public.redflix_watchlist enable row level security;
alter table public.redflix_watch_progress enable row level security;

drop policy if exists "Published Redflix titles are readable" on public.redflix_titles;
create policy "Published Redflix titles are readable" on public.redflix_titles for select to anon, authenticated using (published = true or (select auth.jwt()->'app_metadata'->>'role') = 'admin');
drop policy if exists "Redflix admins manage titles" on public.redflix_titles;
create policy "Redflix admins manage titles" on public.redflix_titles for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin') with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

drop policy if exists "Users manage own Redflix profiles" on public.redflix_viewer_profiles;
create policy "Users read own Redflix profiles" on public.redflix_viewer_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users create own Redflix profiles" on public.redflix_viewer_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own Redflix profiles" on public.redflix_viewer_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own Redflix profiles" on public.redflix_viewer_profiles for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users read own Redflix watchlist" on public.redflix_watchlist for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add to own Redflix watchlist" on public.redflix_watchlist for insert to authenticated with check ((select auth.uid()) = user_id and exists(select 1 from public.redflix_viewer_profiles p where p.id = viewer_profile_id and p.user_id = (select auth.uid())));
create policy "Users remove from own Redflix watchlist" on public.redflix_watchlist for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users read own Redflix progress" on public.redflix_watch_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users create own Redflix progress" on public.redflix_watch_progress for insert to authenticated with check ((select auth.uid()) = user_id and exists(select 1 from public.redflix_viewer_profiles p where p.id = viewer_profile_id and p.user_id = (select auth.uid())));
create policy "Users update own Redflix progress" on public.redflix_watch_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own Redflix progress" on public.redflix_watch_progress for delete to authenticated using ((select auth.uid()) = user_id);

-- Explicit Data API grants: new tables are not automatically exposed on newer projects.
grant select on public.redflix_titles to anon, authenticated;
grant insert, update, delete on public.redflix_titles to authenticated;
grant select, insert, update, delete on public.redflix_viewer_profiles to authenticated;
grant select, insert, delete on public.redflix_watchlist to authenticated;
grant select, insert, update, delete on public.redflix_watch_progress to authenticated;

-- Poster art is public; source video stays private and is read only by signed-in users.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('redflix-posters','redflix-posters',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('redflix-media','redflix-media',false,5368709120,array['video/mp4','video/webm','application/vnd.apple.mpegurl','application/x-mpegURL'])
on conflict (id) do nothing;

drop policy if exists "Public can view Redflix posters" on storage.objects;
create policy "Public can view Redflix posters" on storage.objects for select to anon, authenticated using (bucket_id = 'redflix-posters');
drop policy if exists "Admins upload Redflix posters" on storage.objects;
create policy "Admins upload Redflix posters" on storage.objects for insert to authenticated with check (bucket_id = 'redflix-posters' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');
drop policy if exists "Admins update Redflix posters" on storage.objects;
create policy "Admins update Redflix posters" on storage.objects for update to authenticated using (bucket_id = 'redflix-posters' and (select auth.jwt()->'app_metadata'->>'role') = 'admin') with check (bucket_id = 'redflix-posters' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');
drop policy if exists "Admins delete Redflix posters" on storage.objects;
create policy "Admins delete Redflix posters" on storage.objects for delete to authenticated using (bucket_id = 'redflix-posters' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');
drop policy if exists "Signed in users read Redflix media" on storage.objects;
create policy "Signed in users read Redflix media" on storage.objects for select to authenticated using (bucket_id = 'redflix-media');
drop policy if exists "Admins upload Redflix media" on storage.objects;
create policy "Admins upload Redflix media" on storage.objects for insert to authenticated with check (bucket_id = 'redflix-media' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');
drop policy if exists "Admins update Redflix media" on storage.objects;
create policy "Admins update Redflix media" on storage.objects for update to authenticated using (bucket_id = 'redflix-media' and (select auth.jwt()->'app_metadata'->>'role') = 'admin') with check (bucket_id = 'redflix-media' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');
drop policy if exists "Admins delete Redflix media" on storage.objects;
create policy "Admins delete Redflix media" on storage.objects for delete to authenticated using (bucket_id = 'redflix-media' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');
