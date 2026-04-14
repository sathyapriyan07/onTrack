import { useParams, Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { supabase } from '../services/supabase';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/StatusComponents';
import { formatDate } from '../utils/format';
import { Icon } from '../components/Icons';

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
  const raceList = races || [];

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          Circuit
        </div>
        <h1 style={{ margin: '0 0 10px' }}>{circuit.name}</h1>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)', fontSize: '0.9rem' }}>
            <Icon name="location_on" size={16} style={{ color: 'var(--text3)' }} />
            {circuit.locality}{circuit.country ? `, ${circuit.country}` : ''}
          </span>
          {circuit.lat && circuit.long && (
            <span style={{ color: 'var(--text3)', fontSize: '0.82rem', fontFamily: 'monospace' }}>
              {parseFloat(circuit.lat).toFixed(4)}°, {parseFloat(circuit.long).toFixed(4)}°
            </span>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="red-link" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="open_in_new" size={14} /> Maps
            </a>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Races Held', value: raceList.length },
          { label: 'First Race', value: raceList.length ? Math.min(...raceList.map(r => r.seasons?.year)) : '—' },
          { label: 'Last Race',  value: raceList.length ? Math.max(...raceList.map(r => r.seasons?.year)) : '—' },
        ].map(({ label, value }) => (
          <div key={label} style={statBox}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text3)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Two-column grid */}
      <div className="circuit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <section>
          <div className="section-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Race History</div>
          {raceList.length === 0 ? <EmptyState message="No races found." /> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Season</th><th>Rnd</th><th>Race</th><th>Date</th></tr></thead>
                <tbody>
                  {raceList.map((r) => (
                    <tr key={r.id}>
                      <td><Link to={`/seasons/${r.seasons?.year}`} className="red-link">{r.seasons?.year}</Link></td>
                      <td style={{ color: 'var(--text3)' }}>{r.round}</td>
                      <td><Link to={`/races/${r.id}`} className="red-link">{r.race_name}</Link></td>
                      <td style={{ color: 'var(--text3)' }}>{formatDate(r.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <div className="section-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Race Winners</div>
          {(winners || []).length === 0 ? <EmptyState message="No winner data found." /> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Season</th><th>Winner</th><th>Team</th></tr></thead>
                <tbody>
                  {(winners || []).map((w) => (
                    <tr key={w.race_id}>
                      <td style={{ color: 'var(--text3)' }}>{w.races?.seasons?.year}</td>
                      <td><Link to={`/drivers/${w.drivers?.driver_id}`} className="red-link">{w.drivers?.given_name} {w.drivers?.family_name}</Link></td>
                      <td style={{ color: 'var(--text2)' }}>{w.constructors?.name}</td>
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

const statBox = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '1rem 1.5rem',
  minWidth: 110,
  textAlign: 'center',
};
