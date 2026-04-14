import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { formatDate, positionSuffix } from '../utils/format';
import { Icon } from '../components/Icons';

function PositionDelta({ grid, position }) {
  if (grid == null || position == null || grid === 0) return <span className="delta-same">—</span>;
  const delta = grid - position;
  if (delta === 0) return <span className="delta-same">●</span>;
  if (delta > 0) return <span className="delta-up">▲ {delta}</span>;
  return <span className="delta-down">▼ {Math.abs(delta)}</span>;
}

export default function RaceDetailPage() {
  const { id } = useParams();
  const [tab, setTab] = useState('results');

  const { data: race, loading: raceLoading, error } = useQuery(() => db.races.getById(parseInt(id)), [id]);
  const { data: results, loading: resLoading } = useQuery(() => db.raceResults.getByRace(parseInt(id)), [id]);
  const { data: qualifying, loading: qLoading } = useQuery(() => db.qualifying.getByRace(parseInt(id)), [id]);
  const { data: sprint, loading: sLoading } = useQuery(() => db.sprint.getByRace(parseInt(id)), [id]);

  if (raceLoading || resLoading || qLoading || sLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!race) return <EmptyState message="Race not found." />;

  const tabs = [
    { key: 'results', label: 'Race Results' },
    { key: 'qualifying', label: 'Qualifying' },
    ...(sprint?.length ? [{ key: 'sprint', label: 'Sprint' }] : []),
  ];

  return (
    <div className="page">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          <Link to={`/seasons/${race.seasons?.year}`} className="red-link">{race.seasons?.year}</Link>
          <span style={{ color: 'var(--text3)', margin: '0 6px' }}>·</span>
          Round {race.round}
        </div>
        <h1 style={{ margin: '0 0 10px' }}>{race.race_name}</h1>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)', fontSize: '0.88rem' }}>
            <Icon name="location_on" size={15} style={{ color: 'var(--text3)' }} />
            {race.circuits?.name}, {race.circuits?.locality}, {race.circuits?.country}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)', fontSize: '0.88rem' }}>
            <Icon name="calendar_today" size={15} style={{ color: 'var(--text3)' }} />
            {formatDate(race.date)}
          </span>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(({ key, label }) => (
          <button key={key} className={`tab-btn${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'results' && (
        <div className="table-wrap">
          {!(results || []).length ? <EmptyState message="No results." /> : (
            <table>
              <thead>
                <tr>
                  <th>Pos</th><th>Driver</th><th>Team</th>
                  <th className="num">Grid</th><th style={{ textAlign: 'center' }}>+/−</th>
                  <th className="num">Laps</th><th>Time</th>
                  <th className="num">Pts</th><th>Status</th><th>FL</th>
                </tr>
              </thead>
              <tbody>
                {(results || []).map((r) => (
                  <tr key={r.id} style={r.position === 1 ? { background: 'rgba(225,6,0,0.06)' } : {}}>
                    <td style={{ fontWeight: 700, color: r.position === 1 ? 'var(--accent)' : r.position <= 3 ? '#ffd60a' : 'var(--text)' }}>{positionSuffix(r.position)}</td>
                    <td><Link to={`/drivers/${r.drivers?.driver_id}`} className="red-link">{r.drivers?.given_name} {r.drivers?.family_name}</Link></td>
                    <td style={{ color: 'var(--text2)' }}>{r.constructors?.name}</td>
                    <td className="num" style={{ color: 'var(--text3)' }}>{r.grid ?? '—'}</td>
                    <td style={{ textAlign: 'center' }}><PositionDelta grid={r.grid} position={r.position} /></td>
                    <td className="num" style={{ color: 'var(--text2)' }}>{r.laps ?? '—'}</td>
                    <td style={{ color: 'var(--text2)', fontFamily: 'monospace', fontSize: '0.82rem' }}>{r.time || '—'}</td>
                    <td className="num" style={{ fontWeight: 700, color: r.points > 0 ? 'var(--accent)' : 'var(--text3)' }}>{r.points}</td>
                    <td className={statusClass(r.status)}>{r.status}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text3)' }}>{r.fastest_lap_time || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'qualifying' && (
        <div className="table-wrap">
          {!(qualifying || []).length ? <EmptyState message="No qualifying results." /> : (
            <table>
              <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Q1</th><th>Q2</th><th>Q3</th></tr></thead>
              <tbody>
                {(qualifying || []).map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: r.position === 1 ? 'var(--accent)' : 'var(--text)' }}>{r.position}</td>
                    <td><Link to={`/drivers/${r.drivers?.driver_id}`} className="red-link">{r.drivers?.given_name} {r.drivers?.family_name}</Link></td>
                    <td style={{ color: 'var(--text2)' }}>{r.constructors?.name}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text2)' }}>{r.q1 || '—'}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text2)' }}>{r.q2 || '—'}</td>
                    <td style={{ fontFamily: 'monospace', color: r.q3 ? 'var(--accent)' : 'var(--text3)' }}>{r.q3 || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'sprint' && (
        <div className="table-wrap">
          {!(sprint || []).length ? <EmptyState message="No sprint results." /> : (
            <table>
              <thead>
                <tr><th>Pos</th><th>Driver</th><th>Team</th><th className="num">Grid</th><th style={{ textAlign: 'center' }}>+/−</th><th className="num">Laps</th><th>Time</th><th className="num">Pts</th></tr>
              </thead>
              <tbody>
                {(sprint || []).map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: r.position === 1 ? 'var(--accent)' : 'var(--text)' }}>{positionSuffix(r.position)}</td>
                    <td><Link to={`/drivers/${r.drivers?.driver_id}`} className="red-link">{r.drivers?.given_name} {r.drivers?.family_name}</Link></td>
                    <td style={{ color: 'var(--text2)' }}>{r.constructors?.name}</td>
                    <td className="num" style={{ color: 'var(--text3)' }}>{r.grid ?? '—'}</td>
                    <td style={{ textAlign: 'center' }}><PositionDelta grid={r.grid} position={r.position} /></td>
                    <td className="num" style={{ color: 'var(--text2)' }}>{r.laps ?? '—'}</td>
                    <td style={{ color: 'var(--text2)', fontFamily: 'monospace', fontSize: '0.82rem' }}>{r.time || '—'}</td>
                    <td className="num" style={{ fontWeight: 700, color: r.points > 0 ? 'var(--accent)' : 'var(--text3)' }}>{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function statusClass(s) {
  if (!s || s === 'Finished' || s?.startsWith('+')) return 'status-ok';
  if (s === 'Disqualified') return 'status-dsq';
  if (s === 'Did not start' || s === 'Did not qualify') return 'status-dns';
  return 'status-dnf';
}
