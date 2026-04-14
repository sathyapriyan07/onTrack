-- ============================================================
-- F1 DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Seasons
create table if not exists seasons (
  id serial primary key,
  year integer unique not null
);

-- Circuits
create table if not exists circuits (
  id serial primary key,
  circuit_id text unique not null,
  name text not null,
  locality text,
  country text,
  lat numeric,
  long numeric
);

-- Constructors
create table if not exists constructors (
  id serial primary key,
  constructor_id text unique not null,
  name text not null,
  nationality text,
  logo_url text
);

-- Drivers
create table if not exists drivers (
  id serial primary key,
  driver_id text unique not null,
  code text,
  permanent_number text,
  given_name text not null,
  family_name text not null,
  date_of_birth date,
  nationality text,
  image_url text,
  bio text
);

-- Races
create table if not exists races (
  id serial primary key,
  season_id integer not null references seasons(id) on delete cascade,
  round integer not null,
  race_name text not null,
  date date,
  time text,
  circuit_id integer not null references circuits(id) on delete restrict,
  unique(season_id, round)
);

-- Race Results
create table if not exists race_results (
  id serial primary key,
  race_id integer not null references races(id) on delete cascade,
  driver_id integer not null references drivers(id) on delete cascade,
  constructor_id integer not null references constructors(id) on delete cascade,
  grid integer,
  position integer,
  points numeric default 0,
  laps integer,
  status text,
  time text,
  fastest_lap_time text,
  fastest_lap_speed text,
  unique(race_id, driver_id)
);

-- Qualifying Results
create table if not exists qualifying_results (
  id serial primary key,
  race_id integer not null references races(id) on delete cascade,
  driver_id integer not null references drivers(id) on delete cascade,
  constructor_id integer not null references constructors(id) on delete cascade,
  position integer,
  q1 text,
  q2 text,
  q3 text,
  unique(race_id, driver_id)
);

-- Sprint Results
create table if not exists sprint_results (
  id serial primary key,
  race_id integer not null references races(id) on delete cascade,
  driver_id integer not null references drivers(id) on delete cascade,
  constructor_id integer not null references constructors(id) on delete cascade,
  grid integer,
  position integer,
  points numeric default 0,
  laps integer,
  time text,
  unique(race_id, driver_id)
);

-- Driver Standings
create table if not exists driver_standings (
  id serial primary key,
  season_id integer not null references seasons(id) on delete cascade,
  driver_id integer not null references drivers(id) on delete cascade,
  points numeric default 0,
  wins integer default 0,
  position integer,
  unique(season_id, driver_id)
);

-- Constructor Standings
create table if not exists constructor_standings (
  id serial primary key,
  season_id integer not null references seasons(id) on delete cascade,
  constructor_id integer not null references constructors(id) on delete cascade,
  points numeric default 0,
  wins integer default 0,
  position integer,
  unique(season_id, constructor_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_races_season on races(season_id);
create index if not exists idx_races_circuit on races(circuit_id);
create index if not exists idx_race_results_race on race_results(race_id);
create index if not exists idx_race_results_driver on race_results(driver_id);
create index if not exists idx_race_results_constructor on race_results(constructor_id);
create index if not exists idx_qualifying_race on qualifying_results(race_id);
create index if not exists idx_sprint_race on sprint_results(race_id);
create index if not exists idx_driver_standings_season on driver_standings(season_id);
create index if not exists idx_constructor_standings_season on constructor_standings(season_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table seasons enable row level security;
alter table circuits enable row level security;
alter table constructors enable row level security;
alter table drivers enable row level security;
alter table races enable row level security;
alter table race_results enable row level security;
alter table qualifying_results enable row level security;
alter table sprint_results enable row level security;
alter table driver_standings enable row level security;
alter table constructor_standings enable row level security;

-- Public read access
create policy "public read seasons" on seasons for select using (true);
create policy "public read circuits" on circuits for select using (true);
create policy "public read constructors" on constructors for select using (true);
create policy "public read drivers" on drivers for select using (true);
create policy "public read races" on races for select using (true);
create policy "public read race_results" on race_results for select using (true);
create policy "public read qualifying_results" on qualifying_results for select using (true);
create policy "public read sprint_results" on sprint_results for select using (true);
create policy "public read driver_standings" on driver_standings for select using (true);
create policy "public read constructor_standings" on constructor_standings for select using (true);

-- Admin write access (authenticated users only)
create policy "admin write seasons" on seasons for all using (auth.role() = 'authenticated');
create policy "admin write circuits" on circuits for all using (auth.role() = 'authenticated');
create policy "admin write constructors" on constructors for all using (auth.role() = 'authenticated');
create policy "admin write drivers" on drivers for all using (auth.role() = 'authenticated');
create policy "admin write races" on races for all using (auth.role() = 'authenticated');
create policy "admin write race_results" on race_results for all using (auth.role() = 'authenticated');
create policy "admin write qualifying_results" on qualifying_results for all using (auth.role() = 'authenticated');
create policy "admin write sprint_results" on sprint_results for all using (auth.role() = 'authenticated');
create policy "admin write driver_standings" on driver_standings for all using (auth.role() = 'authenticated');
create policy "admin write constructor_standings" on constructor_standings for all using (auth.role() = 'authenticated');
