import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { SearchFilter } from '../components/SearchFilter';
import { Flag } from '../components/Icons';
import { teamColor } from '../utils/format';

export default function ConstructorsPage() {
  const { data: constructors, loading, error } = useQuery(() => db.constructors.getAll());
  const [search, setSearch] = useState('');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const filtered = (constructors || []).filter(c =>
    `${c.name} ${c.nationality}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 16 }}>
        <h1 style={{ margin: 0 }}>Constructors</h1>
        <SearchFilter placeholder="Search teams..." onFilter={setSearch} />
      </div>

      {filtered.length === 0 ? <EmptyState message="No constructors found." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(c => {
            const color = teamColor(c.constructor_id);
            return (
              <Link key={c.id} to={`/constructors/${c.constructor_id}`} style={card}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${color}55`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                {/* Team color top bar */}
                <div style={{ height: 3, background: color, width: '100%' }} />
                <div style={logoArea}>
                  {c.logo_url
                    ? <img src={c.logo_url} alt={c.name} style={{ maxWidth: 110, maxHeight: 55, objectFit: 'contain' }} />
                    : <span className="material-symbols-rounded" style={{ fontSize: 40, color: 'var(--surface3)' }}>directions_car</span>
                  }
                </div>
                <div style={{ padding: '0.85rem 1.25rem 1.1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--white)', letterSpacing: '-0.01em', marginBottom: 6 }}>{c.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Flag nationality={c.nationality} height={13} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>{c.nationality}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const card = { textDecoration: 'none', color: 'var(--text)', display: 'block', background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), border-color 0.25s', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' };
const logoArea = { background: 'var(--surface2)', height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' };
