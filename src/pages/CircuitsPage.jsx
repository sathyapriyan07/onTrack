import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { SearchFilter } from '../components/SearchFilter';
import { Pagination } from '../components/Pagination';
import { Icon } from '../components/Icons';

export default function CircuitsPage() {
  const { data: circuits, loading, error } = useQuery(() => db.circuits.getAll());
  const [search, setSearch] = useState('');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const filtered = (circuits || []).filter(c =>
    `${c.name} ${c.locality} ${c.country}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 16 }}>
        <h1 style={{ margin: 0 }}>Circuits</h1>
        <SearchFilter placeholder="Search circuits..." onFilter={setSearch} />
      </div>

      {filtered.length === 0 ? <EmptyState message="No circuits found." /> : (
        <Pagination
          items={filtered}
          pageSize={24}
          renderTable={(paged) => (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {paged.map(c => (
                <Link key={c.id} to={`/circuits/${c.circuit_id}`} style={card}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <div style={iconArea}>
                    <Icon name="route" size={28} style={{ color: 'var(--text3)' }} />
                  </div>
                  <div style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--white)', marginBottom: 6, letterSpacing: '-0.01em' }}>{c.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text2)', marginBottom: c.lat ? 5 : 0 }}>
                      <Icon name="location_on" size={14} style={{ color: 'var(--text3)' }} />
                      {c.locality}{c.country ? `, ${c.country}` : ''}
                    </div>
                    {c.lat && c.long && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'monospace' }}>
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

const card = { textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'stretch', background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), border-color 0.25s', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' };
const iconArea = { background: 'var(--surface2)', width: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
