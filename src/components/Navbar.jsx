import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Icon } from './Icons';

const navLinks = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/drivers', label: 'Drivers', icon: 'person' },
  { to: '/constructors', label: 'Constructors', icon: 'directions_car' },
  { to: '/circuits', label: 'Circuits', icon: 'route' },
  { to: '/standings', label: 'Standings', icon: 'leaderboard' },
  { to: '/seasons', label: 'Seasons', icon: 'calendar_month' },
];

export function Navbar() {
  const { session, isAdmin, signOut } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand" onClick={close}>
          on<span>TRACK</span>
        </Link>

        <div className="navbar-links">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={pathname === to ? 'active-link' : ''}>
              {label}
            </Link>
          ))}
          {isAdmin && <Link to="/admin" className="admin-link">Admin</Link>}
        </div>

        <div className="navbar-actions">
          {session
            ? <button className="sign-out" onClick={signOut}>Sign Out</button>
            : <Link to="/login" style={{ color: 'var(--text2)', fontSize: '0.85rem', fontWeight: 500, padding: '0.4rem 0.75rem', borderRadius: 8 }}>Login</Link>
          }
        </div>

        <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </nav>

      <div className={`mobile-menu${open ? ' open' : ''}`}>
        {navLinks.map(({ to, label, icon }) => (
          <Link key={to} to={to} onClick={close} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name={icon} size={18} style={{ color: 'var(--text3)' }} />
            {label}
          </Link>
        ))}
        {isAdmin && <Link to="/admin" className="admin-link" onClick={close}>Admin</Link>}
        {session
          ? <button onClick={() => { signOut(); close(); }}>Sign Out</button>
          : <Link to="/login" onClick={close}>Login</Link>
        }
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      © {new Date().getFullYear()} <span>onTRACK</span> — Formula 1 Database
    </footer>
  );
}
