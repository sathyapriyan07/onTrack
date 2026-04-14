import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { formatDate } from '../utils/format';
import { Icon } from '../components/Icons';

export default function SeasonDetailPage() {
  const { year } = useParams();
  const [tab, setTab] = useState('races');

  const { data: season } = useQuery(
    () => supabase.from('seasons').select('*').eq('year', parseInt(year)).single(), [year]
  );
  const { data: races, loading: rLoading } = useQuery(
    () => db.races.getBySeason(season.id), [season?.id], { skip: !season }
  );
  const { data: driverStandings, loading: dsLoading } = useQuery(
    () => db.driverStandings.getBySeason(season.id), [season?.id], { skip: !season }
  );
  const { data: constructorStandings, loading: csLoading } = useQuery(
    () => db.constructorStandings.getBySeason(season.id), [season?.id], { skip: !season }
  );

  if (rLoading || dsLoading || csLoading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          Formula 1
        </div>
        <h1 style={{ margin: 0 }}>Season {year}</h1>
      </div>

      <div className="tabs">
        <button className={`tab-btn${tab === 'races' ? ' active' : ''}`} onClick={() => setTab('races')}>
          <Icon name="flag" size={15} /> Races
        </button>
        <button className={`tab-btn${tab === 'drivers' ? ' active' : ''}`} onClick={() => setTab('drivers')}>
          <Icon name="person" size={15} /> Drivers
        </button>
        <button className={`tab-btn${tab === 'constructors' ? ' active' : ''}`} onClick={() => setTab('constructors')}>
          <Icon name="directions_car" size={15} /> Constructors
        </button>
      </div>

      {tab === 'races' && (
        (races || []).length === 0 ? <EmptyState message="No races found." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Rnd</th><th>Race</th><th>Circuit</th><th>Date</th></tr></thead>
              <tbody>
                {(races || []).map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text3)', fontWeight: 600 }}>{r.round}</td>
                    <td><Link to={`/races/${r.id}`} className="red-link">{r.race_name}</Link></td>
                    <td style={{ color: 'var(--text2)' }}>{r.circuits?.name}, {r.circuits?.country}</td>
                    <td style={{ color: 'var(--text3)' }}>{formatDate(r.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'drivers' && (
        (driverStandings || []).length === 0 ? <EmptyState message="No standings found." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Pos</th><th>Driver</th><th className="num">Points</th><th className="num">Wins</th></tr></thead>
              <tbody>
                {(driverStandings || []).map((s) => (
                  <tr key={s.id} style={s.position === 1 ? { background: 'rgba(225,6,0,0.06)' } : {}}>
                    <td style={{ fontWeight: 700, color: s.position <= 3 ? 'var(--accent)' : 'var(--text)' }}>{s.position}</td>
                    <td><Link to={`/drivers/${s.drivers?.driver_id}`} className="red-link">{s.drivers?.given_name} {s.drivers?.family_name}</Link></td>
                    <td className="num" style={{ fontWeight: 700, color: 'var(--accent)' }}>{s.points}</td>
                    <td className="num" style={{ color: 'var(--text2)' }}>{s.wins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'constructors' && (
        (constructorStandings || []).length === 0 ? <EmptyState message="No standings found." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Pos</th><th>Constructor</th><th className="num">Points</th><th className="num">Wins</th></tr></thead>
              <tbody>
                {(constructorStandings || []).map((s) => (
                  <tr key={s.id} style={s.position === 1 ? { background: 'rgba(225,6,0,0.06)' } : {}}>
                    <td style={{ fontWeight: 700, color: s.position <= 3 ? 'var(--accent)' : 'var(--text)' }}>{s.position}</td>
                    <td><Link to={`/constructors/${s.constructors?.constructor_id}`} className="red-link">{s.constructors?.name}</Link></td>
                    <td className="num" style={{ fontWeight: 700, color: 'var(--accent)' }}>{s.points}</td>
                    <td className="num" style={{ color: 'var(--text2)' }}>{s.wins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
