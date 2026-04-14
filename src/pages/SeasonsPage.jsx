import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';

export default function SeasonsPage() {
  const { data: seasons, loading, error } = useQuery(() => db.seasons.getAll());

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!seasons?.length) return <EmptyState message="No seasons found." />;

  const [latest, ...rest] = seasons;

  return (
    <div className="page">
      <h1 style={{ marginBottom: '1.75rem' }}>Seasons</h1>

      {/* Latest season featured */}
      <div className="section-title">Latest Season</div>
      <Link to={`/seasons/${latest.year}`} style={featuredCard}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#e10600', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Current Season</div>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{latest.year}</div>
        </div>
        <div style={{ color: '#e10600', fontSize: '2rem', fontWeight: 900 }}>→</div>
      </Link>

      {/* All other seasons */}
      {rest.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: '2rem' }}>All Seasons</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 1, background: '#e5e5e5', border: '1px solid #e5e5e5' }}>
            {rest.map((s) => (
              <Link key={s.id} to={`/seasons/${s.year}`} style={yearCard}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>{s.year}</span>
                <span style={{ color: '#e10600', fontWeight: 800 }}>→</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const featuredCard = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#15151e',
  padding: '2rem 2.5rem',
  textDecoration: 'none',
  marginBottom: '0.5rem',
  borderLeft: '5px solid #e10600',
};
const yearCard = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.1rem 1.25rem',
  textDecoration: 'none',
  color: '#15151e',
  background: '#fff',
  fontWeight: 700,
  transition: 'background 0.15s',
};
