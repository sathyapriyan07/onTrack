import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { db } from '../services/db';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { SearchFilter } from '../components/SearchFilter';
import { Pagination } from '../components/Pagination';
import { Flag } from '../components/Icons';

export default function DriversPage() {
  const { data: drivers, loading, error } = useQuery(() => db.drivers.getAll());
  const [search, setSearch] = useState('');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const filtered = (drivers || []).filter(d =>
    `${d.given_name} ${d.family_name} ${d.nationality}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 16 }}>
        <h1 style={{ margin: 0 }}>Drivers</h1>
        <SearchFilter placeholder="Search drivers..." onFilter={setSearch} />
      </div>

      {filtered.length === 0 ? <EmptyState message="No drivers found." /> : (
        <Pagination
          items={filtered}
          pageSize={24}
          renderTable={(paged) => (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {paged.map(driver => (
                <Link key={driver.id} to={`/drivers/${driver.driver_id}`} style={card}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <div style={imgWrap}>
                    {driver.image_url
                      ? <img src={driver.image_url} alt={driver.family_name} style={imgStyle} />
                      : <div style={{ ...imgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', fontSize: '3rem', color: 'var(--surface3)' }}>
                          <span className="material-symbols-rounded" style={{ fontSize: 48 }}>person</span>
                        </div>
                    }
                    {driver.permanent_number && (
                      <div style={numBadge}>#{driver.permanent_number}</div>
                    )}
                  </div>
                  <div style={{ padding: '0.9rem' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: 2 }}>{driver.given_name}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.01em', marginBottom: 8 }}>{driver.family_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Flag nationality={driver.nationality} height={13} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{driver.nationality}</span>
                    </div>
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

const card = { textDecoration: 'none', color: 'var(--text)', display: 'block', background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), border-color 0.25s, box-shadow 0.25s', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' };
const imgWrap = { position: 'relative', overflow: 'hidden' };
const imgStyle = { width: '100%', height: 160, objectFit: 'cover', objectPosition: 'top', display: 'block' };
const numBadge = { position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: 'var(--accent)', fontWeight: 800, fontSize: '0.85rem', padding: '3px 9px', borderRadius: 8 };
const codeBadge = { display: 'inline-block', marginTop: 8, background: 'var(--surface3)', color: 'var(--text2)', padding: '2px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' };
