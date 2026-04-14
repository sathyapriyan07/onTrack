import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const adminLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/import', label: 'Import Data' },
  { to: '/admin/drivers', label: 'Drivers' },
  { to: '/admin/constructors', label: 'Constructors' },
  { to: '/admin/circuits', label: 'Circuits' },
  { to: '/admin/seasons', label: 'Seasons' },
  { to: '/admin/races', label: 'Races' },
  { to: '/admin/results', label: 'Results' },
];

export function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-title">Admin Panel</div>
        {adminLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={pathname === to ? 'active' : ''}
            onClick={() => setSidebarOpen(false)}
          >
            {label}
          </Link>
        ))}
        <Link
          to="/"
          style={{ marginTop: 'auto', color: 'var(--text3)', paddingTop: '1rem' }}
          onClick={() => setSidebarOpen(false)}
        >
          ← Back to Site
        </Link>
      </aside>

      <main className="admin-main">{children}</main>

      <button className="admin-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
        {sidebarOpen ? '✕' : '☰'}
      </button>
    </div>
  );
}
