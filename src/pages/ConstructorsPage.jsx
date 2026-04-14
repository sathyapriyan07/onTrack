import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { SearchFilter } from '../components/SearchFilter';
import { flagEmoji } from '../utils/format';

export default function ConstructorsPage() {
  const { data: constructors, loading, error } = useQuery(() => db.constructors.getAll());
  const [search, setSearch] = useState('');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const filtered = (constructors || []).filter((c) =>
    `${c.name} ${c.nationality}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Constructors</h1>
        <SearchFilter placeholder="Search teams..." onFilter={setSearch} />
      </div>

      {filtered.length === 0 ? <EmptyState message="No constructors found." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1, background: '#e5e5e5', border: '1px solid #e5e5e5' }}>
          {filtered.map((c) => (
            <Link key={c.id} to={`/constructors/${c.constructor_id}`} style={card}>
              <div style={logoWrap}>
                {c.logo_url
                  ? <img src={c.logo_url} alt={c.name} style={{ maxWidth: 100, maxHeight: 50, objectFit: 'contain' }} />
                  : <span style={{ fontSize: '2rem' }}>🏎</span>
                }
              </div>
              <div style={{ padding: '0.85rem 1rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#666' }}>{flagEmoji(c.nationality)} {c.nationality}</div>
              </div>
              <div style={redStrip} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const card = {
  textDecoration: 'none',
  color: '#15151e',
  display: 'flex',
  flexDirection: 'column',
  background: '#fff',
  position: 'relative',
  overflow: 'hidden',
  transition: 'box-shadow 0.15s',
};
const logoWrap = {
  background: '#f5f5f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 90,
  padding: '1rem',
};
const redStrip = {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 3,
  background: '#e10600',
};
