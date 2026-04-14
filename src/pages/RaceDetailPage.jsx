import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { formatDate, positionSuffix } from '../utils/format';

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
      <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: 4 }}>
        <Link to={`/seasons/${race.seasons?.year}`} className="red-link">{race.seasons?.year}</Link> / Round {race.round}
      </p>
      <h1 style={{ marginBottom: 6 }}>{race.race_name}</h1>
      <p style={{ color: '#666', marginBottom: 2 }}>📍 {race.circuits?.name}, {race.circuits?.locality}, {race.circuits?.country}</p>
      <p style={{ color: '#666', marginBottom: '1.25rem' }}>📅 {formatDate(race.date)}</p>

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
                  <tr key={r.id} style={r.position === 1 ? { background: '#fff8f0' } : {}}>
                    <td style={{ fontWeight: 700 }}>{positionSuffix(r.position)}</td>
                    <td><Link to={`/drivers/${r.drivers?.driver_id}`} className="red-link">{r.drivers?.given_name} {r.drivers?.family_name}</Link></td>
                    <td>{r.constructors?.name}</td>
                    <td className="num" style={{ color: '#888' }}>{r.grid ?? '—'}</td>
                    <td style={{ textAlign: 'center' }}><PositionDelta grid={r.grid} position={r.position} /></td>
                    <td className="num">{r.laps ?? '—'}</td>
                    <td>{r.time || '—'}</td>
                    <td className="num" style={{ fontWeight: 700, color: r.points > 0 ? '#e10600' : '#aaa' }}>{r.points}</td>
                    <td style={{ fontSize: '0.78rem', color: '#666' }}>{r.status}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{r.fastest_lap_time || '—'}</td>
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
                    <td style={{ fontWeight: 700 }}>{r.position}</td>
                    <td><Link to={`/drivers/${r.drivers?.driver_id}`} className="red-link">{r.drivers?.given_name} {r.drivers?.family_name}</Link></td>
                    <td>{r.constructors?.name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{r.q1 || '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{r.q2 || '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{r.q3 || '—'}</td>
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
                    <td style={{ fontWeight: 700 }}>{positionSuffix(r.position)}</td>
                    <td><Link to={`/drivers/${r.drivers?.driver_id}`} className="red-link">{r.drivers?.given_name} {r.drivers?.family_name}</Link></td>
                    <td>{r.constructors?.name}</td>
                    <td className="num" style={{ color: '#888' }}>{r.grid ?? '—'}</td>
                    <td style={{ textAlign: 'center' }}><PositionDelta grid={r.grid} position={r.position} /></td>
                    <td className="num">{r.laps ?? '—'}</td>
                    <td>{r.time || '—'}</td>
                    <td className="num" style={{ fontWeight: 700, color: r.points > 0 ? '#e10600' : '#aaa' }}>{r.points}</td>
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
