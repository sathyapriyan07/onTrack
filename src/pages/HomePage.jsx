import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { LoadingSpinner } from '../components/StatusComponents';
import { Icon, Flag } from '../components/Icons';
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
  const recentRaces = (races || []).filter(r => new Date(r.date) <= new Date()).slice(-3).reverse();

  return (
    <>
      {/* Hero */}
      <div style={heroWrap}>
        <div style={heroBg} />
        <div style={heroContent}>
          <div style={heroEyebrow}>Formula 1 · {latestSeason?.year} Season</div>
          <h1 style={{ color: '#fff', margin: '0.5rem 0 1rem', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
            onTRACK
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 2rem', fontSize: '1.1rem', fontWeight: 300, maxWidth: 480 }}>
            The complete Formula 1 database — drivers, constructors, circuits, and race history.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { to: '/seasons', label: 'Seasons', icon: 'calendar_month' },
              { to: '/drivers', label: 'Drivers', icon: 'person' },
              { to: '/constructors', label: 'Constructors', icon: 'directions_car' },
              { to: '/standings', label: 'Standings', icon: 'leaderboard' },
            ].map(({ to, label, icon }) => (
              <Link key={to} to={to} style={heroBtn}>
                <Icon name={icon} size={16} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="page" style={{ paddingTop: '3rem' }}>
        {latestSeason && (
          <div style={{ display: 'flex', gap: 12, marginBottom: '3rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Season', value: latestSeason.year, icon: 'calendar_month' },
              { label: 'Races', value: races?.length || 0, icon: 'flag' },
              { label: 'Driver Leader', value: top5Drivers[0]?.drivers?.family_name || '—', icon: 'emoji_events' },
              { label: 'Constructor Leader', value: top5Constructors[0]?.constructors?.name || '—', icon: 'directions_car' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={quickStat}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Icon name={icon} size={14} style={{ color: 'var(--text3)' }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--white)' }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

          {/* Recent Races */}
          <section>
            <div style={sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="flag" size={18} style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--white)' }}>Recent Races</span>
              </div>
              {latestSeason && <Link to={`/seasons/${latestSeason.year}`} style={seeAll}>See all</Link>}
            </div>
            <div style={panel}>
              {recentRaces.length === 0
                ? <div style={{ padding: '1.5rem', color: 'var(--text3)', fontSize: '0.9rem' }}>No races yet.</div>
                : recentRaces.map((race, i) => (
                  <Link key={race.id} to={`/races/${race.id}`} style={{ ...raceRow, borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        Round {race.round}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--white)' }}>{race.race_name}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)', fontSize: '0.8rem', flexShrink: 0 }}>
                      <Icon name="calendar_today" size={14} />
                      {formatDate(race.date)}
                    </div>
                  </Link>
                ))
              }
            </div>
          </section>

          {/* Driver Standings */}
          <section>
            <div style={sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="leaderboard" size={18} style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--white)' }}>Drivers {latestSeason?.year}</span>
              </div>
              <Link to="/standings" style={seeAll}>See all</Link>
            </div>
            <div style={panel}>
              {top5Drivers.length === 0
                ? <div style={{ padding: '1.5rem', color: 'var(--text3)', fontSize: '0.9rem' }}>No standings yet.</div>
                : top5Drivers.map((s, i) => (
                  <Link key={s.id} to={`/drivers/${s.drivers?.driver_id}`} style={{ ...standingRow, borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                    <span style={posBadge(s.position)}>{s.position}</span>
                    <Flag nationality={s.drivers?.nationality} height={14} />
                    <span style={{ flex: 1, fontWeight: 500, fontSize: '0.92rem', color: 'var(--text)' }}>
                      {s.drivers?.given_name} <strong style={{ color: 'var(--white)' }}>{s.drivers?.family_name}</strong>
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.92rem' }}>
                      {s.points}<span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: '0.72rem', marginLeft: 3 }}>pts</span>
                    </span>
                  </Link>
                ))
              }
            </div>
          </section>

          {/* Constructor Standings */}
          <section>
            <div style={sectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="emoji_events" size={18} style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--white)' }}>Constructors {latestSeason?.year}</span>
              </div>
              <Link to="/standings" style={seeAll}>See all</Link>
            </div>
            <div style={panel}>
              {top5Constructors.length === 0
                ? <div style={{ padding: '1.5rem', color: 'var(--text3)', fontSize: '0.9rem' }}>No standings yet.</div>
                : top5Constructors.map((s, i) => (
                  <Link key={s.id} to={`/constructors/${s.constructors?.constructor_id}`} style={{ ...standingRow, borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                    <span style={posBadge(s.position)}>{s.position}</span>
                    <Flag nationality={s.constructors?.nationality} height={14} />
                    <span style={{ flex: 1, fontWeight: 600, fontSize: '0.92rem', color: 'var(--white)' }}>{s.constructors?.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.92rem' }}>
                      {s.points}<span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: '0.72rem', marginLeft: 3 }}>pts</span>
                    </span>
                  </Link>
                ))
              }
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

const heroWrap = { position: 'relative', minHeight: 480, display: 'flex', alignItems: 'center', overflow: 'hidden', background: '#000' };
const heroBg = { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 60% 50%, rgba(225,6,0,0.12) 0%, transparent 70%), radial-gradient(ellipse 50% 80% at 10% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)' };
const heroContent = { position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '4rem 2rem', width: '100%' };
const heroEyebrow = { display: 'inline-block', background: 'rgba(225,6,0,0.15)', border: '1px solid rgba(225,6,0,0.3)', color: 'var(--accent)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 20, marginBottom: 8 };
const heroBtn = { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.6rem 1.4rem', borderRadius: 20, textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' };
const quickStat = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.85rem 1.25rem', flex: '1 1 140px' };
const panel = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' };
const sectionHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' };
const seeAll = { color: 'var(--text3)', fontSize: '0.82rem', fontWeight: 500 };
const raceRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', textDecoration: 'none', color: 'var(--text)', gap: 12, transition: 'background 0.2s' };
const standingRow = { display: 'flex', alignItems: 'center', gap: 10, padding: '0.85rem 1.25rem', textDecoration: 'none', color: 'var(--text)', transition: 'background 0.2s' };
const posBadge = (pos) => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 26, height: 26, borderRadius: '50%', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0,
  background: pos === 1 ? 'var(--accent)' : pos <= 3 ? 'var(--surface3)' : 'transparent',
  color: pos <= 3 ? '#fff' : 'var(--text3)',
  border: pos > 3 ? '1px solid var(--border)' : 'none',
});
