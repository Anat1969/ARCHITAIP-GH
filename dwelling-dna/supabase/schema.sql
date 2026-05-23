-- DWELLING DNA — Supabase Schema
-- Run this in the Supabase SQL Editor

-- ─────────────────────────────────────────
-- 1. CULTURES (built-in + custom)
-- ─────────────────────────────────────────
create table if not exists cultures (
  id            text primary key,
  index_order   integer,
  name          text not null,
  archetype     text,
  chaos         text,
  order_concept text,
  role          text,
  colors        jsonb,
  gradient      text,
  vectors       jsonb,
  insight       text,
  paragraph     text,
  post          text,
  spaces        jsonb,
  prompts       jsonb,
  is_custom     boolean default false,
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────
-- 2. FUSIONS
-- ─────────────────────────────────────────
create table if not exists fusions (
  id            text primary key,
  name          text not null,
  name_custom   text,
  lineage       jsonb,   -- { parents[], parent_names[], parent_weights[], fusion_logic }
  chaos         text,
  order_concept text,
  role          text,
  colors        jsonb,
  gradient      text,
  vectors       jsonb,
  insight       text,
  paragraph     text,
  post          text,
  spaces        jsonb,
  prompts       jsonb,
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────
-- 3. CULTURE CONTENT EDITS
--    (user overrides on text fields per culture)
-- ─────────────────────────────────────────
create table if not exists culture_content (
  id          bigserial primary key,
  culture_id  text not null,
  content     jsonb not null,   -- merged overlay of edited fields
  session_id  text,
  updated_at  timestamptz default now(),
  unique (culture_id, session_id)
);

create index if not exists idx_culture_content_culture_id on culture_content(culture_id);

-- ─────────────────────────────────────────
-- 4. CULTURE IMAGES
--    (generated / uploaded image URLs per culture)
-- ─────────────────────────────────────────
create table if not exists culture_images (
  id          bigserial primary key,
  culture_id  text not null,
  images      jsonb not null,   -- { exterior: url, threshold: url, interior: url }
  session_id  text,
  updated_at  timestamptz default now(),
  unique (culture_id, session_id)
);

create index if not exists idx_culture_images_culture_id on culture_images(culture_id);

-- ─────────────────────────────────────────
-- 5. APP STATE
--    (last page + any global session state)
-- ─────────────────────────────────────────
create table if not exists app_state (
  session_id  text primary key,
  last_page   integer default 0,
  updated_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY — open read/write for anon
-- (tighten later when auth is added)
-- ─────────────────────────────────────────
alter table cultures       enable row level security;
alter table fusions        enable row level security;
alter table culture_content enable row level security;
alter table culture_images  enable row level security;
alter table app_state       enable row level security;

create policy "public read cultures"        on cultures        for select using (true);
create policy "public insert cultures"      on cultures        for insert with check (true);
create policy "public update cultures"      on cultures        for update using (true);

create policy "public read fusions"         on fusions         for select using (true);
create policy "public insert fusions"       on fusions         for insert with check (true);
create policy "public delete fusions"       on fusions         for delete using (true);

create policy "public read culture_content"   on culture_content for select using (true);
create policy "public upsert culture_content" on culture_content for insert with check (true);
create policy "public update culture_content" on culture_content for update using (true);

create policy "public read culture_images"    on culture_images  for select using (true);
create policy "public upsert culture_images"  on culture_images  for insert with check (true);
create policy "public update culture_images"  on culture_images  for update using (true);

create policy "public read app_state"       on app_state       for select using (true);
create policy "public upsert app_state"     on app_state       for insert with check (true);
create policy "public update app_state"     on app_state       for update using (true);
