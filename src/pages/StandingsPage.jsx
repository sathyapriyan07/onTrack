import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { flagEmoji } from '../utils/format';

export default function StandingsPage() {
  const [tab, setTab] = useState('drivers');
  const [selectedSeasonId, setSelectedSeasonId] = useState('');

  const { data: seasons, loading: sLoading } = useQuery(() => db.seasons.getAll());
  const effectiveSeasonId = selectedSeasonId || seasons?.[0]?.id || '';
  const effectiveSeason = seasons?.find((s) => s.id === Number(effectiveSeasonId)) || seasons?.[0];

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ margin: 0 }}>Standings</h1>
        <select className="season-select" value={selectedSeasonId || effectiveSeason?.id || ''} onChange={(e) => setSelectedSeasonId(e.target.value)}>
          {(seasons || []).map((s) => <option key={s.id} value={s.id}>{s.year}</option>)}
        </select>
      </div>

      <div className="tabs">
        <button className={`tab-btn${tab === 'drivers' ? ' active' : ''}`} onClick={() => setTab('drivers')}>Drivers</button>
        <button className={`tab-btn${tab === 'constructors' ? ' active' : ''}`} onClick={() => setTab('constructors')}>Constructors</button>
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
            <th style={{ minWidth: 100 }}>Gap</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s) => {
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

            return (
              <tr key={s.id} style={s.position === 1 ? { background: '#fff8f8' } : {}}>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 26, height: 26, borderRadius: '50%', fontWeight: 700, fontSize: '0.82rem',
                    background: s.position === 1 ? '#e10600' : s.position <= 3 ? '#15151e' : '#eee',
                    color: s.position <= 3 ? '#fff' : '#333',
                  }}>{s.position}</span>
                </td>
                <td>
                  <Link to={slug} style={{ textDecoration: 'none', color: '#111', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600 }}>{name}</span>
                    {code && <span style={{ background: '#f0f0f0', color: '#555', padding: '1px 5px', borderRadius: 3, fontSize: '0.72rem', fontWeight: 700 }}>{code}</span>}
                  </Link>
                </td>
                <td style={{ color: '#555', fontSize: '0.82rem' }}>{flagEmoji(nat)} {nat}</td>
                <td className="num">{s.wins}</td>
                <td className="num" style={{ fontWeight: 700, color: '#e10600' }}>{s.points}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
                    <span style={{ fontSize: '0.72rem', color: '#888', whiteSpace: 'nowrap' }}>{gap === 0 ? 'Leader' : `-${gap}`}</span>
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
