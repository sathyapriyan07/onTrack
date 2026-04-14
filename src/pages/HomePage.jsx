import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { LoadingSpinner } from '../components/StatusComponents';
import { formatDate } from '../utils/format';

export default function HomePage() {
  const { data: seasons, loading: sLoading } = useQuery(() => db.seasons.getAll());
  const latestSeason = seasons?.[0];

  const { data: races, loading: rLoading } = useQuery(
    () => db.races.getBySeason(latestSeason.id), [latestSeason?.id], { skip: !latestSeason }
  );
  const { data: driverStandings } = useQuery(
    () => db.driverStandings.getBySeason(latestSeason.id), [latestSeason?.id], { skip: !latestSeason }
  );
  const { data: constructorStandings } = useQuery(
    () => db.constructorStandings.getBySeason(latestSeason.id), [latestSeason?.id], { skip: !latestSeason }
  );

  if (sLoading || rLoading) return <LoadingSpinner />;

  const top5Drivers = (driverStandings || []).slice(0, 5);
  const top5Constructors = (constructorStandings || []).slice(0, 5);
  const recentRaces = (races || []).filter((r) => new Date(r.date) <= new Date()).slice(-3).reverse();

  return (
    <>
      {/* Hero */}
      <div style={heroWrap}>
        <div style={heroInner}>
          <div style={heroTag}>Formula 1 Database</div>
          <h1 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '3rem', letterSpacing: '-0.03em' }}>
            onTRACK
          </h1>
          {latestSeason && (
            <p style={{ color: '#aaa', margin: '0 0 1.75rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Season {latestSeason.year} · {races?.length || 0} Races
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { to: '/seasons', label: 'Seasons' },
              { to: '/drivers', label: 'Drivers' },
              { to: '/constructors', label: 'Constructors' },
              { to: '/standings', label: 'Standings' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={heroBtn}>{label}</Link>
            ))}
          </div>
        </div>
        <div style={heroAccent} />
      </div>

      <div className="page" style={{ paddingTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

          {/* Recent Races */}
          <section>
            <div className="section-title">Recent Races</div>
            <div style={panel}>
              {recentRaces.length === 0
                ? <p style={{ color: '#888', padding: '1rem' }}>No races yet.</p>
                : recentRaces.map((race, i) => (
                  <Link key={race.id} to={`/races/${race.id}`} style={{ ...raceRow, borderTop: i === 0 ? 'none' : '1px solid #f0f0f0' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#e10600', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                        Round {race.round}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{race.race_name}</div>
                    </div>
                    <div style={{ color: '#888', fontSize: '0.82rem', flexShrink: 0 }}>{formatDate(race.date)}</div>
                  </Link>
                ))
              }
              {latestSeason && (
                <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f0f0f0' }}>
                  <Link to={`/seasons/${latestSeason.year}`} className="red-link">Full Season →</Link>
                </div>
              )}
            </div>
          </section>

          {/* Driver Standings */}
          <section>
            <div className="section-title">Driver Standings {latestSeason?.year}</div>
            <div style={panel}>
              {top5Drivers.length === 0
                ? <p style={{ color: '#888', padding: '1rem' }}>No standings yet.</p>
                : top5Drivers.map((s, i) => (
                  <Link key={s.id} to={`/drivers/${s.drivers?.driver_id}`} style={{ ...standingRow, borderTop: i === 0 ? 'none' : '1px solid #f0f0f0' }}>
                    <span style={posBadge(s.position)}>{s.position}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: '0.92rem' }}>
                      {s.drivers?.given_name} <strong>{s.drivers?.family_name}</strong>
                    </span>
                    <span style={{ fontWeight: 800, color: '#e10600', fontSize: '0.92rem' }}>{s.points} <span style={{ fontWeight: 400, color: '#888', fontSize: '0.75rem' }}>pts</span></span>
                  </Link>
                ))
              }
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f0f0f0' }}>
                <Link to="/standings" className="red-link">Full Standings →</Link>
              </div>
            </div>
          </section>

          {/* Constructor Standings */}
          <section>
            <div className="section-title">Constructor Standings {latestSeason?.year}</div>
            <div style={panel}>
              {top5Constructors.length === 0
                ? <p style={{ color: '#888', padding: '1rem' }}>No standings yet.</p>
                : top5Constructors.map((s, i) => (
                  <Link key={s.id} to={`/constructors/${s.constructors?.constructor_id}`} style={{ ...standingRow, borderTop: i === 0 ? 'none' : '1px solid #f0f0f0' }}>
                    <span style={posBadge(s.position)}>{s.position}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: '0.92rem' }}>{s.constructors?.name}</span>
                    <span style={{ fontWeight: 800, color: '#e10600', fontSize: '0.92rem' }}>{s.points} <span style={{ fontWeight: 400, color: '#888', fontSize: '0.75rem' }}>pts</span></span>
                  </Link>
                ))
              }
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f0f0f0' }}>
                <Link to="/standings?tab=constructors" className="red-link">Full Standings →</Link>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

const heroWrap = {
  position: 'relative',
  background: '#15151e',
  overflow: 'hidden',
  minHeight: 340,
  display: 'flex',
  alignItems: 'center',
};
const heroInner = {
  position: 'relative',
  zIndex: 1,
  maxWidth: 1280,
  margin: '0 auto',
  padding: '3.5rem 1.5rem',
  width: '100%',
};
const heroTag = {
  display: 'inline-block',
  background: '#e10600',
  color: '#fff',
  fontSize: '0.72rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  padding: '4px 10px',
  marginBottom: '1rem',
};
const heroAccent = {
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: '35%',
  background: 'linear-gradient(135deg, transparent 40%, #e10600 40%, #e10600 55%, transparent 55%)',
  opacity: 0.08,
};
const heroBtn = {
  background: '#e10600',
  color: '#fff',
  padding: '0.6rem 1.4rem',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: '0.82rem',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  transition: 'background 0.15s',
};
const panel = {
  background: '#fff',
  border: '1px solid #e5e5e5',
};
const raceRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.9rem 1.25rem',
  textDecoration: 'none',
  color: '#15151e',
  gap: 12,
  transition: 'background 0.15s',
};
const standingRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '0.75rem 1.25rem',
  textDecoration: 'none',
  color: '#15151e',
  transition: 'background 0.15s',
};
const posBadge = (pos) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  fontWeight: 800,
  fontSize: '0.82rem',
  background: pos === 1 ? '#e10600' : pos <= 3 ? '#15151e' : '#f0f0f0',
  color: pos <= 3 ? '#fff' : '#555',
  flexShrink: 0,
});
