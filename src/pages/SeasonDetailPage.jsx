import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { formatDate } from '../utils/format';

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
      <h1>Season {year}</h1>
      <div className="tabs">
        {['races', 'drivers', 'constructors'].map((t) => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'races' && (
        (races || []).length === 0 ? <EmptyState message="No races found." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Rnd</th><th>Race</th><th>Circuit</th><th>Date</th></tr></thead>
              <tbody>
                {(races || []).map((r) => (
                  <tr key={r.id}>
                    <td>{r.round}</td>
                    <td><Link to={`/races/${r.id}`} className="red-link">{r.race_name}</Link></td>
                    <td>{r.circuits?.name}, {r.circuits?.country}</td>
                    <td>{formatDate(r.date)}</td>
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
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>{s.position}</td>
                    <td><Link to={`/drivers/${s.drivers?.driver_id}`} className="red-link">{s.drivers?.given_name} {s.drivers?.family_name}</Link></td>
                    <td className="num" style={{ fontWeight: 700, color: '#e10600' }}>{s.points}</td>
                    <td className="num">{s.wins}</td>
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
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>{s.position}</td>
                    <td><Link to={`/constructors/${s.constructors?.constructor_id}`} className="red-link">{s.constructors?.name}</Link></td>
                    <td className="num" style={{ fontWeight: 700, color: '#e10600' }}>{s.points}</td>
                    <td className="num">{s.wins}</td>
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
