import { useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { db } from '../../services/db';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/StatusComponents';
import { positionSuffix } from '../../utils/format';

export default function AdminResults() {
  const [raceId, setRaceId] = useState('');
  const { data: races } = useQuery(() => db.races.getAll());

  const { data: results, loading, error, refetch } = useQuery(
    () => raceId ? db.raceResults.getByRace(parseInt(raceId)) : Promise.resolve({ data: [] }),
    [raceId]
  );

  async function handleDelete(id) {
    if (!window.confirm('Delete this result?')) return;
    const { error: err } = await db.raceResults.delete(id);
    if (err) return alert(err.message);
    refetch();
  }

  async function handleUpdate(result) {
    const points = prompt('New points:', result.points);
    if (points === null) return;
    const position = prompt('New position:', result.position);
    if (position === null) return;
    const { error: err } = await db.raceResults.update(result.id, {
      points: parseFloat(points),
      position: parseInt(position),
    });
    if (err) return alert(err.message);
    refetch();
  }

  return (
    <div>
      <h1>Race Results</h1>
      <div style={styles.filter}>
        <label style={styles.label}>Select Race</label>
        <select value={raceId} onChange={(e) => setRaceId(e.target.value)} style={styles.select}>
          <option value="">— Select a race —</option>
          {(races || []).map((r) => (
            <option key={r.id} value={r.id}>
              {r.seasons?.year} R{r.round} — {r.race_name}
            </option>
          ))}
        </select>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {!raceId && <EmptyState message="Select a race to view results." />}

      {raceId && !loading && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Pos</th><th>Driver</th><th>Team</th><th>Grid</th>
                <th>Points</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(results || []).length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No results.</td></tr>
              )}
              {(results || []).map((r) => (
                <tr key={r.id}>
                  <td>{positionSuffix(r.position)}</td>
                  <td>{r.drivers?.given_name} {r.drivers?.family_name}</td>
                  <td>{r.constructors?.name}</td>
                  <td>{r.grid ?? '—'}</td>
                  <td>{r.points}</td>
                  <td style={{ fontSize: '0.8rem', color: '#666' }}>{r.status}</td>
                  <td>
                    <button onClick={() => handleUpdate(r)} style={styles.editBtn}>Edit</button>
                    <button onClick={() => handleDelete(r.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  filter: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1.5rem', maxWidth: 400 },
  label: { fontWeight: 600, fontSize: '0.85rem' },
  select: { padding: '0.5rem', border: '1px solid #ddd', borderRadius: 4 },
  tableWrapper: { background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  editBtn: {
    background: '#f0f0f0', border: 'none', padding: '3px 10px',
    borderRadius: 3, cursor: 'pointer', marginRight: 4, fontSize: '0.8rem',
  },
  deleteBtn: {
    background: '#fff0f0', color: '#e10600', border: 'none', padding: '3px 10px',
    borderRadius: 3, cursor: 'pointer', fontSize: '0.8rem',
  },
};
