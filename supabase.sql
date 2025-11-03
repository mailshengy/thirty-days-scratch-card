-- Run this in Supabase SQL editor (shared global scratch card)

create extension if not exists pgcrypto;

create table if not exists tile_reveals (
  tile_index int primary key check (tile_index between 1 and 30),
  quote      text not null,
  revealed_at timestamptz not null default now()
);

-- No per-user auth. Make table globally readable/writable (RLS OFF).
alter table tile_reveals disable row level security;

-- Realtime
alter publication supabase_realtime add table tile_reveals;
