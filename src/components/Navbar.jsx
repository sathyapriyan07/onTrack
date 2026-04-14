import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/constructors', label: 'Constructors' },
  { to: '/circuits', label: 'Circuits' },
  { to: '/standings', label: 'Standings' },
  { to: '/seasons', label: 'Seasons' },
];

export function Navbar() {
  const { session, isAdmin, signOut } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand" onClick={close}>🏎 onTRACK</Link>

        <div className="navbar-links">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={pathname === to ? 'active-link' : ''}
            >
              {label}
            </Link>
          ))}
          {isAdmin && <Link to="/admin" className="admin-link">Admin</Link>}
        </div>

        <div className="navbar-actions">
          {session
            ? <button className="sign-out" onClick={signOut}>Sign Out</button>
            : <Link to="/login">Login</Link>
          }
        </div>

        <button className="hamburger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>
      </nav>

      <div className={`mobile-menu${open ? ' open' : ''}`}>
        {navLinks.map(({ to, label }) => (
          <Link key={to} to={to} onClick={close}>{label}</Link>
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
