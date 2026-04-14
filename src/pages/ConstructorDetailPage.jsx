import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { flagEmoji, positionSuffix } from '../utils/format';

function fetchConstructorBySlug(slug) {
  return supabase.from('constructors').select('*').eq('constructor_id', slug).single();
}

const isFinished = (s) => s === 'Finished' || (s && s.startsWith('+'));
const isDNF = (s) => !!s && !isFinished(s) && s !== 'Disqualified' && s !== 'Did not start' && s !== 'Did not qualify';
const isDSQ = (s) => s === 'Disqualified';
const isDNS = (s) => s === 'Did not start' || s === 'Did not qualify';

function useConstructorStats(results = [], qualifyingRows = [], standingsRows = []) {
  return useMemo(() => {
    const entries       = results.length;
    const wins          = results.filter((r) => r.position === 1).length;
    const podiums       = results.filter((r) => r.position != null && r.position <= 3).length;
    const points        = results.reduce((s, r) => s + (r.points || 0), 0);
    const dnfs          = results.filter((r) => isDNF(r.status)).length;
    const dsq           = results.filter((r) => isDSQ(r.status)).length;
    const dns           = results.filter((r) => isDNS(r.status)).length;
    const fastestLaps   = results.filter((r) => r.fastest_lap_time != null && r.fastest_lap_time !== '').length;
    const poles         = qualifyingRows.filter((q) => q.position === 1).length;
    const championships = standingsRows.filter((s) => s.position === 1).length;
    const championshipYears = standingsRows
      .filter((s) => s.position === 1)
      .map((s) => s.seasons?.year).filter(Boolean).sort((a, b) => a - b);
    return { entries, wins, podiums, points, dnfs, dsq, dns, fastestLaps, poles, championships, championshipYears };
  }, [results, qualifyingRows, standingsRows]);
}

function useDriverTimeline(results = []) {
  return useMemo(() => {
    const map = new Map();
    results.forEach((r) => {
      const year = r.races?.seasons?.year;
      if (!r.drivers || !year) return;
      if (!map.has(r.driver_id)) map.set(r.driver_id, { driver: r.drivers, yearsSet: new Set() });
      map.get(r.driver_id).yearsSet.add(year);
    });
    const entries = [...map.values()].map(({ driver, yearsSet }) => {
      const seasons = [...yearsSet].sort((a, b) => a - b);
      return { driver, seasons, firstYear: seasons[0], lastYear: seasons[seasons.length - 1] };
    });
    entries.sort((a, b) => a.firstYear - b.firstYear || a.lastYear - b.lastYear);
    const latestYear = Math.max(...results.map((r) => r.races?.seasons?.year ?? 0));
    return {
      current: entries.filter((e) => e.lastYear === latestYear),
      previous: entries.filter((e) => e.lastYear !== latestYear),
      latestYear,
    };
  }, [results]);
}

export default function ConstructorDetailPage() {
  const { constructorId } = useParams();
  const [tab, setTab] = useState('drivers');
  const [selectedYear, setSelectedYear] = useState('all');

  const { data: constructor, loading: cLoading, error: cError } = useQuery(
    () => fetchConstructorBySlug(constructorId), [constructorId]
  );
  const { data: results, loading: rLoading } = useQuery(
    () => db.raceResults.getByConstructor(constructor.id), [constructor?.id], { skip: !constructor }
  );
  const { data: qualifyingRows, loading: qLoading } = useQuery(
    () => db.qualifying.getByConstructor(constructor.id), [constructor?.id], { skip: !constructor }
  );
  const { data: standingsRows, loading: sLoading } = useQuery(
    () => db.constructorStandings.getByConstructor(constructor.id), [constructor?.id], { skip: !constructor }
  );

  const stats = useConstructorStats(results || [], qualifyingRows || [], standingsRows || []);
  const { current, previous, latestYear } = useDriverTimeline(results || []);

  const sorted = useMemo(() =>
    [...(results || [])].sort((a, b) => {
      const yd = (b.races?.seasons?.year ?? 0) - (a.races?.seasons?.year ?? 0);
      return yd !== 0 ? yd : (a.races?.round ?? 0) - (b.races?.round ?? 0);
    }), [results]
  );
  const seasons = useMemo(() => {
    const years = [...new Set(sorted.map((r) => r.races?.seasons?.year).filter(Boolean))];
    return years.sort((a, b) => b - a);
  }, [sorted]);
  const filtered = useMemo(() =>
    selectedYear === 'all' ? sorted : sorted.filter((r) => r.races?.seasons?.year === Number(selectedYear)),
    [sorted, selectedYear]
  );

  if (cLoading || rLoading || qLoading || sLoading) return <LoadingSpinner />;
  if (cError) return <ErrorMessage message={cError} />;
  if (!constructor) return <EmptyState message="Constructor not found." />;

  const statCards = [
    { label: 'Entries',       value: stats.entries,       icon: '🏁' },
    { label: 'Championships', value: stats.championships, icon: '🏆', highlight: stats.championships > 0, sub: stats.championshipYears.join(', ') || null },
    { label: 'Wins',          value: stats.wins,          icon: '🥇' },
    { label: 'Podiums',       value: stats.podiums,       icon: '🏅' },
    { label: 'Poles',         value: stats.poles,         icon: '⚡' },
    { label: 'Fastest Laps',  value: stats.fastestLaps,   icon: '⏱' },
    { label: 'Points',        value: stats.points,        icon: '📊' },
    { label: 'DNFs',          value: stats.dnfs,          icon: '🔧' },
    { label: 'DSQ',           value: stats.dsq,           icon: '🚫' },
    { label: 'DNS',           value: stats.dns,           icon: '⛔' },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {constructor.logo_url && (
          <img src={constructor.logo_url} alt={constructor.name}
            style={{ width: 130, height: 75, objectFit: 'contain', flexShrink: 0 }} />
        )}
        <div>
          <h1 style={{ margin: '0 0 4px' }}>{constructor.name}</h1>
          <p style={{ color: '#666', margin: 0 }}>{flagEmoji(constructor.nationality)} {constructor.nationality}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {statCards.map(({ label, value, icon, highlight, sub }) => (
          <div key={label} className={`stat-card${highlight ? ' highlight' : ''}`}>
            <div className="icon">{icon}</div>
            <div className="val">{value}</div>
            <div className="lbl">{label}</div>
            {sub && <div className="sub">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn${tab === 'drivers' ? ' active' : ''}`} onClick={() => setTab('drivers')}>
          👤 Drivers ({current.length + previous.length})
        </button>
        <button className={`tab-btn${tab === 'results' ? ' active' : ''}`} onClick={() => setTab('results')}>
          📋 Results ({sorted.length})
        </button>
      </div>

      {/* Drivers Tab */}
      {tab === 'drivers' && (
        <div>
          <div className="section-hdr">
            <span className="badge">Current</span>
            <span className="section-yr">{latestYear}</span>
          </div>
          {current.length === 0 ? <EmptyState message="No current drivers found." /> : (
            <div className="driver-grid">
              {current.map(({ driver, seasons: ds }) => (
                <DriverCard key={driver.driver_id} driver={driver} seasons={ds} isCurrent />
              ))}
            </div>
          )}

          {previous.length > 0 && (
            <>
              <div className="section-hdr" style={{ marginTop: '1.5rem' }}>
                <span className="badge prev">Previous</span>
                <span className="section-yr">{previous[0]?.firstYear} – {previous[previous.length - 1]?.lastYear}</span>
              </div>
              <div className="timeline">
                {previous.map(({ driver, seasons: ds, firstYear, lastYear }) => (
                  <div key={driver.driver_id} className="timeline-row">
                    <Link to={`/drivers/${driver.driver_id}`} className="timeline-name">
                      {driver.given_name} {driver.family_name}
                    </Link>
                    <span className="timeline-years">
                      {firstYear === lastYear ? firstYear : `${firstYear}–${lastYear}`}
                    </span>
                    <div className="dots">
                      {ds.map((y) => <span key={y} className="dot">{y}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Results Tab */}
      {tab === 'results' && (
        <>
          <div className="results-hdr">
            <span className="count">{filtered.length}{selectedYear !== 'all' ? ` in ${selectedYear}` : ' total'}</span>
            <select className="season-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="all">All Seasons</option>
              {seasons.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {filtered.length === 0 ? <EmptyState message="No results found." /> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Season</th><th>Rnd</th><th>Race</th><th>Driver</th>
                    <th className="num">Grid</th><th className="num">Pos</th>
                    <th className="num">Pts</th><th>Status</th><th>FL</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} style={r.position === 1 ? { background: '#fff8f0' } : r.status === 'Disqualified' ? { background: '#fff0f0' } : {}}>
                      <td><Link to={`/seasons/${r.races?.seasons?.year}`} className="red-link">{r.races?.seasons?.year}</Link></td>
                      <td style={{ color: '#888' }}>{r.races?.round}</td>
                      <td><Link to={`/races/${r.race_id}`} className="red-link">{r.races?.race_name}</Link></td>
                      <td><Link to={`/drivers/${r.drivers?.driver_id}`} className="red-link">{r.drivers?.given_name} {r.drivers?.family_name}</Link></td>
                      <td className="num" style={{ color: '#888' }}>{r.grid ?? '—'}</td>
                      <td className="num" style={posStyle(r.position)}>{positionSuffix(r.position)}</td>
                      <td className="num" style={{ fontWeight: 700, color: r.points > 0 ? '#e10600' : '#aaa' }}>{r.points}</td>
                      <td className={statusClass(r.status)}>{r.status}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{r.fastest_lap_time || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DriverCard({ driver, seasons, isCurrent }) {
  return (
    <Link to={`/drivers/${driver.driver_id}`} className={`driver-card${isCurrent ? ' current' : ''}`}>
      {driver.image_url && <img src={driver.image_url} alt={driver.family_name} />}
      <div>
        <div className="name">{driver.given_name} <strong>{driver.family_name}</strong></div>
        {driver.code && <span className="code-badge">{driver.code}</span>}
        <div className="seasons">
          {seasons.length === 1 ? seasons[0] : `${seasons[0]} – ${seasons[seasons.length - 1]}`}
          <span style={{ color: '#aaa' }}> · {seasons.length} season{seasons.length > 1 ? 's' : ''}</span>
        </div>
      </div>
    </Link>
  );
}

function posStyle(pos) {
  if (pos === 1) return { color: '#e10600', fontWeight: 700 };
  if (pos <= 3) return { color: '#c47d00', fontWeight: 700 };
  return { fontWeight: 600 };
}
function statusClass(s) {
  if (!s || s === 'Finished' || s?.startsWith('+')) return 'status-ok';
  if (s === 'Disqualified') return 'status-dsq';
  if (s === 'Did not start' || s === 'Did not qualify') return 'status-dns';
  return 'status-dnf';
}
