import { supabase } from './supabase';

const BIG = 10000;

export const db = {
  seasons: {
    getAll: () => supabase.from('seasons').select('*').order('year', { ascending: false }).limit(BIG),
    getById: (id) => supabase.from('seasons').select('*').eq('id', id).single(),
    create: (data) => supabase.from('seasons').insert(data).select().single(),
    update: (id, data) => supabase.from('seasons').update(data).eq('id', id).select().single(),
    delete: (id) => supabase.from('seasons').delete().eq('id', id),
  },

  circuits: {
    getAll: () => supabase.from('circuits').select('*').order('name').limit(BIG),
    getById: (id) => supabase.from('circuits').select('*').eq('id', id).single(),
    create: (data) => supabase.from('circuits').insert(data).select().single(),
    update: (id, data) => supabase.from('circuits').update(data).eq('id', id).select().single(),
    delete: (id) => supabase.from('circuits').delete().eq('id', id),
  },

  drivers: {
    getAll: () => supabase.from('drivers').select('*').order('family_name').limit(BIG),
    getById: (id) => supabase.from('drivers').select('*').eq('id', id).single(),
    getByDriverId: (driverId) => supabase.from('drivers').select('*').eq('driver_id', driverId).single(),
    create: (data) => supabase.from('drivers').insert(data).select().single(),
    update: (id, data) => supabase.from('drivers').update(data).eq('id', id).select().single(),
    delete: (id) => supabase.from('drivers').delete().eq('id', id),
  },

  constructors: {
    getAll: () => supabase.from('constructors').select('*').order('name').limit(BIG),
    getById: (id) => supabase.from('constructors').select('*').eq('id', id).single(),
    create: (data) => supabase.from('constructors').insert(data).select().single(),
    update: (id, data) => supabase.from('constructors').update(data).eq('id', id).select().single(),
    delete: (id) => supabase.from('constructors').delete().eq('id', id),
  },

  races: {
    getAll: () =>
      supabase.from('races').select('*, seasons(year), circuits(name, locality, country)')
        .order('date', { ascending: false }).limit(BIG),
    getBySeason: (seasonId) =>
      supabase.from('races').select('*, circuits(name, locality, country)')
        .eq('season_id', seasonId).order('round').limit(BIG),
    getById: (id) =>
      supabase.from('races').select('*, seasons(year), circuits(*)').eq('id', id).single(),
    create: (data) => supabase.from('races').insert(data).select().single(),
    update: (id, data) => supabase.from('races').update(data).eq('id', id).select().single(),
    delete: (id) => supabase.from('races').delete().eq('id', id),
  },

  raceResults: {
    getByRace: (raceId) =>
      supabase.from('race_results')
        .select('*, drivers(given_name, family_name, code, driver_id), constructors(name)')
        .eq('race_id', raceId).order('position').limit(BIG),
    getByDriver: (driverId) =>
      supabase.from('race_results')
        .select('*, races(id, race_name, date, round, season_id, seasons(year)), constructors(id, name, constructor_id, logo_url)')
        .eq('driver_id', driverId).limit(BIG),
    getByConstructor: (constructorId) =>
      supabase.from('race_results')
        .select('*, races(race_name, date, round, seasons(year)), drivers(given_name, family_name, driver_id)')
        .eq('constructor_id', constructorId).limit(BIG),
    create: (data) => supabase.from('race_results').insert(data).select().single(),
    update: (id, data) => supabase.from('race_results').update(data).eq('id', id).select().single(),
    delete: (id) => supabase.from('race_results').delete().eq('id', id),
  },

  qualifying: {
    getByRace: (raceId) =>
      supabase.from('qualifying_results')
        .select('*, drivers(given_name, family_name, code, driver_id), constructors(name)')
        .eq('race_id', raceId).order('position').limit(BIG),
    getByDriver: (driverId) =>
      supabase.from('qualifying_results')
        .select('race_id, position').eq('driver_id', driverId).limit(BIG),
    getByConstructor: (constructorId) =>
      supabase.from('qualifying_results')
        .select('race_id, position, driver_id').eq('constructor_id', constructorId).limit(BIG),
  },

  sprint: {
    getByRace: (raceId) =>
      supabase.from('sprint_results')
        .select('*, drivers(given_name, family_name, code, driver_id), constructors(name)')
        .eq('race_id', raceId).order('position').limit(BIG),
  },

  driverStandings: {
    getBySeason: (seasonId) =>
      supabase.from('driver_standings')
        .select('*, drivers(given_name, family_name, code, nationality, driver_id)')
        .eq('season_id', seasonId).order('position').limit(BIG),
    getByDriver: (driverId) =>
      supabase.from('driver_standings')
        .select('position, points, wins, season_id, seasons(year)')
        .eq('driver_id', driverId).limit(BIG),
  },

  constructorStandings: {
    getBySeason: (seasonId) =>
      supabase.from('constructor_standings')
        .select('*, constructors(name, nationality, constructor_id)')
        .eq('season_id', seasonId).order('position').limit(BIG),
    getByConstructor: (constructorId) =>
      supabase.from('constructor_standings')
        .select('position, points, wins, season_id, seasons(year)')
        .eq('constructor_id', constructorId).limit(BIG),
  },
};
