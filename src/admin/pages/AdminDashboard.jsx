import { useQuery } from '../../hooks/useQuery';
import { db } from '../../services/db';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: seasons } = useQuery(() => db.seasons.getAll());
  const { data: drivers } = useQuery(() => db.drivers.getAll());
  const { data: constructors } = useQuery(() => db.constructors.getAll());
  const { data: circuits } = useQuery(() => db.circuits.getAll());
  const { data: races } = useQuery(() => db.races.getAll());

  const stats = [
    { label: 'Seasons', value: seasons?.length ?? '—', to: '/admin/seasons' },
    { label: 'Drivers', value: drivers?.length ?? '—', to: '/admin/drivers' },
    { label: 'Constructors', value: constructors?.length ?? '—', to: '/admin/constructors' },
    { label: 'Circuits', value: circuits?.length ?? '—', to: '/admin/circuits' },
    { label: 'Races', value: races?.length ?? '—', to: '/admin/races' },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={styles.grid}>
        {stats.map(({ label, value, to }) => (
          <Link key={label} to={to} style={styles.card}>
            <div style={styles.value}>{value}</div>
            <div style={styles.label}>{label}</div>
          </Link>
        ))}
      </div>
      <div style={styles.quickActions}>
        <h2>Quick Actions</h2>
        <Link to="/admin/import" style={styles.actionBtn}>⬇️ Import Season Data</Link>
      </div>
    </div>
  );
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: {
    background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8,
    padding: '1.5rem', textAlign: 'center', textDecoration: 'none', color: '#333',
  },
  value: { fontSize: '2rem', fontWeight: 700, color: '#e10600' },
  label: { fontSize: '0.9rem', color: '#666', marginTop: 4 },
  quickActions: { background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, padding: '1.5rem' },
  actionBtn: {
    display: 'inline-block', background: '#e10600', color: '#fff',
    padding: '0.6rem 1.25rem', borderRadius: 4, textDecoration: 'none', fontWeight: 600,
  },
};
