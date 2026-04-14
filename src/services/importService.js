import { supabase } from './supabase';
import { jolpicaAPI } from './jolpicaAPI';

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(msg, type = 'info') {
  return { message: msg, type, timestamp: new Date().toISOString() };
}

// Fetch ALL rows from a Supabase table/query with range pagination (no 1000-row cap)
async function fetchAllRows(query) {
  const PAGE = 1000;
  let from = 0;
  let allRows = [];

  while (true) {
    const { data, error } = await query.range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  return allRows;
}

// Upsert in batches to avoid request size limits
async function batchUpsert(table, rows, conflictCol, batchSize = 500) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict: conflictCol, ignoreDuplicates: false });
    if (error) throw error;
  }
}

// Upsert rows and return { inserted, updated } counts
async function upsertWithCount(table, rows, conflictCol, keyFn) {
  if (!rows.length) return { inserted: 0, updated: 0 };

  const isComposite = Array.isArray(keyFn(rows[0]));
  let existingSet = new Set();

  if (isComposite) {
    const col1 = conflictCol.split(',')[0].trim();
    const col2 = conflictCol.split(',')[1].trim();
    const existing = await fetchAllRows(supabase.from(table).select(`${col1},${col2}`));
    existing.forEach((r) => existingSet.add(`${r[col1]}|${r[col2]}`));
  } else {
    const existing = await fetchAllRows(supabase.from(table).select(conflictCol));
    existing.forEach((r) => existingSet.add(String(r[conflictCol])));
  }

  const inserted = rows.filter((r) => {
    const k = keyFn(r);
    return isComposite ? !existingSet.has(`${k[0]}|${k[1]}`) : !existingSet.has(String(k));
  }).length;
  const updated = rows.length - inserted;

  await batchUpsert(table, rows, conflictCol);

  return { inserted, updated };
}

async function upsertAndGetId(table, matchCol, matchVal, data) {
  const { error } = await supabase
    .from(table)
    .upsert(data, { onConflict: matchCol, ignoreDuplicates: false });
  if (error) throw error;
  const { data: row } = await supabase.from(table).select('id').eq(matchCol, matchVal).single();
  return row.id;
}

function countLog(entity, { inserted, updated }) {
  const parts = [];
  if (inserted > 0) parts.push(`${inserted} new`);
  if (updated > 0) parts.push(`${updated} updated`);
  if (parts.length === 0) parts.push('no changes');
  return log(`${entity}: ${parts.join(', ')}`);
}

// ── Lookup maps (all rows, no cap) ────────────────────────────────────────────

async function getDriverMap() {
  const rows = await fetchAllRows(supabase.from('drivers').select('id, driver_id'));
  return Object.fromEntries(rows.map((d) => [d.driver_id, d.id]));
}

async function getConstructorMap() {
  const rows = await fetchAllRows(supabase.from('constructors').select('id, constructor_id'));
  return Object.fromEntries(rows.map((c) => [c.constructor_id, c.id]));
}

// ── Season ────────────────────────────────────────────────────────────────────

export async function importSeason(year) {
  const logs = [];
  try {
    const seasonId = await upsertAndGetId('seasons', 'year', year, { year });
    logs.push(log(`Season ${year} ready (id=${seasonId})`));
    return { seasonId, logs };
  } catch (e) {
    logs.push(log(`Season upsert failed: ${e.message}`, 'error'));
    return { seasonId: null, logs };
  }
}

// ── Circuits ──────────────────────────────────────────────────────────────────

export async function importCircuits(year) {
  const logs = [];
  try {
    const circuits = await jolpicaAPI.getCircuits(year);
    const rows = circuits.map((c) => ({
      circuit_id: c.circuitId,
      name: c.circuitName,
      locality: c.Location?.locality,
      country: c.Location?.country,
      lat: parseFloat(c.Location?.lat) || null,
      long: parseFloat(c.Location?.long) || null,
    }));
    const counts = await upsertWithCount('circuits', rows, 'circuit_id', (r) => r.circuit_id);
    logs.push(countLog('Circuits', counts));
  } catch (e) {
    logs.push(log(`Circuits upsert failed: ${e.message}`, 'error'));
  }
  return logs;
}

// ── Drivers ───────────────────────────────────────────────────────────────────

export async function importDrivers(year) {
  const logs = [];
  try {
    const drivers = await jolpicaAPI.getDrivers(year);
    const rows = drivers.map((d) => ({
      driver_id: d.driverId,
      code: d.code || null,
      permanent_number: d.permanentNumber || null,
      given_name: d.givenName,
      family_name: d.familyName,
      date_of_birth: d.dateOfBirth || null,
      nationality: d.nationality || null,
    }));
    const counts = await upsertWithCount('drivers', rows, 'driver_id', (r) => r.driver_id);
    logs.push(countLog('Drivers', counts));
  } catch (e) {
    logs.push(log(`Drivers upsert failed: ${e.message}`, 'error'));
  }
  return logs;
}

// ── Constructors ──────────────────────────────────────────────────────────────

export async function importConstructors(year) {
  const logs = [];
  try {
    const constructors = await jolpicaAPI.getConstructors(year);
    const rows = constructors.map((c) => ({
      constructor_id: c.constructorId,
      name: c.name,
      nationality: c.nationality || null,
    }));
    const counts = await upsertWithCount('constructors', rows, 'constructor_id', (r) => r.constructor_id);
    logs.push(countLog('Constructors', counts));
  } catch (e) {
    logs.push(log(`Constructors upsert failed: ${e.message}`, 'error'));
  }
  return logs;
}

// ── Races ─────────────────────────────────────────────────────────────────────

export async function importRaces(year, seasonId) {
  const logs = [];
  try {
    const races = await jolpicaAPI.getRaces(year);

    const circuitIds = [...new Set(races.map((r) => r.Circuit.circuitId))];
    const { data: circuitRows } = await supabase
      .from('circuits').select('id, circuit_id').in('circuit_id', circuitIds);
    const circuitMap = Object.fromEntries((circuitRows || []).map((c) => [c.circuit_id, c.id]));

    const rows = races.map((r) => ({
      season_id: seasonId,
      round: parseInt(r.round),
      race_name: r.raceName,
      date: r.date || null,
      time: r.time || null,
      circuit_id: circuitMap[r.Circuit.circuitId],
    }));

    const counts = await upsertWithCount('races', rows, 'season_id,round', (r) => [r.season_id, r.round]);
    logs.push(countLog('Races', counts));
  } catch (e) {
    logs.push(log(`Races upsert failed: ${e.message}`, 'error'));
  }
  return logs;
}

// ── Race Results ──────────────────────────────────────────────────────────────

export async function importRaceResults(year, round = null) {
  const logs = [];
  try {
    const raceData = round
      ? await jolpicaAPI.getRaceResults(year, round)
      : await jolpicaAPI.getSeasonResults(year);

    const { data: seasonRow } = await supabase.from('seasons').select('id').eq('year', year).single();
    const raceRows = seasonRow
      ? await fetchAllRows(supabase.from('races').select('id, round').eq('season_id', seasonRow.id))
      : [];
    const raceMap = Object.fromEntries(raceRows.map((r) => [r.round, r.id]));

    const driverMap = await getDriverMap();
    const constructorMap = await getConstructorMap();

    const rows = [];
    for (const race of raceData) {
      const raceId = raceMap[parseInt(race.round)];
      if (!raceId) continue;
      for (const result of race.Results || []) {
        rows.push({
          race_id: raceId,
          driver_id: driverMap[result.Driver.driverId],
          constructor_id: constructorMap[result.Constructor.constructorId],
          grid: parseInt(result.grid) || null,
          position: parseInt(result.position) || null,
          points: parseFloat(result.points) || 0,
          laps: parseInt(result.laps) || null,
          status: result.status || null,
          time: result.Time?.time || null,
          fastest_lap_time: result.FastestLap?.Time?.time || null,
          fastest_lap_speed: result.FastestLap?.AverageSpeed?.speed || null,
        });
      }
    }

    if (rows.length) {
      const counts = await upsertWithCount('race_results', rows, 'race_id,driver_id', (r) => [r.race_id, r.driver_id]);
      logs.push(countLog('Race results', counts));
    } else {
      logs.push(log('Race results: no data returned from API'));
    }
  } catch (e) {
    logs.push(log(`Race results upsert failed: ${e.message}`, 'error'));
  }
  return logs;
}

// ── Qualifying ────────────────────────────────────────────────────────────────

export async function importQualifying(year, round) {
  const logs = [];
  try {
    const raceData = await jolpicaAPI.getQualifying(year, round);

    const { data: seasonRow } = await supabase.from('seasons').select('id').eq('year', year).single();
    if (!seasonRow) throw new Error(`Season ${year} not found`);

    const { data: raceRow } = await supabase
      .from('races').select('id').eq('season_id', seasonRow.id).eq('round', round).single();
    if (!raceRow) throw new Error(`Race round ${round} not found for ${year}`);

    const driverMap = await getDriverMap();
    const constructorMap = await getConstructorMap();

    const rows = [];
    for (const race of raceData) {
      for (const q of race.QualifyingResults || []) {
        rows.push({
          race_id: raceRow.id,
          driver_id: driverMap[q.Driver.driverId],
          constructor_id: constructorMap[q.Constructor.constructorId],
          position: parseInt(q.position) || null,
          q1: q.Q1 || null,
          q2: q.Q2 || null,
          q3: q.Q3 || null,
        });
      }
    }

    if (rows.length) {
      const counts = await upsertWithCount('qualifying_results', rows, 'race_id,driver_id', (r) => [r.race_id, r.driver_id]);
      logs.push(countLog('Qualifying results', counts));
    } else {
      logs.push(log('Qualifying results: no data returned from API'));
    }
  } catch (e) {
    logs.push(log(`Qualifying upsert failed: ${e.message}`, 'error'));
  }
  return logs;
}

// ── Sprint ────────────────────────────────────────────────────────────────────

export async function importSprint(year, round) {
  const logs = [];
  try {
    const raceData = await jolpicaAPI.getSprintResults(year, round);

    const { data: seasonRow } = await supabase.from('seasons').select('id').eq('year', year).single();
    if (!seasonRow) throw new Error(`Season ${year} not found`);

    const { data: raceRow } = await supabase
      .from('races').select('id').eq('season_id', seasonRow.id).eq('round', round).single();
    if (!raceRow) throw new Error(`Race round ${round} not found for ${year}`);

    const driverMap = await getDriverMap();
    const constructorMap = await getConstructorMap();

    const rows = [];
    for (const race of raceData) {
      for (const s of race.SprintResults || []) {
        rows.push({
          race_id: raceRow.id,
          driver_id: driverMap[s.Driver.driverId],
          constructor_id: constructorMap[s.Constructor.constructorId],
          grid: parseInt(s.grid) || null,
          position: parseInt(s.position) || null,
          points: parseFloat(s.points) || 0,
          laps: parseInt(s.laps) || null,
          time: s.Time?.time || null,
        });
      }
    }

    if (rows.length) {
      const counts = await upsertWithCount('sprint_results', rows, 'race_id,driver_id', (r) => [r.race_id, r.driver_id]);
      logs.push(countLog('Sprint results', counts));
    } else {
      logs.push(log('Sprint results: no data returned from API'));
    }
  } catch (e) {
    logs.push(log(`Sprint upsert failed: ${e.message}`, 'error'));
  }
  return logs;
}

// ── Standings ─────────────────────────────────────────────────────────────────

export async function importStandings(year, seasonId) {
  const logs = [];
  try {
    const driverMap = await getDriverMap();
    const constructorMap = await getConstructorMap();

    const dStandingsLists = await jolpicaAPI.getDriverStandings(year);
    const dRows = (dStandingsLists[0]?.DriverStandings || []).map((s) => ({
      season_id: seasonId,
      driver_id: driverMap[s.Driver.driverId],
      points: parseFloat(s.points) || 0,
      wins: parseInt(s.wins) || 0,
      position: parseInt(s.position) || null,
    }));

    if (dRows.length) {
      const counts = await upsertWithCount('driver_standings', dRows, 'season_id,driver_id', (r) => [r.season_id, r.driver_id]);
      logs.push(countLog('Driver standings', counts));
    }

    const cStandingsLists = await jolpicaAPI.getConstructorStandings(year);
    const cRows = (cStandingsLists[0]?.ConstructorStandings || []).map((s) => ({
      season_id: seasonId,
      constructor_id: constructorMap[s.Constructor.constructorId],
      points: parseFloat(s.points) || 0,
      wins: parseInt(s.wins) || 0,
      position: parseInt(s.position) || null,
    }));

    if (cRows.length) {
      const counts = await upsertWithCount('constructor_standings', cRows, 'season_id,constructor_id', (r) => [r.season_id, r.constructor_id]);
      logs.push(countLog('Constructor standings', counts));
    }
  } catch (e) {
    logs.push(log(`Standings upsert failed: ${e.message}`, 'error'));
  }
  return logs;
}

// ── Full Season Import ────────────────────────────────────────────────────────

export async function importFullSeason(year) {
  const allLogs = [];
  const { seasonId, logs: sLogs } = await importSeason(year);
  allLogs.push(...sLogs);
  if (!seasonId) return allLogs;

  const results = await Promise.allSettled([
    importCircuits(year),
    importDrivers(year),
    importConstructors(year),
  ]);
  results.forEach((r) => r.status === 'fulfilled' && allLogs.push(...r.value));

  allLogs.push(...(await importRaces(year, seasonId)));
  allLogs.push(...(await importRaceResults(year)));
  allLogs.push(...(await importStandings(year, seasonId)));

  return allLogs;
}
