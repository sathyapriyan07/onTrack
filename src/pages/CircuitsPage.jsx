import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { SearchFilter } from '../components/SearchFilter';
import { Pagination } from '../components/Pagination';

export default function CircuitsPage() {
  const { data: circuits, loading, error } = useQuery(() => db.circuits.getAll());
  const [search, setSearch] = useState('');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const filtered = (circuits || []).filter((c) =>
    `${c.name} ${c.locality} ${c.country}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Circuits</h1>
        <SearchFilter placeholder="Search circuits..." onFilter={setSearch} />
      </div>

      {filtered.length === 0 ? <EmptyState message="No circuits found." /> : (
        <Pagination
          items={filtered}
          pageSize={24}
          renderTable={(paged) => (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 1, background: '#e5e5e5', border: '1px solid #e5e5e5' }}>
              {paged.map((c) => (
                <Link key={c.id} to={`/circuits/${c.circuit_id}`} style={card}>
                  <div style={iconWrap}>🏁</div>
                  <div style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 4 }}>{c.name}</div>
                    <div style={{ fontSize: '0.82rem', color: '#555', marginBottom: 4 }}>
                      📍 {c.locality}{c.country ? `, ${c.country}` : ''}
                    </div>
                    {c.lat && c.long && (
                      <div style={{ fontSize: '0.72rem', color: '#aaa', fontFamily: 'monospace' }}>
                        {parseFloat(c.lat).toFixed(3)}, {parseFloat(c.long).toFixed(3)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        />
      )}
    </div>
  );
}

const card = {
  textDecoration: 'none',
  color: '#15151e',
  display: 'flex',
  background: '#fff',
  borderLeft: '3px solid transparent',
  transition: 'border-color 0.15s',
  alignItems: 'stretch',
};
const iconWrap = {
  background: '#15151e',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  width: 56,
  flexShrink: 0,
};
