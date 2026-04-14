import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { Icon } from '../components/Icons';

export default function SeasonsPage() {
  const { data: seasons, loading, error } = useQuery(() => db.seasons.getAll());

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!seasons?.length) return <EmptyState message="No seasons found." />;

  const [latest, ...rest] = seasons;

  return (
    <div className="page">
      <h1 style={{ marginBottom: '2rem' }}>Seasons</h1>

      <Link to={`/seasons/${latest.year}`} style={featuredCard}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(225,6,0,0.5)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(225,6,0,0.2)'}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(225,6,0,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Icon name="star" size={14} fill style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Season</span>
          </div>
          <div style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, color: 'var(--white)', lineHeight: 1, letterSpacing: '-0.04em' }}>
            {latest.year}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Icon name="arrow_forward" size={28} style={{ color: 'var(--text3)' }} />
        </div>
      </Link>

      {rest.length > 0 && (
        <>
          <h2 style={{ marginTop: '2.5rem', marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--text3)', fontWeight: 500 }}>
            Previous Seasons
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {rest.map(s => (
              <Link key={s.id} to={`/seasons/${s.year}`} style={yearCard}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em' }}>{s.year}</span>
                <Icon name="chevron_right" size={18} style={{ color: 'var(--text3)' }} />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const featuredCard = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', border: '1px solid rgba(225,6,0,0.2)', borderRadius: 20, padding: '2.5rem 3rem', textDecoration: 'none', position: 'relative', overflow: 'hidden', transition: 'border-color 0.25s' };
const yearCard = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 1.25rem', textDecoration: 'none', color: 'var(--text)', background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, transition: 'background 0.2s, border-color 0.2s' };
