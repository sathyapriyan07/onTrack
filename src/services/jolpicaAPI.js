// Jolpica (Ergast-compatible) API service
const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

// Fetch a single page
async function fetchPage(path, limit, offset) {
  const url = `${BASE_URL}${path}.json?limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json();
}

// Fetch ALL pages for an endpoint, auto-paginating until total is exhausted
async function fetchAll(path, extractFn, pageSize = 100) {
  let offset = 0;
  let total = null;
  let allItems = [];

  do {
    const json = await fetchPage(path, pageSize, offset);
    const mrData = json.MRData;

    if (total === null) total = parseInt(mrData.total, 10);

    const items = extractFn(mrData);
    allItems = allItems.concat(items);
    offset += pageSize;
  } while (offset < total);

  return allItems;
}

export const jolpicaAPI = {
  getSeasons: () =>
    fetchAll('/seasons', (d) => d.SeasonTable.Seasons),

  getDrivers: (year) =>
    fetchAll(`/${year}/drivers`, (d) => d.DriverTable.Drivers),

  getConstructors: (year) =>
    fetchAll(`/${year}/constructors`, (d) => d.ConstructorTable.Constructors),

  getCircuits: (year) =>
    fetchAll(`/${year}/circuits`, (d) => d.CircuitTable.Circuits),

  getRaces: (year) =>
    fetchAll(`/${year}/races`, (d) => d.RaceTable.Races),

  // Single race — no pagination needed (max 20 drivers)
  getRaceResults: (year, round) =>
    fetchAll(`/${year}/${round}/results`, (d) => d.RaceTable.Races),

  // Full season results — paginate (up to ~400 rows per season)
  getSeasonResults: (year) =>
    fetchAll(`/${year}/results`, (d) => d.RaceTable.Races),

  getQualifying: (year, round) =>
    fetchAll(`/${year}/${round}/qualifying`, (d) => d.RaceTable.Races),

  getSprintResults: (year, round) =>
    fetchAll(`/${year}/${round}/sprint`, (d) => d.RaceTable.Races),

  getDriverStandings: (year) =>
    fetchAll(`/${year}/driverStandings`, (d) => d.StandingsTable.StandingsLists),

  getConstructorStandings: (year) =>
    fetchAll(`/${year}/constructorStandings`, (d) => d.StandingsTable.StandingsLists),
};
