import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useQuery } from '../hooks/useQuery';
import { useDriverStats } from '../hooks/useDriverStats';
import { db } from '../services/db';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { formatDate, flagEmoji, positionSuffix } from '../utils/format';

function useTeamTimeline(results = []) {
  return useMemo(() => {
    const map = new Map();
    results.forEach((r) => {
      const year = r.races?.seasons?.year;
      if (!r.constructors || !year) return;
      const cid = r.constructor_id;
      if (!map.has(cid)) map.set(cid, { constructor: r.constructors, yearsSet: new Set() });
      map.get(cid).yearsSet.add(year);
    });
    const entries = [...map.values()].map(({ constructor, yearsSet }) => {
      const seasons = [...yearsSet].sort((a, b) => a - b);
      return { constructor, seasons, firstYear: seasons[0], lastYear: seasons[seasons.length - 1] };
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

export default function DriverDetailPage() {
  const { driverId } = useParams();
  const [tab, setTab] = useState('results');
  const [selectedYear, setSelectedYear] = useState('all');

  const { data: driver, loading: dLoading, error: dError } = useQuery(
    () => db.drivers.getByDriverId(driverId), [driverId]
  );
  const { data: results, loading: rLoading } = useQuery(
    () => db.raceResults.getByDriver(driver.id), [driver?.id], { skip: !driver }
  );
  const { data: qualifyingRows, loading: qLoading } = useQuery(
    () => db.qualifying.getByDriver(driver.id), [driver?.id], { skip: !driver }
  );
  const { data: standingsRows, loading: sLoading } = useQuery(
    () => db.driverStandings.getByDriver(driver.id), [driver?.id], { skip: !driver }
  );

  const stats = useDriverStats(results || [], qualifyingRows || [], standingsRows || []);
  const { current, previous, latestYear } = useTeamTimeline(results || []);

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

  if (dLoading || rLoading || qLoading || sLoading) return <LoadingSpinner />;
  if (dError) return <ErrorMessage message={dError} />;
  if (!driver) return <EmptyState message="Driver not found." />;

  const statCards = [
    { label: 'Races',         value: stats.races,        icon: '🏁' },
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
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {driver.image_url && (
          <img src={driver.image_url} alt={driver.family_name}
            style={{ width: 120, height: 150, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
        )}
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e10600', lineHeight: 1 }}>
            #{driver.permanent_number || '—'}
          </div>
          <h1 style={{ margin: '4px 0' }}>{driver.given_name} {driver.family_name}</h1>
          {driver.code && (
            <span style={{ background: '#15151e', color: '#fff', padding: '2px 8px', borderRadius: 3, fontWeight: 700, fontSize: '0.85rem' }}>
              {driver.code}
            </span>
          )}
          <p style={{ color: '#666', margin: '8px 0 0' }}>
            {flagEmoji(driver.nationality)} {driver.nationality} · Born {formatDate(driver.date_of_birth)}
          </p>
          {driver.bio && <p style={{ maxWidth: 560, color: '#444', lineHeight: 1.6, marginTop: 8 }}>{driver.bio}</p>}
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
        <button className={`tab-btn${tab === 'results' ? ' active' : ''}`} onClick={() => setTab('results')}>
          📋 Results ({sorted.length})
        </button>
        <button className={`tab-btn${tab === 'teams' ? ' active' : ''}`} onClick={() => setTab('teams')}>
          🏎 Teams ({current.length + previous.length})
        </button>
      </div>

      {/* Teams Tab */}
      {tab === 'teams' && (
        <div>
          <div className="section-hdr">
            <span className="badge">Current</span>
            <span className="section-yr">{latestYear}</span>
          </div>
          {current.length === 0 ? <EmptyState message="No current team." /> : (
            <div className="driver-grid" style={{ marginBottom: '1.5rem' }}>
              {current.map(({ constructor: c, seasons: cs }) => (
                <Link key={c.constructor_id} to={`/constructors/${c.constructor_id}`}
                  className="driver-card current">
                  {c.logo_url
                    ? <img src={c.logo_url} alt={c.name} style={{ width: 52, height: 32, objectFit: 'contain' }} />
                    : <span style={{ fontSize: '1.4rem' }}>🏎</span>}
                  <div>
                    <div className="name" style={{ fontWeight: 700 }}>{c.name}</div>
                    <div className="seasons">{cs[0]}{cs.length > 1 ? ` – ${cs[cs.length - 1]}` : ''} · {cs.length} season{cs.length > 1 ? 's' : ''}</div>
                  </div>
                </Link>
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
                {previous.map(({ constructor: c, seasons: cs, firstYear, lastYear }) => (
                  <div key={c.constructor_id} className="timeline-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {c.logo_url && <img src={c.logo_url} alt={c.name} style={{ width: 32, height: 20, objectFit: 'contain' }} />}
                      <Link to={`/constructors/${c.constructor_id}`} className="timeline-name">{c.name}</Link>
                    </div>
                    <span className="timeline-years">{firstYear === lastYear ? firstYear : `${firstYear}–${lastYear}`}</span>
                    <div className="dots">{cs.map((y) => <span key={y} className="dot">{y}</span>)}</div>
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
          {filtered.length === 0 ? <EmptyState message="No race results found." /> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Season</th><th>Rnd</th><th>Race</th><th>Team</th>
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
                      <td><Link to={`/constructors/${r.constructors?.constructor_id}`} className="red-link">{r.constructors?.name}</Link></td>
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
