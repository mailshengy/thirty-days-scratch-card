create extension if not exists pgcrypto;
create table if not exists tile_reveals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  tile_index int not null check (tile_index between 1 and 30),
  quote text not null,
  revealed_at timestamptz not null default now(),
  revealed_date date generated always as ((revealed_at at time zone 'Asia/Singapore')::date) stored
);
create unique index if not exists ux_tile_reveals_user_day on tile_reveals(user_id, revealed_date);
create unique index if not exists ux_tile_reveals_user_tile on tile_reveals(user_id, tile_index);
alter table tile_reveals enable row level security;
create policy "select own" on tile_reveals for select using (auth.uid() = user_id);
create policy "insert own" on tile_reveals for insert with check (auth.uid() = user_id);
create policy "delete own" on tile_reveals for delete using (auth.uid() = user_id);
alter publication supabase_realtime add table tile_reveals;
