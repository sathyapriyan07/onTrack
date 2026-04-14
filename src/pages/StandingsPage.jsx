import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { LoadingSpinner, EmptyState } from '../components/StatusComponents';
import { Flag, Icon } from '../components/Icons';
import { teamColor } from '../utils/format';

export default function StandingsPage() {
  const [tab, setTab] = useState('drivers');
  const [selectedSeasonId, setSelectedSeasonId] = useState('');

  const { data: seasons, loading: sLoading } = useQuery(() => db.seasons.getAll());
  const effectiveSeasonId = selectedSeasonId || seasons?.[0]?.id || '';
  const effectiveSeason = seasons?.find(s => s.id === Number(effectiveSeasonId)) || seasons?.[0];

  const { data: driverStandings, loading: dsLoading } = useQuery(
    () => db.driverStandings.getBySeason(Number(effectiveSeasonId)),
    [effectiveSeasonId], { skip: !effectiveSeasonId }
  );
  const { data: constructorStandings, loading: csLoading } = useQuery(
    () => db.constructorStandings.getBySeason(Number(effectiveSeasonId)),
    [effectiveSeasonId], { skip: !effectiveSeasonId }
  );

  const loading = sLoading || dsLoading || csLoading;

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Standings</h1>
        <select className="season-select" value={selectedSeasonId || effectiveSeason?.id || ''} onChange={e => setSelectedSeasonId(e.target.value)}>
          {(seasons || []).map(s => <option key={s.id} value={s.id}>{s.year}</option>)}
        </select>
      </div>

      <div className="tabs">
        <button className={`tab-btn${tab === 'drivers' ? ' active' : ''}`} onClick={() => setTab('drivers')}>
          <Icon name="person" size={16} /> Drivers
        </button>
        <button className={`tab-btn${tab === 'constructors' ? ' active' : ''}`} onClick={() => setTab('constructors')}>
          <Icon name="directions_car" size={16} /> Constructors
        </button>
      </div>

      {loading ? <LoadingSpinner /> : tab === 'drivers'
        ? <StandingsTable data={driverStandings || []} type="driver" />
        : <StandingsTable data={constructorStandings || []} type="constructor" />
      }
    </div>
  );
}

function StandingsTable({ data, type }) {
  if (!data.length) return <EmptyState message="No standings found for this season." />;
  const leader = data[0];

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th style={{ width: 50 }}>Pos</th>
            <th>{type === 'driver' ? 'Driver' : 'Constructor'}</th>
            <th>Nat.</th>
            <th className="num">Wins</th>
            <th className="num">Pts</th>
            <th style={{ minWidth: 120 }}>Gap</th>
          </tr>
        </thead>
        <tbody>
          {data.map(s => {
            const gap = leader.points - s.points;
            const pct = leader.points > 0 ? (s.points / leader.points) * 100 : 0;
            const name = type === 'driver'
              ? `${s.drivers?.given_name} ${s.drivers?.family_name}`
              : s.constructors?.name;
            const slug = type === 'driver'
              ? `/drivers/${s.drivers?.driver_id}`
              : `/constructors/${s.constructors?.constructor_id}`;
            const nat = type === 'driver' ? s.drivers?.nationality : s.constructors?.nationality;
            const code = type === 'driver' ? s.drivers?.code : null;
            const color = type === 'constructor' ? teamColor(s.constructors?.constructor_id) : 'var(--accent)';

            return (
              <tr key={s.id} style={s.position === 1 ? { background: 'rgba(225,6,0,0.06)' } : {}}>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: '50%', fontWeight: 800, fontSize: '0.82rem',
                    background: s.position === 1 ? 'var(--accent)' : s.position <= 3 ? 'var(--surface3)' : 'transparent',
                    color: s.position <= 3 ? '#fff' : 'var(--text3)',
                    border: s.position > 3 ? '1px solid var(--border)' : 'none',
                  }}>{s.position}</span>
                </td>
                <td>
                  <Link to={slug} style={{ textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {type === 'constructor' && (
                      <span style={{ width: 3, height: 20, borderRadius: 2, background: color, flexShrink: 0, display: 'inline-block' }} />
                    )}
                    <span style={{ fontWeight: 600, color: 'var(--white)' }}>{name}</span>
                    {code && (
                      <span style={{ background: 'var(--surface3)', color: 'var(--text3)', padding: '1px 6px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700 }}>
                        {code}
                      </span>
                    )}
                  </Link>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Flag nationality={nat} height={13} />
                    <span style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>{nat}</span>
                  </div>
                </td>
                <td className="num" style={{ color: 'var(--text2)' }}>{s.wins}</td>
                <td className="num" style={{ fontWeight: 800, color: 'var(--accent)' }}>{s.points}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {gap === 0 ? 'Leader' : `-${gap}`}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
