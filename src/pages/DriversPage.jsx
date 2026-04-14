import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { SearchFilter } from '../components/SearchFilter';
import { Pagination } from '../components/Pagination';
import { flagEmoji } from '../utils/format';

export default function DriversPage() {
  const { data: drivers, loading, error } = useQuery(() => db.drivers.getAll());
  const [search, setSearch] = useState('');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const filtered = (drivers || []).filter((d) =>
    `${d.given_name} ${d.family_name} ${d.nationality}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Drivers</h1>
        <SearchFilter placeholder="Search drivers..." onFilter={setSearch} />
      </div>

      {filtered.length === 0 ? <EmptyState message="No drivers found." /> : (
        <Pagination
          items={filtered}
          pageSize={24}
          renderTable={(paged) => (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1, background: '#e5e5e5', border: '1px solid #e5e5e5' }}>
              {paged.map((driver) => (
                <Link key={driver.id} to={`/drivers/${driver.driver_id}`} style={card}>
                  {driver.image_url
                    ? <img src={driver.image_url} alt={driver.family_name} style={img} />
                    : <div style={{ ...img, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
                  }
                  <div style={{ padding: '0.85rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#e10600', lineHeight: 1, marginBottom: 4 }}>
                      {driver.permanent_number ? `#${driver.permanent_number}` : '—'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: 2 }}>{driver.given_name}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 6 }}>{driver.family_name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#666' }}>{flagEmoji(driver.nationality)} {driver.nationality}</div>
                    {driver.code && <div style={codeBadge}>{driver.code}</div>}
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
  display: 'block',
  background: '#fff',
  borderLeft: '3px solid transparent',
  transition: 'border-color 0.15s',
};
const img = { width: '100%', height: 130, objectFit: 'cover', objectPosition: 'top', display: 'block' };
const codeBadge = {
  display: 'inline-block',
  marginTop: 6,
  background: '#15151e',
  color: '#fff',
  padding: '2px 8px',
  fontSize: '0.72rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};
