import { useParams, Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { supabase } from '../services/supabase';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { formatDate } from '../utils/format';

function fetchCircuitBySlug(slug) {
  return supabase.from('circuits').select('*').eq('circuit_id', slug).single();
}
function fetchRacesByCircuit(id) {
  return supabase.from('races').select('id, round, race_name, date, seasons(year)').eq('circuit_id', id).order('date', { ascending: false });
}
function fetchWinnersByCircuit(id) {
  return supabase.from('race_results')
    .select('race_id, drivers(given_name, family_name, driver_id), constructors(name), races!inner(circuit_id, seasons(year))')
    .eq('position', 1).eq('races.circuit_id', id);
}

export default function CircuitDetailPage() {
  const { circuitId } = useParams();

  const { data: circuit, loading: cLoading, error: cError } = useQuery(() => fetchCircuitBySlug(circuitId), [circuitId]);
  const { data: races, loading: rLoading } = useQuery(() => fetchRacesByCircuit(circuit.id), [circuit?.id], { skip: !circuit });
  const { data: winners, loading: wLoading } = useQuery(() => fetchWinnersByCircuit(circuit.id), [circuit?.id], { skip: !circuit });

  if (cLoading || rLoading || wLoading) return <LoadingSpinner />;
  if (cError) return <ErrorMessage message={cError} />;
  if (!circuit) return <EmptyState message="Circuit not found." />;

  const mapsUrl = circuit.lat && circuit.long ? `https://www.google.com/maps?q=${circuit.lat},${circuit.long}` : null;

  return (
    <div className="page">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🏁</div>
        <div>
          <h1 style={{ marginBottom: 4 }}>{circuit.name}</h1>
          <p style={{ color: '#555', marginBottom: 3 }}>📍 {circuit.locality}{circuit.country ? `, ${circuit.country}` : ''}</p>
          {circuit.lat && circuit.long && (
            <p style={{ color: '#999', fontSize: '0.82rem', fontFamily: 'monospace', margin: 0 }}>
              {parseFloat(circuit.lat).toFixed(4)}°, {parseFloat(circuit.long).toFixed(4)}°
              {mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer" className="red-link" style={{ marginLeft: 8, fontFamily: 'sans-serif' }}>View on Maps ↗</a>}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Races Held', value: (races || []).length },
          { label: 'First Race', value: (races || []).length ? Math.min(...(races || []).map((r) => r.seasons?.year)) : '—' },
          { label: 'Last Race',  value: (races || []).length ? Math.max(...(races || []).map((r) => r.seasons?.year)) : '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#15151e', color: '#fff', borderRadius: 8, padding: '0.85rem 1.5rem', textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#e10600' }}>{value}</div>
            <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="circuit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <section style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, padding: '1.1rem' }}>
          <h2>Race History</h2>
          {(races || []).length === 0 ? <EmptyState message="No races found." /> : (
            <div className="table-wrap" style={{ border: 'none' }}>
              <table>
                <thead><tr><th>Season</th><th>Rnd</th><th>Race</th><th>Date</th></tr></thead>
                <tbody>
                  {(races || []).map((r) => (
                    <tr key={r.id}>
                      <td><Link to={`/seasons/${r.seasons?.year}`} className="red-link">{r.seasons?.year}</Link></td>
                      <td>{r.round}</td>
                      <td><Link to={`/races/${r.id}`} className="red-link">{r.race_name}</Link></td>
                      <td>{formatDate(r.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, padding: '1.1rem' }}>
          <h2>Race Winners</h2>
          {(winners || []).length === 0 ? <EmptyState message="No winner data found." /> : (
            <div className="table-wrap" style={{ border: 'none' }}>
              <table>
                <thead><tr><th>Season</th><th>Winner</th><th>Team</th></tr></thead>
                <tbody>
                  {(winners || []).map((w) => (
                    <tr key={w.race_id}>
                      <td>{w.races?.seasons?.year}</td>
                      <td><Link to={`/drivers/${w.drivers?.driver_id}`} className="red-link">{w.drivers?.given_name} {w.drivers?.family_name}</Link></td>
                      <td>{w.constructors?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
